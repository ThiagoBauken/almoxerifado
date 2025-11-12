require('dotenv').config();
const { User, Category, Location, Item, syncDatabase } = require('../src/models');

const seedDatabase = async () => {
  try {
    console.log('🌱 Iniciando seed do banco de dados...\n');

    // Sincronizar banco (criar tabelas)
    await syncDatabase(true); // true = recriar tabelas

    // 1. Criar usuários
    console.log('👤 Criando usuários...');
    const admin = await User.create({
      name: 'Administrador',
      email: 'admin@stockmaster.com',
      password: 'admin123',
      role: 'admin',
      phone: '(11) 99999-9999'
    });

    const manager = await User.create({
      name: 'Gerente',
      email: 'gerente@stockmaster.com',
      password: 'gerente123',
      role: 'manager',
      phone: '(11) 98888-8888'
    });

    const operator = await User.create({
      name: 'Operador',
      email: 'operador@stockmaster.com',
      password: 'operador123',
      role: 'operator',
      phone: '(11) 97777-7777'
    });

    const user = await User.create({
      name: 'Usuário Teste',
      email: 'usuario@stockmaster.com',
      password: 'usuario123',
      role: 'user',
      phone: '(11) 96666-6666'
    });

    console.log('✅ Usuários criados!\n');

    // 2. Criar categorias
    console.log('📦 Criando categorias...');
    const equipmentCategory = await Category.create({
      name: 'Equipamentos',
      description: 'Equipamentos de segurança e alpinismo',
      type: 'equipment',
      icon: 'shield',
      color: '#3B82F6'
    });

    const toolCategory = await Category.create({
      name: 'Ferramentas',
      description: 'Ferramentas de trabalho',
      type: 'tool',
      icon: 'tool',
      color: '#F59E0B'
    });

    const consumableCategory = await Category.create({
      name: 'Consumíveis',
      description: 'Produtos consumíveis',
      type: 'consumable',
      icon: 'package',
      color: '#10B981'
    });

    console.log('✅ Categorias criadas!\n');

    // 3. Criar localizações (baseado na planilha)
    console.log('📍 Criando localizações...');
    const heightechLocation = await Location.create({
      container: 'CONTAINER HEIGHTECH',
      shelf: '1',
      row: 'A',
      box: '1',
      description: 'Container principal Heightech',
      capacity: 100
    });

    const blueCoastLocation = await Location.create({
      container: 'BLUE COAST FG',
      shelf: '1',
      row: 'A',
      box: '1',
      description: 'Container Blue Coast',
      capacity: 100
    });

    const vitraLocation = await Location.create({
      container: 'Vitra GT',
      shelf: '1',
      row: 'A',
      box: '1',
      description: 'Container Vitra GT',
      capacity: 100
    });

    const casaPedroLocation = await Location.create({
      container: 'Casa Pedro',
      shelf: '1',
      row: 'A',
      box: '1',
      description: 'Container Casa Pedro',
      capacity: 100
    });

    const manchesterLocation = await Location.create({
      container: 'Ed. Manchester',
      shelf: '1',
      row: 'A',
      box: '1',
      description: 'Container Manchester',
      capacity: 100
    });

    console.log('✅ Localizações criadas!\n');

    // 4. Criar itens de equipamentos
    console.log('🎒 Criando equipamentos...');
    const equipmentItems = [
      { name: 'Corda #11', quantity: 5 },
      { name: 'Corda #12', quantity: 3 },
      { name: 'Protetor Corda', quantity: 10 },
      { name: 'Capacete', quantity: 15 },
      { name: 'Cinto Paraquedista', quantity: 8 },
      { name: 'Mosquetão Aço', quantity: 20 },
      { name: 'Kroll', quantity: 6 },
      { name: 'Jumar', quantity: 7 },
      { name: 'Trava Quedas', quantity: 5 },
      { name: 'Descensor Spark', quantity: 4 },
      { name: 'Descensor Lory', quantity: 3 },
      { name: 'Acento Conforto', quantity: 6 },
      { name: 'Fita Ancoragem', quantity: 12 },
      { name: 'Polia', quantity: 8 },
      { name: 'Ancor Pro', quantity: 5 },
      { name: 'Radio Comunicador', quantity: 4 }
    ];

    for (const item of equipmentItems) {
      await Item.create({
        ...item,
        categoryId: equipmentCategory.id,
        locationId: heightechLocation.id,
        description: `${item.name} - Equipamento de segurança`,
        unit: 'un',
        minQuantity: 2,
        condition: 'good',
        status: 'available'
      });
    }

    // 5. Criar itens de ferramentas
    console.log('🔧 Criando ferramentas...');
    const toolItems = [
      { name: 'Vape', quantity: 3 },
      { name: 'Mangueira Borracha', quantity: 5 },
      { name: 'Mangueira Jardim', quantity: 4 },
      { name: 'Esfregão LT', quantity: 8 },
      { name: 'Rodo', quantity: 10 },
      { name: 'Raspador', quantity: 6 },
      { name: 'Extensor', quantity: 7 },
      { name: 'Pincel', quantity: 15 },
      { name: 'Rolo Pintura', quantity: 12 },
      { name: 'Furadeira', quantity: 2 },
      { name: 'Broca', quantity: 20 },
      { name: 'Parafusadeira', quantity: 3 },
      { name: 'Bit', quantity: 25 },
      { name: 'Politriz', quantity: 2 },
      { name: 'Lixadeira', quantity: 2 },
      { name: 'Aplicador Hard', quantity: 5 },
      { name: 'Aplicador Hilt', quantity: 4 },
      { name: 'Aplicador P.U', quantity: 3 }
    ];

    for (const item of toolItems) {
      await Item.create({
        ...item,
        categoryId: toolCategory.id,
        locationId: blueCoastLocation.id,
        description: `${item.name} - Ferramenta de trabalho`,
        unit: 'un',
        minQuantity: 1,
        condition: 'good',
        status: 'available'
      });
    }

    // 6. Criar produtos consumíveis
    console.log('🧴 Criando consumíveis...');
    const consumableItems = [
      { name: 'Yellow Pine', quantity: 50 },
      { name: 'SD-20', quantity: 30 },
      { name: 'Esponja', quantity: 100 },
      { name: 'Lâmina', quantity: 75 },
      { name: 'Borracha Rodo', quantity: 40 }
    ];

    for (const item of consumableItems) {
      await Item.create({
        ...item,
        categoryId: consumableCategory.id,
        locationId: vitraLocation.id,
        description: `${item.name} - Produto consumível`,
        unit: item.name === 'Yellow Pine' || item.name === 'SD-20' ? 'L' : 'un',
        minQuantity: 10,
        condition: 'new',
        status: 'available'
      });
    }

    console.log('✅ Itens criados!\n');

    console.log('🎉 Seed concluído com sucesso!');
    console.log('\n📊 Resumo:');
    console.log(`- ${await User.count()} usuários criados`);
    console.log(`- ${await Category.count()} categorias criadas`);
    console.log(`- ${await Location.count()} localizações criadas`);
    console.log(`- ${await Item.count()} itens criados`);
    console.log('\n🔑 Credenciais de acesso:');
    console.log('Admin: admin@stockmaster.com / admin123');
    console.log('Gerente: gerente@stockmaster.com / gerente123');
    console.log('Operador: operador@stockmaster.com / operador123');
    console.log('Usuário: usuario@stockmaster.com / usuario123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro no seed:', error);
    process.exit(1);
  }
};

// Executar seed
seedDatabase();
