import { HarnessLoader } from "@angular/cdk/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MatButtonModule } from "@angular/material/button";
import { MatButtonHarness } from "@angular/material/button/testing";
import { MatDialogModule } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { MatSortModule } from "@angular/material/sort";
import { MatTableModule } from "@angular/material/table";
import { MatHeaderRowHarness, MatRowHarness, MatRowHarnessColumnsText, MatTableHarness } from "@angular/material/table/testing";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { Observable, Subscription } from "rxjs";
import { Artifact, ArtifactListResponse } from "@mlaide/entities/artifact.model";
import { Project } from "@mlaide/entities/project.model";
import { SpinnerUiService } from "@mlaide/shared/services";
import { ListDataSourceMock } from "src/app/mocks/data-source.mock";
import { getRandomArtifacts, getRandomProject } from "src/app/mocks/fake-generator";
import { ModelStageI18nComponent } from "../../shared/components/model-stage-i18n/model-stage-i18n.component";

import { ModelsListComponent } from "./models-list.component";
import { ArtifactsApiService } from "@mlaide/shared/api";

describe("ModelsListComponent", () => {
  let component: ModelsListComponent;
  let fixture: ComponentFixture<ModelsListComponent>;

  // fakes
  let fakeArtifacts: Artifact[];
  let fakeProject: Project;

  // route spy
  let unsubscriptionSpy: jasmine.Spy<() => void>;

  // service stubs
  let artifactsApiServiceStub: jasmine.SpyObj<ArtifactsApiService>;
  let spinnerUiServiceStub: jasmine.SpyObj<SpinnerUiService>;

  // data source mocks
  let artifactListDataSourceMock: ListDataSourceMock<Artifact, ArtifactListResponse> = new ListDataSourceMock();

  beforeEach(async () => {
    // mock active route params
    const paramMapObservable = new Observable<ParamMap>();
    const paramMapSubscription = new Subscription();
    unsubscriptionSpy = spyOn(paramMapSubscription, "unsubscribe").and.callThrough();
    spyOn(paramMapObservable, "subscribe").and.callFake((fn): Subscription => {
      fn({ projectKey: fakeProject.key });
      return paramMapSubscription;
    });

    // stub services
    artifactsApiServiceStub = jasmine.createSpyObj("artifactsApiService", ["getArtifacts"]);
    spinnerUiServiceStub = jasmine.createSpyObj("spinnerUiService", ["showSpinner", "stopSpinner"]);

    // arrange fakes & stubs
    // setup experiment fakes
    fakeProject = await getRandomProject();
    fakeArtifacts = await getRandomArtifacts(3);

    // setup artifacts api
    artifactsApiServiceStub.getArtifacts.and.returnValue(artifactListDataSourceMock);
    artifactListDataSourceMock.emulate(fakeArtifacts);

    await TestBed.configureTestingModule({
      declarations: [ModelsListComponent, ModelStageI18nComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { params: paramMapObservable } },
        { provide: ArtifactsApiService, useValue: artifactsApiServiceStub },
        { provide: SpinnerUiService, useValue: spinnerUiServiceStub },
      ],
      imports: [BrowserAnimationsModule, MatButtonModule, MatDialogModule, MatIconModule, MatTableModule, MatSortModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModelsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    artifactListDataSourceMock.emulate([]);
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  // TODO: Fix Tests
  /*
  describe("ngOnInit", () => {
    it("should load artifacts with projectKey defined in active route", async () => {
      // arrange + act in beforeEach

      // assert
      expect(artifactsApiServiceStub.getArtifacts).toHaveBeenCalledWith(fakeProject.key, true);
    });

    it("should load all artifacts of the current project", async () => {
      // arrange + act in beforeEach

      // assert
      expect(component.dataSource.data).toBe(fakeArtifacts);
    });
  });

  describe("ngAfterViewInit", () => {
    it("should set datasource sort", () => {
      // arrange + act in beforeEach

      // assert
      expect(component.dataSource.sort).toEqual(component.sort);
    });
  });

  describe("ngOnDestroy", () => {
    it("should unsubscribe from routeParamsSubscription", async () => {
      // arrange in beforeEach

      // act
      component.ngOnDestroy();

      // assert
      expect(unsubscriptionSpy).toHaveBeenCalled();
    });
  });
  */

  describe("component rendering", () => {
    it("should contain components title", async () => {
      // arrange + act also in beforeEach
      let h1: HTMLElement = fixture.nativeElement.querySelector("h1");

      // assert
      expect(h1.textContent).toEqual("Models");
    });

    describe("models table", () => {
      let loader: HarnessLoader;

      beforeEach(() => {
        loader = TestbedHarnessEnvironment.loader(fixture);
      });

      it("should contain the models table", () => {
        // arrange + act also in beforeEach
        let table: HTMLElement = fixture.nativeElement.querySelector("table");

        // assert
        expect(table.textContent).toBeTruthy();
      });

      it("should have defined headers", async () => {
        // arrange + act also in beforeEach
        const table: MatTableHarness = await loader.getHarness(MatTableHarness);
        const headers: MatHeaderRowHarness[] = await table.getHeaderRows();
        const headerRow: MatRowHarnessColumnsText = await headers[0].getCellTextByColumnName();

        // assert
        expect(Object.keys(headerRow).length).toBe(5);
        expect(headerRow.modelName).toBe("Model name");
        expect(headerRow.version).toBe("Version");
        expect(headerRow.stage).toBe("Stage");
        expect(headerRow.runName).toBe("Run name");
        expect(headerRow.actions).toBe("Actions");
      });

      it("should show row for each experiment", async () => {
        // arrange + act also in beforeEach
        const table: MatTableHarness = await loader.getHarness(MatTableHarness);
        const rows: MatRowHarness[] = await table.getRows();
        const editButtons: MatButtonHarness[] = await loader.getAllHarnesses(MatButtonHarness.with({ text: "edit" }));
        const historyButtons: MatButtonHarness[] = await loader.getAllHarnesses(MatButtonHarness.with({ text: "history" }));

        // assert
        expect(rows.length).toBe(fakeArtifacts.length);
        expect(editButtons.length).toBe(fakeArtifacts.length);
        expect(historyButtons.length).toBe(fakeArtifacts.length);
        fakeArtifacts.forEach(async (fakeArtifact, index) => {
          const row: MatRowHarnessColumnsText = await rows[index].getCellTextByColumnName();

          expect(row.modelName).toEqual(fakeArtifact.name);
          expect(row.version).toEqual(String(fakeArtifact.version));
          expect(row.stage.toUpperCase().replace(" ", "_")).toEqual(fakeArtifact.model.stage);
          expect(row.runName).toEqual(fakeArtifact.runName);
          expect(row.actions).toBe("edithistory");
        });
      });

      it("should call openEditModelDialog with model on clicking edit button in row", async () => {
        // arrange + act also in beforeEach
        spyOn(component, "openEditModelDialog");
        const editButtons: MatButtonHarness[] = await loader.getAllHarnesses(MatButtonHarness.with({ text: "edit" }));

        // act
        await editButtons[editButtons.length - 1].click();

        // assert
        fixture.whenStable().then(() => {
          expect(component.openEditModelDialog).toHaveBeenCalledWith(fakeArtifacts[fakeArtifacts.length - 1]);
        });
      });

      it("should call openModelStageLog with model on clicking edit button in row", async () => {
        // arrange + act also in beforeEach
        spyOn(component, "openModelStageLog");
        const historyButtons: MatButtonHarness[] = await loader.getAllHarnesses(MatButtonHarness.with({ text: "history" }));

        // act
        await historyButtons[historyButtons.length - 1].click();

        // assert
        fixture.whenStable().then(() => {
          expect(component.openModelStageLog).toHaveBeenCalledWith(fakeArtifacts[fakeArtifacts.length - 1]);
        });
      });
    });
  });
});
