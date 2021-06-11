import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { CreateProjectComponent } from "./create-project/create-project.component";
import { Store } from "@ngrx/store";
import { selectProjects } from "@mlaide/state/project/project.selectors";
import { addProject, loadProjects } from "@mlaide/state/project/project.actions";
import { Project } from "@mlaide/state/model";

@Component({
  selector: "app-project-list",
  templateUrl: "./project-list.component.html",
  styleUrls: ["./project-list.component.scss"],
})
export class ProjectListComponent implements OnInit {
  public title = "Projects Overview";
  public displayedColumns: string[] = ["name", "key", "createdAt"];

  public projects$: Observable<Project[]> = this.store.select(selectProjects);

  constructor(private dialog: MatDialog, private router: Router, private readonly store: Store) {}

  public ngOnInit() {
    this.store.dispatch(loadProjects());
  }

  goToProject(project: Project) {
    const projectUrl = `/projects/${project.key}`;
    this.router.navigateByUrl(projectUrl);
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
    this.store.dispatch(addProject({ project }));
  }
}
