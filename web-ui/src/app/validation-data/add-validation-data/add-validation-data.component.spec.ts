import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddValidationDataComponent } from './add-validation-data.component';

describe('AddValidationDataComponent', () => {
  let component: AddValidationDataComponent;
  let fixture: ComponentFixture<AddValidationDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddValidationDataComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddValidationDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
