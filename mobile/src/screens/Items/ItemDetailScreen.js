import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import {
  mockItens,
  mockCategorias,
  mockUsers,
  mockObras,
  mockHistorico,
  ITEM_STATES,
  currentUser,
} from '../../data/mockData';

export default function ItemDetailScreen({ route, navigation }) {
  const { itemId } = route.params;
  const item = mockItens.find((i) => i.id === itemId);

  if (!item) {
    return (
      <View style={styles.container}>
        <Text>Item não encontrado</Text>
      </View>
    );
  }

  const categoria = mockCategorias.find((c) => c.id === item.categoria_id);
  const funcionario = item.funcionario_id
    ? mockUsers.find((u) => u.id === item.funcionario_id)
    : null;
  const obra = item.obra_id ? mockObras.find((o) => o.id === item.obra_id) : null;

  // Histórico do item
  const historicoItem = mockHistorico.filter((h) => h.item_id === item.id);

  const getStatusInfo = (estado) => {
    const statusMap = {
      [ITEM_STATES.DISPONIVEL_ESTOQUE]: {
        color: '#10B981',
        bg: '#D1FAE5',
        text: 'Disponível no Estoque',
        icon: '✅',
      },
      [ITEM_STATES.COM_FUNCIONARIO]: {
        color: '#3B82F6',
        bg: '#DBEAFE',
        text: 'Com Funcionário',
        icon: '👤',
      },
      [ITEM_STATES.EM_OBRA]: {
        color: '#8B5CF6',
        bg: '#E0E7FF',
        text: 'Em Obra',
        icon: '🏗️',
      },
      [ITEM_STATES.EM_MANUTENCAO]: {
        color: '#F59E0B',
        bg: '#FEF3C7',
        text: 'Em Manutenção',
        icon: '🔧',
      },
      [ITEM_STATES.PENDENTE_ACEITACAO]: {
        color: '#F97316',
        bg: '#FED7AA',
        text: 'Pendente de Aceitação',
        icon: '⏳',
      },
      [ITEM_STATES.INATIVO]: {
        color: '#6B7280',
        bg: '#F3F4F6',
        text: 'Inativo',
        icon: '❌',
      },
    };
    return statusMap[estado] || statusMap[ITEM_STATES.INATIVO];
  };

  const statusInfo = getStatusInfo(item.estado);

  const handleTransfer = () => {
    navigation.navigate('TransferSelectItems', { preselectedItems: [item.id] });
  };

  const canTransfer =
    item.estado === ITEM_STATES.DISPONIVEL_ESTOQUE ||
    (item.estado === ITEM_STATES.COM_FUNCIONARIO &&
      item.funcionario_id === currentUser.id);

  return (
    <ScrollView style={styles.container}>
      {/* Header com imagem */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.foto }} style={styles.image} />
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
      </View>

      {/* Informações principais */}
      <View style={styles.mainInfo}>
        <View style={styles.titleRow}>
          <Text style={styles.categoryIcon}>{categoria?.icone || '📦'}</Text>
          <View style={styles.titleTextContainer}>
            <Text style={styles.itemName}>{item.nome}</Text>
            <Text style={styles.categoryName}>{categoria?.nome}</Text>
          </View>
        </View>

        {/* Status Badge */}
        <View
          style={[styles.statusBadgeLarge, { backgroundColor: statusInfo.bg }]}
        >
          <Text style={styles.statusIcon}>{statusInfo.icon}</Text>
          <Text style={[styles.statusTextLarge, { color: statusInfo.color }]}>
            {statusInfo.text}
          </Text>
        </View>
      </View>

      {/* QR Code e Lacre */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Identificação</Text>
        <View style={styles.qrCodeCard}>
          <View style={styles.qrCodePlaceholder}>
            <Text style={styles.qrCodeIcon}>🔲</Text>
            <Text style={styles.qrCodeText}>QR Code</Text>
          </View>
          <View style={styles.lacreInfo}>
            <Text style={styles.lacreLabel}>Lacre/Selo</Text>
            <Text style={styles.lacreValue}>{item.lacre}</Text>
            <Text style={styles.lacreHelp}>
              Use o scanner para ler este código
            </Text>
          </View>
        </View>
      </View>

      {/* Localização */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Localização Atual</Text>

        {item.localizacao_tipo === 'estoque' && (
          <View style={styles.locationCard}>
            <Text style={styles.locationIcon}>📦</Text>
            <View style={styles.locationInfo}>
              <Text style={styles.locationTitle}>Estoque Principal</Text>
              <Text style={styles.locationSubtitle}>Almoxarifado</Text>
            </View>
          </View>
        )}

        {item.localizacao_tipo === 'funcionario' && funcionario && (
          <View style={styles.locationCard}>
            <Image
              source={{ uri: funcionario.foto }}
              style={styles.userAvatar}
            />
            <View style={styles.locationInfo}>
              <Text style={styles.locationTitle}>{funcionario.nome}</Text>
              <Text style={styles.locationSubtitle}>
                {funcionario.perfil === 'funcionario'
                  ? 'Funcionário'
                  : funcionario.perfil}
              </Text>
              {obra && (
                <Text style={styles.locationExtra}>🏗️ {obra.nome}</Text>
              )}
            </View>
          </View>
        )}

        {item.localizacao_tipo === 'obra' && obra && (
          <View style={styles.locationCard}>
            <Text style={styles.locationIcon}>🏗️</Text>
            <View style={styles.locationInfo}>
              <Text style={styles.locationTitle}>{obra.nome}</Text>
              <Text style={styles.locationSubtitle}>{obra.endereco}</Text>
            </View>
          </View>
        )}

        {item.localizacao_tipo === 'manutencao' && (
          <View style={styles.locationCard}>
            <Text style={styles.locationIcon}>🔧</Text>
            <View style={styles.locationInfo}>
              <Text style={styles.locationTitle}>Em Manutenção</Text>
              <Text style={styles.locationSubtitle}>
                Aguardando reparo ou inspeção
              </Text>
            </View>
          </View>
        )}

        {item.localizacao_tipo === 'em_transito' && (
          <View style={styles.locationCard}>
            <Text style={styles.locationIcon}>🚚</Text>
            <View style={styles.locationInfo}>
              <Text style={styles.locationTitle}>Em Trânsito</Text>
              {item.transferencia_pendente && (
                <Text style={styles.locationSubtitle}>
                  Aguardando aceitação
                </Text>
              )}
            </View>
          </View>
        )}
      </View>

      {/* Histórico de movimentações */}
      {historicoItem.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Histórico</Text>
          {historicoItem.map((mov) => (
            <View key={mov.id} style={styles.historyCard}>
              <View style={styles.historyIconContainer}>
                <Text style={styles.historyIcon}>
                  {mov.tipo === 'transferencia' ? '🔄' : '🔧'}
                </Text>
              </View>
              <View style={styles.historyInfo}>
                <Text style={styles.historyTitle}>
                  {mov.tipo === 'transferencia'
                    ? 'Transferência'
                    : 'Manutenção'}
                </Text>
                <Text style={styles.historyRoute}>
                  {mov.de_localizacao} → {mov.para_localizacao}
                </Text>
                <Text style={styles.historyDate}>
                  {new Date(mov.data_envio).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
              <View
                style={[
                  styles.historyStatus,
                  mov.status === 'concluida' && styles.historyStatusConcluida,
                  mov.status === 'pendente' && styles.historyStatusPendente,
                ]}
              >
                <Text style={styles.historyStatusText}>
                  {mov.status === 'concluida' ? '✓' : '⏳'}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Ações */}
      {canTransfer && (
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleTransfer}
          >
            <Text style={styles.primaryButtonText}>📤 Transferir Item</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  imageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: '#E5E7EB',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  backButtonText: {
    fontSize: 32,
    color: '#1F2937',
    marginTop: -4,
  },
  mainInfo: {
    backgroundColor: '#FFFFFF',
    padding: 24,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  categoryIcon: {
    fontSize: 48,
    marginRight: 16,
  },
  titleTextContainer: {
    flex: 1,
  },
  itemName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusBadgeLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  statusIcon: {
    fontSize: 20,
  },
  statusTextLarge: {
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 8,
    padding: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  qrCodeCard: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  qrCodePlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  qrCodeIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  qrCodeText: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  lacreInfo: {
    flex: 1,
  },
  lacreLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  lacreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  lacreHelp: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  locationIcon: {
    fontSize: 40,
    marginRight: 16,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
  },
  locationInfo: {
    flex: 1,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  locationSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  locationExtra: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  historyIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  historyIcon: {
    fontSize: 20,
  },
  historyInfo: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  historyRoute: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  historyDate: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  historyStatus: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyStatusConcluida: {
    backgroundColor: '#D1FAE5',
  },
  historyStatusPendente: {
    backgroundColor: '#FEF3C7',
  },
  historyStatusText: {
    fontSize: 14,
  },
  actionsSection: {
    padding: 24,
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 32,
  },
});
