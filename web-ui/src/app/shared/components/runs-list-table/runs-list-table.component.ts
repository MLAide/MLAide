import { SelectionModel } from "@angular/cdk/collections";
import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Observable, Subscription } from "rxjs";
import { Run } from "@mlaide/state/run/run.models";
import { Store } from "@ngrx/store";
import { AppState } from "@mlaide/state/app.state";
import { exportRuns } from "@mlaide/state/run/run.actions";
import { MatTableDataSource } from "@angular/material/table";

@Component({
  selector: "app-runs-list-table",
  templateUrl: "./runs-list-table.component.html",
  styleUrls: ["./runs-list-table.component.scss"],
})
export class RunsListTableComponent implements OnChanges, OnDestroy {
  @Input() public projectKey: string;
  @Input() public runs$: Observable<Run[]>;
  @Input() public isLoading$: Observable<boolean>;

  public dataSource: MatTableDataSource<Run> = new MatTableDataSource<Run>();
  public displayedColumns: string[] = ["select", "name", "status", "startTime", "runTime", "metrics", "createdBy", "experiments"];
  public hideParameters = true;
  public selection = new SelectionModel<Run>(true, []);

  private runsSubscription: Subscription;

  constructor(
    private store: Store<AppState>,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.runs$) {
      this.unsubscribeRuns();
      this.runsSubscription = this.runs$.subscribe((runs) => this.dataSource.data = runs);
    }
  }

  public ngOnDestroy(): void {
    this.unsubscribeRuns();
  }

  private unsubscribeRuns() {
    if (this.runsSubscription) {
      this.runsSubscription.unsubscribe();
      this.runsSubscription = null;
    }
  }

  /** The label for the checkbox on the passed row */
  public checkboxLabel(row?: Run): string {
    if (!row) {
      return `${this.isAllSelected() ? "select" : "deselect"} all`;
    }
    return `${this.selection.isSelected(row) ? "deselect" : "select"} row ${row.key}`;
  }

  public experimentClicked(experimentRef): void {
    const url = `/projects/${this.projectKey}/experiments/${experimentRef.experimentKey}`;
    this.router.navigate([url]);
  }

  public exportSelectedRuns(): void {
    const runKeys = this.selection.selected.map((run) => run.key);
    this.store.dispatch(exportRuns({ runKeys }));
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
    this.isAllSelected() ? this.selection.clear() : this.dataSource.data.forEach((row) => this.selection.select(row));
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
      this.displayedColumns = ["select", "name", "status", "startTime", "runTime", "metrics", "createdBy", "experiments"];
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
