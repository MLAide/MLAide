import { HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { of } from "rxjs";
import { catchError, map, mergeMap, switchMap, tap } from "rxjs/operators";
import { snackbarError } from "../shared/snackbar.actions";
import { hideSpinner, showSpinner } from "../shared/spinner.actions";
import {
  addProject,
  addProjectFailed,
  addProjectSucceeded, closeCreateProjectDialog,
  loadProjects,
  loadProjectsFailed,
  loadProjectsSucceeded, openCreateProjectDialog
} from "./project.actions";
import { ProjectApi } from "./project.api";
import { MatDialog } from "@angular/material/dialog";
import { CreateProjectComponent } from "@mlaide/core/components/project-list/create-project/create-project.component";

@Injectable({ providedIn: "root" })
export class ProjectEffects {

  loadProjects$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadProjects, addProjectSucceeded),
      mergeMap(() =>
        this.projectApi.getProjects().pipe(
          map((response) => response.items),
          map((projects) => loadProjectsSucceeded({ projects })),
          catchError((error) => of(loadProjectsFailed(error)))
        )
      )
    )
  );

  addProject$ = createEffect(() =>
    this.actions$.pipe(
      ofType(addProject),
      switchMap((project) =>
        this.projectApi.addProject(project).pipe(
          map((createdProject) => addProjectSucceeded(createdProject)),
          catchError((error) => of(addProjectFailed(error)))
        )
      )
    )
  );

  openCreateDialog$ = createEffect(() =>
      this.actions$.pipe(
        ofType(openCreateProjectDialog),
        tap((data) => {
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

  closeCreateOrEditDialog$ = createEffect(() =>
      this.actions$.pipe(
        ofType(addProjectSucceeded, closeCreateProjectDialog),
        tap(() => this.dialog.closeAll())
      ),
    { dispatch: false }
  );

  showSpinner$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadProjects, addProject),
      map(() => showSpinner())
    )
  );

  hideSpinner$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadProjectsSucceeded, loadProjectsFailed, addProjectSucceeded, addProjectFailed),
      map(() => hideSpinner())
    )
  );

  showError$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadProjectsFailed, addProjectFailed),
      map((action) => action.payload),
      map((error) => {
        if (error instanceof HttpErrorResponse) {
          if (error.status === 400) {
            return "The project could not be created, because of invalid input data. Please try again with valid input data.";
          }
          if (error.status === 409) {
            return "A project with this key already exists. Please choose a different project key.";
          }
        }

        return "A unknown error occoured.";
      }),
      map((errorMessage) => snackbarError({ message: errorMessage }))
    )
  );

  public constructor(private readonly actions$: Actions,
                     private readonly dialog: MatDialog,
                     private readonly projectApi: ProjectApi) {}
}
