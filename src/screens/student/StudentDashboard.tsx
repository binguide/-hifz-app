import React, {useState, useCallback} from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {useAuthStore} from '../../store/authStore';
import {getCircleStudents, getMemorizationByStudent} from '../../db/database';
import {Circle, Memorization} from '../../types';
import {COLORS, GRADES} from '../../utils/constants';
import {EvaluationGrade} from '../../types';

export default function StudentDashboard({navigation}: any) {
  const user = useAuthStore(s => s.user);
  const [circles, setCircles] = useState<Circle[]>([]);
  const [stats, setStats] = useState({total: 0, excellent: 0});
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const records = await getMemorizationByStudent(user.id);
    setStats({
      total: records.length,
      excellent: records.filter(r => r.evaluation === 'excellent').length,
    });
  }, [user]);

  useFocusEffect(
    useCallback(() => { load(); }, [load]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View style={styles.welcome}>
        <Text style={styles.welcomeText}>مرحباً، {user?.name}</Text>
      </View>
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>جلسات التقييم</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, {color: COLORS.success}]}>{stats.excellent}</Text>
          <Text style={styles.statLabel}>ممتاز</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('MyProgress')}>
        <Text style={styles.menuIcon}>📊</Text>
        <Text style={styles.menuTitle}>تقدمي في الحفظ والمراجعة</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('MySchedule')}>
        <Text style={styles.menuIcon}>📅</Text>
        <Text style={styles.menuTitle}>جدول الحلقات</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.background},
  content: {padding: 16, gap: 16},
  welcome: {marginBottom: 4},
  welcomeText: {fontSize: 20, fontWeight: '700', color: COLORS.primary, textAlign: 'right'},
  statsRow: {flexDirection: 'row', gap: 12},
  statCard: {flex: 1, backgroundColor: COLORS.card, padding: 16, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border},
  statNumber: {fontSize: 28, fontWeight: '800', color: COLORS.primary},
  statLabel: {fontSize: 12, color: COLORS.textMuted, marginTop: 4},
  menuItem: {flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, padding: 16, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, gap: 12},
  menuIcon: {fontSize: 24},
  menuTitle: {fontSize: 15, fontWeight: '600', color: COLORS.text},
});
