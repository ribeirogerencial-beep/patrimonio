# 🚀 Guia Completo: Configuração do Supabase

## 📋 Passo a Passo para Criar as Tabelas e Ativar Tempo Real

### 1. 🌐 Acessar o Supabase Dashboard

1. Acesse: [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Faça login na sua conta
3. Selecione seu projeto: `fabejfsnwkyuileblmwq`

### 2. 📝 Executar o Script SQL

**⚠️ IMPORTANTE: Use o script corrigido para evitar erros!**

1. **No menu lateral**, clique em **"SQL Editor"**
2. **Clique em "New Query"**
3. **Copie todo o conteúdo** do arquivo `supabase-setup-simple.sql`
4. **Cole no editor SQL**
5. **Clique em "Run"** (ou pressione Ctrl+Enter)

### 3. 📊 Inserir Dados Iniciais (Opcional)

1. **Crie uma nova query** no SQL Editor
2. **Copie o conteúdo** do arquivo `supabase-dados-iniciais.sql`
3. **Cole e execute** para inserir dados de exemplo

### 4. ✅ Verificar se as Tabelas Foram Criadas

1. **No menu lateral**, clique em **"Table Editor"**
2. **Verifique se as seguintes tabelas foram criadas:**
   - ✅ `categorias`
   - ✅ `localizacoes`
   - ✅ `setores`
   - ✅ `pessoas`
   - ✅ `ativos`
   - ✅ `depreciacoes`
   - ✅ `manutencoes`
   - ✅ `alugueis`

### 5. 🔄 Ativar Tempo Real (Realtime)

1. **No menu lateral**, clique em **"Database"**
2. **Clique em "Replication"**
3. **Verifique se as tabelas estão listadas:**
   - ✅ `categorias`
   - ✅ `localizacoes`
   - ✅ `setores`
   - ✅ `pessoas`
   - ✅ `ativos`
   - ✅ `depreciacoes`
   - ✅ `manutencoes`
   - ✅ `alugueis`

### 6. 🧪 Testar a Configuração

1. **Acesse sua aplicação:** `http://localhost:3000`
2. **Vá para Configurações:** `/configuracoes`
3. **Clique na aba "Backup"**
4. **Teste a conexão:**
   - ✅ **Teste de Conexão:** Deve mostrar "Conectado"
   - ✅ **Teste de Tempo Real:** Deve mostrar "Ativo"

### 7. 🎯 Testar Tempo Real

1. **Na aba "Backup"**, role para baixo até **"Teste de Tempo Real"**
2. **Crie uma nova categoria:**
   - Nome: "Teste Tempo Real"
   - Descrição: "Categoria para testar"
   - Taxa: 15%
3. **Clique em "Criar Categoria"**
4. **Abra outra aba** do navegador na mesma página
5. **A categoria deve aparecer automaticamente** na segunda aba! 🎉

## 🔧 Configurações Adicionais

### Configurar Autenticação (Opcional)

Se quiser adicionar autenticação:

1. **No Supabase Dashboard**, vá em **"Authentication"**
2. **Clique em "Settings"**
3. **Configure os provedores** desejados (Email, Google, etc.)
4. **Ative "Enable email confirmations"** se necessário

### Configurar Políticas de Segurança

As políticas atuais permitem todas as operações. Para maior segurança:

1. **Vá em "Authentication" > "Policies"**
2. **Crie políticas específicas** para cada tabela
3. **Configure RLS (Row Level Security)** conforme necessário

## 📊 Dados Iniciais Incluídos

O script já inclui dados de exemplo:

### Categorias (8 categorias)
- Equipamentos de Informática (20%)
- Móveis e Utensílios (10%)
- Veículos (20%)
- Máquinas e Equipamentos (10%)
- Imóveis (4%)
- Equipamentos de Escritório (15%)
- Equipamentos de Laboratório (12%)
- Equipamentos de Segurança (15%)

### Localizações (6 localizações)
- Sede Principal
- Filial Norte
- Filial Sul
- Depósito Central
- Laboratório
- Oficina

### Setores (8 setores)
- TI, Administrativo, Produção, Vendas
- RH, Marketing, P&D, Manutenção

### Pessoas (7 pessoas)
- 4 funcionários
- 2 fornecedores
- 1 cliente

## 🚨 Solução de Problemas

### ❌ Erro: "valor muito longo para o tipo de caractere variando(25)"
- **Causa:** Campos VARCHAR muito pequenos para os dados
- **Solução:** Use o script `supabase-setup-simple.sql` que corrige os tamanhos dos campos
- **Alternativa:** Execute apenas a criação das tabelas primeiro, depois insira os dados

### Erro: "relation does not exist"
- **Causa:** Tabelas não foram criadas
- **Solução:** Execute o script SQL novamente

### Tempo Real não funciona
- **Causa:** Realtime não está ativado
- **Solução:** 
  1. Vá em "Database" > "Replication"
  2. Ative as tabelas manualmente
  3. Ou execute novamente a parte do script de tempo real

### Erro de permissão
- **Causa:** RLS está bloqueando operações
- **Solução:** Verifique as políticas em "Authentication" > "Policies"

### Script não executa completamente
- **Causa:** Erro em uma parte do script para toda a execução
- **Solução:** 
  1. Execute o script `supabase-setup-simple.sql` primeiro
  2. Depois execute `supabase-dados-iniciais.sql` separadamente
  3. Verifique cada parte individualmente

## 📱 Testando no Aplicativo

### 1. Teste de Conexão
```
URL: http://localhost:3000/configuracoes
Aba: Backup
Componente: "Teste de Conexão Supabase"
```

### 2. Teste de Tempo Real
```
URL: http://localhost:3000/configuracoes
Aba: Backup
Componente: "Teste de Tempo Real"
```

### 3. Página de Ativos
```
URL: http://localhost:3000/ativos
Mostra ativos carregados do servidor
```

## 🎉 Próximos Passos

1. ✅ **Tabelas criadas**
2. ✅ **Tempo real ativado**
3. ✅ **Testes funcionando**
4. 🚀 **Começar a desenvolver!**

### Funcionalidades Prontas:
- ✅ CRUD completo para todas as entidades
- ✅ Tempo real em todas as tabelas
- ✅ Serviços TypeScript tipados
- ✅ Componentes de teste
- ✅ Middleware de autenticação
- ✅ SSR configurado

### Próximas Implementações:
- 🔄 Formulários de cadastro
- 📊 Dashboards com dados reais
- 🔐 Sistema de autenticação
- 📱 Relatórios e exportações
- 🔔 Notificações em tempo real

---

## 📞 Suporte

Se encontrar problemas:

1. **Verifique os logs** do Supabase Dashboard
2. **Teste a conexão** na aba Backup
3. **Verifique o console** do navegador
4. **Execute o script SQL** novamente se necessário

**🎯 Sua aplicação está pronta para usar o Supabase com tempo real!**
