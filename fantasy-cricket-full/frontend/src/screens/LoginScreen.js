import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) return Alert.alert('Error', 'Please fill all fields');
    if (!isLogin && !username) return Alert.alert('Error', 'Username required');

    setLoading(true);
    try {
      if (isLogin) await login(email, password);
      else await register(username, email, password);
    } catch (err) {
      Alert.alert('Error', err.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0A1628', '#0D2137', '#071525']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <Text style={styles.logo}>🏏</Text>
          <Text style={styles.title}>Fantasy Cricket</Text>
          <Text style={styles.subtitle}>IPL 2024 Edition</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, isLogin && styles.activeTab]}
              onPress={() => setIsLogin(true)}>
              <Text style={[styles.tabText, isLogin && styles.activeTabText]}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, !isLogin && styles.activeTab]}
              onPress={() => setIsLogin(false)}>
              <Text style={[styles.tabText, !isLogin && styles.activeTabText]}>Register</Text>
            </TouchableOpacity>
          </View>

          {!isLogin && (
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor="#666"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          )}
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#666"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#666"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
            <LinearGradient colors={['#FF6B35', '#F7931E']} style={styles.buttonGradient}>
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.buttonText}>{isLogin ? 'Login' : 'Create Account'}</Text>}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => {
            setEmail('virat@demo.com'); setPassword('demo123');
          }}>
            <Text style={styles.demoText}>Use Demo Account</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  header: { alignItems: 'center', marginBottom: 40 },
  logo: { fontSize: 64 },
  title: { fontSize: 32, fontWeight: '800', color: '#FF6B35', letterSpacing: 1 },
  subtitle: { fontSize: 14, color: '#8899AA', marginTop: 4 },
  card: { backgroundColor: '#0F2030', borderRadius: 20, padding: 24, borderWidth: 1, borderColor: '#1A3048' },
  tabs: { flexDirection: 'row', marginBottom: 24, backgroundColor: '#071525', borderRadius: 12, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  activeTab: { backgroundColor: '#FF6B35' },
  tabText: { color: '#667788', fontWeight: '600' },
  activeTabText: { color: '#fff' },
  input: { backgroundColor: '#071525', borderRadius: 12, padding: 16, color: '#fff', marginBottom: 12, borderWidth: 1, borderColor: '#1A3048', fontSize: 15 },
  button: { marginTop: 8, borderRadius: 14, overflow: 'hidden' },
  buttonGradient: { padding: 16, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  demoText: { color: '#4A9EFF', textAlign: 'center', marginTop: 16, fontSize: 14 },
});
