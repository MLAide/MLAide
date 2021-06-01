import { Component, OnDestroy, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatTableDataSource } from "@angular/material/table";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";
import { HttpErrorResponse } from "@angular/common/http";
import { LocationStrategy } from "@angular/common";
import { Project, ProjectListResponse } from "@mlaide/entities/project.model";
import { ListDataSource, ProjectsApiService, SnackbarUiService, SpinnerUiService } from "@mlaide/services";
import { LoggingService } from "@mlaide/services/logging.service";
import { CreateProjectComponent } from "./create-project/create-project.component";

@Component({
  selector: "app-project-list",
  templateUrl: "./project-list.component.html",
  styleUrls: ["./project-list.component.scss"],
})
export class ProjectListComponent implements OnInit, OnDestroy {
  public title = "Projects Overview";
  public dataSource: MatTableDataSource<Project> = new MatTableDataSource<Project>();
  public displayedColumns: string[] = ["name", "key", "createdAt"];

  private projectListDataSource: ListDataSource<ProjectListResponse>;
  private projectListSubscription: Subscription;

  constructor(
    private dialog: MatDialog,
    private loggingService: LoggingService,
    private locationStrategy: LocationStrategy,
    private projectsApiService: ProjectsApiService,
    private router: Router,
    private snackbarUiService: SnackbarUiService,
    private spinnerUiService: SpinnerUiService
  ) {}

  goToProject(project: Project) {
    const projectUrl = `/projects/${project.key}`;
    this.router.navigateByUrl(projectUrl);
  }

  ngOnDestroy() {
    if (this.projectListSubscription) {
      this.projectListSubscription.unsubscribe();
      this.projectListSubscription = null;
    }
  }

  ngOnInit() {
    this.projectListDataSource = this.projectsApiService.getProjects();
    this.projectListSubscription = this.projectListDataSource.items$.subscribe(
      (projects) => (this.dataSource.data = projects.items)
    );
  }

  openCreateProjectDialog(): void {
    const dialogRef = this.dialog.open(CreateProjectComponent, {
      data: {
        key: "",
        name: "",
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.createNewProject(result);
      }
    });
  }

  private createNewProject(project: Project) {
    this.spinnerUiService.showSpinner();

    const createProjectObservable = this.projectsApiService.addProject(project);

    const subscription = createProjectObservable.subscribe(
      () => {
        subscription.unsubscribe();
        this.spinnerUiService.stopSpinner();

        this.projectListDataSource.refresh();
      },
      (error) => {
        if (error instanceof HttpErrorResponse) {
          if (error.status === 400) {
            this.loggingService.logError(error.message, this.locationStrategy.path(), JSON.stringify(error));
            this.snackbarUiService.showErrorSnackbar(
              "The project could not be created, because of invalid input data. Please try again with valid input data."
            );
          }
          if (error.status === 409) {
            this.snackbarUiService.showErrorSnackbar(
              "A project with this key already exists. Please choose a different project key."
            );
          }
        }
        subscription.unsubscribe();
        this.spinnerUiService.stopSpinner();
      }
    );
  }
}
