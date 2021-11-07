import { HarnessLoader } from "@angular/cdk/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { DatePipe } from "@angular/common";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MatButtonModule } from "@angular/material/button";
import { MatButtonHarness } from "@angular/material/button/testing";
import { MatDialogModule } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { MatTableModule } from "@angular/material/table";
import { MatHeaderRowHarness, MatRowHarness, MatRowHarnessColumnsText, MatTableHarness } from "@angular/material/table/testing";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MockPipe } from "ng-mocks";
import { of } from "rxjs";
import { getRandomApiKeys } from "@mlaide/mocks/fake-generator";

import { ApiKeysComponent } from "./api-keys.component";
import { MockStore, provideMockStore } from "@ngrx/store/testing";
import { Action } from "@ngrx/store";
import { selectApiKeys, selectIsLoadingApiKeys } from "@mlaide/state/api-key/api-key.selectors";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatCardModule } from "@angular/material/card";
import { addApiKey, deleteApiKey, loadApiKeys, openAddApiKeyDialog } from "@mlaide/state/api-key/api-key.actions";
import { MatCardHarness } from "@angular/material/card/testing";
import { MatProgressSpinnerHarness } from "@angular/material/progress-spinner/testing";
import { ApiKey } from "@mlaide/state/api-key/api-key.models";
import { MatTooltipHarness } from "@angular/material/tooltip/testing";
import { MatTooltipModule } from "@angular/material/tooltip";

