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
import { of } from "rxjs";
import { Project } from "@mlaide/entities/project.model";
import { ProjectMember, ProjectMemberRole } from "@mlaide/entities/projectMember.model";
import { getRandomProject, getRandomProjectMember, getRandomProjectMembers } from "src/app/mocks/fake-generator";
import { ProjectMemberRoleI18nComponent } from "src/app/shared/components/project-member-role-i18n/project-member-role-i18n.component";
import { ProjectMembersListComponent } from "./project-members-list.component";
import { MockStore, provideMockStore } from "@ngrx/store/testing";
import { Action } from "@ngrx/store";
import {
  selectCurrentProjectMember,
  selectIsLoadingProjectMembers,
  selectProjectMembers
} from "@mlaide/state/project-member/project-member.selectors";
import { selectCurrentProjectKey } from "@mlaide/state/project/project.selectors";
import { MatCardModule } from "@angular/material/card";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import {
  addProjectMember,
  deleteProjectMember,
  loadProjectMembers, openAddProjectMemberDialog, openEditProjectMemberDialog
} from "@mlaide/state/project-member/project-member.actions";
import { MatCardHarness } from "@angular/material/card/testing";
import { MatProgressSpinnerHarness } from "@angular/material/progress-spinner/testing";

describe("ProjectMembersListComponent", () => {
  let component: ProjectMembersListComponent;
  let fixture: ComponentFixture<ProjectMembersListComponent>;

  // fakes
  let fakeProject: Project;
  let fakeProjectMembers: ProjectMember[];
  let fakeProjectMemberForCurrentUser: ProjectMember;

  // mocks
  let store: MockStore;
  let dispatchSpy: jasmine.Spy<(action: Action) => void>;

  beforeEach(async () => {
    // setup project fakes
    fakeProject = await getRandomProject();
    fakeProjectMembers = await getRandomProjectMembers();
    fakeProjectMemberForCurrentUser = await getRandomProjectMember();

    await TestBed.configureTestingModule({
      declarations: [ProjectMembersListComponent, ProjectMemberRoleI18nComponent],
      providers: [
        provideMockStore(),
      ],
      imports: [
        BrowserAnimationsModule,
        MatButtonModule,
        MatCardModule,
        MatDialogModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatTableModule
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);

    store.overrideSelector(selectProjectMembers, fakeProjectMembers);
    store.overrideSelector(selectCurrentProjectKey, fakeProject.key);
    store.overrideSelector(selectIsLoadingProjectMembers, true);
    store.overrideSelector(selectCurrentProjectMember, fakeProjectMemberForCurrentUser);

    dispatchSpy = spyOn(store, 'dispatch');
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectMembersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    // arrange + act

    // assert
    expect(component).toBeTruthy();
  });

  describe("ngOnInit", () => {
    describe("projectMemberForCurrentUser.role does not matter", () => {
      it("should select project members from store correctly", async (done) => {
        // arrange + act in beforeEach

        // assert
        component.projectMembers$.subscribe((projectMembers) => {
          expect(projectMembers).toBe(fakeProjectMembers);
          done();
        });
      });

      it("should select project key from store correctly", async (done) => {
        // arrange + act in beforeEach

        // assert
        component.projectKey$.subscribe((projectKey) => {
          expect(projectKey).toBe(fakeProject.key);
          done();
        });
      });

      it("should select isLoading from store correctly", async (done) => {
        // arrange + act in beforeEach

        // assert
        component.isLoading$.subscribe((isLoading) => {
          expect(isLoading).toBe(true);
          done();
        });
      });

      it("should select current project member from store correctly", async (done) => {
        // arrange + act in beforeEach

        // assert
        component.currentProjectMember$.subscribe((currentProjectMember) => {
          expect(currentProjectMember).toBe(fakeProjectMemberForCurrentUser);
          done();
        });
      });

      it("should dispatch loadProjectMembers action", () => {
        // ngOnInit will be called in beforeEach while creating the component

        // assert
        expect(dispatchSpy).toHaveBeenCalledWith(loadProjectMembers());
      });
    });

    describe("projectMemberForCurrentUser.role is OWNER",  () => {
      it("should set correct table columns", async (done) => {
        // arrange + act in beforeEach
        fakeProjectMemberForCurrentUser.role = ProjectMemberRole.OWNER;
        // TODO Raman: Können wir das so lassen oder ist das zu unsauber?
        fixture = TestBed.createComponent(ProjectMembersListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        // assert
        component.displayedColumns$.subscribe((displayedColumns) => {
          expect(displayedColumns).toEqual(["nickName", "email", "role", "actions"]);
          done();
        });
      });
    });


    describe("projectMemberForCurrentUser.role is not OWNER", () => {
      it("should set correct table columns", async (done) => {
        // arrange + act in beforeEach
        fakeProjectMemberForCurrentUser.role = ProjectMemberRole.CONTRIBUTOR;
        // TODO Raman: Können wir das so lassen oder ist das zu unsauber?
        fixture = TestBed.createComponent(ProjectMembersListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        // assert
        component.displayedColumns$.subscribe((displayedColumns) => {
          expect(displayedColumns).toEqual(["nickName", "email", "role"]);
          done();
        });
      });
    });
  });

  describe("addProjectMember", () => {
    it("should dispatch openAddProjectMemberDialog action ", async () => {
      // arrange in beforeEach

      // act
      component.addProjectMember();

      // assert
      expect(dispatchSpy).toHaveBeenCalledWith(openAddProjectMemberDialog());
    });
  });

  describe("editProjectMember", () => {
    it("should dispatch openEditProjectMemberDialog action with provided project member", async () => {
      // arrange in beforeEach

      // act
      component.editProjectMember(fakeProjectMembers[0]);

      // assert
      expect(dispatchSpy).toHaveBeenCalledWith(openEditProjectMemberDialog({
        projectMember: fakeProjectMembers[0]
      }));
    });
  });

  describe("deleteProjectMember", () => {
    it("should dispatch deleteProjectMember action with provided project member", async () => {
      // arrange in beforeEach

      // act
      component.deleteProjectMember(fakeProjectMembers[0]);

      // assert
      expect(dispatchSpy).toHaveBeenCalledWith(deleteProjectMember({
        projectMember: fakeProjectMembers[0]
      }));
    });
  });

  describe("component rendering", () => {
    let loader: HarnessLoader;

    describe("projectMemberForCurrentUser.role does not matter", () => {
      beforeEach(() => {
        loader = TestbedHarnessEnvironment.loader(fixture);
      });

      it("should contain components title", async () => {
        // arrange + act also in beforeEach
        let h1: HTMLElement = fixture.nativeElement.querySelector("h1");

        // assert
        expect(h1.textContent).toEqual("Project Members");
      });

      describe("progress spinner", () => {
        it("should contain progress spinner if isLoading$ is true", async () => {
          // arrange + act also in beforeEach
          component.isLoading$ = of(true);
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

    describe("projectMemberForCurrentUser.role is OWNER", () => {
      beforeEach(() => {
        fakeProjectMemberForCurrentUser.role = ProjectMemberRole.OWNER;
        fixture = TestBed.createComponent(ProjectMembersListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        loader = TestbedHarnessEnvironment.loader(fixture);
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
          spyOn(component, "addProjectMember");
          const addProjectButton = await loader.getHarness(MatButtonHarness.with({ text: addProjectMemberButtonTitle }));

          // act
          await addProjectButton.click();

          // assert
          fixture.whenStable().then(() => {
            expect(component.addProjectMember).toHaveBeenCalled();
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

        it("should call deleteProjectMember on clicking delete button in row", async () => {
          // arrange + act also in beforeEach
          spyOn(component, "deleteProjectMember");
          const deleteButtons: MatButtonHarness[] = await loader.getAllHarnesses(MatButtonHarness.with({ text: "delete" }));

          // act
          await deleteButtons[deleteButtons.length - 1].click();

          // assert
          fixture.whenStable().then(() => {
            expect(component.deleteProjectMember).toHaveBeenCalledWith(
              fakeProjectMembers[fakeProjectMembers.length - 1]
            );
          });
        });

        it("should call editProjectMember on clicking edit button in row", async () => {
          // arrange + act also in beforeEach
          spyOn(component, "editProjectMember");
          const editButtons: MatButtonHarness[] = await loader.getAllHarnesses(MatButtonHarness.with({ text: "edit" }));

          // act
          await editButtons[editButtons.length - 1].click();

          // assert
          fixture.whenStable().then(() => {
            expect(component.editProjectMember).toHaveBeenCalledWith(fakeProjectMembers[fakeProjectMembers.length - 1]);
          });
        });
      });
    });

    describe("projectMemberForCurrentUser.role is not OWNER", () => {
      beforeEach(() => {
        fakeProjectMemberForCurrentUser.role = ProjectMemberRole.CONTRIBUTOR;
        fixture = TestBed.createComponent(ProjectMembersListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        loader = TestbedHarnessEnvironment.loader(fixture);
      });

      describe("add project member", () => {
        const addProjectMemberButtonTitle = "Add Project Member";

        it("should not contain add project member button", () => {
          // arrange + act also in beforeEach
          let addProjectMemberButton: HTMLElement = fixture.nativeElement.querySelector("button");

          // assert
          expect(addProjectMemberButton).toBe(null);
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
          expect(Object.keys(headerRow).length).toBe(3);
          expect(headerRow.nickName).toBe("Nickname");
          expect(headerRow.email).toBe("Email");
          expect(headerRow.role).toBe("Role");
        });

        it("should show row for each project member", async () => {
          // arrange + act also in beforeEach
          const table: MatTableHarness = await loader.getHarness(MatTableHarness);
          const rows: MatRowHarness[] = await table.getRows();

          // assert
          expect(rows.length).toBe(fakeProjectMembers.length);
          fakeProjectMembers.forEach(async (fakeProjectMember, index) => {
            const row: MatRowHarnessColumnsText = await rows[index].getCellTextByColumnName();
            expect(row.nickName).toEqual(fakeProjectMember.nickName);
            expect(row.email).toEqual(String(fakeProjectMember.email));
            expect(row.role.toUpperCase().replace(" ", "_")).toEqual(String(fakeProjectMember.role));
          });
        });

        it("should not have delete button in row", async () => {
          // arrange + act also in beforeEach
          const deleteButtons: MatButtonHarness[] = await loader.getAllHarnesses(MatButtonHarness.with({ text: "delete" }));

          // assert
          expect(deleteButtons).toEqual([]);
        });

        it("should not have edit button in row", async () => {
          // arrange + act also in beforeEach
          const editButtons: MatButtonHarness[] = await loader.getAllHarnesses(MatButtonHarness.with({ text: "edit" }));

          // assert
          expect(editButtons).toEqual([]);
        });
      });
    });
  });
});
