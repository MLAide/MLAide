import { Injectable } from "@angular/core";
import { Actions, concatLatestFrom, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import * as projectMemberActions from "@mlaide/state/project-member/project-member.actions";
import { selectCurrentProjectKey } from "@mlaide/state/project/project.selectors";
import { catchError, filter, map, mergeMap, tap } from "rxjs/operators";
import { of } from "rxjs";
import { showErrorMessage } from "@mlaide/state/shared/shared.actions";
import { MatDialog } from "@angular/material/dialog";
import { ProjectMemberApi } from "./project-member.api";
import { AddOrEditProjectMemberComponent } from "@mlaide/project-settings/add-or-edit-project-member/add-or-edit-project-member.component";
import { Router } from "@angular/router";
import { selectCurrentUser } from "@mlaide/state/user/user.selectors";

@Injectable({ providedIn: "root" })
export class ProjectMemberEffects {
  loadProjectMembers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(projectMemberActions.loadProjectMembers,
        projectMemberActions.addProjectMemberSucceeded,
        projectMemberActions.editProjectMemberSucceeded,
        projectMemberActions.deleteProjectMemberSucceeded),
      // if this was triggered by a successful delete action, then only execute loading if the deleted user is not the current user
      concatLatestFrom(() => this.store.select(selectCurrentUser)),
      filter(([action, currentUser]) =>
        action.type !== projectMemberActions.deleteProjectMemberSucceeded.type
        || (action as any).projectMember.email !== currentUser.email),
      concatLatestFrom(() => this.store.select(selectCurrentProjectKey)),
      mergeMap(([_, projectKey]) => this.projectMemberApi.getProjectMembers(projectKey).pipe(
        map((projectMemberListResponse) => ({ projectMembers: projectMemberListResponse.items })),
        map((projectMembers) => projectMemberActions.loadProjectMembersSucceeded(projectMembers)),
        catchError((error) => of(projectMemberActions.loadProjectMembersFailed({payload: error })))
      )),
    )
  );

  loadProjectMembersFailed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(projectMemberActions.loadProjectMembersFailed),
      map((action) => action.payload),
      map((error) => ({
        message: "Could not load project members. A unknown error occurred.",
        error: error
      })),
      map(showErrorMessage)
    )
  );

  currentProjectMember$ = createEffect(() =>
    this.actions$.pipe(
      ofType(projectMemberActions.loadProjectMembersSucceeded),
      concatLatestFrom(() => this.store.select(selectCurrentUser)),
      map(([action, currentUser]) => action.projectMembers.find(projectMember => projectMember.email === currentUser.email)),
      map((currentProjectMember) => projectMemberActions.currentProjectMemberChanged({ currentProjectMember }))
    )
  );

  addProjectMember$ = createEffect(() =>
    this.actions$.pipe(
      ofType(projectMemberActions.addProjectMember),
      concatLatestFrom(() => this.store.select(selectCurrentProjectKey)),
      mergeMap(([action, projectKey]) => this.projectMemberApi.patchProjectMembers(projectKey, action.projectMember).pipe(
          map(() => projectMemberActions.addProjectMemberSucceeded()),
          catchError((error) => of(projectMemberActions.addProjectMemberFailed(error)))
        )
      ),
    )
  );

  addProjectMemberFailed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(projectMemberActions.addProjectMemberFailed),
      map((action) => action.payload),
      map((error) => ({
        message: "Could not add project member. A unknown error occurred.",
        error: error
      })),
      map(showErrorMessage)
    )
  );

  editProjectMember$ = createEffect(() =>
    this.actions$.pipe(
      ofType(projectMemberActions.editProjectMember),
      concatLatestFrom(() => this.store.select(selectCurrentProjectKey)),
      mergeMap(([action, projectKey]) => this.projectMemberApi.patchProjectMembers(projectKey, action.projectMember).pipe(
          map(() => projectMemberActions.editProjectMemberSucceeded()),
          catchError((error) => of(projectMemberActions.editProjectMemberFailed({payload: error })))
        )
      ),
    )
  );

  editProjectMemberFailed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(projectMemberActions.editProjectMemberFailed),
      map((action) => action.payload),
      map((error) => ({
        message: "Could not edit project member. A unknown error occurred.",
        error: error
      })),
      map(showErrorMessage)
    )
  );

  openAddProjectMemberDialog$ = createEffect(() =>
    this.actions$.pipe(
      ofType(projectMemberActions.openAddProjectMemberDialog),
      tap(() => {
        this.dialog.open(AddOrEditProjectMemberComponent, {
          minWidth: "20%",
          data: {
            title: `Add new member`,
            projectMember: null,
          },
        });
      })
    ),
    { dispatch: false }
  );

  openEditProjectMemberDialog$ = createEffect(() =>
    this.actions$.pipe(
      ofType(projectMemberActions.openEditProjectMemberDialog),
      tap((action) => {
        this.dialog.open(AddOrEditProjectMemberComponent, {
          minWidth: "20%",
          data: {
            title: `Edit member: ${action.projectMember.nickName}`,
            projectMember: action.projectMember,
          },
        });
      })
    ),
    { dispatch: false }
  );

  closeAddOrEditProjectMemberDialog$ = createEffect(() =>
    this.actions$.pipe(
      ofType(projectMemberActions.closeAddOrEditProjectMemberDialog,
        projectMemberActions.addProjectMemberSucceeded,
        projectMemberActions.editProjectMemberSucceeded),
      tap(() => this.dialog.closeAll())
    ),
    { dispatch: false }
  );

  deleteProjectMember$ = createEffect(() =>
    this.actions$.pipe(
      ofType(projectMemberActions.deleteProjectMember),
      concatLatestFrom(() => this.store.select(selectCurrentProjectKey)),
      mergeMap(([action, projectKey]) =>
        this.projectMemberApi.deleteProjectMember(projectKey, action.projectMember.email).pipe(
          map(() => action.projectMember),
          map((projectMember) => projectMemberActions.deleteProjectMemberSucceeded({ projectMember })),
          catchError((error) => of(projectMemberActions.deleteProjectMemberFailed({payload: error })))
        )
      ),
    )
  );

  deleteProjectMemberFailed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(projectMemberActions.deleteProjectMemberFailed),
      map((action) => action.payload),
      map((error) => ({
        message: "Could not delete project member. A unknown error occurred.",
        error: error
      })),
      map(showErrorMessage)
    )
  );

  goToProjectOverviewIfDeletedUserIsCurrentUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(projectMemberActions.deleteProjectMemberSucceeded),
      concatLatestFrom(() => this.store.select(selectCurrentUser)),
      filter(([action, currentUser]) => action.projectMember.email === currentUser.email),
      tap(() => this.router.navigate(["projects"]))
    ),
    { dispatch: false }
  );

  public constructor(
    private readonly actions$: Actions,
    private readonly dialog: MatDialog,
    private readonly projectMemberApi: ProjectMemberApi,
    private readonly router: Router,
    private readonly store: Store) {}
}
