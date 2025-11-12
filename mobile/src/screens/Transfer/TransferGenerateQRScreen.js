import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import {
  mockItens,
  mockUsers,
  currentUser,
} from '../../data/mockData';

export default function TransferGenerateQRScreen({ route, navigation }) {
  const { itemIds, recipientId } = route.params;
  const [transferSent, setTransferSent] = useState(false);

  const items = mockItens.filter((item) => itemIds.includes(item.id));
  const recipient = mockUsers.find((u) => u.id === recipientId);

  // Dados da transferência (serão codificados no QR)
  const transferData = {
    type: 'transfer',
    transferId: `TRANS-${Date.now()}`,
    from: {
      userId: currentUser.id,
      userName: currentUser.nome,
    },
    to: {
      userId: recipient.id,
      userName: recipient.nome,
    },
    items: items.map((item) => ({
      id: item.id,
      nome: item.nome,
      lacre: item.lacre,
    })),
    timestamp: new Date().toISOString(),
  };

  const qrData = JSON.stringify(transferData);

  const handleConfirmTransfer = () => {
    Alert.alert(
      'Confirmar Transferência',
      `Deseja confirmar o envio de ${items.length} ${items.length === 1 ? 'item' : 'itens'} para ${recipient.nome}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: () => {
            // Aqui normalmente salvaria no SQLite e marcaria como pendente
            setTransferSent(true);

            // Simular delay e voltar para home
            setTimeout(() => {
              Alert.alert(
                'Sucesso!',
                `Transferência criada!\n\n${recipient.nome} deve escanear o QR Code abaixo para aceitar os itens.`,
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      // Não volta para tela anterior, mantém aqui para mostrar o QR
                    },
                  },
                ]
              );
            }, 300);
          },
        },
      ]
    );
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancelar Transferência',
      'Deseja realmente cancelar esta transferência?',
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim, cancelar',
          style: 'destructive',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const handleFinish = () => {
    navigation.navigate('Main', { screen: 'Home' });
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleCancel}
          disabled={transferSent}
        >
          <Text style={styles.backButtonText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {transferSent ? 'QR Code Gerado' : 'Revisar Transferência'}
        </Text>
      </View>

      {/* Status */}
      {transferSent && (
        <View style={styles.successBanner}>
          <Text style={styles.successIcon}>✅</Text>
          <View style={styles.successContent}>
            <Text style={styles.successTitle}>Transferência Criada!</Text>
            <Text style={styles.successText}>
              {recipient.nome} deve escanear o QR Code abaixo
            </Text>
          </View>
        </View>
      )}

      {/* QR Code */}
      <View style={styles.qrSection}>
        <View style={styles.qrCodeContainer}>
          <QRCode value={qrData} size={250} />
        </View>
        <Text style={styles.qrHelp}>
          {transferSent
            ? `${recipient.nome} deve escanear este código para receber os itens`
            : 'Após confirmar, mostre este QR Code para o destinatário'}
        </Text>
      </View>

      {/* Informações da transferência */}
      <View style={styles.infoSection}>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>De:</Text>
          <Text style={styles.infoValue}>{currentUser.nome}</Text>
        </View>

        <View style={styles.arrow}>
          <Text style={styles.arrowIcon}>↓</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Para:</Text>
          <Text style={styles.infoValue}>{recipient.nome}</Text>
        </View>
      </View>

      {/* Lista de itens */}
      <View style={styles.itemsSection}>
        <Text style={styles.sectionTitle}>
          Itens ({items.length})
        </Text>
        {items.map((item) => (
          <View key={item.id} style={styles.itemCard}>
            <Text style={styles.itemIcon}>📦</Text>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.nome}</Text>
              <Text style={styles.itemLacre}>Lacre: {item.lacre}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Botões de ação */}
      <View style={styles.actionsSection}>
        {!transferSent ? (
          <>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleConfirmTransfer}
            >
              <Text style={styles.primaryButtonText}>
                ✓ Confirmar e Enviar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleCancel}
            >
              <Text style={styles.secondaryButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleFinish}
          >
            <Text style={styles.primaryButtonText}>Concluir</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Instruções */}
      {transferSent && (
        <View style={styles.instructionsSection}>
          <Text style={styles.instructionsTitle}>📝 Próximos passos:</Text>
          <Text style={styles.instructionText}>
            1. Mostre este QR Code para {recipient.nome.split(' ')[0]}
          </Text>
          <Text style={styles.instructionText}>
            2. {recipient.nome.split(' ')[0]} deve abrir o app e escanear o código
          </Text>
          <Text style={styles.instructionText}>
            3. {recipient.nome.split(' ')[0]} irá revisar e aceitar/rejeitar os itens
          </Text>
          <Text style={styles.instructionText}>
            4. A transferência será concluída quando {recipient.nome.split(' ')[0]} aceitar
          </Text>
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
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  successBanner: {
    backgroundColor: '#D1FAE5',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginTop: 8,
  },
  successIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  successContent: {
    flex: 1,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065F46',
    marginBottom: 2,
  },
  successText: {
    fontSize: 14,
    color: '#047857',
  },
  qrSection: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    padding: 32,
    marginTop: 8,
  },
  qrCodeContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 16,
  },
  qrHelp: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  infoSection: {
    backgroundColor: '#FFFFFF',
    marginTop: 8,
    padding: 24,
    alignItems: 'center',
  },
  infoCard: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  arrow: {
    marginVertical: 8,
  },
  arrowIcon: {
    fontSize: 32,
    color: '#2563EB',
  },
  itemsSection: {
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
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  itemIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  itemInfo: {
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
  actionsSection: {
    padding: 24,
  },
  primaryButton: {
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
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  secondaryButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
  },
  instructionsSection: {
    backgroundColor: '#FFFFFF',
    marginTop: 8,
    padding: 24,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  instructionText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  bottomPadding: {
    height: 32,
  },
});
