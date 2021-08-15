import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RunNoteComponent } from './run-note.component';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MatInputModule } from "@angular/material/input";
import { HarnessLoader } from "@angular/cdk/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { MatFormFieldHarness } from "@angular/material/form-field/testing";
import { MatButtonHarness } from "@angular/material/button/testing";

describe('RunNoteComponent', () => {
  let component: RunNoteComponent;
  let fixture: ComponentFixture<RunNoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RunNoteComponent ],
      imports: [
        BrowserAnimationsModule,
        MatInputModule,
        ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RunNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should set currentNote to empty string if input string is empty', () => {
      // arrange + act in beforeEach

      // assert
      expect(component.currentNote).toEqual("");
    });

    it('should set currentNote to input string is empty', () => {
      // arrange in beforeEach
      component.note = "anyNote";

      // act
      component.ngOnInit();

      // assert
      expect(component.currentNote).toEqual("anyNote");
    });
  });

  describe("focusedNoteTextarea", () => {
    it("should set component's showButtons to true", async () => {
      // arrange + act in beforeEach

      // act
      component.focusedNoteTextarea();

      // assert
      expect(component.showNoteActionButtons).toBeTrue();
    });
  });

  describe("unfocusedNoteTextarea", () => {
    it("should set component's showNoteActionButtons to false", async () => {
      // arrange + act in beforeEach

      // act
      component.unfocusedNoteTextarea();

      // assert
      expect(component.showNoteActionButtons).toBeFalse();
    });

    it("should call save if component's cancledEditNote is false", async () => {
      // arrange + act also in beforeEach
      const spy = spyOn(component, "save").and.callThrough();

      // act
      component.unfocusedNoteTextarea();

      // assert
      expect(spy).toHaveBeenCalled();
    });

    it("should not call save if component's cancledEditNote is true", async () => {
      // arrange + act also in beforeEach
      const spy = spyOn(component, "save").and.callThrough();
      component.cancel();

      // act
      component.unfocusedNoteTextarea();

      // assert
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe("save", () => {
    it("should emit updateNote with currentNote if it doesn't equal input note", async () => {
      // arrange
      component.note = "input note";
      component.currentNote = "current note";
      fixture.detectChanges()
      spyOn(component.updateNote, 'emit');

      // act
      component.save();

      // assert
      expect(component.updateNote.emit).toHaveBeenCalled();
    });

    it("should not emit updateNote with currentNote if it equals input note", async () => {
      // arrange
      component.note = "current note";
      component.currentNote = "current note";
      fixture.detectChanges()
      spyOn(component.updateNote, 'emit');

      // act
      component.save();

      // assert
      expect(component.updateNote.emit).not.toHaveBeenCalled();
    });
  });

  describe("cancel", () => {
    it("should set currentNote to note if it is not empty", async () => {
      // arrange
      component.currentNote = "current note";
      component.note = "input note";
      fixture.detectChanges()

      // act
      component.cancel();

      // assert
      expect(component.currentNote).toEqual("input note");
    });

    it("should set currentNote to empty string if note is undefined", async () => {
      // arrange
      component.currentNote = "current note";
      component.note = undefined;
      fixture.detectChanges()

      // act
      component.cancel();

      // assert
      expect(component.currentNote).toEqual("");
    });

    it("should set currentNote to empty string if note is null", async () => {
      // arrange
      component.currentNote = "current note";
      component.note = null;
      fixture.detectChanges()

      // act
      component.cancel();

      // assert
      expect(component.currentNote).toEqual("");
    });
  });

  describe("component rendering", () => {
    let loader: HarnessLoader;

    beforeEach(async () => {
      loader = TestbedHarnessEnvironment.loader(fixture);
    });

    it("should have 1 form fields with labels", async () => {
      // arrange
      const formFields: MatFormFieldHarness[] = await loader.getAllHarnesses(MatFormFieldHarness);

      // assert
      expect(formFields.length).toBe(1);
      expect(await formFields[0].hasLabel()).toBeTruthy();
    });

    describe("save and cancel buttons", () => {
      describe("showNoteActionButtons is true", () => {
        beforeEach(async () => {
          component.showNoteActionButtons = true;
        });

        it("should have cancel button", async () => {
          // arrange + act also in beforeEach
          const button: MatButtonHarness = await loader.getHarness(
            MatButtonHarness.with({
              selector: "#update-note-cancel-button",
            })
          );

          // assert
          expect(button).toBeTruthy();
          expect(await button.getText()).toEqual("Cancel");
        });

        it("should call cancel when clicking cancel button", async () => {
          // arrange also in beforeEach
          spyOn(component, "cancel");
          const button: MatButtonHarness = await loader.getHarness(
            MatButtonHarness.with({
              selector: "#update-note-cancel-button",
            })
          );

          // act
          await button.click();

          // assert
          expect(component.cancel).toHaveBeenCalled();
        });

        it("should have save button", async () => {
          // arrange + act also in beforeEach
          const button: MatButtonHarness = await loader.getHarness(
            MatButtonHarness.with({
              selector: "#update-note-save-button",
            })
          );

          // assert
          expect(button).toBeTruthy();
          expect(await button.getText()).toEqual("Save");
        });

        it("should call save when clicking save button", async () => {
          // arrange also in beforeEach
          spyOn(component, "save");
          const button: MatButtonHarness = await loader.getHarness(
            MatButtonHarness.with({
              selector: "#update-note-save-button",
            })
          );

          // act
          await button.click();

          // assert
          expect(component.save).toHaveBeenCalled();
        });
      })

      describe("showNoteActionButtons is false", () => {
        it("should hide buttons if showNoteActionButtons is false", async () => {
          // arrange
          component.showNoteActionButtons = false;
          const buttons: MatButtonHarness[] = await loader.getAllHarnesses(MatButtonHarness);

          // assert
          expect(buttons.length).toBe(0);
        });
      });
    });
  });
});
