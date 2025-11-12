import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { Camera } from 'expo-camera';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { mockItens } from '../../data/mockData';

const { width } = Dimensions.get('window');
const SCAN_AREA_SIZE = width * 0.7;

export default function QRScannerScreen({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [flashOn, setFlashOn] = useState(false);

  useEffect(() => {
    requestCameraPermission();
  }, []);

  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);

    // Verificar se é um QR de item (lacre)
    const item = mockItens.find((i) => i.lacre === data || i.qr_code === data);

    if (item) {
      // É um item - mostrar detalhes
      Alert.alert(
        'Item Encontrado',
        `${item.nome}\nLacre: ${item.lacre}`,
        [
          {
            text: 'Ver Detalhes',
            onPress: () => {
              navigation.navigate('ItemDetail', { itemId: item.id });
            },
          },
          {
            text: 'Escanear Outro',
            onPress: () => setScanned(false),
          },
        ]
      );
      return;
    }

    // Verificar se é um QR de transferência
    try {
      const transferData = JSON.parse(data);
      if (transferData.type === 'transfer' && transferData.items) {
        // É uma transferência - ir para tela de recebimento
        navigation.navigate('TransferReceive', {
          transferData: transferData,
        });
        return;
      }
    } catch (e) {
      // Não é JSON válido
    }

    // QR Code não reconhecido
    Alert.alert(
      'QR Code não reconhecido',
      'Este QR Code não corresponde a nenhum item ou transferência do sistema.',
      [
        {
          text: 'Tentar Novamente',
          onPress: () => setScanned(false),
        },
      ]
    );
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Solicitando permissão da câmera...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          Sem acesso à câmera. Por favor, habilite nas configurações.
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={requestCameraPermission}
        >
          <Text style={styles.buttonText}>Solicitar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Câmera */}
      <Camera
        style={styles.camera}
        type={Camera.Constants.Type.back}
        flashMode={
          flashOn
            ? Camera.Constants.FlashMode.torch
            : Camera.Constants.FlashMode.off
        }
        barCodeScannerSettings={{
          barCodeTypes: [BarCodeScanner.Constants.BarCodeType.qr],
        }}
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        {/* Overlay escuro */}
        <View style={styles.overlay}>
          {/* Top */}
          <View style={styles.overlaySection} />

          {/* Middle - área de scan */}
          <View style={styles.middleRow}>
            <View style={styles.overlaySection} />
            <View style={styles.scanArea}>
              {/* Cantos do frame */}
              <View style={[styles.corner, styles.cornerTopLeft]} />
              <View style={[styles.corner, styles.cornerTopRight]} />
              <View style={[styles.corner, styles.cornerBottomLeft]} />
              <View style={[styles.corner, styles.cornerBottomRight]} />

              {/* Linha de scan animada */}
              {!scanned && <View style={styles.scanLine} />}
            </View>
            <View style={styles.overlaySection} />
          </View>

          {/* Bottom */}
          <View style={styles.overlaySection} />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Escanear QR Code</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Instruções */}
        <View style={styles.instructions}>
          <Text style={styles.instructionsText}>
            {scanned
              ? 'QR Code escaneado!'
              : 'Aponte a câmera para o QR Code'}
          </Text>
          <Text style={styles.instructionsSubtext}>
            {scanned ? 'Processando...' : 'Centralize na área marcada'}
          </Text>
        </View>

        {/* Controles na parte inferior */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setFlashOn(!flashOn)}
          >
            <Text style={styles.controlIcon}>{flashOn ? '🔦' : '🔦'}</Text>
            <Text style={styles.controlText}>Flash</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, styles.controlButtonPrimary]}
            onPress={() => setScanned(false)}
            disabled={!scanned}
          >
            <Text style={styles.controlIconLarge}>📷</Text>
            <Text style={styles.controlTextWhite}>
              {scanned ? 'Escanear Outro' : 'Escaneando...'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => navigation.navigate('Items')}
          >
            <Text style={styles.controlIcon}>📋</Text>
            <Text style={styles.controlText}>Itens</Text>
          </TouchableOpacity>
        </View>
      </Camera>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  overlaySection: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  middleRow: {
    flexDirection: 'row',
    height: SCAN_AREA_SIZE,
  },
  scanArea: {
    width: SCAN_AREA_SIZE,
    height: SCAN_AREA_SIZE,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#FFFFFF',
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  scanLine: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  instructions: {
    position: 'absolute',
    top: width * 0.15 + 120,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  instructionsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  instructionsSubtext: {
    fontSize: 14,
    color: '#E5E7EB',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 40,
    paddingHorizontal: 16,
  },
  controlButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    minWidth: 80,
  },
  controlButtonPrimary: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
  },
  controlIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  controlIconLarge: {
    fontSize: 32,
    marginBottom: 4,
  },
  controlText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  controlTextWhite: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  message: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  button: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
