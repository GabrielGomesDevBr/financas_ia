# Troubleshooting

## 🔥 Problemas REAIS (já aconteceram)

### 1. Budget retorna 404 para novos usuários

**Sintoma**: Usuário cria família mas não consegue acessar /budgets ou /goals (erro 404).

**Causa**: Falta registro em `family_members` table.

**Solução**:
```sql
-- Verificar se usuário tem family_members
SELECT * FROM family_members WHERE user_id = 'USER_ID';

-- Se vazio, executar fix
\i scripts/maintenance/fix_missing_family_members.sql
```

**Prevenção**: Já corrigido! API `/family/create` agora cria `family_members` automaticamente.

---

### 2. Convite não funciona (link inválido)

**Sintoma**: Link `/invite/[token]` retorna "Convite não encontrado".

**Causa**: RLS policies de `family_invites` estavam comentadas.

**Solução**:
```bash
# Executar migration
psql < supabase/migrations/20241128000002_fix_family_invites_rls.sql
```

**Verificar**:
```sql
SELECT * FROM pg_policies WHERE tablename = 'family_invites';
-- Deve retornar 6 policies
```

**Prevenção**: Já corrigido! Migration aplicada.

---

### 3. Cron de cleanup não executa

**Sintoma**: Contas deletadas não são removidas após 30 dias.

**Causa**: Falta configurar `CRON_SECRET` ou serviço de cron.

**Solução**:
```bash
# 1. Adicionar ao .env
CRON_SECRET=seu-secret-aqui

# 2. Configurar GitHub Actions ou Vercel Cron
# Ver docs/ACCOUNT_DELETION.md
```

**Testar manualmente**:
```bash
curl -X POST \
  -H "Authorization: Bearer $CRON_SECRET" \
  http://localhost:3000/api/cron/cleanup-deleted-users
```

---

### 4. "Module not found: @/utils/formatters"

**Sintoma**: Erro de build após adicionar utils.

**Causa**: TypeScript paths não configurado ou cache desatualizado.

**Solução**:
```bash
# Limpar cache
rm -rf .next
npm run build

# Verificar tsconfig.json paths
cat tsconfig.json | grep "@/utils"
```

---

### 5. PWA não instala em produção

**Sintoma**: Botão "Instalar App" não aparece em produção.

**Causa**: Service worker ou manifest incorreto.

**Solução**:
```bash
# 1. Verificar manifest em produção
curl https://seu-app.vercel.app/manifest.json

# 2. Verificar service worker
# DevTools → Application → Service Workers

# 3. Verificar HTTPS (obrigatório para PWA)
```

**Ver**: `docs/guides/PWA_SETUP.md`

---

### 6. Email de convite não envia

**Sintoma**: Convite criado mas email não chega.

**Causa**: API key do Resend inválida ou erro silencioso.

**Solução**:
```bash
# 1. Verificar RESEND_API_KEY
echo $RESEND_API_KEY

# 2. Ver logs
# Procurar por "Error sending invite email"

# 3. Testar Resend diretamente
# Dashboard Resend → Logs
```

---

### 7. Build fails com "Type error"

**Sintoma**: Build funciona local mas falha no Vercel.

**Causa**: Versões diferentes do TypeScript ou strict mode.

**Solução**:
```bash
# Local: usar mesma versão Node do Vercel
nvm use 18

# Verificar tipos
npm run type-check

# Ver package.json
"typescript": "^5.6.3"  # Mesma versão
```

---

## 🐛 Problemas Comuns

### Build Errors

**Erro: `Module not found`**

```bash
# Limpar cache e reinstalar
rm -rf .next node_modules
npm install
npm run build
```

**Erro: TypeScript errors**

```bash
# Verificar tipos
npm run type-check

# Ignorar temporariamente (não recomendado)
# next.config.js: typescript.ignoreBuildErrors = true
```

---

### Autenticação

**Erro: `Invalid redirect URL`**

