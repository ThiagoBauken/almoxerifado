const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const pool = require('../database/config');
const { authMiddleware } = require('./auth');

const router = express.Router();
router.use(authMiddleware);

// Configurar multer para upload em memória
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel.sheet.macroEnabled.12'
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos Excel (.xls, .xlsx) são permitidos'));
    }
  }
});

// ==================== IMPORTAR CATEGORIAS ====================

router.post('/categories', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum arquivo foi enviado',
      });
    }

    // Ler o arquivo Excel
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Planilha vazia ou formato inválido',
      });
    }

    const results = {
      total: data.length,
      success: 0,
      errors: [],
    };

    // Processar cada linha
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNum = i + 2; // +2 porque Excel começa em 1 e tem header

      try {
        // Validar campos obrigatórios
        if (!row.nome && !row.Nome) {
          results.errors.push({
            linha: rowNum,
            erro: 'Nome é obrigatório',
          });
          continue;
        }

        const nome = row.nome || row.Nome;
        const icone = row.icone || row.Icone || '📦';

        // Verificar se já existe
        const exists = await pool.query(
          'SELECT id FROM categories WHERE nome = $1 AND organization_id = $2',
          [nome, req.user.organization_id]
        );

        if (exists.rows.length > 0) {
          results.errors.push({
            linha: rowNum,
            erro: `Categoria "${nome}" já existe`,
          });
          continue;
        }

        // Inserir
        await pool.query(
          'INSERT INTO categories (nome, icone, organization_id) VALUES ($1, $2, $3)',
          [nome, icone, req.user.organization_id]
        );

        results.success++;
      } catch (error) {
        results.errors.push({
          linha: rowNum,
          erro: error.message,
        });
      }
    }

    res.json({
      success: true,
      message: `Importação concluída: ${results.success} de ${results.total} categorias importadas`,
      data: results,
    });
  } catch (error) {
    console.error('Erro ao importar categorias:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao importar categorias',
    });
  }
});

// ==================== IMPORTAR LOCAIS ====================

