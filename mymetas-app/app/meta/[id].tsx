import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, FlatList, ActivityIndicator, TouchableOpacity, TextInput, Modal, Platform, ScrollView } from 'react-native';
import { supabase } from '../../lib/supabase';
import { differenceInCalendarDays, isPast, isToday, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

type Step = { id: number; description: string; done: boolean; };
type Meta = { id: number; title: string; description: string; status: string; favorite: boolean; date_target: string; completed_at: string | null; steps: Step[]; };

const formatStatus = (status: string) => {
  if (!status) return '';
  const formatted = status.replace('_', ' ');
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

const Countdown = ({ targetDate, status, completedDate }: { targetDate: string | null, status: string, completedDate: string | null }) => {
  const { colors } = useTheme();
  if (status === 'concluida') return <Text style={[styles.countdownDone, { color: '#2ecc71'}]}>Concluída em {format(new Date(completedDate || Date.now()), 'dd/MM/yy')}</Text>;
  if (!targetDate || status !== 'em_andamento') return null;
  
  const target = new Date(targetDate);
  target.setDate(target.getDate() + 1);
  const now = new Date();
  const daysLeft = differenceInCalendarDays(target, now);

  if (isPast(target) && !isToday(target)) return <Text style={styles.countdownOverdue}>Atrasado em {Math.abs(daysLeft)} dias</Text>;
  if (daysLeft === 0) return <Text style={styles.countdownToday}>Termina hoje!</Text>;
  return <Text style={[styles.countdown, { color: colors.primary }]}>Faltam {daysLeft} dias</Text>;
};

const MetaDetailsScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { colors } = useTheme();
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingMeta, setEditingMeta] = useState<Partial<Meta>>({});
  const [newStepDescription, setNewStepDescription] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [date, setDate] = useState(new Date());

  const fetchMetaDetails = async () => {
    if (!id) return;
    setLoading(true);
    const { data, error } = await supabase.from('Metas').select('*, steps:Steps(*)').eq('id', id).single();
    if (error) { Alert.alert('Erro', 'Não foi possível buscar os detalhes da meta.'); }
    else { setMeta(data as Meta); }
    setLoading(false);
  };

  useEffect(() => { fetchMetaDetails(); }, [id]);

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
      setEditingMeta({ ...editingMeta, date_target: selectedDate.toISOString().split('T')[0] });
    }
  };

  const handleUpdateMeta = async () => {
    if (!editingMeta.title || editingMeta.title.trim().length < 3) { Alert.alert('Erro', 'O título é obrigatório.'); return; }
    
    const updatePayload: { [key: string]: any } = {
      title: editingMeta.title,
      description: editingMeta.description,
      status: editingMeta.status,
      date_target: editingMeta.date_target,
    };

    if (editingMeta.status === 'concluida' && meta?.status !== 'concluida') {
      updatePayload.completed_at = new Date().toISOString();
    }
    
    const { error } = await supabase.from('Metas').update(updatePayload).eq('id', id);
    if (error) { Alert.alert('Erro ao atualizar', error.message); }
    else { setEditModalVisible(false); fetchMetaDetails(); }
  };

  const openEditModal = () => {
    if (!meta) return;
    setEditingMeta({ title: meta.title, description: meta.description, status: meta.status, date_target: meta.date_target });
    setDate(meta.date_target ? new Date(meta.date_target) : new Date());
    setEditModalVisible(true);
  };
  
  const handleDeleteMeta = async () => {
    Alert.alert("Deletar Meta", "Você tem certeza?", [{ text: "Cancelar", style: "cancel" }, { text: "Deletar", style: "destructive", onPress: async () => {
      const { error } = await supabase.from('Metas').delete().eq('id', id);
      if (error) { Alert.alert('Erro', error.message); } else { router.back(); }
    }}]);
  };
  
  const handleCreateStep = async () => {
    if (newStepDescription.trim().length < 3) return;
    const { error } = await supabase.from('Steps').insert([{ description: newStepDescription.trim(), meta_id: id }]);
    if (error) { Alert.alert('Erro', error.message); } else { setNewStepDescription(''); fetchMetaDetails(); }
  };

  const handleToggleStep = async (step: Step) => {
    const { error } = await supabase.from('Steps').update({ done: !step.done }).eq('id', step.id);
    if (error) Alert.alert('Erro', error.message); else fetchMetaDetails();
  };

  const handleDeleteStep = async (stepId: number) => {
    const { error } = await supabase.from('Steps').delete().eq('id', stepId);
    if (error) Alert.alert('Erro', error.message); else fetchMetaDetails();
  };

  const handleToggleFavorite = async () => {
    if (!meta) return;
    const { error } = await supabase.from('Metas').update({ favorite: !meta.favorite }).eq('id', meta.id);
    if (error) { Alert.alert('Erro', error.message); } else { setMeta({ ...meta, favorite: !meta.favorite }); }
  };

  if (loading) { return <View style={[styles.centered, { backgroundColor: colors.background }]}><ActivityIndicator size="large" /></View>; }
  if (!meta) { return <View style={[styles.centered, { backgroundColor: colors.background }]}><Text style={{ color: colors.text }}>Meta não encontrada.</Text></View>; }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: meta.title }} />
      <Modal animationType="slide" transparent={true} visible={editModalVisible} onRequestClose={() => setEditModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={[styles.modalView, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Editar Meta</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.border }]} placeholderTextColor={colors.placeholder} placeholder="Título" value={editingMeta.title} onChangeText={(text) => setEditingMeta({...editingMeta, title: text})} />
            <TextInput style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.border }]} placeholderTextColor={colors.placeholder} placeholder="Descrição" value={editingMeta.description} onChangeText={(text) => setEditingMeta({...editingMeta, description: text})} multiline/>
            <Text style={[styles.label, { color: colors.text }]}>Status</Text>
            <View style={[styles.pickerContainer, { borderColor: colors.border }]}>
              <Picker selectedValue={editingMeta.status} onValueChange={(itemValue) => setEditingMeta({...editingMeta, status: itemValue})} style={{ color: colors.text }}>
                <Picker.Item label="A fazer" value="a_fazer" />
                <Picker.Item label="Em andamento" value="em_andamento" />
                <Picker.Item label="Concluída" value="concluida" />
              </Picker>
            </View>
            <Text style={[styles.label, { color: colors.text }]}>Data de Conclusão</Text>
            <TouchableOpacity onPress={() => setShowPicker(true)}>
                <TextInput style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.border }]} value={format(date, 'dd/MM/yyyy')} editable={false} />
            </TouchableOpacity>
            {showPicker && (<DateTimePicker mode="date" display="default" value={date} onChange={onDateChange} />)}
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.button, { backgroundColor: colors.cancelButton }]} onPress={() => setEditModalVisible(false)}><Text style={[styles.buttonText, { color: colors.cancelButtonText }]}>Cancelar</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleUpdateMeta}><Text style={styles.buttonText}>Salvar</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.text }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Detalhes</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>{meta.description || 'Sem descrição.'}</Text>
        <View style={styles.statusContainer}>
            <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>Status:</Text>
            <Text style={[styles.statusValue, { color: colors.text }]}>{formatStatus(meta.status)}</Text>
        </View>
        {meta.date_target && <Text style={[styles.dateLabel, { color: colors.textSecondary }]}>Prazo: {format(new Date(meta.date_target), 'dd MMMM, yyyy', { locale: ptBR })}</Text>}
        <Countdown targetDate={meta.date_target} status={meta.status} completedDate={meta.completed_at} />
      </View>

      <View style={[styles.actionsContainer, { backgroundColor: colors.card, shadowColor: colors.text }]}>
        <TouchableOpacity style={styles.actionButton} onPress={openEditModal}>
            <FontAwesome name="pencil" size={20} color="#3498db" />
            <Text style={[styles.actionButtonText, { color: colors.textSecondary }]}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleToggleFavorite}>
            <FontAwesome name={meta.favorite ? "star" : "star-o"} size={20} color="#f1c40f" />
            <Text style={[styles.actionButtonText, { color: colors.textSecondary }]}>Favoritar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleDeleteMeta}>
            <FontAwesome name="trash" size={20} color="#e74c3c" />
            <Text style={[styles.actionButtonText, { color: colors.textSecondary }]}>Deletar</Text>
        </TouchableOpacity>
      </View>
      
      <View style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.text }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Etapas</Text>
        <View style={styles.addStepContainer}>
          <TextInput style={[styles.inputStep, { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.border }]} placeholderTextColor={colors.placeholder} placeholder="Adicionar nova etapa..." value={newStepDescription} onChangeText={setNewStepDescription} />
          <TouchableOpacity style={[styles.addStepButton, { backgroundColor: colors.primary }]} onPress={handleCreateStep}>
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={meta.steps}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={[styles.stepItem, { borderBottomColor: colors.border }]}>
              <TouchableOpacity onPress={() => handleToggleStep(item)} style={styles.stepToggle}>
                <FontAwesome name={item.done ? "check-square-o" : "square-o"} size={24} color={item.done ? "#2ecc71" : colors.textSecondary} />
                <Text style={item.done ? [styles.stepDone, { color: colors.textSecondary }] : [styles.stepText, { color: colors.text }]}>{item.description}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDeleteStep(item.id)}>
                <Ionicons name="close-circle-outline" size={24} color="#e74c3c" />
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={<Text style={[styles.emptyText, { color: colors.textSecondary }]}>Nenhuma etapa cadastrada.</Text>}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { borderRadius: 12, padding: 20, marginBottom: 16, elevation: 2, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  cardTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  description: { fontSize: 16, lineHeight: 24, marginBottom: 16 },
  statusContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  statusLabel: { fontSize: 16, marginRight: 8 },
  statusValue: { fontSize: 16, fontWeight: '600' },
  dateLabel: { fontSize: 16, marginBottom: 16 },
  actionsContainer: { flexDirection: 'row', justifyContent: 'space-around', borderRadius: 12, paddingVertical: 10, marginBottom: 16, elevation: 2 },
  actionButton: { alignItems: 'center' },
  actionButtonText: { marginTop: 4 },
  addStepContainer: { flexDirection: 'row', marginBottom: 16, alignItems: 'center' },
  inputStep: { flex: 1, height: 44, borderWidth: 1, borderRadius: 8, paddingHorizontal: 10 },
  addStepButton: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  stepItem: { paddingVertical: 12, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stepToggle: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  stepText: { fontSize: 16, marginLeft: 12 },
  stepDone: { fontSize: 16, marginLeft: 12, textDecorationLine: 'line-through' },
  emptyText: { textAlign: 'center', paddingVertical: 20 },
  countdown: { fontSize: 16, fontWeight: 'bold', marginTop: 8, textAlign: 'center' },
  countdownToday: { fontSize: 16, color: '#ffa500', fontWeight: 'bold', marginTop: 8, textAlign: 'center' },
  countdownOverdue: { fontSize: 16, color: '#c0392b', fontWeight: 'bold', marginTop: 8, textAlign: 'center' },
  countdownDone: { fontSize: 16, fontWeight: 'bold', marginTop: 8, textAlign: 'center' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalView: { width: '90%', borderRadius: 10, padding: 20, alignItems: 'center', elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  input: { width: '100%', height: 50, borderWidth: 1, borderRadius: 8, marginBottom: 15, paddingHorizontal: 10 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 20 },
  label: { fontSize: 16, marginBottom: 10, alignSelf: 'flex-start' },
  pickerContainer: { width: '100%', borderWidth: 1, borderRadius: 8, marginBottom: 15, justifyContent: 'center' },
  picker: { width: '100%' },
  button: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginHorizontal: 5 },
  buttonText: { fontSize: 16, fontWeight: 'bold' },
});

export default MetaDetailsScreen;
