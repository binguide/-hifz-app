import React, {useState, useCallback} from 'react';
import {View, Text, StyleSheet, RefreshControl, ScrollView} from 'react-native';
import {useAuthStore} from '../../store/authStore';
import {getCirclesByTeacher, getCircleStudents} from '../../db/database';
import {COLORS} from '../../utils/constants';

const DAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

export default function TeacherSchedule() {
  const user = useAuthStore(s => s.user);
  const [schedule, setSchedule] = useState<Record<string, any[]>>({});
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const circles = await getCirclesByTeacher(user.id);
    const sched: Record<string, any[]> = {};
    DAYS.forEach(d => { sched[d] = []; });
    for (const c of circles) {
      try {
        const s = JSON.parse(c.schedule);
        if (s.days) {
          for (const day of s.days) {
            if (sched[day]) {
              const count = (await getCircleStudents(c.id)).length;
              sched[day].push({name: c.name, time: s.time || '—', count});
            }
          }
        }
      } catch {}
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
            <Text style={styles.emptyDay}>—</Text>
          ) : (
            schedule[day]?.map((item, i) => (
              <View key={i} style={styles.item}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDetail}>{item.time} | {item.count} طالب</Text>
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
  dayTitle: {fontSize: 14, fontWeight: '700', color: COLORS.primary, marginBottom: 8, textAlign: 'right'},
  emptyDay: {fontSize: 13, color: COLORS.textMuted, textAlign: 'center'},
  item: {marginBottom: 6},
  itemName: {fontSize: 14, fontWeight: '600', color: COLORS.text, textAlign: 'right'},
  itemDetail: {fontSize: 12, color: COLORS.textMuted, textAlign: 'right'},
});
