import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { Run, RunMetrics, RunParameter } from "@mlaide/entities/run.model";
import { AppState } from "@mlaide/state/app.state";
import { Store } from "@ngrx/store";
import { selectCurrentRun } from "@mlaide/state/run/run.selectors";
import { selectArtifactsOfCurrentRun } from "@mlaide/state/artifact/artifact.selectors";
import { editRunNote, loadCurrentRun } from "@mlaide/state/run/run.actions";
import { loadArtifactsOfCurrentRun } from "@mlaide/state/artifact/artifact.actions";
import { Artifact } from "@mlaide/state/artifact/artifact.models";
import { filter, map } from "rxjs/operators";
import { selectCurrentProjectKey } from "@mlaide/state/project/project.selectors";

@Component({
  selector: "app-run-details",
  templateUrl: "./run-details.component.html",
  styleUrls: ["./run-details.component.scss"],
})
export class RunDetailsComponent implements OnInit {
  public run$: Observable<Run>;
  public artifacts$: Observable<Artifact[]>;
  public projectKey$: Observable<string>;
  public parameters$: Observable<RunParameter[]>;
  public metrics$: Observable<RunMetrics[]>;

  constructor(private store: Store<AppState>) {}

  public ngOnInit() {
    this.run$ = this.store.select(selectCurrentRun);
    this.artifacts$ = this.store.select(selectArtifactsOfCurrentRun);
    this.projectKey$ = this.store.select(selectCurrentProjectKey);
    this.parameters$ = this.run$.pipe(
      filter(run => !!run), // only continue if run has value
      map(run => run.parameters),
      filter(parameters => !!parameters), // only continue if parameters has value
      map(parameters =>
        Object.entries(parameters).map(([key, value]) =>
          ({
            key: key,
            value: value
          })
        )
      )
    );
    this.metrics$ = this.run$.pipe(
      filter(run => !!run), // only continue if run has value
      map(run => run.metrics),
      filter(metrics => !!metrics), // only continue if metrics has value
      map(metrics =>
        Object.entries(metrics).map(([key, value]) =>
          ({
            key: key,
            value: value
          })
        )
      )
    );

    this.store.dispatch(loadCurrentRun());
    this.store.dispatch(loadArtifactsOfCurrentRun());
  }

  public updateNote(note: string) {
    this.store.dispatch(editRunNote({ note }));
  }
}
