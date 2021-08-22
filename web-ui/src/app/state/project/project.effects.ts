import { HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Actions, concatLatestFrom, createEffect, ofType } from "@ngrx/effects";
import { of } from "rxjs";
import { catchError, map, mergeMap, switchMap, tap } from "rxjs/operators";
import { showErrorMessage } from "../shared/shared.actions";
import { hideSpinner, showSpinner } from "../shared/shared.actions";
import {
  addProject,
  addProjectFailed,
  addProjectSucceeded,
  closeAddProjectDialog, loadProject, loadProjectFailed,
  loadProjects,
  loadProjectsFailed,
  loadProjectsSucceeded, loadProjectSucceeded,
  openAddProjectDialog
} from "./project.actions";
import { ProjectApi } from "./project.api";
import { MatDialog } from "@angular/material/dialog";
import { AddProjectComponent } from "@mlaide/core/components/add-project/add-project.component";
import { currentUserChanged } from "../user/user.actions";
import { selectCurrentProjectKey } from "@mlaide/state/project/project.selectors";
import { Store } from "@ngrx/store";

@Injectable({ providedIn: "root" })
export class ProjectEffects {

  loadProject$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadProject),
      concatLatestFrom(() => this.store.select(selectCurrentProjectKey)),
      mergeMap(([_, projectKey]) => this.projectApi.getProject(projectKey)),
      map((project) => loadProjectSucceeded({ project })),
      catchError((error) => of(loadProjectFailed({ payload: error })))
    )
  );

  loadProjectFailed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadProjectsFailed),
      map((action) => action.payload),
      map((error) => ({
        message: "Could not load project. A unknown error occurred.",
        error: error
      })),
      map(showErrorMessage)
    )
  );

  loadProjects$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadProjects, addProjectSucceeded),
      mergeMap(() =>
        this.projectApi.getProjects().pipe(
          map((response) => response.items),
          map((projects) => loadProjectsSucceeded({ projects })),
          catchError((error) => of(loadProjectsFailed({ payload: error })))
        )
      )
    )
  );

  addProject$ = createEffect(() =>
    this.actions$.pipe(
      ofType(addProject),
      switchMap((action) =>
        this.projectApi.addProject(action.project).pipe(
          map((createdProject) => addProjectSucceeded({ project: createdProject })),
          catchError((error) => of(addProjectFailed({ payload: error })))
        )
      )
    )
  );

  openCreateDialog$ = createEffect(() =>
      this.actions$.pipe(
        ofType(openAddProjectDialog),
        tap(() => {
          this.dialog.open(AddProjectComponent, {
            data: {
              key: "",
              name: "",
            },
          });
        })
      ),
    { dispatch: false }
  );

  closeCreateDialog$ = createEffect(() =>
      this.actions$.pipe(
        ofType(addProjectSucceeded, closeAddProjectDialog),
        tap(() => this.dialog.closeAll())
      ),
    { dispatch: false }
  );

  showSpinner$ = createEffect(() =>
    this.actions$.pipe(
      ofType(addProject),
      map(() => showSpinner())
    )
  );

  hideSpinner$ = createEffect(() =>
    this.actions$.pipe(
      ofType(addProjectSucceeded, addProjectFailed),
      map(() => hideSpinner())
    )
  );

  addProjectFailed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(addProjectFailed),
      map((action) => action.payload),
      map((error) => {
        let message = "Could not create project. A unknown error occurred.";

        if (this.hasErrorStatusCode(error, 400)) {
          message = "The project could not be created, because of invalid input data. Please try again with valid input data.";
        }

        if (this.hasErrorStatusCode(error, 409)) {
          message = "A project with this key already exists. Please choose a different project key.";
        }

        return {
          message: message,
          error: error
        };
      }),
      map(showErrorMessage)
    )
  );

  loadProjectsFailed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadProjectsFailed),
      map((action) => action.payload),
      map((error) => ({
        message: "Could not load projects. A unknown error occurred.",
        error: error
      })),
      map(showErrorMessage)
    )
  );

  loadProjectsOnLoggedInUserChanged$ = createEffect(() =>
    this.actions$.pipe(
      ofType(currentUserChanged),
      map(() => loadProjects())
    )
  );

  private hasErrorStatusCode = (error, statusCode: number): boolean => {
    return error instanceof HttpErrorResponse && error.status === statusCode;
  }

  public constructor(private readonly actions$: Actions,
                     private readonly dialog: MatDialog,
                     private readonly projectApi: ProjectApi,
  private readonly store: Store) {}
}
