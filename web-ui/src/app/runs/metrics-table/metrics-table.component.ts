import { Component, Input, OnChanges, OnInit, SimpleChanges } from "@angular/core";
import { Observable, Subscription } from "rxjs";
import { RunMetric } from "@mlaide/state/run/run.models";
import { MatTableDataSource } from "@angular/material/table";

@Component({
  selector: 'app-metrics-table',
  templateUrl: './metrics-table.component.html',
  styleUrls: ['./metrics-table.component.scss']
})
export class MetricsTableComponent implements OnChanges {
  @Input()
  public metrics$: Observable<RunMetric[]>;
  public metricsColumns: string[] = ["metricsKey", "metricsValue"];
  public dataSource: MatTableDataSource<RunMetric> = new MatTableDataSource<RunMetric>();
  private metricsSubscription: Subscription;

  constructor() { }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.metrics$) {
      this.unsubscribeMetrics();
      this.metricsSubscription = this.metrics$.subscribe((metrics) => this.dataSource.data = metrics);
    }
  }

  public ngOnDestroy(): void {
    this.unsubscribeMetrics();
  }

  private unsubscribeMetrics() {
    if (this.metricsSubscription) {
      this.metricsSubscription.unsubscribe();
      this.metricsSubscription = null;
    }
  }
}
