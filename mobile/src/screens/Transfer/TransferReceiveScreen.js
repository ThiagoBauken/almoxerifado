import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { currentUser, mockUsers } from '../../data/mockData';

export default function TransferReceiveScreen({ route, navigation }) {
  const { transferData } = route.params;

  // Estado de aceitação para cada item (aceito, rejeitado, null = pendente)
  const [itemsDecision, setItemsDecision] = useState(
    transferData.items.reduce((acc, item) => {
      acc[item.id] = null; // null = pendente, true = aceito, false = rejeitado
      return acc;
    }, {})
  );

  const sender = mockUsers.find((u) => u.id === transferData.from.userId);

  const allItemsDecided = Object.values(itemsDecision).every(
    (decision) => decision !== null
  );

  const acceptedItems = Object.entries(itemsDecision).filter(
    ([_, decision]) => decision === true
  );
  const rejectedItems = Object.entries(itemsDecision).filter(
    ([_, decision]) => decision === false
  );

  const toggleItemDecision = (itemId) => {
    setItemsDecision((prev) => {
      const current = prev[itemId];
      return {
        ...prev,
        [itemId]: current === null ? true : current === true ? false : null,
      };
    });
  };

  const handleConfirm = () => {
    if (!allItemsDecided) {
      Alert.alert(
        'Atenção',
        'Você precisa aceitar ou rejeitar todos os itens antes de confirmar.'
      );
      return;
    }

    const acceptedCount = acceptedItems.length;
    const rejectedCount = rejectedItems.length;

    let message = '';
    if (acceptedCount > 0 && rejectedCount === 0) {
      message = `Você aceitou todos os ${acceptedCount} itens.`;
    } else if (acceptedCount === 0 && rejectedCount > 0) {
      message = `Você rejeitou todos os ${rejectedCount} itens.`;
    } else {
      message = `Você aceitou ${acceptedCount} ${acceptedCount === 1 ? 'item' : 'itens'} e rejeitou ${rejectedCount}.`;
    }

    Alert.alert(
      'Confirmar Recebimento',
      `${message}\n\nDeseja confirmar?`,
      [
        { text: 'Revisar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: () => {
            // Aqui normalmente salvaria no SQLite e sincronizaria depois
            Alert.alert(
              'Sucesso!',
              'Recebimento confirmado!\n\nA transferência foi concluída.',
              [
                {
                  text: 'OK',
                  onPress: () => navigation.navigate('Main', { screen: 'Home' }),
                },
              ]
            );
          },
        },
      ]
    );
  };

  const getDecisionIcon = (decision) => {
    if (decision === null) return '⏳';
    if (decision === true) return '✅';
    if (decision === false) return '❌';
  };

  const getDecisionText = (decision) => {
    if (decision === null) return 'Pendente';
    if (decision === true) return 'Aceito';
    if (decision === false) return 'Rejeitado';
  };

  const getDecisionColor = (decision) => {
    if (decision === null) return '#F59E0B';
    if (decision === true) return '#10B981';
    if (decision === false) return '#EF4444';
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Receber Transferência</Text>
        <Text style={styles.headerSubtitle}>
          {transferData.items.length}{' '}
          {transferData.items.length === 1 ? 'item' : 'itens'}
        </Text>
      </View>

      {/* Informações do remetente */}
      <View style={styles.senderSection}>
        <Text style={styles.sectionTitle}>De:</Text>
        <View style={styles.senderCard}>
          <Image
            source={{ uri: sender?.foto || 'https://i.pravatar.cc/150?img=99' }}
            style={styles.senderAvatar}
          />
          <View style={styles.senderInfo}>
            <Text style={styles.senderName}>{transferData.from.userName}</Text>
            <Text style={styles.senderDate}>
              {new Date(transferData.timestamp).toLocaleString('pt-BR', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        </View>
      </View>

      {/* Instruções */}
      <View style={styles.instructionsCard}>
        <Text style={styles.instructionsIcon}>ℹ️</Text>
        <View style={styles.instructionsContent}>
          <Text style={styles.instructionsTitle}>Como funciona:</Text>
          <Text style={styles.instructionsText}>
            • Revise cada item{'\n'}
            • Toque para alternar: Aceitar → Rejeitar → Pendente{'\n'}
            • Aceite se o item está OK{'\n'}
            • Rejeite se houver algum problema
          </Text>
        </View>
      </View>

      {/* Lista de itens */}
      <View style={styles.itemsSection}>
        <Text style={styles.sectionTitle}>
          Itens para revisar ({transferData.items.length})
        </Text>

        {transferData.items.map((item) => {
          const decision = itemsDecision[item.id];
          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.itemCard,
                decision === true && styles.itemCardAccepted,
                decision === false && styles.itemCardRejected,
              ]}
              onPress={() => toggleItemDecision(item.id)}
            >
              <Text style={styles.itemIcon}>📦</Text>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.nome}</Text>
                <Text style={styles.itemLacre}>Lacre: {item.lacre}</Text>
              </View>
              <View
                style={[
                  styles.decisionBadge,
                  { backgroundColor: `${getDecisionColor(decision)}20` },
                ]}
              >
                <Text style={styles.decisionIcon}>
                  {getDecisionIcon(decision)}
                </Text>
                <Text
                  style={[
                    styles.decisionText,
                    { color: getDecisionColor(decision) },
                  ]}
                >
                  {getDecisionText(decision)}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Botões de ação rápida */}
      <View style={styles.quickActionsSection}>
        <Text style={styles.sectionTitle}>Ações Rápidas</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.quickActionButton, styles.acceptAllButton]}
            onPress={() => {
              const newDecisions = {};
              transferData.items.forEach((item) => {
                newDecisions[item.id] = true;
              });
              setItemsDecision(newDecisions);
            }}
          >
            <Text style={styles.quickActionIcon}>✅</Text>
            <Text style={styles.quickActionText}>Aceitar Todos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionButton, styles.rejectAllButton]}
            onPress={() => {
              const newDecisions = {};
              transferData.items.forEach((item) => {
                newDecisions[item.id] = false;
              });
              setItemsDecision(newDecisions);
            }}
          >
            <Text style={styles.quickActionIcon}>❌</Text>
            <Text style={styles.quickActionText}>Rejeitar Todos</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Resumo */}
      {(acceptedItems.length > 0 || rejectedItems.length > 0) && (
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Resumo</Text>
          {acceptedItems.length > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryIcon}>✅</Text>
              <Text style={styles.summaryText}>
                {acceptedItems.length}{' '}
                {acceptedItems.length === 1 ? 'item aceito' : 'itens aceitos'}
              </Text>
            </View>
          )}
          {rejectedItems.length > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryIcon}>❌</Text>
              <Text style={styles.summaryText}>
                {rejectedItems.length}{' '}
                {rejectedItems.length === 1 ? 'item rejeitado' : 'itens rejeitados'}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Botão de confirmar */}
      <View style={styles.actionsSection}>
        <TouchableOpacity
          style={[
            styles.confirmButton,
            !allItemsDecided && styles.confirmButtonDisabled,
          ]}
          onPress={handleConfirm}
          disabled={!allItemsDecided}
        >
          <Text style={styles.confirmButtonText}>
            {allItemsDecided ? '✓ Confirmar Recebimento' : '⏳ Revise todos os itens'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomPadding} />
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
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#BFDBFE',
  },
  senderSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
  },
  senderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },
  senderAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
  },
  senderInfo: {
    flex: 1,
  },
  senderName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  senderDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  instructionsCard: {
    backgroundColor: '#EFF6FF',
    flexDirection: 'row',
    padding: 16,
    marginTop: 8,
  },
  instructionsIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  instructionsContent: {
    flex: 1,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 13,
    color: '#3B82F6',
    lineHeight: 20,
  },
  itemsSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginTop: 8,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  itemCardAccepted: {
    borderColor: '#10B981',
    backgroundColor: '#D1FAE5',
  },
  itemCardRejected: {
    borderColor: '#EF4444',
    backgroundColor: '#FEE2E2',
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
  decisionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  decisionIcon: {
    fontSize: 16,
  },
  decisionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  quickActionsSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginTop: 8,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  acceptAllButton: {
    backgroundColor: '#D1FAE5',
  },
  rejectAllButton: {
    backgroundColor: '#FEE2E2',
  },
  quickActionIcon: {
    fontSize: 18,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  summarySection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginTop: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  summaryText: {
    fontSize: 16,
    color: '#1F2937',
  },
  actionsSection: {
    padding: 16,
  },
  confirmButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  confirmButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
  },
  bottomPadding: {
    height: 32,
  },
});
