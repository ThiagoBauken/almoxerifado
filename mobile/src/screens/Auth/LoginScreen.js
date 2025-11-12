import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { mockUsers, setCurrentUser } from '../../data/mockData';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('thiago@obra.com');
  const [senha, setSenha] = useState('123456');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert('Erro', 'Preencha email e senha');
      return;
    }

    setLoading(true);

    // Simular chamada API (300ms delay)
    setTimeout(() => {
      // Buscar usuário no mock
      const user = mockUsers.find((u) => u.email === email);

      if (user) {
        setCurrentUser(user);
        setLoading(false);
        navigation.replace('Main');
      } else {
        setLoading(false);
        Alert.alert('Erro', 'Credenciais inválidas');
      }
    }, 300);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoIcon}>📦</Text>
          <Text style={styles.logoText}>Almoxarifado</Text>
          <Text style={styles.logoSubtext}>Controle de Inventário</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="seu@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={styles.input}
            placeholder="Sua senha"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Text>
          </TouchableOpacity>

          {/* Usuários de teste */}
          <View style={styles.testUsers}>
            <Text style={styles.testUsersTitle}>Usuários de teste:</Text>
            <Text style={styles.testUser}>
              📧 thiago@obra.com (Funcionário)
            </Text>
            <Text style={styles.testUser}>
              📧 fabricio@obra.com (Funcionário)
            </Text>
            <Text style={styles.testUser}>
              📧 carlos@almoxarifado.com (Almoxarife)
            </Text>
            <Text style={styles.testUser}>📧 maria@gestao.com (Gestor)</Text>
            <Text style={styles.testUserPassword}>🔑 Senha: 123456</Text>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoIcon: {
    fontSize: 64,
    marginBottom: 8,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  logoSubtext: {
    fontSize: 16,
    color: '#6B7280',
  },
  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#93C5FD',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  testUsers: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  testUsersTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  testUser: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  testUserPassword: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    fontWeight: '600',
  },
});
