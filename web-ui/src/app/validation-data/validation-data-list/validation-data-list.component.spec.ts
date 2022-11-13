import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidationDataListComponent } from './validation-data-list.component';

describe('ValidationDataListComponent', () => {
  let component: ValidationDataListComponent;
  let fixture: ComponentFixture<ValidationDataListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ValidationDataListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ValidationDataListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
