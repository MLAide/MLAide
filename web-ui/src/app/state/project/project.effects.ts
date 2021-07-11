import { HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { of } from "rxjs";
import { catchError, map, mergeMap, switchMap, tap } from "rxjs/operators";
import { showError } from "../shared/shared.actions";
import { hideSpinner, showSpinner } from "../shared/shared.actions";
import {
  addProject,
  addProjectFailed,
  addProjectSucceeded,
  closeCreateProjectDialog,
  loadProjects,
  loadProjectsFailed,
  loadProjectsSucceeded,
  openCreateProjectDialog
} from "./project.actions";
import { ProjectApi } from "./project.api";
import { MatDialog } from "@angular/material/dialog";
import { CreateProjectComponent } from "@mlaide/core/components/create-project/create-project.component";
import { currentUserChanged } from "../user/user.actions";

@Injectable({ providedIn: "root" })
export class ProjectEffects {

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
        ofType(openCreateProjectDialog),
        tap(() => {
          this.dialog.open(CreateProjectComponent, {
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
        ofType(addProjectSucceeded, closeCreateProjectDialog),
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
      map(showError)
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
      map(showError)
    )
  );

  loadProjectsOnLoggedInUserChanged = createEffect(() =>
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
                     private readonly projectApi: ProjectApi) {}
}
