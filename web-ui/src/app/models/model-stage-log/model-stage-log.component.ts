import { Component, Inject, } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { ModelRevision } from "@mlaide/entities/artifact.model";

@Component({
  selector: "app-model-stage-log",
  templateUrl: "./model-stage-log.component.html",
  styleUrls: ["./model-stage-log.component.scss"],
})
export class ModelStageLogComponent {
  public displayedColumns: string[] = ["createdAt", "createdBy", "oldStage", "newStage", "note"];
  public readonly modelRevisions: ModelRevision[];

  constructor(
    private dialogRef: MatDialogRef<ModelStageLogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { modelRevisions: ModelRevision[]; title: string }
  ) {
    this.modelRevisions = data.modelRevisions;
  }

  close() {
    this.dialogRef.close();
  }
}
