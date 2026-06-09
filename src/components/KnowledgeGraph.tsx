import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { SanadNode, SanadEdge, NodeType } from '../types';
import { Search, ZoomIn, ZoomOut, RotateCcw, Info, BookOpen, GraduationCap, Award, HelpCircle, ArrowRight } from 'lucide-react';

interface KnowledgeGraphProps {
  nodes: SanadNode[];
  edges: SanadEdge[];
  selectedNode: SanadNode | null;
  onSelectNode: (node: SanadNode | null) => void;
}

interface D3Node extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  type: NodeType;
  description: string;
}

interface D3Link extends d3.SimulationLinkDatum<D3Node> {
  id: string;
  source: string | D3Node;
  target: string | D3Node;
  type: string;
  notes?: string;
  year?: number;
}

// Map styles and colors for nodes
export const NODE_TYPE_META: Record<NodeType, { color: string; bg: string; border: string; text: string; iconLabel: string }> = {
  'Guru': { color: '#5A5A40', bg: 'bg-brand-olive/10 text-brand-olive', border: 'border-brand-olive/30', text: 'text-brand-olive', iconLabel: 'G' },
  'Murid': { color: '#8FBC8F', bg: 'bg-brand-sage/15 text-[#496649]', border: 'border-brand-sage/35', text: 'text-[#496649]', iconLabel: 'M' },
  'Kitab': { color: '#A67C52', bg: 'bg-brand-ochre/10 text-brand-ochre', border: 'border-brand-ochre/40', text: 'text-brand-ochre', iconLabel: 'Kt' },
  'Manuskrip': { color: '#CD853F', bg: 'bg-brand-orange/10 text-brand-orange', border: 'border-brand-orange/40', text: 'text-brand-orange', iconLabel: 'Ms' },
  'Ijazah': { color: '#C08A3E', bg: 'bg-[#C08A3E]/10 text-[#8B5A10]', border: 'border-[#C08A3E]/35', text: 'text-[#8B5A10]', iconLabel: 'Ij' },
  'Pesantren': { color: '#2F4F4F', bg: 'bg-brand-teal/10 text-brand-teal', border: 'border-brand-teal/40', text: 'text-brand-teal', iconLabel: 'P' },
  'Alumni': { color: '#8B5A2B', bg: 'bg-[#8B5A2B]/10 text-[#8B5A2B]', border: 'border-[#8B5A2B]/40', text: 'text-[#8B5A2B]', iconLabel: 'Al' },
  'Tradisi Pembelajaran': { color: '#60735E', bg: 'bg-[#60735E]/10 text-[#60735E]', border: 'border-[#60735E]/40', text: 'text-[#60735E]', iconLabel: 'Tr' },
};

export const EDGE_TYPE_LABELS: Record<string, string> = {
  'belajar_kepada': 'Belajar Kepada',
  'mengajar': 'Mengajar Kepada',
  'menyalin': 'Menyalin Naskah',
  'memiliki': 'Memiliki / Merujuk',
  'memberi_ijazah': 'Menerima Ijazah',
  'baiat': 'Baiat Thariqah',
  'alumni': 'Alumni Dari',
  'belajar_melalui': 'Metode Belajar',
  'lainnya': 'Hubungan Lainnya'
};

