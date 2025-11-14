require('dotenv').config();
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Diretório de backups
const BACKUP_DIR = path.join(__dirname, '../backups');

// Criar diretório se não existir
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

/**
 * Realiza backup do banco de dados PostgreSQL
 */
async function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  const backupFile = path.join(BACKUP_DIR, `backup-${timestamp}.sql`);

  // Extrair informações do DATABASE_URL
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error('DATABASE_URL não configurado');
  }

  // Parse DATABASE_URL
  // Formato: postgres://user:password@host:port/database
  const urlMatch = dbUrl.match(/postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
  if (!urlMatch) {
    throw new Error('DATABASE_URL inválido');
  }

  const [, user, password, host, port, database] = urlMatch;

  console.log('🔄 Iniciando backup do banco de dados...');
  console.log(`📁 Arquivo: ${backupFile}`);

  return new Promise((resolve, reject) => {
    // Comando pg_dump
    const command = `PGPASSWORD="${password}" pg_dump -h ${host} -p ${port} -U ${user} -d ${database} -F p -f "${backupFile}"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Erro ao criar backup:', error.message);
        return reject(error);
      }

      if (stderr) {
        console.warn('⚠️ Avisos:', stderr);
      }

      const stats = fs.statSync(backupFile);
      const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

      console.log('✅ Backup criado com sucesso!');
      console.log(`📊 Tamanho: ${fileSizeMB} MB`);

      resolve({
        success: true,
        file: backupFile,
        size: stats.size,
        timestamp: new Date(),
      });
    });
  });
}

/**
 * Remove backups antigos (mantém últimos 30 dias)
 */
async function cleanOldBackups(daysToKeep = 30) {
  const files = fs.readdirSync(BACKUP_DIR);
  const now = Date.now();
  const maxAge = daysToKeep * 24 * 60 * 60 * 1000; // dias em milissegundos

  let deletedCount = 0;

  files.forEach((file) => {
    const filePath = path.join(BACKUP_DIR, file);
    const stats = fs.statSync(filePath);
    const age = now - stats.mtimeMs;

    if (age > maxAge) {
      fs.unlinkSync(filePath);
      deletedCount++;
      console.log(`🗑️ Backup antigo removido: ${file}`);
    }
  });

  if (deletedCount > 0) {
    console.log(`✅ ${deletedCount} backup(s) antigo(s) removido(s)`);
  } else {
    console.log('ℹ️ Nenhum backup antigo para remover');
  }
}

/**
 * Lista todos os backups disponíveis
 */
function listBackups() {
  const files = fs.readdirSync(BACKUP_DIR);
  const backups = files
    .filter((file) => file.endsWith('.sql'))
    .map((file) => {
      const filePath = path.join(BACKUP_DIR, file);
      const stats = fs.statSync(filePath);
      return {
        filename: file,
        path: filePath,
        size: stats.size,
        created: stats.mtime,
      };
    })
    .sort((a, b) => b.created - a.created);

  return backups;
}

// Executar backup se chamado diretamente
if (require.main === module) {
  (async () => {
    try {
      await createBackup();
      await cleanOldBackups();
      process.exit(0);
    } catch (error) {
      console.error('❌ Erro fatal:', error);
      process.exit(1);
    }
  })();
}

module.exports = {
  createBackup,
  cleanOldBackups,
  listBackups,
  BACKUP_DIR,
};
