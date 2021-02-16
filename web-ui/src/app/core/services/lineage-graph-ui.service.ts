import { ElementRef, Injectable } from '@angular/core';
import * as d3 from 'd3';
import * as dagreD3 from 'dagre-d3';

@Injectable({
  providedIn: 'root',
})
export class LineageGraphUiService {
  constructor() { }

  public renderLineage(nodes: GraphNode[], edges: GraphEdge[], targetSvg: ElementRef) {
    var graph = new dagreD3.graphlib.Graph();
    graph.setGraph({
      nodesep: 70,
      ranksep: 50,
      rankdir: "LR",
      marginx: 20,
      marginy: 20
    });

    nodes.forEach(node => {
      graph.setNode(node.id, { label: node.label, class: node.class });
    });

    graph.nodes().forEach(function (v) {
      var node = graph.node(v);
      // Round the corners of the nodes
      node.rx = node.ry = 4;
    });

    edges.forEach(edge => {
      const edgeLabel = {
        label: '',
        width: 50
      };
      graph.setEdge(edge.sourceId, edge.targetId, edgeLabel);
    });

    const svg = d3.select(targetSvg.nativeElement);
    const innerGroup = d3.select('#experiment-graph g');
    const render = new dagreD3.render();

    render(innerGroup, graph as any);
    
    // Set up zoom support
    var zoom = d3.zoom().on("zoom", function() {
      innerGroup.attr("transform", d3.event.transform);
    });
    svg.call(zoom);

    // adjust height of svg element to match its content (using children[0])
    const nativeSvg = targetSvg.nativeElement;
    const innerHeight = nativeSvg.children[0].children[0].getBBox().height;
    nativeSvg.setAttribute('height', innerHeight + 50);
  }
}

export interface GraphNode {
  id: string,
  label: string,
  class: string
}

export interface GraphEdge {
  sourceId: string,
  targetId: string
}