router.post('/storage', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum arquivo foi enviado',
      });
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Planilha vazia ou formato inválido',
      });
    }

    const results = {
      total: data.length,
      success: 0,
      errors: [],
    };

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNum = i + 2;

      try {
        if (!row.codigo && !row.Codigo && !row.Código) {
          results.errors.push({
            linha: rowNum,
            erro: 'Código é obrigatório',
          });
          continue;
        }

        const codigo = row.codigo || row.Codigo || row.Código;
        const descricao = row.descricao || row.Descricao || row.Descrição || '';
        const tipo = row.tipo || row.Tipo || 'deposito';
        const capacidade = row.capacidade || row.Capacidade || null;
        const setor = row.setor || row.Setor || '';

        // Verificar se já existe
        const exists = await pool.query(
          'SELECT id FROM locais_armazenamento WHERE codigo = $1 AND organization_id = $2',
          [codigo, req.user.organization_id]
        );

        if (exists.rows.length > 0) {
          results.errors.push({
            linha: rowNum,
            erro: `Local "${codigo}" já existe`,
          });
          continue;
        }

        // Inserir
        await pool.query(
          `INSERT INTO locais_armazenamento
           (codigo, descricao, tipo, capacidade, setor, organization_id)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [codigo, descricao, tipo, capacidade, setor, req.user.organization_id]
        );

        results.success++;
      } catch (error) {
        results.errors.push({
          linha: rowNum,
          erro: error.message,
        });
      }
    }

    res.json({
      success: true,
      message: `Importação concluída: ${results.success} de ${results.total} locais importados`,
      data: results,
    });
  } catch (error) {
    console.error('Erro ao importar locais:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao importar locais',
    });
  }
});

// ==================== IMPORTAR ITENS ====================

router.post('/items', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum arquivo foi enviado',
      });
    }

    // Verificar limite do plano
    const orgCheck = await pool.query(
      `SELECT o.max_itens, COUNT(i.id) as current_itens
       FROM organizations o
       LEFT JOIN items i ON i.organization_id = o.id
       WHERE o.id = $1
       GROUP BY o.id, o.max_itens`,
      [req.user.organization_id]
    );

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Planilha vazia ou formato inválido',
      });
    }

    let currentCount = 0;
    let maxItems = Infinity;

    if (orgCheck.rows.length > 0) {
      currentCount = parseInt(orgCheck.rows[0].current_itens) || 0;
      maxItems = orgCheck.rows[0].max_itens;
    }

    const results = {
      total: data.length,
      success: 0,
      errors: [],
      limitReached: false,
    };

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNum = i + 2;

      // Verificar limite
      if (currentCount + results.success >= maxItems) {
        results.limitReached = true;
        results.errors.push({
          linha: rowNum,
          erro: `Limite de itens atingido (${maxItems})`,
        });
        continue;
      }

      try {
        if (!row.nome && !row.Nome) {
          results.errors.push({
            linha: rowNum,
            erro: 'Nome é obrigatório',
          });
          continue;
        }

        const nome = row.nome || row.Nome;
        const codigo = row.codigo || row.Codigo || row.Código || null;
        const quantidade = parseInt(row.quantidade || row.Quantidade || 0);
        const categoria_nome = row.categoria || row.Categoria || null;
        const local_codigo = row.local || row.Local || null;
        const estado = row.estado || row.Estado || 'disponivel_estoque';
        const marca_modelo = row.marca_modelo || row['Marca/Modelo'] || null;
        const unidade = row.unidade || row.Unidade || 'UN';
        const estoque_minimo = parseInt(row.estoque_minimo || row['Estoque Mínimo'] || 0);
        const valor_unitario = parseFloat(row.valor_unitario || row['Valor Unitário'] || 0);

        // Buscar categoria_id se informado
        let categoria_id = null;
        if (categoria_nome) {
          const catResult = await pool.query(
            'SELECT id FROM categories WHERE nome = $1 AND organization_id = $2',
            [categoria_nome, req.user.organization_id]
          );
          if (catResult.rows.length > 0) {
            categoria_id = catResult.rows[0].id;
          }
        }

        // Buscar local_armazenamento_id se informado
        let local_armazenamento_id = null;
        if (local_codigo) {
          const locResult = await pool.query(
            'SELECT id FROM locais_armazenamento WHERE codigo = $1 AND organization_id = $2',
            [local_codigo, req.user.organization_id]
          );
          if (locResult.rows.length > 0) {
            local_armazenamento_id = locResult.rows[0].id;
          }
        }

        // Verificar se código já existe (se fornecido)
        if (codigo) {
          const exists = await pool.query(
            'SELECT id FROM items WHERE codigo = $1 AND organization_id = $2',
            [codigo, req.user.organization_id]
          );
          if (exists.rows.length > 0) {
            results.errors.push({
              linha: rowNum,
              erro: `Item com código "${codigo}" já existe`,
            });
            continue;
          }
        }

        // Inserir
        await pool.query(
          `INSERT INTO items
           (nome, codigo, quantidade, categoria_id, local_armazenamento_id, estado,
            marca_modelo, unidade, estoque_minimo, quantidade_disponivel, valor_unitario, organization_id)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [
            nome,
            codigo,
            quantidade,
            categoria_id,
            local_armazenamento_id,
            estado,
            marca_modelo,
            unidade,
            estoque_minimo,
            quantidade,
            valor_unitario,
            req.user.organization_id,
          ]
        );

        results.success++;
      } catch (error) {
        results.errors.push({
          linha: rowNum,
          erro: error.message,
        });
      }
    }

    res.json({
      success: true,
      message: `Importação concluída: ${results.success} de ${results.total} itens importados`,
      data: results,
    });
  } catch (error) {
    console.error('Erro ao importar itens:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao importar itens',
    });
  }
});

module.exports = router;
