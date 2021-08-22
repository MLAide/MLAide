import { HarnessLoader } from "@angular/cdk/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { DatePipe } from "@angular/common";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MatButtonModule } from "@angular/material/button";
import { MatButtonHarness } from "@angular/material/button/testing";
import { MatDialogModule, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatSortModule } from "@angular/material/sort";
import { MatTableModule } from "@angular/material/table";
import { MatHeaderRowHarness, MatRowHarness, MatRowHarnessColumnsText, MatTableHarness } from "@angular/material/table/testing";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MockPipe } from "ng-mocks";
import { getRandomModelRevisions } from "@mlaide/mocks/fake-generator";
import { ModelStageI18nComponent } from "@mlaide/shared/components/model-stage-i18n/model-stage-i18n.component";

import { ModelStageLogComponent } from "./model-stage-log.component";
import { MockStore, provideMockStore } from "@ngrx/store/testing";
import { Action } from "@ngrx/store";
import { AppState } from "@mlaide/state/app.state";
import { closeModelStageLogDialog } from "@mlaide/state/artifact/artifact.actions";
import { ModelRevision } from "@mlaide/state/artifact/artifact.models";

describe("ModelStageLogComponent", () => {
  let component: ModelStageLogComponent;
  let fixture: ComponentFixture<ModelStageLogComponent>;

  // fakes
  let fakeModelRevisions: ModelRevision[];
  let formData: { modelRevisions: ModelRevision[]; title: string };

  let store: MockStore<AppState>;
  let dispatchSpy: jasmine.Spy<(action: Action) => void>;

  beforeEach(async () => {
    // setup experiment fake
    fakeModelRevisions = await getRandomModelRevisions();

    // setup formData
    formData = {
      modelRevisions: fakeModelRevisions,
      title: "Models log",
    };

    await TestBed.configureTestingModule({
      declarations: [ModelStageLogComponent, ModelStageI18nComponent, MockPipe(DatePipe, (v) => v)],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: formData },
        provideMockStore()
      ],
      imports: [BrowserAnimationsModule, MatButtonModule, MatDialogModule, MatTableModule, MatSortModule],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    dispatchSpy = spyOn(store, 'dispatch');
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModelStageLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("close", () => {
    it("should call close on dialog", async () => {
      // arrange in beforeEach

      // act
      component.close();

      // assert
      expect(dispatchSpy).toHaveBeenCalledOnceWith(closeModelStageLogDialog());
    });
  });

  describe("component rendering", () => {
    it("should contain components title", async () => {
      // arrange + act also in beforeEach
      let h1: HTMLElement = fixture.nativeElement.querySelector("h1");

      // assert
      expect(h1.textContent).toEqual(formData.title);
    });

    describe("model log table", () => {
      let loader: HarnessLoader;

      beforeEach(() => {
        loader = TestbedHarnessEnvironment.loader(fixture);
      });

      it("should contain the model log table", () => {
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
        expect(headerRow.createdAt).toBe("Created at");
        expect(headerRow.createdBy).toBe("User");
        expect(headerRow.oldStage).toBe("From stage");
        expect(headerRow.newStage).toBe("To stage");
        expect(headerRow.note).toBe("Note");
      });

      it("should show row for each model revision", async () => {
        // arrange + act also in beforeEach
        const table: MatTableHarness = await loader.getHarness(MatTableHarness);
        const rows: MatRowHarness[] = await table.getRows();

        // assert
        expect(rows.length).toBe(fakeModelRevisions.length);
        await Promise.all(fakeModelRevisions.map(async (fakeModelRevision, index) => {
          const row: MatRowHarnessColumnsText = await rows[index].getCellTextByColumnName();

          expect(row.createdAt).toEqual(String(fakeModelRevision.createdAt));
          expect(row.createdBy).toEqual(fakeModelRevision.createdBy.nickName);
          expect(row.oldStage.toUpperCase().replace(" ", "_")).toEqual(fakeModelRevision.oldStage);
          expect(row.newStage.toUpperCase().replace(" ", "_")).toEqual(fakeModelRevision.newStage);
          expect(row.note).toEqual(fakeModelRevision.note);
        }));
      });

      describe("close button", () => {
        it("should have close button", async () => {
          // arrange also in beforeEach
          const closeButton: MatButtonHarness = await loader.getHarness(
            MatButtonHarness.with({ selector: "#model-stage-close-button" })
          );

          // assert
          expect(await closeButton.getText()).toEqual("Close");
        });

        it("should call close when clicking close button", async () => {
          // arrange also in beforeEach
          spyOn(component, "close");
          const closeButton: MatButtonHarness = await loader.getHarness(
            MatButtonHarness.with({ selector: "#model-stage-close-button" })
          );

          // act
          await closeButton.click();

          // assert
          expect(component.close).toHaveBeenCalled();
        });
      });
    });
  });
});
