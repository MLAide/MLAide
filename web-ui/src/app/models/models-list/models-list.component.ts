import { Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatSort } from "@angular/material/sort";
import { ActivatedRoute } from "@angular/router";
import { Observable} from "rxjs";
import { Artifact, ModelStage } from "@mlaide/entities/artifact.model";
import { ArtifactsApiService } from "@mlaide/shared/api";
import { Store } from "@ngrx/store";
import { selectIsLoadingArtifacts, selectModels } from "@mlaide/state/artifact/artifact.selectors";
import {
  loadModels,
  openEditModelDialog,
  openModelStageLogDialog
} from "@mlaide/state/artifact/artifact.actions";

@Component({
  selector: "app-models-list",
  templateUrl: "./models-list.component.html",
  styleUrls: ["./models-list.component.scss"],
})
export class ModelsListComponent implements OnInit {
  public displayedColumns: string[] = ["modelName", "version", "stage", "runName", "actions"];
  @ViewChild(MatSort) public sort: MatSort;
  public stages = ModelStage;

  public models$: Observable<Artifact[]>;
  public isLoadingArtifacts$: Observable<boolean>;

  constructor(
    private dialog: MatDialog,
    private artifactsApiService: ArtifactsApiService,
    private route: ActivatedRoute,
    private readonly store: Store
  ) {}

  ngOnInit() {
    this.models$ = this.store.select(selectModels);
    this.isLoadingArtifacts$ = this.store.select(selectIsLoadingArtifacts);

    this.store.dispatch(loadModels());
  }

  public openEditModelDialog(artifact: Artifact) {
    this.store.dispatch(openEditModelDialog({ artifact }));
  }

  public openModelStageLog(artifact: Artifact) {
    this.store.dispatch(openModelStageLogDialog({ modelRevisions: artifact.model.modelRevisions }));
  }
}
