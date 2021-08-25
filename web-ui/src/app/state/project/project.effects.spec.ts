import { HttpErrorResponse } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { AddProjectComponent } from "@mlaide/projects/add-project/add-project.component";
import { getRandomProject, getRandomProjects } from "@mlaide/mocks/fake-generator";
import { getEffectsMetadata } from "@ngrx/effects";
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from "@ngrx/store";
import { Observable, of, throwError } from "rxjs";
import { hideSpinner, showErrorMessage, showSpinner } from "@mlaide/state/shared/shared.actions";
import {
  addProject,
  addProjectFailed,
  addProjectSucceeded,
  closeAddProjectDialog, loadProject, loadProjectFailed,
  loadProjects,
  loadProjectsFailed,
  loadProjectsSucceeded,
  loadProjectSucceeded,
  openAddProjectDialog
} from "./project.actions";
import { ProjectApi, ProjectListResponse } from "./project.api";
import { ProjectEffects } from "./project.effects";
import { MockStore, provideMockStore } from "@ngrx/store/testing";
import { selectCurrentProjectKey } from "@mlaide/state/project/project.selectors";
import { Project } from "@mlaide/state/project/project.models";
import { currentUserChanged } from "@mlaide/state/user/user.actions";

describe("project effects", () => {
  let actions$ = new Observable<Action>();
  let effects: ProjectEffects;
  let projectsApiStub: jasmine.SpyObj<ProjectApi>;
  let matDialog: MatDialog;
  let store: MockStore;

  beforeEach(() => {
    projectsApiStub = jasmine.createSpyObj<ProjectApi>("ProjectApi", ["addProject", "getProject", "getProjects"]);

    TestBed.configureTestingModule({
      imports: [
        MatDialogModule
      ],
      providers: [
        ProjectEffects,
        provideMockActions(() => actions$),
        provideMockStore(),
        { provide: ProjectApi, useValue: projectsApiStub }
      ],
    });

    store = TestBed.inject(MockStore);
    effects = TestBed.inject<ProjectEffects>(ProjectEffects);
    matDialog = TestBed.inject<MatDialog>(MatDialog);
  });

  describe("loadProject$", () => {
    let fakeProject: Project;

    beforeEach(async () => {
      fakeProject = await getRandomProject();
      store.overrideSelector(selectCurrentProjectKey, fakeProject.key);
    });

    it("should trigger loadProjectSucceeded containing project if api call is successful", async (done) => {
      // arrange also in beforeEach
      actions$ = of(loadProject());
      projectsApiStub.getProject.withArgs(fakeProject.key).and.returnValue(of(fakeProject));

      // act
      effects.loadProject$.subscribe(action => {
        // assert
        expect(action).toEqual(loadProjectSucceeded({project: fakeProject}));
        expect(projectsApiStub.getProject).toHaveBeenCalledWith(fakeProject.key);

        done();
      });
    });

    it("should trigger loadProjectFailed action if api call is not successful", async (done) => {
      // arrange
      actions$ = of(loadProject());
      projectsApiStub.getProject.withArgs(fakeProject.key).and.returnValue(throwError("failed"));

      // act
      effects.loadProject$.subscribe(action => {
        // assert
        expect(action).toEqual(loadProjectFailed({ payload: "failed" }));
        expect(projectsApiStub.getProject).toHaveBeenCalledWith(fakeProject.key);

        done();
      });
    });
  });

  describe("loadProjects$", () => {

    describe("should trigger loadProjectsSucceeded action if api call is successful", () => {
      [loadProjects(), addProjectSucceeded(null)].forEach(inputAction => {
        it(`on '${inputAction.type}' action`, async (done) => {
          // arrange
          actions$ = of(inputAction);
          const projects = await getRandomProjects(3);
          const response: ProjectListResponse = { items: projects };
          projectsApiStub.getProjects.and.returnValue(of(response));

          // act
          effects.loadProjects$.subscribe(action => {
            // assert
            expect(action).toEqual(loadProjectsSucceeded({projects: projects}));
            expect(projectsApiStub.getProjects).toHaveBeenCalled();

            done();
          });
        });
      });
    });

    describe("should trigger loadProjectsFailed action if api call is not successful", () => {
      [loadProjects(), addProjectSucceeded(null)].forEach(inputAction => {
        it(`on '${inputAction.type}' action`, async (done) => {
          // arrange
          actions$ = of(inputAction);
          projectsApiStub.getProjects.and.returnValue(throwError("failed"));

          // act
          effects.loadProjects$.subscribe(action => {
            // assert
            expect(action).toEqual(loadProjectsFailed({ payload: "failed" }));
            expect(projectsApiStub.getProjects).toHaveBeenCalled();

            done();
          });
        });
      });
    });
  });

  describe("addProject$", () => {

    describe("should add project via API and trigger addProjectSucceeded action if api call is successful", () => {
      it(`on '${addProject.type}' action`, async (done) => {
        // arrange
        const project = await getRandomProject();
        const createdProject = await getRandomProject();
        projectsApiStub.addProject.withArgs(project).and.returnValue(of(createdProject));
        actions$ = of(addProject({project}));

        // act
        effects.addProject$.subscribe(action => {
          // assert
          expect(action).toEqual(addProjectSucceeded({ project: createdProject }));
          expect(projectsApiStub.addProject).toHaveBeenCalledOnceWith(project);

          done();
        });
      });
    });

    describe("should try add project via API and trigger addProjectFailed action if api call is not successful", () => {
      it(`on '${addProject.type}' action`, async (done) => {
        // arrange
        const project = await getRandomProject();
        projectsApiStub.addProject.withArgs(project).and.returnValue(throwError("failed"));
        actions$ = of(addProject({project}));

        // act
        effects.addProject$.subscribe(action => {
          // assert
          expect(action).toEqual(addProjectFailed({ payload: "failed" }));
          expect(projectsApiStub.addProject).toHaveBeenCalledOnceWith(project);

          done();
        });
      });
    });

  });

  describe("openCreateDialog$", () => {

    describe("should open the CreateProjectComponent in a MatDialog", () => {
      it(`on '${openAddProjectDialog.type}' action`, async (done) => {
        // arrange
        const dialogOpenSpy = spyOn(matDialog, "open");
        actions$ = of(openAddProjectDialog());

        // assert
        expect(getEffectsMetadata(effects).openCreateDialog$.dispatch).toBeFalse();
        effects.openCreateDialog$.subscribe(() => {
          expect(dialogOpenSpy).toHaveBeenCalledOnceWith(
            AddProjectComponent,
            {
              data: {
                key: "",
                name: "",
              },
            }
          );

          done();
        });
      });
    });

  });

  describe("closeCreateDialog$", () => {

    describe("should close all MatDialogs", () => {
      [closeAddProjectDialog(), addProjectSucceeded(null)].forEach(inputAction => {
        it(`on '${inputAction.type}' action`, async (done) => {
          // arrange
          const dialogOpenSpy = spyOn(matDialog, "closeAll");
          actions$ = of(inputAction);

          // assert
          expect(getEffectsMetadata(effects).closeCreateDialog$.dispatch).toBeFalse();
          effects.closeCreateDialog$.subscribe(() => {
            expect(dialogOpenSpy).toHaveBeenCalled();

            done();
          });
        });
      });
    });

  });

  describe("showSpinner$", async () => {
    let actions = [
      {
        name: "addProject",
        generate: async () => {
          const project = await getRandomProject();
          return addProject({project});
        }
      },
    ];

    actions.forEach((actionGenerator) => {
      it(`'${actionGenerator.name}' should map to showSpinner action`, async (done) => {
        // arrange
        const generatedAction = await actionGenerator.generate()
        actions$ = of(generatedAction);

        // act
        effects.showSpinner$.subscribe(action => {
          // assert
          expect(action).toEqual(showSpinner());

          done();
        });
      });
    })
  });

  describe("hideSpinner$", async () => {
    let actions = [
      {
        name: "addProjectSucceeded",
        generate: async () => {
          const project = await getRandomProject();
          return addProjectSucceeded({project});
        }
      },
      {
        name: "addProjectFailed",
        generate: async () => {
          return addProjectFailed({payload: "failed"});
        }
      },
    ];

    actions.forEach((actionGenerator) => {
      it(`'${actionGenerator.name}' should map to hideSpinner action`, async (done) => {
        // arrange
        const generatedAction = await actionGenerator.generate()
        actions$ = of(generatedAction);

        // act
        effects.hideSpinner$.subscribe(action => {
          // assert
          expect(action).toEqual(hideSpinner());

          done();
        });
      });
    })
  });

  describe("failed actions", () => {

    describe("should emit showError action with correct message", () => {
      const errors = [
        {
          karmaTitle: "Status Code 400",
          expectedMessage: "The project could not be created, because of invalid input data. Please try again with valid input data.",
          inputAction: addProjectFailed({ payload: new HttpErrorResponse({ status: 400 }) }),
          effect: (effects) => effects.addProjectFailed$
        },
        {
          karmaTitle: "Status Code 409",
          expectedMessage: "A project with this key already exists. Please choose a different project key.",
          inputAction: addProjectFailed({ payload: new HttpErrorResponse({ status: 409 }) }),
          effect: (effects) => effects.addProjectFailed$
        },
        {
          karmaTitle: "Status Code 500",
          expectedMessage: "Could not create project. A unknown error occurred.",
          inputAction: addProjectFailed({ payload: new HttpErrorResponse({ status: 500 }) }),
          effect: (effects) => effects.addProjectFailed$
        },
        {
          karmaTitle: "Any other error that is not of type HttpErrorResponse",
          expectedMessage: "Could not create project. A unknown error occurred.",
          inputAction: addProjectFailed({ payload: "Some other error" }),
          effect: (effects) => effects.addProjectFailed$
        },
        {
          karmaTitle: "Any other error that is not of type HttpErrorResponse",
          expectedMessage: "Could not load projects. A unknown error occurred.",
          inputAction: loadProjectsFailed({ payload: "Some other error" }),
          effect: (effects) => effects.loadProjectsFailed$
        },
        {
          karmaTitle: "Any other error that is not of type HttpErrorResponse",
          expectedMessage: "Could not load project. A unknown error occurred.",
          inputAction: loadProjectsFailed({ payload: "Some other error" }),
          effect: (effects) => effects.loadProjectFailed$
        }
      ];

      errors.forEach(error => {
        describe(error.karmaTitle, () => {
          it(`on '${error.inputAction.type}' action`, async (done) => {
            // arrange
            actions$ = of(error.inputAction);

            // assert
            error.effect(effects).subscribe((action) => {
              expect(action).toEqual(showErrorMessage({ error: error.inputAction.payload, message: error.expectedMessage }));

              done();
            });
          });
        });
      });
    });

  });

  describe("loadProjectsOnLoggedInUserChanged$", async () => {
    it("currentUserChanged should map to loadProjects action", async (done) => {
      // arrange
      actions$ = of(currentUserChanged({ currentUser: null }));

      // act
      effects.loadProjectsOnLoggedInUserChanged$.subscribe(action => {
        // assert
        expect(action).toEqual(loadProjects());

        done();
      });
  });
  });
});
