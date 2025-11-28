# Guia de Deploy - Vercel

Este guia mostra como configurar corretamente as variáveis de ambiente e o Supabase para deploy em produção.

## 🎯 Configuração Rápida

### 1. Variáveis de Ambiente na Vercel

Acesse o dashboard da Vercel e configure as seguintes variáveis:

1. Vá para: **Project Settings** → **Environment Variables**
2. Adicione as seguintes variáveis:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key

# OpenAI
OPENAI_API_KEY=sk-sua-chave-openai

# Resend (Email)
RESEND_API_KEY=re_sua-chave-resend

# Application - IMPORTANTE: Use sua URL de produção
NEXT_PUBLIC_APP_URL=https://financas-ia-chi.vercel.app

# Admin & Support
SUPER_ADMIN_EMAIL=seu-email@exemplo.com
SUPPORT_EMAIL=suporte@exemplo.com

# Environment
NODE_ENV=production
```

> [!IMPORTANT]
> **A variável `NEXT_PUBLIC_APP_URL` DEVE ser a URL de produção**, não localhost!

### 2. Configuração do Supabase OAuth

No painel do Supabase:

1. Acesse: **Authentication** → **URL Configuration**

2. Em **Site URL**, configure:
   ```
   https://financas-ia-chi.vercel.app
   ```

3. Em **Redirect URLs**, adicione (uma por linha):
   ```
   https://financas-ia-chi.vercel.app/auth/callback
   http://localhost:3000/auth/callback
   ```

4. Clique em **Save**

### 3. Configuração do Google OAuth Provider

Se ainda não configurou o Google OAuth:

1. No Supabase, vá para: **Authentication** → **Providers**
2. Ative o **Google**
3. Configure usando suas credenciais do Google Cloud Console
4. As **Authorized redirect URIs** no Google Cloud devem incluir:
   ```
   https://seu-projeto.supabase.co/auth/v1/callback
   ```

## ✅ Verificação

Após configurar tudo:

1. **Faça um novo deploy** na Vercel (ou espere o auto-deploy)
2. **Acesse:** https://financas-ia-chi.vercel.app/login
3. **Clique em** "Entrar com Google"
4. **Verifique** se após o login você é redirecionado corretamente para o dashboard

## 🐛 Troubleshooting

### Ainda redireciona para localhost?

- ✅ Confirme que `NEXT_PUBLIC_APP_URL` está configurada na Vercel
- ✅ Verifique se fez um novo deploy após adicionar as variáveis
- ✅ Limpe o cache do navegador e tente novamente

### Erro "redirect_uri_mismatch"?

- ✅ Verifique se adicionou a URL de callback no Supabase
- ✅ Confirme se a URL do Google Cloud Console está correta

### Erro de autenticação?

- ✅ Verifique se todas as chaves do Supabase estão corretas
- ✅ Confirme se o Google OAuth está ativado no Supabase

## 📋 Checklist de Deploy

- [ ] Variáveis de ambiente configuradas na Vercel
- [ ] `NEXT_PUBLIC_APP_URL` aponta para URL de produção
- [ ] Site URL configurada no Supabase
- [ ] Redirect URLs adicionadas no Supabase
- [ ] Google OAuth configurado
- [ ] Deploy realizado
- [ ] Login testado em produção

## 🔗 Links Úteis

- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Supabase Auth Configuration](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google Cloud Console](https://console.cloud.google.com/)
