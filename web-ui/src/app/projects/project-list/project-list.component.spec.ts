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
import { getRandomProjects } from "@mlaide/mocks/fake-generator";
import { MockPipe } from "ng-mocks";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { loadProjects, openAddProjectDialog } from "@mlaide/state/project/project.actions";
import { Action } from "@ngrx/store";
import { MatCardHarness } from "@angular/material/card/testing";
import { MatProgressSpinnerHarness } from "@angular/material/progress-spinner/testing";
import { MatCardModule } from "@angular/material/card";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import {
  selectIsLoadingProjects,
  selectProjects
} from "@mlaide/state/project/project.selectors";
import { of } from "rxjs";

describe("ProjectListComponent", () => {
  let component: ProjectListComponent;
  let fixture: ComponentFixture<ProjectListComponent>;
  let loader: HarnessLoader;
  let fakeProjects;

  const routerSpy = jasmine.createSpyObj("Router", ["navigateByUrl"]);
  let store: MockStore;
  let dispatchSpy: jasmine.Spy<(action: Action) => void>;

  beforeEach(async () => {
    fakeProjects = await getRandomProjects(3);

    await TestBed.configureTestingModule({
      declarations: [ProjectListComponent, MockPipe(TimeAgoPipe, (v) => String(v))],
      providers: [
        { provide: Router, useValue: routerSpy },
        provideMockStore( )
      ],
      imports: [BrowserAnimationsModule, MatButtonModule, MatCardModule, MatDialogModule, MatProgressSpinnerModule, MatSnackBarModule, MatTableModule, MomentModule],
    }).compileComponents();

    store = TestBed.inject(MockStore);

    store.overrideSelector(selectProjects, fakeProjects);
    store.overrideSelector(selectIsLoadingProjects, true);

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
    it("should select projects from store correctly", async (done) => {
      // arrange + act in beforeEach

      // assert
      component.projects$.subscribe((projects) => {
        expect(projects).toBe(fakeProjects);
        done();
      });
    });

    it("should select isLoadingProjects from store correctly", async (done) => {
      // arrange + act in beforeEach

      // assert
      component.isLoading$.subscribe((isLoading) => {
        expect(isLoading).toBe(true);
        done();
      });
    });
    it("should dispatch loadProjects action", () => {
      // arrange + act in beforeEach

      // assert
      expect(dispatchSpy).toHaveBeenCalledWith(loadProjects());
    });
  });

  describe("openAddProjectDialog", () => {
    it("should dispatch openCreateProjectDialog action", async () => {
      // arrange in beforeEach

      // act
      component.openAddProjectDialog();

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
      spyOn(component, "openAddProjectDialog");
      // act
      await addProjectButton.click();

      // assert
      expect(component.openAddProjectDialog).toHaveBeenCalled();
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
      // arrange + act also in beforeEach

      // assert
      const table: MatTableHarness = await loader.getHarness(MatTableHarness);
      const rows: MatRowHarness[] = await table.getRows();
      expect(rows.length).toBe(fakeProjects.length);
      for (let index = 0; index < fakeProjects.length; index++) {
        const project = fakeProjects[index];

        const row: MatRowHarnessColumnsText = await rows[index].getCellTextByColumnName();

        expect(row.name).toEqual(project.name);
        expect(row.key).toEqual(project.key);
        expect(row.createdAt).toEqual(String(project.createdAt));
      }
    });

    it("should navigate to project experiment page on clicking the project button", async () => {
      // arrange + act also in beforeEach

      // act
      const projectButton = await loader.getHarness(MatButtonHarness.with({ text: fakeProjects[0].name }));
      await projectButton.click();

      // assert
      const spy = routerSpy.navigateByUrl as jasmine.Spy;
      expect(spy.calls.count()).toBe(1, "expected navigation router to be called once");
      expect(spy.calls.first().args[0]).toBe(`/projects/${fakeProjects[0].key}`);
    });
  });

  describe("progress spinner", () => {
    it("should contain progress spinner if isLoading$ is true", async () => {
      // arrange + act also in beforeEach
      let card: MatCardHarness[] = await loader.getAllHarnesses(MatCardHarness);
      let progressSpinner: MatProgressSpinnerHarness[] = await loader.getAllHarnesses(MatProgressSpinnerHarness);

      // assert
      expect(card.length).toBe(1);
      expect(progressSpinner.length).toBe(1);
    });

    it("should not contain progress spinner if isLoading$ is false", async () => {
      // arrange + act also in beforeEach
      component.isLoading$ = of(false);
      let card: MatCardHarness[] = await loader.getAllHarnesses(MatCardHarness);
      let progressSpinner: MatProgressSpinnerHarness[] = await loader.getAllHarnesses(MatProgressSpinnerHarness);

      // assert
      expect(card.length).toBe(0);
      expect(progressSpinner.length).toBe(0);
    });
  });
});
