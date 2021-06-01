import { HarnessLoader } from "@angular/cdk/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { ComponentFixture, ComponentFixtureAutoDetect, TestBed } from "@angular/core/testing";
import { MatButtonHarness } from "@angular/material/button/testing";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogModule } from "@angular/material/dialog";
import { MatTableModule } from "@angular/material/table";
import { MatHeaderRowHarness, MatRowHarness, MatRowHarnessColumnsText, MatTableHarness } from "@angular/material/table/testing";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { Router } from "@angular/router";
import "jasmine";
import { MomentModule, TimeAgoPipe } from "ngx-moment";
import { ProjectsApiService } from "../../../services";
import { ListDataSourceMock } from "../../../mocks/data-source.mock";
import { ProjectListComponent } from "./project-list.component";
import { Project, ProjectListResponse } from "../../../entities/project.model";
import { getRandomProjects } from "src/app/mocks/fake-generator";
import { MockPipe } from "ng-mocks";
import { MatSnackBarModule } from "@angular/material/snack-bar";

describe("ProjectListComponent", () => {
  let component: ProjectListComponent;
  let fixture: ComponentFixture<ProjectListComponent>;
  let loader: HarnessLoader;

  // fakes
  let fakeProjects: Project[];

  const routerSpy = jasmine.createSpyObj("Router", ["navigateByUrl"]);

  // service stubs
  let projectsApiServiceStub: jasmine.SpyObj<ProjectsApiService>;

  // data source mocks
  let projectListDataSourceMock: ListDataSourceMock<Project, ProjectListResponse> = new ListDataSourceMock();

  beforeEach(async () => {
    // stub services
    projectsApiServiceStub = jasmine.createSpyObj("projectApiService", ["getProjects"]);

    // setup project fakes
    fakeProjects = await getRandomProjects(3);

    // setup project api
    projectsApiServiceStub.getProjects.and.returnValue(projectListDataSourceMock);
    projectListDataSourceMock.emulate(fakeProjects);

    TestBed.configureTestingModule({
      declarations: [ProjectListComponent, MockPipe(TimeAgoPipe, (v) => String(v))],
      providers: [
        // For auto detecting changes, e.g. the title - https://angular.io/guide/testing-components-scenarios
        { provide: ComponentFixtureAutoDetect, useValue: true },
        { provide: ProjectsApiService, useValue: projectsApiServiceStub },
        { provide: Router, useValue: routerSpy },
      ],
      imports: [BrowserAnimationsModule, MatButtonModule, MatDialogModule, MatSnackBarModule, MatTableModule, MomentModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectListComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);

    fixture.detectChanges();
  });

  afterEach(() => {
    projectListDataSourceMock.emulate([]);
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("ngOnInit", () => {
    it("should set datasource to loaded projects", async () => {
      // arrange + act in beforeEach

      // assert
      expect(component.dataSource.data).toBe(fakeProjects);
    });
  });

  describe("component rendering", () => {
    it("should contain components title", async () => {
      // arrange + act also in beforeEach
      let h1: HTMLElement = fixture.nativeElement.querySelector("h1");

      // assert
      expect(h1.textContent).toEqual(component.title);
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

      it("should call openCreateProjectDialog on clicking the add project button", async () => {
        // arrange
        spyOn(component, "openCreateProjectDialog");

        const addProjectButton = await loader.getHarness(MatButtonHarness.with({ text: addProjectButtonTitle }));

        // act
        await addProjectButton.click();

        // assert
        fixture.whenStable().then(() => {
          expect(component.openCreateProjectDialog).toHaveBeenCalled();
        });
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
        // arrange + act also in beforeEach
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
        const table: MatTableHarness = await loader.getHarness(MatTableHarness);
        const rows: MatRowHarness[] = await table.getRows();

        // assert
        expect(rows.length).toBe(fakeProjects.length);
        fakeProjects.forEach(async (fakeProject, index) => {
          const row: MatRowHarnessColumnsText = await rows[index].getCellTextByColumnName();

          expect(row.name).toEqual(fakeProject.name);
          expect(row.key).toEqual(fakeProject.key);
          expect(row.createdAt).toEqual(String(fakeProject.createdAt));
        });
      });

      it("should navigate to project experiments page on clicking the project button", async () => {
        // arrange data for projects table
        const projects = [{ key: "my-project", name: "My Project", createdAt: new Date() }];
        projectListDataSourceMock.emulate(projects);
        fixture.detectChanges();

        // act: click on project button
        const projectButton = await loader.getHarness(MatButtonHarness.with({ text: projects[0].name }));
        await projectButton.click();
        const spy = routerSpy.navigateByUrl as jasmine.Spy;
        expect(spy.calls.count()).toBe(1, "expected navigation router to be called once");
        expect(spy.calls.first().args[0]).toBe("/projects/my-project");
      });
    });
  });
});
