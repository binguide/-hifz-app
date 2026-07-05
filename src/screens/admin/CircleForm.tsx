import React, {useState, useEffect} from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ScrollView, ActivityIndicator,
} from 'react-native';
import {getCircle, addCircle, getUsersByRole, getUser} from '../../db/database';
import {Circle, User} from '../../types';
import {COLORS} from '../../utils/constants';
import {generateId} from '../../utils/helpers';

export default function CircleForm({route, navigation}: any) {
  const circleId = route.params?.circleId;
  const [name, setName] = useState('');
  const [teacherPhone, setTeacherPhone] = useState('');
  const [maxStudents, setMaxStudents] = useState('20');
  const [loading, setLoading] = useState(false);
  const [teachers, setTeachers] = useState<User[]>([]);

  useEffect(() => {
    getUsersByRole('teacher').then(setTeachers);
    if (circleId) {
      getCircle(circleId).then(c => {
        if (c) {
          setName(c.name);
          setMaxStudents(String(c.max_students));
          getUser(c.teacher_id).then(t => {
            if (t) setTeacherPhone(t.phone);
          });
        }
      });
    }
  }, [circleId]);

  const handleSave = async () => {
    if (!name.trim() || !teacherPhone.trim()) {
      Alert.alert('تنبيه', 'يرجى ملء جميع الحقول');
      return;
    }
    const teacher = teachers.find(t => t.phone === teacherPhone.trim());
    if (!teacher) {
      Alert.alert('خطأ', 'المعلم غير موجود');
      return;
    }
    setLoading(true);
    const circle: any = {
      id: circleId || generateId(),
      name: name.trim(),
      teacher_id: teacher.id,
      schedule: '{}',
      max_students: parseInt(maxStudents) || 20,
    };
    await addCircle(circle);
    setLoading(false);
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.form}>
      <TextInput
        style={styles.input}
        placeholder="اسم الحلقة"
        placeholderTextColor={COLORS.textMuted}
        value={name}
        onChangeText={setName}
      />
      <Text style={styles.label}>رقم هاتف المعلم</Text>
      <TextInput
        style={styles.input}
        placeholder="05XXXXXXXX"
        placeholderTextColor={COLORS.textMuted}
        keyboardType="phone-pad"
        value={teacherPhone}
        onChangeText={setTeacherPhone}
      />
      <Text style={styles.label}>العدد الأقصى للطلاب</Text>
      <TextInput
        style={styles.input}
        placeholder="20"
        placeholderTextColor={COLORS.textMuted}
        keyboardType="numeric"
        value={maxStudents}
        onChangeText={setMaxStudents}
      />
      <TouchableOpacity
        style={[styles.button, loading && {opacity: 0.6}]}
        onPress={handleSave}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <Text style={styles.buttonText}>حفظ</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.background},
  form: {padding: 24, gap: 16},
  label: {fontSize: 13, fontWeight: '600', color: COLORS.textHeading, textAlign: 'right'},
  input: {
    backgroundColor: COLORS.inputBg, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 8, padding: 14, fontSize: 16, color: COLORS.text, textAlign: 'right',
  },
  button: {
    backgroundColor: COLORS.primary, borderRadius: 8, padding: 14, alignItems: 'center',
  },
  buttonText: {color: COLORS.white, fontSize: 16, fontWeight: '700'},
});