describe("ApiKeysComponent", () => {
  let component: ApiKeysComponent;
  let fixture: ComponentFixture<ApiKeysComponent>;
  let loader: HarnessLoader;

  // fakeVariables
  let fakeApiKeys: ApiKey[];

  let store: MockStore;
  let dispatchSpy: jasmine.Spy<(action: Action) => void>;

  beforeEach(async () => {
    // arrange fakes
    fakeApiKeys = await getRandomApiKeys();

    await TestBed.configureTestingModule({
      declarations: [
        ApiKeysComponent,
        MockPipe(DatePipe, (v) => v)
      ],
      providers: [
        provideMockStore(),
      ],
      imports: [
        BrowserAnimationsModule,
        MatButtonModule,
        MatCardModule,
        MatDialogModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatTableModule,
        MatTooltipModule,
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);

    store.overrideSelector(selectApiKeys, fakeApiKeys);
    store.overrideSelector(selectIsLoadingApiKeys, true);

    dispatchSpy = spyOn(store, 'dispatch');
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApiKeysComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("ngOnInit", () => {
    it("should select api keys from store correctly", async (done) => {
      // arrange + act in beforeEach

      // assert
      component.apiKeys$.subscribe((apiKeys) => {
        expect(apiKeys).toBe(fakeApiKeys);
        done();
      });
    });

    it("should select selectIsLoadingApiKeys from store correctly", async (done) => {
      // arrange + act in beforeEach

      // assert
      component.isLoading$.subscribe((isLoading) => {
        expect(isLoading).toBe(true);
        done();
      });
    });

    it("should dispatch loadApiKeys action", () => {
      // ngOnInit will be called in beforeEach while creating the component

      // assert
      expect(dispatchSpy).toHaveBeenCalledWith(loadApiKeys());
    });
  });

  describe("addApiKey", () => {
    it("should dispatch addApiKey action", async () => {
      // arrange + act in beforeEach

      // act
      component.addApiKey();

      // assert
      expect(dispatchSpy).toHaveBeenCalledWith(openAddApiKeyDialog());
    });
  });

  describe("deleteApiKey", () => {
    it("should dispatch deleteApiKey action with provided api key", async () => {
      // arrange + act in beforeEach

      // act
      component.deleteApiKey(fakeApiKeys[0]);

      // assert
      expect(dispatchSpy).toHaveBeenCalledWith(deleteApiKey({apiKey: fakeApiKeys[0]}));
    });
  });

  describe("component rendering", () => {
    it("should contain components title", async () => {
      // arrange + act also in beforeEach
      let h1: HTMLElement = fixture.nativeElement.querySelector("h1");

      // assert
      expect(h1.textContent).toEqual("API Keys");
    });

    describe("add api key", () => {
      const addApiKeyButtonTitle = "Add API Key";
      it("should contain add api key button", () => {
        // arrange + act also in beforeEach
        let addApiKeyButton: HTMLElement = fixture.nativeElement.querySelector("button");

        // assert
        expect(addApiKeyButton).toBeTruthy();
        expect(addApiKeyButton.textContent).toContain(addApiKeyButtonTitle);
      });

      it("should call openAddApiKeyDialog on clicking the add api key button", async () => {
        // arrange + act also in beforeEach
        spyOn(component, "addApiKey");
        const addApiKeyButton = await loader.getHarness(MatButtonHarness.with({ text: addApiKeyButtonTitle }));

        // act
        await addApiKeyButton.click();
        // assert
        fixture.whenStable().then(() => {
          expect(component.addApiKey).toHaveBeenCalled();
        });
      });
    });

    describe("api keys table", () => {
      it("should contain the api keys table", () => {
        // arrange + act also in beforeEach
        let apiKeysTable: HTMLElement = fixture.nativeElement.querySelector("table");

        // assert
        expect(apiKeysTable.textContent).toBeTruthy();
      });

      it("should have defined headers", async () => {
        // arrange + act also in beforeEach
        const table: MatTableHarness = await loader.getHarness(MatTableHarness);
        const headers: MatHeaderRowHarness[] = await table.getHeaderRows();
        const headerRow: MatRowHarnessColumnsText = await headers[0].getCellTextByColumnName();

        // assert
        expect(Object.keys(headerRow).length).toBe(4);
        expect(headerRow.description).toBe("Description");
        expect(headerRow.createdAt).toBe("Created at");
        expect(headerRow.expiresAt).toBe("Expires at");
        expect(headerRow.actions).toBe("Actions");
      });

      it("should show row for each api key", async () => {
        // arrange + act also in beforeEach
        const table: MatTableHarness = await loader.getHarness(MatTableHarness);
        const rows: MatRowHarness[] = await table.getRows();
        const deleteButtons: MatButtonHarness[] = await loader.getAllHarnesses(MatButtonHarness.with({ text: "delete" }));

        // assert
        expect(rows.length).toBe(fakeApiKeys.length);
        expect(deleteButtons.length).toBe(fakeApiKeys.length);
        await Promise.all(fakeApiKeys.map(async (fakeApiKey, index) => {
          const row: MatRowHarnessColumnsText = await rows[index].getCellTextByColumnName();
          expect(row.description).toEqual(fakeApiKey.description);
          expect(row.createdAt).toEqual(String(fakeApiKey.createdAt));
          expect(row.expiresAt).toEqual(String(fakeApiKey.expiresAt));
          expect(row.actions).toBe("delete");
        }));
      });

      it('should show "never" in expires at cell if it is undefined', async () => {
        // arrange + act also in beforeEach
        fakeApiKeys[0].expiresAt = undefined;
        const table: MatTableHarness = await loader.getHarness(MatTableHarness);
        const rows: MatRowHarness[] = await table.getRows();
        const firstRow: MatRowHarnessColumnsText = await rows[0].getCellTextByColumnName();

        // assert
        expect(firstRow.expiresAt).toEqual("never");
      });

      it('should show "-" in expires at cell if it is null', async () => {
        // arrange + act also in beforeEach
        fakeApiKeys[0].expiresAt = null;
        const table: MatTableHarness = await loader.getHarness(MatTableHarness);
        const rows: MatRowHarness[] = await table.getRows();
        const firstRow: MatRowHarnessColumnsText = await rows[0].getCellTextByColumnName();

        // assert
        expect(firstRow.expiresAt).toEqual("never");
      });

      it("should call deleteApiKey on clicking delete button in row", async () => {
        // arrange + act also in beforeEach
        spyOn(component, "deleteApiKey");
        const deleteButtons: MatButtonHarness[] = await loader.getAllHarnesses(MatButtonHarness.with({ text: "delete" }));

        // act
        await deleteButtons[deleteButtons.length - 1].click();

        // assert
        fixture.whenStable().then(() => {
          expect(component.deleteApiKey).toHaveBeenCalledWith(fakeApiKeys[fakeApiKeys.length - 1]);
        });
      });

      it("should show tool tip for delete button in row", async () => {
        // arrange + act also in beforeEach
        const toolTips: MatTooltipHarness[] = await loader.getAllHarnesses(MatTooltipHarness);

        // act
        await toolTips[0].show();

        // assert
        expect(await toolTips[0].getTooltipText()).toEqual(`Delete API key`);
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
