require('dotenv').config();
const cron = require('node-cron');
const { createBackup, cleanOldBackups } = require('./backup');

console.log('🕐 Iniciando agendador de backups...');

// Backup diário às 3h da manhã
cron.schedule('0 3 * * *', async () => {
  console.log('\n🔄 Executando backup agendado...');
  try {
    await createBackup();
    await cleanOldBackups(30); // Manter últimos 30 dias
    console.log('✅ Backup agendado concluído\n');
  } catch (error) {
    console.error('❌ Erro no backup agendado:', error);
  }
});

// Backup semanal completo aos domingos às 2h
cron.schedule('0 2 * * 0', async () => {
  console.log('\n🔄 Executando backup semanal...');
  try {
    await createBackup();
    console.log('✅ Backup semanal concluído\n');
  } catch (error) {
    console.error('❌ Erro no backup semanal:', error);
  }
});

console.log('✅ Agendador de backups iniciado');
console.log('📅 Backup diário: 03:00');
console.log('📅 Backup semanal: Domingo 02:00');
console.log('📅 Limpeza automática: Backups com mais de 30 dias\n');

// Manter processo rodando
process.stdin.resume();
