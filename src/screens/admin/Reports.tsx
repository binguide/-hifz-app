import React, {useState, useCallback} from 'react';
import {View, Text, StyleSheet, ScrollView, RefreshControl} from 'react-native';
import {getCircles, getUsersByRole, getCircleStudents} from '../../db/database';
import {COLORS} from '../../utils/constants';

export default function Reports() {
  const [data, setData] = useState<any[]>([]);
  const [summary, setSummary] = useState({circles: 0, teachers: 0, students: 0});
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const circles = await getCircles();
    const teachers = await getUsersByRole('teacher');
    const students = await getUsersByRole('student');
    setSummary({circles: circles.length, teachers: teachers.length, students: students.length});

    const circleData = await Promise.all(
      circles.map(async c => {
        const teacher = teachers.find(t => t.id === c.teacher_id);
        const members = await getCircleStudents(c.id);
        return {name: c.name, teacher: teacher?.name || '—', count: members.length};
      }),
    );
    setData(circleData);
  }, []);

  React.useEffect(() => { load(); }, []);

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
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}><Text style={styles.sumNum}>{summary.circles}</Text><Text style={styles.sumLabel}>الحلقات</Text></View>
        <View style={styles.summaryCard}><Text style={styles.sumNum}>{summary.teachers}</Text><Text style={styles.sumLabel}>المعلمون</Text></View>
        <View style={styles.summaryCard}><Text style={styles.sumNum}>{summary.students}</Text><Text style={styles.sumLabel}>الطلاب</Text></View>
      </View>
      {data.map((c, i) => (
        <View key={i} style={styles.row}>
          <Text style={styles.rowName}>{c.name}</Text>
          <Text style={styles.rowDetail}>المعلم: {c.teacher}</Text>
          <Text style={styles.rowDetail}>الطلاب: {c.count}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.background},
  content: {padding: 16, gap: 16},
  summaryRow: {flexDirection: 'row', gap: 12},
  summaryCard: {flex: 1, backgroundColor: COLORS.card, padding: 16, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border},
  sumNum: {fontSize: 24, fontWeight: '800', color: COLORS.primary},
  sumLabel: {fontSize: 12, color: COLORS.textMuted, marginTop: 4},
  row: {backgroundColor: COLORS.card, padding: 14, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border},
  rowName: {fontSize: 15, fontWeight: '700', color: COLORS.textHeading, textAlign: 'right'},
  rowDetail: {fontSize: 13, color: COLORS.textMuted, textAlign: 'right', marginTop: 4},
});
