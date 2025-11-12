import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {
  mockItens,
  mockCategorias,
  mockUsers,
  mockObras,
  ITEM_STATES,
} from '../../data/mockData';

export default function ItemsListScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  // Filtrar itens
  const filteredItens = mockItens.filter((item) => {
    const matchesSearch =
      item.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.lacre.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory
      ? item.categoria_id === selectedCategory
      : true;

    const matchesStatus = selectedStatus ? item.estado === selectedStatus : true;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Estados para filtro
  const statusOptions = [
    { value: null, label: 'Todos' },
    { value: ITEM_STATES.DISPONIVEL_ESTOQUE, label: 'Disponível' },
    { value: ITEM_STATES.COM_FUNCIONARIO, label: 'Com Funcionário' },
    { value: ITEM_STATES.EM_OBRA, label: 'Em Obra' },
    { value: ITEM_STATES.EM_MANUTENCAO, label: 'Manutenção' },
    { value: ITEM_STATES.PENDENTE_ACEITACAO, label: 'Pendente' },
  ];

  const getStatusBadge = (estado) => {
    const badges = {
      [ITEM_STATES.DISPONIVEL_ESTOQUE]: {
        bg: '#D1FAE5',
        color: '#065F46',
        text: 'Disponível',
      },
      [ITEM_STATES.COM_FUNCIONARIO]: {
        bg: '#DBEAFE',
        color: '#1E40AF',
        text: 'Com Funcionário',
      },
      [ITEM_STATES.EM_OBRA]: { bg: '#E0E7FF', color: '#3730A3', text: 'Em Obra' },
      [ITEM_STATES.EM_MANUTENCAO]: {
        bg: '#FEF3C7',
        color: '#92400E',
        text: 'Manutenção',
      },
      [ITEM_STATES.PENDENTE_ACEITACAO]: {
        bg: '#FED7AA',
        color: '#9A3412',
        text: 'Pendente',
      },
      [ITEM_STATES.INATIVO]: { bg: '#F3F4F6', color: '#4B5563', text: 'Inativo' },
    };
    return badges[estado] || badges[ITEM_STATES.INATIVO];
  };

  const getLocationInfo = (item) => {
    if (item.localizacao_tipo === 'estoque') {
      return '📦 Estoque Principal';
    } else if (item.localizacao_tipo === 'funcionario' && item.funcionario_id) {
      const func = mockUsers.find((u) => u.id === item.funcionario_id);
      return `👤 ${func?.nome || 'Funcionário'}`;
    } else if (item.localizacao_tipo === 'obra' && item.obra_id) {
      const obra = mockObras.find((o) => o.id === item.obra_id);
      return `🏗️ ${obra?.nome || 'Obra'}`;
    } else if (item.localizacao_tipo === 'em_transito') {
      return '🚚 Em trânsito';
    } else if (item.localizacao_tipo === 'manutencao') {
      return '🔧 Em manutenção';
    }
    return '❓ Localização desconhecida';
  };

  const renderItem = ({ item }) => {
    const categoria = mockCategorias.find((c) => c.id === item.categoria_id);
    const statusBadge = getStatusBadge(item.estado);
    const locationInfo = getLocationInfo(item);

    return (
      <TouchableOpacity
        style={styles.itemCard}
        onPress={() => navigation.navigate('ItemDetail', { itemId: item.id })}
      >
        <View style={styles.itemHeader}>
          <Text style={styles.itemIcon}>{categoria?.icone || '📦'}</Text>
          <View style={styles.itemHeaderInfo}>
            <Text style={styles.itemName}>{item.nome}</Text>
            <Text style={styles.itemLacre}>Lacre: {item.lacre}</Text>
          </View>
          <View
            style={[styles.statusBadge, { backgroundColor: statusBadge.bg }]}
          >
            <Text style={[styles.statusText, { color: statusBadge.color }]}>
              {statusBadge.text}
            </Text>
          </View>
        </View>

        <View style={styles.itemFooter}>
          <Text style={styles.itemLocation}>{locationInfo}</Text>
          <Text style={styles.itemArrow}>›</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Itens</Text>
        <Text style={styles.headerSubtitle}>
          {filteredItens.length} {filteredItens.length === 1 ? 'item' : 'itens'}
        </Text>
      </View>

      {/* Search */}
      <View style={styles.searchSection}>
        <View style={styles.searchInputContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nome ou lacre..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filtros */}
        <View style={styles.filtersContainer}>
          {/* Filtro de Status */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Status:</Text>
            <View style={styles.filterChips}>
              {statusOptions.slice(0, 4).map((option) => (
                <TouchableOpacity
                  key={option.label}
                  style={[
                    styles.filterChip,
                    selectedStatus === option.value && styles.filterChipActive,
                  ]}
                  onPress={() => setSelectedStatus(option.value)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedStatus === option.value &&
                        styles.filterChipTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Filtro de Categoria */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Categoria:</Text>
            <View style={styles.filterChips}>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  selectedCategory === null && styles.filterChipActive,
                ]}
                onPress={() => setSelectedCategory(null)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedCategory === null && styles.filterChipTextActive,
                  ]}
                >
                  Todas
                </Text>
              </TouchableOpacity>
              {mockCategorias.slice(0, 3).map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.filterChip,
                    selectedCategory === cat.id && styles.filterChipActive,
                  ]}
                  onPress={() => setSelectedCategory(cat.id)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedCategory === cat.id &&
                        styles.filterChipTextActive,
                    ]}
                  >
                    {cat.icone}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* Lista */}
      <FlatList
        data={filteredItens}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>Nenhum item encontrado</Text>
            <Text style={styles.emptySubtext}>
              Tente ajustar os filtros de busca
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
  searchSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  clearIcon: {
    fontSize: 16,
    color: '#9CA3AF',
    padding: 4,
  },
  filtersContainer: {
    gap: 12,
  },
  filterGroup: {
    gap: 8,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  filterChipText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
  },
  itemCard: {
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
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  itemIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  itemHeaderInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  itemLacre: {
    fontSize: 12,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  itemLocation: {
    fontSize: 13,
    color: '#6B7280',
  },
  itemArrow: {
    fontSize: 20,
    color: '#9CA3AF',
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
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
});
