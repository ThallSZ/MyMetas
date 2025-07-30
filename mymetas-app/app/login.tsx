import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import AuthInput from '../components/AuthInput';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { colors } = useTheme();

  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: password.trim() });
    setLoading(false);
    if (error) Alert.alert('Erro no Login', error.message);
    else router.replace('/(app)/home');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.innerContainer}>
        <FontAwesome5 name="bullseye" size={60} color={colors.primary} style={{ alignSelf: 'center', marginBottom: 20 }} />
        <Text style={[styles.title, { color: colors.text }]}>My Metas</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Gerencie suas metas!</Text>
        
        <AuthInput icon="envelope" placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <AuthInput icon="lock" placeholder="Senha" value={password} onChangeText={setPassword} secureTextEntry />

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 20 }}/>
        ) : (
          <>
            <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleLogin}>
              <Text style={styles.buttonText}>Entrar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.linkButton} onPress={() => router.push('/register')}>
              <Text style={[styles.linkButtonText, { color: colors.primary }]}>Não tenho uma conta.</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  innerContainer: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 36, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 40 },
  button: { paddingVertical: 16, borderRadius: 8, alignItems: 'center', elevation: 3, marginTop: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 2 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  linkButton: { marginTop: 24, alignItems: 'center' },
  linkButtonText: { fontSize: 16 },
});

export default LoginScreen;
