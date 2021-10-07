import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { Store } from "@ngrx/store";
import { selectIsLoadingProjects, selectProjects } from "@mlaide/state/project/project.selectors";
import { loadProjects, openAddProjectDialog } from "@mlaide/state/project/project.actions";
import { Project } from "@mlaide/state/model";

@Component({
  selector: "app-project-list",
  templateUrl: "./project-list.component.html",
  styleUrls: ["./project-list.component.scss"],
})
export class ProjectListComponent implements OnInit {
  public displayedColumns: string[] = ["name", "key", "createdAt"];
  public projects$: Observable<Project[]>;
  public isLoading$: Observable<boolean>;

  constructor(private router: Router, private readonly store: Store) {}

  public ngOnInit() {
     this.projects$ = this.store.select(selectProjects);
     this.isLoading$ = this.store.select(selectIsLoadingProjects);

     this.store.dispatch(loadProjects());
  }

  async goToProject(project: Project) {
    const projectUrl = `/projects/${project.key}`;
    await this.router.navigateByUrl(projectUrl);
  }

  openAddProjectDialog(): void {
    this.store.dispatch(openAddProjectDialog());
  }
}
