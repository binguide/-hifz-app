import React, {useState, useCallback} from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList, RefreshControl,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {getCircle, getCircleStudents} from '../../db/database';
import {Circle, User} from '../../types';
import {COLORS} from '../../utils/constants';

export default function CircleDetail({route, navigation}: any) {
  const {circleId} = route.params;
  const [circle, setCircle] = useState<Circle | null>(null);
  const [students, setStudents] = useState<User[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const c = await getCircle(circleId);
    setCircle(c);
    const s = await getCircleStudents(circleId);
    setStudents(s);
  }, [circleId]);

  useFocusEffect(
    useCallback(() => { load(); }, [load]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const renderStudent = ({item}: {item: User}) => (
    <View style={styles.studentRow}>
      <Text style={styles.studentName}>{item.name}</Text>
      <TouchableOpacity
        style={styles.evalBtn}
        onPress={() => navigation.navigate('Evaluation', {studentId: item.id, studentName: item.name, circleId})}>
        <Text style={styles.evalBtnText}>تقييم</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {circle && (
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{circle.name}</Text>
          <Text style={styles.headerSub}>الطلاب المسجلون: {students.length}</Text>
        </View>
      )}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => navigation.navigate('Attendance', {circleId, circleName: circle?.name || ''})}>
          <Text style={styles.actionBtnText}>📋 تسجيل الحضور</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => navigation.navigate('Memorization', {circleId, circleName: circle?.name || ''})}>
          <Text style={styles.actionBtnText}>📖 متابعة الحفظ</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.sectionTitle}>قائمة الطلاب</Text>
      <FlatList
        data={students}
        keyExtractor={item => item.id}
        renderItem={renderStudent}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.empty}>لا يوجد طلاب في هذه الحلقة</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.background},
  header: {padding: 16, backgroundColor: COLORS.primary},
  headerTitle: {fontSize: 18, fontWeight: '700', color: COLORS.white, textAlign: 'right'},
  headerSub: {fontSize: 13, color: COLORS.white, opacity: 0.8, textAlign: 'right', marginTop: 4},
  actionRow: {flexDirection: 'row', gap: 12, padding: 16},
  actionBtn: {flex: 1, padding: 14, borderRadius: 8, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center'},
  actionBtnText: {fontSize: 14, fontWeight: '600', color: COLORS.text},
  sectionTitle: {fontSize: 15, fontWeight: '700', color: COLORS.textHeading, padding: 16, paddingBottom: 8, textAlign: 'right'},
  list: {padding: 16, paddingTop: 0, gap: 8},
  studentRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.card, padding: 14, borderRadius: 8,
    borderWidth: 1, borderColor: COLORS.border,
  },
  studentName: {fontSize: 15, fontWeight: '600', color: COLORS.textHeading},
  evalBtn: {padding: 8, borderRadius: 6, borderWidth: 1, borderColor: COLORS.primary},
  evalBtnText: {fontSize: 12, color: COLORS.primary, fontWeight: '600'},
  empty: {textAlign: 'center', color: COLORS.textMuted, marginTop: 40},
});
