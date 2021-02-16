import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RunListResponse } from 'src/app/core/models/run.model';
import { ListDataSource, RunsApiService } from '../../../services';

@Component({
  selector: 'app-runs-list',
  templateUrl: './runs-list.component.html',
  styleUrls: ['./runs-list.component.scss']
})
export class RunsListComponent implements OnInit, OnDestroy {
  public projectKey: string;
  public runListDataSource: ListDataSource<RunListResponse>;
  private routeParamsSubscription: any;

  constructor(private runsApiService: RunsApiService,
    private route: ActivatedRoute) { }

  ngOnDestroy() {
    this.routeParamsSubscription.unsubscribe();
  }

  ngOnInit() {
    this.routeParamsSubscription = this.route.params.subscribe(params => {
      this.projectKey = params.projectKey;
      this.runListDataSource = this.runsApiService.getRuns(this.projectKey);
    });
  }
}
