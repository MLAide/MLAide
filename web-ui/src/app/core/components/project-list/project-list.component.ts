import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Project, ProjectListResponse } from '../../models/project.model';
import { ListDataSource, ProjectsApiService, SpinnerUiService } from '../../services';
import { CreateProjectComponent } from './create-project/create-project.component';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss']
})
export class ProjectListComponent implements OnInit, OnDestroy {
  public title = 'Projects Overview'
  public dataSource: MatTableDataSource<Project> = new MatTableDataSource<Project>();
  public displayedColumns: string[] = ['name', 'key', 'createdAt'];

  private projectListDataSource: ListDataSource<ProjectListResponse>;
  private projectListSubscription: Subscription;

  constructor(private dialog: MatDialog,
    private projectsApiService: ProjectsApiService,
    private router: Router,
    private spinnerService: SpinnerUiService) { }

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
    this.projectListSubscription = this.projectListDataSource.items$.subscribe(projects => this.dataSource.data = projects.items);
  }

  openCreateProjectDialog(): void {
    const dialogRef = this.dialog.open(CreateProjectComponent, {
      data: {
        key: '',
        name: ''
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.createNewProject(result);
      }
    });
  }

  private createNewProject(project: Project) {
    this.spinnerService.showSpinner();

    const createProjectObservable = this.projectsApiService.addProject(project);

    const subscription = createProjectObservable.subscribe(
      (response: any) => {
        subscription.unsubscribe();
        this.spinnerService.stopSpinner();

        this.projectListDataSource.refresh();
      },
      (error) => {
        console.error(error);
        subscription.unsubscribe();
        this.spinnerService.stopSpinner();
      }
    );
  }
}
