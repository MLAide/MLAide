import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { Store } from "@ngrx/store";
import { openEditExperimentDialog } from "@mlaide/state/experiment/experiment.actions";
import { selectExperiments, selectIsLoadingExperiments } from "@mlaide/state/experiment/experiment.selectors";
import { selectCurrentProjectKey } from "@mlaide/state/project/project.selectors";
import { Experiment } from "@mlaide/state/experiment/experiment.models";

@Component({
  selector: "app-experiments-list",
  templateUrl: "./experiments-list.component.html",
  styleUrls: ["./experiments-list.component.scss"],
})
export class ExperimentsListComponent implements OnInit {
  public isLoading$: Observable<boolean>;
  public experiments$: Observable<Experiment[]>;
  public projectKey$: Observable<string>;
  public displayedColumns: string[] = ["key", "name", "tags", "actions"];

  constructor(private store: Store) {}

  ngOnInit() {
    this.isLoading$ = this.store.select(selectIsLoadingExperiments);
    this.experiments$ = this.store.select(selectExperiments);
    this.projectKey$ = this.store.select(selectCurrentProjectKey);
  }

  openEditExperimentDialog(experiment: Experiment) {
    this.store.dispatch(openEditExperimentDialog({
      title: "Edit Experiment",
      experiment: experiment
    }));
  }
}
