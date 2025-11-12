import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {
  mockHistorico,
  mockItens,
  mockUsers,
  currentUser,
} from '../../data/mockData';

export default function HistoryScreen({ navigation }) {
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all'); // all, pendente, concluida

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  // Filtrar histórico pelo usuário e status
  const filteredHistory = mockHistorico.filter((mov) => {
    // Mostrar apenas movimentações relacionadas ao usuário atual
    const isRelated =
      mov.de_usuario_id === currentUser.id ||
      mov.para_usuario_id === currentUser.id;

    const matchesStatus =
      filterStatus === 'all' ||
      mov.status === filterStatus;

    return isRelated && matchesStatus;
  });

  const statusFilters = [
    { value: 'all', label: 'Todas', count: mockHistorico.length },
    {
      value: 'pendente',
      label: 'Pendentes',
      count: mockHistorico.filter((m) => m.status === 'pendente').length,
    },
    {
      value: 'concluida',
      label: 'Concluídas',
      count: mockHistorico.filter((m) => m.status === 'concluida').length,
    },
  ];

  const getStatusBadge = (status) => {
    const badges = {
      pendente: {
        bg: '#FEF3C7',
        color: '#92400E',
        text: 'Pendente',
        icon: '⏳',
      },
      concluida: {
        bg: '#D1FAE5',
        color: '#065F46',
        text: 'Concluída',
        icon: '✅',
      },
      cancelada: {
        bg: '#FEE2E2',
        color: '#991B1B',
        text: 'Cancelada',
        icon: '❌',
      },
      em_andamento: {
        bg: '#DBEAFE',
        color: '#1E40AF',
        text: 'Em Andamento',
        icon: '🔄',
      },
    };
    return badges[status] || badges.pendente;
  };

  const renderItem = ({ item: movimento }) => {
    const itemData = mockItens.find((i) => i.id === movimento.item_id);
    const deUsuario = mockUsers.find((u) => u.id === movimento.de_usuario_id);
    const paraUsuario = mockUsers.find((u) => u.id === movimento.para_usuario_id);
    const statusBadge = getStatusBadge(movimento.status);

    const isReceiving = movimento.para_usuario_id === currentUser.id;
    const isSending = movimento.de_usuario_id === currentUser.id;

    return (
      <TouchableOpacity
        style={styles.movementCard}
        onPress={() => {
          // Poderia navegar para detalhes da movimentação
        }}
      >
        {/* Header */}
        <View style={styles.movementHeader}>
          <View style={styles.movementTypeContainer}>
            <Text style={styles.movementIcon}>
              {movimento.tipo === 'transferencia' ? '🔄' : '🔧'}
            </Text>
            <View>
              <Text style={styles.movementType}>
                {movimento.tipo === 'transferencia'
                  ? 'Transferência'
                  : movimento.tipo === 'manutencao'
                  ? 'Manutenção'
                  : 'Movimentação'}
              </Text>
              <Text style={styles.movementDate}>
                {new Date(movimento.data_envio).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusBadge.bg },
            ]}
          >
            <Text style={styles.statusIcon}>{statusBadge.icon}</Text>
            <Text
              style={[styles.statusText, { color: statusBadge.color }]}
            >
              {statusBadge.text}
            </Text>
          </View>
        </View>

        {/* Item */}
        <View style={styles.itemInfo}>
          <Text style={styles.itemIcon}>📦</Text>
          <View style={styles.itemTextContainer}>
            <Text style={styles.itemName}>{itemData?.nome}</Text>
            <Text style={styles.itemLacre}>Lacre: {itemData?.lacre}</Text>
          </View>
        </View>

        {/* Rota */}
        <View style={styles.routeContainer}>
          <View style={styles.routePoint}>
            <View
              style={[
                styles.routeDot,
                isSending && styles.routeDotHighlight,
              ]}
            />
            <Text
              style={[
                styles.routeLabel,
                isSending && styles.routeLabelBold,
              ]}
            >
              {movimento.de_localizacao}
            </Text>
          </View>

          <View style={styles.routeArrow}>
            <Text style={styles.routeArrowText}>→</Text>
          </View>

          <View style={styles.routePoint}>
            <View
              style={[
                styles.routeDot,
                isReceiving && styles.routeDotHighlight,
              ]}
            />
            <Text
              style={[
                styles.routeLabel,
                isReceiving && styles.routeLabelBold,
              ]}
            >
              {movimento.para_localizacao}
            </Text>
          </View>
        </View>

        {/* Ações para pendentes */}
        {movimento.status === 'pendente' && isReceiving && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
            >
              <Text style={styles.actionButtonText}>✓ Aceitar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
            >
              <Text style={styles.actionButtonText}>✕ Rejeitar</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Histórico</Text>
        <Text style={styles.headerSubtitle}>
          {filteredHistory.length}{' '}
          {filteredHistory.length === 1 ? 'movimentação' : 'movimentações'}
        </Text>
      </View>

      {/* Filtros */}
      <View style={styles.filtersContainer}>
        {statusFilters.map((filter) => (
          <TouchableOpacity
            key={filter.value}
            style={[
              styles.filterChip,
              filterStatus === filter.value && styles.filterChipActive,
            ]}
            onPress={() => setFilterStatus(filter.value)}
          >
            <Text
              style={[
                styles.filterChipText,
                filterStatus === filter.value && styles.filterChipTextActive,
              ]}
            >
              {filter.label}
            </Text>
            <View
              style={[
                styles.filterChipBadge,
                filterStatus === filter.value && styles.filterChipBadgeActive,
              ]}
            >
              <Text
                style={[
                  styles.filterChipBadgeText,
                  filterStatus === filter.value &&
                    styles.filterChipBadgeTextActive,
                ]}
              >
                {filter.count}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lista */}
      <FlatList
        data={filteredHistory}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>Nenhuma movimentação encontrada</Text>
            <Text style={styles.emptySubtext}>
              {filterStatus === 'pendente'
                ? 'Você não tem transferências pendentes'
                : 'Suas movimentações aparecerão aqui'}
            </Text>
          </View>
        }
      />
    </View>
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
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#BFDBFE',
  },
  filtersContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  filterChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  filterChipBadge: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 24,
    alignItems: 'center',
  },
  filterChipBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  filterChipBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
  },
  filterChipBadgeTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
  },
  movementCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  movementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  movementTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  movementIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  movementType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  movementDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusIcon: {
    fontSize: 14,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  itemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  itemIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 2,
  },
  itemLacre: {
    fontSize: 12,
    color: '#6B7280',
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  routePoint: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
    marginRight: 8,
  },
  routeDotHighlight: {
    backgroundColor: '#2563EB',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  routeLabel: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
  },
  routeLabelBold: {
    fontWeight: '600',
    color: '#1F2937',
  },
  routeArrow: {
    paddingHorizontal: 8,
  },
  routeArrowText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#D1FAE5',
  },
  rejectButton: {
    backgroundColor: '#FEE2E2',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
