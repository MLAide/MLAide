import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddValidationDataSetComponent } from './add-validation-data-set.component';

describe('AddValidationDataSetComponent', () => {
  let component: AddValidationDataSetComponent;
  let fixture: ComponentFixture<AddValidationDataSetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddValidationDataSetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddValidationDataSetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
