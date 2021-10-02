import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SshKeysComponent } from './ssh-keys.component';
import { MockStore, provideMockStore } from "@ngrx/store/testing";
import { Action } from "@ngrx/store";
import { HarnessLoader } from "@angular/cdk/testing";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatDialogModule } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatTableModule } from "@angular/material/table";
import { openAddSshKeyDialog } from "@mlaide/state/ssh-key/ssh-key.actions";
import { MatButtonHarness } from "@angular/material/button/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { selectSshKeys, selectIsLoadingSshKeys } from "@mlaide/state/ssh-key/ssh-key.selectors";
import { SshKey } from "@mlaide/state/ssh-key/ssh-key.models";
import { getRandomSshKeys } from "@mlaide/mocks/fake-generator";
import { loadSshKeys } from "@mlaide/state/ssh-key/ssh-key.actions";
import { deleteSshKey } from "@mlaide/state/ssh-key/ssh-key.actions";
import {
  MatHeaderRowHarness,
  MatRowHarness,
  MatRowHarnessColumnsText,
  MatTableHarness
} from "@angular/material/table/testing";
import { of } from "rxjs";
import { MatCardHarness } from "@angular/material/card/testing";
import { MatProgressSpinnerHarness } from "@angular/material/progress-spinner/testing";
import { MockPipe } from "ng-mocks";
import { DatePipe } from "@angular/common";
import { MatIconHarness } from "@angular/material/icon/testing";
import { showSuccessMessage } from "@mlaide/state/shared/shared.actions";
import { ClipboardModule } from "@angular/cdk/clipboard";

