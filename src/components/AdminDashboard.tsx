import React, { useState, useMemo } from 'react';
import { GraphNode, GraphEdge, NodeType, EdgeType } from '../types';
import { database } from '../lib/database';
import { colorsByType } from './SidebarLegend';
import { 
  Lock, Mail, Key, Sparkles, Plus, Edit2, Trash2, 
  Search, Link, Settings, Database, Activity, Check, X
} from 'lucide-react';

interface AdminDashboardProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onRefreshData: () => void;
  currentUserEmail: string;
}

export default function AdminDashboard({
  nodes,
  edges,
  onRefreshData,
  currentUserEmail,
}: AdminDashboardProps) {
  // Login Gate State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [emailInput, setEmailInput] = useState(currentUserEmail || 'punkysme@gmail.com');
  const [errorMsg, setErrorMsg] = useState('');

  // Tab State: 'quick-connect' | 'detail-manager'
  const [activeMenu, setActiveMenu] = useState<'quick-connect' | 'detail-manager'>('quick-connect');

  // --- Menu 1: Two Sub-Tabs state for "Tambah Node & Hubungan" ---
  const [menu1Tab, setMenu1Tab] = useState<'tambah_entitas' | 'hubungan'>('tambah_entitas');

  // Tab 1: Tambah Entitas Baru (Node) States
  const [nodeName, setNodeName] = useState('');
  const [nodeTypeState, setNodeTypeState] = useState<NodeType>('Tokoh / Kiai');
  const [nodeDeskripsiRingkas, setNodeDeskripsiRingkas] = useState('');
  const [nodeSuccessMsg, setNodeSuccessMsg] = useState('');

  // Tab 2: Hubungan States
  const [relSenderId, setRelSenderId] = useState('');
  const [relReceiverId, setRelReceiverId] = useState('');
  const [relTypeState, setRelTypeState] = useState<EdgeType>('belajar_kepada');
  const [relEstYear, setRelEstYear] = useState('');
  const [relKeterangan, setRelKeterangan] = useState('');
  const [relSuccessMsg, setRelSuccessMsg] = useState('');

  // --- Menu 2: Entity Detail Manager State ---
  const [managerSearch, setManagerSearch] = useState('');
  const [editingNode, setEditingNode] = useState<GraphNode | null>(null);
  
  // Editing node fields
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState<NodeType>('Tokoh / Kiai');
  const [editTahunLahir, setEditTahunLahir] = useState('');
  const [editTahunWafat, setEditTahunWafat] = useState('');
  const [editTahunBerdiri, setEditTahunBerdiri] = useState('');
  const [editPendiri, setEditPendiri] = useState('');
  const [editLokasi, setEditLokasi] = useState('');
  const [editTahunKeMekkah, setEditTahunKeMekkah] = useState('');
  const [editCatatanPerjalanan, setEditCatatanPerjalanan] = useState('');
  const [editBiografi, setEditBiografi] = useState('');
  
  const [editPenulis, setEditPenulis] = useState('');
  const [editTahunPenulisan, setEditTahunPenulisan] = useState('');
  const [editBahasa, setEditBahasa] = useState('');
  const [editDeskripsi, setEditDeskripsi] = useState('');

  // Detailed fields requested by the user
  const [editProfilAkademis, setEditProfilAkademis] = useState('');
  const [editAtributDinamis, setEditAtributDinamis] = useState<Array<{ key: string; value: string }>>([]);
  const [editHistoriografi, setEditHistoriografi] = useState<Array<{
    tahun_numerik: number;
    tahun_bebas: string;
    judul_milestone: string;
    lokasi_peristiwa: string;
    uraian: string;
  }>>([]);

  const [managerSuccess, setManagerSuccess] = useState('');

  // Handle simple login mock
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes('@')) {
      setErrorMsg('Masukkan alamat email yang valid.');
      return;
    }
    setIsAuthenticated(true);
    setErrorMsg('');
  };

  // Sort nodes alphabetically for search/combobox selectors
  const sortedNodesAlpha = useMemo(() => {
    return [...nodes].sort((a, b) => a.name.localeCompare(b.name));
  }, [nodes]);

  // Execute Node Creation (Menu 1, Tab 1)
  const handleAddNewNode = async (e: React.FormEvent) => {
    e.preventDefault();
    setNodeSuccessMsg('');

    if (!nodeName.trim()) {
      alert('Nama entitas tidak boleh kosong!');
      return;
    }

    try {
      const added = await database.addNode({
        name: nodeName.trim(),
        type: nodeTypeState,
        metadata: {
          deskripsi: nodeDeskripsiRingkas.trim() || undefined,
          biografi: nodeDeskripsiRingkas.trim() || undefined
        }
      });

      setNodeSuccessMsg(`Entitas "${added.name}" berhasil ditambahkan ke jaringan Nusantara!`);
      setNodeName('');
      setNodeDeskripsiRingkas('');
      onRefreshData();
    } catch (err) {
      console.error(err);
      alert('Gagal menambahkan entitas.');
    }
  };

  // Execute Relationship creation (Menu 1, Tab 2)
  const handleAddRelationship = async (e: React.FormEvent) => {
    e.preventDefault();
    setRelSuccessMsg('');

    if (!relSenderId || !relReceiverId) {
      alert('Silakan pilih pengirim dan penerima hubungan!');
      return;
    }

    if (relSenderId === relReceiverId) {
      alert('Pengirim dan penerima tidak boleh merupakan entitas yang sama!');
      return;
    }

    try {
      const yearVal = relEstYear ? parseInt(relEstYear) : undefined;
      await database.addEdge({
        source_node_id: relSenderId,
        target_node_id: relReceiverId,
        edge_type: relTypeState,
        year_context: yearVal
      });

      setRelSuccessMsg('Sambungan sanad baru berhasil dicatat dan dipetakan secara simultan!');
      setRelSenderId('');
      setRelReceiverId('');
      setRelEstYear('');
      setRelKeterangan('');
      onRefreshData();
    } catch (err) {
      console.error(err);
      alert('Gagal menghubungkan entitas.');
    }
  };

  // List of filtered nodes in manager
  const filteredNodesForManager = useMemo(() => {
    if (!managerSearch) return nodes;
    return nodes.filter(n => 
      n.name.toLowerCase().includes(managerSearch.toLowerCase()) ||
      n.type.toLowerCase().includes(managerSearch.toLowerCase())
    );
  }, [nodes, managerSearch]);

  // Handle Edit Select Node Click
  const startEditingNode = (node: GraphNode) => {
    setEditingNode(node);
    setEditName(node.name);
    setEditType(node.type);

    const m = node.metadata || {};
    setEditTahunLahir(m.tahun_lahir?.toString() || '');
    setEditTahunWafat(m.tahun_wafat?.toString() || '');
    setEditTahunBerdiri(m.tahun_berdiri?.toString() || '');
    setEditPendiri(m.pendiri || '');
    setEditLokasi(m.lokasi || '');
    setEditTahunKeMekkah(m.tahun_ke_mekkah?.toString() || '');
    setEditCatatanPerjalanan(m.catatan_perjalanan || '');
    setEditBiografi(m.biografi || '');
    
    setEditPenulis(m.penulis || '');
    setEditTahunPenulisan(m.tahun_penulisan?.toString() || '');
    setEditBahasa(m.bahasa || '');
    setEditDeskripsi(m.deskripsi || m.biografi || '');

    // Detailed parameters
    setEditProfilAkademis(m.profil_akademis || '');
    setEditAtributDinamis(m.atribut_dinamis || []);
    setEditHistoriografi(m.historiografi || []);
    
    setManagerSuccess('');
  };

  // Submit edits
  const handleSaveEntityDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNode) return;

    try {
      // Build dynamic metadata based on type
      const nextMeta: any = { 
        ...editingNode.metadata,
        profil_akademis: editProfilAkademis || undefined,
        atribut_dinamis: editAtributDinamis || undefined,
        historiografi: editHistoriografi || undefined
      };

      if (editType === 'Tokoh / Kiai' || editType === 'Alumni') {
        nextMeta.tahun_lahir = editTahunLahir ? parseInt(editTahunLahir) : undefined;
        nextMeta.tahun_wafat = editTahunWafat ? parseInt(editTahunWafat) : undefined;
        nextMeta.tahun_ke_mekkah = editTahunKeMekkah ? parseInt(editTahunKeMekkah) : undefined;
        nextMeta.catatan_perjalanan = editCatatanPerjalanan || undefined;
        nextMeta.biografi = editBiografi || undefined;
        nextMeta.lokasi = editLokasi || undefined;
      } else if (editType === 'Pesantren') {
        nextMeta.tahun_berdiri = editTahunBerdiri ? parseInt(editTahunBerdiri) : undefined;
        nextMeta.pendiri = editPendiri || undefined;
        nextMeta.lokasi = editLokasi || undefined;
        nextMeta.deskripsi = editDeskripsi || undefined;
      } else if (editType === 'Kitab / Manuskrip') {
        nextMeta.penulis = editPenulis || undefined;
        nextMeta.tahun_penulisan = editTahunPenulisan ? parseInt(editTahunPenulisan) : undefined;
        nextMeta.bahasa = editBahasa || undefined;
        nextMeta.deskripsi = editDeskripsi || undefined;
      } else {
        // Fallback catch-all details
        nextMeta.deskripsi = editDeskripsi || undefined;
        nextMeta.lokasi = editLokasi || undefined;
      }

      await database.updateNode(editingNode.id, {
        name: editName,
        type: editType,
        metadata: nextMeta
      });

      setEditingNode(null);
      setManagerSuccess(`Entitas "${editName}" berhasil disinkronisasi ke DB!`);
      onRefreshData();
    } catch (err) {
      console.error(err);
      alert('Gagal menyinkronkan data.');
    }
  };

  const handleDeleteNode = async (id: string, name: string) => {
    if (window.confirm(`Hapus entitas "${name}"? Seluruh hubungan relasi yang menyertainya juga akan dihapus permanen.`)) {
      try {
        await database.deleteNode(id);
        setManagerSuccess(`Sukses melenyapkan entitas "${name}" dari jaringan.`);
        onRefreshData();
      } catch (err) {
        console.error(err);
        alert('Gagal menghapus.');
      }
    }
  };

  const getEdgeCountForNode = (nodeId: string) => {
    return edges.filter(e => 
      (typeof e.source === 'object' ? (e.source as any).id : e.source_node_id) === nodeId ||
      (typeof e.target === 'object' ? (e.target as any).id : e.target_node_id) === nodeId
    ).length;
  };

  // RENDER LOGIN PAGE
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-16 bg-white border border-slate-200/95 rounded-3xl p-8 shadow-xl text-center">
        <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Lock className="w-6 h-6 text-emerald-600" />
        </div>

        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Otentikasi Administrator</h2>
        <p className="text-slate-400 text-xs mt-1.5 leading-relaxed max-w-xs mx-auto">
          Silakan masuk menggunakan email untuk mengawasi dan melakukan pembaruan manuskrip serta silsilah sanad.
        </p>

        <form onSubmit={handleLogin} className="mt-8 space-y-4 text-left">
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-semibold border border-red-150 flex items-center gap-2">
              <X className="w-4 h-4" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">EMAIL ADMINISTRATOR</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                placeholder="isikan email admin"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-emerald-500 rounded-xl py-3.5 pl-11 pr-4 text-xs font-medium text-slate-700 outline-none transition"
                id="admin-email-input"
              />
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-2 text-[10px] text-slate-500 leading-relaxed font-medium">
            <Sparkles className="w-4.5 h-4.5 text-emerald-600 flex-shrink-0" />
            <div>
              <span className="font-bold text-slate-700">Quick Debug Access:</span> Untuk kemudahan review, alamat email di atas adalah alamat email Anda. Klik saja "Masuk" untuk akses instan.
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold text-xs py-3.5 text-white rounded-xl shadow-lg shadow-emerald-600/10 active:scale-[0.99] transition duration-150 cursor-pointer text-center block mt-6"
            id="btn-admin-login"
          >
            Masuk Ke Dashboard
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Top Welcome Admin Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-5 mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Kanal Administrasi Sanad</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-medium flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5" /> Logged as <span className="font-bold text-slate-700">{emailInput}</span>
          </p>
        </div>

        {/* Navigation tabs inside Admin menu */}
        <div className="flex bg-slate-100 p-1 rounded-xl self-start border border-slate-200/50">
          <button
            type="button"
            onClick={() => { setActiveMenu('quick-connect'); setEditingNode(null); }}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition duration-150 ${
              activeMenu === 'quick-connect' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
            id="tab-quick-connect"
          >
            Tambah Node & Hubungan
          </button>
          <button
            type="button"
            onClick={() => { setActiveMenu('detail-manager'); setEditingNode(null); }}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition duration-150 ${
              activeMenu === 'detail-manager' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
            id="tab-detail-manager"
          >
            Entity Detail Manager
          </button>
          <button
            type="button"
            onClick={() => { setActiveMenu('settings'); setEditingNode(null); }}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition duration-150 ${
              activeMenu === 'settings' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
            id="tab-cloud-settings"
          >
            Integrasi & Cloud Settings
          </button>
        </div>
      </div>

      {/* RENDER ACTIVE TAB */}
      {activeMenu === 'quick-connect' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Menu 1: Sub Tabs controls */}
          <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
            
            {/* Inner Sub-Tabs bar */}
            <div className="flex bg-slate-100 p-1 rounded-xl self-start border border-slate-200/50 mb-6 max-w-sm">
              <button
                type="button"
                onClick={() => setMenu1Tab('tambah_entitas')}
                className={`flex-1 px-3 py-1.5 text-[11px] font-bold rounded-lg transition duration-150 ${
                  menu1Tab === 'tambah_entitas' ? 'bg-white text-slate-850 shadow-sm' : 'text-slate-450 hover:text-slate-700'
                }`}
                id="subtab-tambah-entitas"
              >
                Tambah Entitas Baru (Node)
              </button>
              <button
                type="button"
                onClick={() => setMenu1Tab('hubungan')}
                className={`flex-1 px-3 py-1.5 text-[11px] font-bold rounded-lg transition duration-150 ${
                  menu1Tab === 'hubungan' ? 'bg-white text-slate-850 shadow-sm' : 'text-slate-450 hover:text-slate-700'
                }`}
                id="subtab-hubungan"
              >
                Hubungan (Edge)
              </button>
            </div>

            {menu1Tab === 'tambah_entitas' ? (
              /* TAB 1: TAMBAH ENTITAS BARU */
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-1">
                  <Database className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-base font-bold text-slate-800">Tambah Entitas Baru (Node)</h2>
                </div>
                <p className="text-xs text-slate-400">
                  Masukkan informasi dasar dari tokoh (Ulama/Murid), infrastruktur (Pesantren), literatur (Kitab/Manuskrip), maupun tradisi keilmuan baru. Rincian detail metadata yang komprehensif dapat dilengkapi pada kanal <strong>Entity Detail Manager</strong>.
                </p>

                {nodeSuccessMsg && (
                  <div className="p-4 bg-emerald-50 text-emerald-750 rounded-2xl border border-emerald-150 text-xs font-semibold flex items-center gap-2.5">
                    <Check className="w-5 h-5 text-emerald-600" />
                    <span>{nodeSuccessMsg}</span>
                  </div>
                )}

                <form onSubmit={handleAddNewNode} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">NAMA ENTITAS</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Syeikh Mukhtar Umar Bogor"
                        value={nodeName}
                        onChange={(e) => setNodeName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 rounded-xl py-3 px-4 text-xs font-semibold outline-none transition"
                        id="input-new-node-name"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">TIPE ENTITAS</label>
                      <select
                        value={nodeTypeState}
                        onChange={(e) => setNodeTypeState(e.target.value as NodeType)}
                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-xl py-3 px-4 text-xs font-semibold outline-none transition"
                        id="select-new-node-type"
                      >
                        <option value="Tokoh / Kiai">Tokoh / Kiai</option>
                        <option value="Kitab / Manuskrip">Kitab / Manuskrip</option>
                        <option value="Pesantren">Pesantren</option>
                        <option value="Tradisi Pembelajaran">Tradisi Pembelajaran</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">DESKRIPSI RINGKAS</label>
                    <textarea
                      placeholder="Masukkan catatan ringkas atau deskripsi awal mengenai entitas ini..."
                      required
                      value={nodeDeskripsiRingkas}
                      onChange={(e) => setNodeDeskripsiRingkas(e.target.value)}
                      rows={4}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-xl py-3 px-4 text-xs font-medium outline-none transition resize-none"
                      id="input-new-node-desc"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-indigo-650 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl text-xs tracking-wide transition shadow-md cursor-pointer text-center"
                    id="btn-save-new-node"
                  >
                    Simpan Entitas Baru
                  </button>
                </form>
              </div>
            ) : (
              /* TAB 2: HUBUNGAN */
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-1">
                  <Link className="w-5 h-5 text-emerald-650" />
                  <h2 className="text-base font-bold text-slate-800">Hubungan Sanad (Edge)</h2>
                </div>
                <p className="text-xs text-slate-400">
                  Hubungkan dua entitas yang telah terdaftar di database untuk memetakan alur sanad, silsilah guru-murid, pengarang kitab, maupun relasi lembaga pesantren.
                </p>

                {relSuccessMsg && (
                  <div className="p-4 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-150 text-xs font-semibold flex items-center gap-2.5">
                    <Check className="w-5 h-5 text-emerald-600" />
                    <span>{relSuccessMsg}</span>
                  </div>
                )}

                <form onSubmit={handleAddRelationship} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    
                    {/* Pengirim */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">PENGIRIM (SOURCE)</label>
                      <select
                        required
                        value={relSenderId}
                        onChange={(e) => setRelSenderId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-emerald-500 rounded-xl py-3 px-4 text-xs font-semibold outline-none transition"
                        id="select-rel-sender"
                      >
                        <option value="">-- Pilih Pengirim (Asal) --</option>
                        {sortedNodesAlpha.map(n => (
                          <option key={n.id} value={n.id}>{n.name} ({n.type})</option>
                        ))}
                      </select>
                    </div>

                    {/* Penerima */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">PENERIMA (TARGET)</label>
                      <select
                        required
                        value={relReceiverId}
                        onChange={(e) => setRelReceiverId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-emerald-500 rounded-xl py-3 px-4 text-xs font-semibold outline-none transition"
                        id="select-rel-receiver"
                      >
                        <option value="">-- Pilih Penerima (Tujuan) --</option>
                        {sortedNodesAlpha.map(n => (
                          <option key={n.id} value={n.id}>{n.name} ({n.type})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    
                    {/* Bentuk Hubungan */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">BENTUK HUBUNGAN (RELATION)</label>
                      <select
                        value={relTypeState}
                        onChange={(e) => setRelTypeState(e.target.value as EdgeType)}
                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-emerald-500 rounded-xl py-3 px-4 text-xs font-semibold outline-none transition"
                        id="select-rel-type"
                      >
                        <option value="belajar_kepada">Berguru / belajar_kepada</option>
                        <option value="mengajar">Mengajar ke / mengajar</option>
                        <option value="menyalin">Penyusunan naskah / menyalin</option>
                        <option value="memiliki">Pembawa naskah / memiliki</option>
                        <option value="memberi_ijazah">Menganugerahkan ijazah / memberi_ijazah</option>
                        <option value="baiat">Menerima baiat tarekat / baiat</option>
                        <option value="alumni">Tamatan institusi / alumni</option>
                        <option value="tradisi_bandongan">Penerapan tradisi_bandongan</option>
                        <option value="tradisi_sorogan">Penerapan tradisi_sorogan</option>
                      </select>
                    </div>

                    {/* Estimasi Tahun */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">ESTIMASI TAHUN (M)</label>
                      <input
                        type="number"
                        placeholder="Contoh: 1888 (Opsional)"
                        value={relEstYear}
                        onChange={(e) => setRelEstYear(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-emerald-500 rounded-xl py-3 px-4 text-xs font-semibold outline-none transition"
                        id="input-rel-year"
                      />
                    </div>
                  </div>

                  {/* Keterangan */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">KETERANGAN</label>
                    <input
                      type="text"
                      placeholder="Hubungan detail, catatan periwayatan, dsb."
                      value={relKeterangan}
                      onChange={(e) => setRelKeterangan(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-emerald-500 rounded-xl py-3 px-4 text-xs font-semibold outline-none transition"
                      id="input-rel-notes"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl text-xs tracking-wide transition shadow-md cursor-pointer text-center"
                    id="btn-save-relationship"
                  >
                    Simpan Hubungan Relasi
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Quick Connect Guide Sidebar */}
          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 flex flex-col gap-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              Formula Relasi Nusantara
            </h3>
            
            <div className="text-xs text-slate-600 space-y-4 leading-relaxed font-medium">
              <p>
                Silsilah keilmuan Islam Nusantara umumnya terikat melalui hubungan hulu-hilir (Guru ke Murid, atau sebaliknya).
              </p>
              
              <div className="space-y-2 text-[11px] bg-white p-3.5 border border-slate-200/60 rounded-xl">
                <span className="font-bold text-slate-700 block mb-1">Rekomendasi Struktur:</span>
                <p>• [Ulama A] <strong className="text-emerald-700">belajar_kepada</strong> [Ulama B]</p>
                <p>• [Ulama A] <strong className="text-emerald-700">mengajar</strong> [Pesantren B]</p>
                <p>• [Ulama A] <strong className="text-emerald-700">memberi_ijazah</strong> [Ijazah B]</p>
                <p>• [Kitab A] <strong className="text-emerald-700">menyalin</strong> [Ulama B]</p>
              </div>

              <p className="text-[10px] text-slate-400">
                Pembaruan tabel relasi ini akan langsung merayapi diagram grafik interaktif di halaman utama secara dinamis.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeMenu === 'detail-manager' && (
        /* TAB 2: ENTITY DETAIL MANAGER */
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
          {managerSuccess && (
            <div className="p-4 bg-emerald-50 text-emerald-700 rounded-2xl mb-6 border border-emerald-150 text-xs font-semibold flex items-center gap-2.5">
              <Check className="w-5 h-5 text-emerald-600" />
              <span>{managerSuccess}</span>
            </div>
          )}

          {/* EDIT FORM ACTIVE STATE */}
          {editingNode ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b pb-4 border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-indigo-600 font-bold uppercase p-1 bg-indigo-50 rounded">EDIT DETAIL</span>
                  <h2 className="text-lg font-bold text-slate-800">Metadata {editingNode.name}</h2>
                </div>
                <button
                  onClick={() => setEditingNode(null)}
                  className="p-1 px-3.5 hover:bg-slate-100 text-slate-500 hover:text-slate-700 text-xs font-bold rounded-lg border border-slate-200 flex items-center gap-1.5 transition"
                >
                  <X className="w-4 h-4" /> Batal
                </button>
              </div>

              <form onSubmit={handleSaveEntityDetails} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* General Fields */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">NAMA ENTITAS (UTAMA)</label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-250 focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-xl py-3 px-4 text-xs font-semibold outline-none transition"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">TIPE ENTITAS</label>
                    <select
                      value={editType}
                      onChange={(e) => setEditType(e.target.value as NodeType)}
                      className="w-full bg-slate-50 border border-slate-250 focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-xl py-3 px-4 text-xs font-semibold outline-none transition"
                    >
                      <option value="Tokoh / Kiai">Tokoh / Kiai</option>
                      <option value="Kitab / Manuskrip">Kitab / Manuskrip</option>
                      <option value="Ijazah">Ijazah Sanad</option>
                      <option value="Pesantren">Pondok Pesantren</option>
                      <option value="Alumni">Alumni Penting</option>
                      <option value="Tradisi Pembelajaran">Tradisi Pembelajaran</option>
                    </select>
                  </div>
                </div>

                {/* Specific metadata fields depending on selection */}
                {(editType === 'Tokoh / Kiai' || editType === 'Alumni') && (
                  <div className="border border-slate-100 bg-slate-50/50 rounded-2xl p-5 space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Metadata Ulama & Riwayat Hijaz</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Tahun Lahir (M)</label>
                        <input
                          type="number"
                          value={editTahunLahir}
                          onChange={(e) => setEditTahunLahir(e.target.value)}
                          placeholder="Misal 1813"
                          className="w-full bg-white border rounded-xl py-2 px-3 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Tahun Wafat (M)</label>
                        <input
                          type="number"
                          value={editTahunWafat}
                          onChange={(e) => setEditTahunWafat(e.target.value)}
                          placeholder="Misal 1897"
                          className="w-full bg-white border rounded-xl py-2 px-3 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Tahun Ke Mekkah (M)</label>
                        <input
                          type="number"
                          value={editTahunKeMekkah}
                          onChange={(e) => setEditTahunKeMekkah(e.target.value)}
                          placeholder="Hajj & Study"
                          className="w-full bg-white border rounded-xl py-2 px-3 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Lokasi Pengaruh / Asal</label>
                      <input
                        type="text"
                        value={editLokasi}
                        onChange={(e) => setEditLokasi(e.target.value)}
                        placeholder="Contoh: Banten & Makkah al-Mukarramah"
                        className="w-full bg-white border rounded-xl py-2 px-3 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Catatan Rihlah Keilmuan</label>
                      <textarea
                        value={editCatatanPerjalanan}
                        onChange={(e) => setEditCatatanPerjalanan(e.target.value)}
                        placeholder="Jelaskan perjalanan haji, guru-gurunya di jazirah Arab dll, secara singkat"
                        rows={2}
                        className="w-full bg-white border rounded-xl py-2 px-3 text-xs outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Biografi Lengkap</label>
                      <textarea
                        value={editBiografi}
                        onChange={(e) => setEditBiografi(e.target.value)}
                        placeholder="Riwayat hidup ringkas ulama pengajar"
                        rows={3}
                        className="w-full bg-white border rounded-xl py-2 px-3 text-xs outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                      />
                    </div>
                  </div>
                )}

                {/* Specific metadata fields depending on selection: Pesantren */}
                {editType === 'Pesantren' && (
                  <div className="border border-slate-100 bg-slate-50/50 rounded-2xl p-5 space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Metadata Lembaga / Pesantren</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Tahun Berdiri (M)</label>
                        <input
                          type="number"
                          value={editTahunBerdiri}
                          onChange={(e) => setEditTahunBerdiri(e.target.value)}
                          placeholder="Misal 1899"
                          className="w-full bg-white border rounded-xl py-2 px-3 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Pendiri Pertama</label>
                        <input
                          type="text"
                          value={editPendiri}
                          onChange={(e) => setEditPendiri(e.target.value)}
                          placeholder="Misal KH Hasyim Asy'ari"
                          className="w-full bg-white border rounded-xl py-2 px-3 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Lokasi Koordinat Kehormatan (Kota/Daerah)</label>
                      <input
                        type="text"
                        value={editLokasi}
                        onChange={(e) => setEditLokasi(e.target.value)}
                        placeholder="Contoh: Jombang, Jawa Timur"
                        className="w-full bg-white border rounded-xl py-2 px-3 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Deskripsi Sejarah Lembaga</label>
                      <textarea
                        value={editDeskripsi}
                        onChange={(e) => setEditDeskripsi(e.target.value)}
                        placeholder="Ulas latar belakang pendirian padepokan silsilah tarekat/pesantren ini"
                        rows={3}
                        className="w-full bg-white border rounded-xl py-2 px-3 text-xs outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                      />
                    </div>
                  </div>
                )}

                {/* Specific metadata fields depending on selection: Kitab / Manuskrip */}
                {editType === 'Kitab / Manuskrip' && (
                  <div className="border border-slate-100 bg-slate-50/50 rounded-2xl p-5 space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Metadata Karya Literatur Kuning / Naskah</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Pengarang / Mushannif</label>
                        <input
                          type="text"
                          value={editPenulis}
                          onChange={(e) => setEditPenulis(e.target.value)}
                          placeholder="Syeikh Nawawi dsb"
                          className="w-full bg-white border rounded-xl py-2 px-3 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Tahun Penyusunan (M)</label>
                        <input
                          type="number"
                          value={editTahunPenulisan}
                          onChange={(e) => setEditTahunPenulisan(e.target.value)}
                          placeholder="Misal: 1884"
                          className="w-full bg-white border rounded-xl py-2 px-3 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Bahasa Pengantar & Aksara</label>
                      <input
                        type="text"
                        value={editBahasa}
                        onChange={(e) => setEditBahasa(e.target.value)}
                        placeholder="Contoh: Arab, Melayu (Aksara Jawi/Pegon)"
                        className="w-full bg-white border rounded-xl py-2 px-3 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Deskripsi atau Kandungan Isi Naskah</label>
                      <textarea
                        value={editDeskripsi}
                        onChange={(e) => setEditDeskripsi(e.target.value)}
                        placeholder="Rangkum isi naskah, letak penyimpanan manuskrip fisik kuno dll"
                        rows={3}
                        className="w-full bg-white border rounded-xl py-2 px-3 text-xs outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                      />
                    </div>
                  </div>
                )}

                {/* General/Tradisi fallback meta fields */}
                {!(editType === 'Tokoh / Kiai' || editType === 'Alumni' || editType === 'Pesantren' || editType === 'Kitab / Manuskrip') && (
                  <div className="border border-slate-100 bg-slate-50/50 rounded-2xl p-5 space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Metadata Pendukung</h3>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Deskripsi / Catatan Tambahan</label>
                      <textarea
                        value={editDeskripsi}
                        onChange={(e) => setEditDeskripsi(e.target.value)}
                        placeholder="Silakan rincikan detail tradisi atau ijazah khusus ini"
                        rows={3}
                        className="w-full bg-white border rounded-xl py-2 px-3 text-xs outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                      />
                    </div>
                  </div>
                )}

                {/* 1. Profil Akademis */}
                <div className="border border-slate-100 bg-slate-50/50 rounded-2xl p-5 space-y-4">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Profil Akademis Ulama / Lembaga</h3>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Profil Akademis & Riwayat Keilmuan</label>
                    <textarea
                      value={editProfilAkademis}
                      onChange={(e) => setEditProfilAkademis(e.target.value)}
                      placeholder="Masukkan riwayat silsilah sanad keilmuan, kepangkatan akademis, guru utama, dsb."
                      rows={3}
                      className="w-full bg-white border border-slate-205 rounded-xl py-2 px-3 text-xs outline-none focus:ring-1 focus:ring-indigo-500 resize-none font-medium text-slate-700"
                    />
                  </div>
                </div>

                {/* 2. Daftar Atribut Dinamis */}
                <div className="border border-slate-100 bg-slate-50/50 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Atribut Dinamis (Gelar, Kepakaran, Garis Keturunan)</h3>
                    <button
                      type="button"
                      onClick={() => setEditAtributDinamis([...editAtributDinamis, { key: '', value: '' }])}
                      className="text-[10px] bg-slate-200 hover:bg-slate-300 text-slate-800 px-3 py-1 rounded-xl font-bold transition flex items-center gap-1"
                    >
                      + Tambah Baris
                    </button>
                  </div>
                  <div className="space-y-3">
                    {editAtributDinamis.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic">Belum ada atribut dinamis ditambahkan.</p>
                    ) : (
                      editAtributDinamis.map((item, idx) => (
                        <div key={idx} className="flex gap-2.5 items-center">
                          <input 
                            type="text" 
                            placeholder="Nama Atribut (Contoh: Kepakaran)" 
                            value={item.key} 
                            onChange={(e) => {
                              const next = [...editAtributDinamis];
                              next[idx].key = e.target.value;
                              setEditAtributDinamis(next);
                            }}
                            className="w-1/3 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-indigo-500 font-semibold text-slate-755"
                          />
                          <input 
                            type="text" 
                            placeholder="Nilai Atribut (Contoh: Falakiyah, Fiqh Syafi'i)" 
                            value={item.value} 
                            onChange={(e) => {
                              const next = [...editAtributDinamis];
                              next[idx].value = e.target.value;
                              setEditAtributDinamis(next);
                            }}
                            className="flex-1 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-slate-655"
                          />
                          <button 
                            type="button" 
                            onClick={() => {
                              setEditAtributDinamis(editAtributDinamis.filter((_, i) => i !== idx));
                            }}
                            className="p-1.5 px-3 text-red-500 hover:text-white hover:bg-red-500 rounded-lg transition text-[10px] font-bold"
                          >
                            Hapus
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* 3. Daftar Historiografi Peristiwa Timeline */}
                <div className="border border-slate-100 bg-slate-50/50 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Historiografi Peristiwa & Milestone Timeline</h3>
                    <button
                      type="button"
                      onClick={() => setEditHistoriografi([...editHistoriografi, { tahun_numerik: 0, tahun_bebas: '', judul_milestone: '', lokasi_peristiwa: '', uraian: '' }])}
                      className="text-[10px] bg-slate-800 hover:bg-slate-900 text-white px-3.5 py-1.5 rounded-xl font-bold transition flex items-center gap-1 shadow-xs"
                    >
                      + Tambah Peristiwa
                    </button>
                  </div>
                  <div className="space-y-4">
                    {editHistoriografi.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic">Belum ada peristiwa historiografi terdaftar.</p>
                    ) : (
                      editHistoriografi.map((item, idx) => (
                        <div key={idx} className="p-4 bg-white rounded-xl border border-slate-200/80 space-y-3 relative">
                          <button 
                            type="button" 
                            onClick={() => {
                              setEditHistoriografi(editHistoriografi.filter((_, i) => i !== idx));
                            }}
                            className="absolute top-3 right-3 text-red-500 hover:text-white hover:bg-red-500 text-[10px] px-2.5 py-1 rounded-lg transition font-bold"
                          >
                            Hapus Peristiwa
                          </button>
                          <div className="text-[10px] font-black text-indigo-600 uppercase">Peristiwa #{idx + 1}</div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-500 uppercase">Tahun Numerik (Kronologis)</label>
                              <input 
                                type="number" 
                                placeholder="Misal: 1890" 
                                value={item.tahun_numerik || ''}
                                onChange={(e) => {
                                  const next = [...editHistoriografi];
                                  next[idx].tahun_numerik = e.target.value ? parseInt(e.target.value) : 0;
                                  setEditHistoriografi(next);
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-500 uppercase">Tahun Bebas (Keterangan Penanggalan)</label>
                              <input 
                                type="text" 
                                placeholder="Misal: 12 Rajab 1312 H / Suro 1289" 
                                value={item.tahun_bebas || ''}
                                onChange={(e) => {
                                  const next = [...editHistoriografi];
                                  next[idx].tahun_bebas = e.target.value;
                                  setEditHistoriografi(next);
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs outline-none"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-500 uppercase">Judul Milestone Peristiwa</label>
                              <input 
                                type="text" 
                                placeholder="Misal: Pendirian Madrasah dsb." 
                                value={item.judul_milestone || ''}
                                onChange={(e) => {
                                  const next = [...editHistoriografi];
                                  next[idx].judul_milestone = e.target.value;
                                  setEditHistoriografi(next);
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-500 uppercase">Lokasi Peristiwa</label>
                              <input 
                                type="text" 
                                placeholder="Misal: Madinah Al-Munawwarah" 
                                value={item.lokasi_peristiwa || ''}
                                onChange={(e) => {
                                  const next = [...editHistoriografi];
                                  next[idx].lokasi_peristiwa = e.target.value;
                                  setEditHistoriografi(next);
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs outline-none"
                              />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-500 uppercase">Uraian / Deskripsi Lengkap Peristiwa</label>
                            <textarea 
                              placeholder="Tuliskan cerita detail kronologi milestone peristiwa ini..." 
                              value={item.uraian || ''}
                              onChange={(e) => {
                                const next = [...editHistoriografi];
                                next[idx].uraian = e.target.value;
                                setEditHistoriografi(next);
                              }}
                              rows={2}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs outline-none resize-none font-medium text-slate-650"
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Submits */}
                <div className="flex gap-4 items-center">
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-xs py-3.5 rounded-xl tracking-wider transition cursor-pointer text-center"
                    id="btn-save-entity-details"
                  >
                    Simpan & Sinkronisasi Ke Database
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingNode(null)}
                    className="p-3.5 px-6 hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* LIST & SEARCH ALL ENTITIES TABLE */
            <div>
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-4 mb-6">
                <div>
                  <h2 className="text-base font-bold text-slate-800">Daftar Pengisian Metadata Entitas</h2>
                  <p className="text-xs text-slate-400">Total terhitung {nodes.length} entitas di database</p>
                </div>

                {/* Search input to refine database list */}
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Refinasikan pencarian..."
                    value={managerSearch}
                    onChange={(e) => setManagerSearch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-205 focus:bg-white rounded-xl py-2 pl-9 pr-4 text-xs font-semibold outline-none transition"
                    id="input-manager-search"
                  />
                </div>
              </div>

              {/* Table rendering list of entities */}
              <div className="overflow-x-auto rounded-xl border border-slate-200/60 shadow-sm max-h-[500px]">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 font-bold uppercase border-b border-slate-200 tracking-wider text-[9px] select-none">
                      <th className="p-3 px-4">Nama Entitas</th>
                      <th className="p-3">Tipe</th>
                      <th className="p-3">Relasi Langsung</th>
                      <th className="p-3">Isi Metadata</th>
                      <th className="p-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {filteredNodesForManager.map((node) => {
                      const color = colorsByType[node.type] || '#cbd5e1';
                      const metaValues = Object.keys(node.metadata || {}).filter(k => node.metadata[k] !== undefined);
                      
                      return (
                        <tr key={node.id} className="hover:bg-slate-50/50 transition">
                          <td className="p-3 px-4 font-bold text-slate-800">{node.name}</td>
                          <td className="p-3">
                            <span 
                              className="text-[9px] font-black text-white px-2 py-0.5 rounded-full"
                              style={{ backgroundColor: color }}
                            >
                              {node.type}
                            </span>
                          </td>
                          <td className="p-3 text-slate-505 font-semibold text-center md:text-left">{getEdgeCountForNode(node.id)} relasi</td>
                          <td className="p-3 text-[10px] text-slate-400 truncate max-w-xs leading-normal">
                            {metaValues.length > 0 
                              ? metaValues.map(k => `${k}: ${node.metadata[k]}`).join(', ')
                              : 'Tidak ada metadata spesifik.'
                            }
                          </td>
                          <td className="p-3 text-right space-x-1 whitespace-nowrap">
                            <button
                              onClick={() => startEditingNode(node)}
                              className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-slate-600 hover:text-indigo-700 text-[10px] font-bold cursor-pointer transition"
                              id={`btn-edit-node-${node.id}`}
                            >
                              Edit Metadata
                            </button>
                            <button
                              onClick={() => handleDeleteNode(node.id, node.name)}
                              className="p-1 text-red-500 hover:text-white hover:bg-red-500 p-1 rounded-lg hover:border-red-500 transition cursor-pointer"
                              id={`btn-delete-node-${node.id}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredNodesForManager.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-400 italic">
                          Tidak ditemukan entitas untuk "{managerSearch}".
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {activeMenu === 'settings' && (
        <div className="space-y-8 animate-fade-in">
          {/* Cloud Integration Panel header */}
          <div className="bg-slate-900 text-white rounded-3xl p-8 border border-slate-800 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Sparkles className="w-48 h-48" />
            </div>
            
            <div className="relative z-10 space-y-4 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-indigo-500 font-extrabold text-white uppercase px-2.5 py-0.5 rounded-full tracking-wider">Integrasi Cloud</span>
                <span className="text-slate-400 font-mono text-xs">• Supabase, Dotenv, Cloudinary</span>
              </div>
              <h2 className="text-2xl font-black tracking-tight">Menyambungkan Database & Image Hosting</h2>
              <p className="text-sm text-slate-300 leading-relaxed font-medium">
                Sistem Jaringan Sanad ini siap dipindahkan dari basis data lokal (InMemory) ke arsitektur Cloud yang tangguh menggunakan <strong>Supabase</strong> (PostgreSQL) untuk persistensi data, <strong>Cloudinary</strong> untuk penyimpanan naskah & foto, serta dukungan <strong>.env</strong> lokal.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 1. Supabase Postgres SQL Engine */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-2.5 border-b pb-3 border-slate-150">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Supabase SQL Schema</h3>
                  <p className="text-[11px] text-slate-400">Jalankan query ini di SQL Editor pada proyek Supabase Anda.</p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute top-2 right-2 flex gap-2">
                  <span className="text-[8px] font-mono bg-slate-100 border text-slate-500 rounded px-1.5 py-0.5 uppercase">Postgres Code</span>
                </div>
                <pre className="text-[10px] font-mono bg-slate-950 text-emerald-400 p-4 rounded-xl overflow-x-auto border border-slate-850 leading-relaxed font-semibold max-h-80 overflow-y-auto w-full">
{`-- 1. Create Nodes Table
CREATE TABLE nodes (
  id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(255) NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Edges Table
CREATE TABLE edges (
  id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  source_node_id VARCHAR(255) REFERENCES nodes(id) ON DELETE CASCADE,
  target_node_id VARCHAR(255) REFERENCES nodes(id) ON DELETE CASCADE,
  edge_type VARCHAR(255) NOT NULL,
  year_context INTEGER,
  keterangan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Setup Row Level Security (RLS) - Opsional
ALTER TABLE nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE edges ENABLE ROW LEVEL SECURITY;

-- Buat Policy agar semua pengguna di aplikasi dapat membaca
CREATE POLICY "Allow public read-access nodes" ON nodes FOR SELECT USING (true);
CREATE POLICY "Allow public read-access edges" ON edges FOR SELECT USING (true);

-- Buat Policy khusus admin untuk memanipulasi data
CREATE POLICY "Allow full admin-access nodes" ON nodes FOR ALL USING (true);
CREATE POLICY "Allow full admin-access edges" ON edges FOR ALL USING (true);
`}
                </pre>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                💡 <strong>Catatan DB:</strong> Schema di atas memisahkan Entitas Utama (Nodes) dan Relasi Sanad (Edges) dengan relasi <i>Foreign Key</i> yang aman. Kolom <code>metadata</code> bertipe JSONB menampung data dinamis seperti geospasial, atribut, dan riwayat naskah.
              </p>
            </div>

            {/* 2. Environment Variables Settings */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-2.5 border-b pb-3 border-slate-150">
                <div className="p-2 bg-slate-100 text-slate-600 rounded-xl">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Environment Variables (.env)</h3>
                  <p className="text-[11px] text-slate-400">Konfigurasi sandi rahasia pada server-side atau client bundler Anda.</p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Salin baris-baris berikut dan letakkan pada fail <code>.env</code> Anda di folder utama proyek:
                </p>

                <div className="relative font-sans text-left">
                  <pre className="text-[10px] font-mono bg-slate-900 text-indigo-300 p-4 rounded-xl overflow-x-auto border border-slate-800 leading-normal font-semibold w-full">
{`# ----------------------------------------------------
# SUPABASE CONNECTION CREDENTIALS
# ----------------------------------------------------
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhY...your-anon-key

# ----------------------------------------------------
# CLOUDINARY IMAGE HOSTING INTEGRATION
# ----------------------------------------------------
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_upload_preset
CLOUDINARY_URL=cloudinary://api_key:api_secret@your_cloud_name
`}
                  </pre>
                </div>

                <div className="p-3.5 bg-yellow-50 text-yellow-800 rounded-xl border border-yellow-105 text-[11px] leading-relaxed font-medium">
                  ⚠️ <strong>Keamanan Kunci:</strong> Gunakan prefix <code>VITE_</code> agar bundler client-side (seperti Vite) dapat membaca variabel tersebut secara langsung di komponen React Anda via <code>import.meta.env</code>.
                </div>
              </div>
            </div>
          </div>

          {/* 3. Cloudinary Setup Details */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 border-b pb-3 border-slate-150">
              <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Settingan Image Hosting Cloudinary</h3>
                <p className="text-[11px] text-slate-400">Ikuti langkah berikut untuk mengaktifkan unggah gambar naskah mumpuni tanpa server.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-semibold">
              <div className="p-4 bg-slate-50 border rounded-2xl space-y-2">
                <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px]">1</div>
                <h4 className="text-slate-800 font-bold">Daftar Akun Gratis</h4>
                <p className="text-[11px] text-slate-400 leading-normal font-medium">
                  Daftarkan diri di <a href="https://cloudinary.com" target="_blank" rel="noreferrer" className="text-indigo-650 underline">cloudinary.com</a>. Ambil nilai <strong>Cloud Name</strong> dari dashboard utama Anda.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border rounded-2xl space-y-2">
                <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px]">2</div>
                <h4 className="text-slate-800 font-bold">Unsigned Upload Preset</h4>
                <p className="text-[11px] text-slate-400 leading-normal font-medium">
                  Buka tab <strong>Settings</strong> &gt; <strong>Upload</strong>. Gulir kebawah ke bagian "Upload Presets" lalu klik "Add upload preset". Ubah mode menjadi <strong>Unsigned</strong> agar dapat diunggah langsung dari gawai pelanggan.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border rounded-2xl space-y-2">
                <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px]">3</div>
                <h4 className="text-slate-800 font-bold">Gunakan di Integrasi Media</h4>
                <p className="text-[11px] text-slate-400 leading-normal font-medium">
                  Gunakan URL endpoint upload langsung Cloudinary <code>https://api.cloudinary.com/v1_1/&lt;Cloud_Name&gt;/image/upload</code> menggunakan method <code>fetch(POST)</code> menyodorkan berkas berkode FormData.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
