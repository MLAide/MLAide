import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { MatTableDataSource } from "@angular/material/table";
import { ActivatedRoute } from "@angular/router";
import { Observable, Subscription } from "rxjs";
import { CreateOrEditProjectMemberComponent } from "./create-or-edit-project-member/create-or-edit-project-member.component";
import { Project } from "../../../models/project.model";
import { ProjectMember, ProjectMemberListResponse, ProjectMemberRole } from "../../../models/projectMember.model";
import { ListDataSource, ProjectsApiService, SnackbarUiService, SpinnerUiService } from "../../../services";
import { MatSort } from "@angular/material/sort";

@Component({
  selector: "app-project-settings",
  templateUrl: "./project-settings.component.html",
  styleUrls: ["./project-settings.component.scss"],
})
export class ProjectSettingsComponent implements OnInit, OnDestroy, AfterViewInit {
  public dataSource: MatTableDataSource<ProjectMember> = new MatTableDataSource<ProjectMember>();
  public displayedColumns: string[] = ["nickName", "email", "role", "actions"];
  public project: Project;
  public projectKey: string;
  @ViewChild(MatSort) public sort: MatSort;
  private routeParamsSubscription: Subscription;
  private projectMembersListDatasource: ListDataSource<ProjectMemberListResponse>;
  private projectMembersListSubscription: Subscription;
  private projectSub: Subscription;

  constructor(
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private snackBarService: SnackbarUiService,
    private projectApiService: ProjectsApiService,
    private spinnerService: SpinnerUiService
  ) {}

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    if (this.routeParamsSubscription) {
      this.routeParamsSubscription.unsubscribe();
    }

    if (this.projectSub) {
      this.projectSub.unsubscribe();
    }

    if (this.projectMembersListSubscription) {
      this.projectMembersListSubscription.unsubscribe();
    }
  }

  ngOnInit() {
    this.routeParamsSubscription = this.route.params.subscribe((params) => {
      this.projectKey = params.projectKey;
      this.projectSub = this.projectApiService.getProject(this.projectKey).subscribe((project) => {
        this.project = project;
      });
      this.projectMembersListDatasource = this.projectApiService.getProjectMembers(this.projectKey);
      this.projectMembersListSubscription = this.projectMembersListDatasource.items$.subscribe((projectMembers) => {
        this.dataSource.data = projectMembers.items;
      });
    });
  }

  public openAddProjectMemberDialog(): void {
    const dialogRef = this.dialog.open(CreateOrEditProjectMemberComponent, {
      minWidth: "20%",
      data: {
        title: `Add new member`,
        projectMember: null,
        create: true,
      },
    });

    this.subscribeToAfterClosedAndCallEditProjectMemberDialogOnResult(dialogRef);
  }

  public openEditProjectMemberDialog(projectMember: ProjectMember): void {
    const dialogRef = this.dialog.open(CreateOrEditProjectMemberComponent, {
      minWidth: "20%",
      data: {
        title: `Edit member: ${projectMember.nickName}`,
        projectMember,
        create: false,
      },
    });

    this.subscribeToAfterClosedAndCallEditProjectMemberDialogOnResult(dialogRef);
  }

  public removeProjectMember(projectMember: ProjectMember): void {
    this.executeOperationAndReloadProjectMembers(() =>
      this.projectApiService.deleteProjectMember(this.projectKey, projectMember.email)
    );
  }

  private editProjectMemberDialog(result: { email: string; nickName: string; role: ProjectMemberRole }): void {
    const projectMember: ProjectMember = {
      email: result.email,
      nickName: undefined,
      role: result.role,
      userId: undefined,
    };
    this.executeOperationAndReloadProjectMembers(() =>
      this.projectApiService.createOrUpdateProjectMembers(this.projectKey, projectMember)
    );
  }

  private executeOperationAndReloadProjectMembers<T>(operation: () => Observable<T>, successCallback: () => void = null) {
    this.spinnerService.showSpinner();

    const observable = operation();

    const subscription = observable.subscribe(
      (response) => {
        subscription.unsubscribe();
        this.spinnerService.stopSpinner();

        this.projectMembersListDatasource.refresh();

        if (successCallback !== null) {
          successCallback();
        }
        this.snackBarService.showSuccesfulSnackbar("Successfully updated project members!");
      },
      (error) => {
        console.error(error);
        subscription.unsubscribe();
        this.snackBarService.showErrorSnackbar("Error while updating project members.");
        this.spinnerService.stopSpinner();
      }
    );
  }

  private subscribeToAfterClosedAndCallEditProjectMemberDialogOnResult(
    dialogRef: MatDialogRef<CreateOrEditProjectMemberComponent, any>
  ) {
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.editProjectMemberDialog(result);
      }
    });
  }
}
