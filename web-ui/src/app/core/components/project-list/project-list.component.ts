import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { Store } from "@ngrx/store";
import { selectIsLoadingProjects, selectProjects } from "@mlaide/state/project/project.selectors";
import { loadProjects, openCreateProjectDialog } from "@mlaide/state/project/project.actions";
import { Project } from "@mlaide/state/model";

@Component({
  selector: "app-project-list",
  templateUrl: "./project-list.component.html",
  styleUrls: ["./project-list.component.scss"],
})
export class ProjectListComponent implements OnInit {
  public displayedColumns: string[] = ["name", "key", "createdAt"];
  public projects$: Observable<Project[]> = this.store.select(selectProjects);
  public isLoading$: Observable<boolean> = this.store.select(selectIsLoadingProjects);

  constructor(private router: Router, private readonly store: Store) {}

  public ngOnInit() {
    this.store.dispatch(loadProjects());
  }

  async goToProject(project: Project) {
    const projectUrl = `/projects/${project.key}`;
    await this.router.navigateByUrl(projectUrl);
  }

  openCreateProjectDialog(): void {
    this.store.dispatch(openCreateProjectDialog());
  }
}
