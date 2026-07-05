import React, {useState, useCallback} from 'react';
import {View, Text, StyleSheet, ScrollView, RefreshControl} from 'react-native';
import {useAuthStore} from '../../store/authStore';
import {getCircles, getCircleStudents} from '../../db/database';
import {COLORS} from '../../utils/constants';

const DAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

export default function MySchedule() {
  const user = useAuthStore(s => s.user);
  const [schedule, setSchedule] = useState<Record<string, any[]>>({});
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const allCircles = await getCircles();
    const sched: Record<string, any[]> = {};
    DAYS.forEach(d => { sched[d] = []; });
    for (const c of allCircles) {
      const students = await getCircleStudents(c.id);
      if (students.some(s => s.id === user.id)) {
        try {
          const s = JSON.parse(c.schedule);
          if (s.days) {
            s.days.forEach((day: string) => {
              if (sched[day]) {
                sched[day].push({name: c.name, time: s.time || '—'});
              }
            });
          }
        } catch {}
      }
    }
    setSchedule(sched);
  }, [user]);

  React.useEffect(() => { load(); }, [load]);

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
      {DAYS.map(day => (
        <View key={day} style={styles.dayCard}>
          <Text style={styles.dayTitle}>{day}</Text>
          {schedule[day]?.length === 0 ? (
            <Text style={styles.empty}>—</Text>
          ) : (
            schedule[day]?.map((item, i) => (
              <View key={i} style={styles.item}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemTime}>{item.time}</Text>
              </View>
            ))
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.background},
  content: {padding: 16, gap: 8},
  dayCard: {backgroundColor: COLORS.card, borderRadius: 8, padding: 14, borderWidth: 1, borderColor: COLORS.border},
  dayTitle: {fontSize: 14, fontWeight: '700', color: COLORS.primary, textAlign: 'right', marginBottom: 8},
  empty: {fontSize: 13, color: COLORS.textMuted, textAlign: 'center'},
  item: {marginBottom: 6},
  itemName: {fontSize: 14, fontWeight: '600', color: COLORS.text, textAlign: 'right'},
  itemTime: {fontSize: 12, color: COLORS.textMuted, textAlign: 'right'},
});
