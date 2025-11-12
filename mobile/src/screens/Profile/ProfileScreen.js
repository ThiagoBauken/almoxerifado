import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { currentUser, mockObras } from '../../data/mockData';

export default function ProfileScreen({ navigation }) {
  const user = currentUser;
  const obraUsuario = mockObras.find((o) => o.id === user.obra_id);

  const handleLogout = () => {
    Alert.alert('Sair', 'Deseja realmente sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: () => navigation.replace('Login'),
      },
    ]);
  };

  const perfis = {
    funcionario: 'Funcionário',
    almoxarife: 'Almoxarife',
    gestor: 'Gestor',
    admin: 'Administrador',
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={{ uri: user.foto }} style={styles.foto} />
        <Text style={styles.nome}>{user.nome}</Text>
        <Text style={styles.perfil}>{perfis[user.perfil]}</Text>
      </View>

      {/* Informações */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informações</Text>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>{user.email}</Text>
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Perfil</Text>
          <Text style={styles.infoValue}>{perfis[user.perfil]}</Text>
        </View>

        {obraUsuario && (
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Obra Atual</Text>
            <Text style={styles.infoValue}>{obraUsuario.nome}</Text>
          </View>
        )}
      </View>

      {/* Estatísticas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Minhas Estatísticas</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Itens em uso</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>45</Text>
            <Text style={styles.statLabel}>Movimentações</Text>
          </View>
        </View>
      </View>

      {/* Ações */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>🔔 Notificações</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>⚙️ Configurações</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>❓ Ajuda</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, styles.logoutItem]}
          onPress={handleLogout}
        >
          <Text style={[styles.menuItemText, styles.logoutText]}>
            🚪 Sair
          </Text>
        </TouchableOpacity>
      </View>

      {/* Versão */}
      <Text style={styles.version}>Versão 1.0.0 (MVP)</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    backgroundColor: '#2563EB',
    padding: 32,
    alignItems: 'center',
    paddingTop: 60,
  },
  foto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    marginBottom: 16,
  },
  nome: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  perfil: {
    fontSize: 16,
    color: '#BFDBFE',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  infoItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#1F2937',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2563EB',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  menuItemText: {
    fontSize: 16,
    color: '#1F2937',
  },
  menuItemArrow: {
    fontSize: 24,
    color: '#9CA3AF',
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  logoutText: {
    color: '#DC2626',
  },
  version: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 12,
    padding: 24,
  },
});
