import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExperimentLineageVisualizationComponent } from './experiment-lineage-visualization.component';

describe('ExperimentLineageVisualizationComponent', () => {
  let component: ExperimentLineageVisualizationComponent;
  let fixture: ComponentFixture<ExperimentLineageVisualizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExperimentLineageVisualizationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExperimentLineageVisualizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
