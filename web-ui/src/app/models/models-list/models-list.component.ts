import { Component, OnInit } from "@angular/core";
import { Observable} from "rxjs";
import { Store } from "@ngrx/store";
import { selectIsLoadingArtifacts, selectModels } from "@mlaide/state/artifact/artifact.selectors";
import {
  openEditModelDialog,
  openModelStageLogDialog
} from "@mlaide/state/artifact/artifact.actions";
import { Artifact, ModelStage } from "@mlaide/state/artifact/artifact.models";

@Component({
  selector: "app-models-list",
  templateUrl: "./models-list.component.html",
  styleUrls: ["./models-list.component.scss"],
})
export class ModelsListComponent implements OnInit {
  public displayedColumns: string[] = ["modelName", "version", "stage", "runName", "actions"];
  public stages = ModelStage;

  public models$: Observable<Artifact[]>;
  public isLoadingArtifacts$: Observable<boolean>;

  constructor(private readonly store: Store) {}

  ngOnInit() {
    this.models$ = this.store.select(selectModels);
    this.isLoadingArtifacts$ = this.store.select(selectIsLoadingArtifacts);
  }

  public openEditModelDialog(artifact: Artifact) {
    this.store.dispatch(openEditModelDialog({ artifact }));
  }

  public openModelStageLog(artifact: Artifact) {
    this.store.dispatch(openModelStageLogDialog({ modelRevisions: artifact.model.modelRevisions }));
  }
}
