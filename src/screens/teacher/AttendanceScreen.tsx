import React, {useState, useCallback} from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList, RefreshControl,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {getCircleStudents, getAttendanceByDate, addAttendance} from '../../db/database';
import {User, Attendance, AttendanceStatus} from '../../types';
import {COLORS} from '../../utils/constants';
import {generateId, todayString} from '../../utils/helpers';

const STATUSES: {key: AttendanceStatus; label: string}[] = [
  {key: 'present', label: 'حاضر'},
  {key: 'absent', label: 'غائب'},
  {key: 'excused', label: 'معذر'},
];

export default function AttendanceScreen({route}: any) {
  const {circleId} = route.params;
  const [students, setStudents] = useState<User[]>([]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [date, setDate] = useState(todayString());
  const [refreshing, setRefreshing] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    const s = await getCircleStudents(circleId);
    setStudents(s);
    const existing = await getAttendanceByDate(circleId, date);
    const map: Record<string, AttendanceStatus> = {};
    existing.forEach(a => { map[a.student_id] = a.status; });
    setAttendance(map);
    setSaved(false);
  }, [circleId, date]);

  useFocusEffect(
    useCallback(() => { load(); }, [load]),
  );

  const setStatus = (studentId: string, status: AttendanceStatus) => {
    setAttendance(prev => ({...prev, [studentId]: status}));
    setSaved(false);
  };

  const setAll = (status: AttendanceStatus) => {
    const map: Record<string, AttendanceStatus> = {};
    students.forEach(s => { map[s.id] = status; });
    setAttendance(map);
    setSaved(false);
  };

  const save = async () => {
    for (const student of students) {
      const status = attendance[student.id];
      if (status) {
        await addAttendance({
          id: generateId(),
          circle_id: circleId,
          student_id: student.id,
          date,
          status,
        });
      }
    }
    setSaved(true);
  };

  const statusBtnStyle = (key: AttendanceStatus, active: boolean) => ({
    paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6,
    borderWidth: 1, borderColor: active ? (key === 'present' ? COLORS.success : key === 'absent' ? COLORS.danger : COLORS.warning) : COLORS.border,
    backgroundColor: active ? (key === 'present' ? COLORS.success : key === 'absent' ? COLORS.danger : COLORS.warning) : COLORS.card,
  });

  const statusTextStyle = (active: boolean) => ({
    fontSize: 12, color: active ? COLORS.white : COLORS.textMuted, fontWeight: active ? '700' as const : '400' as const,
  });

  const renderStudent = ({item}: {item: User}) => {
    const status = attendance[item.id];
    return (
      <View style={styles.row}>
        <Text style={styles.name}>{item.name}</Text>
        <View style={styles.statusRow}>
          {STATUSES.map(s => (
            <TouchableOpacity
              key={s.key}
              style={statusBtnStyle(s.key, status === s.key)}
              onPress={() => setStatus(item.id, s.key)}>
              <Text style={statusTextStyle(status === s.key)}>
                {s.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.quickRow}>
        <TouchableOpacity style={styles.quickBtn} onPress={() => setAll('present')}>
          <Text style={styles.quickBtnText}>كلهم حاضر</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickBtn} onPress={() => setAll('absent')}>
          <Text style={styles.quickBtnText}>كلهم غائب</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={students}
        keyExtractor={item => item.id}
        renderItem={renderStudent}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}
        ListEmptyComponent={<Text style={styles.empty}>لا يوجد طلاب</Text>}
      />
      <TouchableOpacity style={styles.saveBtn} onPress={save}>
        <Text style={styles.saveBtnText}>{saved ? '✓ تم الحفظ' : 'حفظ الحضور'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.background},
  quickRow: {flexDirection: 'row', gap: 12, padding: 16, paddingBottom: 0},
  quickBtn: {flex: 1, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', backgroundColor: COLORS.card},
  quickBtnText: {fontSize: 13, fontWeight: '600', color: COLORS.text},
  list: {padding: 16, gap: 8},
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.card, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border,
  },
  name: {fontSize: 14, fontWeight: '600', color: COLORS.textHeading, flex: 1},
  statusRow: {flexDirection: 'row', gap: 4},
  statusText: {fontSize: 12, color: COLORS.textMuted},
  saveBtn: {margin: 16, padding: 14, borderRadius: 8, backgroundColor: COLORS.primary, alignItems: 'center'},
  saveBtnText: {color: COLORS.white, fontSize: 16, fontWeight: '700'},
  empty: {textAlign: 'center', color: COLORS.textMuted, marginTop: 40},
});
