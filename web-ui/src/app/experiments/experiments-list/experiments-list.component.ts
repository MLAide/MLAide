import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { Experiment, ExperimentStatus } from "@mlaide/entities/experiment.model";
import { Store } from "@ngrx/store";
import { loadExperiments, openAddOrEditExperimentDialog } from "@mlaide/state/experiment/experiment.actions";
import { selectExperiments, selectIsLoadingExperiments } from "@mlaide/state/experiment/experiment.selectors";
import { selectCurrentProjectKey } from "@mlaide/state/project/project.selectors";

@Component({
  selector: "app-experiments-list",
  templateUrl: "./experiments-list.component.html",
  styleUrls: ["./experiments-list.component.scss"],
})
export class ExperimentsListComponent implements OnInit {
  public isLoading$: Observable<boolean>;
  public experiments$: Observable<Experiment[]>;
  public projectKey$: Observable<string>;
  public displayedColumns: string[] = ["key", "name", "status", "tags", "actions"];

  constructor(private store: Store) {}

  ngOnInit() {
    this.store.dispatch(loadExperiments());

    this.isLoading$ = this.store.select(selectIsLoadingExperiments);

    this.experiments$ = this.store.select(selectExperiments);

    this.projectKey$ = this.store.select(selectCurrentProjectKey);
  }

  openCreateExperimentDialog(): void {
    this.store.dispatch(openAddOrEditExperimentDialog({
      title: "Add Experiment",
      experiment: {
        name: "",
        key: "",
        tags: [],
        status: ExperimentStatus.TODO,
      },
      isEditMode: false
    }));
  }

  openEditExperimentDialog(experiment: Experiment) {
    this.store.dispatch(openAddOrEditExperimentDialog({
      title: "Edit Experiment",
      experiment: experiment,
      isEditMode: true
    }));
  }
}
