import React, {useState, useCallback} from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {useAuthStore} from '../../store/authStore';
import {getCirclesByTeacher, getCircleStudents} from '../../db/database';
import {Circle} from '../../types';
import {COLORS} from '../../utils/constants';

export default function TeacherDashboard({navigation}: any) {
  const user = useAuthStore(s => s.user);
  const [circles, setCircles] = useState<(Circle & {studentCount: number})[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const data = await getCirclesByTeacher(user.id);
    const withCounts = await Promise.all(
      data.map(async c => {
        const students = await getCircleStudents(c.id);
        return {...c, studentCount: students.length};
      }),
    );
    setCircles(withCounts);
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
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View style={styles.welcome}>
        <Text style={styles.welcomeText}>مرحباً، {user?.name}</Text>
      </View>
      {circles.length === 0 ? (
        <Text style={styles.empty}>لا توجد حلقات مسندة إليك</Text>
      ) : (
        circles.map(circle => (
          <TouchableOpacity
            key={circle.id}
            style={styles.card}
            onPress={() => navigation.navigate('CircleDetail', {circleId: circle.id})}>
            <Text style={styles.cardTitle}>{circle.name}</Text>
            <Text style={styles.cardDetail}>عدد الطلاب: {circle.studentCount}</Text>
            <View style={styles.cardActions}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => navigation.navigate('Attendance', {circleId: circle.id, circleName: circle.name})}>
                <Text style={styles.actionText}>الحضور</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => navigation.navigate('Memorization', {circleId: circle.id, circleName: circle.name})}>
                <Text style={styles.actionText}>المتابعة</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))
      )}
      <TouchableOpacity
        style={styles.scheduleBtn}
        onPress={() => navigation.navigate('TeacherSchedule')}>
        <Text style={styles.scheduleBtnText}>📅 عرض الجدول</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.background, padding: 16},
  welcome: {marginBottom: 16},
  welcomeText: {fontSize: 20, fontWeight: '700', color: COLORS.primary, textAlign: 'right'},
  empty: {textAlign: 'center', color: COLORS.textMuted, marginTop: 40},
  card: {
    backgroundColor: COLORS.card, borderRadius: 8, padding: 16,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: 12,
  },
  cardTitle: {fontSize: 16, fontWeight: '700', color: COLORS.textHeading, textAlign: 'right'},
  cardDetail: {fontSize: 13, color: COLORS.textMuted, textAlign: 'right', marginTop: 4},
  cardActions: {flexDirection: 'row', gap: 8, marginTop: 12},
  actionBtn: {padding: 8, borderRadius: 6, borderWidth: 1, borderColor: COLORS.border},
  actionText: {fontSize: 13, color: COLORS.text},
  scheduleBtn: {
    backgroundColor: COLORS.card, padding: 14, borderRadius: 8,
    borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', marginTop: 8,
  },
  scheduleBtnText: {fontSize: 15, color: COLORS.primary, fontWeight: '600'},
});
