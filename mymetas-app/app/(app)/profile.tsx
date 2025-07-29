import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Image, Modal, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/authcontext';
import { Stack } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { FontAwesome } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { toByteArray } from 'base64-js';

const ProfileScreen = () => {
  const { user } = useAuth();
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
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à sua galeria para escolher uma foto.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (result.canceled || !user) {
      return;
    }

    const img = result.assets[0];
    const base64 = await FileSystem.readAsStringAsync(img.uri, { encoding: 'base64' });
    const filePath = `${user.id}/${new Date().getTime()}.png`;
    const contentType = 'image/png';
    
    setUploading(true);
    const { error } = await supabase.storage.from('avatars').upload(filePath, toByteArray(base64), { contentType });
    
    if (error) {
      Alert.alert('Erro no Upload', error.message);
    } else {
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      setAvatarUrl(publicUrl);
      await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });
    }
    setUploading(false);
  };

  const handleUpdateProfile = async () => {
    const updates: { password?: string; data?: { full_name: string } } = {
      data: { full_name: name }
    };
    if (password) updates.password = password;

    const { error } = await supabase.auth.updateUser(updates);
    if (error) { Alert.alert('Erro', error.message); } 
    else {
      setPassword('');
      setEditModalVisible(false);
      Alert.alert('Sucesso', 'Perfil atualizado!');
    }
  };

  const handleLogout = async () => { await supabase.auth.signOut(); };

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: 'Meu Perfil' }} />
      <Modal visible={editModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
            <View style={styles.modalView}>
                <Text style={styles.modalTitle}>Editar Perfil</Text>
                <TextInput style={styles.input} placeholder="Nome" value={name} onChangeText={setName} />
                <TextInput style={styles.input} placeholder="Nova Senha" value={password} onChangeText={setPassword} secureTextEntry />
                <View style={styles.modalButtons}>
                    <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => setEditModalVisible(false)}><Text style={[styles.buttonText, {color: '#c0392b'}]}>Cancelar</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={handleUpdateProfile}><Text style={styles.buttonText}>Salvar</Text></TouchableOpacity>
                </View>
            </View>
        </View>
      </Modal>

      <View style={styles.profileHeader}>
        <TouchableOpacity onPress={handlePickAndUpload} disabled={uploading} style={styles.avatarContainer}>
            {uploading ? <ActivityIndicator size="large" style={styles.avatar}/> : (
            <>
                {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                    <FontAwesome name="user" size={80} color="#bdc3c7" />
                </View>
                )}
            </>
            )}
            <View style={styles.cameraIcon}>
                <FontAwesome name="camera" size={16} color="#fff" />
            </View>
        </TouchableOpacity>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.card}>
        <TouchableOpacity style={styles.menuItem} onPress={() => setEditModalVisible(true)}>
            <FontAwesome name="edit" size={20} color="#3498db" />
            <Text style={styles.menuItemText}>Editar Perfil</Text>
            <FontAwesome name="angle-right" size={20} color="#bdc3c7" />
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <FontAwesome name="sign-out" size={20} color="#e74c3c" />
            <Text style={[styles.menuItemText, {color: '#e74c3c'}]}>Sair</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  profileHeader: { alignItems: 'center', paddingVertical: 30, backgroundColor: '#fff', marginBottom: 16 },
  avatarContainer: { position: 'relative' },
  avatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: '#fff', elevation: 5 },
  avatarPlaceholder: { justifyContent: 'center', alignItems: 'center', backgroundColor: '#e1e1e1' },
  cameraIcon: { position: 'absolute', bottom: 5, right: 5, backgroundColor: '#007BFF', padding: 8, borderRadius: 15 },
  name: { fontSize: 24, fontWeight: 'bold', marginTop: 16 },
  email: { fontSize: 16, color: 'gray', marginTop: 4 },
  card: { backgroundColor: '#fff', borderRadius: 12, marginHorizontal: 16, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  menuItemText: { flex: 1, marginLeft: 16, fontSize: 18, color: '#333' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalView: { width: '90%', backgroundColor: 'white', borderRadius: 10, padding: 20, alignItems: 'center', elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  input: { width: '100%', height: 50, borderColor: '#ddd', borderWidth: 1, borderRadius: 8, marginBottom: 15, paddingHorizontal: 10, backgroundColor: '#f9f9f9' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 20 },
  button: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginHorizontal: 5, backgroundColor: '#007BFF' },
  cancelButton: { backgroundColor: '#f0f0f0' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default ProfileScreen;
