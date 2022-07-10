import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { Store } from "@ngrx/store";
import { selectIsLoadingArtifacts, selectModels } from "@mlaide/state/artifact/artifact.selectors";
import { Artifact } from "@mlaide/state/artifact/artifact.models";
import { selectCurrentProjectKey } from "@mlaide/state/project/project.selectors";

@Component({
  selector: "app-models-list",
  templateUrl: "./models-list.component.html",
  styleUrls: ["./models-list.component.scss"],
})
export class ModelsListComponent implements OnInit {
  public projectKey$: Observable<string>;
  public models$: Observable<Artifact[]>;
  public isLoadingArtifacts$: Observable<boolean>;

  constructor(private readonly store: Store) {}

  ngOnInit() {
    this.projectKey$ = this.store.select(selectCurrentProjectKey);
    this.models$ = this.store.select(selectModels);
    this.isLoadingArtifacts$ = this.store.select(selectIsLoadingArtifacts);
  }
}
