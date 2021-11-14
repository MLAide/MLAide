import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { select, Store } from "@ngrx/store";
import { selectCurrentExperiment } from "@mlaide/state/experiment/experiment.selectors";
import { selectCurrentProjectKey } from "@mlaide/state/project/project.selectors";
import { selectIsLoadingRuns, selectRunsOfCurrentExperiment } from "@mlaide/state/run/run.selectors";
import { selectArtifactsByRunKeys, selectIsLoadingArtifacts } from "@mlaide/state/artifact/artifact.selectors";
import { Artifact } from "@mlaide/state/artifact/artifact.models";
import { Experiment } from "@mlaide/state/experiment/experiment.models";
import { Run } from "@mlaide/state/run/run.models";

@Component({
  selector: "app-experiment-details",
  templateUrl: "./experiment-details.component.html",
  styleUrls: ["./experiment-details.component.scss"],
})
export class ExperimentDetailsComponent implements OnInit {

  public artifacts$: Observable<Artifact[]>;
  public experiment$: Observable<Experiment>;
  public projectKey$: Observable<string>;
  public runs$: Observable<Run[]>;
  public isLoadingRuns$: Observable<boolean>;
  public isLoadingArtifacts$: Observable<boolean>;

  constructor(private store: Store) { }

  ngOnInit(): void {
    this.experiment$ = this.store.select(selectCurrentExperiment);
    this.projectKey$ = this.store.select(selectCurrentProjectKey);
    this.runs$ = this.store.select(selectRunsOfCurrentExperiment);
    this.artifacts$ = this.store.select(selectArtifactsByRunKeys);
    this.isLoadingRuns$ = this.store.pipe(select(selectIsLoadingRuns));
    this.isLoadingArtifacts$ = this.store.select(selectIsLoadingArtifacts);
  }
}
