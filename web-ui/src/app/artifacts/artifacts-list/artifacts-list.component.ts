import { Component, OnInit } from "@angular/core";
import { Artifact } from "@mlaide/state/artifact/artifact.models";
import { selectArtifacts, selectIsLoadingArtifacts } from "@mlaide/state/artifact/artifact.selectors";
import { selectCurrentProjectKey } from "@mlaide/state/project/project.selectors";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";

@Component({
  selector: "app-artifacts-list",
  templateUrl: "./artifacts-list.component.html",
  styleUrls: ["./artifacts-list.component.scss"],
})
export class ArtifactsListComponent implements OnInit {
  public artifacts$: Observable<Artifact[]>;
  public isLoadingArtifacts$: Observable<boolean>;
  public projectKey$: Observable<string>;

  constructor(private store: Store) {}

  ngOnInit() {
    this.artifacts$ = this.store.select(selectArtifacts);
    this.projectKey$ = this.store.select(selectCurrentProjectKey);
    this.isLoadingArtifacts$ = this.store.select(selectIsLoadingArtifacts);
  }
}
