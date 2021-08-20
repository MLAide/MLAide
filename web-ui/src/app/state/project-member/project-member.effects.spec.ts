import { Observable, of, throwError } from "rxjs";
import { Action } from "@ngrx/store";
import { ProjectMemberEffects } from "@mlaide/state/project-member/project-member.effects";
import { ProjectMemberApi, ProjectMemberListResponse } from "@mlaide/state/project-member/project-member.api";
import { MockStore, provideMockStore } from "@ngrx/store/testing";
import { Project } from "@mlaide/state/project/project.models";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { ComponentType } from "@angular/cdk/portal";
import { MatDialogConfig } from "@angular/material/dialog/dialog-config";
import { MatDialogRef } from "@angular/material/dialog/dialog-ref";
import Spy = jasmine.Spy;
import { AddOrEditProjectMemberComponent } from "@mlaide/project-settings/add-or-edit-project-member/add-or-edit-project-member.component";
import { TestBed } from "@angular/core/testing";
import { provideMockActions } from "@ngrx/effects/testing";
import {
  getRandomProject, getRandomProjectMember,
  getRandomProjectMembers,
  getRandomUser
} from "@mlaide/mocks/fake-generator";
import { showErrorMessage } from "@mlaide/state/shared/shared.actions";
import {
  addProjectMemberFailed, addProjectMemberSucceeded,
  closeAddOrEditProjectMemberDialog,
  currentProjectMemberChanged,
  deleteProjectMember, deleteProjectMemberFailed, deleteProjectMemberSucceeded,
  editProjectMember,
  editProjectMemberFailed,
  editProjectMemberSucceeded, loadProjectMembers,
  loadProjectMembersFailed,
  loadProjectMembersSucceeded,
  openAddProjectMemberDialog,
  openEditProjectMemberDialog
} from "@mlaide/state/project-member/project-member.actions";
import { Router } from "@angular/router";
import { isEmpty } from "rxjs/operators";
import { selectCurrentProjectKey } from "@mlaide/state/project/project.selectors";
import { selectCurrentUser } from "@mlaide/state/user/user.selectors";

