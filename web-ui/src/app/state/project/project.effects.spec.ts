import { HttpErrorResponse } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { CreateProjectComponent } from "@mlaide/core/components/create-project/create-project.component";
import { getRandomProject, getRandomProjects } from "@mlaide/mocks/fake-generator";
import { getEffectsMetadata } from "@ngrx/effects";
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from "@ngrx/store";
import { Observable, of, throwError } from "rxjs";
import { hideSpinner, showError, showSpinner } from "../shared/shared.actions";
import { addProject, addProjectFailed, addProjectSucceeded, closeCreateProjectDialog, loadProjects, loadProjectsFailed, loadProjectsSucceeded, openCreateProjectDialog } from "./project.actions";
import { ProjectApi, ProjectListResponse } from "./project.api";
import { ProjectEffects } from "./project.effects";

describe("project effects", () => {
  let actions$ = new Observable<Action>();
  let effects: ProjectEffects;
  let projectsApiServiceStub: jasmine.SpyObj<ProjectApi>;
  let matDialog: MatDialog;

  beforeEach(() => {
    projectsApiServiceStub = jasmine.createSpyObj<ProjectApi>("ProjectApi", ["getProjects", "addProject"]);

    TestBed.configureTestingModule({
      imports: [
        MatDialogModule
      ],
      providers: [
        ProjectEffects,
        provideMockActions(() => actions$),
        { provide: ProjectApi, useValue: projectsApiServiceStub }
      ],
    });

    effects = TestBed.inject<ProjectEffects>(ProjectEffects);
    matDialog = TestBed.inject<MatDialog>(MatDialog);
  });

  describe("loadProjects$", () => {

    describe("should trigger loadProjectsSucceeded action if api call is successful", () => {
      [loadProjects(), addProjectSucceeded(null)].forEach(inputAction => {
        it(`on '${inputAction.type}' action`, async (done) => {
          // arrange
          actions$ = of(inputAction);
          const projects = await getRandomProjects(3);
          const response: ProjectListResponse = { items: projects };
          projectsApiServiceStub.getProjects.and.returnValue(of(response));

          // act
          effects.loadProjects$.subscribe(action => {
            // assert
            expect(action).toEqual(loadProjectsSucceeded({projects: projects}));
            expect(projectsApiServiceStub.getProjects).toHaveBeenCalled();

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
          projectsApiServiceStub.getProjects.and.returnValue(throwError("failed"));

          // act
          effects.loadProjects$.subscribe(action => {
            // assert
            expect(action).toEqual(loadProjectsFailed({ payload: "failed" }));
            expect(projectsApiServiceStub.getProjects).toHaveBeenCalled();

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
        projectsApiServiceStub.addProject.withArgs(project).and.returnValue(of(createdProject));
        actions$ = of(addProject({project}));

        // act
        effects.addProject$.subscribe(action => {
          // assert
          expect(action).toEqual(addProjectSucceeded({ project: createdProject }));
          expect(projectsApiServiceStub.addProject).toHaveBeenCalledOnceWith(project);

          done();
        });
      });
    });

    describe("should try add project via API and trigger addProjectFailed action if api call is not successful", () => {
      it(`on '${addProject.type}' action`, async (done) => {
        // arrange
        const project = await getRandomProject();
        projectsApiServiceStub.addProject.withArgs(project).and.returnValue(throwError("failed"));
        actions$ = of(addProject({project}));

        // act
        effects.addProject$.subscribe(action => {
          // assert
          expect(action).toEqual(addProjectFailed({ payload: "failed" }));
          expect(projectsApiServiceStub.addProject).toHaveBeenCalledOnceWith(project);

          done();
        });
      });
    });

  });

  describe("openCreateDialog$", () => {

    describe("should open the CreateProjectComponent in a MatDialog", () => {
      it(`on '${openCreateProjectDialog.type}' action`, async (done) => {
        // arrange
        const dialogOpenSpy = spyOn(matDialog, "open");
        actions$ = of(openCreateProjectDialog());

        // assert
        expect(getEffectsMetadata(effects).openCreateDialog$.dispatch).toBeFalse();
        effects.openCreateDialog$.subscribe(() => {
          expect(dialogOpenSpy).toHaveBeenCalledOnceWith(
            CreateProjectComponent,
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
      [closeCreateProjectDialog(), addProjectSucceeded(null)].forEach(inputAction => {
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

  describe("showSpinner$", () => {

    describe("should emit showSpinner action", () => {
      [loadProjects(), addProject(null)].forEach(inputAction => {
        it(`on '${inputAction.type}' action`, async (done) => {
          // arrange
          actions$ = of(inputAction);

          // assert
          effects.showSpinner$.subscribe((action) => {
            expect(action).toEqual(showSpinner());

            done();
          });
        });
      });
    });

  });

  describe("hideSpinner$", () => {

    describe("should emit hideSpinner action", () => {
      [loadProjectsSucceeded(null), loadProjectsFailed(null), addProjectSucceeded(null), addProjectFailed(null)].forEach(inputAction => {
        it(`on '${inputAction.type}' action`, async (done) => {
          // arrange
          actions$ = of(inputAction);

          // assert
          effects.hideSpinner$.subscribe((action) => {
            expect(action).toEqual(hideSpinner());

            done();
          });
        });
      });
    });

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
        }
      ];

      errors.forEach(error => {
        describe(error.karmaTitle, () => {
          it(`on '${error.inputAction.type}' action`, async (done) => {
            // arrange
            actions$ = of(error.inputAction);

            // assert
            error.effect(effects).subscribe((action) => {
              expect(action).toEqual(showError({ error: error.inputAction.payload, message: error.expectedMessage }));

              done();
            });
          });
        });
      });
    });

  });
});
