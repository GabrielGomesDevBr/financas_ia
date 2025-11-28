# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [1.1.0] - 2024-11-28

### Adicionado
- **Sistema Completo de Convites**
  - RLS policies para family_invites (6 políticas de segurança)
  - API para enviar convites (`POST /api/family/invite`)
  - API para aceitar convites (`POST /api/family/invite/[token]`)
  - API para reenviar convites (`POST /api/family/invite/[id]/resend`)
  - Página pública linda para aceitar convites (`/invite/[token]`)
  - Sincronização automática de family_members ao aceitar convite
  - Validação de token, status e expiração
  - Emails automáticos com links de convite

- **Deleção de Conta com Soft Delete**
  - Sistema de soft delete com período de recuperação de 30 dias
  - API para deletar conta (`DELETE /api/user/delete-account`)
  - API para reativar conta (`POST /api/user/delete-account`)
  - UI completa em Settings com "Zona de Perigo"
  - Modal de confirmação dupla (digitar DELETE)
  - Função automática de cleanup (`cleanup_expired_user_deletions`)
  - Endpoint de cron manual (`/api/cron/cleanup-deleted-users`)
  - Compliance com GDPR/LGPD (direito ao esquecimento)
  - Sugestão (não obrigatório) para admin transferir cargo
  - Deleção completa de TODOS os dados do usuário

- **Fix: Family Members Sync**
  - Correção automática na criação de família
  - API agora cria family_members automaticamente
  - Script SQL para backfill de usuários existentes
  - Sincronização garantida em family/create e invite/accept

### Corrigido
- Bug onde novos usuários recebiam erro 404 em Budget e Goals
- Problema de usuários sem family_members após criar família
- RLS policies de family_invites que estavam comentadas
- Sincronização inconsistente entre users.family_id e family_members

### Migrations
- `20241128000002_fix_family_invites_rls.sql` - RLS policies para convites
- `20241128000003_add_soft_delete.sql` - Soft delete e auto-cleanup

### Documentação
- Adicionado guia completo de testes
- Documentação de sistema de convites
- Documentação de deleção de conta
- Scripts SQL documentados

## [1.0.0] - 2024-11-25

### Adicionado
- Sistema de chat com IA (GPT-4o) para registro de transações
- Dashboard interativo com visualização de finanças
- Gestão familiar com múltiplos usuários
- PWA mobile-first com suporte offline
- Sistema de controle de acesso (waitlist)
- Painel administrativo com métricas
- Filtro de período global (7d, 30d, 90d, 1y, custom)
- Sistema de metas financeiras
- Orçamentos por categoria
- Notificações personalizadas
- Suporte a múltiplas personalidades de IA
- Markdown e emojis nas respostas do chat
- Avatares visuais (Google + ícones)

### Melhorado
- Logger profissional (apenas dev)
- Documentação completa e organizada
- Estrutura de código profissional
- Build otimizado (102 KB first load)
- Responsividade mobile
- UX do chat
- Performance geral

### Corrigido
- Problemas de autenticação
- Bugs no registro de transações
- Erros de validação de categoria
- Issues de responsividade
- Warnings do build

### Segurança
- Row Level Security (RLS) em todas as tabelas
- Middleware de proteção de rotas
- Validação de permissões em APIs
- Sanitização de inputs

## [0.9.0] - 2024-11-20

### Adicionado
- Sistema de categorias e subcategorias
- Exportação de dados
- Histórico de conversas
- Modo escuro (preparação)

### Melhorado
- Performance do chat
- Validação de formulários
- Mensagens de erro

## [0.8.0] - 2024-11-15

### Adicionado
- Autenticação com Google
- Onboarding de novos usuários
- Criação de famílias

### Melhorado
- UI/UX geral
- Feedback visual

## [0.5.0] - 2024-11-10

### Adicionado
- Estrutura inicial do projeto
- Configuração Supabase
- Configuração OpenAI
- Rotas básicas

---

**Nota:** Versões anteriores a 1.0.0 foram de desenvolvimento interno.
