import { HarnessLoader } from "@angular/cdk/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MatButtonModule } from "@angular/material/button";
import { MatButtonHarness } from "@angular/material/button/testing";
import { MatCardModule } from "@angular/material/card";
import { MatCardHarness } from "@angular/material/card/testing";
import { MatChipsModule } from "@angular/material/chips";
import { MatChipHarness, MatChipListHarness } from "@angular/material/chips/testing";
import { MatDialogModule } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatProgressSpinnerHarness } from "@angular/material/progress-spinner/testing";
import { MatSortModule } from "@angular/material/sort";
import { MatTableModule } from "@angular/material/table";
import { MatTableHarness, MatHeaderRowHarness, MatRowHarnessColumnsText, MatRowHarness } from "@angular/material/table/testing";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatTooltipHarness } from "@angular/material/tooltip/testing";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterTestingModule } from "@angular/router/testing";
import { getRandomArtifacts } from "@mlaide/mocks/fake-generator";
import { openEditModelDialog, openModelStageLogDialog } from "@mlaide/state/artifact/artifact.actions";
import { Artifact } from "@mlaide/state/artifact/artifact.models";
import { Action } from "@ngrx/store";
import { MockStore, provideMockStore } from "@ngrx/store/testing";
import { of } from "rxjs";
import { ModelStageI18nComponent } from "../model-stage-i18n/model-stage-i18n.component";

import { ModelListTableComponent } from "./model-list-table.component";

describe("ModelListTableComponent", () => {
  let component: ModelListTableComponent;
  let fixture: ComponentFixture<ModelListTableComponent>;

  // fakes
  let fakeArtifacts: Artifact[];

  // mocks
  let store: MockStore;
  let dispatchSpy: jasmine.Spy<(action: Action) => void>;

  beforeEach(async () => {
    // arrange fakes
    fakeArtifacts = await getRandomArtifacts(3);

    await TestBed.configureTestingModule({
      declarations: [ModelListTableComponent, ModelStageI18nComponent],
      providers: [provideMockStore()],
      imports: [
        BrowserAnimationsModule,
        MatButtonModule,
        MatCardModule,
        MatDialogModule,
        MatIconModule,
        MatTableModule,
        MatTooltipModule,
        MatSortModule,
        MatProgressSpinnerModule,
        MatChipsModule,
        RouterTestingModule,
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);

    dispatchSpy = spyOn(store, "dispatch");
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModelListTableComponent);
    component = fixture.componentInstance;
    component.models$ = of(fakeArtifacts);
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("openEditModelDialog", () => {
    it("should dispatch openEditModelDialog action with provided artifact", async () => {
      // arrange in beforeEach

      // act
      component.openEditModelDialog(fakeArtifacts[0]);

      // assert
      expect(dispatchSpy).toHaveBeenCalledWith(
        openEditModelDialog({
          artifact: fakeArtifacts[0],
        })
      );
    });
  });

  describe("openModelStageLog", () => {
    it("should dispatch openModelStageLogDialog action with provided artifact's model revisions", async () => {
      // arrange in beforeEach

      // act
      component.openModelStageLog(fakeArtifacts[0]);

      // assert
      expect(dispatchSpy).toHaveBeenCalledWith(
        openModelStageLogDialog({
          modelRevisions: fakeArtifacts[0].model.modelRevisions,
        })
      );
    });
  });

  describe("component rendering", () => {
    let loader: HarnessLoader;

    beforeEach(() => {
      loader = TestbedHarnessEnvironment.loader(fixture);
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
        expect(headerRow.runs).toBe("Runs");
        expect(headerRow.actions).toBe("Actions");
      });

      it("should show row for each experiment", async () => {
        // arrange + act also in beforeEach
        const table: MatTableHarness = await loader.getHarness(MatTableHarness);
        const rows: MatRowHarness[] = await table.getRows();
        const editButtons: MatButtonHarness[] = await loader.getAllHarnesses(MatButtonHarness.with({ text: "edit" }));
        const historyButtons: MatButtonHarness[] = await loader.getAllHarnesses(MatButtonHarness.with({ text: "history" }));
        const chipLists: MatChipListHarness[] = await loader.getAllHarnesses(MatChipListHarness);

        // assert
        expect(rows.length).toBe(fakeArtifacts.length);
        expect(editButtons.length).toBe(fakeArtifacts.length);
        expect(historyButtons.length).toBe(fakeArtifacts.length);
        await Promise.all(
          fakeArtifacts.map(async (fakeArtifact, index) => {
            const row: MatRowHarnessColumnsText = await rows[index].getCellTextByColumnName();
            const chips: MatChipHarness[] = await chipLists[index].getChips();

            expect(row.modelName).toEqual(fakeArtifact.name);
            expect(row.version).toEqual(String(fakeArtifact.version));
            expect(row.stage.toUpperCase().replace(" ", "_")).toEqual(fakeArtifact.model.stage);
            expect(row.actions).toBe("edithistory");
            await chipsEqualRuns(chips, fakeArtifact);
          })
        );
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

      it("should show tool tip for edit button in row", async () => {
        // arrange + act also in beforeEach
        const toolTips: MatTooltipHarness[] = await loader.getAllHarnesses(MatTooltipHarness);

        // act
        await toolTips[0].show();

        // assert
        expect(await toolTips[0].getTooltipText()).toEqual(`Edit ${fakeArtifacts[0].name} model`);
      });

      it("should call openModelStageLog with model on clicking model stage log button in row", async () => {
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

      it("should show tool tip for model stage log button in row", async () => {
        // arrange + act also in beforeEach
        const toolTips: MatTooltipHarness[] = await loader.getAllHarnesses(MatTooltipHarness);

        // act
        await toolTips[1].show();

        // assert
        expect(await toolTips[1].getTooltipText()).toEqual(`Show model stage log for ${fakeArtifacts[0].name}`);
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

  async function chipsEqualRuns(chips: MatChipHarness[], artifact: Artifact) {
    await Promise.all(
      chips.map(async (chip, index) => {
        expect(await chip.getText()).toEqual(`${artifact.runs[index].name} - ${artifact.runs[index].key}`);
      })
    );
  }
});