**Solução:**
1. Supabase Dashboard → Authentication → URL Configuration
2. Adicionar URL em "Redirect URLs": `https://seu-app.vercel.app/**`

**Erro: `User not found in database`**

**Solução:**
- Verificar se trigger `check_user_access_on_signup` está ativo
- Executar migração `20240101000006_access_control.sql`

**Erro: Loop de redirecionamento**

**Solução:**
- Verificar middleware.ts
- Checar access_status do usuário no banco

---

### Chat / OpenAI

**Erro: `OpenAI API key not found`**

**Solução:**
```bash
# Verificar .env.local
echo $OPENAI_API_KEY

# Adicionar no Vercel
# Settings → Environment Variables
```

**Erro: `Rate limit exceeded`**

**Solução:**
- Verificar uso no dashboard OpenAI
- Adicionar créditos
- Implementar rate limiting

**Chat não registra transações**

**Solução:**
1. Verificar logs: `logger.debug('Chat', ...)`
2. Testar function calling manualmente
3. Verificar se categorias existem no banco

---

### Database

**Erro: `RLS policy violation`**

**Solução:**
```sql
-- Verificar políticas
SELECT * FROM pg_policies 
WHERE tablename = 'sua_tabela';

-- Desabilitar RLS temporariamente (dev only!)
ALTER TABLE sua_tabela DISABLE ROW LEVEL SECURITY;
```

**Erro: `Foreign key constraint`**

**Solução:**
- Verificar se registro referenciado existe
- Usar ON DELETE CASCADE se apropriado

**Migrações falhando**

**Solução:**
```bash
# Ver ordem correta
cat supabase/migrations/README.md

# Executar uma por vez
# Verificar erros antes de prosseguir
```

---

### Deploy

**Build falha no Vercel**

**Solução:**
1. Testar build local: `npm run build`
2. Verificar variáveis de ambiente
3. Checar logs do Vercel

**Variáveis de ambiente não funcionam**

**Solução:**
- Marcar para Production, Preview e Development
- Fazer redeploy após adicionar vars
- Usar `NEXT_PUBLIC_` para variáveis client-side

**404 em rotas dinâmicas**

**Solução:**
- Verificar estrutura de pastas
- Checar `[id]` vs `[slug]`
- Ver logs do Vercel Functions

---

### Performance

**Página lenta**

**Solução:**
```bash
# Analisar bundle
npm run build
# Ver output de tamanho

# Usar Lighthouse
# DevTools → Lighthouse → Run
```

**Muitas requisições**

**Solução:**
- Usar Server Components quando possível
- Implementar caching
- Batch requests

---

### Mobile / PWA

**PWA não instala**

**Solução:**
- Verificar `manifest.json`
- HTTPS obrigatório
- Service worker registrado

**Layout quebrado no mobile**

**Solução:**
- Testar em DevTools (responsive mode)
- Verificar breakpoints TailwindCSS
- Usar `sm:`, `md:`, `lg:` prefixes

---

## 🔍 Debug Tools

### Logs

```typescript
import { logger } from '@/lib/logger'

// Desenvolvimento apenas
logger.debug('Context', 'Message', data)

// Sempre
logger.error('Context', 'Error', error)
```

### Supabase Studio

1. Supabase Dashboard → Table Editor
2. Ver dados em tempo real
3. Executar queries SQL

### Vercel Logs

1. Vercel Dashboard → Deployments
2. Click no deployment
3. Ver Function Logs

### React DevTools

- Inspecionar componentes
- Ver props e state
- Performance profiling

---

## 📞 Suporte

**Não encontrou solução?**

1. Verificar [Issues no GitHub](https://github.com/seu-repo/issues)
2. Criar novo issue com:
   - Descrição do problema
   - Passos para reproduzir
   - Logs relevantes
   - Ambiente (OS, browser, versão)

3. Email: gabrielgomesdevbr@gmail.com

---

## 📚 Recursos

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [OpenAI Help](https://help.openai.com)
- [Vercel Support](https://vercel.com/support)
