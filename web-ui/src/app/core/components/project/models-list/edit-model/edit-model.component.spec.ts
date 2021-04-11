import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AbstractControl, FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatOptionHarness } from '@angular/material/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatFormFieldHarness } from '@angular/material/form-field/testing';
import { MatInputModule } from '@angular/material/input';
import { MatInputHarness } from '@angular/material/input/testing';
import { MatSelectModule } from '@angular/material/select';
import { MatSelectHarness } from '@angular/material/select/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { Artifact } from 'src/app/core/models/artifact.model';
import { getRandomArtifact } from 'src/app/mocks/fake-generator';
import { ModelStageI18nComponent } from '../../shared/model-stage-i18n/model-stage-i18n.component';

import { EditModelComponent } from './edit-model.component';

describe('EditModelComponent', () => {
  let component: EditModelComponent;
  let fixture: ComponentFixture<EditModelComponent>;

  // dialog mock 
  // https://github.com/angular/quickstart/issues/320#issuecomment-404705258
  // https://stackoverflow.com/questions/54108924/this-dialogref-close-is-not-a-function-error/54109919
  let dialogMock;

  // fakes
  let fakeArtifact: Artifact;
  let formData: { artifact: Artifact, title: string, };

  beforeEach(async () => {
    // prepare dialog mock object
    dialogMock = {
      open: () => ({ afterClosed: () => of(true) }),
      close: () => { 
        // This is intentional 
      },
    };

    // setup experiment fake
    fakeArtifact = await getRandomArtifact();

    // setup formData
    formData = {
      title: 'Artifact',
      artifact: fakeArtifact,
    };

    await TestBed.configureTestingModule({
      declarations: [
        EditModelComponent,
        ModelStageI18nComponent,
      ],
      providers: [
        { provide: MatDialogRef, useValue: dialogMock },
        FormBuilder,
        { provide: MAT_DIALOG_DATA, useValue: formData }
      ],
      imports: [
        BrowserAnimationsModule,
        FormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        ReactiveFormsModule,
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('constructor', () => {
    it('should set currentStage to provided model stage', () => {
      // arrange + act in beforeEach

      // assert
      expect(component.currentStage).toEqual(fakeArtifact.model.stage);
    });

    it('should init form group with provided experiment', async () => {
      // arrange + act also in beforeEach

      // assert
      expect(component.form).not.toBeNull()
      expect(component.form.get('modelName').value).toEqual(fakeArtifact.name);
      expect(component.form.get('runName').value).toEqual(fakeArtifact.runName);
      expect(component.form.get('version').value).toEqual(fakeArtifact.version);
      expect(component.form.get('stage').value).toEqual(component.currentStage);
      expect(component.form.get('note').value).toEqual(component.note);
    });

    it('should init form group with required validator for control stage', async () => {
      // arrange in beforeEach

      // act
      const control: AbstractControl = component.form.get('stage');

      // assert 
      expect(control.valid).toBeTruthy();

      // act
      control.patchValue('');

      // assert
      expect(control.valid).toBeFalsy();
    });
  });

  describe('cancel', () => {
    it('should call close on dialog', async () => {
      // arrange in beforeEach
      const spy = spyOn(dialogMock, 'close').and.callThrough();

      // act
      component.cancel();

      // assert
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update form note to component note and call close with form values', async () => {
      // arrange in beforeEach
      const spy = spyOn(dialogMock, 'close').and.callThrough();
      component.note = 'This is a test note';
      const control: AbstractControl = component.form.get('note');

      // act
      component.update();

      // assert
      expect(control.value).toEqual(component.note);
      expect(spy).toHaveBeenCalledWith(component.form.value);
    });
  });

  describe('component rendering', () => {
    it('should contain components title', async () => {
      // arrange + act also in beforeEach
      let h1: HTMLElement = fixture.nativeElement.querySelector('h1');

      // assert
      expect(h1.textContent).toEqual(formData.title);
    });

    describe('edit model form', () => {
      let loader: HarnessLoader;

      beforeEach(() => {
        loader = TestbedHarnessEnvironment.loader(fixture);
      })
      it('should have 5 form fields with labels', async () => {
        // arrange
        const formFields: MatFormFieldHarness[] = await loader.getAllHarnesses(MatFormFieldHarness);

        // assert
        expect(formFields.length).toBe(5);
        formFields.forEach(async formField => {
          expect(await formField.hasLabel()).toBeTruthy();
        })
      });

      it('should have prefilled readonly form field -- model name', async () => {
        // arrange
        // Have to add " *" to label because it is required
        const formField: MatFormFieldHarness = await loader.getHarness(MatFormFieldHarness.with({ floatingLabelText: 'Model name' }));
        const input: MatInputHarness = await loader.getHarness(MatInputHarness.with({ value: fakeArtifact.name }));

        // assert
        expect(formField).not.toBeNull();
        expect(input).not.toBeNull();
        expect(await input.isReadonly()).toBeTruthy();
        expect(await input.getPlaceholder()).toEqual('Model name');
      });

      it('should have prefilled readonly form field -- run name', async () => {
        // arrange
        // Have to add " *" to label because it is required
        const formField: MatFormFieldHarness = await loader.getHarness(MatFormFieldHarness.with({ floatingLabelText: 'Run name' }));
        const input: MatInputHarness = await loader.getHarness(MatInputHarness.with({ value: fakeArtifact.runName }));

        // assert
        expect(formField).not.toBeNull();
        expect(input).not.toBeNull();
        expect(await input.isReadonly()).toBeTruthy();
        expect(await input.getPlaceholder()).toEqual('Run name');
      });

      it('should have prefilled readonly form field -- model version', async () => {
        // arrange
        // Have to add " *" to label because it is required
        const formField: MatFormFieldHarness = await loader.getHarness(MatFormFieldHarness.with({ floatingLabelText: 'Model version' }));
        const input: MatInputHarness = await loader.getHarness(MatInputHarness.with({ value: String(fakeArtifact.version) }));

        // assert
        expect(formField).not.toBeNull();
        expect(input).not.toBeNull();
        expect(await input.isReadonly()).toBeTruthy();
        expect(await input.getPlaceholder()).toEqual('Model version');
      });

      it('should have prefilled and required form field -- model stage', async () => {
        // arrange
        // Have to add " *" to label because it is required
        const formField: MatFormFieldHarness = await loader.getHarness(MatFormFieldHarness.with({ floatingLabelText: 'Model stage *' }));
        const select: MatSelectHarness = await loader.getHarness(MatSelectHarness);
        await select.open();
        const options: MatOptionHarness[] = await select.getOptions();

        // assert
        expect(formField).not.toBeNull();
        expect(await select.isRequired()).toBeTruthy();
        expect(select).not.toBeNull();
        expect((await select.getValueText()).toUpperCase().replace(' ', '_')).toEqual(fakeArtifact.model.stage);
        expect(options.length).toBe(5);
      });

      it('should have prefilled readonly form field -- note', async () => {
        // arrange
        // Have to add " *" to label because it is required
        const formField: MatFormFieldHarness = await loader.getHarness(MatFormFieldHarness.with({ floatingLabelText: 'Note' }));
        const input: MatInputHarness = await loader.getHarness(MatInputHarness.with({ value: component.note }));

        // assert
        expect(formField).not.toBeNull();
        expect(input).not.toBeNull();
        expect(await input.getValue()).toEqual('');
        expect(await input.getPlaceholder()).toEqual('Tell us why the stage changed');
      });

      describe('cancel button', () => {
        it('should have cancel button', async () => {
          // arrange also in beforeEach
          const cancelButton: MatButtonHarness = await loader.getHarness(MatButtonHarness.with({ selector: '#edit-model-cancel-button' }));

          // assert
          expect(await cancelButton.getText()).toEqual('Cancel');
        });

        it('should call cancel when clicking cancel button', async () => {
          // arrange also in beforeEach
          spyOn(component, 'cancel');
          const cancelButton: MatButtonHarness = await loader.getHarness(MatButtonHarness.with({ selector: '#edit-model-cancel-button' }));

          // act
          await cancelButton.click();

          // assert
          expect(component.cancel).toHaveBeenCalled();
        });
      });

      describe('update button', () => {
        it('should have update button', async () => {
          // arrange also in beforeEach
          const updateButton: MatButtonHarness = await loader.getHarness(MatButtonHarness.with({ selector: '#edit-model-update-button' }));

          // assert
          expect(await updateButton.getText()).toEqual('Update');
        });

        it('should call update when clicking update button', async () => {
          // arrange also in beforeEach
          spyOn(component, 'update');
          const createOrUpdateExperimentButton: MatButtonHarness = await loader.getHarness(MatButtonHarness.with({ selector: '#edit-model-update-button' }));

          // act
          await createOrUpdateExperimentButton.click()

          // assert
          expect(component.update).toHaveBeenCalled();
        });
      });
    });
  });
});
