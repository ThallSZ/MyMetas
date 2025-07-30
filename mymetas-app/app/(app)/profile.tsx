import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Image, Modal, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/authcontext';
import { Stack } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { FontAwesome } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { toByteArray } from 'base64-js';
import { useTheme } from '../../context/ThemeContext';

const ProfileScreen = () => {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.user_metadata.full_name || '');
      setAvatarUrl(user.user_metadata.avatar_url || null);
    }
  }, [user]);

  const handlePickAndUpload = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permissão necessária', 'Precisamos de acesso à sua galeria.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.5 });
    if (result.canceled || !user) return;

    const img = result.assets[0];
    const base64 = await FileSystem.readAsStringAsync(img.uri, { encoding: 'base64' });
    const filePath = `${user.id}/${new Date().getTime()}.png`;
    const contentType = 'image/png';
    
    setUploading(true);
    const { error } = await supabase.storage.from('avatars').upload(filePath, toByteArray(base64), { contentType });
    if (error) { Alert.alert('Erro no Upload', error.message); } 
    else {
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      setAvatarUrl(publicUrl);
      await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });
    }
    setUploading(false);
  };

  const handleUpdateProfile = async () => {
    const updates: { password?: string; data?: { full_name: string } } = { data: { full_name: name } };
    if (password) updates.password = password;
    const { error } = await supabase.auth.updateUser(updates);
    if (error) { Alert.alert('Erro', error.message); } 
    else { setPassword(''); setEditModalVisible(false); Alert.alert('Sucesso', 'Perfil atualizado!'); }
  };

  const handleLogout = async () => { await supabase.auth.signOut(); };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: 'Meu Perfil' }} />
      <Modal visible={editModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
            <View style={[styles.modalView, { backgroundColor: colors.card }]}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Editar Perfil</Text>
                <TextInput style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.border }]} placeholderTextColor={colors.placeholder} placeholder="Nome Completo" value={name} onChangeText={setName} />
                <TextInput style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.border }]} placeholderTextColor={colors.placeholder} placeholder="Nova Senha" value={password} onChangeText={setPassword} secureTextEntry />
                <View style={styles.modalButtons}>
                    <TouchableOpacity style={[styles.button, { backgroundColor: colors.cancelButton }]} onPress={() => setEditModalVisible(false)}><Text style={[styles.buttonText, { color: colors.cancelButtonText }]}>Cancelar</Text></TouchableOpacity>
                    <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleUpdateProfile}><Text style={styles.buttonText}>Salvar</Text></TouchableOpacity>
                </View>
            </View>
        </View>
      </Modal>

      <View style={[styles.profileHeader, { backgroundColor: colors.card }]}>
        <TouchableOpacity onPress={handlePickAndUpload} disabled={uploading} style={styles.avatarContainer}>
            {uploading ? <ActivityIndicator size="large" style={styles.avatar}/> : (
            <>
                {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: colors.background }]}>
                    <FontAwesome name="user" size={80} color={colors.textSecondary} />
                </View>
                )}
            </>
            )}
            <View style={[styles.cameraIcon, { backgroundColor: colors.primary }]}>
                <FontAwesome name="camera" size={16} color="#fff" />
            </View>
        </TouchableOpacity>
        <Text style={[styles.name, { color: colors.text }]}>{name}</Text>
        <Text style={[styles.email, { color: colors.textSecondary }]}>{user?.email}</Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <TouchableOpacity style={styles.menuItem} onPress={() => setEditModalVisible(true)}>
            <FontAwesome name="edit" size={20} color="#3498db" />
            <Text style={[styles.menuItemText, { color: colors.text }]}>Editar Perfil</Text>
            <FontAwesome name="angle-right" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <FontAwesome name="sign-out" size={20} color="#e74c3c" />
            <Text style={[styles.menuItemText, {color: '#e74c3c'}]}>Sair</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  profileHeader: { alignItems: 'center', paddingVertical: 30, marginBottom: 16 },
  avatarContainer: { position: 'relative' },
  avatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: '#fff' },
  avatarPlaceholder: { justifyContent: 'center', alignItems: 'center' },
  cameraIcon: { position: 'absolute', bottom: 5, right: 5, padding: 8, borderRadius: 15 },
  name: { fontSize: 24, fontWeight: 'bold', marginTop: 16 },
  email: { fontSize: 16, marginTop: 4 },
  card: { borderRadius: 12, marginHorizontal: 16, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  menuItemText: { flex: 1, marginLeft: 16, fontSize: 18 },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalView: { width: '90%', borderRadius: 10, padding: 20, alignItems: 'center', elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  input: { width: '100%', height: 50, borderWidth: 1, borderRadius: 8, marginBottom: 15, paddingHorizontal: 10 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 20 },
  button: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginHorizontal: 5 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default ProfileScreen;
