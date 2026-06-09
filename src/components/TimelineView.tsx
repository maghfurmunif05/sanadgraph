import React, { useMemo } from 'react';
import { GraphNode, GraphEdge } from '../types';
import { colorsByType } from './SidebarLegend';
import { Calendar, ArrowRight, BookOpen, UserCheck, Flag, ArrowRightLeft } from 'lucide-react';

interface TimelineViewProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onSelectAndNavigate: (nodeId: string) => void;
}

interface TimelineItem {
  id: string;
  year: number;
  title: string;
  subtitle: string;
  description: string;
  nodeId: string;
  nodeType: string;
  iconType: 'birth' | 'death' | 'found' | 'write' | 'relation';
}

export default function TimelineView({
  nodes,
  edges,
  onSelectAndNavigate,
}: TimelineViewProps) {
  const timelineItems = useMemo(() => {
    const list: TimelineItem[] = [];

    // Scan Nodes for Chronological milestones
    nodes.forEach((n) => {
      const meta = n.metadata;

      // Birth
      if (meta.tahun_lahir) {
        list.push({
          id: `birth-${n.id}-${meta.tahun_lahir}`,
          year: Number(meta.tahun_lahir),
          title: `Kelahiran ${n.name}`,
          subtitle: `Tokoh / Ulama • ${n.type}`,
          description: meta.biografi || `Tahun kelahiran dari ulama besar ${n.name} di Nusantara.`,
          nodeId: n.id,
          nodeType: n.type,
          iconType: 'birth'
        });
      }

      // Death
      if (meta.tahun_wafat) {
        list.push({
          id: `death-${n.id}-${meta.tahun_wafat}`,
          year: Number(meta.tahun_wafat),
          title: `Berpulangnya ${n.name}`,
          subtitle: `Tokoh / Ulama • ${n.type}`,
          description: `Wafatnya ${n.name} menandai beralihnya estafet kepemimpinan intelektual sanad Nusantara ke generasi berikutnya.`,
          nodeId: n.id,
          nodeType: n.type,
          iconType: 'death'
        });
      }

      // Founding year (Pesantren)
      if (meta.tahun_berdiri) {
        list.push({
          id: `found-${n.id}-${meta.tahun_berdiri}`,
          year: Number(meta.tahun_berdiri),
          title: `Berdirinya ${n.name}`,
          subtitle: `Pondok Pesantren / Lembaga`,
          description: meta.deskripsi || `Pendirian institusi ${n.name} sebagai mercusuar pendidikan dan sanad naskah Nusantara.`,
          nodeId: n.id,
          nodeType: n.type,
          iconType: 'found'
        });
      }

      // Written Year (Kitab/Manuskrip)
      if (meta.tahun_penulisan) {
        list.push({
          id: `write-${n.id}-${meta.tahun_penulisan}`,
          year: Number(meta.tahun_penulisan),
          title: `Penyusunan ${n.name}`,
          subtitle: `${n.type}`,
          description: meta.deskripsi || `Karya monumental yang ditulis dalam rangkan melestarikan doktrin keagamaan di Nusantara.`,
          nodeId: n.id,
          nodeType: n.type,
          iconType: 'write'
        });
      }

      // Scan custom historiografi milestones inside node metadata
      if (meta.historiografi && Array.isArray(meta.historiografi)) {
        meta.historiografi.forEach((milestone: any, idx: number) => {
          if (milestone.tahun_numerik) {
            list.push({
              id: `custom-milestone-${n.id}-${idx}`,
              year: Number(milestone.tahun_numerik),
              title: milestone.judul_milestone || `Peristiwa ${n.name}`,
              subtitle: `${n.name} • ${milestone.lokasi_peristiwa || 'Lokasi Terdaftar'} (${milestone.tahun_bebas || milestone.tahun_numerik + ' M'})`,
              description: milestone.uraian || `Kaitannya dengan ketokohan atau lembaga ${n.name}.`,
              nodeId: n.id,
              nodeType: n.type,
              iconType: 'found' // maps to Calendar icon representing events
            });
          }
        });
      }
    });

    // Scan Edges for Chronological links
    edges.forEach((e) => {
      if (e.year_context) {
        const sourceNode = nodes.find((n) => n.id === e.source_node_id);
        const targetNode = nodes.find((n) => n.id === e.target_node_id);

        if (sourceNode && targetNode) {
          const edgeTypeText = e.edge_type.replace('_', ' ');
          list.push({
            id: `relation-${e.id}-${e.year_context}`,
            year: Number(e.year_context),
            title: `Hubungan Jaringan Sanad`,
            subtitle: `Transmisi Hubungan • ${sourceNode.name} ➔ ${targetNode.name}`,
            description: `Interaksi historis terdokumentasi di mana "${sourceNode.name}" berelasi "${edgeTypeText}" kepada "${targetNode.name}" pada tahun ${e.year_context} M.`,
            nodeId: sourceNode.id, // Focus on source
            nodeType: sourceNode.type,
            iconType: 'relation'
          });
        }
      }
    });

    // Sort strictly from oldest to newest
    return list.sort((a, b) => a.year - b.year);
  }, [nodes, edges]);

  const getIcon = (type: TimelineItem['iconType']) => {
    switch (type) {
      case 'birth':
        return <UserCheck className="w-5 h-5 text-emerald-600" />;
      case 'death':
        return <Flag className="w-5 h-5 text-rose-500" />;
      case 'found':
        return <Calendar className="w-5 h-5 text-teal-600" />;
      case 'write':
        return <BookOpen className="w-5 h-5 text-indigo-600" />;
      case 'relation':
        return <ArrowRightLeft className="w-5 h-5 text-amber-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Timeline Historiografi Nusantara</h1>
        <p className="text-slate-500 text-sm mt-2 max-w-xl mx-auto">
          Penjelajahan kronologis silsilah keilmuan, rihlah thalab al-ilm, pendirian pesantren, dan transmisi kitab ulama Nusantara.
        </p>
      </div>

      {timelineItems.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-8 text-center text-slate-400">
          <Calendar className="w-12 h-12 mx-auto text-slate-300 stroke-1 mb-3" />
          <p className="font-semibold text-slate-600">Belum ada linimasa kronologis</p>
          <p className="text-xs text-slate-400 mt-1">Lengkapi metadata entitas di dashboard agar terekam di linimasa ini.</p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline Center vertical track */}
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-slate-200" />

          <div className="space-y-12">
            {timelineItems.map((item, index) => {
              const isEven = index % 2 === 0;
              const color = colorsByType[item.nodeType as any] || '#64748b';

              return (
                <div
                  key={item.id}
                  className={`flex flex-col md:flex-row items-stretch timeline-node group ${
                    isEven ? 'md:flex-row-reverse' : ''
                  }`}
                  id={`timeline-item-${item.id}`}
                >
                  {/* Left / Right Card area */}
                  <div className="w-full md:w-1/2 flex justify-start md:justify-end px-4 md:px-8 pl-14 md:pl-8">
                    <button
                      onClick={() => onSelectAndNavigate(item.nodeId)}
                      className={`w-full bg-white hover:bg-slate-50/70 active:scale-[0.99] border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-slate-300 pointer-events-auto transition duration-250 cursor-pointer text-left relative group-hover:translate-x-1 md:group-hover:translate-x-0 ${
                        isEven ? 'md:text-left' : 'md:text-right'
                      }`}
                    >
                      {/* Interactive Visual indicator */}
                      <div 
                        className={`absolute top-0 bottom-0 w-1.5 rounded-l-2xl ${isEven ? 'left-0' : 'left-0 md:left-auto md:right-0 md:rounded-l-none md:rounded-r-2xl'}`} 
                        style={{ backgroundColor: color }}
                      />

                      {/* Year badge */}
                      <span className="font-mono text-xs font-black text-white bg-slate-800 px-3 py-1 rounded-full inline-block leading-none mb-3">
                        {item.year} M
                      </span>

                      {/* Event Title */}
                      <h4 className="text-sm font-bold text-slate-800 group-hover:text-emerald-700 transition leading-snug">
                        {item.title}
                      </h4>

                      {/* Sub-label */}
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-wider">
                        {item.subtitle}
                      </p>

                      {/* Description blurb */}
                      <p className="text-xs text-slate-600 mt-2.5 leading-relaxed truncate-2-lines italic">
                        {item.description}
                      </p>

                      {/* Redirect CTA handle */}
                      <div className={`mt-3.5 flex items-center gap-1 text-[10px] text-emerald-600 font-bold ${
                        isEven ? 'justify-start' : 'justify-start md:justify-end'
                      }`}>
                        <span>Lihat di Grafik</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
                      </div>
                    </button>
                  </div>

                  {/* Absolute node marker circle */}
                  <div className="absolute left-2.5 md:left-1/2 top-4 md:-translate-x-1/2 z-10 w-8 h-8 rounded-full bg-slate-50 border-2 border-slate-200 flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:border-slate-800 group-hover:bg-white transition duration-200">
                    {getIcon(item.iconType)}
                  </div>

                  {/* Empty Spacer column on opposite side */}
                  <div className="hidden md:block w-1/2" />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
