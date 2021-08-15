import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { Run } from "@mlaide/entities/run.model";
import { Store } from "@ngrx/store";
import { loadRunsByRunKeys } from "@mlaide/state/run/run.actions";
import { selectCurrentProjectKey } from "@mlaide/state/project/project.selectors";
import { selectIsLoadingRuns, selectRuns } from "@mlaide/state/run/run.selectors";
import { map } from "rxjs/operators";

@Component({
  selector: "app-runs-compare",
  templateUrl: "./runs-compare.component.html",
  styleUrls: ["./runs-compare.component.scss"],
})
export class RunsCompareComponent implements OnInit {
  public runs$: Observable<Run[]>;
  public projectKey$: Observable<string>;
  public isLoadingRuns$: Observable<boolean>;

  public displayedMetricsColumns$: Observable<string[]>;
  public displayedParametersColumns$: Observable<string[]>;
  public displayedColumnsStartTime$: Observable<any>;

  public metrics$: Observable<any[][]>;
  public parameters$: Observable<any[][]>;

  constructor(private store: Store) {}

  ngOnInit() {
    this.runs$ = this.store.select(selectRuns);

    this.metrics$ = this.runs$.pipe(
      map((runs) => {
        const uniqueMetrics = this.createMetricsList(runs);
        return this.createDatasourceForMetrics(runs, uniqueMetrics);
      })
    );

    this.parameters$ = this.runs$.pipe(
      map((runs) => {
        const uniqueParameters = this.createParametersList(runs);
        return this.createDatasourceForParameters(runs, uniqueParameters);
      })
    );

    this.displayedMetricsColumns$ = this.runs$.pipe(
      map((runs) => ["metrics"].concat(...runs.map((run) => `${run.name}-${run.key}`)))
    );

    this.displayedParametersColumns$ = this.runs$.pipe(
      map((runs) => ["parameters"].concat(...runs.map((run) => `${run.name}-${run.key}`)))
    );

    this.displayedColumnsStartTime$ = this.runs$.pipe(
      map((runs) => [(" " as any)].concat(...runs.map((run) => run.startTime)))
    );

    this.projectKey$ = this.store.select(selectCurrentProjectKey);
    this.isLoadingRuns$ = this.store.select(selectIsLoadingRuns);

    this.store.dispatch(loadRunsByRunKeys());
  }

  private createDatasourceForMetrics(runs: Run[], uniqueMetricsList: string[]) {
    return this.createDatasourceForRunProperty(runs, uniqueMetricsList, "metrics");
  }

  private createDatasourceForParameters(runs: Run[], uniqueParamsList: string[]) {
    return this.createDatasourceForRunProperty(runs, uniqueParamsList, "parameters");
  }

  private createDatasourceForRunProperty(runs: Run[], propertyKeys: string[], propertyName: string) {
    const data = [];

    propertyKeys.forEach((propertyKey) => {
      const values = [propertyKey];

      runs.forEach((run) => {
        if (run[propertyName]) {
          values.push(run[propertyName][propertyKey]);
        }
      });

      data.push(values);
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
