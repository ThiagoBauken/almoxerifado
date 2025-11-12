require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { testConnection, sequelize } = require('./config/database');
const { syncDatabase } = require('./models');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*'
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos (uploads, QR codes, etc)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rotas da API
app.use('/api', routes);

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    message: '🚀 StockMaster API',
    version: '1.0.0',
    status: 'online',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      items: '/api/items',
      requests: '/api/requests'
    }
  });
});

// Tratamento de erros 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada'
  });
});

// Tratamento de erros global
app.use((err, req, res, next) => {
  console.error('Erro:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Inicializar servidor
const startServer = async () => {
  try {
    // Testar conexão com o banco
    await testConnection();
    
    // Sincronizar modelos (criar tabelas se não existirem)
    // ATENÇÃO: Em produção, use migrations ao invés de sync
    if (process.env.NODE_ENV === 'development') {
      await syncDatabase(false); // false = não sobrescrever dados existentes
    }
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`\n✅ Servidor rodando na porta ${PORT}`);
      console.log(`📍 URL: http://localhost:${PORT}`);
      console.log(`🔗 API: http://localhost:${PORT}/api`);
      console.log(`💚 Ambiente: ${process.env.NODE_ENV}\n`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

// Tratamento de erros não capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Iniciar
startServer();

module.exports = app;
