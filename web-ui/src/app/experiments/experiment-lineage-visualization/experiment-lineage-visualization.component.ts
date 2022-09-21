import { Component, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from "@angular/core";
import { Observable } from "rxjs";
import { GraphEdge, GraphNode, LineageGraphUiService } from "@mlaide/shared/services";
import { Subscription } from "rxjs/internal/Subscription";
import { Experiment } from "@mlaide/state/experiment/experiment.models";
import { Run } from "@mlaide/state/run/run.models";

@Component({
  selector: "app-experiment-lineage-visualization",
  templateUrl: "./experiment-lineage-visualization.component.html",
  styleUrls: ["./experiment-lineage-visualization.component.scss"],
})
export class ExperimentLineageVisualizationComponent implements OnChanges, OnDestroy {
  @ViewChild("experimentGraph")
  public experimentGraphSvg: ElementRef;

  @Input()
  public experiment$: Observable<Experiment>;

  @Input()
  public runs$: Observable<Run[]>;
  private runsSubscription: Subscription;

  constructor(private lineageGraphService: LineageGraphUiService) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.runs$) {
      this.unsubscribeRuns();
      this.runsSubscription = this.runs$.subscribe((runs) => {
        this.renderExperimentLineage(runs);
      });
    }
  }

  public ngOnDestroy() {
    this.unsubscribeRuns();
  }

  private unsubscribeRuns() {
    if (this.runsSubscription) {
      this.runsSubscription.unsubscribe();
      this.runsSubscription = null;
    }
  }

  private renderExperimentLineage(runs: Run[]) {
    if (!this.experimentGraphSvg) {
      return;
    }

    const nodes = this.createNodes(runs);
    const edges = this.createEdges(runs);

    this.lineageGraphService.renderLineage(nodes, edges, this.experimentGraphSvg);
  }

  private createNodes(runs: Run[]): GraphNode[] {
    let nodes: GraphNode[] = [];

    runs?.forEach((run) => {
      nodes.push({
        id: `run:${run.key}`,
        label: `${run.name}<br/><span class="subtitle">key: ${run.key}</span>`,
        class: "run",
      });

      run.artifacts?.forEach((artifact) => {
        nodes.push({
          id: `artifact:${artifact.name}:${artifact.version}`,
          label: `${artifact.name}<br/><span class="subtitle">version: ${artifact.version}</span>`,
          class: "artifact",
        });
      });

      run.usedArtifacts?.forEach((usedArtifact) => {
        nodes.push({
          id: `artifact:${usedArtifact.name}:${usedArtifact.version}`,
          label: `${usedArtifact.name}<br/><span class="subtitle">version: ${usedArtifact.version}</span>`,
          class: "artifact",
        });
      });
    });

    // Remove duplicates
    nodes = nodes.filter((obj, pos, arr) => {
      return arr.map((mapObj) => mapObj.id).indexOf(obj.id) === pos;
    });

    return nodes;
  }

  private createEdges(runs: Run[]): GraphEdge[] {
    const edges: GraphEdge[] = [];

    runs?.forEach((run) => {
      run.artifacts?.forEach((artifact) => {
        edges.push({
          sourceId: `run:${run.key}`,
          targetId: `artifact:${artifact.name}:${artifact.version}`,
        });
      });

      run.usedArtifacts?.forEach((usedArtifact) => {
        edges.push({
          sourceId: `artifact:${usedArtifact.name}:${usedArtifact.version}`,
          targetId: `run:${run.key}`,
        });
      });
    });

    return edges;
  }
}
