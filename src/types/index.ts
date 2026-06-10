export type NodeType =
  | 'Tokoh / Kiai'
  | 'Kitab / Manuskrip'
  | 'Ijazah'
  | 'Pesantren'
  | 'Alumni'
  | 'Tradisi Pembelajaran';

export type EdgeType =
  | 'belajar_kepada'
  | 'mengajar'
  | 'menyalin'
  | 'memiliki'
  | 'memberi_ijazah'
  | 'baiat'
  | 'alumni'
  | 'tradisi_bandongan'
  | 'tradisi_sorogan';

export interface NodeMetadata {
  tahun_lahir?: number;
  tahun_wafat?: number;
  tahun_berdiri?: number;
  pendiri?: string;
  lokasi?: string;
  tahun_ke_mekkah?: number;
  catatan_perjalanan?: string;
  biografi?: string;
  penulis?: string;
  tahun_penulisan?: number;
  bahasa?: string;
  deskripsi?: string;
  [key: string]: any; // Allow other dynamic fields
}

export interface GraphNode {
  id: string;
  name: string;
  type: NodeType;
  metadata: NodeMetadata;
  created_at?: string;
  source_file?: string;
  
  // D3 forces properties
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface GraphEdge {
  id: string;
  source_node_id: string;
  target_node_id: string;
  edge_type: EdgeType;
  year_context?: number;
  created_at?: string;
  source_file?: string;
  
  // D3 graph link properties (can be string, number or actual Node object)
  source?: string | GraphNode;
  target?: string | GraphNode;
}
