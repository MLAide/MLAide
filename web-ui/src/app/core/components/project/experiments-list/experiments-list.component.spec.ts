import { HarnessLoader } from "@angular/cdk/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MatButtonModule } from "@angular/material/button";
import { MatButtonHarness } from "@angular/material/button/testing";
import { MatChipsModule } from "@angular/material/chips";
import { MatDialogModule } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { MatTableModule } from "@angular/material/table";
import { MatHeaderRowHarness, MatRowHarness, MatRowHarnessColumnsText, MatTableHarness } from "@angular/material/table/testing";
import { ActivatedRoute, ParamMap, RouterModule } from "@angular/router";
import { MockModule, ngMocks } from "ng-mocks";
import { MatChipHarness, MatChipListHarness } from "@angular/material/chips/testing";
import { Observable, Subscription } from "rxjs";
import { Experiment, ExperimentListResponse } from "src/app/core/models/experiment.model";
import { Project } from "src/app/core/models/project.model";
import { ExperimentsApiService, SpinnerUiService } from "src/app/core/services";
import { ListDataSourceMock } from "src/app/mocks/data-source.mock";
import { getRandomExperiments, getRandomProject } from "src/app/mocks/fake-generator";
import { ExperimentStatusI18nComponent } from "../shared/experiment-status-i18n/experiment-status-i18n.component";

import { ExperimentsListComponent } from "./experiments-list.component";
import { MatSortModule } from "@angular/material/sort";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

