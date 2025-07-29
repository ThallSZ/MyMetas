import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, TouchableOpacity, Modal, TextInput, ActivityIndicator, Platform, Image } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useFocusEffect, useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../../context/authcontext';
import { differenceInCalendarDays, isPast, isToday } from 'date-fns';
import { FontAwesome, Ionicons } from '@expo/vector-icons';

type Meta = { id: number; title: string; status: string; favorite: boolean; date_target: string | null; };

const formatStatus = (status: string) => {
  if (!status) return '';
  const formatted = status.replace('_', ' ');
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

const Countdown = ({ targetDate, status }: { targetDate: string | null, status: string }) => {
  if (status === 'concluida') {
    return <Text style={styles.countdownDone}>Concluída</Text>;
  }
  if (status === 'a_fazer') {
    return <Text style={styles.countdownToDo}>A fazer</Text>;
  }
  if (!targetDate || status !== 'em_andamento') {
    return null;
  }
  const target = new Date(targetDate);
  target.setDate(target.getDate() + 1);
  const now = new Date();
  const daysLeft = differenceInCalendarDays(target, now);

  if (isPast(target) && !isToday(target)) {
    return <Text style={styles.countdownOverdue}>Atrasado</Text>;
  }
  if (daysLeft === 0) {
    return <Text style={styles.countdownToday}>Termina hoje!</Text>;
  }
  return <Text style={styles.countdown}>{daysLeft} dias</Text>;
};

const HomeScreen = () => {
  const [metas, setMetas] = useState<Meta[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newMetaTitle, setNewMetaTitle] = useState('');
  const [newMetaDescription, setNewMetaDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const { user } = useAuth();

  const fetchMetas = async () => {
    setLoading(true);
    let query = supabase.from('Metas').select('id, title, status, favorite, date_target').order('favorite', { ascending: false }).order('created_at', { ascending: false });
    if (searchTerm.trim().length > 0) {
      query = query.ilike('title', `%${searchTerm.trim()}%`);
    }
    const { data, error } = await query;
    if (error) { Alert.alert('Erro ao buscar metas', error.message); } 
    else { setMetas(data as Meta[]); }
    setLoading(false);
  };

  useFocusEffect(useCallback(() => { fetchMetas(); }, []));

  const handleCreateMeta = async () => {
    if (newMetaTitle.trim().length < 3) { Alert.alert('Erro', 'O título precisa ter pelo menos 3 caracteres.'); return; }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const metaToInsert = { title: newMetaTitle.trim(), description: newMetaDescription.trim(), user_id: user.id, date_target: date.toISOString().split('T')[0] };
    const { error } = await supabase.from('Metas').insert([metaToInsert]);
    if (error) { Alert.alert('Erro ao criar meta', error.message); } 
    else {
      setNewMetaTitle('');
      setNewMetaDescription('');
      setModalVisible(false);
      fetchMetas();
    }
  };

  const toggleDatePicker = () => { setShowPicker(!showPicker); };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowPicker(Platform.OS === 'ios');
    if (selectedDate) { setDate(selectedDate); }
  };

  return (
    <View style={styles.container}>
      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Nova Meta</Text>
            <TextInput style={styles.input} placeholder="Título da sua meta" value={newMetaTitle} onChangeText={setNewMetaTitle} />
            <TextInput style={styles.input} placeholder="Descrição (opcional)" value={newMetaDescription} onChangeText={setNewMetaDescription} />
            <Text style={styles.label}>Data de Conclusão</Text>
            {Platform.OS === 'android' && (<TouchableOpacity style={styles.dateButton} onPress={toggleDatePicker}><Text style={styles.dateButtonText}>Escolher Data</Text></TouchableOpacity>)}
            {showPicker && (<DateTimePicker mode="date" display="default" value={date} onChange={onDateChange} minimumDate={new Date()} />)}
            <Text style={styles.dateText}>{date.toLocaleDateString()}</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => setModalVisible(false)}><Text style={[styles.buttonText, {color: '#c0392b'}]}>Cancelar</Text></TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={handleCreateMeta}><Text style={styles.buttonText}>Salvar</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.header}>
        <Text style={styles.title}>Minhas Metas</Text>
        <TouchableOpacity onPress={() => router.push('/(app)/profile')}>
          {user?.user_metadata.avatar_url ? (
            <Image source={{ uri: user.user_metadata.avatar_url }} style={styles.headerAvatar} />
          ) : (
            <View style={styles.headerAvatarPlaceholder}>
              <FontAwesome name="user" size={24} color="#555" />
            </View>
          )}
        </TouchableOpacity>
      </View>
      
      <View style={styles.searchContainer}>
        <FontAwesome name="search" size={18} color="#888" style={styles.searchIcon} />
        <TextInput style={styles.inputSearch} placeholder="Buscar por título..." value={searchTerm} onChangeText={setSearchTerm} onSubmitEditing={fetchMetas} />
      </View>
      
      {loading && metas.length === 0 ? <ActivityIndicator size="large" style={{marginTop: 50}}/> : (
        <FlatList
          data={metas}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.metaItem} onPress={() => router.push(`/meta/${item.id}`)}>
              <View style={styles.metaInfo}>
                <Text style={styles.metaTitle}>{item.favorite ? "★ " : ""}{item.title}</Text>
              </View>
              <Countdown targetDate={item.date_target} status={item.status} />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
                <Ionicons name="sad-outline" size={60} color="#ccc" />
                <Text style={styles.emptyText}>Nenhuma meta encontrada.</Text>
                <Text style={styles.emptySubText}>Clique no botão "+" para começar.</Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 50, paddingHorizontal: 16 },
  headerAvatar: { width: 44, height: 44, borderRadius: 22 },
  headerAvatarPlaceholder: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', backgroundColor: '#e1e1e1' },
  title: { fontSize: 32, fontWeight: 'bold' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 8, marginHorizontal: 16, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  searchIcon: { padding: 12 },
  inputSearch: { flex: 1, height: 48, fontSize: 16 },
  metaItem: { backgroundColor: '#fff', padding: 20, borderRadius: 12, marginHorizontal: 16, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  metaInfo: { flex: 1, marginRight: 8 },
  metaTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  countdown: { fontSize: 14, color: '#007BFF', fontWeight: 'bold' },
  countdownToday: { fontSize: 14, color: '#ffa500', fontWeight: 'bold' },
  countdownOverdue: { fontSize: 14, color: '#c0392b', fontWeight: 'bold' },
  countdownDone: { fontSize: 14, color: '#2ecc71', fontWeight: 'bold' },
  countdownToDo: { fontSize: 14, color: '#808080', fontWeight: 'bold' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: '30%' },
  emptyText: { marginTop: 16, fontSize: 18, fontWeight: '600', color: '#aaa' },
  emptySubText: { marginTop: 8, fontSize: 14, color: '#ccc' },
  fab: { position: 'absolute', right: 20, bottom: 80, width: 60, height: 60, borderRadius: 30, backgroundColor: '#007BFF', justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3 },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalView: { width: '90%', backgroundColor: 'white', borderRadius: 10, padding: 20, alignItems: 'center', elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  input: { width: '100%', height: 50, borderColor: '#ddd', borderWidth: 1, borderRadius: 8, marginBottom: 15, paddingHorizontal: 10, backgroundColor: '#f9f9f9' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 20 },
  label: { fontSize: 16, color: '#333', marginBottom: 10, alignSelf: 'flex-start' },
  dateText: { fontSize: 18, marginBottom: 20, fontWeight: '500' },
  dateButton: { backgroundColor: '#eef', padding: 10, borderRadius: 5, marginBottom: 10 },
  dateButtonText: { color: '#007BFF', fontWeight: 'bold' },
  button: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginHorizontal: 5, backgroundColor: '#007BFF' },
  cancelButton: { backgroundColor: '#f0f0f0' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default HomeScreen;
