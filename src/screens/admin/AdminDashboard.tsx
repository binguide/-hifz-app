import React, {useState, useCallback} from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {useAuthStore} from '../../store/authStore';
import {getCircles, getUsersByRole} from '../../db/database';
import {COLORS} from '../../utils/constants';

export default function AdminDashboard({navigation}: any) {
  const user = useAuthStore(s => s.user);
  const [stats, setStats] = useState({teachers: 0, students: 0, circles: 0});
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = useCallback(async () => {
    const teachers = (await getUsersByRole('teacher')).length;
    const students = (await getUsersByRole('student')).length;
    const circles = (await getCircles()).length;
    setStats({teachers, students, circles});
  }, []);

  useFocusEffect(
    useCallback(() => { loadStats(); }, [loadStats]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  const menuItems = [
    {title: 'إدارة الحلقات', icon: '📚', screen: 'ManageCircles'},
    {title: 'إدارة المستخدمين', icon: '👥', screen: 'ManageUsers'},
    {title: 'التقارير', icon: '📊', screen: 'Reports'},
  ];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View style={styles.welcome}>
        <Text style={styles.welcomeText}>مرحباً، {user?.name}</Text>
      </View>
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.teachers}</Text>
          <Text style={styles.statLabel}>المعلمون</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.students}</Text>
          <Text style={styles.statLabel}>الطلاب</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.circles}</Text>
          <Text style={styles.statLabel}>الحلقات</Text>
        </View>
      </View>
      <View style={styles.menu}>
        {menuItems.map(item => (
          <TouchableOpacity
            key={item.screen}
            style={styles.menuItem}
            onPress={() => navigation.navigate(item.screen)}>
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text style={styles.menuTitle}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.background},
  welcome: {padding: 20, backgroundColor: COLORS.primary, marginBottom: 16},
  welcomeText: {color: COLORS.white, fontSize: 20, fontWeight: '700', textAlign: 'right'},
  statsRow: {flexDirection: 'row', padding: 16, gap: 12},
  statCard: {
    flex: 1, backgroundColor: COLORS.card, borderRadius: 8, padding: 16,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  statNumber: {fontSize: 28, fontWeight: '800', color: COLORS.primary},
  statLabel: {fontSize: 12, color: COLORS.textMuted, marginTop: 4},
  menu: {padding: 16, gap: 12},
  menuItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card,
    padding: 16, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, gap: 12,
  },
  menuIcon: {fontSize: 24},
  menuTitle: {fontSize: 16, fontWeight: '600', color: COLORS.text},
});
