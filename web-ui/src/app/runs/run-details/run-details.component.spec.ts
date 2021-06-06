import { HarnessLoader } from "@angular/cdk/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MatButtonModule } from "@angular/material/button";
import { MatChipsModule } from "@angular/material/chips";
import { MatChipHarness, MatChipListHarness } from "@angular/material/chips/testing";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSortModule } from "@angular/material/sort";
import { MatTableModule } from "@angular/material/table";
import { MatHeaderRowHarness, MatRowHarness, MatRowHarnessColumnsText, MatTableHarness } from "@angular/material/table/testing";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { MockComponent, MockPipe } from "ng-mocks";
import { TimeAgoPipe } from "ngx-moment";
import { EMPTY, Observable, of, Subject, Subscription } from "rxjs";
import { Artifact, ArtifactListResponse } from "@mlaide/entities/artifact.model";
import { Project } from "@mlaide/entities/project.model";
import { Run } from "@mlaide/entities/run.model";
import { ArtifactsApiService, RunsApiService, SnackbarUiService } from "@mlaide/shared/services";
import { ListDataSourceMock } from "src/app/mocks/data-source.mock";
import { getRandomArtifacts, getRandomProject, getRandomRun } from "src/app/mocks/fake-generator";
import { DurationPipe } from "../../shared/pipes/duration.pipe";
import { ArtifactsTreeComponent } from "../artifacts-tree/artifacts-tree.component";
import { RunDetailsComponent } from "./run-details.component";
import { RunStatusI18nComponent } from "src/app/shared/components/run-status-i18n/run-status-i18n.component";

