import { Component, OnInit } from "@angular/core";
import { selectCurrentProjectKey } from "@mlaide/state/project/project.selectors";
import { Run } from "@mlaide/state/run/run.models";
import { selectIsLoadingRuns, selectRuns } from "@mlaide/state/run/run.selectors";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";

@Component({
  selector: "app-runs-list",
  templateUrl: "./runs-list.component.html",
  styleUrls: ["./runs-list.component.scss"],
})
export class RunsListComponent implements OnInit {
  public runs$: Observable<Run[]>;
  public isLoadingRuns$: Observable<boolean>;
  public projectKey$: Observable<string>;

  constructor(private store: Store) {}

  ngOnInit() {
    this.runs$ = this.store.select(selectRuns);
    this.projectKey$ = this.store.select(selectCurrentProjectKey);
    this.isLoadingRuns$ = this.store.select(selectIsLoadingRuns);
  }
}
