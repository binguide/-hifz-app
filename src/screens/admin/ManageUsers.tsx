import React, {useState, useCallback} from 'react';
import {
  View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {getUsersByRole} from '../../db/database';
import {User, UserRole} from '../../types';
import {COLORS} from '../../utils/constants';

const TABS: {key: UserRole; label: string}[] = [
  {key: 'teacher', label: 'معلمون'},
  {key: 'student', label: 'طلاب'},
  {key: 'parent', label: 'أولياء أمور'},
];

export default function ManageUsers() {
  const [tab, setTab] = useState<UserRole>('teacher');
  const [users, setUsers] = useState<User[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadUsers = useCallback(async () => {
    const data = await getUsersByRole(tab);
    setUsers(data);
  }, [tab]);

  useFocusEffect(
    useCallback(() => { loadUsers(); }, [loadUsers]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  const renderUser = ({item}: {item: User}) => (
    <View style={styles.card}>
      <Text style={styles.userName}>{item.name}</Text>
      <Text style={styles.userPhone}>{item.phone}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabRow}>
        {TABS.map(t => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, tab === t.key && styles.tabActive]}
            onPress={() => setTab(t.key)}>
            <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={users}
        keyExtractor={item => item.id}
        renderItem={renderUser}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.empty}>لا يوجد مستخدمون</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.background},
  tabRow: {flexDirection: 'row', margin: 16, gap: 8},
  tab: {flex: 1, padding: 10, borderRadius: 8, alignItems: 'center', backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border},
  tabActive: {borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight},
  tabText: {color: COLORS.textMuted, fontSize: 13, fontWeight: '600'},
  tabTextActive: {color: COLORS.primary},
  list: {padding: 16, gap: 8},
  card: {backgroundColor: COLORS.card, padding: 14, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border},
  userName: {fontSize: 15, fontWeight: '600', color: COLORS.textHeading, textAlign: 'right'},
  userPhone: {fontSize: 13, color: COLORS.textMuted, textAlign: 'right', marginTop: 4},
  empty: {textAlign: 'center', color: COLORS.textMuted, marginTop: 40},
});
