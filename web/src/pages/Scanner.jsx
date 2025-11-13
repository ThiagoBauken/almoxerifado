import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';

export default function Scanner() {
  const { user: currentUser } = useAuth();
  const [scanning, setScanning] = useState(true);
  const [qrData, setQrData] = useState(null);
  const [destinationUser, setDestinationUser] = useState(null);
  const [senderUser, setSenderUser] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const scannerRef = useRef(null);
  const scannerInitialized = useRef(false);

  useEffect(() => {
    // Initialize QR Scanner
    if (scanning && !scannerInitialized.current) {
      scannerInitialized.current = true;

      const scanner = new Html5QrcodeScanner(
        'qr-reader',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          showTorchButtonIfSupported: true,
        },
        false
      );

      scanner.render(onScanSuccess, onScanError);
      scannerRef.current = scanner;
    }

    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.clear();
        } catch (err) {
          console.debug('Scanner cleanup:', err.message);
        }
      }
    };
  }, [scanning]);

  const onScanSuccess = async (decodedText, decodedResult) => {
    try {
      console.log('QR Code scanned:', decodedText);

      // Parse QR Code data
      const parsedData = JSON.parse(decodedText);

      // Validate QR Code structure
      if (!parsedData.type || parsedData.type !== 'transfer') {
        setError('QR Code inválido: não é um código de transferência');
        return;
      }

      if (!parsedData.item_ids || !Array.isArray(parsedData.item_ids)) {
        setError('QR Code inválido: dados de itens ausentes');
        return;
      }

      if (!parsedData.para_usuario_id || !parsedData.de_usuario_id) {
        setError('QR Code inválido: dados de usuários ausentes');
        return;
      }

      // CRITICAL SECURITY CHECK: Verify current user is the recipient
      if (currentUser.id !== parsedData.para_usuario_id) {
        // Fetch destination user name to show in error
        try {
          const destUserRes = await api.get(`/users/${parsedData.para_usuario_id}`);
          const destUserName = destUserRes.data.data.nome;
          setError(`Esta transferência não é para você! Destinatário: ${destUserName}`);
        } catch (err) {
          setError('Esta transferência não é para você! Destinatário desconhecido.');
        }
        setScanning(false);
        if (scannerRef.current) {
          scannerRef.current.clear();
        }
        return;
      }

      // Valid transfer for this user - load details
      setQrData(parsedData);
      setScanning(false);

      if (scannerRef.current) {
        scannerRef.current.clear();
      }

      // Load user and item details
      await loadTransferDetails(parsedData);

    } catch (err) {
      console.error('Error parsing QR Code:', err);
      setError('QR Code inválido ou corrompido. Por favor, tente novamente.');
    }
  };

  const onScanError = (error) => {
    // Ignore frequent scanning errors
    console.debug('Scan error:', error);
  };

  const loadTransferDetails = async (data) => {
    setLoading(true);
    try {
      // Fetch destination user (current user)
      const destUserRes = await api.get(`/users/${data.para_usuario_id}`);
      setDestinationUser(destUserRes.data.data);

      // Fetch sender user
      const senderUserRes = await api.get(`/users/${data.de_usuario_id}`);
      setSenderUser(senderUserRes.data.data);

      // Fetch items
      const itemsPromises = data.item_ids.map(id =>
        api.get(`/items/${id}`).catch(err => {
          console.error(`Failed to fetch item ${id}:`, err);
          return null;
        })
      );

      const itemsResponses = await Promise.all(itemsPromises);
      const fetchedItems = itemsResponses
        .filter(res => res !== null)
        .map(res => res.data.data);

      setItems(fetchedItems);
    } catch (err) {
      console.error('Error loading transfer details:', err);
      setError('Erro ao carregar detalhes da transferência');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptTransfer = async () => {
    if (!qrData || !currentUser) return;

    setLoading(true);
    setError(null);

    try {
      // Call batch transfer API
      const response = await api.post('/transfers/batch', {
        item_ids: qrData.item_ids,
        de_usuario_id: qrData.de_usuario_id,
        para_usuario_id: qrData.para_usuario_id,
        observacoes: qrData.observacoes || '',
      });

      if (response.data.success) {
        setSuccess(true);
        toast.success(`Transferência aceita com sucesso! ${qrData.item_ids.length} item(ns) recebido(s).`);
      } else {
        setError('Erro ao processar transferência');
      }
    } catch (err) {
      console.error('Error accepting transfer:', err);
      setError(err.response?.data?.message || 'Erro ao aceitar transferência');
      toast.error('Erro ao aceitar transferência');
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    setScanning(true);
    setQrData(null);
    setDestinationUser(null);
    setSenderUser(null);
    setItems([]);
    setError(null);
    setSuccess(false);
    scannerInitialized.current = false;
  };

  return (
    <Layout>
      <div style={{ padding: '2rem' }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          color: '#1f2937',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}>
          📷 Escanear QR Code
        </h1>

        {/* Success State */}
        {success && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            padding: '2rem',
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: '4rem',
              marginBottom: '1rem',
            }}>
              ✅
            </div>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#059669',
              marginBottom: '1rem',
            }}>
              Transferência Aceita com Sucesso!
            </h2>
            <p style={{
              color: '#6b7280',
              marginBottom: '2rem',
            }}>
              Você recebeu {qrData?.item_ids.length} item(ns) de {senderUser?.nome}.
            </p>
            <button
              onClick={resetScanner}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500',
              }}
            >
              Escanear Novo QR Code
            </button>
          </div>
        )}

        {/* Error State */}
        {error && !success && (
          <div style={{
            backgroundColor: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1rem',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#991b1b',
              fontWeight: '500',
            }}>
              <span style={{ fontSize: '1.25rem' }}>⚠️</span>
              {error}
            </div>
            {!scanning && (
              <button
                onClick={resetScanner}
                style={{
                  marginTop: '1rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                }}
              >
                Tentar Novamente
              </button>
            )}
          </div>
        )}

        {/* Scanner View */}
        {scanning && !success && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            padding: '2rem',
          }}>
            <div style={{
              marginBottom: '1.5rem',
              padding: '1rem',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '6px',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#1e40af',
                fontSize: '0.875rem',
              }}>
                <span style={{ fontSize: '1.25rem' }}>ℹ️</span>
                <div>
                  <strong>Como usar:</strong>
                  <p style={{ margin: '0.5rem 0 0 0', color: '#3b82f6' }}>
                    Aponte a câmera para o QR Code da transferência. O escaneamento é automático.
                  </p>
                </div>
              </div>
            </div>

            <div
              id="qr-reader"
              style={{
                width: '100%',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                overflow: 'hidden',
              }}
            />
          </div>
        )}

        {/* Confirmation View */}
        {!scanning && qrData && !success && !error && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            padding: '2rem',
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '1.5rem',
            }}>
              Confirmar Transferência
            </h2>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                Carregando detalhes...
              </div>
            ) : (
              <>
                {/* Transfer Info */}
                <div style={{
                  padding: '1.5rem',
                  backgroundColor: '#f9fafb',
                  borderRadius: '6px',
                  marginBottom: '1.5rem',
                  border: '1px solid #e5e7eb',
                }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{
                      fontSize: '0.875rem',
                      color: '#6b7280',
                      marginBottom: '0.25rem',
                    }}>
                      De (Remetente):
                    </div>
                    <div style={{
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      color: '#1f2937',
                    }}>
                      {senderUser?.nome || 'Carregando...'}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      {senderUser?.email}
                    </div>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{
                      fontSize: '0.875rem',
                      color: '#6b7280',
                      marginBottom: '0.25rem',
                    }}>
                      Para (Destinatário):
                    </div>
                    <div style={{
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      color: '#2563eb',
                    }}>
                      {destinationUser?.nome || 'Você'} (Você)
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      {destinationUser?.email}
                    </div>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{
                      fontSize: '0.875rem',
                      color: '#6b7280',
                      marginBottom: '0.25rem',
                    }}>
                      Tipo:
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: '500', color: '#1f2937' }}>
                      {qrData.tipo || 'transferencia'}
                    </div>
                  </div>

                  {qrData.observacoes && (
                    <div>
                      <div style={{
                        fontSize: '0.875rem',
                        color: '#6b7280',
                        marginBottom: '0.25rem',
                      }}>
                        Observações:
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#374151' }}>
                        {qrData.observacoes}
                      </div>
                    </div>
                  )}

                  <div style={{ marginTop: '1rem' }}>
                    <div style={{
                      fontSize: '0.875rem',
                      color: '#6b7280',
                      marginBottom: '0.25rem',
                    }}>
                      Data/Hora:
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#374151' }}>
                      {new Date(qrData.timestamp).toLocaleString('pt-BR')}
                    </div>
                  </div>
                </div>

                {/* Items List */}
                <div style={{
                  marginBottom: '1.5rem',
                }}>
                  <h3 style={{
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    color: '#1f2937',
                    marginBottom: '1rem',
                  }}>
                    Itens da Transferência ({items.length})
                  </h3>

                  <div style={{
                    maxHeight: '400px',
                    overflowY: 'auto',
                  }}>
                    {items.map((item, index) => (
                      <div
                        key={item.id || index}
                        style={{
                          padding: '1rem',
                          marginBottom: '0.5rem',
                          backgroundColor: '#f9fafb',
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div>
                          <div style={{
                            fontWeight: '600',
                            color: '#1f2937',
                            marginBottom: '0.25rem',
                          }}>
                            {item.nome}
                          </div>
                          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                            Lacre: {item.lacre} | Qtd: {item.quantidade}
                          </div>
                          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                            Estado: {item.estado}
                          </div>
                        </div>
                        {item.foto && (
                          <img
                            src={item.foto}
                            alt={item.nome}
                            style={{
                              width: '60px',
                              height: '60px',
                              objectFit: 'cover',
                              borderRadius: '4px',
                            }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem',
                }}>
                  <button
                    onClick={resetScanner}
                    disabled={loading}
                    style={{
                      padding: '0.875rem 1rem',
                      backgroundColor: '#6b7280',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      opacity: loading ? 0.5 : 1,
                    }}
                  >
                    Cancelar
                  </button>

                  <button
                    onClick={handleAcceptTransfer}
                    disabled={loading || items.length === 0}
                    style={{
                      padding: '0.875rem 1rem',
                      backgroundColor: items.length === 0 || loading ? '#9ca3af' : '#059669',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: items.length === 0 || loading ? 'not-allowed' : 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                    }}
                  >
                    {loading ? 'Processando...' : '✅ Aceitar Transferência'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
