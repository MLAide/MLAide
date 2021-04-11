import { AfterViewInit, Component, Input, ViewChild } from "@angular/core";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";

@Component({
  selector: "app-run-params-metrics-table",
  templateUrl: "./run-params-metrics-table.component.html",
  styleUrls: ["./run-params-metrics-table.component.scss"],
})
export class RunParamsMetricsTableComponent implements AfterViewInit {
  @Input() dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
  @Input() displayedColumnsName: string[];
  @Input() displayedColumnsStartTime: any[] = [" "];
  @ViewChild(MatSort) sort: MatSort;

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

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
