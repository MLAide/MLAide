import { AfterViewInit, Component, Inject, OnInit, ViewChild } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { ModelRevision } from "@mlaide/entities/artifact.model";

@Component({
  selector: "app-model-stage-log",
  templateUrl: "./model-stage-log.component.html",
  styleUrls: ["./model-stage-log.component.scss"],
})
export class ModelStageLogComponent implements OnInit, AfterViewInit {
  public dataSource: MatTableDataSource<ModelRevision> = new MatTableDataSource<ModelRevision>();
  public displayedColumns: string[] = ["createdAt", "createdBy", "oldStage", "newStage", "note"];
  @ViewChild(MatSort) sort: MatSort;
  private modelRevisions: ModelRevision[];

  constructor(
    private dialogRef: MatDialogRef<ModelStageLogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { modelRevisions: ModelRevision[]; title: string }
  ) {
    this.modelRevisions = data.modelRevisions;
  }

  close() {
    this.dialogRef.close();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  ngOnInit(): void {
    this.dataSource.data = this.modelRevisions;
  }
}
