import React, {useState, useCallback} from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList,
  RefreshControl, Alert,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {useAuthStore} from '../../store/authStore';
import {getMessages, addMessage, getUsersByRole} from '../../db/database';
import {Message, User} from '../../types';
import {COLORS} from '../../utils/constants';
import {generateId, formatDateShort} from '../../utils/helpers';

export default function MessagesScreen() {
  const user = useAuthStore(s => s.user);
  const [messages, setMessages] = useState<Message[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const msgs = await getMessages(user.id);
    setMessages(msgs);
    const ts = await getUsersByRole('teacher');
    setTeachers(ts);
  }, [user]);

  useFocusEffect(
    useCallback(() => { load(); }, [load]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleSend = async () => {
    if (!user || !selectedTeacher || !content.trim()) {
      Alert.alert('تنبيه', 'يرجى اختيار معلم وكتابة الرسالة');
      return;
    }
    await addMessage({
      id: generateId(),
      from_id: user.id,
      to_id: selectedTeacher,
      content: content.trim(),
      read: false,
    });
    setContent('');
    await load();
  };

  const relevantMsgs = messages.filter(
    m => !selectedTeacher || m.from_id === selectedTeacher || m.to_id === selectedTeacher,
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={relevantMsgs}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
          <View style={styles.teacherRow}>
            {teachers.map(t => (
              <TouchableOpacity
                key={t.id}
                style={[styles.teacherBtn, selectedTeacher === t.id && styles.teacherBtnActive]}
                onPress={() => setSelectedTeacher(t.id)}>
                <Text style={[styles.teacherText, selectedTeacher === t.id && styles.teacherTextActive]}>
                  {t.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        }
        renderItem={({item}) => (
          <View style={[styles.msgBubble, item.from_id === user?.id ? styles.myMsg : styles.theirMsg]}>
            <Text style={[styles.msgContent, item.from_id === user?.id ? styles.myMsgText : styles.theirMsgText]}>
              {item.content}
            </Text>
            <Text style={styles.msgDate}>{formatDateShort(item.created_at)}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>لا توجد رسائل</Text>}
      />
      {selectedTeacher && (
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="اكتب رسالتك..."
            placeholderTextColor={COLORS.textMuted}
            value={content}
            onChangeText={setContent}
            multiline
          />
          <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
            <Text style={styles.sendBtnText}>إرسال</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.background},
  list: {padding: 16, gap: 8},
  teacherRow: {flexDirection: 'row', gap: 8, marginBottom: 12, flexWrap: 'wrap'},
  teacherBtn: {padding: 8, borderRadius: 6, borderWidth: 1, borderColor: COLORS.border},
  teacherBtnActive: {borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight},
  teacherText: {fontSize: 12, color: COLORS.text},
  teacherTextActive: {color: COLORS.primary, fontWeight: '700'},
  msgBubble: {maxWidth: '80%', padding: 12, borderRadius: 12, marginBottom: 4},
  myMsg: {alignSelf: 'flex-start', backgroundColor: COLORS.primary},
  theirMsg: {alignSelf: 'flex-end', backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border},
  msgContent: {fontSize: 14},
  myMsgText: {color: COLORS.white},
  theirMsgText: {color: COLORS.text},
  msgDate: {fontSize: 10, color: COLORS.textMuted, marginTop: 4, textAlign: 'left'},
  inputRow: {flexDirection: 'row', padding: 12, gap: 8, borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: COLORS.card},
  input: {flex: 1, backgroundColor: COLORS.inputBg, borderRadius: 8, padding: 10, fontSize: 14, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border, maxHeight: 80},
  sendBtn: {padding: 10, borderRadius: 8, backgroundColor: COLORS.primary, justifyContent: 'center'},
  sendBtnText: {color: COLORS.white, fontWeight: '700', fontSize: 14},
  empty: {textAlign: 'center', color: COLORS.textMuted, marginTop: 40},
});
