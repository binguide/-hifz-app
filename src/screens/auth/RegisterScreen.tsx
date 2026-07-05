import React, {useState} from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import {useAuthStore} from '../../store/authStore';
import {COLORS} from '../../utils/constants';
import {UserRole} from '../../types';

const ROLES: {key: UserRole; label: string}[] = [
  {key: 'student', label: 'طالب'},
  {key: 'parent', label: 'ولي أمر'},
];

export default function RegisterScreen({navigation}: any) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [loading, setLoading] = useState(false);
  const register = useAuthStore(s => s.register);

  const handleRegister = async () => {
    if (!name.trim() || !phone.trim() || !password.trim()) {
      Alert.alert('تنبيه', 'يرجى ملء جميع الحقول');
      return;
    }
    if (password.length < 6) {
      Alert.alert('تنبيه', 'كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }
    setLoading(true);
    try {
      const success = await register(name.trim(), phone.trim(), password, role);
      if (!success) {
        Alert.alert('خطأ', 'رقم الهاتف مستخدم مسبقاً');
      }
    } catch (e: any) {
      Alert.alert('خطأ', e.message);
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>إنشاء حساب جديد</Text>
        <TextInput
          style={styles.input}
          placeholder="الاسم الكامل"
          placeholderTextColor={COLORS.textMuted}
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="رقم الهاتف"
          placeholderTextColor={COLORS.textMuted}
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />
        <TextInput
          style={styles.input}
          placeholder="كلمة المرور"
          placeholderTextColor={COLORS.textMuted}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <Text style={styles.label}>نوع الحساب</Text>
        <View style={styles.roleRow}>
          {ROLES.map(r => (
            <TouchableOpacity
              key={r.key}
              style={[styles.roleBtn, role === r.key && styles.roleBtnActive]}
              onPress={() => setRole(r.key)}>
              <Text style={[styles.roleText, role === r.key && styles.roleTextActive]}>
                {r.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.buttonText}>تسجيل</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.link}>لديك حساب؟ تسجيل الدخول</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.background},
  scroll: {padding: 24, gap: 16},
  title: {fontSize: 24, fontWeight: '700', color: COLORS.textHeading, textAlign: 'center', marginBottom: 8},
  input: {
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'right',
  },
  label: {fontSize: 14, fontWeight: '600', color: COLORS.textHeading, textAlign: 'right'},
  roleRow: {flexDirection: 'row', gap: 12},
  roleBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  roleBtnActive: {borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight},
  roleText: {color: COLORS.text, fontSize: 14},
  roleTextActive: {color: COLORS.primary, fontWeight: '700'},
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  buttonDisabled: {opacity: 0.6},
  buttonText: {color: COLORS.white, fontSize: 16, fontWeight: '700'},
  link: {color: COLORS.info, textAlign: 'center', fontSize: 14, marginTop: 8},
});
