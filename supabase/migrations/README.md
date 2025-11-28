# Migrações do Banco de Dados

## 📋 Ordem de Execução

As migrações devem ser executadas na seguinte ordem:

### Migrações Ativas

1. **20240101000000_create_missing_tables.sql**
   - Cria tabelas principais (users, families, transactions, etc)
   - Configura RLS básico

2. **20240101000001_create_family_members.sql**
   - Adiciona suporte a membros da família
   - Relacionamentos entre users e families

3. **20240101000002_fix_schema_issues.sql**
   - Correções de schema
   - Ajustes de constraints

4. **20240101000003_create_audit_logs.sql**
   - Tabela de logs de auditoria
   - Tracking de ações admin

5. **20240101000004_add_user_settings_columns.sql**
   - Colunas de configurações do usuário
   - Preferências e notificações

6. **20240101000005_add_assistant_personality.sql**
   - Campo de personalidade do assistente
   - Suporte a múltiplas personas

7. **20240101000006_access_control.sql**
   - Sistema de controle de acesso
   - Waitlist e aprovação de usuários
   - Super admin

8. **20240101000007_create_conversations.sql**
   - Tabela de conversas do chat
   - Histórico de mensagens

## 🚀 Como Executar

### Opção 1: Script Automático

```bash
npm run db:migrate
```

### Opção 2: Manual (Supabase Studio)

1. Acesse Supabase Studio
2. Vá em **SQL Editor**
3. Execute cada arquivo na ordem acima
4. Verifique erros antes de prosseguir

### Opção 3: Supabase CLI

```bash
supabase db reset
supabase db push
```

## 📦 Migrações Arquivadas

As migrações antigas (001-006) foram movidas para `archive/`:
- Mantidas para referência histórica
- Não devem ser executadas em novos ambientes
- Funcionalidade já incluída nas migrações ativas

## ✅ Verificação

Após executar todas as migrações, verifique:

```sql
-- Listar todas as tabelas
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Verificar RLS
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

Tabelas esperadas:
- users
- families
- family_members
- transactions
- categories
- subcategories
- budgets
- goals
- notifications
- chat_messages
- conversations
- usage_metrics
- admin_audit_logs
- waitlist

## 🔄 Rollback

Se necessário fazer rollback:

```sql
-- Exemplo: reverter última migração
DROP TABLE IF EXISTS conversations CASCADE;
```

**⚠️ Cuidado:** Rollback pode causar perda de dados!

## 📝 Criar Nova Migração

```bash
# Formato: YYYYMMDDHHMMSS_description.sql
touch supabase/migrations/$(date +%Y%m%d%H%M%S)_add_new_feature.sql
```

## 🔐 Segurança

- Todas as tabelas têm RLS ativado
- Políticas específicas por tabela
- Service role bypass RLS (cuidado!)

## 📚 Referências

- [Supabase Migrations](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
