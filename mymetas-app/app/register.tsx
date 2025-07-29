import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import AuthInput from '../components/AuthInput';
import { FontAwesome5 } from '@expo/vector-icons';

const RegisterScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    if (!name || !email || !password) { Alert.alert('Erro', 'Preencha todos os campos.'); return; }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password.trim(),
      options: { data: { full_name: name.trim() } },
    });
    setLoading(false);
    if (error) { Alert.alert('Erro no Registro', error.message); } 
    else {
      Alert.alert('Sucesso!', 'Registro realizado! Faça o login para continuar.');
      router.back();
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <View style={styles.innerContainer}>
        <FontAwesome5 name="user-plus" size={50} color="#007BFF" style={{ alignSelf: 'center', marginBottom: 20 }} />
        <Text style={styles.title}>Criar Conta</Text>
        <Text style={styles.subtitle}>Comece a organizar suas metas hoje!</Text>
        
        <AuthInput icon="user" placeholder="Nome" value={name} onChangeText={setName} />
        <AuthInput icon="envelope" placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <AuthInput icon="lock" placeholder="Senha" value={password} onChangeText={setPassword} secureTextEntry />

        {loading ? (
          <ActivityIndicator size="large" color="#007BFF" style={{ marginVertical: 20 }}/>
        ) : (
          <>
            <TouchableOpacity style={styles.button} onPress={handleRegister}>
              <Text style={styles.buttonText}>Registrar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.linkButton} onPress={() => router.back()}>
              <Text style={styles.linkButtonText}>Já tenho uma conta.</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  innerContainer: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 36, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 40 },
  button: { backgroundColor: '#007BFF', paddingVertical: 16, borderRadius: 8, alignItems: 'center', elevation: 3, marginTop: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 2 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  linkButton: { marginTop: 24, alignItems: 'center' },
  linkButtonText: { color: '#007BFF', fontSize: 16 },
});

export default RegisterScreen;