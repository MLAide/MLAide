import { HarnessLoader } from "@angular/cdk/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { DatePipe } from "@angular/common";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MatButtonModule } from "@angular/material/button";
import { MatButtonHarness } from "@angular/material/button/testing";
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatSortModule } from "@angular/material/sort";
import { MatTableModule } from "@angular/material/table";
import { MatHeaderRowHarness, MatRowHarness, MatRowHarnessColumnsText, MatTableHarness } from "@angular/material/table/testing";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MockPipe } from "ng-mocks";
import { of } from "rxjs";
import { ModelRevision } from "@mlaide/entities/artifact.model";
import { getRandomModelRevisions } from "src/app/mocks/fake-generator";
import { ModelStageI18nComponent } from "../../shared/components/model-stage-i18n/model-stage-i18n.component";

import { ModelStageLogComponent } from "./model-stage-log.component";

// TODO Raman: Fix Tests
describe("ModelStageLogComponent", () => {
  let component: ModelStageLogComponent;
  let fixture: ComponentFixture<ModelStageLogComponent>;

  // dialog mock
  // https://github.com/angular/quickstart/issues/320#issuecomment-404705258
  // https://stackoverflow.com/questions/54108924/this-dialogref-close-is-not-a-function-error/54109919
  let dialogMock;

  // fakes
  let fakeModelRevisions: ModelRevision[];
  let formData: { modelRevisions: ModelRevision[]; title: string };

  beforeEach(async () => {
    // prepare dialog mock object
    dialogMock = {
      open: () => ({ afterClosed: () => of(true) }),
      close: () => {
        // This is intentional
      },
    };

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
        { provide: MatDialogRef, useValue: dialogMock },
        { provide: MAT_DIALOG_DATA, useValue: formData },
      ],
      imports: [BrowserAnimationsModule, MatButtonModule, MatDialogModule, MatTableModule, MatSortModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModelStageLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("ngOnInit", () => {
    it("should set datasource to provided mode revisions", () => {
      // arrange + act in beforeEach

      // assert
      expect(component.dataSource.data).toEqual(formData.modelRevisions);
    });
  });

  describe("ngAfterViewInit", () => {
    it("should set datasource sort", () => {
      // arrange + act in beforeEach

      // assert
      expect(component.dataSource.sort).toEqual(component.sort);
    });
  });

  describe("close", () => {
    it("should call close on dialog", async () => {
      // arrange in beforeEach
      const spy = spyOn(dialogMock, "close").and.callThrough();

      // act
      component.close();

      // assert
      expect(spy).toHaveBeenCalled();
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
        fakeModelRevisions.forEach(async (fakeModelRevision, index) => {
          const row: MatRowHarnessColumnsText = await rows[index].getCellTextByColumnName();

          expect(row.createdAt).toEqual(String(fakeModelRevision.createdAt));
          expect(row.createdBy).toEqual(fakeModelRevision.createdBy.nickName);
          expect(row.oldStage.toUpperCase().replace(" ", "_")).toEqual(fakeModelRevision.oldStage);
          expect(row.newStage.toUpperCase().replace(" ", "_")).toEqual(fakeModelRevision.newStage);
          expect(row.note).toEqual(fakeModelRevision.note);
        });
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
