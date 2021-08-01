import { HarnessLoader } from "@angular/cdk/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MatButtonHarness } from "@angular/material/button/testing";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogModule } from "@angular/material/dialog";
import { MatTableModule } from "@angular/material/table";
import { MatHeaderRowHarness, MatRowHarness, MatRowHarnessColumnsText, MatTableHarness } from "@angular/material/table/testing";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { Router } from "@angular/router";
import { MomentModule, TimeAgoPipe } from "ngx-moment";
import { ProjectListComponent } from "./project-list.component";
import { Project } from "../../../entities/project.model";
import { getRandomProjects } from "src/app/mocks/fake-generator";
import { MockPipe } from "ng-mocks";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { AppState } from "@mlaide/state/app.state";
import { loadProjects, openAddProjectDialog } from "@mlaide/state/project/project.actions";
import { Action } from "@ngrx/store";

describe("ProjectListComponent", () => {
  let component: ProjectListComponent;
  let fixture: ComponentFixture<ProjectListComponent>;
  let loader: HarnessLoader;

  const routerSpy = jasmine.createSpyObj("Router", ["navigateByUrl"]);
  let store: MockStore;
  let dispatchSpy: jasmine.Spy<(action: Action) => void>;

  beforeEach(async () => {
    const initialState = createAppState([]);

    await TestBed.configureTestingModule({
      declarations: [ProjectListComponent, MockPipe(TimeAgoPipe, (v) => String(v))],
      providers: [
        { provide: Router, useValue: routerSpy },
        provideMockStore({ initialState })
      ],
      imports: [BrowserAnimationsModule, MatButtonModule, MatDialogModule, MatSnackBarModule, MatTableModule, MomentModule],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    dispatchSpy = spyOn(store, 'dispatch');
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectListComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);

    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("ngOnInit", () => {
    it("should dispatch loadProjects action", () => {
      // ngOnInit will be called in beforeEach while creating the component

      // assert
      expect(dispatchSpy).toHaveBeenCalledWith(loadProjects());
    });
  });

  describe("openCreateProjectDialog", () => {
    it("should dispatch openCreateProjectDialog action", async () => {
      // arrange in beforeEach

      // act
      component.openCreateProjectDialog();

      // assert
      expect(dispatchSpy).toHaveBeenCalledWith(openAddProjectDialog());
    });
  });

  describe("component rendering", () => {
    it("should contain components title", async () => {
      // arrange
      const h1: HTMLElement = fixture.nativeElement.querySelector("h1");

      // assert
      expect(h1.textContent).toEqual("Projects Overview");
    });
  });

  describe("add projects", () => {
    const addProjectButtonTitle = "Add Project";
    it("should contain add project button", () => {
      // arrange
      let addProjectsButton: HTMLElement = fixture.nativeElement.querySelector("button");

      // assert
      expect(addProjectsButton.textContent).toBeTruthy();
      expect(addProjectsButton.textContent).toContain(addProjectButtonTitle);
    });

    it("should call openCreateProjectDialog when clicking the add project button", async () => {
      // arrange
      const addProjectButton = await loader.getHarness(MatButtonHarness.with({ text: addProjectButtonTitle }));
      spyOn(component, "openCreateProjectDialog");
      // act
      await addProjectButton.click();

      // assert
      expect(component.openCreateProjectDialog).toHaveBeenCalled();
    });
  });

  describe("projects table", () => {
    it("should contain the projects table", () => {
      // arrange
      let projectTable: HTMLElement = fixture.nativeElement.querySelector("table");

      // assert
      expect(projectTable.textContent).toBeTruthy();
    });

    it("should have defined headers", async () => {
      // arrange
      const table: MatTableHarness = await loader.getHarness(MatTableHarness);
      const headers: MatHeaderRowHarness[] = await table.getHeaderRows();
      const headerRow: MatRowHarnessColumnsText = await headers[0].getCellTextByColumnName();

      // assert
      expect(Object.keys(headerRow).length).toBe(3);
      expect(headerRow.name).toBe("Name");
      expect(headerRow.key).toBe("Key");
      expect(headerRow.createdAt).toBe("Created at");
    });

    it("should show row for each project", async () => {
      // arrange
      const projects = await getRandomProjects(3);
      store.setState(createAppState(projects));

      // act
      fixture.detectChanges();

      // assert
      const table: MatTableHarness = await loader.getHarness(MatTableHarness);
      const rows: MatRowHarness[] = await table.getRows();
      expect(rows.length).toBe(projects.length);
      for (let index = 0; index < projects.length; index++) {
        const project = projects[index];

        const row: MatRowHarnessColumnsText = await rows[index].getCellTextByColumnName();

        expect(row.name).toEqual(project.name);
        expect(row.key).toEqual(project.key);
        expect(row.createdAt).toEqual(String(project.createdAt));
      }
    });

    it("should navigate to project experiment page on clicking the project button", async () => {
      // arrange data for projects table
      const projects = [{ key: "my-project", name: "My Project", createdAt: new Date() }];
      store.setState(createAppState(projects));

      // act
      fixture.detectChanges();
      const projectButton = await loader.getHarness(MatButtonHarness.with({ text: projects[0].name }));
      await projectButton.click();

      // assert
      const spy = routerSpy.navigateByUrl as jasmine.Spy;
      expect(spy.calls.count()).toBe(1, "expected navigation router to be called once");
      expect(spy.calls.first().args[0]).toBe("/projects/my-project");
    });
  });

  function createAppState(projects: Project[], isLoading = false): Partial<AppState> {
    return {
      projects: {
        items: projects,
        isLoading: isLoading
      }
    };
  }
});
