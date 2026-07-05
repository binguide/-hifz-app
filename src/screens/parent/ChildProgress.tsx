import React, {useState, useCallback} from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {getMemorizationByStudent} from '../../db/database';
import {Memorization, EvaluationGrade} from '../../types';
import {COLORS, GRADES} from '../../utils/constants';
import {SURAH_NAMES} from '../../types';
import {formatDate} from '../../utils/helpers';

const GRADE_KEYS: EvaluationGrade[] = ['excellent', 'very_good', 'good', 'acceptable', 'weak'];

export default function ChildProgress({route}: any) {
  const {studentId, studentName} = route.params;
  const [records, setRecords] = useState<Memorization[]>([]);
  const [filter, setFilter] = useState<'all' | 'new' | 'revision'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const r = await getMemorizationByStudent(studentId);
    setRecords(r);
  }, [studentId]);

  useFocusEffect(
    useCallback(() => { load(); }, [load]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const filtered = records.filter(r => filter === 'all' || r.type === filter);
  const gradeCount: Record<string, number> = {};
  GRADE_KEYS.forEach(g => { gradeCount[g] = 0; });
  records.forEach(r => { gradeCount[r.evaluation] = (gradeCount[r.evaluation] || 0) + 1; });

  const savedSurahs = new Set(records.filter(r => r.type === 'new').map(r => r.surah));

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <Text style={styles.headerTitle}>{studentName}</Text>
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.sumNum}>{savedSurahs.size}</Text>
          <Text style={styles.sumLabel}>سور مكتملة</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.sumNum}>{records.length}</Text>
          <Text style={styles.sumLabel}>جلسات</Text>
        </View>
      </View>
      <View style={styles.gradeRow}>
        {GRADE_KEYS.map(g => (
          <View key={g} style={styles.gradeCard}>
            <Text style={[styles.gradeNum, {color: GRADES.find(gr => gr.key === g)?.color}]}>
              {gradeCount[g] || 0}
            </Text>
            <Text style={styles.gradeLabel}>{GRADES.find(gr => gr.key === g)?.label}</Text>
          </View>
        ))}
      </View>
      <View style={styles.filterRow}>
        {[{key: 'all' as const, label: 'الكل'}, {key: 'new' as const, label: 'حفظ'}, {key: 'revision' as const, label: 'مراجعة'}].map(f => (
          <TouchableOpacity key={f.key} style={[styles.filterBtn, filter === f.key && styles.filterBtnActive]} onPress={() => setFilter(f.key)}>
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {filtered.map(r => (
        <View key={r.id} style={styles.recordCard}>
          <View style={styles.recordHeader}>
            <Text style={styles.recordType}>{r.type === 'new' ? 'حفظ' : 'مراجعة'}</Text>
            <Text style={[styles.recordGrade, {color: GRADES.find(g => g.key === r.evaluation)?.color}]}>
              {GRADES.find(g => g.key === r.evaluation)?.label}
            </Text>
          </View>
          <Text style={styles.recordSurah}>{SURAH_NAMES[r.surah - 1]} ({r.verse_from}-{r.verse_to})</Text>
          <Text style={styles.recordDate}>{formatDate(r.date)}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.background},
  content: {padding: 16, gap: 12},
  headerTitle: {fontSize: 20, fontWeight: '700', color: COLORS.primary, textAlign: 'right'},
  summaryRow: {flexDirection: 'row', gap: 12},
  summaryCard: {flex: 1, backgroundColor: COLORS.card, padding: 14, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border},
  sumNum: {fontSize: 22, fontWeight: '800', color: COLORS.primary},
  sumLabel: {fontSize: 12, color: COLORS.textMuted, marginTop: 4},
  gradeRow: {flexDirection: 'row', gap: 6},
  gradeCard: {flex: 1, backgroundColor: COLORS.card, padding: 10, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border},
  gradeNum: {fontSize: 18, fontWeight: '800'},
  gradeLabel: {fontSize: 9, color: COLORS.textMuted, marginTop: 2},
  filterRow: {flexDirection: 'row', gap: 8},
  filterBtn: {flex: 1, padding: 8, borderRadius: 6, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center'},
  filterBtnActive: {borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight},
  filterText: {fontSize: 12, color: COLORS.textMuted},
  filterTextActive: {color: COLORS.primary, fontWeight: '700'},
  recordCard: {backgroundColor: COLORS.card, borderRadius: 8, padding: 14, borderWidth: 1, borderColor: COLORS.border},
  recordHeader: {flexDirection: 'row', justifyContent: 'space-between'},
  recordType: {fontSize: 12, fontWeight: '600', color: COLORS.primary, backgroundColor: COLORS.primaryLight, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4},
  recordGrade: {fontSize: 14, fontWeight: '700'},
  recordSurah: {fontSize: 14, color: COLORS.text, textAlign: 'right', marginTop: 4},
  recordDate: {fontSize: 12, color: COLORS.textMuted, textAlign: 'right', marginTop: 4},
});
