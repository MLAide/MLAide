import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import {  Subscription } from "rxjs";
import { Experiment, ExperimentStatus } from "@mlaide/entities/experiment.model";
import { Store } from "@ngrx/store";
import {
  loadExperiments,
  openAddOrEditExperimentDialog
} from "@mlaide/state/experiment/experiment.actions";
import { selectExperiments } from "@mlaide/state/experiment/experiment.selectors";
import { selectCurrentProjectKey } from "@mlaide/state/project/project.selectors";

@Component({
  selector: "app-experiments-list",
  templateUrl: "./experiments-list.component.html",
  styleUrls: ["./experiments-list.component.scss"],
})
export class ExperimentsListComponent implements OnInit, OnDestroy, AfterViewInit {
  public dataSource: MatTableDataSource<Experiment> = new MatTableDataSource<Experiment>();
  public displayedColumns: string[] = ["key", "name", "status", "tags", "actions"];

  public projectKey: string;
  @ViewChild(MatSort) public sort: MatSort;
  private experimentListSubscription: Subscription;

  constructor(private store: Store) {}

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy() {
    if (this.experimentListSubscription) {
      this.experimentListSubscription.unsubscribe();
      this.experimentListSubscription = null;
    }
  }

  ngOnInit() {
    this.store.dispatch(loadExperiments());

    this.experimentListSubscription = this.store.select(selectExperiments).subscribe((experiments) => this.dataSource.data = experiments);

    this.store.select(selectCurrentProjectKey).subscribe((projectKey) => this.projectKey = projectKey);
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
