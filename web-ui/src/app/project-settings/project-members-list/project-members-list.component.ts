import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { Store } from "@ngrx/store";
import { deleteProjectMember, loadProjectMembers, openAddProjectMemberDialog, openEditProjectMemberDialog } from "@mlaide/state/project-member/project-member.actions";
import { selectCurrentProjectMember, selectIsLoadingProjectMembers, selectProjectMembers } from "@mlaide/state/project-member/project-member.selectors";
import { selectCurrentProjectKey } from "@mlaide/state/project/project.selectors";
import { ProjectMember, ProjectMemberRole } from "@mlaide/state/project-member/project-member.models";
import { map } from "rxjs/operators";

@Component({
  selector: "app-project-members-list",
  templateUrl: "./project-members-list.component.html",
  styleUrls: ["./project-members-list.component.scss"],
})
export class ProjectMembersListComponent implements OnInit {
  public displayedColumns$: Observable<string[]>;
  public currentProjectMember$: Observable<ProjectMember>;
  public projectMembers$: Observable<ProjectMember[]>;
  public projectKey$: Observable<string>;
  public isLoading$: Observable<boolean>;

  constructor(private store: Store) {}

  ngOnInit() {
    this.projectMembers$ = this.store.select(selectProjectMembers);
    this.projectKey$ = this.store.select(selectCurrentProjectKey);
    this.isLoading$ = this.store.select(selectIsLoadingProjectMembers);
    this.currentProjectMember$ = this.store.select(selectCurrentProjectMember);
    this.displayedColumns$ = this.currentProjectMember$.pipe(
      map(projectMember => projectMember?.role === ProjectMemberRole.OWNER),
      map(showActions => showActions ? ["nickName", "email", "role", "actions"] : ["nickName", "email", "role"])
    );

    this.store.dispatch(loadProjectMembers());
  }

  public addProjectMember(): void {
    this.store.dispatch(openAddProjectMemberDialog());
  }

  public editProjectMember(projectMember: ProjectMember): void {
    this.store.dispatch(openEditProjectMemberDialog({ projectMember }));
  }

  public deleteProjectMember(projectMember: ProjectMember): void {
    this.store.dispatch(deleteProjectMember({ projectMember }));
  }
}
