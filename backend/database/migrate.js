require('dotenv').config();
const pool = require('./config');

const migrations = [
  // 1. Usuários
  `CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    perfil VARCHAR(50) NOT NULL CHECK (perfil IN ('funcionario', 'almoxarife', 'gestor', 'admin')),
    obra_id UUID,
    foto TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );`,

  // 2. Obras
  `CREATE TABLE IF NOT EXISTS obras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    endereco TEXT,
    status VARCHAR(50) DEFAULT 'ativa' CHECK (status IN ('ativa', 'pausada', 'concluida', 'cancelada')),
    responsavel_id UUID REFERENCES users(id),
    data_inicio DATE,
    data_fim DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );`,

  // 3. Categorias
  `CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    icone VARCHAR(50),
    descricao TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );`,

  // 4. Itens
  `CREATE TABLE IF NOT EXISTS items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lacre VARCHAR(50) UNIQUE NOT NULL,
    nome VARCHAR(255) NOT NULL,
    categoria_id UUID REFERENCES categories(id),
    estado VARCHAR(50) NOT NULL CHECK (estado IN (
      'disponivel_estoque',
      'pendente_aceitacao',
      'com_funcionario',
      'em_obra',
      'em_manutencao',
      'inativo',
      'extraviado',
      'danificado',
      'em_transito'
    )),
    localizacao_tipo VARCHAR(50),
    localizacao_id UUID,
    funcionario_id UUID REFERENCES users(id),
    obra_id UUID REFERENCES obras(id),
    foto TEXT,
    qr_code TEXT,
    descricao TEXT,
    valor_unitario DECIMAL(10, 2),
    data_aquisicao DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );`,

  // 5. Transferências
  `CREATE TABLE IF NOT EXISTS transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID REFERENCES items(id),
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('transferencia', 'manutencao', 'devolucao')),
    de_usuario_id UUID REFERENCES users(id),
    para_usuario_id UUID REFERENCES users(id),
    de_localizacao TEXT,
    para_localizacao TEXT,
    status VARCHAR(50) DEFAULT 'pendente' CHECK (status IN ('pendente', 'concluida', 'cancelada', 'em_andamento')),
    data_envio TIMESTAMP DEFAULT NOW(),
    data_aceitacao TIMESTAMP,
    assinatura_remetente TEXT,
    assinatura_destinatario TEXT,
    foto_comprovante TEXT,
    motivo TEXT,
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );`,

  // 6. Índices para performance
  `CREATE INDEX IF NOT EXISTS idx_items_estado ON items(estado);`,
  `CREATE INDEX IF NOT EXISTS idx_items_funcionario ON items(funcionario_id);`,
  `CREATE INDEX IF NOT EXISTS idx_items_obra ON items(obra_id);`,
  `CREATE INDEX IF NOT EXISTS idx_items_lacre ON items(lacre);`,
  `CREATE INDEX IF NOT EXISTS idx_transfers_status ON transfers(status);`,
  `CREATE INDEX IF NOT EXISTS idx_transfers_data ON transfers(data_envio DESC);`,
  `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`,
];

async function runMigrations() {
  console.log('🔄 Executando migrations...\n');

  try {
    for (let i = 0; i < migrations.length; i++) {
      console.log(`Migration ${i + 1}/${migrations.length}...`);
      await pool.query(migrations[i]);
      console.log(`✅ Migration ${i + 1} concluída\n`);
    }

    console.log('✅ Todas as migrations foram executadas com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao executar migrations:', error);
    process.exit(1);
  }
}

runMigrations();
