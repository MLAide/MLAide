import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { CreateOrUpdateExperimentComponent } from './create-or-update-experiment/create-or-update-experiment.component';
import { Experiment, ExperimentListResponse, ExperimentStatus } from '../../../models/experiment.model';
import { ExperimentsApiService, ListDataSource, SpinnerUiService } from '../../../services';

@Component({
  selector: 'app-experiments-list',
  templateUrl: './experiments-list.component.html',
  styleUrls: ['./experiments-list.component.scss']
})
export class ExperimentsListComponent implements OnInit, OnDestroy, AfterViewInit {
  public dataSource: MatTableDataSource<Experiment> = new MatTableDataSource<Experiment>();
  public displayedColumns: string[] = ['key', 'name', 'status', 'tags', 'actions'];

  public experimentStatus = ExperimentStatus;
  public projectKey: string;
  @ViewChild(MatSort) public sort: MatSort;
  private experimentListDataSource: ListDataSource<ExperimentListResponse>;
  private experimentListSubscription: Subscription;
  private routeParamsSubscription: any;

  constructor(private dialog: MatDialog,
    private experimentsApiService: ExperimentsApiService,
    private route: ActivatedRoute,
    private spinnerUiService: SpinnerUiService) { }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy() {
    this.routeParamsSubscription.unsubscribe();

    if (this.experimentListSubscription) {
      this.experimentListSubscription.unsubscribe();
      this.experimentListSubscription = null;
    }
  }

  ngOnInit() {
    this.routeParamsSubscription = this.route.params.subscribe(params => {
      this.projectKey = params.projectKey;
      this.experimentListDataSource = this.experimentsApiService.getExperiments(this.projectKey);
      this.experimentListSubscription =
        this.experimentListDataSource.items$.subscribe(experiments => {
          this.dataSource.data = experiments.items;
        });
    });
  }

  openCreateExperimentDialog(): void {
    const dialogRef = this.dialog.open(CreateOrUpdateExperimentComponent, {
      minWidth: '20%',
      data: {
        // TODO: i18n
        title: 'Add Experiment',
        experiment: {
          name: '',
          key: '',
          tags: [],
          status: ExperimentStatus.TODO,
        },
        keyEditable: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.createNewExperiment(result);
      }
    });
  }

  openEditExperimentDialog(experiment: Experiment) {
    const dialogRef = this.dialog.open(CreateOrUpdateExperimentComponent, {
      minWidth: '20%',
      data: {
        // TODO: i18n
        title: 'Edit Experiment',
        experiment,
        keyReadonly: true,
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.editExperiment(result);
      }
    });
  }

  private createNewExperiment(experiment: Experiment) {
    this.spinnerUiService.showSpinner();

    const createExperimentObservable = this.experimentsApiService.addExperiment(this.projectKey, experiment);

    this.createOrEditExperiment(createExperimentObservable);
  }

  private editExperiment(experiment: Experiment) {
    this.spinnerUiService.showSpinner();

    const editExperimentObservable = this.experimentsApiService.patchExperiment(this.projectKey, experiment.key, experiment);

    this.createOrEditExperiment(editExperimentObservable);
  }

  private createOrEditExperiment(observable: Observable<Experiment>) {
    const subscription = observable.subscribe(
      (response: any) => {
        subscription.unsubscribe();
        this.spinnerUiService.stopSpinner();

        this.experimentListDataSource.refresh();
      },
      (error) => {
        console.error(error);
        subscription.unsubscribe();
        this.spinnerUiService.stopSpinner();
      }
    );
  }
}
