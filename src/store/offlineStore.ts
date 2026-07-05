import {create} from 'zustand';
import NetInfo from '@react-native-community/netinfo';
import {supabase} from '../api/supabase';

interface OfflineState {
  isOnline: boolean;
  pendingSync: number;
  checkConnection: () => Promise<void>;
  sync: () => Promise<void>;
}

export const useOfflineStore = create<OfflineState>((set, get) => ({
  isOnline: true,
  pendingSync: 0,

  checkConnection: async () => {
    const state = await NetInfo.fetch();
    set({isOnline: state.isConnected ?? false});
  },

  sync: async () => {
    const {isOnline} = get();
    if (!isOnline) return;
    const {getDatabase} = await import('../db/database');
    const db = await getDatabase();
    const [results] = await db.executeSql(
      'SELECT * FROM sync_queue WHERE synced = 0 ORDER BY id',
    );
    if (results.rows.length === 0) {
      set({pendingSync: 0});
      return;
    }
    for (let i = 0; i < results.rows.length; i++) {
      const item = results.rows.item(i);
      try {
        const data = JSON.parse(item.data || '{}');
        if (item.operation === 'INSERT') {
          await supabase.from(item.table_name).insert(data);
        } else if (item.operation === 'UPDATE') {
          await supabase.from(item.table_name).update(data).eq('id', item.record_id);
        } else if (item.operation === 'DELETE') {
          await supabase.from(item.table_name).delete().eq('id', item.record_id);
        }
        await db.executeSql('UPDATE sync_queue SET synced = 1 WHERE id = ?', [item.id]);
      } catch (e) {
        // skip failed items
      }
    }
    set({pendingSync: 0});
  },
}));
