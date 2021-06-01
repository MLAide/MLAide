import { Component, OnDestroy, OnInit } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { ActivatedRoute } from "@angular/router";
import { Observable, Subscription } from "rxjs";
import { ArtifactListResponse } from "@mlaide/entities/artifact.model";
import { SnackbarUiService } from "@mlaide/services/snackbar-ui.service";
import { Run, RunMetrics, RunParameter } from "@mlaide/entities/run.model";
import { ArtifactsApiService, ListDataSource, RunsApiService } from "@mlaide/services";

@Component({
  selector: "app-run-details",
  templateUrl: "./run-details.component.html",
  styleUrls: ["./run-details.component.scss"],
})
export class RunDetailsComponent implements OnInit, OnDestroy {
  public cancledEditNote = false;
  public metrics: RunMetrics[] = [];
  public metricsColumns: string[] = ["metricsKey", "metricsValue"];
  public metricsDataSource: MatTableDataSource<RunParameter> = new MatTableDataSource<RunParameter>();
  public note = "";
  public parameterColumns: string[] = ["parametersKey", "parametersValue"];
  public parameters: RunParameter[] = [];
  public parametersDataSource: MatTableDataSource<RunParameter> = new MatTableDataSource<RunParameter>();
  public run: Run;
  public showButtons = false;
  private routeParamsSubscription: Subscription;
  public projectKey: string;
  private runKey: number;
  public artifactListDataSource: ListDataSource<ArtifactListResponse>;

  constructor(
    private artifactsApiService: ArtifactsApiService,
    private runsApiService: RunsApiService,
    private route: ActivatedRoute,
    private snackBarUiService: SnackbarUiService
  ) {}

  ngOnInit() {
    this.routeParamsSubscription = this.route.params.subscribe((params) => {
      this.projectKey = params.projectKey;
      this.runKey = params.runKey;

      this.runsApiService.getRun(this.projectKey, this.runKey).subscribe((run) => {
        this.run = run;
        if (run.parameters) {
          for (const [key, value] of Object.entries(run.parameters)) {
            this.parameters.push({ key, value });
          }
        }
        if (run.metrics) {
          for (const [key, value] of Object.entries(run.metrics)) {
            this.metrics.push({ key, value });
          }
        }

        this.parametersDataSource.data = this.parameters;
        this.metricsDataSource.data = this.metrics;

        if (run.note) {
          this.note = run.note;
        }

        this.artifactListDataSource = this.artifactsApiService.getArtifactsByRunKeys(this.projectKey, [run.key]);
      });
    });
  }

  ngOnDestroy(): void {
    if (this.routeParamsSubscription) {
      this.routeParamsSubscription.unsubscribe();
    }
  }

  public cancel() {
    this.cancledEditNote = true;
    if (this.run.note) {
      this.note = this.run.note;
    } else {
      this.note = "";
    }
  }

  public focusedNoteTextarea() {
    this.showButtons = true;
  }

  public save() {
    if (this.run.note !== this.note && this.note) {
      this.run.note = this.note;
      const patchRunObservable: Observable<string> = this.runsApiService.updateNoteInRun(
        this.projectKey,
        this.run.key,
        this.run.note
      );

      const subscription: Subscription = patchRunObservable.subscribe(
        (response: any) => {
          this.snackBarUiService.showSuccesfulSnackbar("Successfully saved note!");
          subscription.unsubscribe();
        },
        (error) => {
          this.snackBarUiService.showErrorSnackbar("Error while saving note.");
          subscription.unsubscribe();
        }
      );
    }
  }

  public unfocusedNoteTextarea() {
    this.showButtons = false;
    if (!this.cancledEditNote) {
      this.save();
    }
    this.cancledEditNote = false;
  }
}
