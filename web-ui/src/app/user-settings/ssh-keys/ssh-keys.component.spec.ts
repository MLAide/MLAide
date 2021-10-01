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

describe('SshKeysComponent', () => {
  let component: SshKeysComponent;
  let fixture: ComponentFixture<SshKeysComponent>;
  let loader: HarnessLoader;

  let store: MockStore;
  let dispatchSpy: jasmine.Spy<(action: Action) => void>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SshKeysComponent ],
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
        MatTableModule
      ],
    })
    .compileComponents();

    store = TestBed.inject(MockStore);

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

  describe("addSshKey", () => {
    it("should dispatch addSshKey action", async () => {
      // arrange + act in beforeEach

      // act
      component.addSshKey();

      // assert
      expect(dispatchSpy).toHaveBeenCalledWith(openAddSshKeyDialog());
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

      it("should call openAddSshKeyDialog on clicking the add api key button", async () => {
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
  });
});
