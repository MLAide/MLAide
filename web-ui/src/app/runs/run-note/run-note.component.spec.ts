import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RunNoteComponent } from './run-note.component';

describe('RunNoteComponent', () => {
  let component: RunNoteComponent;
  let fixture: ComponentFixture<RunNoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RunNoteComponent ]
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
});
