import React, { useState, useEffect, useMemo } from 'react';
import { database } from './lib/database';
import { GraphNode, GraphEdge, NodeType } from './types';
import GraphCanvas from './components/GraphCanvas';
import SidebarLegend from './components/SidebarLegend';
import DetailDrawer from './components/DetailDrawer';
import TimelineView from './components/TimelineView';
import AdminDashboard from './components/AdminDashboard';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Network, CalendarDays, BookOpen, Compass, RefreshCw, 
  Lock, Mail, Key, Sparkles, Search, User, LogOut, Check, X, Eye, ShieldAlert
} from 'lucide-react';

export default function App() {
  // 1. Static History Routing State & Listeners
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const navigate = (to: string) => {
    window.history.pushState(null, '', to);
    setCurrentPath(to);
  };

  // Helper parser for path structure
  const parsePath = (path: string) => {
    const clean = path.replace(/\/$/, "");
    if (clean === "" || clean === "/home" || clean === "/index.html") {
      return { tab: "home" as const, id: undefined, sub: undefined };
    }
    if (clean === "/historiografi") {
      return { tab: "timeline" as const, id: undefined, sub: undefined };
    }
    if (clean === "/login") {
      return { tab: "login" as const, id: undefined, sub: undefined };
    }
    if (clean === "/admin/node") {
      return { tab: "admin" as const, id: undefined, sub: "node" as const };
    }
    if (clean === "/admin/edge") {
      return { tab: "admin" as const, id: undefined, sub: "edge" as const };
    }
    if (clean === "/admin/entitas") {
      return { tab: "admin" as const, id: undefined, sub: "entitas" as const };
    }
    if (clean.startsWith("/entitas/")) {
      const entityId = clean.substring("/entitas/".length);
      return { tab: "home" as const, id: entityId, sub: undefined };
    }
    if (clean === "/entitas") {
      return { tab: "entitas" as const, id: undefined, sub: undefined };
    }
    return { tab: "home" as const, id: undefined, sub: undefined };
  };

  const route = parsePath(currentPath);

  // 2. Admins credentials and auth state (Requirements 4)
  const [adminUser, setAdminUser] = useState<{ email: string; uid: string } | null>(() => {
    const saved = localStorage.getItem('sanad_admin_account');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const isAuthorized = adminUser && adminUser.email === 'maghfurmunif@gmail.com' && adminUser.uid === '2a6a3425-0cb6-4e5d-bf6e-8b6dd0b3797e';

  // Back-guard redirection for admin views
  useEffect(() => {
    if ((route.tab === 'admin') && !isAuthorized) {
      navigate('/login');
    }
  }, [currentPath, adminUser]);

  // Login field states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginUid, setLoginUid] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginSuccess('');

    if (loginEmail.trim() === 'maghfurmunif@gmail.com' && loginUid.trim() === '2a6a3425-0cb6-4e5d-bf6e-8b6dd0b3797e') {
      const u = { email: 'maghfurmunif@gmail.com', uid: '2a6a3425-0cb6-4e5d-bf6e-8b6dd0b3797e' };
      localStorage.setItem('sanad_admin_account', JSON.stringify(u));
      setAdminUser(u);
      setLoginSuccess('Login Administrator Berhasil!');
      setTimeout(() => {
        navigate('/admin/node');
      }, 800);
    } else {
      setLoginError('Email atau UID Admin tidak terdaftar/sesuai.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('sanad_admin_account');
    setAdminUser(null);
    navigate('/home');
  };

  // 3. Unified Data State
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

  // Search directory filters
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<string>('semua');

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

  // Sync URL focus node to SelectedNode automatically
  useEffect(() => {
    if (route.tab === 'home' && route.id && nodes.length > 0) {
      const matched = nodes.find(n => n.id === route.id || n.name.toLowerCase() === decodeURIComponent(route.id).toLowerCase());
      if (matched) {
        setSelectedNode(matched);
        setFilterTypes((prev) => {
          const next = new Set(prev);
          next.add(matched.type);
          return next;
        });
      }
    } else if (route.tab === 'home' && !route.id) {
      setSelectedNode(null);
    }
  }, [currentPath, nodes]);

  // Synchronize dynamic closing or changes
  const handleSelectNode = (node: GraphNode | null) => {
    if (node) {
      navigate(`/entitas/${node.id}`);
    } else {
      const currentRoute = parsePath(window.location.pathname);
      if (currentRoute.id) {
        navigate('/home');
      }
      setSelectedNode(null);
    }
  };

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
      setSelectedNode(matchedNode);
      setFilterTypes((prev) => {
        const next = new Set(prev);
        next.add(matchedNode.type);
        return next;
      });
      navigate(`/entitas/${nodeId}`);
    }
  };

  // Search Results inside Entitas Directory
  const filteredEntitiesDirectory = useMemo(() => {
    return nodes.filter(n => {
      const matchesSearch = n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (n.metadata?.biografi && n.metadata.biografi.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (n.metadata?.deskripsi && n.metadata.deskripsi.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesType = searchType === 'semua' || n.type === searchType;
      return matchesSearch && matchesType;
    });
  }, [nodes, searchQuery, searchType]);

  return (
    <div className="w-full min-h-screen bg-slate-50 font-sans flex flex-col text-slate-800 antialiased selection:bg-emerald-150">
      {/* Dynamic Navigation Top Header */}
      <header className="sticky top-0 z-40 h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-sm flex-shrink-0">
        <div className="flex items-center gap-3 select-none">
          <div 
            onClick={() => navigate('/home')}
            className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-black text-base cursor-pointer hover:bg-emerald-700 transition active:scale-95"
          >
            S
          </div>
          <h1 
            onClick={() => navigate('/home')}
            className="text-lg font-bold tracking-tight text-slate-800 cursor-pointer hover:text-slate-900 transition"
          >
            SANAD <span className="font-normal text-slate-500">Network</span>
          </h1>
        </div>

        {/* Top Navbar Action Tabs with pushState Client Routing */}
        <nav className="flex gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => navigate('/home')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition duration-150 cursor-pointer ${
              route.tab === 'home' && !route.id
                ? 'bg-white shadow-sm text-emerald-700'
                : 'text-slate-600 hover:bg-white/50'
            }`}
            id="nav-tab-graph"
          >
            Knowledge Graph
          </button>

          <button
            onClick={() => navigate('/historiografi')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition duration-150 cursor-pointer ${
              route.tab === 'timeline'
                ? 'bg-white shadow-sm text-emerald-700'
                : 'text-slate-600 hover:bg-white/50'
            }`}
            id="nav-tab-timeline"
          >
            Historiografi
          </button>

          <button
            onClick={() => navigate('/entitas')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition duration-150 cursor-pointer ${
              route.tab === 'entitas'
                ? 'bg-white shadow-sm text-emerald-700'
                : 'text-slate-600 hover:bg-white/50'
            }`}
            id="nav-tab-entitas"
          >
            Katalog Entitas
          </button>

          <button
            onClick={() => isAuthorized ? navigate('/admin/node') : navigate('/login')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition duration-150 cursor-pointer ${
              route.tab === 'admin' || route.tab === 'login'
                ? 'bg-white shadow-sm text-emerald-700'
                : 'text-slate-600 hover:bg-white/50'
            }`}
            id="nav-tab-admin"
          >
            Kanal Admin
          </button>
        </nav>

        {/* Dynamic User panel on the right */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-slate-800">
              {isAuthorized ? 'Syeikh Admin' : 'Pengamat Umum'}
            </p>
            <p className="text-[10px] text-slate-400">
              {isAuthorized ? 'maghfurmunif@gmail.com' : 'Public Viewer'}
            </p>
          </div>
          {isAuthorized ? (
            <button 
              onClick={handleLogout}
              className="w-10 h-10 rounded-full bg-red-50 hover:bg-red-100 border border-red-200 shadow-sm flex items-center justify-center font-bold text-red-600 transition cursor-pointer"
              title="Keluar dari Admin"
            >
              <LogOut className="w-4 h-4" />
            </button>
          ) : (
            <button 
              onClick={() => navigate('/login')}
              className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 shadow-sm flex items-center justify-center font-bold text-slate-500 transition cursor-pointer"
              title="Masuk Admin"
            >
              <User className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Primary Container View Panel based on Client Routing */}
      <main className="flex-1 flex flex-col relative w-full">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 p-12 py-32">
            <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Menjejaki Sanad Klasik Nusantara...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {/* View 1: Knowledge Graph (Interactive Canvas) */}
            {route.tab === 'home' && (
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
                    onSelectNode={handleSelectNode}
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
                        onClose={() => handleSelectNode(null)}
                        nodes={nodes}
                        edges={edges}
                        onSelectNode={handleSelectNode}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* View 2: Historiografi (TimelineView) */}
            {route.tab === 'timeline' && (
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

            {/* View 3: Katalog Entitas (Directory Grid) */}
            {route.tab === 'entitas' && (
              <motion.div
                key="directory-page"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 space-y-6"
              >
                <div className="space-y-1.5 text-center md:text-left">
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2 justify-center md:justify-start">
                    <Compass className="w-6 h-6 text-emerald-600" /> Katalog Penjelajah & Literatur Sanad
                  </h2>
                  <p className="text-xs text-slate-400 font-medium">
                    Temukan dan jelajahi seluruh profil tokoh ulama, infrastruktur pesantren, dan naskah klasik bernilai tinggi.
                  </p>
                </div>

                {/* Filter and search Bar */}
                <div className="bg-white border text-xs font-semibold p-4 rounded-2xl shadow-sm flex flex-col md:flex-row gap-3 items-center">
                  <div className="relative w-full md:flex-1">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Cari berdasarkan nama, biografi, naskah..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-emerald-500 rounded-xl py-2.5 pl-10 pr-4 outline-none transition"
                    />
                  </div>
                  <div className="w-full md:w-64">
                    <select
                      value={searchType}
                      onChange={(e) => setSearchType(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-emerald-500 rounded-xl py-2.5 px-4 outline-none transition"
                    >
                      <option value="semua">Semua Tipe Entitas</option>
                      <option value="Tokoh / Kiai">Tokoh / Kiai</option>
                      <option value="Kitab / Manuskrip">Kitab / Manuskrip</option>
                      <option value="Ijazah">Ijazah / Transmisi</option>
                      <option value="Pesantren">Pesantren / Lembaga</option>
                      <option value="Alumni">Alumni</option>
                      <option value="Tradisi Pembelajaran">Tradisi Pembelajaran</option>
                    </select>
                  </div>
                </div>

                {/* Grid Results */}
                {filteredEntitiesDirectory.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEntitiesDirectory.map((n) => (
                      <div 
                        key={n.id}
                        className="bg-white border border-slate-150 rounded-2xl p-5 hover:shadow-md transition duration-200 flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="flex justify-between items-start gap-2">
                            <span className="text-[10px] bg-slate-100 text-slate-600 border px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                              {n.type}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">ID: {n.id}</span>
                          </div>
                          
                          <h3 className="text-sm font-bold text-slate-800 leading-tight">
                            {n.name}
                          </h3>

                          {n.type === 'Tokoh / Kiai' && (
                            <div className="text-[11px] space-y-1 text-slate-500 font-medium bg-slate-50 rounded-xl p-3">
                              {n.metadata?.tahun_lahir && <p>Born / Wafat: {n.metadata.tahun_lahir} - {n.metadata.tahun_wafat || '?'}</p>}
                              {n.metadata?.lokasi && <p>Haramain / Tanah Air: {n.metadata.lokasi}</p>}
                            </div>
                          )}

                          {n.type === 'Kitab / Manuskrip' && (
                            <div className="text-[11px] space-y-1 text-slate-500 font-medium bg-slate-50 rounded-xl p-3">
                              {n.metadata?.penulis && <p>Penulis: {n.metadata.penulis}</p>}
                              {n.metadata?.bahasa && <p>Bahasa / Aksara: {n.metadata.bahasa}</p>}
                            </div>
                          )}

                          {n.type === 'Pesantren' && (
                            <div className="text-[11px] space-y-1 text-slate-500 font-medium bg-slate-50 rounded-xl p-3">
                              {n.metadata?.tahun_berdiri && <p>Berdiri: {n.metadata.tahun_berdiri}</p>}
                              {n.metadata?.pendiri && <p>Pendiri / Kiai: {n.metadata.pendiri}</p>}
                            </div>
                          )}

                          <p className="text-xs text-slate-500 leading-relaxed font-normal line-clamp-3">
                            {n.metadata?.biografi || n.metadata?.deskripsi || 'Tidak ada deskripsi detail untuk entitas ini.'}
                          </p>
                        </div>

                        <div className="pt-4 border-t mt-4">
                          <button
                            onClick={() => navigate(`/entitas/${n.id}`)}
                            className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition py-2 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" /> Lihat di Peta Sanad
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white border rounded-2xl p-12 text-center text-slate-400 italic text-sm">
                    Tidak ditemukan entitas sanad yang sesuai dengan pencarian Anda.
                  </div>
                )}
              </motion.div>
            )}

            {/* View 4: Otentikasi Administrator (Requirement 4) */}
            {route.tab === 'login' && (
              <motion.div
                key="login-page"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="flex-1 w-full flex items-center justify-center py-16"
              >
                <div className="w-full max-w-md bg-white border border-slate-200/95 rounded-3xl p-8 shadow-xl text-center">
                  <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Lock className="w-6 h-6 text-emerald-600" />
                  </div>

                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">Otentikasi Administrator</h2>
                  <p className="text-slate-400 text-xs mt-1.5 leading-relaxed max-w-xs mx-auto font-medium">
                    Masuk untuk mengawasi silsilah digital and mengedit manuskrip/sanad intelektual Nusantara.
                  </p>

                  <form onSubmit={handleLoginSubmit} className="mt-8 space-y-4 text-left">
                    {loginError && (
                      <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-semibold border border-red-150 flex items-center gap-2">
                        <X className="w-4 h-4" />
                        <span>{loginError}</span>
                      </div>
                    )}

                    {loginSuccess && (
                      <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-semibold border border-emerald-150 flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        <span>{loginSuccess}</span>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">EMAIL ADMINISTRATOR</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                        <input
                          type="email"
                          required
                          placeholder="maghfurmunif@gmail.com"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-emerald-500 rounded-xl py-3 pl-11 pr-4 text-xs font-bold text-slate-700 outline-none transition"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">ADMIN UID / SANDI RAHASIA</label>
                      <div className="relative">
                        <Key className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                        <input
                          type="password"
                          required
                          placeholder="2a6a3425-0cb6-4e5d-bf6e-8b6dd0b3797e"
                          value={loginUid}
                          onChange={(e) => setLoginUid(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-emerald-500 rounded-xl py-3 pl-11 pr-4 text-xs font-mono font-black tracking-widest text-slate-700 outline-none transition"
                        />
                      </div>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-2 text-[10px] text-slate-500 leading-relaxed font-medium">
                      <Sparkles className="w-4.5 h-4.5 text-emerald-600 flex-shrink-0" />
                      <div>
                        Gunakan UID Admin <code className="bg-slate-200 px-1 rounded select-all font-mono font-bold text-slate-700">2a6a3425-0cb6-4e5d-bf6e-8b6dd0b3797e</code> untuk masuk dan menguji fungsionalitas panel tulis/edit silsilah dan bibliografi secara penuh.
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold text-xs py-3.5 text-white rounded-xl shadow-lg shadow-emerald-600/10 active:scale-[0.99] transition duration-150 cursor-pointer text-center block mt-6"
                    >
                      Masuk Ke Dashboard Admin
                    </button>
                  </form>
                </div>
              </motion.div>
            )}

            {/* View 5: Kanal Administrasi (AdminDashboard) */}
            {route.tab === 'admin' && (
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
                  currentUserEmail={adminUser ? adminUser.email : 'maghfurmunif@gmail.com'}
                  activeSubTab={route.sub}
                  onNavigate={navigate}
                />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      {/* Elegant cultural Prestige Footer */}
      <footer className="bg-white border-t border-slate-150 py-4 px-6 text-center text-[10px] text-slate-400 font-medium select-none flex-shrink-0 flex flex-col md:flex-row justify-between items-center gap-2">
        <p>© 2026 Pelindung Manuskrip & Ahli Silsilah Nusantara. All rights reserved.</p>
        <p className="font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Dokumentasi Sanad Digital Nusantara</p>
      </footer>
    </div>
  );
}
