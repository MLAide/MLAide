import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Project } from "@mlaide/entities/project.model";
import { ProjectsApiService } from "@mlaide/shared/api";
import { Observable } from "rxjs";
import { selectCurrentProjectKey } from "@mlaide/state/project/project.selectors";
import { Store } from "@ngrx/store";
import { loadProject } from "@mlaide/state/project/project.actions";

@Component({
  selector: "app-project",
  templateUrl: "./project.component.html",
  styleUrls: ["./project.component.scss"],
})
export class ProjectComponent implements OnInit, OnDestroy {
  public project$: Observable<Project>;
  public projectKey$: Observable<string>;
  private routeParamsSubscription: any;
  constructor(private projectApiService: ProjectsApiService, private route: ActivatedRoute, private store: Store) {}

  // TODO Raman: Umstellen auf Redux + Tests fixen
  ngOnInit() {
    this.projectKey$ = this.store.select(selectCurrentProjectKey);

    this.store.dispatch(loadProject());
    /*this.routeParamsSubscription = this.route.params.subscribe((params) => {
      const projectKey = params.projectKey;
      this.projectApiService.getProject(projectKey).subscribe((project) => {
        this.project = project;
      });
    });*/
  }

  ngOnDestroy() {
    if (this.routeParamsSubscription) {
      this.routeParamsSubscription.unsubscribe();
    }
  }
}
