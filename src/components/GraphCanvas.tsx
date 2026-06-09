import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { GraphNode, GraphEdge, NodeType } from '../types';
import { colorsByType } from './SidebarLegend';
import { Network, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface GraphCanvasProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedNode: GraphNode | null;
  onSelectNode: (node: GraphNode | null) => void;
  filterTypes: Set<NodeType>;
}

export default function GraphCanvas({
  nodes,
  edges,
  selectedNode,
  onSelectNode,
  filterTypes,
}: GraphCanvasProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const simulationRef = useRef<d3.Simulation<d3.SimulationNodeDatum, undefined> | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Handle ResizeObserver to fit canvas properly without reload
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({
          width: Math.max(width, 400),
          height: Math.max(height, 500),
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Sync D3 lifecycle
  useEffect(() => {
    if (!svgRef.current) return;

    // Filter nodes and edges based on selected filters in panel
    const filteredNodes = nodes.filter((n) => filterTypes.has(n.type));
    const filteredNodeIds = new Set(filteredNodes.map((n) => n.id));

    const filteredEdges = edges.filter(
      (e) =>
        filteredNodeIds.has(typeof e.source === 'object' ? (e.source as any).id : e.source_node_id) &&
        filteredNodeIds.has(typeof e.target === 'object' ? (e.target as any).id : e.target_node_id)
    );

    // Prepare link data for D3. Avoid mutating original arrays
    const d3Nodes: any[] = filteredNodes.map((n) => ({
      ...n,
      // Maintain previous simulation positions if possible to prevent jumping
      x: n.x ?? undefined,
      y: n.y ?? undefined,
      vx: n.vx ?? undefined,
      vy: n.vy ?? undefined,
      fx: n.fx ?? null,
      fy: n.fy ?? null,
    }));

    const d3Edges: any[] = filteredEdges.map((e) => ({
      ...e,
      source: typeof e.source === 'object' ? (e.source as any).id : e.source_node_id,
      target: typeof e.target === 'object' ? (e.target as any).id : e.target_node_id,
    }));

    // Find direct neighbors of the selected node
    const connectedNodeIds = new Set<string>();
    const connectedEdgeIds = new Set<string>();

    if (selectedNode) {
      connectedNodeIds.add(selectedNode.id);
      filteredEdges.forEach((e) => {
        const sourceId = typeof e.source === 'object' ? (e.source as any).id : e.source_node_id;
        const targetId = typeof e.target === 'object' ? (e.target as any).id : e.target_node_id;

        if (sourceId === selectedNode.id) {
          connectedNodeIds.add(targetId);
          connectedEdgeIds.add(e.id);
        } else if (targetId === selectedNode.id) {
          connectedNodeIds.add(sourceId);
          connectedEdgeIds.add(e.id);
        }
      });
    }

    // Clear previous SVG content
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Create container groups for zoom & pan
    const mainGroup = svg.append('g').attr('class', 'main-group');

    // Define Beautiful Defs (Markers for directional arrows, dropshadow filters)
    const defs = svg.append('defs');
    
    // Add standard arrow marker
    defs
      .append('marker')
      .attr('id', 'arrow-default')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 22)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#94a3b8');

    // Add active/highlight arrow marker
    defs
      .append('marker')
      .attr('id', 'arrow-active')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 22)
      .attr('refY', 0)
      .attr('markerWidth', 7)
      .attr('markerHeight', 7)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#0f172a');

    // Glow filter for highlighted nodes
    const glowFilter = defs.append('filter').attr('id', 'glow').attr('x', '-50%').attr('y', '-50%').attr('width', '200%').attr('height', '200%');
    glowFilter.append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'blur');
    glowFilter.append('feMerge').selectAll('feMergeNode').data(['blur', 'SourceGraphic']).enter().append('feMergeNode').attr('in', (d) => d);

    // Zoom & Pan Handler
    const zoomBehavior = d3
      .zoom()
      .scaleExtent([0.15, 3])
      .on('zoom', (event) => {
        mainGroup.attr('transform', event.transform);
      });

    svg.call(zoomBehavior as any);

    // Setup Force Simulation - Highly spread layout strength -800 and distance 150
    const forceNode = d3.forceManyBody().strength(-950);
    const forceLink = d3.forceLink(d3Edges).id((d: any) => d.id).distance(160);
    const forceCollide = d3.forceCollide().radius(40);

    const simulation = d3
      .forceSimulation(d3Nodes)
      .force('link', forceLink)
      .force('charge', forceNode)
      .force('center', d3.forceCenter(dimensions.width / 2, dimensions.height / 2))
      .force('collide', forceCollide)
      .alphaDecay(0.02);

    simulationRef.current = simulation;

    // Draw lines (Edges)
    const linkGroup = mainGroup.append('g').attr('class', 'edges-group');
    const links = linkGroup
      .selectAll('line')
      .data(d3Edges)
      .enter()
      .append('line')
      .attr('stroke-width', (d) => {
        if (selectedNode) {
          return connectedEdgeIds.has(d.id) ? 2.5 : 1;
        }
        return 1.5;
      })
      .attr('stroke', (d) => {
        if (selectedNode) {
          return connectedEdgeIds.has(d.id) ? '#0f172a' : '#e2e8f0';
        }
        return '#cbd5e1';
      })
      .attr('stroke-opacity', (d) => {
        if (selectedNode) {
          return connectedEdgeIds.has(d.id) ? 1.0 : 0.15;
        }
        return 0.85;
      })
      .attr('stroke-dasharray', (d) => {
        // Dash format for alumni/tradisi relationships to add premium texture
        if (d.edge_type === 'alumni' || d.edge_type === 'tradisi_bandongan' || d.edge_type === 'tradisi_sorogan') {
          return '4,4';
        }
        return null;
      })
      .attr('marker-end', (d) => {
        if (selectedNode) {
          return connectedEdgeIds.has(d.id) ? 'url(#arrow-active)' : 'url(#arrow-default)';
        }
        return 'url(#arrow-default)';
      })
      .style('cursor', 'pointer');

    // Draw link label (relationship descriptions on mouseover)
    const linkLabelsGroup = mainGroup.append('g').attr('class', 'edge-labels-group');
    const linkLabels = linkLabelsGroup
      .selectAll('text')
      .data(d3Edges)
      .enter()
      .append('text')
      .text((d) => d.edge_type.replace('_', ' '))
      .attr('font-size', '9px')
      .attr('font-family', 'var(--font-sans)')
      .attr('fill', '#64748b')
      .attr('text-anchor', 'middle')
      .attr('display', selectedNode ? (d => connectedEdgeIds.has(d.id) ? 'block' : 'none') : 'none');

    // Draw Node Groups
    const nodeGroup = mainGroup.append('g').attr('class', 'nodes-group');
    const nodeElements = nodeGroup
      .selectAll('g')
      .data(d3Nodes)
      .enter()
      .append('g')
      .attr('class', 'node-element')
      .style('cursor', 'grab')
      .on('click', (event, d) => {
        event.stopPropagation();
        onSelectNode(d);
      })
      .call(
        d3
          .drag()
          .on('start', dragStarted)
          .on('drag', dragged)
          .on('end', dragEnded) as any
      );

    // Glowing circle behind selected node & direct connections
    nodeElements
      .append('circle')
      .attr('r', 18)
      .attr('fill', 'transparent')
      .attr('stroke', (d) => colorsByType[d.type] || '#ccc')
      .attr('stroke-width', 3)
      .attr('stroke-opacity', 0.4)
      .attr('filter', 'url(#glow)')
      .style('display', (d) => {
        if (selectedNode) {
          return connectedNodeIds.has(d.id) ? 'block' : 'none';
        }
        return 'none';
      });

    // Main circle represent Node
    nodeElements
      .append('circle')
      .attr('r', 12)
      .attr('fill', (d) => colorsByType[d.type] || '#ccc')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2.5)
      .attr('fill-opacity', (d) => {
        if (selectedNode) {
          return connectedNodeIds.has(d.id) ? 1.0 : 0.25;
        }
        return 1.0;
      })
      .attr('stroke-opacity', (d) => {
        if (selectedNode) {
          return connectedNodeIds.has(d.id) ? 1.0 : 0.25;
        }
        return 1.0;
      });

    // Small interior dot for modern visual anchor
    nodeElements
      .append('circle')
      .attr('r', 4)
      .attr('fill', '#ffffff')
      .attr('fill-opacity', (d) => {
        if (selectedNode) {
          return connectedNodeIds.has(d.id) ? 0.9 : 0.15;
        }
        return 0.9;
      });

    // Beautiful typography text node labels with solid background cards for readability
    const labelGroup = nodeElements.append('g').attr('transform', 'translate(16, 4)');
    
    labelGroup
      .append('text')
      .text((d) => d.name)
      .attr('font-size', '11px')
      .attr('font-weight', (d) => (selectedNode && d.id === selectedNode.id ? '700' : '500'))
      .attr('font-family', 'var(--font-sans)')
      .attr('fill', (d) => {
        if (selectedNode) {
          return connectedNodeIds.has(d.id) ? '#0f172a' : '#94a3b8';
        }
        return '#1e293b';
      })
      .style('pointer-events', 'none');

    labelGroup
      .append('text')
      .text((d) => d.type)
      .attr('transform', 'translate(0, 12)')
      .attr('font-size', '8.5px')
      .attr('font-weight', '500')
      .attr('font-family', 'var(--font-mono)')
      .attr('fill', (d) => {
        if (selectedNode) {
          return connectedNodeIds.has(d.id) ? colorsByType[d.type] : '#cbd5e1';
        }
        return colorsByType[d.type];
      })
      .style('pointer-events', 'none');

    // Tick/simulation loop update function
    simulation.on('tick', () => {
      links
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      linkLabels
        .attr('x', (d: any) => (d.source.x + d.target.x) / 2)
        .attr('y', (d: any) => (d.source.y + d.target.y) / 2 - 4);

      nodeElements.attr('transform', (d: any) => `translate(${d.x}, ${d.y})`);
    });

    // Drag simulation logic
    function dragStarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
      d3.select(this).style('cursor', 'grabbing');
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragEnded(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      // LOCK values upon dragend as directed
      d.fx = event.x;
      d.fy = event.y;
      // Persist coordinate in actual objects so navigating around doesn't reset it
      const actualNode = nodes.find((n) => n.id === d.id);
      if (actualNode) {
        actualNode.fx = event.x;
        actualNode.fy = event.y;
        actualNode.x = event.x;
        actualNode.y = event.y;
      }
      d3.select(this).style('cursor', 'grab');
    }

    // Double click on canvas to unselect
    svg.on('click', () => {
      onSelectNode(null);
    });

    // Center standard buttons handler
    const centerGraph = () => {
      svg.transition().duration(750).call(
        zoomBehavior.transform as any,
        d3.zoomIdentity.translate(0, 0).scale(0.9)
      );
    };

    // Store centering in a custom event or trigger
    (svgRef.current as any).center = centerGraph;
    (svgRef.current as any).zoomIn = () => svg.transition().duration(300).call(zoomBehavior.scaleBy as any, 1.3);
    (svgRef.current as any).zoomOut = () => svg.transition().duration(300).call(zoomBehavior.scaleBy as any, 0.7);

    return () => {
      simulation.stop();
    };
  }, [nodes, edges, selectedNode, filterTypes, dimensions]);

  const handleZoomIn = () => {
    if (svgRef.current && (svgRef.current as any).zoomIn) {
      (svgRef.current as any).zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (svgRef.current && (svgRef.current as any).zoomOut) {
      (svgRef.current as any).zoomOut();
    }
  };

  const handleResetZoom = () => {
    if (svgRef.current && (svgRef.current as any).center) {
      (svgRef.current as any).center();
    }
  };

  return (
    <div id="graph-container" ref={containerRef} className="relative w-full h-full bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden shadow-inner flex flex-col">
      {/* Top action indicator bar */}
      <div className="absolute top-4 left-4 z-10 flex gap-2 items-center bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-sm border border-slate-200/80">
        <Network className="w-4 h-4 text-emerald-600 animate-pulse" />
        <span className="text-xs font-semibold text-slate-700">
          {nodes.filter((n) => filterTypes.has(n.type)).length} entitas aktif
        </span>
        <span className="text-[10px] text-slate-400 font-mono ml-2">Drag node untuk mengunci posisi</span>
      </div>

      {/* Floating Zoom / Action Control buttons */}
      <div className="absolute bottom-6 right-6 z-10 flex flex-col gap-2 bg-white/90 backdrop-blur-md p-1.5 rounded-2xl shadow-md border border-slate-200">
        <button
          onClick={handleZoomIn}
          className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-slate-100 rounded-xl transition duration-150 tooltip"
          title="Perbesar Zoom"
          id="btn-zoom-in"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-slate-100 rounded-xl transition duration-150"
          title="Perkecil Zoom"
          id="btn-zoom-out"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <button
          onClick={handleResetZoom}
          className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-slate-100 rounded-xl transition duration-150 border-t border-slate-150 pt-3 mt-1"
          title="Reset View"
          id="btn-reset-view"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Actual SVG graphics canvas */}
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        className="flex-1 w-full h-full"
        style={{ touchAction: 'none' }}
      />
    </div>
  );
}