describe("RunDetailsComponent", () => {
  let component: RunDetailsComponent;
  let fixture: ComponentFixture<RunDetailsComponent>;

  // fakes
  let fakeArtifacts: Artifact[];
  let fakeProject: Project;
  let fakeRun: Run;

  // route spy
  let unsubscriptionSpy: jasmine.Spy<() => void>;

  // service stubs
  let artifactsApiServiceStub: jasmine.SpyObj<ArtifactsApiService>;
  let runsApiServiceStub: jasmine.SpyObj<RunsApiService>;
  let snackBarUiServiceStub: jasmine.SpyObj<SnackbarUiService>;

  // data source mocks
  let artifactListDataSourceMock: ListDataSourceMock<Artifact, ArtifactListResponse> = new ListDataSourceMock();

  afterEach(() => {
    artifactListDataSourceMock.emulate([]);
  });

  it("should create", async () => {
    // arrange
    await setupStubsAndMocks();

    // assert
    expect(component).toBeTruthy();
  });

  describe("ngOnInit", () => {
    describe("parameters, metrics and note are set", async () => {
      beforeEach(async () => {
        await setupStubsAndMocks();
      });
      it("should load set project key from active route", async () => {
        // arrange + act in beforeEach

        // assert
        expect(component.projectKey).toBe(fakeProject.key);
      });

      it("should load run with projectKey and runKey defined in active route", async () => {
        // arrange + act in beforeEach

        // assert
        expect(component.run).toBe(fakeRun);
        expect(runsApiServiceStub.getRun).toHaveBeenCalledWith(fakeProject.key, fakeRun.key);
      });

      it("should push run's parameters into component's parameter variable", async () => {
        // arrange + act in beforeEach

        // assert
        // We can do this because the faker generates hard coded parameters
        expect(component.parameters[0].key).toEqual("mae");
        expect(component.parameters[0].value).toEqual(fakeRun.parameters.mae);
        expect(component.parameters[1].key).toEqual("r2");
        expect(component.parameters[1].value).toEqual(fakeRun.parameters.r2);
        expect(component.parameters[2].key).toEqual("rmse");
        expect(component.parameters[2].value).toEqual(fakeRun.parameters.rmse);
        expect(component.parameters[3].key).toEqual("number");
        expect(component.parameters[3].value).toEqual(fakeRun.parameters.number);
        expect(component.parameters[4].key).toEqual("bool");
        expect(component.parameters[4].value).toEqual(fakeRun.parameters.bool);
      });

      it("should push run's metrics into component's metrics variable", async () => {
        // arrange + act in beforeEach

        // assert
        // We can do this because the faker generates hard coded parameters
        expect(component.metrics[0].key).toEqual("mae");
        expect(component.metrics[0].value).toEqual(fakeRun.metrics.mae);
        expect(component.metrics[1].key).toEqual("r2");
        expect(component.metrics[1].value).toEqual(fakeRun.metrics.r2);
        expect(component.metrics[2].key).toEqual("rmse");
        expect(component.metrics[2].value).toEqual(fakeRun.metrics.rmse);
        expect(component.metrics[3].key).toEqual("number");
        expect(component.metrics[3].value).toEqual(fakeRun.metrics.number);
        expect(component.metrics[4].key).toEqual("bool");
        expect(component.metrics[4].value).toEqual(fakeRun.metrics.bool);
      });

      it("should set parameters to parametersDataSource data", async () => {
        // arrange + act in beforeEach

        // assert
        // We can do this because the faker generates hard coded parameters
        expect(component.parametersDataSource.data).toEqual(component.parameters);
      });

      it("should set metrics to metricsDataSource data", async () => {
        // arrange + act in beforeEach

        // assert
        // We can do this because the faker generates hard coded parameters
        expect(component.metricsDataSource.data).toEqual(component.metrics);
      });

      it("should set note to component's note", async () => {
        // arrange + act in beforeEach

        // assert
        // We can do this because the faker generates hard coded parameters
        expect(component.note).toEqual(fakeRun.note);
      });

      it("should load artifacts with projectKey and runKey defined in active route", async () => {
        // arrange + act in beforeEach

        // assert
        expect(component.artifactListDataSource).toBe(artifactListDataSourceMock);
        expect(artifactsApiServiceStub.getArtifactsByRunKeys).toHaveBeenCalledWith(fakeProject.key, [fakeRun.key]);
      });
    });

    describe("parameters, metrics and note are not set", async () => {
      it("should not push run's parameters into component's parameters variable if parameters are undefined", async () => {
        // arrange
        const customFakeRun = await getRandomRun();
        customFakeRun.parameters = undefined;
        await setupStubsAndMocks(customFakeRun);

        // assert
        expect(component.parameters).toEqual([]);
      });

      it("should not push run's metrics into component's metrics variable if metrics are undefined", async () => {
        // arrange
        const customFakeRun = await getRandomRun();
        customFakeRun.metrics = undefined;
        await setupStubsAndMocks(customFakeRun);

        // assert
        expect(component.metrics).toEqual([]);
      });

      it("should set note to component's note", async () => {
        // arrange
        const customFakeRun = await getRandomRun();
        customFakeRun.note = undefined;
        await setupStubsAndMocks(customFakeRun);

        // assert
        // We can do this because the faker generates hard coded parameters
        expect(component.note).toEqual("");
      });
    });

    describe("ngOnDestroy", () => {
      it("should unsubscribe from routeParamsSubscription", async () => {
        // arrange
        await setupStubsAndMocks();

        // act
        component.ngOnDestroy();

        // assert
        expect(unsubscriptionSpy).toHaveBeenCalled();
      });
    });

    describe("cancel", () => {
      it("should set component's cancledEditNote to true", async () => {
        // arrange
        await setupStubsAndMocks();

        // act
        component.cancel();

        // assert
        expect(component.cancledEditNote).toBeTruthy();
      });

      it("should set component's note to initial run note if not undefined", async () => {
        // arrange
        await setupStubsAndMocks();
        component.note = "test note";

        // act
        component.cancel();

        // assert
        expect(component.note).toEqual(fakeRun.note);
      });

      it("should set component's note to empty if run note is undefined", async () => {
        // arrange
        const customFakeRun = await getRandomRun();
        customFakeRun.note = undefined;
        await setupStubsAndMocks(customFakeRun);
        component.note = "test note";

        // act
        component.cancel();

        // assert
        expect(component.note).toEqual("");
      });
    });

    describe("focusedNoteTextarea", () => {
      it("should set component's showButtons to true", async () => {
        // arrange
        await setupStubsAndMocks();

        // act
        component.focusedNoteTextarea();

        // assert
        expect(component.showButtons).toBeTruthy();
      });
    });
    describe("save", () => {
      beforeEach(async () => {
        await setupStubsAndMocks();
      });
      describe("with new note", () => {
        it("should set component's note to run note call updateNoteInRun with project key, run key and note", async () => {
          // arrange + act also in beforeEach
          component.note = "test note";
          runsApiServiceStub.updateNoteInRun.and.returnValue(EMPTY);

          // act
          component.save();

          // assert
          expect(runsApiServiceStub.updateNoteInRun).toHaveBeenCalledWith(fakeProject.key, fakeRun.key, fakeRun.note);
        });

        it("should display snackbar with success message if note was saved", async () => {
          // arrange + act also in beforeEach
          component.note = "test note";
          const subject = new Subject<string>();
          runsApiServiceStub.updateNoteInRun.and.returnValue(subject.asObservable());

          // act
          component.save();
          subject.next();

          // assert
          expect(snackBarUiServiceStub.showSuccesfulSnackbar).toHaveBeenCalledWith("Successfully saved note!");
        });

        it("should display snackbar with error message if note could not be saved", async () => {
          // arrange + act also in beforeEach
          component.note = "test note";
          const subject = new Subject<string>();
          runsApiServiceStub.updateNoteInRun.and.returnValue(subject.asObservable());

          // act
          component.save();
          subject.error("This is a test error thrown in run-details.component.spec.ts");

          // assert
          expect(snackBarUiServiceStub.showErrorSnackbar).toHaveBeenCalledWith("Error while saving note.");
        });
      });
      describe("without new note or undefined", () => {
        it("should not not call updateNoteInRun, showSuccesfulSnackbar and showErrorSnackbar if component's note was not changed", async () => {
          // arrange + act also in beforeEach
          runsApiServiceStub.updateNoteInRun.and.returnValue(EMPTY);

          // act
          component.save();

          // assert
          expect(runsApiServiceStub.updateNoteInRun).not.toHaveBeenCalled();
          expect(snackBarUiServiceStub.showSuccesfulSnackbar).not.toHaveBeenCalled();
          expect(snackBarUiServiceStub.showErrorSnackbar).not.toHaveBeenCalled();
        });

        it("should not not call updateNoteInRun, showSuccesfulSnackbar and showErrorSnackbar if component's note is undefined", async () => {
          // arrange + act also in beforeEach
          component.note = undefined;
          runsApiServiceStub.updateNoteInRun.and.returnValue(EMPTY);

          // act
          component.save();

          // assert
          expect(runsApiServiceStub.updateNoteInRun).not.toHaveBeenCalled();
          expect(snackBarUiServiceStub.showSuccesfulSnackbar).not.toHaveBeenCalled();
          expect(snackBarUiServiceStub.showErrorSnackbar).not.toHaveBeenCalled();
        });

        it("should not not call updateNoteInRun, showSuccesfulSnackbar and showErrorSnackbar if component's note is null", async () => {
          // arrange + act also in beforeEach
          component.note = null;
          runsApiServiceStub.updateNoteInRun.and.returnValue(EMPTY);

          // act
          component.save();

          // assert
          expect(runsApiServiceStub.updateNoteInRun).not.toHaveBeenCalled();
          expect(snackBarUiServiceStub.showSuccesfulSnackbar).not.toHaveBeenCalled();
          expect(snackBarUiServiceStub.showErrorSnackbar).not.toHaveBeenCalled();
        });
      });
    });

    describe("unfocusedNoteTextarea", () => {
      beforeEach(async () => {
        await setupStubsAndMocks();
      });
      it("should set component's showButtons to false", async () => {
        // arrange + act in beforeEach

        // act
        component.unfocusedNoteTextarea();

        // assert
        expect(component.showButtons).toBeFalsy();
      });

      it("should call save if component's cancledEditNote is false", async () => {
        // arrange + act also in beforeEach
        const spy = spyOn(component, "save").and.callThrough();

        // act
        component.unfocusedNoteTextarea();

        // assert
        expect(spy).toHaveBeenCalled();
      });

      it("should not call save if component's cancledEditNote is true", async () => {
        // arrange + act also in beforeEach
        const spy = spyOn(component, "save").and.callThrough();
        component.cancledEditNote = true;

        // act
        component.unfocusedNoteTextarea();

        // assert
        expect(spy).not.toHaveBeenCalled();
      });

      it("should set component's cancledEditNote to false", async () => {
        // arrange + act in beforeEach

        // act
        component.unfocusedNoteTextarea();

        // assert
        expect(component.cancledEditNote).toBeFalsy();
      });
    });

    describe("component rendering", () => {
      let loader: HarnessLoader;

      beforeEach(async () => {
        await setupStubsAndMocks();
        loader = TestbedHarnessEnvironment.loader(fixture);
      });

      it("should contain components title", async () => {
        // arrange + act also in beforeEach
        let h1: HTMLElement = fixture.nativeElement.querySelector("h1");

        // assert
        expect(h1.textContent).toEqual(fakeRun.name);
      });

      describe("meta data", () => {
        it("should contain meta data title", async () => {
          // arrange + act also in beforeEach
          let h3: HTMLElement = fixture.nativeElement.querySelector("h3");

          // assert
          expect(h3.textContent).toEqual("Meta data");
        });

        it("should contain author label and value", async () => {
          // arrange + act also in beforeEach
          let label: HTMLElement = fixture.nativeElement.querySelector("#author-label");
          let value: HTMLElement = fixture.nativeElement.querySelector("#author-value");

          // assert
          expect(label.textContent).toEqual("Author");
          expect(value.textContent).toEqual(fakeRun.createdBy.nickName);
        });

        it("should contain status label and value", async () => {
          // arrange + act also in beforeEach
          let label: HTMLElement = fixture.nativeElement.querySelector("#status-label");
          let value: HTMLElement = fixture.nativeElement.querySelector("#status-value");

          // assert
          expect(label.textContent).toEqual("Status");
          expect(value.textContent.toUpperCase().trim().replace(" ", "_")).toEqual(fakeRun.status);
        });

        it("should contain start time label and value", async () => {
          // arrange + act also in beforeEach
          let label: HTMLElement = fixture.nativeElement.querySelector("#start-time-label");
          let value: HTMLElement = fixture.nativeElement.querySelector("#start-time-value");

          // assert
          expect(label.textContent).toEqual("Start Time");
          expect(value.textContent).toEqual(String(fakeRun.startTime));
        });

        it("should contain run time label and value", async () => {
          // arrange + act also in beforeEach
          let label: HTMLElement = fixture.nativeElement.querySelector("#run-time-label");
          let value: HTMLElement = fixture.nativeElement.querySelector("#run-time-value");

          // assert
          expect(label.textContent).toEqual("Run Time");
          // This must be startTime because mock returns first parameter which is start time
          expect(value.textContent).toEqual(String(fakeRun.startTime));
        });

        it("should contain run time label and '-' as value if run endtime is undefined", async () => {
          // arrange + act also in beforeEach
          fakeRun.endTime = undefined;
          fixture.detectChanges();
          let label: HTMLElement = fixture.nativeElement.querySelector("#run-time-label");
          let value: HTMLElement = fixture.nativeElement.querySelector("#run-time-value");

          // assert
          expect(label.textContent).toEqual("Run Time");
          expect(value.textContent).toEqual("-");
        });

        it("should contain run time label and '-' as value if run endtime is null", async () => {
          // arrange + act also in beforeEach
          fakeRun.endTime = null;
          fixture.detectChanges();
          let label: HTMLElement = fixture.nativeElement.querySelector("#run-time-label");
          let value: HTMLElement = fixture.nativeElement.querySelector("#run-time-value");

          // assert
          expect(label.textContent).toEqual("Run Time");
          expect(value.textContent).toEqual("-");
        });

        it("should contain experiments label and value", async () => {
          // arrange + act also in beforeEach
          let label: HTMLElement = fixture.nativeElement.querySelector("#experiments-label");
          const chipLists: MatChipListHarness[] = await loader.getAllHarnesses(MatChipListHarness);
          const chips: MatChipHarness[] = await chipLists[0].getChips();

          // assert
          expect(label.textContent).toEqual("Experiments");
          chips.forEach(async (chip, index) => {
            expect(await chip.getText()).toEqual(fakeRun.experimentRefs[index].experimentKey);
          });
        });
      });
      describe("parameters", () => {
        it("should contain parameters title", async () => {
          // arrange + act also in beforeEach
          let title: HTMLElement = fixture.nativeElement.querySelector("#parameters-title");

          // assert
          expect(title.textContent).toEqual("Parameters");
        });

        it("should contain the parameters table", () => {
          // arrange + act also in beforeEach
          let table: HTMLElement = fixture.nativeElement.querySelector("#parameters-table");

          // assert
          expect(table.textContent).toBeTruthy();
        });

        it("should have defined headers", async () => {
          // arrange + act also in beforeEach
          const table: MatTableHarness = await loader.getHarness(MatTableHarness.with({ selector: "#parameters-table" }));
          const headers: MatHeaderRowHarness[] = await table.getHeaderRows();
          const headerRow: MatRowHarnessColumnsText = await headers[0].getCellTextByColumnName();

          // assert
          expect(Object.keys(headerRow).length).toBe(2);
          expect(headerRow.parametersKey).toBe("Key");
          expect(headerRow.parametersValue).toBe("Value");
        });

        it("should show row for each parameter", async () => {
          // arrange + act also in beforeEach
          const table: MatTableHarness = await loader.getHarness(MatTableHarness.with({ selector: "#parameters-table" }));
          const rows: MatRowHarness[] = await table.getRows();

          // assert
          expect(rows.length).toBe(component.parameters.length);
          component.parameters.forEach(async (parameter, index) => {
            const row: MatRowHarnessColumnsText = await rows[index].getCellTextByColumnName();

            expect(row.parametersKey).toEqual(parameter.key);
            expect(row.parametersValue).toEqual(String(parameter.value));
          });
        });
      });
      describe("metrics", () => {
        it("should contain metrics title", async () => {
          // arrange + act also in beforeEach
          let title: HTMLElement = fixture.nativeElement.querySelector("#metrics-title");

          // assert
          expect(title.textContent).toEqual("Metrics");
        });

        it("should contain the metrics table", () => {
          // arrange + act also in beforeEach
          let table: HTMLElement = fixture.nativeElement.querySelector("#metrics-table");

          // assert
          expect(table.textContent).toBeTruthy();
        });

        it("should have defined headers", async () => {
          // arrange + act also in beforeEach
          const table: MatTableHarness = await loader.getHarness(MatTableHarness.with({ selector: "#metrics-table" }));
          const headers: MatHeaderRowHarness[] = await table.getHeaderRows();
          const headerRow: MatRowHarnessColumnsText = await headers[0].getCellTextByColumnName();

          // assert
          expect(Object.keys(headerRow).length).toBe(2);
          expect(headerRow.metricsKey).toBe("Key");
          expect(headerRow.metricsValue).toBe("Value");
        });

        it("should show row for each metric", async () => {
          // arrange + act also in beforeEach
          const table: MatTableHarness = await loader.getHarness(MatTableHarness.with({ selector: "#metrics-table" }));
          const rows: MatRowHarness[] = await table.getRows();

          // assert
          expect(rows.length).toBe(component.metrics.length);
          component.metrics.forEach(async (metric, index) => {
            const row: MatRowHarnessColumnsText = await rows[index].getCellTextByColumnName();

            expect(row.metricsKey).toEqual(metric.key);
            expect(row.metricsValue).toEqual(String(metric.value));
          });
        });
      });
      describe("artifacts tree", () => {
        it("should contain artifacts tree title", async () => {
          // arrange + act also in beforeEach
          let title: HTMLElement = fixture.nativeElement.querySelector("#artifacts-tree-title");

          // assert
          expect(title.textContent).toEqual("Artifacts");
        });
        it("should contain child component - app-artifacts-tree ", async () => {
          // arrange
          const childComponent: HTMLElement = fixture.nativeElement.querySelector("app-artifacts-tree");

          // assert
          expect(childComponent).toBeTruthy();
          expect(childComponent.getAttribute("ng-reflect-project-key")).toEqual(fakeProject.key);
          expect(childComponent.getAttribute("ng-reflect-artifact-list-data-source")).not.toBeUndefined();
          expect(childComponent.getAttribute("ng-reflect-artifact-list-data-source")).not.toBeNull();
        });
      });
    });
  });

  // We need this function because in some tests the returned run needs to be modifed before the component is created
  async function setupStubsAndMocks(run?: Run) {
    // mock active route params
    const paramMapObservable = new Observable<ParamMap>();
    const paramMapSubscription = new Subscription();
    unsubscriptionSpy = spyOn(paramMapSubscription, "unsubscribe").and.callThrough();
    spyOn(paramMapObservable, "subscribe").and.callFake((fn): Subscription => {
      fn({ projectKey: fakeProject.key, runKey: fakeRun.key });
      return paramMapSubscription;
    });

    // stub services
    artifactsApiServiceStub = jasmine.createSpyObj("artifactsApiService", ["getArtifactsByRunKeys"]);
    runsApiServiceStub = jasmine.createSpyObj("runsApiService", ["getRun", "updateNoteInRun"]);
    snackBarUiServiceStub = jasmine.createSpyObj("snackBarUiService", ["showSuccesfulSnackbar", "showErrorSnackbar"]);

    // setup experiments fakes
    fakeArtifacts = await getRandomArtifacts(3);
    fakeRun = await getRandomRun();
    fakeProject = await getRandomProject();

    // setup api
    if (run) {
      runsApiServiceStub.getRun.and.returnValue(of(run));
    } else {
      runsApiServiceStub.getRun.and.returnValue(of(fakeRun));
    }
    artifactsApiServiceStub.getArtifactsByRunKeys.and.returnValue(artifactListDataSourceMock);
    artifactListDataSourceMock.emulate(fakeArtifacts);

    await TestBed.configureTestingModule({
      declarations: [
        MockComponent(ArtifactsTreeComponent),
        RunDetailsComponent,
        RunStatusI18nComponent,
        MockPipe(DurationPipe, (v) => String(v)),
        MockPipe(TimeAgoPipe, (v) => String(v)),
      ],
      providers: [
        { provide: ActivatedRoute, useValue: { params: paramMapObservable } },
        { provide: ArtifactsApiService, useValue: artifactsApiServiceStub },
        { provide: RunsApiService, useValue: runsApiServiceStub },
        { provide: SnackbarUiService, useValue: snackBarUiServiceStub },
      ],
      imports: [
        BrowserAnimationsModule,
        MatButtonModule,
        MatChipsModule,
        MatFormFieldModule,
        MatInputModule,
        MatTableModule,
        MatSortModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RunDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }
});
