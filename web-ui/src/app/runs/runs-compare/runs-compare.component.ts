import { Component, OnDestroy, OnInit } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";
import { Run, RunListResponse } from "@mlaide/entities/run.model";
import { ListDataSource, RunsApiService } from "@mlaide/services";

@Component({
  selector: "app-runs-compare",
  templateUrl: "./runs-compare.component.html",
  styleUrls: ["./runs-compare.component.scss"],
})
export class RunsCompareComponent implements OnInit, OnDestroy {
  public dataSourceMetrics: MatTableDataSource<any> = new MatTableDataSource<any>();
  public dataSourceParameters: MatTableDataSource<any> = new MatTableDataSource<any>();
  public displayedColumnsStartTime: any[] = [" "];
  public displayedMetricsColumns: string[] = ["metrics"];
  public displayedParametersColumns: string[] = ["parameter"];
  private routeParamsSubscription: Subscription;
  private routeQueryParamsSub: Subscription;
  private projectKey: string;
  private runKeys: number[];
  private runListDataSource: ListDataSource<RunListResponse>;
  private runListSubscription: Subscription;
  private runs: Run[];
  private uniqueMetricsList: string[];
  private uniqueParametersList: string[];

  constructor(private route: ActivatedRoute, private runsApiService: RunsApiService) {}

  ngOnInit() {
    this.routeParamsSubscription = this.route.params.subscribe((routeParams) => {
      this.projectKey = routeParams.projectKey;

      this.routeQueryParamsSub = this.route.queryParams.subscribe((queryParams) => {
        this.runKeys = queryParams.runKeys;

        this.runListDataSource = this.runsApiService.getRunsByRunKeys(this.projectKey, this.runKeys);
        this.runListSubscription = this.runListDataSource.items$.subscribe((runs) => {
          this.runs = runs.items;
          this.runs.forEach((run) => {
            this.displayedMetricsColumns.push(`${run.name}-${run.key}`);
            this.displayedParametersColumns.push(`${run.name}-${run.key}`);
            this.displayedColumnsStartTime.push(run?.startTime);
          });
          this.uniqueMetricsList = this.createMetricsList(this.runs);
          this.uniqueParametersList = this.createParametersList(this.runs);

          this.dataSourceMetrics.data = this.createDatasourceForMetrics(this.runs, this.uniqueMetricsList);

          this.dataSourceParameters.data = this.createDatasourceForParameters(this.runs, this.uniqueParametersList);
        });
      });
    });
  }

  ngOnDestroy() {
    if (this.routeParamsSubscription) {
      this.routeParamsSubscription.unsubscribe();
    }

    if (this.routeQueryParamsSub) {
      this.routeQueryParamsSub.unsubscribe();
    }

    if (this.runListSubscription) {
      this.runListSubscription.unsubscribe();
      this.runListSubscription = null;
    }
  }

  private createDatasourceForMetrics(runs: Run[], uniqueMetricsList: string[]) {
    const data = [];

    uniqueMetricsList.forEach((metric) => {
      const valuesForMetrics = [metric];

      runs.forEach((run) => {
        if (run.metrics) {
          valuesForMetrics.push(run.metrics[metric]);
        }
      });

      data.push(valuesForMetrics);
    });

    return data;
  }

  private createDatasourceForParameters(runs: Run[], uniqueParamsList: string[]) {
    const data = [];

    uniqueParamsList.forEach((param) => {
      const valuesForParam = [param];

      runs.forEach((run) => {
        if (run.parameters) {
          valuesForParam.push(run.parameters[param]);
        }
      });

      data.push(valuesForParam);
    });

    return data;
  }

  private createMetricsList(runs: Run[]): string[] {
    const keys: string[] = [];
    runs.forEach((run) => {
      if (run.metrics) {
        Object.keys(run.metrics).forEach((key) => {
          keys.push(key);
        });
      }
    });

    return Array.from(new Set(keys));
  }

  private createParametersList(runs: Run[]): string[] {
    const keys: string[] = [];
    runs.forEach((run) => {
      if (run.parameters) {
        Object.keys(run.parameters).forEach((key) => {
          keys.push(key);
        });
      }
    });

    return Array.from(new Set(keys));
  }
}
