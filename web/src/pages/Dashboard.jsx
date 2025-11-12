import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import Layout from '../components/Layout';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalItems: 0,
    totalUsers: 0,
    totalCategories: 0,
    lowStock: 0,
  });
  const [itemsByCategory, setItemsByCategory] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [recentMovements, setRecentMovements] = useState([]);
  const [movementsByDay, setMovementsByDay] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [itemsRes, categoriesRes, usersRes, movimentacoesRes] = await Promise.all([
        api.get('/items?limit=1000'),
        api.get('/categories'),
        api.get('/users'),
        api.get('/movimentacoes?limit=100'),
      ]);

      const items = itemsRes.data.data || [];
      const categories = categoriesRes.data.data || [];
      const users = usersRes.data.data || [];
      const movimentacoes = movimentacoesRes.data.data || [];

      // Stats
      const lowStock = items.filter(i => i.quantidade <= (i.estoque_minimo || 0) && i.estoque_minimo > 0);
      setStats({
        totalItems: items.length,
        totalUsers: users.length,
        totalCategories: categories.length,
        lowStock: lowStock.length,
      });

      // Itens com estoque baixo
      setLowStockItems(lowStock.slice(0, 5));

      // Agrupar itens por categoria
      const categoryMap = {};
      items.forEach(item => {
        const catName = item.categoria_nome || 'Sem categoria';
        if (!categoryMap[catName]) {
          categoryMap[catName] = 0;
        }
        categoryMap[catName]++;
      });

      const categoryData = Object.keys(categoryMap).map(name => ({
        name: name.length > 15 ? name.substring(0, 15) + '...' : name,
        quantidade: categoryMap[name],
      })).sort((a, b) => b.quantidade - a.quantidade).slice(0, 6);

      setItemsByCategory(categoryData);

      // Movimentações por dia (últimos 7 dias)
      const last7Days = [];
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        last7Days.push({
          date: dateStr,
          label: new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(date),
          count: 0,
        });
      }

      movimentacoes.forEach(mov => {
        const movDate = new Date(mov.created_at).toISOString().split('T')[0];
        const dayData = last7Days.find(d => d.date === movDate);
        if (dayData) {
          dayData.count++;
        }
      });

      setMovementsByDay(last7Days);
      setRecentMovements(movimentacoes.slice(0, 5));
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div style={{ padding: '2rem', backgroundColor: '#f3f4f6', minHeight: '100vh' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '2rem' }}>
          📊 Dashboard
        </h1>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
              Total de Itens
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563eb' }}>
              {stats.totalItems}
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
              Categorias
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
              {stats.totalCategories}
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
              Usuários
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>
              {stats.totalUsers}
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
              Alertas de Estoque
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444' }}>
              {stats.lowStock}
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            textAlign: 'center',
            color: '#6b7280',
          }}>
            Carregando gráficos...
          </div>
        ) : (
          <>
            {/* Charts Row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
              gap: '1.5rem',
              marginBottom: '1.5rem',
            }}>
              {/* Itens por Categoria */}
              <div style={{
                backgroundColor: 'white',
                padding: '1.5rem',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
                  Itens por Categoria
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={itemsByCategory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" style={{ fontSize: '0.75rem' }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="quantidade" fill="#2563eb" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Movimentações dos Últimos 7 Dias */}
              <div style={{
                backgroundColor: 'white',
                padding: '1.5rem',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
                  Movimentações (7 dias)
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={movementsByDay}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" style={{ fontSize: '0.75rem' }} />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Tables Row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '1.5rem',
            }}>
              {/* Alertas de Estoque Baixo */}
              {lowStockItems.length > 0 && (
                <div style={{
                  backgroundColor: 'white',
                  padding: '1.5rem',
                  borderRadius: '8px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
                    🚨 Alertas de Estoque Baixo
                  </h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead style={{ backgroundColor: '#fef3c7' }}>
                        <tr>
                          <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#92400e' }}>
                            Item
                          </th>
                          <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#92400e' }}>
                            Código
                          </th>
                          <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#92400e' }}>
                            Qtd Atual
                          </th>
                          <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#92400e' }}>
                            Estoque Mín
                          </th>
                          <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#92400e' }}>
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {lowStockItems.map((item) => (
                          <tr key={item.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                            <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#1f2937' }}>
                              {item.nome}
                            </td>
                            <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#6b7280' }}>
                              {item.codigo}
                            </td>
                            <td style={{ padding: '0.75rem', fontSize: '0.875rem', fontWeight: '600', color: '#ef4444' }}>
                              {item.quantidade}
                            </td>
                            <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#6b7280' }}>
                              {item.estoque_minimo}
                            </td>
                            <td style={{ padding: '0.75rem' }}>
                              <span style={{
                                padding: '0.25rem 0.75rem',
                                borderRadius: '9999px',
                                fontSize: '0.75rem',
                                backgroundColor: '#fee2e2',
                                color: '#991b1b',
                              }}>
                                Crítico
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Movimentações Recentes */}
              {recentMovements.length > 0 && (
                <div style={{
                  backgroundColor: 'white',
                  padding: '1.5rem',
                  borderRadius: '8px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
                    Movimentações Recentes
                  </h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead style={{ backgroundColor: '#f9fafb' }}>
                        <tr>
                          <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>
                            Tipo
                          </th>
                          <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>
                            Item
                          </th>
                          <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>
                            Quantidade
                          </th>
                          <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>
                            Data
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentMovements.map((mov) => (
                          <tr key={mov.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                            <td style={{ padding: '0.75rem' }}>
                              <span style={{
                                padding: '0.25rem 0.75rem',
                                borderRadius: '9999px',
                                fontSize: '0.75rem',
                                backgroundColor: mov.tipo === 'entrada' ? '#d1fae5' : mov.tipo === 'saida' ? '#fee2e2' : '#dbeafe',
                                color: mov.tipo === 'entrada' ? '#065f46' : mov.tipo === 'saida' ? '#991b1b' : '#1e40af',
                              }}>
                                {mov.tipo}
                              </span>
                            </td>
                            <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#1f2937' }}>
                              {mov.item_nome}
                            </td>
                            <td style={{ padding: '0.75rem', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>
                              {mov.quantidade}
                            </td>
                            <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#6b7280' }}>
                              {new Date(mov.created_at).toLocaleDateString('pt-BR')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
