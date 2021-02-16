import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ArtifactListResponse } from 'src/app/core/models/artifact.model';
import { Experiment } from '../../../../models/experiment.model';
import { Run, RunListResponse } from '../../../../models/run.model';
import { 
  ArtifactsApiService, 
  ExperimentsApiService, 
  GraphEdge, 
  GraphNode, 
  LineageGraphUiService, 
  ListDataSource, 
  RunsApiService } from '../../../../services';

@Component({
  selector: 'app-experiment-details',
  templateUrl: './experiment-details.component.html',
  styleUrls: ['./experiment-details.component.scss']
})
export class ExperimentDetailsComponent implements OnInit, OnDestroy {
  @ViewChild('experimentGraph') 
  public experimentGraphSvg: ElementRef;
  public artifactListDataSource: ListDataSource<ArtifactListResponse>;
  public experiment: Experiment;
  public projectKey: string;
  public runListDataSource: ListDataSource<RunListResponse>;
  public runs: Run[];

  private experimentKey: string;
  private routeSubscription: Subscription;
  private runListSubscription: Subscription;

  constructor(private artifactsApiService: ArtifactsApiService,
    private experimentsApiService: ExperimentsApiService,
    private route: ActivatedRoute,
    private runsApiService: RunsApiService,
    private lineageGraphService: LineageGraphUiService) { }

  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }

    if (this.runListSubscription) {
      this.runListSubscription.unsubscribe();
      this.runListSubscription = null;
    }
  }

  ngOnInit(): void {
    this.routeSubscription = this.route.params.subscribe(params => {
      this.projectKey = params.projectKey;
      this.experimentKey = params.experimentKey;

      // get experiment
      this.experimentsApiService.getExperiment(this.projectKey, this.experimentKey).subscribe(experiment => {
        this.experiment = experiment;
      });

      // get runs
      this.runListDataSource = this.runsApiService.getRunsByExperimentKey(this.projectKey, this.experimentKey);
      this.runListSubscription = this.runListDataSource.items$.subscribe(runs => {
        this.runs = runs.items;

        if (this.runs.length > 0) {
          // get artifacts
          const runKeys = this.runs.map(r => r.key);
          this.artifactListDataSource = this.artifactsApiService.getArtifactsByRunKeys(this.projectKey, runKeys);

          // render experiment lineage
          this.renderExperimentLineage(this.runs);
        }
      });
    });
  }

  private renderExperimentLineage(runs: Run[]) {
    const nodes = this.createNodes(runs);
    const edges = this.createEdges(runs);

    this.lineageGraphService.renderLineage(nodes, edges, this.experimentGraphSvg);
  }

  private createNodes(runs: Run[]): GraphNode[] {
    let nodes: GraphNode[] = [];

    runs?.forEach(run => {
      nodes.push({
        id: `run:${run.key}`,
        label: `${run.name}:${run.key}`,
        class: 'run'
      });

      run.artifacts?.forEach(artifact => {
        nodes.push({
          id: `artifact:${artifact.name}:${artifact.version}`,
          label: artifact.name,
          class: 'artifact'
        });
      });

      run.usedArtifacts?.forEach(usedArtifact => {
        nodes.push({
          id: `artifact:${usedArtifact.name}:${usedArtifact.version}`,
          label: usedArtifact.name,
          class: 'artifact'
        });
      });
    });

    // Remove duplicates
    nodes = nodes.filter((obj, pos, arr) => {
      return arr.map(mapObj => mapObj.id).indexOf(obj.id) === pos;
    });

    return nodes;
  }

  private createEdges(runs: Run[]): GraphEdge[] {
    const edges: GraphEdge[] = [];

    runs?.forEach(run => {
      run.artifacts?.forEach(artifact => {
        edges.push(
          {
            sourceId: `run:${run.key}`,
            targetId: `artifact:${artifact.name}:${artifact.version}`
          }
        );
      });

      run.usedArtifacts?.forEach(usedArtifact => {
        edges.push(
          {
            sourceId: `artifact:${usedArtifact.name}:${usedArtifact.version}`,
            targetId: `run:${run.key}`
          }
        );
      });
    });

    return edges;
  }
}
