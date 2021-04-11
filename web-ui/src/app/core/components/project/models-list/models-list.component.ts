import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";
import { EditModelComponent } from "./edit-model/edit-model.component";
import { ModelStageLogComponent } from "./model-stage-log/model-stage-log.component";
import {
  Artifact,
  ArtifactListResponse,
  CreateOrUpdateModel,
  ModelStage,
} from "../../../models/artifact.model";
import { ArtifactsApiService } from "../../../services/artifacts-api.service";
import { ListDataSource, SpinnerUiService } from "src/app/core/services";

@Component({
  selector: "app-models-list",
  templateUrl: "./models-list.component.html",
  styleUrls: ["./models-list.component.scss"],
})
export class ModelsListComponent implements OnInit, OnDestroy, AfterViewInit {
  public dataSource: MatTableDataSource<Artifact> = new MatTableDataSource<Artifact>();
  public displayedColumns: string[] = [
    "modelName",
    "version",
    "stage",
    "runName",
    "actions",
  ];
  @ViewChild(MatSort) public sort: MatSort;
  public stages = ModelStage;
  private artifactListDataSource: ListDataSource<ArtifactListResponse>;
  private artifactListSubscription: Subscription;
  private routeParamsSubscription: any;
  private projectKey: string;

  constructor(
    private dialog: MatDialog,
    private artifactsApiService: ArtifactsApiService,
    private route: ActivatedRoute,
    private spinnerService: SpinnerUiService
  ) {}

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    if (this.routeParamsSubscription) {
      this.routeParamsSubscription.unsubscribe();
    }
    if (this.artifactListSubscription) {
      this.artifactListSubscription.unsubscribe();
      this.artifactListSubscription = null;
    }
  }

  ngOnInit() {
    this.routeParamsSubscription = this.route.params.subscribe((params) => {
      this.projectKey = params.projectKey;
      this.artifactListDataSource = this.artifactsApiService.getArtifacts(
        this.projectKey,
        true
      );
      this.artifactListSubscription = this.artifactListDataSource.items$.subscribe(
        (artifacts) => {
          this.dataSource.data = artifacts.items;
        }
      );
    });
  }

  public openEditModelDialog(artifact: Artifact) {
    const dialogRef = this.dialog.open(EditModelComponent, {
      minWidth: "20%",
      data: {
        title: "Edit Model",
        artifact,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.editModel(result);
      }
    });
  }

  public openModelStageLog(artifact: Artifact) {
    this.dialog.open(ModelStageLogComponent, {
      minWidth: "80%",
      data: {
        title: "Model Stage Log",
        modelRevisions: artifact.model.modelRevisions,
      },
    });
  }

  private editModel(result: {
    modelName: string;
    note: string;
    runName: string;
    stage: ModelStage;
    version: number;
  }) {
    const createOrUpdateModel: CreateOrUpdateModel = {
      note: result.note,
      stage: result.stage,
    };

    this.spinnerService.showSpinner();

    const editExperimentObservable = this.artifactsApiService.putModel(
      this.projectKey,
      result.modelName,
      result.version,
      createOrUpdateModel
    );

    const subscription = editExperimentObservable.subscribe(
      (response: any) => {
        subscription.unsubscribe();
        this.spinnerService.stopSpinner();

        this.artifactListDataSource.refresh();
      },
      (error) => {
        console.error(error);
        subscription.unsubscribe();
        this.spinnerService.stopSpinner();
      }
    );
  }
}
