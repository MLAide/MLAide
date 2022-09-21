import { Component, Input } from "@angular/core";
import { Observable } from "rxjs";
import { Artifact } from "@mlaide/state/artifact/artifact.models";
import { Router } from "@angular/router";

@Component({
  selector: "app-artifacts-list-table",
  templateUrl: "./artifacts-list-table.component.html",
  styleUrls: ["./artifacts-list-table.component.scss"],
})
export class ArtifactsListTableComponent {
  @Input() public projectKey: string;
  @Input() public artifacts$: Observable<Artifact[]>;
  @Input() public isLoading$: Observable<boolean>;

  public displayedColumns: string[] = ["createdAt", "artifactName", "version", "runs", "type"];

  constructor(private router: Router) {}

  public runClicked(runRef: { key: number }): void {
    const url = `/projects/${this.projectKey}/runs/${runRef.key}`;
    this.router.navigate([url]);
  }
}
