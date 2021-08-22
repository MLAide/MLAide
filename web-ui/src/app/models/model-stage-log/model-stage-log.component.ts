import { Component, Inject, } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Store } from "@ngrx/store";
import { AppState } from "@mlaide/state/app.state";
import { closeModelStageLogDialog } from "@mlaide/state/artifact/artifact.actions";
import { ModelRevision } from "@mlaide/state/artifact/artifact.models";

@Component({
  selector: "app-model-stage-log",
  templateUrl: "./model-stage-log.component.html",
  styleUrls: ["./model-stage-log.component.scss"],
})
export class ModelStageLogComponent {
  public displayedColumns: string[] = ["createdAt", "createdBy", "oldStage", "newStage", "note"];
  public readonly modelRevisions: ModelRevision[];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { modelRevisions: ModelRevision[]; title: string },
    private store: Store<AppState>
  ) {
    this.modelRevisions = data.modelRevisions;
  }

  close() {
    this.store.dispatch(closeModelStageLogDialog());
  }
}
