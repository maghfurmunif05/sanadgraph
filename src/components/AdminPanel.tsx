import React, { useState } from 'react';
import { SanadNode, SanadEdge, NodeType, NodeDetail, CustomField, SanadEvent } from '../types';
import { 
  Lock, Mail, Plus, Trash2, Save, FileSpreadsheet, Download, Upload, 
  RefreshCw, CheckCircle2, AlertCircle, HelpCircle, Layers, Link, UserCheck, CalendarDays
} from 'lucide-react';
import { NODE_TYPE_META, EDGE_TYPE_LABELS } from './KnowledgeGraph';

interface AdminPanelProps {
  nodes: SanadNode[];
  edges: SanadEdge[];
  onUpdateData: (nodes: SanadNode[], edges: SanadEdge[]) => void;
  onResetData: () => void;
  userEmail: string; // From metadata or logged in
}

export default function AdminPanel({ nodes, edges, onUpdateData, onResetData, userEmail }: AdminPanelProps) {
  // Simple Email login state
  const [loggedInEmail, setLoggedInEmail] = useState<string>(() => {
    return sessionStorage.getItem('admin_session_email') || '';
  });
  const [emailInput, setEmailInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Active Menu Tab: 'nodes-edges' or 'details'
  const [activeTab, setActiveTab] = useState<'nodes-edges' | 'details'>('nodes-edges');

  // Sub-tabs on nodes-edges screen: 'create-node' or 'create-edge'
  const [nodeEdgeSubTab, setNodeEdgeSubTab] = useState<'node' | 'edge'>('node');

  // Node construction local state
  const [newNodeName, setNewNodeName] = useState('');
  const [newNodeType, setNewNodeType] = useState<NodeType>('Guru');
  const [newNodeDesc, setNewNodeDesc] = useState('');
  const [nodeSuccessMsg, setNodeSuccessMsg] = useState('');

  // Edge construction local state
  const [newEdgeSource, setNewEdgeSource] = useState('');
  const [newEdgeTarget, setNewEdgeTarget] = useState('');
  const [newEdgeType, setNewEdgeType] = useState('belajar_kepada');
  const [customEdgeType, setCustomEdgeType] = useState('');
  const [newEdgeNotes, setNewEdgeNotes] = useState('');
  const [newEdgeYear, setNewEdgeYear] = useState('');
  const [edgeSuccessMsg, setEdgeSuccessMsg] = useState('');

  // Detail profiling local state
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [profileBirth, setProfileBirth] = useState('');
  const [profileDeath, setProfileDeath] = useState('');
  const [profileEst, setProfileEst] = useState('');
  const [profileAuthor, setProfileAuthor] = useState('');
  const [profileLoc, setProfileLoc] = useState('');
  const [profilePrac, setProfilePrac] = useState('');
  const [profileCustomFields, setProfileCustomFields] = useState<CustomField[]>([]);
  const [profileEvents, setProfileEvents] = useState<SanadEvent[]>([]);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  // Event writing local state (inside detail tab)
  const [tempEventTitle, setTempEventTitle] = useState('');
  const [tempEventYear, setTempEventYear] = useState('');
  const [tempEventDispYear, setTempEventDispYear] = useState('');
  const [tempEventDesc, setTempEventDesc] = useState('');
  const [tempEventLoc, setTempEventLoc] = useState('');

  // Custom Fields writing local state
  const [tempFieldKey, setTempFieldKey] = useState('');
  const [tempFieldValue, setTempFieldValue] = useState('');

  // Backup / Restore states
  const [backupSuccessMsg, setBackupSuccessMsg] = useState('');
  const [backupErrorMsg, setBackupErrorMsg] = useState('');

  // Settle Authentication
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes('@')) {
      setLoginError('Silakan masukkan format alamat email yang valid.');
      return;
    }
    setLoggedInEmail(emailInput);
    sessionStorage.setItem('admin_session_email', emailInput);
    setLoginError('');
  };

  const handleLogout = () => {
    setLoggedInEmail('');
    sessionStorage.removeItem('admin_session_email');
  };

  // Create a Node handler
  const handleCreateNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNodeName.trim()) {
      alert('Nama entitas wajib diisi');
      return;
    }

    const newNodeId = `node-${Date.now()}`;
    const freshNode: SanadNode = {
      id: newNodeId,
      label: newNodeName.trim(),
      type: newNodeType,
      description: newNodeDesc.trim() || `Entitas ${newNodeType} dalam transmisi Sanad pesantren.`,
      detail: {
        customFields: [],
        events: []
      }
    };

    const updatedNodes = [...nodes, freshNode];
    onUpdateData(updatedNodes, edges);
    setNewNodeName('');
    setNewNodeDesc('');
    setNodeSuccessMsg(`Sukses menambahkan entitas "${freshNode.label}" !`);
    setTimeout(() => setNodeSuccessMsg(''), 4000);
  };

  // Delete a Node handler
  const handleDeleteNode = (nodeId: string) => {
    const nodeToDelete = nodes.find(n => n.id === nodeId);
    if (!nodeToDelete) return;
    
    if (confirm(`Apakah Anda yakin ingin menghapus "${nodeToDelete.label}"?\nSemua hubungan terkait juga akan otomatis dihapus.`)) {
      const updatedNodes = nodes.filter(n => n.id !== nodeId);
      // Automatically clean up loose links connected to deleted node
      const updatedEdges = edges.filter(e => e.source !== nodeId && e.target !== nodeId);
      
      // If deleted node was active in the current profile dropdown, reset dropdown
      if (selectedProfileId === nodeId) {
        setSelectedProfileId('');
      }

      onUpdateData(updatedNodes, updatedEdges);
    }
  };

  // Create an Edge connection handler
  const handleCreateEdge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEdgeSource || !newEdgeTarget) {
      alert('Isi simpul sumber dan simpul target terlebih dahulu.');
      return;
    }
    if (newEdgeSource === newEdgeTarget) {
      alert('Simpul sumber tidak boleh sama dengan simpul target.');
      return;
    }

    const edgeTypeToSave = newEdgeType === 'lainnya' ? (customEdgeType.trim().toLowerCase().replace(/\s+/g, '_') || 'lainnya') : newEdgeType;
    const resolvedYear = newEdgeYear ? parseInt(newEdgeYear, 10) : undefined;

    const freshEdge: SanadEdge = {
      id: `edge-${Date.now()}`,
      source: newEdgeSource,
      target: newEdgeTarget,
      type: edgeTypeToSave,
      notes: newEdgeNotes.trim() || undefined,
      year: isNaN(resolvedYear as number) ? undefined : resolvedYear
    };

    const updatedEdges = [...edges, freshEdge];
    onUpdateData(nodes, updatedEdges);
    setNewEdgeNotes('');
    setNewEdgeYear('');
    setCustomEdgeType('');
    setEdgeSuccessMsg('Hubungan antar entitas berhasil dijembatani!');
    setTimeout(() => setEdgeSuccessMsg(''), 4000);
  };

  // Delete an edge connection handler
  const handleDeleteEdge = (edgeId: string) => {
    if (confirm('Hapus hubungan silsilah sanad ini?')) {
      const updatedEdges = edges.filter(e => e.id !== edgeId);
      onUpdateData(nodes, updatedEdges);
    }
  };

  // SELECT which node profile detail to load
  const handleSelectProfileNode = (nodeId: string) => {
    setSelectedProfileId(nodeId);
    setProfileSuccessMsg('');

    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setProfileBirth(node.detail.birthYear || '');
      setProfileDeath(node.detail.deathYear || '');
      setProfileEst(node.detail.establishedYear || '');
      setProfileAuthor(node.detail.author || '');
      setProfileLoc(node.detail.location || '');
      setProfilePrac(node.detail.practices || '');
      setProfileCustomFields(node.detail.customFields || []);
      setProfileEvents(node.detail.events || []);
    } else {
      setProfileBirth('');
      setProfileDeath('');
      setProfileEst('');
      setProfileAuthor('');
      setProfileLoc('');
      setProfilePrac('');
      setProfileCustomFields([]);
      setProfileEvents([]);
    }
  };

  // Commit profile updates handler
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProfileId) {
      alert('Pilih entitas terlebih dahulu.');
      return;
    }

    const updatedNodes = nodes.map(node => {
      if (node.id === selectedProfileId) {
        return {
          ...node,
          detail: {
            birthYear: profileBirth.trim() || undefined,
            deathYear: profileDeath.trim() || undefined,
            establishedYear: profileEst.trim() || undefined,
            author: profileAuthor.trim() || undefined,
            location: profileLoc.trim() || undefined,
            practices: profilePrac.trim() || undefined,
            customFields: profileCustomFields,
            events: profileEvents
          }
        };
      }
      return node;
    });

    onUpdateData(updatedNodes, edges);
    setProfileSuccessMsg('Profil dan data historiografi entitas berhasil disimpan ke pangkalan sanad!');
    setTimeout(() => setProfileSuccessMsg(''), 6000);
  };

  // Temporarily push custom metadata row
  const handleAddCustomField = () => {
    if (!tempFieldKey.trim() || !tempFieldValue.trim()) {
      alert('Isi kunci dan nilai atribut terlebih dahulu.');
      return;
    }
    const newField: CustomField = {
      id: `cf-${Date.now()}`,
      key: tempFieldKey.trim(),
      value: tempFieldValue.trim()
    };
    setProfileCustomFields([...profileCustomFields, newField]);
    setTempFieldKey('');
    setTempFieldValue('');
  };

  const handleRemoveCustomField = (fieldId: string) => {
    setProfileCustomFields(profileCustomFields.filter(f => f.id !== fieldId));
  };

  // Temporarily push historical event to local profile state
  const handleAddHistoricalEvent = () => {
    if (!tempEventTitle.trim() || !tempEventYear) {
      alert('Tahun dan nama peristiwa wajib dicantumkan');
      return;
    }

    const yrNum = parseInt(tempEventYear, 10);
    if (isNaN(yrNum)) {
      alert('Tahun harus bernilai angka numerik agar terurut rapi di sumbu waktu.');
      return;
    }

    const newEvent: SanadEvent = {
      id: `ev-${Date.now()}`,
      nodeId: selectedProfileId,
      title: tempEventTitle.trim(),
      year: yrNum,
      displayYear: tempEventDispYear.trim() || `${yrNum} M`,
      description: tempEventDesc.trim() || 'Peristiwa terekam dalam silsilah sejarah pesantren.',
      location: tempEventLoc.trim() || undefined
    };

    setProfileEvents([...profileEvents, newEvent]);
    setTempEventTitle('');
    setTempEventYear('');
    setTempEventDispYear('');
    setTempEventDesc('');
    setTempEventLoc('');
  };

  const handleRemoveHistoricalEvent = (eventId: string) => {
    setProfileEvents(profileEvents.filter(ev => ev.id !== eventId));
  };

  // DATA RECOVERY: Export complete schema as a JSON file
  const handleExportJSON = () => {
    try {
      const dataStr = JSON.stringify({ nodes, edges }, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `sanad_pengetahuan_pesantren_export_${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();

      setBackupSuccessMsg('Ekspor berhasil! File data ilmiah Anda berhasil diunduh.');
      setTimeout(() => setBackupSuccessMsg(''), 5000);
    } catch (e) {
      setBackupErrorMsg('Gagal memproses ekspor data.');
      setTimeout(() => setBackupErrorMsg(''), 5000);
    }
  };

  // DATA RECOVERY: Import schema from JSON file
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const files = e.target.files;
    if (!files || files.length === 0) return;

    fileReader.onload = (event) => {
      try {
        const parsedData = JSON.parse(event.target?.result as string);
        if (parsedData && Array.isArray(parsedData.nodes) && Array.isArray(parsedData.edges)) {
          onUpdateData(parsedData.nodes, parsedData.edges);
          setBackupSuccessMsg('Dataset sanad berhasil disinkronkan dan dimuat ke web browser!');
          setSelectedProfileId(''); // reset state
          setTimeout(() => setBackupSuccessMsg(''), 5000);
        } else {
          setBackupErrorMsg('Format berkas tidak valid. Pastikan berisi "nodes" dan "edges".');
          setTimeout(() => setBackupErrorMsg(''), 5000);
        }
      } catch (err) {
        setBackupErrorMsg('Gagal membaca dokumen berkas: Format JSON rusak.');
        setTimeout(() => setBackupErrorMsg(''), 5000);
      }
    };
    
    fileReader.readAsText(files[0]);
    // Clear value to allow re-importing same file
    e.target.value = '';
  };

  // Handle default reset trigger
  const handleTriggerReset = () => {
    if (confirm('PERINGATAN: Tindakan ini akan mengembalikan pangkalan data ke contoh sejarah awal (Syaikhona Kholil & KH Hasyim Asy\'ari).\nSemua data baru yang tidak disimpan ke berkas ekspor akan hilang. Teruskan?')) {
      onResetData();
      setSelectedProfileId('');
      setBackupSuccessMsg('Pangkalan data Sanad berhasil diringankan kembali ke pengaturan awal histori.');
      setTimeout(() => setBackupSuccessMsg(''), 5000);
    }
  };

  // Guard login state
  if (!loggedInEmail) {
    return (
      <div id="admin-login-card" className="max-w-md mx-auto my-12 bg-white border border-brand-olive/15 rounded-xl shadow-lg overflow-hidden font-sans">
        
        {/* Ivory Cover Banner */}
        <div className="p-8 bg-brand-ivory text-center relative">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-brand-olive"></div>
          <div className="w-14 h-14 rounded-full bg-brand-olive/10 border-2 border-brand-olive flex items-center justify-center mx-auto mb-4 text-brand-olive font-serif font-bold text-lg shadow-sm">
            🎓
          </div>
          <h2 className="text-xl font-serif font-bold text-brand-dark leading-snug">
            Portal Administrasi
          </h2>
          <p className="text-xs text-brand-olive/80 mt-1 max-w-[280px] mx-auto leading-relaxed">
            Gunakan alamat email akademik Anda untuk membuka konsol input data riset Doktoral Sanad.
          </p>
        </div>

        {/* Input Form Box */}
        <form onSubmit={handleLogin} className="p-8 space-y-4">
          {loginError && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded border border-red-200 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-brand-olive/85 block uppercase tracking-wider font-mono">Email Riset</label>
            <div className="relative">
              <Mail className="h-4 w-4 absolute left-3 top-3 text-brand-olive/40" />
              <input
                id="admin-email-input"
                type="email"
                placeholder="misal: punkysme@gmail.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-stone-50 hover:bg-stone-100/50 focus:bg-white rounded-lg border border-stone-200 text-sm outline-none focus:border-brand-olive transition-all"
                required
              />
            </div>
            <p className="text-[10px] text-brand-olive/60 leading-normal mt-1">
              Catatan: Tidak memerlukan password. Akun Anda (disarankan menggunakan <b>punkysme@gmail.com</b>) akan tercatat untuk session entri data ini.
            </p>
          </div>

          <button
            id="admin-login-submit"
            type="submit"
            className="w-full bg-brand-olive hover:bg-brand-olive-light text-brand-ivory font-semibold text-sm py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98 cursor-pointer"
          >
            <Lock className="h-4 w-4" /> Masuk ke Panel Ketik
          </button>
        </form>
      </div>
    );
  }

  return (
    <div id="admin-workspace-layout" className="space-y-6 font-sans">
      
      {/* Session Header Status */}
      <div className="p-4 bg-brand-ivory rounded-xl border border-brand-olive/15 flex flex-wrap gap-4 items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-olive text-brand-ivory font-serif flex items-center justify-center font-bold text-base shadow-sm">
            S
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-brand-dark text-sm md:text-base">Konsol Input Data Sanad</span>
              <span className="text-[10px] bg-brand-sage/20 text-brand-teal font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-brand-sage/35">
                <UserCheck className="w-3 h-3" /> Peneliti Aktif
              </span>
            </div>
            <p className="text-xs text-brand-olive/70 font-mono mt-0.5">{loggedInEmail}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            id="admin-logout-button"
            onClick={handleLogout}
            className="text-xs font-semibold text-brand-olive hover:text-brand-dark bg-white border border-brand-olive/15 px-3.5 py-1.5 rounded-lg shadow-sm transition-all hover:bg-brand-ivory/50"
          >
            Selesai Sesi Admin
          </button>
        </div>
      </div>

      {/* Primary Workspace Cards System */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Action Form Workspace Column */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white border border-brand-olive/15 rounded-xl overflow-hidden shadow-sm">
            
            {/* Primary Tab Bar Menu */}
            <div className="flex bg-brand-ivory/50 border-b border-brand-olive/10">
              <button
                id="menu-nodes-edges-tab"
                onClick={() => setActiveTab('nodes-edges')}
                className={`flex-1 py-3 px-4 font-serif font-bold text-sm text-center flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
                  activeTab === 'nodes-edges'
                    ? 'border-brand-olive bg-white text-brand-olive'
                    : 'border-transparent text-brand-olive/60 hover:bg-brand-ivory/30 hover:text-brand-dark'
                }`}
              >
                <Layers className="h-4 w-4" /> Menu 1: Simpul & Jaringan (Edges)
              </button>
              <button
                id="menu-details-tab"
                onClick={() => setActiveTab('details')}
                className={`flex-1 py-3 px-4 font-serif font-bold text-sm text-center flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
                  activeTab === 'details'
                    ? 'border-brand-olive bg-white text-brand-olive'
                    : 'border-transparent text-brand-olive/60 hover:bg-brand-ivory/30 hover:text-brand-dark'
                }`}
              >
                <CalendarDays className="h-4 w-4" /> Menu 2: Rincian Profil & Historiografi
              </button>
            </div>

            {/* TAB CONTENT 1: NODES & EDGES CREATOR */}
            {activeTab === 'nodes-edges' && (
              <div className="p-6 space-y-6">
                
                {/* Switch between Creating a Node or Creating an Edge */}
                <div className="flex border border-stone-150 rounded-lg p-1 bg-stone-50 max-w-sm">
                  <button
                    type="button"
                    onClick={() => setNodeEdgeSubTab('node')}
                    className={`flex-1 py-1 px-3 rounded-md text-xs font-semibold text-center transition-all ${
                      nodeEdgeSubTab === 'node' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'
                    }`}
                  >
                    Tambah Entitas Baru (Node)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNodeEdgeSubTab('edge')}
                    className={`flex-1 py-1 px-3 rounded-md text-xs font-semibold text-center transition-all ${
                      nodeEdgeSubTab === 'edge' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'
                    }`}
                  >
                    Hubungkan Silsilah (Edge Link)
                  </button>
                </div>

                {/* SubTab 1A: Node Creater Form */}
                {nodeEdgeSubTab === 'node' && (
                  <form onSubmit={handleCreateNode} className="space-y-4">
                    <h3 className="font-serif font-semibold text-brand-dark border-b border-brand-olive/10 pb-2">Menambahkan Simpul Entitas Baru</h3>
                    
                    {nodeSuccessMsg && (
                      <div className="p-3 bg-brand-sage/10 text-brand-teal text-xs rounded border border-brand-sage/20 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-brand-ochre flex-shrink-0" />
                        <span>{nodeSuccessMsg}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-brand-olive/80 uppercase tracking-wide">Nama Tokoh / Artefak / Institusi</label>
                        <input
                          id="new-node-name"
                          type="text"
                          placeholder="misal: KH. Wahab Chasbullah, Kitab Fathul Mu'in"
                          value={newNodeName}
                          onChange={(e) => setNewNodeName(e.target.value)}
                          className="w-full p-2 bg-stone-50 hover:bg-stone-100/30 focus:bg-white rounded-lg border border-stone-200 text-sm outline-none focus:border-brand-olive transition-all font-sans"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-brand-olive/80 uppercase tracking-wide">Tipe Entitas (Katalog)</label>
                        <select
                          id="new-node-type"
                          value={newNodeType}
                          onChange={(e) => setNewNodeType(e.target.value as NodeType)}
                          className="w-full p-2 bg-stone-50 hover:bg-stone-100/30 focus:bg-white rounded-lg border border-stone-200 text-sm outline-none focus:border-brand-olive transition-all"
                        >
                          {Object.keys(NODE_TYPE_META).map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-brand-olive/80 uppercase tracking-wide">Deskripsi Ringkas / Signifikansi Histori</label>
                      <textarea
                        id="new-node-desc"
                        rows={2}
                        placeholder="Uraikan sekilas peran entitas ini dalam peta pengetahuan pesantren..."
                        value={newNodeDesc}
                        onChange={(e) => setNewNodeDesc(e.target.value)}
                        className="w-full p-2 bg-stone-50 hover:bg-stone-100/30 focus:bg-white rounded-lg border border-stone-200 text-sm outline-none focus:border-brand-olive transition-all"
                      />
                    </div>

                    <button
                      id="submit-node-btn"
                      type="submit"
                      className="bg-brand-olive hover:bg-brand-olive-light text-brand-ivory font-semibold text-xs py-2 px-4 rounded-lg flex items-center justify-content gap-2 transition-all cursor-pointer"
                    >
                      <Plus className="h-4 w-4" /> Simpan Entitas ke Pangkalan
                    </button>
                  </form>
                )}

                {/* SubTab 1B: Edge Creator Form */}
                {nodeEdgeSubTab === 'edge' && (
                  <form onSubmit={handleCreateEdge} className="space-y-4">
                    <h3 className="font-serif font-semibold text-brand-dark border-b border-brand-olive/10 pb-2">Menyambungkan Hubungan / Transmisi Keilmuan</h3>
                    
                    {edgeSuccessMsg && (
                      <div className="p-3 bg-brand-sage/10 text-brand-teal text-xs rounded border border-brand-sage/20 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-brand-ochre flex-shrink-0" />
                        <span>{edgeSuccessMsg}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Source node selection */}
                      <div className="space-y-1 col-span-1">
                        <label className="text-xs font-bold text-brand-olive/80 uppercase tracking-wide block">Simpul Pengirim (Silsilah Mulai)</label>
                        <select
                          id="new-edge-source"
                          value={newEdgeSource}
                          onChange={(e) => setNewEdgeSource(e.target.value)}
                          className="w-full p-2 bg-stone-50 hover:bg-stone-100/30 focus:bg-white rounded-lg border border-stone-200 text-sm outline-none focus:border-brand-olive transition-all cursor-pointer"
                          required
                        >
                          <option value="">-- Pilih Simpul Mulai --</option>
                          {nodes.map(n => (
                            <option key={n.id} value={n.id}>{n.label} [{n.type}]</option>
                          ))}
                        </select>
                      </div>

                      {/* Target node selection */}
                      <div className="space-y-1 col-span-1">
                        <label className="text-xs font-bold text-brand-olive/80 uppercase tracking-wide block">Simpul Penerima (Silsilah Terkait)</label>
                        <select
                          id="new-edge-target"
                          value={newEdgeTarget}
                          onChange={(e) => setNewEdgeTarget(e.target.value)}
                          className="w-full p-2 bg-stone-50 hover:bg-stone-100/30 focus:bg-white rounded-lg border border-stone-200 text-sm outline-none focus:border-brand-olive transition-all cursor-pointer"
                          required
                        >
                          <option value="">-- Pilih Simpul Penerima --</option>
                          {nodes.map(n => (
                            <option key={n.id} value={n.id}>{n.label} [{n.type}]</option>
                          ))}
                        </select>
                      </div>

                      {/* Relationship selection */}
                      <div className="space-y-1 col-span-1">
                        <label className="text-xs font-bold text-brand-olive/80 uppercase tracking-wide block">Hubungan Silsilah (Edge Type)</label>
                        <select
                          id="new-edge-type"
                          value={newEdgeType}
                          onChange={(e) => setNewEdgeType(e.target.value)}
                          className="w-full p-2 bg-stone-50 hover:bg-stone-100/30 focus:bg-white rounded-lg border border-stone-200 text-sm outline-none focus:border-brand-olive transition-all cursor-pointer"
                        >
                          {Object.entries(EDGE_TYPE_LABELS).map(([val, name]) => (
                            <option key={val} value={val}>{name}</option>
                          ))}
                          <option value="lainnya">Tulis Kustom Baru...</option>
                        </select>
                      </div>

                      {/* Relationship custom defined */}
                      {newEdgeType === 'lainnya' && (
                        <div className="space-y-1 col-span-1">
                          <label className="text-xs font-bold text-brand-olive/80 uppercase tracking-wide block">Nama Hubungan Kustom</label>
                          <input
                            id="custom-edge-type"
                            type="text"
                            placeholder="misal: dinisbahkan, pendiri, dibaiat"
                            value={customEdgeType}
                            onChange={(e) => setCustomEdgeType(e.target.value)}
                            className="w-full p-2 bg-stone-50 hover:bg-stone-100/30 focus:bg-white rounded-lg border border-stone-200 text-sm outline-none focus:border-brand-olive transition-all"
                            required
                          />
                        </div>
                      )}

                      {/* Year connection happened */}
                      <div className="space-y-1 col-span-1">
                        <label className="text-xs font-bold text-brand-olive/80 uppercase tracking-wide block">Estimasi Tahun Peristiwa Hubungan</label>
                        <input
                          id="new-edge-year"
                          type="number"
                          placeholder="Contoh: 1891"
                          value={newEdgeYear}
                          onChange={(e) => setNewEdgeYear(e.target.value)}
                          className="w-full p-2 bg-stone-50 hover:bg-stone-100/30 focus:bg-white rounded-lg border border-stone-200 text-sm outline-none focus:border-brand-olive transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-brand-olive/80 uppercase tracking-wide">Keterangan / Dalil Temuan Riset</label>
                      <textarea
                        id="new-edge-notes"
                        rows={2}
                        placeholder="Tulis rujukan manuskrip atau literatur sebagai dalil transmisi ini (opsional)..."
                        value={newEdgeNotes}
                        onChange={(e) => setNewEdgeNotes(e.target.value)}
                        className="w-full p-2 bg-stone-50 hover:bg-stone-100/30 focus:bg-white rounded-lg border border-stone-200 text-sm outline-none focus:border-brand-olive transition-all"
                      />
                    </div>

                    <button
                      id="submit-edge-btn"
                      type="submit"
                      className="bg-brand-olive hover:bg-brand-olive-light text-brand-ivory font-semibold text-xs py-2 px-4 rounded-lg flex items-center justify-content gap-2 transition-all cursor-pointer"
                    >
                      <Link className="h-4 w-4" /> Hubungkan Simpul
                    </button>
                  </form>
                )}

              </div>
            )}

            {/* TAB CONTENT 2: DETAILS PROFILE EDITOR */}
            {activeTab === 'details' && (
              <div className="p-6 space-y-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-brand-olive/85 block uppercase tracking-wider block">Pilih Entitas untuk Melengkapi Biografis & Historiografi</label>
                  <select
                    id="profile-picker-dropdown"
                    value={selectedProfileId}
                    onChange={(e) => handleSelectProfileNode(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none focus:border-brand-olive font-medium cursor-pointer"
                  >
                    <option value="">-- Pilih Entitas yang Ingin Dilengkapi --</option>
                    {nodes.map(n => (
                      <option key={n.id} value={n.id}>{n.label} [{n.type}]</option>
                    ))}
                  </select>
                </div>

                {selectedProfileId ? (
                  <form onSubmit={handleSaveProfile} className="space-y-6 border-t border-brand-olive/10 pt-4">
                    
                    {profileSuccessMsg && (
                      <div className="p-3.5 bg-brand-sage/10 text-brand-teal text-xs rounded-lg border border-brand-sage/20 flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-brand-ochre flex-shrink-0" />
                        <span>{profileSuccessMsg}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-brand-dark">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: NODE_TYPE_META[nodes.find(n => n.id === selectedProfileId)?.type || 'Guru'].color }}></span>
                      <h4 className="font-serif font-bold">Profil Akademik: <span className="text-brand-olive font-semibold font-sans">{nodes.find(n => n.id === selectedProfileId)?.label}</span></h4>
                    </div>

                    {/* Standard details structure inputs */}
                    <div className="bg-stone-50 rounded-xl p-4 border border-stone-150 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <h5 className="text-xs font-bold uppercase tracking-wide text-stone-400 font-mono mb-2">Atribut Terstruktur</h5>
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-stone-600">Tahun Kelahiran (Hijriyah/Masehi)</label>
                        <input
                          id="profile-birth"
                          type="text"
                          placeholder="misal: 1252 H / 1835 M"
                          value={profileBirth}
                          onChange={(e) => setProfileBirth(e.target.value)}
                          className="w-full p-2 bg-white rounded border border-stone-200 text-xs outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-stone-600">Tahun Wafat (Hijriyah/Masehi)</label>
                        <input
                          id="profile-death"
                          type="text"
                          placeholder="misal: 1925 M"
                          value={profileDeath}
                          onChange={(e) => setProfileDeath(e.target.value)}
                          className="w-full p-2 bg-white rounded border border-stone-200 text-xs outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-stone-600">Tahun Didirikan (Khusus Pesantren)</label>
                        <input
                          id="profile-est"
                          type="text"
                          placeholder="misal: 1899 M"
                          value={profileEst}
                          onChange={(e) => setProfileEst(e.target.value)}
                          className="w-full p-2 bg-white rounded border border-stone-200 text-xs outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-stone-600">Nama Pengarang / Tokoh Kunci (Kitab / Naskah)</label>
                        <input
                          id="profile-author"
                          type="text"
                          placeholder="Syaikhona, Kiai..."
                          value={profileAuthor}
                          onChange={(e) => setProfileAuthor(e.target.value)}
                          className="w-full p-2 bg-white rounded border border-stone-200 text-xs outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-stone-600">Negeri / Lokasi Geografis Utama</label>
                        <input
                          id="profile-loc"
                          type="text"
                          placeholder="Jombang, Mekkah, Bangkalan..."
                          value={profileLoc}
                          onChange={(e) => setProfileLoc(e.target.value)}
                          className="w-full p-2 bg-white rounded border border-stone-200 text-xs outline-none"
                        />
                      </div>

                      <div className="space-y-1 col-span-2">
                        <label className="text-xs font-medium text-stone-600">Metode & Praktik Pembinaan Tradisi (Khusus Tradisi)</label>
                        <textarea
                          id="profile-prac"
                          rows={2}
                          placeholder="Gambaran rinci tata cara khidmat (misal: jenggotan pegon, mulazamah bersila)..."
                          value={profilePrac}
                          onChange={(e) => setProfilePrac(e.target.value)}
                          className="w-full p-2 bg-white rounded border border-stone-200 text-xs outline-none"
                        />
                      </div>
                    </div>

                    {/* DYNAMIC METADATA ATTRIBUTES SUB-PANEL */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 font-mono">Daftar Atribut Dinamis</h4>
                      
                      {/* Form inputs for new attribute row */}
                      <div className="flex gap-2 items-end bg-stone-50 border p-3 rounded-lg">
                        <div className="space-y-0.5 flex-1">
                          <label className="text-[10px] text-stone-500 font-sans">Kunci Atribut (Label)</label>
                          <input
                            id="custom-field-key"
                            type="text"
                            placeholder="misal: Guru Utama di Mekkah"
                            value={tempFieldKey}
                            onChange={(e) => setTempFieldKey(e.target.value)}
                            className="w-full p-1.5 bg-white text-xs border rounded outline-none"
                          />
                        </div>
                        <div className="space-y-0.5 flex-1">
                          <label className="text-[10px] text-stone-500">Nilai Atribut (Konten)</label>
                          <input
                            id="custom-field-value"
                            type="text"
                            placeholder="Syaikh Mahfudz al-Tarmasi"
                            value={tempFieldValue}
                            onChange={(e) => setTempFieldValue(e.target.value)}
                            className="w-full p-1.5 bg-white text-xs border rounded outline-none"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleAddCustomField}
                          className="bg-stone-200 hover:bg-stone-300 text-stone-700 hover:text-stone-900 p-2 rounded text-xs shrink-0 cursor-pointer"
                        >
                          Sematkan
                        </button>
                      </div>

                      {/* Display added fields */}
                      {profileCustomFields.length > 0 ? (
                        <div className="border border-stone-150 rounded-lg overflow-hidden divide-y divide-stone-100 text-xs">
                          {profileCustomFields.map((field) => (
                            <div key={field.id} className="flex justify-between items-center p-2 hover:bg-stone-50">
                              <span className="font-medium text-stone-700 bg-stone-100 px-1.5 py-0.5 rounded leading-none">{field.key}:</span>
                              <div className="flex items-center gap-3">
                                <span className="font-bold text-stone-850">{field.value}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveCustomField(field.id)}
                                  className="text-red-500 hover:text-red-700 active:scale-95 transition-all cursor-pointer"
                                  title="Hapus"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-stone-400 italic">Belum ada atribut dinamis khusus untuk entitas ini.</p>
                      )}
                    </div>

                    {/* DYNAMIC TIMELINE EVENTS MANAGER */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 font-mono">Daftar Historiografi Peristiwa (Timeline)</h4>
                      
                      {/* Form inputs for new timeline event */}
                      <div className="bg-stone-50 border border-brand-olive/15 p-4 rounded-xl space-y-3">
                        <span className="text-[11px] font-bold text-brand-olive font-serif">Sematkan Peristiwa Baru:</span>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-0.5">
                            <label className="text-[10px] text-stone-500">Tahun Numerik (Wajib untuk Sumbu Urutan)*</label>
                            <input
                              id="event-year"
                              type="number"
                              placeholder="Contoh: 1891"
                              value={tempEventYear}
                              onChange={(e) => setTempEventYear(e.target.value)}
                              className="w-full p-1.5 bg-white text-xs border rounded outline-none"
                            />
                          </div>
                          <div className="space-y-0.5">
                            <label className="text-[10px] text-stone-500">Display Tahun (Teks Bebas)</label>
                            <input
                              id="event-display-year"
                              type="text"
                              placeholder="misal: 1252 H / 1835 M"
                              value={tempEventDispYear}
                              onChange={(e) => setTempEventDispYear(e.target.value)}
                              className="w-full p-1.5 bg-white text-xs border rounded outline-none"
                            />
                          </div>
                          <div className="space-y-0.5">
                            <label className="text-[10px] text-stone-500">Judul Milestones Peristiwa*</label>
                            <input
                              id="event-title"
                              type="text"
                              placeholder="misal: Keberangkatan Ke Mekkah"
                              value={tempEventTitle}
                              onChange={(e) => setTempEventTitle(e.target.value)}
                              className="w-full p-1.5 bg-white text-xs border rounded outline-none"
                            />
                          </div>
                          <div className="space-y-0.5">
                            <label className="text-[10px] text-stone-500">📍 Lokasi Peristiwa</label>
                            <input
                              id="event-location"
                              type="text"
                              placeholder="Mekkah, Bangkalan, Semarang..."
                              value={tempEventLoc}
                              onChange={(e) => setTempEventLoc(e.target.value)}
                              className="w-full p-1.5 bg-white text-xs border rounded outline-none"
                            />
                          </div>
                          <div className="col-span-2 space-y-0.5">
                            <label className="text-[10px] text-stone-500">Uraian / Deskripsi Kontekstual Peristiwa</label>
                            <input
                              id="event-description"
                              type="text"
                              placeholder="Perjalanan riset keilmuan dan pertemuan guru..."
                              value={tempEventDesc}
                              onChange={(e) => setTempEventDesc(e.target.value)}
                              className="w-full p-1.5 bg-white text-xs border rounded outline-none"
                            />
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleAddHistoricalEvent}
                          className="bg-stone-200 hover:bg-stone-300 text-stone-700 hover:text-stone-900 font-semibold px-3.5 py-1 text-xs rounded shadow-xs cursor-pointer"
                        >
                          Sematkan Peristiwa
                        </button>
                      </div>

                      {/* Display current events list */}
                      {profileEvents.length > 0 ? (
                        <div className="border border-stone-150 rounded-lg divide-y divide-stone-100 max-h-[220px] overflow-y-auto">
                          {profileEvents
                            .slice()
                            .sort((a,b) => a.year - b.year)
                            .map((ev) => (
                              <div key={ev.id} className="p-3 hover:bg-stone-50 flex items-start gap-3 justify-between text-xs">
                                <div className="space-y-0.5 min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-mono bg-stone-100 font-bold px-1.5 rounded">{ev.displayYear || ev.year}</span>
                                    {ev.location && <span className="text-stone-400 font-serif font-semibold">📍 {ev.location}</span>}
                                  </div>
                                  <span className="font-bold text-stone-800 block truncate">{ev.title}</span>
                                  <p className="text-stone-500 hover:text-stone-700 text-[11px] leading-relaxed line-clamp-2">{ev.description}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveHistoricalEvent(ev.id)}
                                  className="text-red-500 hover:text-red-700 pt-1 flex-shrink-0 cursor-pointer"
                                  title="Hapus peristiwa"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <p className="text-xs text-stone-400 italic">Belum ada linimasa historiografi terdaftar untuk entitas ini.</p>
                      )}
                    </div>

                    {/* Commit Save detail profile to memory */}
                    <button
                      id="save-profile-btn"
                      type="submit"
                      className="w-full bg-brand-olive hover:bg-brand-olive-light text-brand-ivory font-serif font-bold text-sm py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-99 transition-all"
                    >
                      <Save className="h-4.5 w-4.5" /> Simpan Profil Akademik: {nodes.find(n => n.id === selectedProfileId)?.label}
                    </button>

                  </form>
                ) : (
                  <div className="text-center p-12 text-stone-400 border border-dashed border-stone-200 rounded-xl">
                    <CalendarDays className="h-10 w-10 text-stone-300 mx-auto mb-2" />
                    <p className="text-xs">Silakan pilih sebuah Entitas (Node) di dropdown atas untuk mengelola parameter biografi intelektualnya.</p>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* Database List / Manage Side Column */}
        <div className="xl:col-span-1 space-y-6">

          {/* Backup / Export Center */}
          <div className="bg-white border border-brand-olive/15 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 bg-brand-ivory/60 border-b border-brand-olive/10">
              <h3 className="font-serif font-bold text-brand-dark text-sm flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-brand-olive" /> Pusat Keamanan Data Riset
              </h3>
            </div>
            
            <div className="p-5 space-y-4">
              
              {backupSuccessMsg && (
                <div className="p-3 bg-brand-sage/10 text-brand-teal text-xs rounded border border-brand-sage/20">
                  {backupSuccessMsg}
                </div>
              )}
              {backupErrorMsg && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded border border-red-150">
                  {backupErrorMsg}
                </div>
              )}

              <p className="text-xs text-stone-500 leading-relaxed">
                Sebagai sarana penelitian ilmiah, pastikan Anda mencadangkan (ekspor) draf data Anda secara berkala agar tidak hilang ketika membersihkan memori web browser.
              </p>

              {/* Download JSON backup btn */}
              <button
                id="export-json-button"
                onClick={handleExportJSON}
                className="w-full border-2 border-brand-olive text-brand-olive hover:bg-brand-olive/10 font-bold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer font-serif"
              >
                <Download className="h-4 w-4" /> Ekspor Dataset (JSON)
              </button>

              {/* Upload JSON backup files */}
              <div className="border border-dashed border-stone-350 rounded-lg p-3 hover:bg-stone-50 transition-colors relative flex flex-col items-center justify-center text-center">
                <Upload className="h-6 w-6 text-stone-400 mb-1" />
                <span className="text-[10px] text-stone-600 block font-bold">Impor Dataset (Sematkan .json)</span>
                <span className="text-[9px] text-stone-400 block mt-0.5">Memutakhirkan pangkalan data dari file ekspor sebelumnya</span>
                <input
                  id="import-json-file"
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>

              {/* Rest default history button */}
              <div className="border-t border-stone-100 pt-3">
                <button
                  id="reset-history-btn"
                  onClick={handleTriggerReset}
                  className="w-full bg-stone-100 font-medium hover:bg-red-550 hover:text-red-700 text-stone-600 text-[10px] py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className="h-3 w-3" /> Muat Ulang Templat Sejarah Awal
                </button>
              </div>

            </div>
          </div>

          {/* Current Entities List with Quick Delete option */}
          <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 bg-stone-50 border-b border-stone-200 flex justify-between items-center">
              <h3 className="font-serif font-bold text-stone-850 text-sm">
                Katalog Entitas ({nodes.length})
              </h3>
            </div>
            
            <div className="divide-y divide-stone-100 max-h-[350px] overflow-y-auto">
              {nodes.map((n) => (
                <div key={n.id} className="p-3 hover:bg-stone-50 flex items-center justify-between text-xs gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: NODE_TYPE_META[n.type].color }}></span>
                      <span className="font-bold text-stone-800 block truncate" title={n.label}>{n.label}</span>
                    </div>
                    <span className="text-[10px] text-stone-400 block font-mono">{n.type}</span>
                  </div>
                  
                  <button
                    onClick={() => handleDeleteNode(n.id)}
                    className="text-stone-400 hover:text-red-650 p-1.5 rounded hover:bg-stone-100 active:scale-95 transition-all cursor-pointer"
                    title="Hapus entitas beserta relasinya"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Connections / Edges List */}
          <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 bg-stone-50 border-b border-stone-200">
              <h3 className="font-serif font-bold text-stone-850 text-sm">
                Jaringan Sanad ({edges.length})
              </h3>
            </div>
            
            <div className="divide-y divide-stone-100 max-h-[350px] overflow-y-auto">
              {edges.map((e) => {
                const sNode = nodes.find(n => n.id === e.source);
                const tNode = nodes.find(n => n.id === e.target);
                return (
                  <div key={e.id} className="p-3 hover:bg-stone-50 flex items-center justify-between text-xs gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1 flex-wrap font-sans">
                        <span className="font-semibold text-stone-800 truncate" title={sNode?.label}>{sNode?.label || 'Error: Simpul Hilang'}</span>
                        <span className="text-[10px] bg-brand-ivory text-brand-olive px-1 py-0.2 rounded font-mono font-bold border border-brand-olive/10">{EDGE_TYPE_LABELS[e.type] || e.type}</span>
                        <span className="font-semibold text-stone-800 truncate" title={tNode?.label}>{tNode?.label || 'Error: Simpul Hilang'}</span>
                      </div>
                      {e.notes && <p className="text-[10px] text-stone-500 mt-1 italic font-sans leading-relaxed truncate" title={e.notes}>"{e.notes}"</p>}
                    </div>
                    
                    <button
                      onClick={() => handleDeleteEdge(e.id)}
                      className="text-stone-400 hover:text-red-650 p-1.5 rounded hover:bg-stone-100 active:scale-95 transition-all cursor-pointer flex-shrink-0"
                      title="Hapus silsilah"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
