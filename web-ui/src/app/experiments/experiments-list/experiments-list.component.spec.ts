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
import { RouterModule } from "@angular/router";
import { MockModule, ngMocks } from "ng-mocks";
import { MatChipHarness, MatChipListHarness } from "@angular/material/chips/testing";
import { of } from "rxjs";
import { getRandomExperiments, getRandomProject } from "@mlaide/mocks/fake-generator";
import { ExperimentStatusI18nComponent } from "@mlaide/shared/components/experiment-status-i18n/experiment-status-i18n.component";

import { ExperimentsListComponent } from "./experiments-list.component";
import { MatSortModule } from "@angular/material/sort";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MockStore, provideMockStore } from "@ngrx/store/testing";
import { Action } from "@ngrx/store";
import { selectCurrentProjectKey } from "@mlaide/state/project/project.selectors";
import { selectExperiments, selectIsLoadingExperiments } from "@mlaide/state/experiment/experiment.selectors";
import {
  openAddOrEditExperimentDialog
} from "@mlaide/state/experiment/experiment.actions";
import { MatCardModule } from "@angular/material/card";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatCardHarness } from "@angular/material/card/testing";
import { MatProgressSpinnerHarness } from "@angular/material/progress-spinner/testing";
import { Experiment, ExperimentStatus } from "@mlaide/state/experiment/experiment.models";
import { Project } from "@mlaide/state/project/project.models";
import { MatTooltipHarness } from "@angular/material/tooltip/testing";
import { MatTooltipModule } from "@angular/material/tooltip";

describe("ExperimentsListComponent", () => {
  let component: ExperimentsListComponent;
  let fixture: ComponentFixture<ExperimentsListComponent>;
  let loader: HarnessLoader;

  // fakes
  let fakeExperiments: Experiment[];
  let fakeProject: Project;

  let store: MockStore;
  let dispatchSpy: jasmine.Spy<(action: Action) => void>;

  beforeEach(async () => {
    // arrange fakes & stubs
    // setup experiment fakes
    fakeProject = await getRandomProject();
    fakeExperiments = await getRandomExperiments(3);

    await TestBed.configureTestingModule({
      declarations: [ExperimentsListComponent, ExperimentStatusI18nComponent],

      providers: [
        provideMockStore(),
      ],
      imports: [
        MatButtonModule,
        MatCardModule,
        MatChipsModule,
        MatDialogModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatSortModule,
        MatTableModule,
        MatTooltipModule,
        BrowserAnimationsModule,
        // To prevent Error: 'Can't bind to 'routerLink' since it isn't a known property of 'a'.'
        // https://ng-mocks.github.io/how-to-test-a-component.html
        MockModule(RouterModule.forRoot([])),
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);

    store.overrideSelector(selectIsLoadingExperiments, true);
    store.overrideSelector(selectExperiments, fakeExperiments);
    store.overrideSelector(selectCurrentProjectKey, fakeProject.key);

    dispatchSpy = spyOn(store, 'dispatch');
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExperimentsListComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();
  });

  it("should create", () => {
    // arrange + act

    // assert
    expect(component).toBeTruthy();
  });

  describe("ngOnInit", () => {
    it("should select isLoadingExperiments from store correctly", async (done) => {
      // arrange + act in beforeEach

      // assert
      component.isLoading$.subscribe((isLoading) => {
        expect(isLoading).toBe(true);
        done();
      });
    });

    it("should select projectKey from store correctly", async (done) => {
      // arrange + act in beforeEach

      // assert
      component.projectKey$.subscribe(projectKey => {
        expect(projectKey).toBe(fakeProject.key);
        done();
      });
    });

    it("should select experiments from store correctly", async (done) => {
      // arrange + act in beforeEach

      // assert
      component.experiments$.subscribe((experiments) => {
        expect(experiments).toBe(fakeExperiments);
        done();
      });
    });
  });

  describe("openCreateExperimentDialog", () => {
    it("should dispatch openAddOrEditExperimentDialog action", async () => {
      // arrange in beforeEach

      // act
      component.openCreateExperimentDialog();

      // assert
      expect(dispatchSpy).toHaveBeenCalledWith(openAddOrEditExperimentDialog({
        title: "Add Experiment",
        experiment: {
          name: "",
          key: "",
          tags: [],
          status: ExperimentStatus.TODO,
        },
        isEditMode: false
      }));
    });
  });

  describe("openEditExperimentDialog", () => {
    it("should dispatch openAddOrEditExperimentDialog action", async () => {
      // arrange in beforeEach

      // act
      component.openEditExperimentDialog(fakeExperiments[0]);

      // assert
      expect(dispatchSpy).toHaveBeenCalledWith(openAddOrEditExperimentDialog({
        title: "Edit Experiment",
        experiment: fakeExperiments[0],
        isEditMode: true
      }));
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

    describe("experiment table", () => {
      it("should contain the experiment table", () => {
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
        await Promise.all(fakeExperiments.map(async (fakeExperiment, index) => {
          const row: MatRowHarnessColumnsText = await rows[index].getCellTextByColumnName();
          const chips: MatChipHarness[] = await chipLists[index].getChips();

          expect(row.key).toEqual(fakeExperiment.key);
          expect(row.name).toEqual(fakeExperiment.name);
          expect(row.status.toUpperCase().replace(" ", "_")).toEqual(fakeExperiment.status);
          await Promise.all(chips.map(async (chip, chipIndex) => {
            expect(await chip.getText()).toEqual(fakeExperiment.tags[chipIndex]);
          }));
          expect(row.actions).toBe("edit");
        }));
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

      it("should show tool tip for edit button in row", async () => {
        // arrange + act also in beforeEach
        const toolTips: MatTooltipHarness[] = await loader.getAllHarnesses(MatTooltipHarness);

        // act
        await toolTips[0].show();

        // assert
        expect(await toolTips[0].getTooltipText()).toEqual(`Edit ${fakeExperiments[0].name} experiment`);
      });
    });

    describe("progress spinner", () => {
      it("should contain progress spinner if isLoading$ is true", async () => {
        // arrange + act also in beforeEach
        component.isLoading$ = of(true);
        let card: MatCardHarness[] = await loader.getAllHarnesses(MatCardHarness);
        let progressSpinner: MatProgressSpinnerHarness[] = await loader.getAllHarnesses(MatProgressSpinnerHarness);

        // assert
        expect(card.length).toBe(1);
        expect(progressSpinner.length).toBe(1);
      });

      it("should not contain progress spinner if isLoading$ is false", async () => {
        // arrange + act also in beforeEach
        component.isLoading$ = of(false);
        let card: MatCardHarness[] = await loader.getAllHarnesses(MatCardHarness);
        let progressSpinner: MatProgressSpinnerHarness[] = await loader.getAllHarnesses(MatProgressSpinnerHarness);

        // assert
        expect(card.length).toBe(0);
        expect(progressSpinner.length).toBe(0);
      });
    });
  });
});
