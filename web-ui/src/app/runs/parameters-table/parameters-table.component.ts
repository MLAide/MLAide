import { Component, Input } from "@angular/core";
import { Observable } from "rxjs";
import { RunParameter } from "@mlaide/state/run/run.models";

@Component({
  selector: 'app-parameters-table',
  templateUrl: './parameters-table.component.html',
  styleUrls: ['./parameters-table.component.scss']
})
export class ParametersTableComponent {
  @Input()
  public parameters$: Observable<RunParameter[]>;
  public parameterColumns: string[] = ["parametersKey", "parametersValue"];
}