describe('SshKeysComponent', () => {
  let component: SshKeysComponent;
  let fixture: ComponentFixture<SshKeysComponent>;
  let loader: HarnessLoader;

  // fakeVariables
  let fakeSshKeys: SshKey[];

  let store: MockStore;
  let dispatchSpy: jasmine.Spy<(action: Action) => void>;

  beforeEach(async () => {
    // arrange fakes
    fakeSshKeys = await getRandomSshKeys();

    await TestBed.configureTestingModule({
      declarations: [
        MockPipe(DatePipe, (v) => v),
        SshKeysComponent,
      ],
      providers: [
        provideMockStore(),
      ],
      imports: [
        BrowserAnimationsModule,
        ClipboardModule,
        MatButtonModule,
        MatCardModule,
        MatDialogModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatTableModule
      ],
    })
    .compileComponents();

    store = TestBed.inject(MockStore);

    store.overrideSelector(selectSshKeys, fakeSshKeys);
    store.overrideSelector(selectIsLoadingSshKeys, true);

    dispatchSpy = spyOn(store, 'dispatch');
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SshKeysComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe("ngOnInit", () => {
    it("should select ssh keys from store correctly", async (done) => {
      // arrange + act in beforeEach

      // assert
      component.sshKeys$.subscribe((sshKeys) => {
        expect(sshKeys).toBe(fakeSshKeys);
        done();
      });
    });

    it("should select selectIsLoadingSshKeys from store correctly", async (done) => {
      // arrange + act in beforeEach

      // assert
      component.isLoading$.subscribe((isLoading) => {
        expect(isLoading).toBe(true);
        done();
      });
    });

    it("should dispatch loadSshKeys action", () => {
      // ngOnInit will be called in beforeEach while creating the component

      // assert
      expect(dispatchSpy).toHaveBeenCalledWith(loadSshKeys());
    });
  });

  describe("addSshKey", () => {
    it("should dispatch addSshKey action", async () => {
      // arrange + act in beforeEach

      // act
      component.addSshKey();

      // assert
      expect(dispatchSpy).toHaveBeenCalledWith(openAddSshKeyDialog());
    });
  });

  describe("copy", () => {
    it("should dispatch showSuccessMessage action with correct message", async () => {
      // arrange in beforeEach

      // act
      component.copy();

      // assert
      expect(dispatchSpy).toHaveBeenCalledWith(showSuccessMessage({
        message: "Successfully copied to clipboard!"
      }));
    });
  });

  describe("deleteSshKey", () => {
    it("should dispatch deleteSshKey action with provided ssh key", async () => {
      // arrange + act in beforeEach

      // act
      component.deleteSshKey(fakeSshKeys[0]);

      // assert
      expect(dispatchSpy).toHaveBeenCalledWith(deleteSshKey({sshKey: fakeSshKeys[0]}));
    });
  });

  describe("component rendering", () => {
    it("should contain components title", async () => {
      // arrange + act also in beforeEach
      let h1: HTMLElement = fixture.nativeElement.querySelector("h1");

      // assert
      expect(h1.textContent).toEqual("SSH Keys");
    });

    describe("add ssh key", () => {
      const addSshKeyButtonTitle = "Add SSH Key";
      it("should contain add ssh key button", () => {
        // arrange + act also in beforeEach
        let addSshKeyButton: HTMLElement = fixture.nativeElement.querySelector("button");

        // assert
        expect(addSshKeyButton).toBeTruthy();
        expect(addSshKeyButton.textContent).toContain(addSshKeyButtonTitle);
      });

      it("should call openAddSshKeyDialog on clicking the add ssh key button", async () => {
        // arrange + act also in beforeEach
        spyOn(component, "addSshKey");
        const addSshKeyButton = await loader.getHarness(MatButtonHarness.with({ text: addSshKeyButtonTitle }));

        // act
        await addSshKeyButton.click();
        // assert
        fixture.whenStable().then(() => {
          expect(component.addSshKey).toHaveBeenCalled();
        });
      });
    });

    describe("ssh keys table", () => {
      it("should contain the ssh keys table", () => {
        // arrange + act also in beforeEach
        let sshKeysTable: HTMLElement = fixture.nativeElement.querySelector("table");

        // assert
        expect(sshKeysTable.textContent).toBeTruthy();
      });

      it("should have defined headers", async () => {
        // arrange + act also in beforeEach
        const table: MatTableHarness = await loader.getHarness(MatTableHarness);
        const headers: MatHeaderRowHarness[] = await table.getHeaderRows();
        const headerRow: MatRowHarnessColumnsText = await headers[0].getCellTextByColumnName();

        // assert
        expect(Object.keys(headerRow).length).toBe(5);
        expect(headerRow.description).toBe("Description");
        expect(headerRow.sshKey).toBe("Key");
        expect(headerRow.createdAt).toBe("Created at");
        expect(headerRow.expiresAt).toBe("Expires at");
        expect(headerRow.actions).toBe("Actions");
      });

      it("should show row for each ssh key", async () => {
        // arrange + act also in beforeEach
        const table: MatTableHarness = await loader.getHarness(MatTableHarness);
        const rows: MatRowHarness[] = await table.getRows();
        const deleteButtons: MatButtonHarness[] = await loader.getAllHarnesses(MatButtonHarness.with({ text: "delete" }));

        // assert
        expect(rows.length).toBe(fakeSshKeys.length);
        expect(deleteButtons.length).toBe(fakeSshKeys.length);
        await Promise.all(fakeSshKeys.map(async (fakeSshKey, index) => {
          const row: MatRowHarnessColumnsText = await rows[index].getCellTextByColumnName();
          expect(row.description).toEqual(fakeSshKey.description);
          expect(row.sshKey).toEqual(fakeSshKey.sshKey);
          expect(row.createdAt).toEqual(String(fakeSshKey.createdAt));
          expect(row.expiresAt).toEqual(String(fakeSshKey.expiresAt));
          expect(row.actions).toBe("content_copydelete");
        }));
      });

      it('should show "never" in expires at cell if it is undefined', async () => {
        // arrange + act also in beforeEach
        fakeSshKeys[0].expiresAt = undefined;
        const table: MatTableHarness = await loader.getHarness(MatTableHarness);
        const rows: MatRowHarness[] = await table.getRows();
        const firstRow: MatRowHarnessColumnsText = await rows[0].getCellTextByColumnName();

        // assert
        expect(firstRow.expiresAt).toEqual("never");
      });

      it('should show "-" in expires at cell if it is null', async () => {
        // arrange + act also in beforeEach
        fakeSshKeys[0].expiresAt = null;
        const table: MatTableHarness = await loader.getHarness(MatTableHarness);
        const rows: MatRowHarness[] = await table.getRows();
        const firstRow: MatRowHarnessColumnsText = await rows[0].getCellTextByColumnName();

        // assert
        expect(firstRow.expiresAt).toEqual("never");
      });

      it("should have a copy button", async () => {
        // arrange also in beforeEach
        const button: MatButtonHarness = await loader.getHarness(
          MatButtonHarness.with({ selector: "#ssh-key-copy-button" })
        );
        const icon: MatIconHarness = await loader.getHarness(MatIconHarness.with({ name: "content_copy" }));

        // assert
        expect(button).toBeTruthy();
        expect(icon).toBeTruthy();
        expect(await button.getText()).toEqual("content_copy");
      });

      it("should call copy when clicking copy button", async () => {
        // arrange also in beforeEach
        spyOn(component, "copy");
        const button: MatButtonHarness = await loader.getHarness(
          MatButtonHarness.with({ selector: "#ssh-key-copy-button" })
        );

        // act
        await button.click();

        // assert
        expect(component.copy).toHaveBeenCalled();
      });

      it("should call deleteSshKey on clicking delete button in row", async () => {
        // arrange + act also in beforeEach
        spyOn(component, "deleteSshKey");
        const deleteButtons: MatButtonHarness[] = await loader.getAllHarnesses(MatButtonHarness.with({ text: "delete" }));

        // act
        await deleteButtons[deleteButtons.length - 1].click();

        // assert
        fixture.whenStable().then(() => {
          expect(component.deleteSshKey).toHaveBeenCalledWith(fakeSshKeys[fakeSshKeys.length - 1]);
        });
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
