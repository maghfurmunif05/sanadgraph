import { createClient } from '@supabase/supabase-js';
import { GraphNode, GraphEdge, NodeType, EdgeType } from '../types';
import { initialNodes, initialEdges } from '../data/seedData';

// Attempt to read Supabase environment variables
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const LOCAL_NODES_KEY = 'jaringan_sanad_nodes';
const LOCAL_EDGES_KEY = 'jaringan_sanad_edges';

// Initial check / load of LocalStorage to guarantee seed data is present in LocalStorage fallback
const initializeLocalStorage = () => {
  if (!localStorage.getItem(LOCAL_NODES_KEY)) {
    localStorage.setItem(LOCAL_NODES_KEY, JSON.stringify(initialNodes));
  }
  if (!localStorage.getItem(LOCAL_EDGES_KEY)) {
    localStorage.setItem(LOCAL_EDGES_KEY, JSON.stringify(initialEdges));
  }
};

initializeLocalStorage();

export const database = {
  isSupabase: (): boolean => {
    return isSupabaseConfigured;
  },

  resetToSeeds: async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        // Clear remote
        await supabase.from('edges').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('nodes').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        // Insert nodes first
        const formattedNodes = initialNodes.map(n => ({
          id: n.id,
          name: n.name,
          type: n.type,
          metadata: n.metadata
        }));
        const { error: nodeErr } = await supabase.from('nodes').insert(formattedNodes);
        if (nodeErr) throw nodeErr;

        // Insert edges
        const formattedEdges = initialEdges.map(e => ({
          id: e.id,
          source_node_id: e.source_node_id,
          target_node_id: e.target_node_id,
          edge_type: e.edge_type,
          year_context: e.year_context
        }));
        const { error: edgeErr } = await supabase.from('edges').insert(formattedEdges);
        if (edgeErr) throw edgeErr;

        console.log('Supabase database reset to seeds successfully.');
      } catch (err) {
        console.error('Failed to reset Supabase, resetting local storage instead:', err);
      }
    }

    // Always reset local storage as well for synchronized state
    localStorage.setItem(LOCAL_NODES_KEY, JSON.stringify(initialNodes));
    localStorage.setItem(LOCAL_EDGES_KEY, JSON.stringify(initialEdges));
  },

  getNodes: async (): Promise<GraphNode[]> => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('nodes')
          .select('*')
          .order('name', { ascending: true });

        if (error) throw error;
        
        // Auto-seed if database is empty but initialized
        if (data && data.length === 0) {
          console.log('Supabase nodes are empty. Seeding initial network entries...');
          // Seed nodes
          const formattedNodes = initialNodes.map(n => ({
            id: n.id,
            name: n.name,
            type: n.type,
            metadata: n.metadata
          }));
          const { error: nodeErr } = await supabase.from('nodes').insert(formattedNodes);
          if (!nodeErr) {
            // Seed edges
            const formattedEdges = initialEdges.map(e => ({
              id: e.id,
              source_node_id: e.source_node_id,
              target_node_id: e.target_node_id,
              edge_type: e.edge_type,
              year_context: e.year_context
            }));
            await supabase.from('edges').insert(formattedEdges);

            // Refetch nodes
            const { data: refetched } = await supabase
              .from('nodes')
              .select('*')
              .order('name', { ascending: true });
            if (refetched && refetched.length > 0) {
              return refetched as GraphNode[];
            }
          }
        }

        if (data) {
          return data as GraphNode[];
        }
      } catch (err) {
        console.error('Supabase getNodes failed, relying on localStorage:', err);
      }
    }

    // Local Storage Fallback
    const local = localStorage.getItem(LOCAL_NODES_KEY);
    return local ? JSON.parse(local) : initialNodes;
  },

  getEdges: async (): Promise<GraphEdge[]> => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('edges')
          .select('*');

        if (error) throw error;
        return data as GraphEdge[];
      } catch (err) {
        console.error('Supabase getEdges failed, relying on localStorage:', err);
      }
    }

    // Local Storage Fallback
    const local = localStorage.getItem(LOCAL_EDGES_KEY);
    return local ? JSON.parse(local) : initialEdges;
  },

  addNode: async (node: { name: string; type: NodeType; metadata: any }): Promise<GraphNode> => {
    const id = 'node-' + Math.random().toString(36).substr(2, 9);
    const newNode: GraphNode = {
      id,
      name: node.name,
      type: node.type,
      metadata: node.metadata,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('nodes')
          .insert({
            name: newNode.name,
            type: newNode.type,
            metadata: newNode.metadata
          })
          .select()
          .single();

        if (error) throw error;
        if (data) {
          // If Supabase succeeded, return the database created object with generated UUID
          // First, sync local storage for high cohesion
          const localNodes = await database.getNodesFromLocal();
          localNodes.push(data as GraphNode);
          localStorage.setItem(LOCAL_NODES_KEY, JSON.stringify(localNodes));
          return data as GraphNode;
        }
      } catch (err) {
        console.error('Supabase addNode failed, doing local insert:', err);
      }
    }

    // Local insert
    const nodes = await database.getNodesFromLocal();
    nodes.push(newNode);
    localStorage.setItem(LOCAL_NODES_KEY, JSON.stringify(nodes));
    return newNode;
  },

  addEdge: async (edge: { source_node_id: string; target_node_id: string; edge_type: EdgeType; year_context?: number }): Promise<GraphEdge> => {
    const id = 'edge-' + Math.random().toString(36).substr(2, 9);
    const newEdge: GraphEdge = {
      id,
      source_node_id: edge.source_node_id,
      target_node_id: edge.target_node_id,
      edge_type: edge.edge_type,
      year_context: edge.year_context,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('edges')
          .insert({
            source_node_id: edge.source_node_id,
            target_node_id: edge.target_node_id,
            edge_type: edge.edge_type,
            year_context: edge.year_context
          })
          .select()
          .single();

        if (error) throw error;
        if (data) {
          // Sync local
          const localEdges = await database.getEdgesFromLocal();
          localEdges.push(data as GraphEdge);
          localStorage.setItem(LOCAL_EDGES_KEY, JSON.stringify(localEdges));
          return data as GraphEdge;
        }
      } catch (err) {
        console.error('Supabase addEdge failed, doing local insert:', err);
      }
    }

    // Local insert
    const edges = await database.getEdgesFromLocal();
    edges.push(newEdge);
    localStorage.setItem(LOCAL_EDGES_KEY, JSON.stringify(edges));
    return newEdge;
  },

  updateNode: async (id: string, updates: Partial<GraphNode>): Promise<GraphNode> => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('nodes')
          .update({
            name: updates.name,
            type: updates.type,
            metadata: updates.metadata
          })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        if (data) {
          // Sync local
          const localNodes = await database.getNodesFromLocal();
          const idx = localNodes.findIndex(n => n.id === id);
          if (idx !== -1) {
            localNodes[idx] = { ...localNodes[idx], ...updates, id };
            localStorage.setItem(LOCAL_NODES_KEY, JSON.stringify(localNodes));
          }
          return data as GraphNode;
        }
      } catch (err) {
        console.error('Supabase updateNode failed, doing local update:', err);
      }
    }

    // Local update
    const nodes = await database.getNodesFromLocal();
    const index = nodes.findIndex(n => n.id === id);
    if (index === -1) throw new Error(`Node with ID ${id} not found.`);
    
    nodes[index] = { ...nodes[index], ...updates };
    localStorage.setItem(LOCAL_NODES_KEY, JSON.stringify(nodes));
    return nodes[index];
  },

  deleteNode: async (id: string): Promise<boolean> => {
    if (isSupabaseConfigured && supabase) {
      try {
        // Delete all relating edges first in Supabase to maintain referral integrity
        await supabase.from('edges').delete().or(`source_node_id.eq.${id},target_node_id.eq.${id}`);
        const { error } = await supabase.from('nodes').delete().eq('id', id);
        if (error) throw error;

        // Sync Local
        const localNodes = (await database.getNodesFromLocal()).filter(n => n.id !== id);
        const localEdges = (await database.getEdgesFromLocal()).filter(e => e.source_node_id !== id && e.target_node_id !== id);
        localStorage.setItem(LOCAL_NODES_KEY, JSON.stringify(localNodes));
        localStorage.setItem(LOCAL_EDGES_KEY, JSON.stringify(localEdges));
        return true;
      } catch (err) {
        console.error('Supabase deleteNode failed, doing local delete:', err);
      }
    }

    // Local delete
    const nodes = (await database.getNodesFromLocal()).filter(n => n.id !== id);
    const edges = (await database.getEdgesFromLocal()).filter(e => e.source_node_id !== id && e.target_node_id !== id);
    localStorage.setItem(LOCAL_NODES_KEY, JSON.stringify(nodes));
    localStorage.setItem(LOCAL_EDGES_KEY, JSON.stringify(edges));
    return true;
  },

  deleteEdge: async (id: string): Promise<boolean> => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('edges').delete().eq('id', id);
        if (error) throw error;

        // Sync local
        const localEdges = (await database.getEdgesFromLocal()).filter(e => e.id !== id);
        localStorage.setItem(LOCAL_EDGES_KEY, JSON.stringify(localEdges));
        return true;
      } catch (err) {
        console.error('Supabase deleteEdge failed, doing local delete:', err);
      }
    }

    // Local delete
    const edges = (await database.getEdgesFromLocal()).filter(e => e.id !== id);
    localStorage.setItem(LOCAL_EDGES_KEY, JSON.stringify(edges));
    return true;
  },

  // Helper getters to bypass async Supabase during fallback queries
  getNodesFromLocal: async (): Promise<GraphNode[]> => {
    const local = localStorage.getItem(LOCAL_NODES_KEY);
    return local ? JSON.parse(local) : initialNodes;
  },

  getEdgesFromLocal: async (): Promise<GraphEdge[]> => {
    const local = localStorage.getItem(LOCAL_EDGES_KEY);
    return local ? JSON.parse(local) : initialEdges;
  }
};
