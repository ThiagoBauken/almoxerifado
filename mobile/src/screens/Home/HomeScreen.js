import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {
  currentUser,
  mockEstatisticas,
  mockItens,
  mockHistorico,
  ITEM_STATES,
} from '../../data/mockData';

export default function HomeScreen({ navigation }) {
  const [refreshing, setRefreshing] = React.useState(false);
  const user = currentUser;

  // Itens do usuário logado
  const meusItens = mockItens.filter(
    (item) => item.funcionario_id === user.id
  );
  const itensPendentes = mockItens.filter(
    (item) =>
      item.estado === ITEM_STATES.PENDENTE_ACEITACAO &&
      item.transferencia_pendente?.para_usuario_id === user.id
  );

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simular sincronização
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá, {user.nome.split(' ')[0]}! 👋</Text>
          <Text style={styles.subgreeting}>Bem-vindo de volta</Text>
        </View>
        <View style={styles.syncBadge}>
          <View style={styles.syncDot} />
          <Text style={styles.syncText}>Online</Text>
        </View>
      </View>

      {/* Alertas importantes */}
      {itensPendentes.length > 0 && (
        <TouchableOpacity
          style={styles.alertCard}
          onPress={() => navigation.navigate('History')}
        >
          <View style={styles.alertIcon}>
            <Text style={styles.alertIconText}>⚠️</Text>
          </View>
          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>
              {itensPendentes.length}{' '}
              {itensPendentes.length === 1
                ? 'transferência pendente'
                : 'transferências pendentes'}
            </Text>
            <Text style={styles.alertSubtitle}>
              Você tem itens aguardando aceitação
            </Text>
          </View>
          <Text style={styles.alertArrow}>›</Text>
        </TouchableOpacity>
      )}

      {/* Cards de estatísticas */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Resumo</Text>

        <View style={styles.statsGrid}>
          <View style={[styles.statCard, styles.statCardBlue]}>
            <Text style={styles.statValue}>
              {mockEstatisticas.itens_disponiveis}
            </Text>
            <Text style={styles.statLabel}>Disponíveis</Text>
            <Text style={styles.statIcon}>📦</Text>
          </View>

          <View style={[styles.statCard, styles.statCardGreen]}>
            <Text style={styles.statValue}>
              {mockEstatisticas.itens_em_uso}
            </Text>
            <Text style={styles.statLabel}>Em uso</Text>
            <Text style={styles.statIcon}>✅</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={[styles.statCard, styles.statCardYellow]}>
            <Text style={styles.statValue}>
              {mockEstatisticas.itens_em_manutencao}
            </Text>
            <Text style={styles.statLabel}>Manutenção</Text>
            <Text style={styles.statIcon}>🔧</Text>
          </View>

          <View style={[styles.statCard, styles.statCardRed]}>
            <Text style={styles.statValue}>
              {mockEstatisticas.itens_pendentes}
            </Text>
            <Text style={styles.statLabel}>Pendentes</Text>
            <Text style={styles.statIcon}>⏳</Text>
          </View>
        </View>
      </View>

      {/* Meus itens */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Meus Itens</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Items')}>
            <Text style={styles.sectionLink}>Ver todos ›</Text>
          </TouchableOpacity>
        </View>

        {meusItens.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>
              Você não tem nenhum item no momento
            </Text>
          </View>
        ) : (
          <View>
            {meusItens.slice(0, 3).map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.itemCard}
                onPress={() =>
                  navigation.navigate('ItemDetail', { itemId: item.id })
                }
              >
                <Text style={styles.itemIcon}>📦</Text>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.nome}</Text>
                  <Text style={styles.itemLacre}>Lacre: {item.lacre}</Text>
                </View>
                <Text style={styles.itemArrow}>›</Text>
              </TouchableOpacity>
            ))}
            {meusItens.length > 3 && (
              <Text style={styles.moreItems}>
                +{meusItens.length - 3} itens
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Ações rápidas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ações Rápidas</Text>

        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('QRScanner')}
          >
            <Text style={styles.actionIcon}>📷</Text>
            <Text style={styles.actionText}>Escanear QR</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('TransferSelectItems')}
          >
            <Text style={styles.actionIcon}>📤</Text>
            <Text style={styles.actionText}>Transferir</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Items')}
          >
            <Text style={styles.actionIcon}>📋</Text>
            <Text style={styles.actionText}>Ver Itens</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('History')}
          >
            <Text style={styles.actionIcon}>📊</Text>
            <Text style={styles.actionText}>Histórico</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Últimas movimentações */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Últimas Movimentações</Text>
          <TouchableOpacity onPress={() => navigation.navigate('History')}>
            <Text style={styles.sectionLink}>Ver todas ›</Text>
          </TouchableOpacity>
        </View>

        {mockHistorico.slice(0, 3).map((mov) => {
          const item = mockItens.find((i) => i.id === mov.item_id);
          return (
            <View key={mov.id} style={styles.movCard}>
              <View style={styles.movIcon}>
                <Text>{mov.tipo === 'transferencia' ? '🔄' : '🔧'}</Text>
              </View>
              <View style={styles.movInfo}>
                <Text style={styles.movItemName}>{item?.nome}</Text>
                <Text style={styles.movDetails}>
                  {mov.de_localizacao} → {mov.para_localizacao}
                </Text>
                <Text style={styles.movDate}>
                  {new Date(mov.data_envio).toLocaleDateString('pt-BR')}
                </Text>
              </View>
              <View
                style={[
                  styles.movStatusBadge,
                  mov.status === 'concluida' && styles.movStatusConcluida,
                  mov.status === 'pendente' && styles.movStatusPendente,
                ]}
              >
                <Text style={styles.movStatusText}>
                  {mov.status === 'concluida' ? '✓' : '⏳'}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
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
    padding: 24,
    paddingTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subgreeting: {
    fontSize: 14,
    color: '#BFDBFE',
  },
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  syncDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  syncText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  alertCard: {
    backgroundColor: '#FEF3C7',
    marginHorizontal: 16,
    marginTop: -24,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  alertIconText: {
    fontSize: 20,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 2,
  },
  alertSubtitle: {
    fontSize: 12,
    color: '#78350F',
  },
  alertArrow: {
    fontSize: 24,
    color: '#D97706',
  },
  statsSection: {
    padding: 16,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  sectionLink: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statCardBlue: {
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  statCardGreen: {
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  statCardYellow: {
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  statCardRed: {
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  statIcon: {
    fontSize: 20,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  itemIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  itemLacre: {
    fontSize: 12,
    color: '#6B7280',
  },
  itemArrow: {
    fontSize: 24,
    color: '#9CA3AF',
  },
  moreItems: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 12,
    marginTop: 8,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    textAlign: 'center',
  },
  movCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  movIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  movInfo: {
    flex: 1,
  },
  movItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  movDetails: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  movDate: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  movStatusBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  movStatusConcluida: {
    backgroundColor: '#D1FAE5',
  },
  movStatusPendente: {
    backgroundColor: '#FEF3C7',
  },
  movStatusText: {
    fontSize: 16,
  },
});
