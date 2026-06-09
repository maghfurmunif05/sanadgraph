import React from 'react';
import { GraphNode, GraphEdge, NodeType } from '../types';
import { colorsByType } from './SidebarLegend';
import { X, Calendar, MapPin, BookOpen, Compass, ArrowRightLeft, Award } from 'lucide-react';

interface DetailDrawerProps {
  selectedNode: GraphNode | null;
  onClose: () => void;
  nodes: GraphNode[];
  edges: GraphEdge[];
  onSelectNode: (node: GraphNode) => void;
}

export default function DetailDrawer({
  selectedNode,
  onClose,
  nodes,
  edges,
  onSelectNode,
}: DetailDrawerProps) {
  if (!selectedNode) return null;

  // Compile direct relationships from edges index
  const directRelations = edges
    .filter((e) => {
      const sourceId = typeof e.source === 'object' ? (e.source as any).id : e.source_node_id;
      const targetId = typeof e.target === 'object' ? (e.target as any).id : e.target_node_id;
      return sourceId === selectedNode.id || targetId === selectedNode.id;
    })
    .map((e) => {
      const sourceId = typeof e.source === 'object' ? (e.source as any).id : e.source_node_id;
      const targetId = typeof e.target === 'object' ? (e.target as any).id : e.target_node_id;
      
      const isSource = sourceId === selectedNode.id;
      const partnerId = isSource ? targetId : sourceId;
      const partnerNode = nodes.find((n) => n.id === partnerId);

      return {
        edgeId: e.id,
        relationType: e.edge_type,
        yearContext: e.year_context,
        node: partnerNode,
        isOutgoing: isSource,
      };
    })
    .filter((r) => r.node !== undefined) as Array<{
      edgeId: string;
      relationType: string;
      yearContext?: number;
      node: GraphNode;
      isOutgoing: boolean;
    }>;

  // Segregate relationships for neat tabs
  const gurus = directRelations.filter((r) => 
    (r.relationType === 'belajar_kepada' && r.isOutgoing) ||
    (r.relationType === 'mengajar' && !r.isOutgoing)
  );

  const murids = directRelations.filter((r) => 
    (r.relationType === 'belajar_kepada' && !r.isOutgoing) ||
    (r.relationType === 'mengajar' && r.isOutgoing)
  );

  const otherRelatioms = directRelations.filter((r) => 
    !(r.relationType === 'belajar_kepada') && !(r.relationType === 'mengajar')
  );

  const getRelationBadge = (type: string, isOutgoing: boolean) => {
    switch (type) {
      case 'belajar_kepada':
        return isOutgoing ? 'Berguru Kepada' : 'Pemberi Sanad';
      case 'mengajar':
        return isOutgoing ? 'Mengajar Di' : 'Diampu Oleh';
      case 'menyalin':
        return isOutgoing ? 'Disalin Oleh' : 'Menyalin Karya';
      case 'memiliki':
        return isOutgoing ? 'Memiliki' : 'Dimiliki Oleh';
      case 'memberi_ijazah':
        return isOutgoing ? 'Menerima Ijazah' : 'Mengijazahkan';
      case 'baiat':
        return 'Baiat Tarekat';
      case 'alumni':
        return isOutgoing ? 'Alumni Dari' : 'Melahirkan Alumni';
      case 'tradisi_bandongan':
        return 'Tradisi Bandongan';
      case 'tradisi_sorogan':
        return 'Tradisi Sorogan';
      default:
        return type.replace('_', ' ');
    }
  };

  const meta = selectedNode.metadata;
  const color = colorsByType[selectedNode.type] || '#10b981';

  return (
    <div 
      className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl border-l border-slate-200/60 flex flex-col transform transition-all duration-300 ease-out"
      style={{ top: '64px', height: 'calc(100vh - 64px)' }} // Below Navbar
      id="side-drawer"
    >
      {/* Header section with Close button and beautiful gradient accent */}
      <div className="relative p-6 pb-5 border-b border-slate-100 flex-shrink-0">
        <div 
          className="absolute left-0 top-0 w-2.5 h-full" 
          style={{ backgroundColor: color }}
        />
        
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
          id="btn-close-drawer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col gap-2 pr-6">
          <span 
            className="text-[10px] font-bold tracking-wider uppercase font-mono px-2.5 py-0.5 rounded-full w-max text-white"
            style={{ backgroundColor: color }}
          >
            {selectedNode.type}
          </span>
          <h2 className="text-xl font-bold text-slate-800 leading-snug mt-1" id="drawer-node-name">
            {selectedNode.name}
          </h2>
          {meta.lokasi && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{meta.lokasi}</span>
            </div>
          )}
        </div>
      </div>

      {/* Content scroll container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Biography/Description */}
        {(meta.biografi || meta.deskripsi) && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Deskripsi / Riwayat</h3>
            <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100 italic" id="drawer-description">
              " {meta.biografi || meta.deskripsi} "
            </p>
          </div>
        )}

        {/* Profil Akademis */}
        {meta.profil_akademis && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Profil Akademis & Kedudukan</h3>
            <div className="bg-white p-4 rounded-2xl border border-slate-150 shadow-xs">
              <p className="text-xs text-slate-600 leading-relaxed font-semibold whitespace-pre-line">
                {meta.profil_akademis}
              </p>
            </div>
          </div>
        )}

        {/* Atribut Dinamis badging (Kepakaran, Gelar, silsilah keturunan) */}
        {meta.atribut_dinamis && Array.isArray(meta.atribut_dinamis) && meta.atribut_dinamis.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Karakteristik & Capaian</h3>
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex flex-wrap gap-2">
              {meta.atribut_dinamis.map((attrByUlama: any, idxOfAttr: number) => {
                if (!attrByUlama.key || !attrByUlama.value) return null;
                return (
                  <div key={idxOfAttr} className="bg-white border border-slate-200/80 rounded-xl px-3 py-1.5 text-xs flex flex-col gap-0.5 shadow-2xs">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">{attrByUlama.key}</span>
                    <span className="font-bold text-slate-700 leading-tight">{attrByUlama.value}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Historiografi Timeline */}
        {meta.historiografi && Array.isArray(meta.historiografi) && meta.historiografi.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Historiografi & Peristiwa</h3>
            <div className="relative pl-3.5 border-l-2 border-slate-100 space-y-4">
              {meta.historiografi
                .slice()
                .sort((a, b) => (Number(a.tahun_numerik) || 0) - (Number(b.tahun_numerik) || 0))
                .map((historyEvent: any, idxOfEvent: number) => (
                  <div key={idxOfEvent} className="relative space-y-1">
                    {/* Event bullet points */}
                    <div className="absolute -left-[20.5px] top-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-white" />
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-mono text-[9px] font-black text-white bg-slate-800 px-2 py-0.5 rounded">
                        {historyEvent.tahun_bebas || `${historyEvent.tahun_numerik} M`}
                      </span>
                      {historyEvent.lokasi_peristiwa && (
                        <span className="text-[10px] text-slate-400 font-bold flex items-center gap-0.5 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                          📍 {historyEvent.lokasi_peristiwa}
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-slate-800">{historyEvent.judul_milestone}</h4>
                    {historyEvent.uraian && (
                      <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                        {historyEvent.uraian}
                      </p>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Dynamic Metadata Properties */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Informasi Silsilah</h3>
          
          <div className="grid grid-cols-2 gap-3.5">
            {meta.tahun_lahir && (
              <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Lahir</p>
                  <p className="text-xs font-semibold text-slate-700">{meta.tahun_lahir} M</p>
                </div>
              </div>
            )}
            
            {meta.tahun_wafat && (
              <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-rose-500 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase font-mono">Wafat</p>
                  <p className="text-xs font-semibold text-slate-700">{meta.tahun_wafat} M</p>
                </div>
              </div>
            )}

            {meta.tahun_ke_mekkah && (
              <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 flex items-center gap-2.5 col-span-2">
                <Compass className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Rihlah Ke Mekkah</p>
                  <p className="text-xs font-semibold text-slate-700">Tahun {meta.tahun_ke_mekkah} M</p>
                </div>
              </div>
            )}

            {meta.tahun_berdiri && (
              <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-teal-600 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Tahun Berdiri</p>
                  <p className="text-xs font-semibold text-slate-700">{meta.tahun_berdiri} M</p>
                </div>
              </div>
            )}

            {meta.pendiri && (
              <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 flex items-center gap-2.5">
                <Award className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Pendiri Pertama</p>
                  <p className="text-xs font-semibold text-slate-700 truncate">{meta.pendiri}</p>
                </div>
              </div>
            )}

            {meta.penulis && (
              <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 flex items-center gap-2.5">
                <BookOpen className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Pengarang / Mushannif</p>
                  <p className="text-xs font-semibold text-slate-700 truncate">{meta.penulis}</p>
                </div>
              </div>
            )}

            {meta.tahun_penulisan && (
              <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Penyusunan Kitab</p>
                  <p className="text-xs font-semibold text-slate-700">{meta.tahun_penulisan} M</p>
                </div>
              </div>
            )}
          </div>

          {meta.catatan_perjalanan && (
            <div className="bg-emerald-50/30 p-4 rounded-xl border border-emerald-100/40 text-xs text-slate-600 space-y-1">
              <span className="font-bold text-emerald-800 flex items-center gap-1">📍 Catatan Rihlah Keilmuan</span>
              <p className="leading-relaxed font-medium text-slate-600 italic">{meta.catatan_perjalanan}</p>
            </div>
          )}
        </div>

        {/* Relationships list */}
        <div className="space-y-4 pt-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sambungan Sanad Langsung</h3>

          {/* Section: Gurus of selected actor */}
          {gurus.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Mata Rantai Guru / Transmisi Hulu</p>
              <div className="flex flex-col gap-2">
                {gurus.map((g) => (
                  <button
                    key={g.edgeId}
                    onClick={() => onSelectNode(g.node)}
                    className="flex items-center justify-between p-2.5 bg-white hover:bg-emerald-50/40 border border-slate-100 rounded-xl text-left transition text-xs font-medium cursor-pointer shadow-sm group"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div 
                        className="w-1.5 h-6 rounded flex-shrink-0" 
                        style={{ backgroundColor: colorsByType[g.node.type] }}
                      />
                      <div className="truncate">
                        <p className="text-slate-800 font-semibold group-hover:text-emerald-700 transition truncate">{g.node.name}</p>
                        <p className="text-[9px] text-slate-400 font-mono tracking-wide">{g.node.type}</p>
                      </div>
                    </div>
                    <span className="text-[9px] bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                      {getRelationBadge(g.relationType, g.isOutgoing)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Section: Murids / Transmitters downstream */}
          {murids.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-cyan-700 uppercase tracking-wider">Transmisi Hilir / Murid-Murid</p>
              <div className="flex flex-col gap-2">
                {murids.map((m) => (
                  <button
                    key={m.edgeId}
                    onClick={() => onSelectNode(m.node)}
                    className="flex items-center justify-between p-2.5 bg-white hover:bg-cyan-50/40 border border-slate-100 rounded-xl text-left transition text-xs font-medium cursor-pointer shadow-sm group"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div 
                        className="w-1.5 h-6 rounded flex-shrink-0" 
                        style={{ backgroundColor: colorsByType[m.node.type] }}
                      />
                      <div className="truncate">
                        <p className="text-slate-800 font-semibold group-hover:text-cyan-700 transition truncate">{m.node.name}</p>
                        <p className="text-[9px] text-slate-400 font-mono tracking-wide">{m.node.type}</p>
                      </div>
                    </div>
                    <span className="text-[9px] bg-cyan-100/50 border border-cyan-100 text-cyan-850 font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                      {getRelationBadge(m.relationType, m.isOutgoing)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Section: Other direct relationships (Kitab / Manuskrip, dll) */}
          {otherRelatioms.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">Karya, Kitab / Manuskrip, Tradisi</p>
              <div className="flex flex-col gap-2">
                {otherRelatioms.map((o) => (
                  <button
                    key={o.edgeId}
                    onClick={() => onSelectNode(o.node)}
                    className="flex items-center justify-between p-2.5 bg-white hover:bg-indigo-50/40 border border-slate-100 rounded-xl text-left transition text-xs font-medium cursor-pointer shadow-sm group"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div 
                        className="w-1.5 h-6 rounded flex-shrink-0" 
                        style={{ backgroundColor: colorsByType[o.node.type] }}
                      />
                      <div className="truncate">
                        <p className="text-slate-800 font-semibold group-hover:text-indigo-700 transition truncate">{o.node.name}</p>
                        <p className="text-[9px] text-slate-400 font-mono tracking-wide">{o.node.type}</p>
                      </div>
                    </div>
                    <span className="text-[9px] bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                      {getRelationBadge(o.relationType, o.isOutgoing)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {directRelations.length === 0 && (
            <p className="text-xs text-slate-400 text-center italic py-4">Tidak ada relasi hulu/hilir langsung yang terdaftar.</p>
          )}
        </div>
      </div>
    </div>
  );
}
