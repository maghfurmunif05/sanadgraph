import React from 'react';
import { NodeType } from '../types';
import { Database, Info, RefreshCw, Layers, CheckSquare, Square } from 'lucide-react';

export const colorsByType: Record<NodeType, string> = {
  'Tokoh / Kiai': '#10b981',          // Emerald
  'Kitab / Manuskrip': '#6366f1',     // Indigo
  'Ijazah': '#eab308',               // Kuning
  'Pesantren': '#14b8a6',            // Teal
  'Alumni': '#0ea5e9',               // Sky Blue
  'Tradisi Pembelajaran': '#8b5cf6'  // Violet
};

interface SidebarLegendProps {
  filterTypes: Set<NodeType>;
  onToggleType: (type: NodeType) => void;
  isSupabase: boolean;
  onResetData: () => void;
}

export default function SidebarLegend({
  filterTypes,
  onToggleType,
  isSupabase,
  onResetData,
}: SidebarLegendProps) {
  const allTypes: NodeType[] = [
    'Tokoh / Kiai',
    'Kitab / Manuskrip',
    'Ijazah',
    'Pesantren',
    'Alumni',
    'Tradisi Pembelajaran',
  ];

  const typeTranslations: Record<NodeType, string> = {
    'Tokoh / Kiai': 'Tokoh / Kiai',
    'Kitab / Manuskrip': 'Kitab / Manuskrip',
    'Ijazah': 'Ijazah Sanad',
    'Pesantren': 'Pondok Pesantren',
    'Alumni': 'Alumni Penting',
    'Tradisi Pembelajaran': 'Tradisi Belajar'
  };

  const handleSelectAll = () => {
    allTypes.forEach((t) => {
      if (!filterTypes.has(t)) onToggleType(t);
    });
  };

  const handleDeselectAll = () => {
    allTypes.forEach((t) => {
      if (filterTypes.has(t)) onToggleType(t);
    });
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 flex-shrink-0 p-5 overflow-hidden shadow-sm z-10 w-full lg:w-72 select-none">
      <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Legenda Entitas</h2>
      
      {/* Selection Utility Headers */}
      <div className="flex justify-between items-center pb-2 mb-3 border-b border-slate-100 text-[10px] font-bold text-slate-400 tracking-wider">
        <span>FILTER AKTIF</span>
        <div className="flex gap-2 font-semibold">
          <button onClick={handleSelectAll} className="hover:text-emerald-600 transition" id="filter-all">Semua</button>
          <span>•</span>
          <button onClick={handleDeselectAll} className="hover:text-emerald-600 transition" id="filter-none">Bersihkan</button>
        </div>
      </div>

      {/* Filter list */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
        {allTypes.map((type) => {
          const isChecked = filterTypes.has(type);
          const color = colorsByType[type];

          return (
            <button
              key={type}
              onClick={() => onToggleType(type)}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl border w-full transition text-left cursor-pointer group ${
                isChecked
                  ? 'bg-slate-50 border-slate-200'
                  : 'bg-transparent border-transparent hover:bg-slate-50/75'
              }`}
              id={`filter-item-${type.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {/* Custom Round Checkbox */}
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center border transition flex-shrink-0 ${
                  isChecked
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : 'border-slate-300 text-transparent group-hover:border-slate-400'
                }`}
              >
                <span className="text-[9px] font-bold">✓</span>
              </div>

              {/* Color Circle indicator matching the mockup */}
              <span 
                className="w-3 h-3 rounded-full flex-shrink-0 border border-slate-200/50 shadow-xs" 
                style={{ 
                  backgroundColor: color
                }}
              />

              {/* Label */}
              <span className={`text-xs font-medium truncate ${isChecked ? 'text-slate-800 font-semibold' : 'text-slate-500'}`}>
                {typeTranslations[type]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Custom Mockup Interactive Scroll / navigation instructions */}
      <div className="my-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
        <p className="text-[11px] leading-relaxed text-slate-500">
          Gunakan <strong>Scroll</strong> untuk zoom, <strong>Drag</strong> untuk navigasi peta sanad.
        </p>
      </div>

      {/* Connection Actions */}
      <div className="border-t border-slate-100 pt-4 mt-auto">
        <div className="flex items-center justify-between gap-1.5 mb-2">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Database</span>
          <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full ${isSupabase ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-600'}`}>
            {isSupabase ? 'PostgreSQL' : 'Local Preview'}
          </span>
        </div>
        <button
          onClick={() => {
            if (window.confirm('Apakah Anda yakin ingin mengatur ulang database ke data bibit (seed) asli Nusantara? Seluruh perubahan baru akan hilang.')) {
              onResetData();
            }
          }}
          className="flex items-center justify-center gap-1.5 w-full py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl transition duration-150 cursor-pointer text-[11px] font-bold"
          id="btn-reset-data"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Reset ke Data Awal</span>
        </button>
      </div>
    </div>
  );
}
