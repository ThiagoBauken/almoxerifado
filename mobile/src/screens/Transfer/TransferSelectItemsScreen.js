import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import {
  mockItens,
  mockCategorias,
  mockUsers,
  currentUser,
  ITEM_STATES,
} from '../../data/mockData';

export default function TransferSelectItemsScreen({ route, navigation }) {
  const preselectedItems = route.params?.preselectedItems || [];
  const [selectedItems, setSelectedItems] = useState(preselectedItems);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState(null);

  // Itens que o usuário atual pode transferir
  const availableItems = mockItens.filter((item) => {
    // Pode transferir se:
    // 1. Item está disponível no estoque (almoxarife/gestor)
    // 2. Item está com o usuário logado (funcionário)
    const canTransfer =
      (item.estado === ITEM_STATES.DISPONIVEL_ESTOQUE &&
        (currentUser.perfil === 'almoxarife' ||
          currentUser.perfil === 'gestor' ||
          currentUser.perfil === 'admin')) ||
      (item.estado === ITEM_STATES.COM_FUNCIONARIO &&
        item.funcionario_id === currentUser.id);

    return canTransfer;
  });

  // Filtrar por busca
  const filteredItems = availableItems.filter((item) => {
    const matchesSearch =
      item.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.lacre.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Destinatários possíveis (exceto o próprio usuário)
  const possibleRecipients = mockUsers.filter((u) => u.id !== currentUser.id);

  const toggleItemSelection = (itemId) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter((id) => id !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  const handleContinue = () => {
    if (selectedItems.length === 0) {
      Alert.alert('Erro', 'Selecione pelo menos um item');
      return;
    }

    if (!selectedRecipient) {
      Alert.alert('Erro', 'Selecione um destinatário');
      return;
    }

    // Ir para tela de gerar QR code
    navigation.navigate('TransferGenerateQR', {
      itemIds: selectedItems,
      recipientId: selectedRecipient,
    });
  };

  const renderItem = ({ item }) => {
    const isSelected = selectedItems.includes(item.id);
    const categoria = mockCategorias.find((c) => c.id === item.categoria_id);

    return (
      <TouchableOpacity
        style={[styles.itemCard, isSelected && styles.itemCardSelected]}
        onPress={() => toggleItemSelection(item.id)}
      >
        <View style={styles.checkbox}>
          {isSelected && <View style={styles.checkboxChecked} />}
        </View>

        <Text style={styles.itemIcon}>{categoria?.icone || '📦'}</Text>

        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.nome}</Text>
          <Text style={styles.itemLacre}>Lacre: {item.lacre}</Text>
        </View>

        {isSelected && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Nova Transferência</Text>
          <Text style={styles.headerSubtitle}>
            {selectedItems.length}{' '}
            {selectedItems.length === 1 ? 'item selecionado' : 'itens selecionados'}
          </Text>
        </View>
      </View>

      {/* Busca */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar itens..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Seleção de destinatário */}
      <View style={styles.recipientSection}>
        <Text style={styles.recipientLabel}>Enviar para:</Text>
        <View style={styles.recipientChips}>
          {possibleRecipients.map((user) => (
            <TouchableOpacity
              key={user.id}
              style={[
                styles.recipientChip,
                selectedRecipient === user.id && styles.recipientChipSelected,
              ]}
              onPress={() => setSelectedRecipient(user.id)}
            >
              <Text
                style={[
                  styles.recipientChipText,
                  selectedRecipient === user.id &&
                    styles.recipientChipTextSelected,
                ]}
              >
                {user.nome.split(' ')[0]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Lista de itens */}
      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyText}>
              Nenhum item disponível para transferir
            </Text>
          </View>
        }
      />

      {/* Botão de continuar */}
      {selectedItems.length > 0 && selectedRecipient && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
          >
            <Text style={styles.continueButtonText}>
              Continuar ({selectedItems.length}{' '}
              {selectedItems.length === 1 ? 'item' : 'itens'})
            </Text>
          </TouchableOpacity>
        </View>
      )}
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  backButtonText: {
    fontSize: 32,
    color: '#FFFFFF',
    marginTop: -4,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#BFDBFE',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginBottom: 0,
    paddingHorizontal: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
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
  recipientSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  recipientLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  recipientChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  recipientChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  recipientChipSelected: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  recipientChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  recipientChipTextSelected: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  itemCardSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#2563EB',
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
  checkmark: {
    fontSize: 24,
    color: '#2563EB',
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
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  footer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 5,
  },
  continueButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
