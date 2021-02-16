import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Project } from '../../models/project.model';
import { ProjectsApiService } from '../../services';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})
export class ProjectComponent implements OnInit, OnDestroy {
  public project: Project;
  private routeParamsSubscription: any;
  constructor(private projectApiService: ProjectsApiService,
    private route: ActivatedRoute) { }

  ngOnInit() {
    this.routeParamsSubscription = this.route.params.subscribe(params => {
      const projectKey = params.projectKey;
      this.projectApiService.getProject(projectKey).subscribe(project => {
        this.project = project;
      });
    });
  }

  ngOnDestroy() {
    if (this.routeParamsSubscription) {
      this.routeParamsSubscription.unsubscribe();
    }
  }
}
