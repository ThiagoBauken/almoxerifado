require('dotenv').config();
const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

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
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_');
  const backupFile = path.join(BACKUP_DIR, `backup-${timestamp}.sql`);

  // Extrair informações do DATABASE_URL
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error('DATABASE_URL não configurado');
  }

  // Parse DATABASE_URL usando URL nativa (suporta caracteres especiais)
  let user, password, host, port, database;
  try {
    const { URL } = require('url');
    const dbUrlParsed = new URL(dbUrl);
    user = dbUrlParsed.username;
    password = decodeURIComponent(dbUrlParsed.password);
    host = dbUrlParsed.hostname;
    port = dbUrlParsed.port || '5432';
    database = dbUrlParsed.pathname.substring(1);
  } catch (error) {
    throw new Error('DATABASE_URL inválido: ' + error.message);
  }

  console.log('🔄 Iniciando backup do banco de dados...');
  console.log(`📁 Arquivo: ${backupFile}`);

  return new Promise((resolve, reject) => {
    // Criar arquivo .pgpass temporário para evitar expor senha
    const pgpassFile = path.join(os.tmpdir(), `.pgpass-${Date.now()}`);
    const pgpassContent = `${host}:${port}:${database}:${user}:${password}\n`;

    try {
      fs.writeFileSync(pgpassFile, pgpassContent, { mode: 0o600 });
    } catch (error) {
      return reject(new Error('Erro ao criar arquivo de credenciais: ' + error.message));
    }

    // Usar execFile ao invés de exec para prevenir command injection
    const args = ['-h', host, '-p', port, '-U', user, '-d', database, '-F', 'p', '-f', backupFile];
    const options = {
      env: { ...process.env, PGPASSFILE: pgpassFile }
    };

    execFile('pg_dump', args, options, (error, stdout, stderr) => {
      // Deletar arquivo .pgpass após uso
      try {
        fs.unlinkSync(pgpassFile);
      } catch (cleanupError) {
        console.warn('⚠️ Erro ao deletar arquivo temporário:', cleanupError.message);
      }

      if (error) {
        console.error('❌ Erro ao criar backup:', error.message);
        return reject(error);
      }

      if (stderr) {
        console.warn('⚠️ Avisos:', stderr);
      }

      // Verificar se arquivo foi criado e não está vazio
      if (!fs.existsSync(backupFile)) {
        return reject(new Error('Arquivo de backup não foi criado'));
      }

      const stats = fs.statSync(backupFile);

      if (stats.size === 0) {
        fs.unlinkSync(backupFile);
        return reject(new Error('Backup criado mas arquivo está vazio'));
      }

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

  // Filtrar apenas arquivos .sql que começam com backup-
  files
    .filter(file => file.endsWith('.sql') && file.startsWith('backup-'))
    .forEach((file) => {
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