describe("ProjectMemberEffects", () => {
  let actions$ = new Observable<Action>();
  let effects: ProjectMemberEffects;
  let projectMemberApiStub: jasmine.SpyObj<ProjectMemberApi>;
  let store: MockStore;
  let matDialog: MatDialog;
  let openDialogSpy: Spy<(component: ComponentType<AddOrEditProjectMemberComponent>, config?: MatDialogConfig) => MatDialogRef<AddOrEditProjectMemberComponent>>;
  let closeAllDialogSpy: Spy<() => void>;
  let router;

  beforeEach(() => {
    router = {
      navigate: jasmine.createSpy('navigate')
    };

    projectMemberApiStub = jasmine.createSpyObj<ProjectMemberApi>(
      "ProjectMemberApi",
      ["getProjectMembers", "patchProjectMembers", "deleteProjectMember"]);

    TestBed.configureTestingModule({
      imports: [
        MatDialogModule,
      ],
      providers: [
        ProjectMemberEffects,
        provideMockActions(() => actions$),
        provideMockStore(),
        { provide: ProjectMemberApi, useValue: projectMemberApiStub },
        { provide: Router, useValue: router }
      ],
    });

    store = TestBed.inject(MockStore);
    effects = TestBed.inject<ProjectMemberEffects>(ProjectMemberEffects);
    matDialog = TestBed.inject<MatDialog>(MatDialog);
    openDialogSpy = spyOn(matDialog, 'open');
    closeAllDialogSpy = spyOn(matDialog, 'closeAll');
  });

  describe("loadProjectMembers$", async () => {
    let actions = [
      {
        name: "loadProjectMembers",
        generate: async () => {
          return loadProjectMembers();
        }
      },
      {
        name: "addProjectMemberSucceeded",
        generate: async () => {
          return addProjectMemberSucceeded();
        }
      },
      {
        name: "editProjectMemberSucceeded",
        generate: async () => {
          return editProjectMemberSucceeded();
        }
      },
      {
        name: "deleteProjectMemberSucceeded",
        generate: async () => {
          const projectMember = await getRandomProjectMember();
          return deleteProjectMemberSucceeded({projectMember});
        }
      }
    ];

    actions.forEach((actionGenerator) => {
      it(`'${actionGenerator.name}' should map to 'loadProjectMembersSucceeded' action if api call is successful`, async (done) => {
        // arrange
        const generatedAction = await actionGenerator.generate()
        actions$ = of(generatedAction);
        const project = await getRandomProject();
        const user = await getRandomUser();
        store.overrideSelector(selectCurrentUser, user);
        store.overrideSelector(selectCurrentProjectKey, project.key);

        const projectMembers = await getRandomProjectMembers(3);
        const response: ProjectMemberListResponse = { items: projectMembers };
        projectMemberApiStub.getProjectMembers.and.returnValue(of(response));

        // act
        effects.loadProjectMembers$.subscribe(action => {
          // assert
          expect(action).toEqual(loadProjectMembersSucceeded({projectMembers}));
          expect(projectMemberApiStub.getProjectMembers).toHaveBeenCalled();

          done();
        });
      });

      it(`'${actionGenerator.name}' should map to 'loadProjectMembersFailed' action if api call is not successful`, async (done) => {
        // arrange
        const generatedAction = await actionGenerator.generate()
        actions$ = of(generatedAction);
        const project = await getRandomProject();
        const user = await getRandomUser();
        store.overrideSelector(selectCurrentUser, user);
        store.overrideSelector(selectCurrentProjectKey, project.key);
        projectMemberApiStub.getProjectMembers.and.returnValue(throwError("failed"));

        // act
        effects.loadProjectMembers$.subscribe(action => {
          // assert
          expect(action).toEqual(loadProjectMembersFailed({ payload: "failed" }));
          expect(projectMemberApiStub.getProjectMembers).toHaveBeenCalled();

          done();
        });
      });
    });

    it("should trigger nothing if action is deleteProjectMemberSucceeded and current user is provided project member", async (done) => {
      // arrange
      const projectMember = await getRandomProjectMember();
      const user = await getRandomUser();
      user.email = projectMember.email;
      store.overrideSelector(selectCurrentUser, user);
      actions$ = of(deleteProjectMemberSucceeded({ projectMember }));

      // act
      effects.loadProjectMembers$.subscribe(
        (action) => {
          fail(`loadProjectMembers$ should not trigger any output action but got ${action.type}.`);
        },
        () => {
          fail("loadProjectMembers$ should not raise an error.");
        },
        () => {
          expect().nothing();
          done();
        });
    });
  });

  describe("loadProjectMembersFailed$", () => {
    it("should map to 'showError' action", async (done) => {
      // arrange
      const error = "the error";
      actions$ = of(loadProjectMembersFailed({ payload: error }));

      // act
      effects.loadProjectMembersFailed$.subscribe(action => {
        // assert
        expect(action).toEqual(showErrorMessage({
          message: "Could not load project members. A unknown error occurred.",
          error: error
        }));

        done();
      });
    });
  });

  describe("currentProjectMember$", () => {
    it(`should trigger currentProjectMemberChanged action containing currentProjectMember if current user was found`, async (done) => {
      // arrange
      let projectMembers = await getRandomProjectMembers(3);
      actions$ = of(loadProjectMembersSucceeded({projectMembers}));
      const user = await getRandomUser();
      user.email = projectMembers[1].email;
      store.overrideSelector(selectCurrentUser, user);

      // act
      effects.currentProjectMember$.subscribe(action => {
        // assert
        expect(action).toEqual(currentProjectMemberChanged({ currentProjectMember: projectMembers[1] }));

        done();
      });
    });
  });

  describe("addProjectMemberFailed$", () => {
    it("should map to 'showError' action", async (done) => {
      // arrange
      const error = "the error";
      actions$ = of(addProjectMemberFailed({ payload: error }));

      // act
      effects.addProjectMemberFailed$.subscribe(action => {
        // assert
        expect(action).toEqual(showErrorMessage({
          message: "Could not add project member. A unknown error occurred.",
          error: error
        }));

        done();
      });
    });
  });

  describe("editProjectMember$", () => {
    let project: Project;

    beforeEach(async () => {
      project = await getRandomProject();

      store.overrideSelector(selectCurrentProjectKey, project.key);
    });

    it("should trigger editProjectMemberSucceeded if api call is successful", async (done) => {
      // arrange
      const projectMember = await getRandomProjectMember();
      actions$ = of(editProjectMember({projectMember}));
      projectMemberApiStub.patchProjectMembers.withArgs(project.key, projectMember).and.returnValue(of(void 0));

      // act
      effects.editProjectMember$.subscribe(action => {
        // assert
        expect(action).toEqual(editProjectMemberSucceeded());
        expect(projectMemberApiStub.patchProjectMembers).toHaveBeenCalledWith(project.key, projectMember);

        done();
      });
    });

    it("should trigger loadApiKeysFailed action if api call is not successful", async (done) => {
      // arrange
      const projectMember = await getRandomProjectMember();
      actions$ = of(editProjectMember({projectMember}));
      projectMemberApiStub.patchProjectMembers.withArgs(project.key, projectMember).and.returnValue(throwError("failed"));

      // act
      effects.editProjectMember$.subscribe(action => {
        // assert
        expect(action).toEqual(editProjectMemberFailed({ payload: "failed" }));
        expect(projectMemberApiStub.patchProjectMembers).toHaveBeenCalledWith(project.key, projectMember);

        done();
      });
    });
  });

  describe("editProjectMemberFailed$", () => {
    it("should map to 'showError' action", async (done) => {
      // arrange
      const error = "the error";
      actions$ = of(editProjectMemberFailed({ payload: error }));

      // act
      effects.editProjectMemberFailed$.subscribe(action => {
        // assert
        expect(action).toEqual(showErrorMessage({
          message: "Could not edit project member. A unknown error occurred.",
          error: error
        }));

        done();
      });
    });
  });

  describe("openAddProjectMemberDialog$", () => {
    it("should open MatDialog with CreateOrEditProjectMemberComponent", async (done) => {
      // arrange
      actions$ = of(openAddProjectMemberDialog());

      // act
      effects.openAddProjectMemberDialog$.subscribe(() => {
        // assert
        expect(openDialogSpy).toHaveBeenCalledWith(AddOrEditProjectMemberComponent, { minWidth: "20%",
          data: {
            title: `Add new member`,
            projectMember: null,
          }, });

        done();
      });
    });
  });

  describe("openEditProjectMemberDialog$", () => {
    it("should open MatDialog with CreateOrEditProjectMemberComponent", async (done) => {
      // arrange
      const projectMember = await getRandomProjectMember();
      actions$ = of(openEditProjectMemberDialog({projectMember}));

      // act
      effects.openEditProjectMemberDialog$.subscribe(() => {
        // assert
        expect(openDialogSpy).toHaveBeenCalledWith(AddOrEditProjectMemberComponent, { minWidth: "20%",
          data: {
            title: `Edit member: ${projectMember.nickName}`,
            projectMember: projectMember,
          }, });

        done();
      });
    });
  });

  describe("closeAddOrEditProjectMemberDialog$", () => {
    it("should close all open MatDialog instances", async (done) => {
      // arrange
      actions$ = of(closeAddOrEditProjectMemberDialog());

      // act
      effects.closeAddOrEditProjectMemberDialog$.subscribe(() => {
        // assert
        expect(closeAllDialogSpy).toHaveBeenCalled();

        done();
      });
    });
  });

  describe("deleteProjectMember$", () => {
    let project: Project;

    beforeEach(async () => {
      project = await getRandomProject();

      store.overrideSelector(selectCurrentProjectKey, project.key);
    });

    it("should trigger deleteProjectMemberSucceeded with provided project member if api call is successful", async (done) => {
      // arrange
      const projectMember = await getRandomProjectMember();
      actions$ = of(deleteProjectMember({projectMember}));
      projectMemberApiStub.deleteProjectMember.withArgs(project.key, projectMember.email).and.returnValue(of(void 0));

      // act
      effects.deleteProjectMember$.subscribe(action => {
        // assert
        expect(action).toEqual(deleteProjectMemberSucceeded({ projectMember }));
        expect(projectMemberApiStub.deleteProjectMember).toHaveBeenCalledWith(project.key, projectMember.email);

        done();
      });
    });

    it("should trigger loadApiKeysFailed action if api call is not successful", async (done) => {
      // arrange
      const projectMember = await getRandomProjectMember();
      actions$ = of(deleteProjectMember({projectMember}));
      projectMemberApiStub.deleteProjectMember.withArgs(project.key, projectMember.email).and.returnValue(throwError("failed"));

      // act
      effects.deleteProjectMember$.subscribe(action => {
        // assert
        expect(action).toEqual(deleteProjectMemberFailed({ payload: "failed" }));
        expect(projectMemberApiStub.deleteProjectMember).toHaveBeenCalledWith(project.key, projectMember.email);

        done();
      });
    });
  });

  describe("deleteProjectMemberFailed$", () => {
    it("should map to 'showError' action", async (done) => {
      // arrange
      const error = "the error";
      actions$ = of(deleteProjectMemberFailed({ payload: error }));

      // act
      effects.deleteProjectMemberFailed$.subscribe(action => {
        // assert
        expect(action).toEqual(showErrorMessage({
          message: "Could not delete project member. A unknown error occurred.",
          error: error
        }));

        done();
      });
    });
  });

  describe("goToProjectOverviewIfDeletedUserIsCurrentUser$", () => {
    it(`should navigate to projects if provided project member for deleteProjectMemberSucceeded action is current user`, async (done) => {
      // arrange
      let projectMember = await getRandomProjectMember();
      actions$ = of(deleteProjectMemberSucceeded({projectMember}));
      const user = await getRandomUser();
      user.email = projectMember.email;
      store.overrideSelector(selectCurrentUser, user);

      // act
      effects.goToProjectOverviewIfDeletedUserIsCurrentUser$.subscribe(() => {
        // assert
        expect(router.navigate).toHaveBeenCalledWith(["projects"]);

        done();
      });
    });

    it(`should not navigate to projects if provided project member for deleteProjectMemberSucceeded action is not current user`, async (done) => {
      // arrange
      let projectMember = await getRandomProjectMember();
      const user = await getRandomUser();
      user.email = "not-the-same-email-as-the-other@something.com";
      store.overrideSelector(selectCurrentUser, user);
      actions$ = of(deleteProjectMemberSucceeded({projectMember}));
      // act
      // we have to check that the effect does not emit a event - isEmpty() is a helper function for that
      // https://stackoverflow.com/questions/66332252/how-to-test-if-returned-observable-is-empty
      effects.goToProjectOverviewIfDeletedUserIsCurrentUser$.pipe(isEmpty()).subscribe(res => {
        // assert
        expect(res).toBeTrue();
        expect(router.navigate).not.toHaveBeenCalled();

        done();
      });
    });
  });
});
