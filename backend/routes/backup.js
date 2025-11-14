const express = require('express');
const fs = require('fs');
const path = require('path');
const { authMiddleware } = require('./auth');
const { createBackup, cleanOldBackups, listBackups, BACKUP_DIR } = require('../scripts/backup');

const router = express.Router();

// Middleware: apenas admins podem acessar backups
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.perfil !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Apenas administradores podem gerenciar backups',
    });
  }
  next();
};

router.use(authMiddleware);
router.use(requireAdmin);

// ==================== CRIAR BACKUP MANUALMENTE ====================

router.post('/create', async (req, res) => {
  try {
    console.log(`[Backup] Backup manual solicitado por: ${req.user.nome}`);

    const result = await createBackup();

    res.json({
      success: true,
      message: 'Backup criado com sucesso',
      data: {
        filename: path.basename(result.file),
        size: result.size,
        timestamp: result.timestamp,
      },
    });
  } catch (error) {
    console.error('Erro ao criar backup:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar backup',
      error: error.message,
    });
  }
});

// ==================== LISTAR BACKUPS ====================

router.get('/list', async (req, res) => {
  try {
    const backups = listBackups();

    res.json({
      success: true,
      data: backups.map((backup) => ({
        filename: backup.filename,
        size: backup.size,
        created: backup.created,
      })),
    });
  } catch (error) {
    console.error('Erro ao listar backups:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar backups',
    });
  }
});

// ==================== DOWNLOAD DE BACKUP ====================

router.get('/download/:filename', async (req, res) => {
  try {
    const { filename } = req.params;

    // Validar filename (segurança) - aceita formato com e sem timestamp completo
    if (!filename.match(/^backup-\d{4}-\d{2}-\d{2}(_\d{2}-\d{2}-\d{2}-\d{3}Z)?\.sql$/)) {
      return res.status(400).json({
        success: false,
        message: 'Nome de arquivo inválido',
      });
    }

    // Usar basename para prevenir path traversal
    const filePath = path.join(BACKUP_DIR, path.basename(filename));

    // Verificar se arquivo existe
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Backup não encontrado',
      });
    }

    console.log(`[Backup] Download iniciado: ${filename} por ${req.user.nome}`);

    // Enviar arquivo
    res.download(filePath, filename, (err) => {
      if (err) {
        console.error('Erro ao fazer download:', err);
      }
    });
  } catch (error) {
    console.error('Erro ao fazer download do backup:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao fazer download',
    });
  }
});

// ==================== DELETAR BACKUP ====================

router.delete('/:filename', async (req, res) => {
  try {
    const { filename } = req.params;

    // Validar filename (segurança) - aceita formato com e sem timestamp completo
    if (!filename.match(/^backup-\d{4}-\d{2}-\d{2}(_\d{2}-\d{2}-\d{2}-\d{3}Z)?\.sql$/)) {
      return res.status(400).json({
        success: false,
        message: 'Nome de arquivo inválido',
      });
    }

    // Usar basename para prevenir path traversal
    const filePath = path.join(BACKUP_DIR, path.basename(filename));

    // Verificar se arquivo existe
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Backup não encontrado',
      });
    }

    // Deletar arquivo
    fs.unlinkSync(filePath);

    console.log(`[Backup] Backup deletado: ${filename} por ${req.user.nome}`);

    res.json({
      success: true,
      message: 'Backup deletado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao deletar backup:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar backup',
    });
  }
});

// ==================== LIMPAR BACKUPS ANTIGOS ====================

router.post('/clean', async (req, res) => {
  try {
    let daysToKeep = parseInt(req.body.daysToKeep) || 30;

    // Validar daysToKeep
    if (daysToKeep < 1 || daysToKeep > 365) {
      return res.status(400).json({
        success: false,
        message: 'daysToKeep deve estar entre 1 e 365 dias',
      });
    }

    await cleanOldBackups(daysToKeep);

    console.log(`[Backup] Limpeza executada por: ${req.user.nome}`);

    res.json({
      success: true,
      message: `Backups com mais de ${daysToKeep} dias foram removidos`,
    });
  } catch (error) {
    console.error('Erro ao limpar backups:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao limpar backups',
    });
  }
});

module.exports = router;
