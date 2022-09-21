import { Component, Input } from "@angular/core";
import { Router } from "@angular/router";
import { openEditModelDialog, openModelStageLogDialog } from "@mlaide/state/artifact/artifact.actions";
import { Artifact, ModelStage } from "@mlaide/state/artifact/artifact.models";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";

@Component({
  selector: "app-model-list-table",
  templateUrl: "./model-list-table.component.html",
  styleUrls: ["./model-list-table.component.scss"],
})
export class ModelListTableComponent {
  public displayedColumns: string[] = ["modelName", "version", "stage", "runs", "actions"];
  public stages = ModelStage;

  @Input() public projectKey: string;
  @Input() public models$: Observable<Artifact[]>;
  @Input() public isLoading$: Observable<boolean>;

  constructor(private readonly router: Router, private readonly store: Store) {}

  public runClicked(runRef: { key: number }): void {
    const url = `/projects/${this.projectKey}/runs/${runRef.key}`;
    this.router.navigate([url]);
  }

  public openEditModelDialog(artifact: Artifact) {
    this.store.dispatch(openEditModelDialog({ artifact }));
  }

  public openModelStageLog(artifact: Artifact) {
    this.store.dispatch(openModelStageLogDialog({ modelRevisions: artifact.model.modelRevisions }));
  }
}
