import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {ActivityIndicator, View} from 'react-native';
import {useAuthStore} from '../store/authStore';
import {COLORS} from '../utils/constants';

import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import AdminDashboard from '../screens/admin/AdminDashboard';
import ManageCircles from '../screens/admin/ManageCircles';
import ManageUsers from '../screens/admin/ManageUsers';
import CircleForm from '../screens/admin/CircleForm';
import Reports from '../screens/admin/Reports';
import TeacherDashboard from '../screens/teacher/TeacherDashboard';
import CircleDetail from '../screens/teacher/CircleDetail';
import AttendanceScreen from '../screens/teacher/AttendanceScreen';
import MemorizationScreen from '../screens/teacher/MemorizationScreen';
import EvaluationScreen from '../screens/teacher/EvaluationScreen';
import TeacherSchedule from '../screens/teacher/TeacherSchedule';
import StudentDashboard from '../screens/student/StudentDashboard';
import MyProgress from '../screens/student/MyProgress';
import MySchedule from '../screens/student/MySchedule';
import ParentDashboard from '../screens/parent/ParentDashboard';
import ChildProgress from '../screens/parent/ChildProgress';
import MessagesScreen from '../screens/parent/MessagesScreen';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  AdminTabs: undefined;
  TeacherTabs: undefined;
  StudentTabs: undefined;
  ParentTabs: undefined;
  CircleForm: {circleId?: string};
  CircleDetail: {circleId: string};
  Attendance: {circleId: string; circleName: string};
  Memorization: {circleId: string; circleName: string};
  Evaluation: {studentId: string; studentName: string; circleId: string};
  TeacherSchedule: undefined;
  ChildProgress: {studentId: string; studentName: string};
  Messages: undefined;
  ManageCircles: undefined;
  ManageUsers: undefined;
  Reports: undefined;
  MyProgress: undefined;
  MySchedule: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const screenOptions = {
  headerStyle: {backgroundColor: COLORS.primary},
  headerTintColor: COLORS.white,
  headerTitleStyle: {fontWeight: '700' as const},
  contentStyle: {backgroundColor: COLORS.background},
};

function LoadingScreen() {
  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background}}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );
}

export default function AppNavigator() {
  const {user, isLoggedIn, isLoading} = useAuthStore();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isLoggedIn || !user) {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={screenOptions}>
          <Stack.Screen name="Login" component={LoginScreen} options={{title: 'تسجيل الدخول'}} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{title: 'حساب جديد'}} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={screenOptions}>
        {user.role === 'admin' && (
          <>
            <Stack.Screen name="AdminTabs" component={AdminDashboard} options={{title: 'لوحة التحكم'}} />
            <Stack.Screen name="ManageCircles" component={ManageCircles} options={{title: 'إدارة الحلقات'}} />
            <Stack.Screen name="CircleForm" component={CircleForm} options={{title: 'إضافة حلقة'}} />
            <Stack.Screen name="ManageUsers" component={ManageUsers} options={{title: 'إدارة المستخدمين'}} />
            <Stack.Screen name="Reports" component={Reports} options={{title: 'التقارير'}} />
          </>
        )}
        {user.role === 'teacher' && (
          <>
            <Stack.Screen name="TeacherTabs" component={TeacherDashboard} options={{title: 'لوحة المعلم'}} />
            <Stack.Screen name="CircleDetail" component={CircleDetail} options={{title: 'الحلقة'}} />
            <Stack.Screen name="Attendance" component={AttendanceScreen} options={{title: 'الحضور'}} />
            <Stack.Screen name="Memorization" component={MemorizationScreen} options={{title: 'المتابعة'}} />
            <Stack.Screen name="Evaluation" component={EvaluationScreen} options={{title: 'التقييم'}} />
            <Stack.Screen name="TeacherSchedule" component={TeacherSchedule} options={{title: 'الجدول'}} />
          </>
        )}
        {user.role === 'student' && (
          <>
            <Stack.Screen name="StudentTabs" component={StudentDashboard} options={{title: 'لوحة الطالب'}} />
            <Stack.Screen name="MyProgress" component={MyProgress} options={{title: 'تقدمي'}} />
            <Stack.Screen name="MySchedule" component={MySchedule} options={{title: 'جدولي'}} />
          </>
        )}
        {user.role === 'parent' && (
          <>
            <Stack.Screen name="ParentTabs" component={ParentDashboard} options={{title: 'لوحة ولي الأمر'}} />
            <Stack.Screen name="ChildProgress" component={ChildProgress} options={{title: 'تقدم الطالب'}} />
            <Stack.Screen name="Messages" component={MessagesScreen} options={{title: 'الرسائل'}} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
