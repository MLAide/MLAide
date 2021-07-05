import { Component, Input } from "@angular/core";
import { Observable } from "rxjs";

@Component({
  selector: "app-run-params-metrics-table",
  templateUrl: "./run-params-metrics-table.component.html",
  styleUrls: ["./run-params-metrics-table.component.scss"],
})
export class RunParamsMetricsTableComponent {
  @Input() data$: Observable<any[]>;
  @Input() displayedColumnsName$: Observable<string[]>;
  @Input() displayedColumnsStartTime$: Observable<any[]>;

  public valuesInRowDiffer(row: any[]) {
    const array = row.slice(1);
    if (array.length > 1) {
      const firstItem = array[0];

      return array.slice(1).every((item) => {
        return item === firstItem;
      });
    } else {
      return false;
    }
  }
}
