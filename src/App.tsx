import React, { useState, useEffect } from 'react';
import { database } from './lib/database';
import { GraphNode, GraphEdge, NodeType } from './types';
import GraphCanvas from './components/GraphCanvas';
import SidebarLegend from './components/SidebarLegend';
import DetailDrawer from './components/DetailDrawer';
import TimelineView from './components/TimelineView';
import AdminDashboard from './components/AdminDashboard';
import { motion, AnimatePresence } from 'motion/react';
import { Network, CalendarDays, ShieldAlert, BookOpen, Compass, RefreshCw } from 'lucide-react';

export default function App() {
  // Navigation active tab: 'home' | 'timeline' | 'admin'
  const [activeTab, setActiveTab] = useState<'home' | 'timeline' | 'admin'>('home');

  // Unified Data State
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter types state
  const [filterTypes, setFilterTypes] = useState<Set<NodeType>>(
    new Set<NodeType>([
      'Tokoh / Kiai',
      'Kitab / Manuskrip',
      'Ijazah',
      'Pesantren',
      'Alumni',
      'Tradisi Pembelajaran',
    ])
  );

  // Sidebar details selection state
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  // Load and refresh core data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const dbNodes = await database.getNodes();
      const dbEdges = await database.getEdges();
      setNodes(dbNodes);
      setEdges(dbEdges);
    } catch (err) {
      console.error('Failed to query database:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter Toggle action inside Sidebar Legend
  const handleToggleType = (type: NodeType) => {
    setFilterTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  // Re-seed triggerer
  const handleResetData = async () => {
    setIsLoading(true);
    try {
      await database.resetToSeeds();
      const dbNodes = await database.getNodes();
      const dbEdges = await database.getEdges();
      setNodes(dbNodes);
      setEdges(dbEdges);
      setSelectedNode(null);
      console.log('Successfully re-seeded Nusantara networks.');
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Click on milestone timeline to navigate to Graph focusing on Node
  const handleSelectAndNavigate = (nodeId: string) => {
    const matchedNode = nodes.find((n) => n.id === nodeId);
    if (matchedNode) {
      // Set node structure as focused
      setSelectedNode(matchedNode);
      // Guarantee its type is checked in active filters to ensure it's not hidden
      setFilterTypes((prev) => {
        const next = new Set(prev);
        next.add(matchedNode.type);
        return next;
      });
      // Redirect back to Home interactive canvas
      setActiveTab('home');
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 font-sans flex flex-col text-slate-800 antialiased selection:bg-emerald-150">
      {/* Dynamic Navigation Top Header */}
      <header className="sticky top-0 z-40 h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-base">
            S
          </div>
          <h1 className="text-lg font-bold tracking-tight text-slate-800">
            SANAD <span className="font-normal text-slate-500">Network</span>
          </h1>
        </div>

        {/* Top Navbar Action Tabs */}
        <nav className="flex gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('home')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition duration-150 cursor-pointer ${
              activeTab === 'home'
                ? 'bg-white shadow-sm text-emerald-700'
                : 'text-slate-600 hover:bg-white/50'
            }`}
            id="nav-tab-graph"
          >
            Knowledge Graph
          </button>

          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition duration-150 cursor-pointer ${
              activeTab === 'timeline'
                ? 'bg-white shadow-sm text-emerald-700'
                : 'text-slate-600 hover:bg-white/50'
            }`}
            id="nav-tab-timeline"
          >
            Historiografi
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition duration-150 cursor-pointer ${
              activeTab === 'admin'
                ? 'bg-white shadow-sm text-emerald-700'
                : 'text-slate-600 hover:bg-white/50'
            }`}
            id="nav-tab-admin"
          >
            Kanal Admin
          </button>
        </nav>

        {/* User panel on the right */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-slate-800">Admin Utama</p>
            <p className="text-[10px] text-slate-400">v2.4.0-stable</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden text-[10px] flex items-center justify-center font-bold text-slate-500">
            USER
          </div>
        </div>
      </header>

      {/* Primary Container View Panel */}
      <main className="flex-1 flex flex-col relative w-full">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 p-12 py-32">
            <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Menjejaki Sanad Klasik Nusantara...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'home' && (
              <motion.div
                key="home-graph-page"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="flex-1 flex flex-col lg:flex-row h-full w-full min-h-[calc(100vh-68px)]"
              >
                {/* 20% Sidebar filter menu */}
                <SidebarLegend
                  filterTypes={filterTypes}
                  onToggleType={handleToggleType}
                  isSupabase={database.isSupabase()}
                  onResetData={handleResetData}
                />

                {/* 80% Interactive D3 force network canvas */}
                <div className="flex-1 relative p-4 bg-slate-50 h-[calc(100vh-68px)] lg:h-auto min-h-[500px]">
                  <GraphCanvas
                    nodes={nodes}
                    edges={edges}
                    selectedNode={selectedNode}
                    onSelectNode={setSelectedNode}
                    filterTypes={filterTypes}
                  />
                </div>

                {/* Side overlay Detail Drawer on node selection */}
                <AnimatePresence>
                  {selectedNode && (
                    <motion.div
                      initial={{ opacity: 0, x: 200 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 200 }}
                      transition={{ type: 'spring', damping: 25, stiffness: 155 }}
                      className="z-50"
                    >
                      <DetailDrawer
                        selectedNode={selectedNode}
                        onClose={() => setSelectedNode(null)}
                        nodes={nodes}
                        edges={edges}
                        onSelectNode={setSelectedNode}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {activeTab === 'timeline' && (
              <motion.div
                key="timeline-page"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="flex-1 w-full"
              >
                <TimelineView
                  nodes={nodes}
                  edges={edges}
                  onSelectAndNavigate={handleSelectAndNavigate}
                />
              </motion.div>
            )}

            {activeTab === 'admin' && (
              <motion.div
                key="admin-page"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="flex-1 w-full"
              >
                <AdminDashboard
                  nodes={nodes}
                  edges={edges}
                  onRefreshData={loadData}
                  currentUserEmail="punkysme@gmail.com"
                />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      {/* Simple footer note for cultural prestige */}
      <footer className="bg-white border-t border-slate-150 py-4 px-6 text-center text-[10px] text-slate-400 font-medium select-none flex-shrink-0 flex flex-col md:flex-row justify-between items-center gap-2">
        <p>© 2026 Pelindung Manuskrip & Ahli Silsilah Nusantara. All rights reserved.</p>
        <p className="font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Dokumentasi Sanad Digital Nusantara</p>
      </footer>
    </div>
  );
}