export default function KnowledgeGraph({ nodes, edges, selectedNode, onSelectNode }: KnowledgeGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<Record<NodeType, boolean>>({
    'Guru': true,
    'Murid': true,
    'Kitab': true,
    'Manuskrip': true,
    'Ijazah': true,
    'Pesantren': true,
    'Alumni': true,
    'Tradisi Pembelajaran': true
  });
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Tracks active search highlighting and d3 zoom callbacks
  const zoomRef = useRef<any>(null);

  // Handle ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      setDimensions({
        width: Math.max(width, 400),
        height: Math.max(height, 500)
      });
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Set up the D3.js graph simulation
  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0 || dimensions.height === 0) return;

    // Filter nodes based on selected legend categories
    const activeNodes = nodes.filter(n => selectedTypes[n.type]);
    const activeNodeIds = new Set(activeNodes.map(n => n.id));

    // Filter edges whose source and target are both in the activeNodes set
    const activeEdges = edges.filter(e => activeNodeIds.has(e.source) && activeNodeIds.has(e.target));

    // Create deep copies for D3 simulation to prevent mutation crashes
    const simNodes: D3Node[] = activeNodes.map(node => ({
      id: node.id,
      label: node.label,
      type: node.type,
      description: node.description,
      x: undefined,
      y: undefined
    }));

    const simEdges: D3Link[] = activeEdges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: edge.type,
      notes: edge.notes,
      year: edge.year
    }));

    const width = dimensions.width;
    const height = dimensions.height;

    // Clear previous SVG content before re-drawing
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Setup arrow markers in defs
    const defs = svg.append("defs");
    
    // Create arrow markers for directed graphs
    Object.keys(NODE_TYPE_META).forEach((type) => {
      const meta = NODE_TYPE_META[type as NodeType];
      defs.append("marker")
        .attr("id", `arrow-${type}`)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 26) // Distance from node center to sit on circle edge
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("fill", meta.color);
    });

    // Main zoom container group
    const mainGroup = svg.append("g").attr("class", "graph-content");

    // Initialize D3 force simulation
    const simulation = d3.forceSimulation<D3Node>(simNodes)
      .alphaDecay(0.06)      // Quick cooling to settle layout rapidly
      .velocityDecay(0.65)   // Heavy friction to damp oscillations and unwanted sliding
      .force("link", d3.forceLink<D3Node, D3Link>(simEdges)
        .id(d => d.id)
        .distance(150)
      )
      .force("charge", d3.forceManyBody().strength(-350))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(50));

    // ZOOM support
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.15, 3])
      .on("zoom", (event) => {
        mainGroup.attr("transform", event.transform);
      });

    svg.call(zoomBehavior);
    zoomRef.current = zoomBehavior;

    // Draw Links (Edges)
    const linksGroup = mainGroup.append("g").attr("class", "links-layer");
    const linkElements = linksGroup.selectAll(".link-path")
      .data(simEdges)
      .enter()
      .append("g")
      .attr("class", "link-group")
      .style("cursor", "pointer");

    // Line links
    const linkLine = linkElements.append("line")
      .attr("class", "link-line")
      .attr("stroke", d => {
        const targetNode = typeof d.target === 'object' ? (d.target as D3Node) : null;
        return targetNode ? NODE_TYPE_META[targetNode.type].color : '#94a3b8';
      })
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", d => d.type === 'belajar_melalui' ? '4,4' : 'none')
      .attr("opacity", 0.6)
      .attr("marker-end", d => {
        const targetNode = typeof d.target === 'object' ? (d.target as D3Node) : null;
        return targetNode ? `url(#arrow-${targetNode.type})` : null;
      });

    // Readout overlay on links Grouped
    const linkLabelsGroup = linkElements.append("g")
      .attr("class", "link-labels-group");

    linkLabelsGroup.append("rect")
      .attr("fill", "#fafaf9")
      .attr("stroke", "#e2e8f0")
      .attr("stroke-width", 1)
      .attr("rx", 3.5)
      .attr("opacity", 0.95)
      .attr("x", d => {
        const labelText = `${EDGE_TYPE_LABELS[d.type] || d.type}${d.year ? ` (${d.year})` : ''}`;
        return -(labelText.length * 5.2 + 8) / 2;
      })
      .attr("y", -7)
      .attr("width", d => {
        const labelText = `${EDGE_TYPE_LABELS[d.type] || d.type}${d.year ? ` (${d.year})` : ''}`;
        return labelText.length * 5.2 + 8;
      })
      .attr("height", 14);

    linkLabelsGroup.append("text")
      .attr("class", "link-label")
      .attr("text-anchor", "middle")
      .attr("dy", 3) // Vertically center within the rectangle box
      .attr("font-size", "9px")
      .attr("fill", "#4b5563")
      .attr("font-family", "monospace")
      .text(d => `${EDGE_TYPE_LABELS[d.type] || d.type}${d.year ? ` (${d.year})` : ''}`);

    // Draw Nodes (Entities)
    const nodesGroup = mainGroup.append("g").attr("class", "nodes-layer");
    const nodeElements = nodesGroup.selectAll(".node-group")
      .data(simNodes)
      .enter()
      .append("g")
      .attr("class", "node-group")
      .style("cursor", "grab")
      .on("click", (event, d) => {
        // Prevent event propagation so clicking Canvas handles dismiss
        event.stopPropagation();
        const clickedNode = nodes.find(n => n.id === d.id);
        if (clickedNode) onSelectNode(clickedNode);
      })
      .on("mouseenter", (event, d) => {
        setHoveredNode(d.id);
      })
      .on("mouseleave", () => {
        setHoveredNode(null);
      });

    // Circular Node Body shadow/glow
    nodeElements.append("circle")
      .attr("r", 20)
      .attr("fill", "#ffffff")
      .attr("stroke", d => NODE_TYPE_META[d.type].color)
      .attr("stroke-width", 3)
      .style("filter", "drop-shadow(0px 2px 4px rgba(0,0,0,0.08))");

    // Core Indicator Circle inside
    nodeElements.append("circle")
      .attr("r", 15)
      .attr("fill", d => NODE_TYPE_META[d.type].color)
      .attr("opacity", 0.15);

    // Initial Letter overlay for semantic understanding
    nodeElements.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", 5) // middle alignment
      .attr("font-weight", "bold")
      .attr("font-size", "11px")
      .attr("font-family", "sans-serif")
      .attr("fill", d => NODE_TYPE_META[d.type].color)
      .text(d => NODE_TYPE_META[d.type].iconLabel);

    // Entity Label underneath the node
    nodeElements.append("text")
      .attr("class", "node-labeled-text")
      .attr("text-anchor", "middle")
      .attr("dy", 35)
      .attr("font-size", "12px")
      .attr("font-weight", "600")
      .attr("fill", "#111827")
      .style("text-shadow", "0px 1px 2px white, 0px -1px 2px white, 1px 0px 2px white, -1px 0px 2px white")
      .text(d => d.label);

    // Add drag behaviors to Nodes
    nodeElements.call(
      d3.drag<SVGGElement, D3Node>()
        .on("start", dragStarted)
        .on("drag", dragged)
        .on("end", dragEnded)
    );

    // Update coordinates on tick
    simulation.on("tick", () => {
      // Draw lines
      linkLine
        .attr("x1", d => (d.source as D3Node).x ?? 0)
        .attr("y1", d => (d.source as D3Node).y ?? 0)
        .attr("x2", d => (d.target as D3Node).x ?? 0)
        .attr("y2", d => (d.target as D3Node).y ?? 0);

      // Move link labels centered along link lines
      linkLabelsGroup.attr("transform", d => {
        const sX = (d.source as D3Node).x ?? 0;
        const tX = (d.target as D3Node).x ?? 0;
        const sY = (d.source as D3Node).y ?? 0;
        const tY = (d.target as D3Node).y ?? 0;
        return `translate(${(sX + tX) / 2}, ${(sY + tY) / 2})`;
      });

      // Move Nodes
      nodeElements.attr("transform", d => `translate(${d.x ?? 0}, ${d.y ?? 0})`);
    });

    // Drag handlers
    function dragStarted(event: any, d: D3Node) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: D3Node) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragEnded(event: any, d: D3Node) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // Interactive Dimming and Highlights based on Search & Hover & Selection
    nodeElements.each(function(nodeData) {
      const g = d3.select(this);
      
      // Determine match state for searches
      const searchMatch = searchQuery === '' || nodeData.label.toLowerCase().includes(searchQuery.toLowerCase()) || nodeData.type.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Determine match state for hover/focus state
      let activeFocus = true;
      if (hoveredNode !== null) {
        const isSelf = nodeData.id === hoveredNode;
        const isConnected = activeEdges.some(e => 
          (e.source === hoveredNode && e.target === nodeData.id) ||
          (e.target === hoveredNode && e.source === nodeData.id)
        );
        activeFocus = isSelf || isConnected;
      } else if (selectedNode !== null) {
        const isSelf = nodeData.id === selectedNode.id;
        const isConnected = activeEdges.some(e => 
          (e.source === selectedNode.id && e.target === nodeData.id) ||
          (e.target === selectedNode.id && e.source === nodeData.id)
        );
        activeFocus = isSelf || isConnected;
      }

      const outerHighlightCircle = g.selectAll(".select-pulse").data(selectedNode && selectedNode.id === nodeData.id ? [1] : []);
      outerHighlightCircle.enter()
        .insert("circle", "circle")
        .attr("class", "select-pulse")
        .attr("r", 28)
        .attr("fill", "white")
        .attr("stroke", NODE_TYPE_META[nodeData.type].color)
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "3,3")
        .style("opacity", 0.7);
      
      outerHighlightCircle.exit().remove();

      // Set global opacity styling to fade un-focused groups
      const isVisible = searchMatch && activeFocus;
      g.transition().duration(200).style("opacity", isVisible ? 1 : 0.15);
    });

    linkLine.each(function(linkData) {
      const line = d3.select(this);
      const parentG = d3.select(this.parentNode as any);
      
      let isVisibleLinks = true;
      
      const sId = typeof linkData.source === 'object' ? (linkData.source as D3Node).id : linkData.source as string;
      const tId = typeof linkData.target === 'object' ? (linkData.target as D3Node).id : linkData.target as string;

      if (searchQuery !== '') {
        const sourceNode = nodes.find(n => n.id === sId);
        const targetNode = nodes.find(n => n.id === tId);
        const sMatch = sourceNode?.label.toLowerCase().includes(searchQuery.toLowerCase());
        const tMatch = targetNode?.label.toLowerCase().includes(searchQuery.toLowerCase());
        isVisibleLinks = !!(sMatch || tMatch);
      }

      if (hoveredNode !== null) {
        isVisibleLinks = sId === hoveredNode || tId === hoveredNode;
      } else if (selectedNode !== null) {
        isVisibleLinks = sId === selectedNode.id || tId === selectedNode.id;
      }

      parentG.transition().duration(200).style("opacity", isVisibleLinks ? 1 : 0.08);
    });

    return () => {
      simulation.stop();
    };

  }, [nodes, edges, selectedTypes, dimensions, searchQuery, hoveredNode, selectedNode]);

  // Click handler for background SVG click to deselect node
  const handleBackgroundClick = () => {
    onSelectNode(null);
  };

  // Zoom helpers
  const triggerZoom = (factor: number) => {
    if (!svgRef.current || !zoomRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition().duration(300).call(zoomRef.current.scaleBy, factor);
  };

  const triggerReset = () => {
    if (!svgRef.current || !zoomRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition().duration(400).call(
      zoomRef.current.transform, 
      d3.zoomIdentity.translate(dimensions.width / 2 - 300, dimensions.height / 2 - 250).scale(0.85)
    );
  };

  const handleTypeToggle = (type: NodeType) => {
    setSelectedTypes(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  // Get active relation types inside loaded dataset for selected nodes
  const getDirectRelations = (nodeId: string) => {
    const directRelations: { relation: string; node: SanadNode; isIncoming: boolean; notes?: string }[] = [];
    
    edges.forEach(e => {
      if (e.source === nodeId) {
        const targetNode = nodes.find(n => n.id === e.target);
        if (targetNode) {
          directRelations.push({
            relation: e.type,
            node: targetNode,
            isIncoming: false,
            notes: e.notes
          });
        }
      } else if (e.target === nodeId) {
        const sourceNode = nodes.find(n => n.id === e.source);
        if (sourceNode) {
          directRelations.push({
            relation: e.type,
            node: sourceNode,
            isIncoming: true,
            notes: e.notes
          });
        }
      }
    });

    return directRelations;
  };

  const activeRelations = selectedNode ? getDirectRelations(selectedNode.id) : [];

  return (
    <div id="knowledge-graph-page" className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full min-h-[600px]">
      
      {/* Simulation Workspace Card */}
      <div className="lg:col-span-3 flex flex-col bg-stone-50 rounded-xl border border-stone-200 outline-none overflow-hidden relative shadow-sm">
        
        {/* Top Control Panel */}
        <div className="p-4 bg-white border-b border-stone-200 flex flex-wrap gap-3 items-center justify-between z-10">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
            <input
              id="graph-search-input"
              type="text"
              placeholder="Cari aktor, kitab, pesantren, atau tradisi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-stone-50 hover:bg-stone-100/50 focus:bg-white rounded-lg border border-stone-200 outline-none focus:border-brand-olive transition-all font-sans"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2 text-xs text-stone-400 hover:text-stone-600"
              >
                Reset
              </button>
            )}
          </div>

          {/* D3 Zoom Handles */}
          <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-lg">
            <button
              id="zoom-in-button"
              onClick={() => triggerZoom(1.2)}
              title="Perbesar"
              className="p-1.5 rounded bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 active:scale-95 transition-all"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              id="zoom-out-button"
              onClick={() => triggerZoom(0.8)}
              title="Perkecil"
              className="p-1.5 rounded bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 active:scale-95 transition-all"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <button
              id="zoom-reset-button"
              onClick={triggerReset}
              title="Pas ke Layar"
              className="p-1.5 rounded bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 active:scale-95 transition-all"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Legend filters */}
        <div className="px-4 py-3 bg-stone-50 border-b border-stone-200 flex flex-wrap gap-2 text-xs">
          <span className="font-semibold text-stone-500 py-1 mr-1">Filter Entitas:</span>
          {Object.entries(NODE_TYPE_META).map(([type, meta]) => (
            <button
              key={type}
              onClick={() => handleTypeToggle(type as NodeType)}
              className={`px-2.5 py-1 rounded-full border transition-all flex items-center gap-1.5 ${
                selectedTypes[type as NodeType]
                  ? `bg-white border-transparent shadow-sm font-semibold`
                  : 'bg-stone-100 text-stone-400 border-stone-200 line-through'
              }`}
              style={{ color: selectedTypes[type as NodeType] ? meta.color : undefined }}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: meta.color }}></span>
              {type}
            </button>
          ))}
        </div>

        {/* Interactive SVG Canvas */}
        <div ref={containerRef} className="flex-1 w-full relative bg-[#fafaf9] outline-none" onClick={handleBackgroundClick}>
          <svg
            id="d3-sanad-knowledge-graph"
            ref={svgRef}
            width={dimensions.width}
            height={dimensions.height}
            className="w-full h-full block outline-none select-none"
          />
          
          <div className="absolute bottom-3 left-3 bg-white/80 backdrop-blur px-3 py-2 rounded-lg border border-stone-200 text-[11px] text-stone-500 flex flex-col gap-1 pointer-events-none shadow-sm">
            <span className="font-bold flex items-center gap-1.5 text-stone-700">
              <Info className="h-3.5 w-3.5 text-brand-olive" /> Navigasi Graf
            </span>
            <span>• Geser (Drag) node untuk mengatur ulang posisi</span>
            <span>• Scroll mouse (atau tombol di atas) untuk Perbesar/Perkecil</span>
            <span>• Klik Node apa saja untuk melihat silsilah sanad lengkap</span>
          </div>
        </div>
      </div>

      {/* Detail Panel Card */}
      <div id="graph-details-panel" className="bg-white rounded-xl border border-stone-200 shadow-sm flex flex-col h-full min-h-[500px] overflow-hidden">
        {selectedNode ? (
          <div className="flex flex-col h-full overflow-y-auto">
            
            {/* Header Badge & Name */}
            <div className="p-5 border-b border-stone-100 bg-stone-50">
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${NODE_TYPE_META[selectedNode.type].bg} border ${NODE_TYPE_META[selectedNode.type].border} mb-2`}>
                {selectedNode.type}
              </span>
              <h3 className="text-xl font-serif font-semibold text-stone-900 leading-tight">
                {selectedNode.label}
              </h3>
              <p className="text-sm text-stone-600 mt-2 italic font-sans leading-relaxed">
                {selectedNode.description}
              </p>
            </div>

            {/* Core Stats / Historical Years */}
            <div className="p-5 space-y-4 flex-1">
              {/* Common Fields Panel */}
              <div className="bg-stone-50 rounded-lg p-4 border border-stone-150 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-1 font-mono">Informasi Pokok</h4>
                
                {selectedNode.detail.birthYear && (
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-500">Tahun Lahir:</span>
                    <span className="font-semibold text-stone-800">{selectedNode.detail.birthYear}</span>
                  </div>
                )}
                {selectedNode.detail.deathYear && (
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-500">Tahun Wafat:</span>
                    <span className="font-semibold text-stone-800">{selectedNode.detail.deathYear}</span>
                  </div>
                )}
                {selectedNode.detail.establishedYear && (
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-500">Didirikan Pada:</span>
                    <span className="font-semibold text-stone-800">{selectedNode.detail.establishedYear}</span>
                  </div>
                )}
                {selectedNode.detail.author && (
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-500">Mushannif / Penulis:</span>
                    <span className="font-semibold text-stone-800">{selectedNode.detail.author}</span>
                  </div>
                )}
                {selectedNode.detail.location && (
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-500">Lokasi / Geografis:</span>
                    <span className="font-semibold text-stone-800 text-right">{selectedNode.detail.location}</span>
                  </div>
                )}
                {selectedNode.detail.practices && (
                  <div className="text-sm border-t border-stone-200 pt-2 mt-2">
                    <span className="text-stone-500 block mb-1">Metode & Praktik Pembelajaran:</span>
                    <p className="text-xs text-stone-700 bg-white p-2 rounded border leading-relaxed">{selectedNode.detail.practices}</p>
                  </div>
                )}
              </div>

              {/* Dynamic Added Custom Fields */}
              {selectedNode.detail.customFields && selectedNode.detail.customFields.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 font-mono">Detail Atribut Tambahan</h4>
                  <div className="border border-stone-100 rounded-lg overflow-hidden divide-y divide-stone-100 text-sm">
                    {selectedNode.detail.customFields.map((field) => (
                      <div key={field.id} className="flex justify-between p-2 hover:bg-stone-50">
                        <span className="text-stone-500">{field.key}:</span>
                        <span className="font-medium text-stone-800 text-right max-w-[180px] truncate" title={field.value}>{field.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Connected Sanad Links Relations */}
              {activeRelations.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 font-mono">Garis Transmisi Sanad Berjalan</h4>
                  <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                    {activeRelations.map((rel, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          const linked = nodes.find(n => n.id === rel.node.id);
                          if (linked) onSelectNode(linked);
                        }}
                        className="w-full text-left p-2.5 rounded-lg border border-stone-150 hover:bg-stone-50 hover:border-brand-olive transition-all text-xs flex items-start gap-2.5 group cursor-pointer"
                      >
                        <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${NODE_TYPE_META[rel.node.type].bg} border ${NODE_TYPE_META[rel.node.type].border}`}>
                           {NODE_TYPE_META[rel.node.type].iconLabel}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-stone-800 group-hover:text-brand-olive truncate">{rel.node.label}</span>
                            <span className="text-[10px] bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded font-medium">
                              {rel.isIncoming ? 'Diterima Dari' : 'Disalurkan Ke'}
                            </span>
                          </div>
                          <p className="text-[10px] text-stone-500 mt-1 italic leading-snug">
                            {EDGE_TYPE_LABELS[rel.relation] || rel.relation} {rel.notes ? ` — ${rel.notes}` : ''}
                          </p>
                        </div>
                        <ArrowRight className="h-3 w-3 text-stone-300 group-hover:text-brand-ochre transition-colors self-center flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Mini-Timeline for selected node */}
              {selectedNode.detail.events && selectedNode.detail.events.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 font-mono">Historiografi Peristiwa</h4>
                  <div className="relative pl-4 border-l border-brand-olive/20 space-y-4">
                    {selectedNode.detail.events
                      .slice()
                      .sort((a,b) => a.year - b.year)
                      .map((ev) => (
                        <div key={ev.id} className="relative text-xs">
                          <div className="absolute -left-[20.5px] top-1 w-2.5 h-2.5 rounded-full border-2 border-brand-olive bg-white"></div>
                          <div className="font-semibold text-brand-olive flex items-center gap-1.5">
                            <span>{ev.displayYear || ev.year}</span>
                            {ev.location && <span className="text-[10px] text-stone-400 bg-stone-100 px-1 py-0.2 rounded">📍 {ev.location}</span>}
                          </div>
                          <span className="font-bold text-stone-800 block mt-0.5">{ev.title}</span>
                          <p className="text-[11px] text-stone-600 mt-0.5 hover:text-stone-800 leading-relaxed">{ev.description}</p>
                        </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-stone-400">
            <Award className="h-12 w-12 text-stone-300 stroke-[1.5] mb-3 animate-pulse" />
            <h3 className="font-serif font-semibold text-stone-800 text-base mb-1">Detail Sanad Pengetahuan</h3>
            <p className="text-xs text-stone-500 max-w-[220px]">
              Klik salah satu lingkaran entitas pada peta untuk menganalisis simpul periwayatan, karya kitab, ijazah, dan relasi silsilah keilmuan.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
