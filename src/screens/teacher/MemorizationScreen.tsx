import React, {useState, useCallback} from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList,
  RefreshControl, Alert, Modal,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {getCircleStudents, getMemorizationByCircle, addMemorization} from '../../db/database';
import {User, Memorization, EvaluationGrade} from '../../types';
import {COLORS, GRADES} from '../../utils/constants';
import {generateId, todayString} from '../../utils/helpers';
import {SURAH_NAMES, SURAH_VERSE_COUNT} from '../../types';

export default function MemorizationScreen({route}: any) {
  const {circleId} = route.params;
  const [students, setStudents] = useState<User[]>([]);
  const [records, setRecords] = useState<Memorization[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [type, setType] = useState<'new' | 'revision'>('new');
  const [surah, setSurah] = useState('');
  const [verseFrom, setVerseFrom] = useState('');
  const [verseTo, setVerseTo] = useState('');
  const [evaluation, setEvaluation] = useState<EvaluationGrade>('good');
  const [notes, setNotes] = useState('');

  const date = todayString();

  const load = useCallback(async () => {
    const s = await getCircleStudents(circleId);
    setStudents(s);
    const r = await getMemorizationByCircle(circleId, date);
    setRecords(r);
  }, [circleId, date]);

  useFocusEffect(
    useCallback(() => { load(); }, [load]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const openModal = (student: User) => {
    setSelectedStudent(student);
    setType('new');
    setSurah('');
    setVerseFrom('');
    setVerseTo('');
    setEvaluation('good');
    setNotes('');
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!selectedStudent || !surah.trim() || !verseFrom.trim() || !verseTo.trim()) {
      Alert.alert('تنبيه', 'يرجى ملء جميع الحقول');
      return;
    }
    const surahNum = parseInt(surah);
    const vFrom = parseInt(verseFrom);
    const vTo = parseInt(verseTo);
    if (surahNum < 1 || surahNum > 114) {
      Alert.alert('خطأ', 'رقم السورة يجب أن يكون بين 1 و 114');
      return;
    }
    const maxVerses = SURAH_VERSE_COUNT[surahNum - 1];
    if (vFrom < 1 || vTo > maxVerses || vFrom > vTo) {
      Alert.alert('خطأ', `رقم الآية يجب أن يكون بين 1 و ${maxVerses}`);
      return;
    }
    await addMemorization({
      id: generateId(),
      student_id: selectedStudent.id,
      circle_id: circleId,
      date,
      type,
      surah: surahNum,
      verse_from: vFrom,
      verse_to: vTo,
      evaluation,
      notes: notes.trim(),
    });
    setModalVisible(false);
    await load();
  };

  const renderStudent = ({item}: {item: User}) => {
    const studentRecords = records.filter(r => r.student_id === item.id);
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.studentName}>{item.name}</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => openModal(item)}>
            <Text style={styles.addBtnText}>+ إضافة</Text>
          </TouchableOpacity>
        </View>
        {studentRecords.length === 0 ? (
          <Text style={styles.noData}>لا توجد متابعة اليوم</Text>
        ) : (
          studentRecords.map(r => (
            <View key={r.id} style={styles.recordRow}>
              <Text style={styles.recordType}>{r.type === 'new' ? 'حفظ' : 'مراجعة'}</Text>
              <Text style={styles.recordSurah}>{SURAH_NAMES[r.surah - 1]} ({r.verse_from}-{r.verse_to})</Text>
              <Text style={[styles.recordGrade, {color: GRADES.find(g => g.key === r.evaluation)?.color}]}>
                {GRADES.find(g => g.key === r.evaluation)?.label}
              </Text>
            </View>
          ))
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={students}
        keyExtractor={item => item.id}
        renderItem={renderStudent}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.empty}>لا يوجد طلاب</Text>}
      />
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>تقييم {selectedStudent?.name}</Text>
            <View style={styles.typeRow}>
              <TouchableOpacity style={[styles.typeBtn, type === 'new' && styles.typeBtnActive]} onPress={() => setType('new')}>
                <Text style={[styles.typeBtnText, type === 'new' && styles.typeBtnTextActive]}>حفظ جديد</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.typeBtn, type === 'revision' && styles.typeBtnActive]} onPress={() => setType('revision')}>
                <Text style={[styles.typeBtnText, type === 'revision' && styles.typeBtnTextActive]}>مراجعة</Text>
              </TouchableOpacity>
            </View>
            <TextInput style={styles.input} placeholder="رقم السورة (1-114)" placeholderTextColor={COLORS.textMuted} keyboardType="numeric" value={surah} onChangeText={setSurah} />
            <TextInput style={styles.input} placeholder="من آية" placeholderTextColor={COLORS.textMuted} keyboardType="numeric" value={verseFrom} onChangeText={setVerseFrom} />
            <TextInput style={styles.input} placeholder="إلى آية" placeholderTextColor={COLORS.textMuted} keyboardType="numeric" value={verseTo} onChangeText={setVerseTo} />
            <Text style={styles.label}>التقدير</Text>
            <View style={styles.gradeRow}>
              {GRADES.map(g => (
                <TouchableOpacity
                  key={g.key}
                  style={[styles.gradeBtn, evaluation === g.key && {borderColor: g.color, backgroundColor: g.color + '20'}]}
                  onPress={() => setEvaluation(g.key as EvaluationGrade)}>
                  <Text style={[styles.gradeText, evaluation === g.key && {color: g.color, fontWeight: '700'}]}>{g.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput style={[styles.input, {height: 60}]} placeholder="ملاحظات (اختياري)" placeholderTextColor={COLORS.textMuted} value={notes} onChangeText={setNotes} multiline />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>حفظ</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.background},
  list: {padding: 16, gap: 12},
  card: {backgroundColor: COLORS.card, borderRadius: 8, padding: 14, borderWidth: 1, borderColor: COLORS.border},
  cardHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8},
  studentName: {fontSize: 15, fontWeight: '700', color: COLORS.textHeading},
  addBtn: {padding: 6, borderRadius: 6, borderWidth: 1, borderColor: COLORS.primary},
  addBtnText: {fontSize: 12, color: COLORS.primary, fontWeight: '600'},
  noData: {fontSize: 12, color: COLORS.textMuted, textAlign: 'right'},
  recordRow: {flexDirection: 'row', gap: 8, marginTop: 6, alignItems: 'center'},
  recordType: {fontSize: 12, fontWeight: '600', color: COLORS.primary, backgroundColor: COLORS.primaryLight, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4},
  recordSurah: {flex: 1, fontSize: 13, color: COLORS.text, textAlign: 'right'},
  recordGrade: {fontSize: 12, fontWeight: '600'},
  empty: {textAlign: 'center', color: COLORS.textMuted, marginTop: 40},
  modalOverlay: {flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 24},
  modalContent: {backgroundColor: COLORS.white, borderRadius: 12, padding: 20, gap: 12},
  modalTitle: {fontSize: 18, fontWeight: '700', color: COLORS.textHeading, textAlign: 'center'},
  typeRow: {flexDirection: 'row', gap: 8},
  typeBtn: {flex: 1, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center'},
  typeBtnActive: {borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight},
  typeBtnText: {fontSize: 13, color: COLORS.textMuted},
  typeBtnTextActive: {color: COLORS.primary, fontWeight: '700'},
  input: {backgroundColor: COLORS.inputBg, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 12, fontSize: 14, color: COLORS.text, textAlign: 'right'},
  label: {fontSize: 13, fontWeight: '600', color: COLORS.textHeading, textAlign: 'right'},
  gradeRow: {flexDirection: 'row', gap: 6, flexWrap: 'wrap'},
  gradeBtn: {padding: 8, borderRadius: 6, borderWidth: 1, borderColor: COLORS.border},
  gradeText: {fontSize: 12, color: COLORS.textMuted},
  modalActions: {flexDirection: 'row', gap: 12, marginTop: 4},
  cancelBtn: {flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center'},
  cancelBtnText: {color: COLORS.text, fontSize: 14, fontWeight: '600'},
  saveBtn: {flex: 1, padding: 12, borderRadius: 8, backgroundColor: COLORS.primary, alignItems: 'center'},
  saveBtnText: {color: COLORS.white, fontSize: 14, fontWeight: '700'},
});
