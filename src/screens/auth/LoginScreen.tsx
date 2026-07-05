import React, {useState} from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import {useAuthStore} from '../../store/authStore';
import {COLORS} from '../../utils/constants';

export default function LoginScreen({navigation}: any) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore(s => s.login);

  const handleLogin = async () => {
    if (!phone.trim() || !password.trim()) {
      Alert.alert('تنبيه', 'يرجى إدخال رقم الهاتف وكلمة المرور');
      return;
    }
    setLoading(true);
    try {
      const success = await login(phone.trim(), password);
      if (!success) {
        Alert.alert('خطأ', 'رقم الهاتف أو كلمة المرور غير صحيحة');
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
      <View style={styles.header}>
        <Text style={styles.logo}>📖</Text>
        <Text style={styles.title}>حلقات التحفيظ</Text>
        <Text style={styles.subtitle}>نظام إدارة حلقات تحفيظ القرآن الكريم</Text>
      </View>
      <View style={styles.form}>
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
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.buttonText}>تسجيل الدخول</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.link}>ليس لديك حساب؟ سجل الآن</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', padding: 24},
  header: {alignItems: 'center', marginBottom: 40},
  logo: {fontSize: 64, marginBottom: 12},
  title: {fontSize: 28, fontWeight: '800', color: COLORS.primary, marginBottom: 8},
  subtitle: {fontSize: 14, color: COLORS.textMuted, textAlign: 'center'},
  form: {gap: 16},
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
