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
import { of } from "rxjs";
import { getRandomArtifacts } from "@mlaide/mocks/fake-generator";
import { ModelStageI18nComponent } from "@mlaide/shared/components/model-stage-i18n/model-stage-i18n.component";
import { ModelsListComponent } from "./models-list.component";
import { MockStore, provideMockStore } from "@ngrx/store/testing";
import { Action } from "@ngrx/store";
import { selectIsLoadingArtifacts, selectModels } from "@mlaide/state/artifact/artifact.selectors";
import { MatCardModule } from "@angular/material/card";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { loadModels, openEditModelDialog, openModelStageLogDialog } from "@mlaide/state/artifact/artifact.actions";
import { MatCardHarness } from "@angular/material/card/testing";
import { MatProgressSpinnerHarness } from "@angular/material/progress-spinner/testing";
import { Artifact } from "@mlaide/state/artifact/artifact.models";

describe("ModelsListComponent", () => {
  let component: ModelsListComponent;
  let fixture: ComponentFixture<ModelsListComponent>;

  // fakes
  let fakeArtifacts: Artifact[];

  // mocks
  let store: MockStore;
  let dispatchSpy: jasmine.Spy<(action: Action) => void>;

  beforeEach(async () => {
    // arrange fakes
    fakeArtifacts = await getRandomArtifacts(3);

    await TestBed.configureTestingModule({
      declarations: [ModelsListComponent, ModelStageI18nComponent],
      providers: [
        provideMockStore(),
      ],
      imports: [
        BrowserAnimationsModule,
        MatButtonModule,
        MatCardModule,
        MatDialogModule,
        MatIconModule,
        MatTableModule,
        MatSortModule,
        MatProgressSpinnerModule
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);

    store.overrideSelector(selectModels, fakeArtifacts);
    store.overrideSelector(selectIsLoadingArtifacts, true);

    dispatchSpy = spyOn(store, 'dispatch');
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModelsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });


  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("ngOnInit", () => {
    it("should select models from store correctly", async (done) => {
      // arrange + act in beforeEach

      // assert
      component.models$.subscribe((models) => {
        expect(models).toBe(fakeArtifacts);
        done();
      });
    });

    it("should select isLoadingArtifacts$ from store correctly", async (done) => {
      // arrange + act in beforeEach

      // assert
      component.isLoadingArtifacts$.subscribe((isLoading) => {
        expect(isLoading).toBe(true);
        done();
      });
    });

    it("should dispatch loadModels action", () => {
      // ngOnInit will be called in beforeEach while creating the component

      // assert
      expect(dispatchSpy).toHaveBeenCalledWith(loadModels());
    });
  });

  describe("openEditModelDialog", () => {
    it("should dispatch openEditModelDialog action with provided artifact", async () => {
      // arrange in beforeEach

      // act
      component.openEditModelDialog(fakeArtifacts[0]);

      // assert
      expect(dispatchSpy).toHaveBeenCalledWith(openEditModelDialog({
        artifact: fakeArtifacts[0]
      }));
    });
  });

  describe("openModelStageLog", () => {
    it("should dispatch openModelStageLogDialog action with provided artifact's model revisions", async () => {
      // arrange in beforeEach

      // act
      component.openModelStageLog(fakeArtifacts[0]);

      // assert
      expect(dispatchSpy).toHaveBeenCalledWith(openModelStageLogDialog({
        modelRevisions: fakeArtifacts[0].model.modelRevisions
      }));
    });
  });

  describe("component rendering", () => {
    let loader: HarnessLoader;

    beforeEach(() => {
      loader = TestbedHarnessEnvironment.loader(fixture);
    });

    it("should contain components title", async () => {
      // arrange + act also in beforeEach
      let h1: HTMLElement = fixture.nativeElement.querySelector("h1");

      // assert
      expect(h1.textContent).toEqual("Models");
    });

    describe("models table", () => {
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
        await Promise.all(fakeArtifacts.map(async (fakeArtifact, index) => {
          const row: MatRowHarnessColumnsText = await rows[index].getCellTextByColumnName();

          expect(row.modelName).toEqual(fakeArtifact.name);
          expect(row.version).toEqual(String(fakeArtifact.version));
          expect(row.stage.toUpperCase().replace(" ", "_")).toEqual(fakeArtifact.model.stage);
          expect(row.runName).toEqual(fakeArtifact.runName);
          expect(row.actions).toBe("edithistory");
        }));
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

    describe("progress spinner", () => {
      it("should contain progress spinner if isLoading$ is true", async () => {
        // arrange + act also in beforeEach
        component.isLoadingArtifacts$ = of(true);
        let card: MatCardHarness[] = await loader.getAllHarnesses(MatCardHarness);
        let progressSpinner: MatProgressSpinnerHarness[] = await loader.getAllHarnesses(MatProgressSpinnerHarness);

        // assert
        expect(card.length).toBe(1);
        expect(progressSpinner.length).toBe(1);
      });

      it("should not contain progress spinner if isLoading$ is false", async () => {
        // arrange + act also in beforeEach
        component.isLoadingArtifacts$ = of(false);
        let card: MatCardHarness[] = await loader.getAllHarnesses(MatCardHarness);
        let progressSpinner: MatProgressSpinnerHarness[] = await loader.getAllHarnesses(MatProgressSpinnerHarness);

        // assert
        expect(card.length).toBe(0);
        expect(progressSpinner.length).toBe(0);
      });
    });
  });
});
