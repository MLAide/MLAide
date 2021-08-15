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
  // TODO Raman: Warum wird hier das Select ausgeführt und nicht im ngOnInit?
  public run$: Observable<Run> = this.store.select(selectCurrentRun);
  public artifacts$: Observable<Artifact[]> = this.store.select(selectArtifactsOfCurrentRun);
  public projectKey$: Observable<string> = this.store.select(selectCurrentProjectKey);

  public parameters$: Observable<RunParameter[]> = this.run$.pipe(
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

  public metrics$: Observable<RunMetrics[]> = this.run$.pipe(
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

  constructor(private store: Store<AppState>) {}

  public ngOnInit() {
    this.store.dispatch(loadCurrentRun());
    this.store.dispatch(loadArtifactsOfCurrentRun());
  }

  public updateNote(note: string) {
    this.store.dispatch(editRunNote({ note }));
  }
}
