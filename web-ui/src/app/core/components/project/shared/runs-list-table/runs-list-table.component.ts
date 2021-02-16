import { SelectionModel } from "@angular/cdk/collections";
import {
  AfterViewInit,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
} from "@angular/core";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { ActivatedRoute, Router } from "@angular/router";

import { Subscription } from "rxjs";
import { ListDataSource, RunsApiService } from "../../../../services";
import { Run, RunListResponse } from "../../../../models/run.model";
import { FileSaverService } from "ngx-filesaver";

@Component({
  selector: "app-runs-list-table",
  templateUrl: "./runs-list-table.component.html",
  styleUrls: ["./runs-list-table.component.scss"],
})
export class RunsListTableComponent
  implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  public dataSource: MatTableDataSource<Run> = new MatTableDataSource<Run>();
  public displayedColumns: string[] = [
    "select",
    "name",
    "status",
    "startTime",
    "runTime",
    "metrics",
    "createdBy",
    "experiments",
  ];
  public hideParameters = true;
  @Input() projectKey: string;
  @Input() runListDataSource: ListDataSource<RunListResponse>;
  public selection = new SelectionModel<Run>(true, []);
  @ViewChild(MatSort) sort: MatSort;
  private runListSubscription: Subscription;

  constructor(
    private router: Router,
    private runsApiService: RunsApiService,
    private route: ActivatedRoute,
    private fileSaverService: FileSaverService
  ) {}
  ngOnInit(): void {}

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.runListDataSource) {
      this.runListSubscription = this.runListDataSource?.items$.subscribe(
        (runs) => {
          this.dataSource.data = runs.items;
        }
      );
    }
  }
  ngOnDestroy(): void {
    if (this.runListSubscription) {
      this.runListSubscription.unsubscribe();
      this.runListSubscription = null;
    }
  }

  /** The label for the checkbox on the passed row */
  public checkboxLabel(row?: Run): string {
    if (!row) {
      return `${this.isAllSelected() ? "select" : "deselect"} all`;
    }
    return `${this.selection.isSelected(row) ? "deselect" : "select"} row ${
      row.key
    }`;
  }

  public experimentClicked(experimentRef): void {
    const url = `/projects/${this.projectKey}/experiments/${experimentRef.experimentKey}`;
    this.router.navigate([url]);
  }

  public exportSelectedRuns(): void {
    const runKeys = [];
    this.selection.selected.forEach((run) => runKeys.push(run.key));

    this.runsApiService
      .exportRunsByRunKeys(this.projectKey, runKeys)
      .subscribe((data: any) => {
        const blob = new Blob([data], { type: "application/octet-stream" });
        const fileName = `ExportedRuns_${new Date().toISOString()}.json`;
        this.fileSaverService.save(blob, fileName);
      });
  }

  public goToRunCompareComponent(): void {
    const runKeys = [];
    this.selection.selected.forEach((run) => runKeys.push(run.key));

    const url = `/projects/${this.projectKey}/runs/compare`;
    this.router.navigate([url], {
      relativeTo: this.route,
      queryParams: { runKeys },
    });
  }

  /** Whether the number of selected elements matches the total number of rows. */
  public isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;

    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  public masterToggle(): void {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.data.forEach((row) => this.selection.select(row));
  }

  public selectedLessThanOneRow(): boolean {
    if (this.selection.selected.length > 0) {
      return false;
    }
    return true;
  }

  public selectedLessThanTwoRows(): boolean {
    if (this.selection.selected.length > 1) {
      return false;
    }
    return true;
  }

  public toggleParameters(): void {
    this.hideParameters = !this.hideParameters;
    if (this.hideParameters) {
      this.displayedColumns = [
        "select",
        "name",
        "status",
        "startTime",
        "runTime",
        "metrics",
        "createdBy",
        "experiments",
      ];
    } else {
      this.displayedColumns = [
        "select",
        "name",
        "status",
        "startTime",
        "runTime",
        "parameters",
        "metrics",
        "createdBy",
        "experiments",
      ];
    }
  }
}
