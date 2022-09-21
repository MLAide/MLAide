import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ExperimentLineageVisualizationComponent } from "./experiment-lineage-visualization.component";
import { GraphEdge, GraphNode, LineageGraphUiService } from "@mlaide/shared/services";
import { Run } from "@mlaide/state/run/run.models";
import { of } from "rxjs";
import { SimpleChange } from "@angular/core";
import { Subscription } from "rxjs/internal/Subscription";
import { getRandomExperiment } from "@mlaide/mocks/fake-generator";
import { HarnessLoader } from "@angular/cdk/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { MatCardHarness } from "@angular/material/card/testing";
import { MatCardModule } from "@angular/material/card";

describe("ExperimentLineageVisualizationComponent", () => {
  let component: ExperimentLineageVisualizationComponent;
  let fixture: ComponentFixture<ExperimentLineageVisualizationComponent>;

  // service stubs
  let lineageGraphServiceStub: jasmine.SpyObj<LineageGraphUiService>;

  beforeEach(async () => {
    lineageGraphServiceStub = jasmine.createSpyObj("lineageGraphService", ["renderLineage"]);

    await TestBed.configureTestingModule({
      declarations: [ExperimentLineageVisualizationComponent],
      providers: [{ provide: LineageGraphUiService, useValue: lineageGraphServiceStub }],
      imports: [MatCardModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExperimentLineageVisualizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("ngOnChanges", () => {
    it("should not render experiment lineage if there are no runs in the current experiment", async () => {
      // arrange + act in beforeEach
      const spy = spyOn(component, "ngOnChanges").and.callThrough();

      // act
      //directly call ngOnChanges
      component.ngOnChanges({
        anotherChange: new SimpleChange(null, null, true),
      });
      fixture.detectChanges();

      // assert
      expect(spy).toHaveBeenCalled();
      expect(lineageGraphServiceStub.renderLineage).toHaveBeenCalledTimes(0);
    });

    it("should call unsubscribe if runs$ changes detected", async () => {
      // arrange in beforeEach
      const runs$ = of([]);
      component.runs$ = runs$;

      const subscription = new Subscription();
      const unsubscribeSpy = spyOn(subscription, "unsubscribe").and.callThrough();
      spyOn(runs$, "subscribe").and.callFake(() => {
        return subscription;
      });

      // We need to do this twice because otherwise unsubscribe is not called
      component.ngOnChanges({
        runs$: new SimpleChange(null, runs$, true),
      });

      fixture.detectChanges();

      // act
      component.ngOnChanges({
        runs$: new SimpleChange(null, runs$, true),
      });

      fixture.detectChanges();

      // assert
      expect(unsubscribeSpy).toHaveBeenCalled();
    });

    it("should map all runs to nodes and edges and call the lineage graph service", async () => {
      // arrange + act also in beforeEach
      const fakeRuns: Partial<Run>[] = [
        {
          key: 1,
          name: "r1",
          artifacts: [{ name: "r1a1", version: 1 }],
        },
        {
          key: 2,
          name: "r2",
          artifacts: [
            { name: "r2a1", version: 3 },
            { name: "r2a2", version: 4 },
          ],
          usedArtifacts: [{ name: "r1a1", version: 1 }],
        },
      ];
      component.runs$ = of(fakeRuns as any);

      const expectedNodes: GraphNode[] = [
        {
          id: `run:${fakeRuns[0].key}`,
          label: `${fakeRuns[0].name}<br/><span class="subtitle">key: ${fakeRuns[0].key}</span>`,
          class: "run",
        },
        {
          id: `artifact:${fakeRuns[0].artifacts[0].name}:${fakeRuns[0].artifacts[0].version}`,
          label: `${fakeRuns[0].artifacts[0].name}<br/><span class="subtitle">version: ${fakeRuns[0].artifacts[0].version}</span>`,
          class: "artifact",
        },
        {
          id: `run:${fakeRuns[1].key}`,
          label: `${fakeRuns[1].name}<br/><span class="subtitle">key: ${fakeRuns[1].key}</span>`,
          class: "run",
        },
        {
          id: `artifact:${fakeRuns[1].artifacts[0].name}:${fakeRuns[1].artifacts[0].version}`,
          label: `${fakeRuns[1].artifacts[0].name}<br/><span class="subtitle">version: ${fakeRuns[1].artifacts[0].version}</span>`,
          class: "artifact",
        },
        {
          id: `artifact:${fakeRuns[1].artifacts[1].name}:${fakeRuns[1].artifacts[1].version}`,
          label: `${fakeRuns[1].artifacts[1].name}<br/><span class="subtitle">version: ${fakeRuns[1].artifacts[1].version}</span>`,
          class: "artifact",
        },
      ];
      const expectedEdges: GraphEdge[] = [
        {
          sourceId: `run:${fakeRuns[0].key}`,
          targetId: `artifact:${fakeRuns[0].artifacts[0].name}:${fakeRuns[0].artifacts[0].version}`,
        },
        {
          sourceId: `run:${fakeRuns[1].key}`,
          targetId: `artifact:${fakeRuns[1].artifacts[0].name}:${fakeRuns[1].artifacts[0].version}`,
        },
        {
          sourceId: `run:${fakeRuns[1].key}`,
          targetId: `artifact:${fakeRuns[1].artifacts[1].name}:${fakeRuns[1].artifacts[1].version}`,
        },
        {
          sourceId: `artifact:${fakeRuns[1].usedArtifacts[0].name}:${fakeRuns[1].usedArtifacts[0].version}`,
          targetId: `run:${fakeRuns[1].key}`,
        },
      ];

      // act
      //directly call ngOnChanges
      component.ngOnChanges({
        runs$: new SimpleChange(null, of(fakeRuns), true),
      });
      fixture.detectChanges();

      // assert
      expect(lineageGraphServiceStub.renderLineage).toHaveBeenCalledWith(
        expectedNodes,
        expectedEdges,
        component.experimentGraphSvg
      );
    });
  });

  describe("ngOnDestroy", () => {
    it("should unsubscribe from runsSubscription", async () => {
      // arrange in beforeEach
      const runs$ = of([]);
      component.runs$ = runs$;

      const subscription = new Subscription();
      const unsubscribeSpy = spyOn(subscription, "unsubscribe").and.callThrough();
      spyOn(runs$, "subscribe").and.callFake(() => {
        return subscription;
      });
      component.ngOnChanges({
        runs$: new SimpleChange(null, runs$, true),
      });

      fixture.detectChanges();

      // act
      component.ngOnDestroy();

      // assert
      expect(unsubscribeSpy).toHaveBeenCalled();
    });
  });

  describe("component rendering", () => {
    it("should contain graph header", async () => {
      // arrange
      const fakeExperiment = await getRandomExperiment();
      component.experiment$ = of(fakeExperiment);
      fixture.detectChanges();

      const description: HTMLElement = fixture.nativeElement.querySelector("#experiment-graph-header-description");

      // assert
      expect(description.textContent).toContain(
        `This graph shows the connections between runs and artifacts within the experiment ${fakeExperiment.name}`
      );
    });

    it("should contain mat-card", async () => {
      // arrange
      const loader: HarnessLoader = TestbedHarnessEnvironment.loader(fixture);
      const matCard = await loader.getHarness(MatCardHarness);

      // assert
      expect(matCard).toBeTruthy();
    });

    it("should contain svg", async () => {
      // arrange
      const svg: HTMLElement = fixture.nativeElement.querySelector("svg");

      // assert
      expect(svg).toBeTruthy();
    });
  });
});
