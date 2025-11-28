# 🚀 Quick Start Guide

## Primeiros Passos (5 minutos)

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar Supabase

**Criar projeto:**
1. Acesse https://supabase.com
2. Clique em "New Project"
3. Escolha nome e senha
4. Aguarde ~2 minutos para provisionar

**Aplicar migrações:**

No dashboard do Supabase:
1. Vá em **SQL Editor**
2. Clique em **New Query**
3. Copie e execute `supabase/migrations/001_initial_schema.sql`
4. Repita para `002_rls_policies.sql`
5. Repita para `003_seed_categories.sql`

**Pegar credenciais:**
1. Vá em **Settings** > **API**
2. Copie:
   - `URL` → NEXT_PUBLIC_SUPABASE_URL
   - `anon public` → NEXT_PUBLIC_SUPABASE_ANON_KEY
   - `service_role` → SUPABASE_SERVICE_ROLE_KEY (⚠️ nunca exponha no frontend!)

### 3. Configurar Google OAuth

No Supabase:
1. **Authentication** > **Providers** > **Google**
2. Habilite o provider

No Google Cloud Console (https://console.cloud.google.com):
1. Crie um projeto
2. Vá em **APIs & Services** > **Credentials**
3. Clique em **Create Credentials** > **OAuth client ID**
4. Configure:
   - Application type: **Web application**
   - Authorized redirect URIs: `https://seu-projeto.supabase.co/auth/v1/callback`
5. Copie **Client ID** e **Client Secret**
6. Cole no Supabase (passo 1)

### 4. Configurar OpenAI

1. Acesse https://platform.openai.com
2. Crie uma API key
3. Copie a key

### 5. Criar arquivo .env.local

```bash
cp .env.example .env.local
```

Edite `.env.local` com suas credenciais:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
OPENAI_API_KEY=sk-...
RESEND_API_KEY=re_... # opcional por enquanto
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 6. Rodar o projeto

```bash
npm run dev
```

Acesse: http://localhost:3000

---

## ✅ Checklist

- [ ] Projeto Supabase criado
- [ ] Migrações aplicadas (3 arquivos SQL)
- [ ] Google OAuth configurado
- [ ] OpenAI API key obtida
- [ ] Arquivo `.env.local` criado e preenchido
- [ ] `npm install` executado
- [ ] `npm run dev` rodando
- [ ] App abrindo em http://localhost:3000

---

## 🐛 Problemas Comuns

### "Error: Invalid JWT"
- ✅ Verifique se copiou as chaves corretas do Supabase
- ✅ Confirme que não há espaços extras no `.env.local`

### "Tabela não encontrada"
- ✅ Execute as migrações na ordem correta
- ✅ Verifique erros no SQL Editor do Supabase

### "Google OAuth não funciona"
- ✅ Confirme que adicionou a URL de callback correta
- ✅ Verifique se o Google OAuth está habilitado no Supabase

### Build falha
- ✅ Delete a pasta `.next` e rode `npm run build` novamente
- ✅ Confirme que todas as variáveis de ambiente estão definidas

---

## 📚 Próximos Passos

Após o setup, você pode:

1. **Explorar o banco de dados** no Supabase Table Editor
2. **Ver as categorias** na tabela `categories`
3. **Começar a desenvolver** as páginas de autenticação
4. **Ler a documentação completa** em [PROJETO_ASSISTENTE_FINANCEIRO.md](PROJETO_ASSISTENTE_FINANCEIRO.md)

---

## 🆘 Precisa de Ajuda?

- 📖 Documentação completa: [PROJETO_ASSISTENTE_FINANCEIRO.md](PROJETO_ASSISTENTE_FINANCEIRO.md)
- 📋 Instruções detalhadas: [README.md](README.md)
- ✅ Status do setup: [SETUP_COMPLETO.md](SETUP_COMPLETO.md)

---

**Tempo estimado de setup: 10-15 minutos** ⏱️
