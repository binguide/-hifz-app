import React, {useState, useCallback} from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {useAuthStore} from '../../store/authStore';
import {getChildrenByParent} from '../../db/database';
import {User} from '../../types';
import {COLORS} from '../../utils/constants';

export default function ParentDashboard({navigation}: any) {
  const user = useAuthStore(s => s.user);
  const [children, setChildren] = useState<User[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const c = await getChildrenByParent(user.id);
    setChildren(c);
  }, [user]);

  useFocusEffect(
    useCallback(() => { load(); }, [load]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View style={styles.welcome}>
        <Text style={styles.welcomeText}>مرحباً، {user?.name}</Text>
      </View>
      <Text style={styles.sectionTitle}>أبنائي المسجلون</Text>
      {children.length === 0 ? (
        <Text style={styles.empty}>لا يوجد أبناء مسجلون</Text>
      ) : (
        children.map(child => (
          <TouchableOpacity
            key={child.id}
            style={styles.childCard}
            onPress={() => navigation.navigate('ChildProgress', {studentId: child.id, studentName: child.name})}>
            <Text style={styles.childName}>{child.name}</Text>
            <Text style={styles.childArrow}>←</Text>
          </TouchableOpacity>
        ))
      )}
      <TouchableOpacity
        style={styles.msgBtn}
        onPress={() => navigation.navigate('Messages')}>
        <Text style={styles.msgBtnText}>💬 الرسائل</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.background},
  content: {padding: 16, gap: 16},
  welcome: {marginBottom: 4},
  welcomeText: {fontSize: 20, fontWeight: '700', color: COLORS.primary, textAlign: 'right'},
  sectionTitle: {fontSize: 15, fontWeight: '700', color: COLORS.textHeading, textAlign: 'right'},
  empty: {textAlign: 'center', color: COLORS.textMuted, marginTop: 20},
  childCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.card, padding: 16, borderRadius: 8,
    borderWidth: 1, borderColor: COLORS.border,
  },
  childName: {fontSize: 16, fontWeight: '600', color: COLORS.textHeading},
  childArrow: {fontSize: 18, color: COLORS.textMuted},
  msgBtn: {padding: 14, borderRadius: 8, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center'},
  msgBtnText: {fontSize: 15, color: COLORS.primary, fontWeight: '600'},
});
