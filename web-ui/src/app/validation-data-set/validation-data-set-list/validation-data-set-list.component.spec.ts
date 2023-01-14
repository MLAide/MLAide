import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidationDataSetListComponent } from './validation-data-set-list.component';

describe('ValidationDataSetListComponent', () => {
  let component: ValidationDataSetListComponent;
  let fixture: ComponentFixture<ValidationDataSetListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ValidationDataSetListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ValidationDataSetListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
