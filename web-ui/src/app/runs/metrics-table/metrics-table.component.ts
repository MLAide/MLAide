import { Component, Input } from "@angular/core";
import { Observable } from "rxjs";
import { RunMetric } from "@mlaide/state/run/run.models";

@Component({
  selector: 'app-metrics-table',
  templateUrl: './metrics-table.component.html',
  styleUrls: ['./metrics-table.component.scss']
})
export class MetricsTableComponent {
  @Input()
  public metrics$: Observable<RunMetric[]>;
  public metricsColumns: string[] = ["metricsKey", "metricsValue"];
}
