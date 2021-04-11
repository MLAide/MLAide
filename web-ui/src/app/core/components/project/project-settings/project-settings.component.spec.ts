import { HarnessLoader } from "@angular/cdk/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MatButtonModule } from "@angular/material/button";
import { MatButtonHarness } from "@angular/material/button/testing";
import { MatDialogModule } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { MatTableModule } from "@angular/material/table";
import { MatHeaderRowHarness, MatRowHarness, MatRowHarnessColumnsText, MatTableHarness } from "@angular/material/table/testing";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { EMPTY, Observable, of, Subject, Subscription } from "rxjs";
import { Project } from "src/app/core/models/project.model";
import { ProjectMember, ProjectMemberListResponse } from "src/app/core/models/projectMember.model";
import { ProjectsApiService, SnackbarUiService, SpinnerUiService } from "src/app/core/services";
import { ListDataSourceMock } from "src/app/mocks/data-source.mock";
import { getRandomProject, getRandomProjectMembers } from "src/app/mocks/fake-generator";
import { ProjectMemberRoleI18nComponent } from "../shared/project-member-role-i18n/project-member-role-i18n.component";

import { ProjectSettingsComponent } from "./project-settings.component";

describe("ProjectSettingsComponent", () => {
  let component: ProjectSettingsComponent;
  let fixture: ComponentFixture<ProjectSettingsComponent>;

  // fakes
  let fakeProject: Project;
  let fakeProjectMembers: ProjectMember[];

  // route spy
  let unsubscriptionSpy: jasmine.Spy<() => void>;

  // service stubs
  let projectsApiServiceStub: jasmine.SpyObj<ProjectsApiService>;
  let spinnerUiServiceStub: jasmine.SpyObj<SpinnerUiService>;
  let snackBarUiServiceStub: jasmine.SpyObj<SnackbarUiService>;

  // data source mocks
  let projectMemberDataSourceMock: ListDataSourceMock<ProjectMember, ProjectMemberListResponse> = new ListDataSourceMock();

  beforeEach(async () => {
    // stub services
    projectsApiServiceStub = jasmine.createSpyObj("projectsApiService", [
      "deleteProjectMember",
      "getProject",
      "getProjectMembers",
    ]);
    snackBarUiServiceStub = jasmine.createSpyObj("snackBarUiService", ["showSuccesfulSnackbar", "showErrorSnackbar"]);
    spinnerUiServiceStub = jasmine.createSpyObj("spinnerUiService", ["showSpinner", "stopSpinner"]);

    // setup project fakes
    fakeProject = await getRandomProject();
    fakeProjectMembers = await getRandomProjectMembers();

    // mock active route params
    const paramMapObservable = new Observable<ParamMap>();
    const paramMapSubscription = new Subscription();
    unsubscriptionSpy = spyOn(paramMapSubscription, "unsubscribe").and.callThrough();
    spyOn(paramMapObservable, "subscribe").and.callFake(
      (fn): Subscription => {
        fn({ projectKey: fakeProject.key });
        return paramMapSubscription;
      }
    );

    // setup users api
    projectsApiServiceStub.getProject.and.returnValue(of(fakeProject));
    projectsApiServiceStub.getProjectMembers.withArgs(fakeProject.key).and.returnValue(projectMemberDataSourceMock);
    projectMemberDataSourceMock.emulate(fakeProjectMembers);

    await TestBed.configureTestingModule({
      declarations: [ProjectSettingsComponent, ProjectMemberRoleI18nComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { params: paramMapObservable } },
        { provide: ProjectsApiService, useValue: projectsApiServiceStub },
        { provide: SnackbarUiService, useValue: snackBarUiServiceStub },
        { provide: SpinnerUiService, useValue: spinnerUiServiceStub },
      ],
      imports: [BrowserAnimationsModule, MatButtonModule, MatDialogModule, MatIconModule, MatTableModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    projectMemberDataSourceMock.emulate([]);
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("ngOnInit", () => {
    it("should load project with projectKey defined in active route", async () => {
      // arrange + act in beforeEach

      // assert
      expect(component.project).toBe(fakeProject);
      expect(projectsApiServiceStub.getProject).toHaveBeenCalledWith(fakeProject.key);
    });

    it("should load projectMembers with projectKey defined in active route", async () => {
      // arrange + act in beforeEach

      // assert
      expect(component.dataSource.data).toBe(fakeProjectMembers);
      expect(projectsApiServiceStub.getProjectMembers).toHaveBeenCalledWith(fakeProject.key);
    });
  });

  describe("ngAfterViewInit", () => {
    it("should set datasource sort", () => {
      // arrange + act in beforeEach

      // assert
      expect(component.dataSource.sort).toEqual(component.sort);
    });
  });

  describe("removeProjectMember", () => {
    it("should call deleteProjectMember with project key and provided project member email", async () => {
      // arrange + act in beforeEach
      projectsApiServiceStub.deleteProjectMember.withArgs(fakeProject.key, fakeProjectMembers[0].email).and.returnValue(EMPTY);

      // act
      component.removeProjectMember(fakeProjectMembers[0]);

      // assert
      expect(projectsApiServiceStub.deleteProjectMember).toHaveBeenCalledWith(fakeProject.key, fakeProjectMembers[0].email);
    });

    it("should display snackbar with success message if project member was removed", async () => {
      // arrange + act in beforeEach
      const subject = new Subject<void>();
      projectsApiServiceStub.deleteProjectMember.and.returnValue(subject.asObservable());

      // act
      component.removeProjectMember(fakeProjectMembers[0]);
      subject.next();

      // assert
      expect(spinnerUiServiceStub.showSpinner).toHaveBeenCalled();
      expect(spinnerUiServiceStub.stopSpinner).toHaveBeenCalled();
      expect(snackBarUiServiceStub.showSuccesfulSnackbar).toHaveBeenCalledWith("Successfully updated project members!");
    });

    it("should display snackbar with error message if project member could not be removed", async () => {
      // arrange + act in beforeEach
      const subject = new Subject<void>();
      projectsApiServiceStub.deleteProjectMember.and.returnValue(subject.asObservable());

      // act
      component.removeProjectMember(fakeProjectMembers[0]);
      subject.error("This is a test error thrown in project-settings.component.spec.ts");

      // assert
      expect(spinnerUiServiceStub.showSpinner).toHaveBeenCalled();
      expect(spinnerUiServiceStub.stopSpinner).toHaveBeenCalled();
      expect(snackBarUiServiceStub.showErrorSnackbar).toHaveBeenCalledWith("Error while updating project members.");
    });
  });

  describe("component rendering", () => {
    let loader: HarnessLoader;

    beforeEach(() => {
      loader = TestbedHarnessEnvironment.loader(fixture);
    });

    it("should contain components title", async () => {
      // arrange + act also in beforeEach
      let h1: HTMLElement = fixture.nativeElement.querySelector("h1");

      // assert
      expect(h1.textContent).toEqual("Project Members");
    });

    describe("add project member", () => {
      const addProjectMemberButtonTitle = "Add Project Member";

      it("should contain add project member button", () => {
        // arrange + act also in beforeEach
        let addProjectMemberButton: HTMLElement = fixture.nativeElement.querySelector("button");

        // assert
        expect(addProjectMemberButton).toBeTruthy();
        expect(addProjectMemberButton.textContent).toContain(addProjectMemberButtonTitle);
      });

      it("should call openAddProjectMemberDialog on clicking the add project member button", async () => {
        // arrange + act also in beforeEach
        spyOn(component, "openAddProjectMemberDialog");
        const addProjectButton = await loader.getHarness(MatButtonHarness.with({ text: addProjectMemberButtonTitle }));

        // act
        await addProjectButton.click();

        // assert
        fixture.whenStable().then(() => {
          expect(component.openAddProjectMemberDialog).toHaveBeenCalled();
        });
      });
    });

    describe("project members table", () => {
      it("should contain the project member table", () => {
        // arrange + act also in beforeEach
        let apiKeysTable: HTMLElement = fixture.nativeElement.querySelector("table");

        // assert
        expect(apiKeysTable.textContent).toBeTruthy();
      });

      it("should have defined headers", async () => {
        // arrange + act also in beforeEach
        const table: MatTableHarness = await loader.getHarness(MatTableHarness);
        const headers: MatHeaderRowHarness[] = await table.getHeaderRows();
        const headerRow: MatRowHarnessColumnsText = await headers[0].getCellTextByColumnName();

        // assert
        expect(Object.keys(headerRow).length).toBe(4);
        expect(headerRow.nickName).toBe("Nickname");
        expect(headerRow.email).toBe("Email");
        expect(headerRow.role).toBe("Role");
        expect(headerRow.actions).toBe("Actions");
      });

      it("should show row for each project member", async () => {
        // arrange + act also in beforeEach
        const table: MatTableHarness = await loader.getHarness(MatTableHarness);
        const rows: MatRowHarness[] = await table.getRows();
        const editButtons: MatButtonHarness[] = await loader.getAllHarnesses(MatButtonHarness.with({ text: "edit" }));
        const deleteButtons: MatButtonHarness[] = await loader.getAllHarnesses(MatButtonHarness.with({ text: "delete" }));

        // assert
        expect(rows.length).toBe(fakeProjectMembers.length);
        expect(editButtons.length).toBe(fakeProjectMembers.length);
        expect(deleteButtons.length).toBe(fakeProjectMembers.length);
        fakeProjectMembers.forEach(async (fakeProjectMember, index) => {
          const row: MatRowHarnessColumnsText = await rows[index].getCellTextByColumnName();
          expect(row.nickName).toEqual(fakeProjectMember.nickName);
          expect(row.email).toEqual(String(fakeProjectMember.email));
          expect(row.role.toUpperCase().replace(" ", "_")).toEqual(String(fakeProjectMember.role));
          expect(row.actions).toBe("editdelete");
        });
      });

      it("should call deleteApiKey on clicking delete button in row", async () => {
        // arrange + act also in beforeEach
        projectsApiServiceStub.deleteProjectMember
          .withArgs(fakeProject.key, fakeProjectMembers[fakeProjectMembers.length - 1].email)
          .and.returnValue(of());
        const deleteButtons: MatButtonHarness[] = await loader.getAllHarnesses(MatButtonHarness.with({ text: "delete" }));

        // act
        await deleteButtons[deleteButtons.length - 1].click();

        // assert
        fixture.whenStable().then(() => {
          expect(projectsApiServiceStub.deleteProjectMember).toHaveBeenCalledWith(
            fakeProject.key,
            fakeProjectMembers[fakeProjectMembers.length - 1].email
          );
        });
      });

      it("should call removeProjectMember on clicking edit button in row", async () => {
        // arrange + act also in beforeEach
        spyOn(component, "openEditProjectMemberDialog");
        const editButtons: MatButtonHarness[] = await loader.getAllHarnesses(MatButtonHarness.with({ text: "edit" }));

        // act
        await editButtons[editButtons.length - 1].click();

        // assert
        fixture.whenStable().then(() => {
          expect(component.openEditProjectMemberDialog).toHaveBeenCalledWith(fakeProjectMembers[fakeProjectMembers.length - 1]);
        });
      });

      it("should call removeProjectMember on clicking delete button in row", async () => {
        // arrange + act also in beforeEach
        spyOn(component, "removeProjectMember");
        const deleteButtons: MatButtonHarness[] = await loader.getAllHarnesses(MatButtonHarness.with({ text: "delete" }));

        // act
        await deleteButtons[deleteButtons.length - 1].click();

        // assert
        fixture.whenStable().then(() => {
          expect(component.removeProjectMember).toHaveBeenCalledWith(fakeProjectMembers[fakeProjectMembers.length - 1]);
        });
      });
    });
  });

  describe("ngOnDestroy", () => {
    it("should unsubscribe from routeParamsSubscription", async () => {
      // arrange in beforeEach

      // act
      component.ngOnDestroy();

      // assert
      expect(unsubscriptionSpy).toHaveBeenCalled();
    });
  });
});
