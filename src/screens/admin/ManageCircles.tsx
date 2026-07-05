import React, {useState, useCallback} from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  RefreshControl, Alert, FlatList,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {getCircles, deleteCircle, getCircleStudents, getUser} from '../../db/database';
import {Circle} from '../../types';
import {COLORS} from '../../utils/constants';

export default function ManageCircles({navigation}: any) {
  const [circles, setCircles] = useState<Circle[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadCircles = useCallback(async () => {
    const data = await getCircles();
    const withTeachers = await Promise.all(
      data.map(async c => {
        const teacher = await getUser(c.teacher_id);
        const students = await getCircleStudents(c.id);
        return {...c, teacherName: teacher?.name || 'غير معروف', studentCount: students.length};
      }),
    );
    setCircles(withTeachers as any);
  }, []);

  useFocusEffect(
    useCallback(() => { loadCircles(); }, [loadCircles]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCircles();
    setRefreshing(false);
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert('تأكيد', `حذف الحلقة "${name}"؟`, [
      {text: 'إلغاء', style: 'cancel'},
      {text: 'حذف', style: 'destructive', onPress: async () => {
        await deleteCircle(id);
        await loadCircles();
      }},
    ]);
  };

  const renderCircle = ({item}: any) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.name}</Text>
      </View>
      <Text style={styles.cardDetail}>المعلم: {item.teacherName}</Text>
      <Text style={styles.cardDetail}>الطلاب: {item.studentCount}/{item.max_students}</Text>
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => navigation.navigate('CircleForm', {circleId: item.id})}>
          <Text style={styles.actionText}>تعديل</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.deleteBtn]}
          onPress={() => handleDelete(item.id, item.name)}>
          <Text style={[styles.actionText, styles.deleteText]}>حذف</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => navigation.navigate('CircleForm', {})}>
        <Text style={styles.addBtnText}>+ إضافة حلقة جديدة</Text>
      </TouchableOpacity>
      <FlatList
        data={circles}
        keyExtractor={item => item.id}
        renderItem={renderCircle}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.empty}>لا توجد حلقات بعد</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.background},
  list: {padding: 16, gap: 12},
  addBtn: {
    backgroundColor: COLORS.primary, margin: 16, padding: 14, borderRadius: 8,
    alignItems: 'center',
  },
  addBtnText: {color: COLORS.white, fontSize: 16, fontWeight: '700'},
  card: {
    backgroundColor: COLORS.card, borderRadius: 8, padding: 16,
    borderWidth: 1, borderColor: COLORS.border,
  },
  cardHeader: {marginBottom: 8},
  cardTitle: {fontSize: 16, fontWeight: '700', color: COLORS.textHeading, textAlign: 'right'},
  cardDetail: {fontSize: 13, color: COLORS.textMuted, textAlign: 'right', marginTop: 4},
  cardActions: {flexDirection: 'row', justifyContent: 'flex-start', gap: 8, marginTop: 12},
  actionBtn: {padding: 8, borderRadius: 6, borderWidth: 1, borderColor: COLORS.border},
  actionText: {fontSize: 13, color: COLORS.text},
  deleteBtn: {borderColor: COLORS.danger},
  deleteText: {color: COLORS.danger},
  empty: {textAlign: 'center', color: COLORS.textMuted, marginTop: 40, fontSize: 14},
});