describe("ExperimentsListComponent", () => {
  let component: ExperimentsListComponent;
  let fixture: ComponentFixture<ExperimentsListComponent>;
  let loader: HarnessLoader;

  // fakes
  let fakeExperiments: Experiment[];
  let fakeProject: Project;

  // route spy
  let unsubscriptionSpy: jasmine.Spy<() => void>;

  // service stubs
  let experimentsApiServiceStub: jasmine.SpyObj<ExperimentsApiService>;
  let spinnerUiServiceStub: jasmine.SpyObj<SpinnerUiService>;

  // data source mocks
  let experimentListDataSourceMock: ListDataSourceMock<Experiment, ExperimentListResponse> = new ListDataSourceMock();

  beforeEach(async () => {
    // stub services
    experimentsApiServiceStub = jasmine.createSpyObj("experimentsApiService", ["getExperiments"]);
    spinnerUiServiceStub = jasmine.createSpyObj("spinnerUiService", ["showSpinner", "stopSpinner"]);

    // arrange fakes & stubs
    // setup experiments fakes
    fakeProject = await getRandomProject();
    fakeExperiments = await getRandomExperiments(3);

    // mock and setup active route
    const paramMapObservable = new Observable<ParamMap>();
    const paramMapSubscription = new Subscription();
    unsubscriptionSpy = spyOn(paramMapSubscription, "unsubscribe").and.callThrough();
    spyOn(paramMapObservable, "subscribe").and.callFake(
      (fn): Subscription => {
        fn({ projectKey: fakeProject.key });
        return paramMapSubscription;
      }
    );

    // setup experiments api
    experimentsApiServiceStub.getExperiments.withArgs(fakeProject.key).and.returnValue(experimentListDataSourceMock);
    experimentListDataSourceMock.emulate(fakeExperiments);

    TestBed.configureTestingModule({
      declarations: [ExperimentsListComponent, ExperimentStatusI18nComponent],

      providers: [
        { provide: ActivatedRoute, useValue: { params: paramMapObservable } },
        { provide: ExperimentsApiService, useValue: experimentsApiServiceStub },
        { provide: SpinnerUiService, useValue: spinnerUiServiceStub },
      ],
      imports: [
        MatButtonModule,
        MatChipsModule,
        MatDialogModule,
        MatIconModule,
        MatTableModule,
        MatSortModule,
        BrowserAnimationsModule,
        // To prevent Error: 'Can't bind to 'routerLink' since it isn't a known property of 'a'.'
        // https://ng-mocks.github.io/how-to-test-a-component.html
        MockModule(RouterModule.forRoot([])),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExperimentsListComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();
  });

  afterEach(() => {
    experimentListDataSourceMock.emulate([]);
  });

  it("should create", () => {
    // arrange + act

    // assert
    expect(component).toBeTruthy();
  });

  describe("ngOnInit", () => {
    it("should load experiments with projectKey defined in active route", async () => {
      // arrange + act in beforeEach

      // assert
      expect(component.projectKey).toBe(fakeProject.key);
      expect(experimentsApiServiceStub.getExperiments).toHaveBeenCalledWith(fakeProject.key);
    });

    it("should load all experiments of the current project", async () => {
      // arrange + act in beforeEach

      // assert
      expect(component.dataSource.data).toBe(fakeExperiments);
    });
  });

  describe("ngAfterViewInit", () => {
    it("should set datasource sort", () => {
      // arrange + act in beforeEach

      // assert
      expect(component.dataSource.sort).toEqual(component.sort);
    });
  });

  describe("component rendering", () => {
    it("should contain components title", async () => {
      // arrange + act also in beforeEach
      let h1: HTMLElement = fixture.nativeElement.querySelector("h1");

      // assert
      expect(h1.textContent).toEqual("Experiments");
    });

    describe("add experiment", () => {
      const addExperimentButtonTitle = "Add Experiment";
      it("should contain add experiment button", () => {
        // arrange + act also in beforeEach
        let addProjectsButton: HTMLElement = fixture.nativeElement.querySelector("button");

        // assert
        expect(addProjectsButton).toBeTruthy();
        expect(addProjectsButton.textContent).toContain(addExperimentButtonTitle);
      });

      it("should call openCreateExperimentDialog on clicking the add project button", async () => {
        // arrange + act also in beforeEach
        spyOn(component, "openCreateExperimentDialog");
        const addProjectButton = await loader.getHarness(MatButtonHarness.with({ text: addExperimentButtonTitle }));

        // act
        await addProjectButton.click();
        // assert
        expect(component.openCreateExperimentDialog).toHaveBeenCalled();
      });
    });

    describe("experiments table", () => {
      it("should contain the experiments table", () => {
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
        expect(headerRow.key).toBe("Key");
        expect(headerRow.name).toBe("Name");
        expect(headerRow.status).toBe("Status");
        expect(headerRow.tags).toBe("Tags");
        expect(headerRow.actions).toBe("Actions");
      });

      it("should show row for each experiment", async () => {
        // arrange + act also in beforeEach
        const table: MatTableHarness = await loader.getHarness(MatTableHarness);
        const rows: MatRowHarness[] = await table.getRows();
        const editButtons: MatButtonHarness[] = await loader.getAllHarnesses(MatButtonHarness.with({ text: "edit" }));
        const chipLists: MatChipListHarness[] = await loader.getAllHarnesses(MatChipListHarness);

        // assert
        expect(rows.length).toBe(fakeExperiments.length);
        expect(editButtons.length).toBe(fakeExperiments.length);
        fakeExperiments.forEach(async (fakeExperiment, index) => {
          const row: MatRowHarnessColumnsText = await rows[index].getCellTextByColumnName();
          const chips: MatChipHarness[] = await chipLists[index].getChips();

          expect(row.key).toEqual(fakeExperiment.key);
          expect(row.name).toEqual(fakeExperiment.name);
          expect(row.status.toUpperCase().replace(" ", "_")).toEqual(fakeExperiment.status);
          chips.forEach(async (chip, chipIndex) => {
            expect(await chip.getText()).toEqual(fakeExperiment.tags[chipIndex]);
          });
          expect(row.actions).toBe("edit");
        });
      });

      it("should have correct router link to details for each experiment", async () => {
        // arrange + act also in beforeEach
        const links = ngMocks.findAll(fixture, "a");

        // assert
        expect(links.length).toBe(3);
        expect(ngMocks.input(links[0], "routerLink")).toEqual([
          "/projects/" + fakeProject.key + "/experiments/" + fakeExperiments[0].key,
        ]);
        expect(ngMocks.input(links[1], "routerLink")).toEqual([
          "/projects/" + fakeProject.key + "/experiments/" + fakeExperiments[1].key,
        ]);
        expect(ngMocks.input(links[2], "routerLink")).toEqual([
          "/projects/" + fakeProject.key + "/experiments/" + fakeExperiments[2].key,
        ]);
      });

      it("should call openEditExperimentDialog with experiment on clicking edit button in row", async () => {
        // arrange + act also in beforeEach
        spyOn(component, "openEditExperimentDialog");
        const editButtons: MatButtonHarness[] = await loader.getAllHarnesses(MatButtonHarness.with({ text: "edit" }));

        // act
        await editButtons[editButtons.length - 1].click();

        // assert
        fixture.whenStable().then(() => {
          expect(component.openEditExperimentDialog).toHaveBeenCalledWith(fakeExperiments[fakeExperiments.length - 1]);
        });
      });
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
});
