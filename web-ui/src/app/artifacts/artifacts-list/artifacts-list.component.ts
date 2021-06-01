import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ArtifactListResponse } from "@mlaide/entities/artifact.model";
import { ArtifactsApiService, ListDataSource } from "@mlaide/services";

@Component({
  selector: "app-artifacts-list",
  templateUrl: "./artifacts-list.component.html",
  styleUrls: ["./artifacts-list.component.scss"],
})
export class ArtifactsListComponent implements OnInit, OnDestroy {
  public artifactListDataSource: ListDataSource<ArtifactListResponse>;

  public projectKey: string;
  private routeParamsSubscription: any;

  constructor(private artifactsApiService: ArtifactsApiService, private route: ActivatedRoute) {}

  ngOnDestroy(): void {
    if (this.routeParamsSubscription) {
      this.routeParamsSubscription.unsubscribe();
    }
  }

  ngOnInit() {
    this.routeParamsSubscription = this.route.params.subscribe((params) => {
      this.projectKey = params.projectKey;
      this.artifactListDataSource = this.artifactsApiService.getArtifacts(this.projectKey, false);
    });
  }
}
