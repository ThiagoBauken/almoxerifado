require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3000;

// ==================== MIDDLEWARES ====================

// Segurança
app.use(helmet());

// CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true,
};
app.use(cors(corsOptions));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ==================== ROTAS ====================

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/items', require('./routes/items'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/obras', require('./routes/obras'));
app.use('/api/transfers', require('./routes/transfers'));
app.use('/api/sync', require('./routes/sync'));
app.use('/api/storage', require('./routes/storage'));

// Servir arquivos estáticos do frontend (React build)
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

// Todas as rotas não-API servem o index.html (SPA routing)
app.get('*', (req, res, next) => {
  // Se for uma rota de API que não existe, vai para o 404 handler
  if (req.path.startsWith('/api/')) {
    return next();
  }
  // Caso contrário, serve o index.html do React
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 404 Handler (só para rotas /api/*)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada',
    path: req.path,
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

// ==================== INICIAR SERVIDOR ====================

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════╗
║  🚀 Servidor Almoxarifado                            ║
║  📡 Rodando em: http://localhost:${PORT}             ║
║  🌍 Ambiente: ${process.env.NODE_ENV || 'development'}               ║
║  📅 ${new Date().toLocaleString('pt-BR')}                   ║
╚══════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM recebido. Encerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT recebido. Encerrando servidor...');
  process.exit(0);
});
