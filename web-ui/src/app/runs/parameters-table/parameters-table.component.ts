import { Component, Input, OnChanges, OnInit, SimpleChanges } from "@angular/core";
import { Observable, Subscription } from "rxjs";
import { RunParameter } from "@mlaide/state/run/run.models";
import { MatTableDataSource } from "@angular/material/table";

@Component({
  selector: 'app-parameters-table',
  templateUrl: './parameters-table.component.html',
  styleUrls: ['./parameters-table.component.scss']
})
export class ParametersTableComponent implements OnChanges {
  @Input()
  public parameters$: Observable<RunParameter[]>;
  public parameterColumns: string[] = ["parametersKey", "parametersValue"];
  public dataSource: MatTableDataSource<RunParameter> = new MatTableDataSource<RunParameter>();
  private parametersSubscription: Subscription;

  constructor() { }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.parameters$) {
      this.unsubscribeParameters();
      this.parametersSubscription = this.parameters$.subscribe((parameters) => this.dataSource.data = parameters);
    }
  }

  public ngOnDestroy(): void {
    this.unsubscribeParameters();
  }

  private unsubscribeParameters() {
    if (this.parametersSubscription) {
      this.parametersSubscription.unsubscribe();
      this.parametersSubscription = null;
    }
  }
}
