import {Platform} from 'react-native';

export const SUPABASE_URL = 'https://your-project.supabase.co';
export const SUPABASE_ANON_KEY = 'your-anon-key';

export const COLORS = {
  primary: '#1e3a5f',
  primaryLight: '#f0f4f9',
  success: '#2f855a',
  danger: '#b91c1c',
  warning: '#b45309',
  info: '#0369a1',
  white: '#ffffff',
  background: '#fcfcfd',
  card: '#ffffff',
  text: '#212529',
  textMuted: '#868e96',
  textHeading: '#111827',
  border: '#e9ecef',
  borderStrong: '#dee2e6',
  inputBg: '#ffffff',
  excellent: '#2f855a',
  veryGood: '#3182ce',
  good: '#d69e2e',
  acceptable: '#b45309',
  weak: '#b91c1c',
};

export const FONTS = {
  regular: Platform.OS === 'ios' ? 'Cairo' : 'Cairo-Regular',
  medium: Platform.OS === 'ios' ? 'Cairo' : 'Cairo-Medium',
  bold: Platform.OS === 'ios' ? 'Cairo' : 'Cairo-Bold',
};

export const GRADES = [
  {key: 'excellent', label: 'ممتاز', color: COLORS.excellent},
  {key: 'very_good', label: 'جيد جداً', color: COLORS.veryGood},
  {key: 'good', label: 'جيد', color: COLORS.good},
  {key: 'acceptable', label: 'مقبول', color: COLORS.acceptable},
  {key: 'weak', label: 'ضعيف', color: COLORS.weak},
] as const;
