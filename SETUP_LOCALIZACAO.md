# 🚀 Setup Rápido - Sistema de Localização Física

## ⚡ 3 Passos para Ativar

### 1. Rodar Migration

```bash
cd backend
npm run migrate:storage
```

**O que faz:** Cria tabela `locais_armazenamento` e adiciona campos ao items.

### 2. Popular com Dados

```bash
npm run seed:storage
```

**O que faz:** Adiciona 18 locais físicos (caixas, prateleiras, armários, etc.)

### 3. Testar API

```bash
# Servidor rodando? Teste:
curl http://localhost:3000/api/storage
```

**Deve retornar:** Lista de 18 locais de armazenamento.

---

## ✅ Pronto!

Agora você pode:

- ✅ Ver lista de locais: `GET /api/storage`
- ✅ Ver itens em cada local: `GET /api/storage/:id`
- ✅ Criar novos locais: `POST /api/storage`
- ✅ Items agora mostram `local_codigo`, `local_descricao`, `local_tipo`

---

## 📖 Documentação Completa

Ver: [LOCALIZACAO_FISICA_GUIA.md](LOCALIZACAO_FISICA_GUIA.md)

---

## 🐳 Com Docker

```bash
docker-compose exec backend npm run migrate:storage
docker-compose exec backend npm run seed:storage
```

---

## 🔄 Setup Completo (Do Zero)

```bash
cd backend
npm run setup
```

Executa tudo de uma vez:
1. Migration principal
2. Migration storage
3. Seed principal (50 itens)
4. Seed storage (18 locais)

---

## 📦 Locais Criados

- **5 Caixas:** CX-A1, CX-A2, CX-B1, CX-B2, CX-C1
- **5 Prateleiras:** PR-01, PR-02, PR-03, PR-04, PR-05
- **3 Armários:** ARM-01, ARM-02, ARM-03
- **3 Gavetas:** GAV-1A, GAV-1B, GAV-2A
- **2 Salas:** SALA-1, SALA-2

**Total:** 18 locais prontos para uso!

---

## ✨ Exemplo de Uso

```javascript
// Buscar item
const item = await getItem('item-id');

// Ver onde está fisicamente
console.log(item.local_codigo);        // "PR-02"
console.log(item.local_descricao);     // "Prateleira 2 - Ferramentas Elétricas"
console.log(item.local_tipo);          // "prateleira"
```

---

**🎉 Sistema de Localização Física Ativado!**
