# Configuração do Supabase para Produção

Este guia explica como configurar corretamente o Supabase para funcionar com OAuth em produção.

## 🔐 URLs de Autenticação

### 1. Acessar Configurações

1. Acesse o [Dashboard do Supabase](https://app.supabase.com/)
2. Selecione seu projeto
3. Vá para: **Authentication** → **URL Configuration**

### 2. Configurar Site URL

O Site URL é a URL principal da sua aplicação.

**Para produção:**
```
https://financas-ia-chi.vercel.app
```

**Para desenvolvimento local:**
```
http://localhost:3000
```

> [!TIP]
> Você pode ter apenas uma Site URL configurada. Use a URL de produção e continue usando localhost para desenvolvimento (localhost sempre funciona).

### 3. Configurar Redirect URLs

As Redirect URLs são os endpoints que o Supabase pode redirecionar após autenticação.

Adicione **ambas** as URLs (uma por linha):

```
https://financas-ia-chi.vercel.app/auth/callback
http://localhost:3000/auth/callback
```

> [!IMPORTANT]
> É necessário incluir **tanto a URL de produção quanto a de desenvolvimento** para que o OAuth funcione em ambos os ambientes.

## 🔑 Configurar Google OAuth

### 1. No Supabase

1. Vá para: **Authentication** → **Providers**
2. Encontre e clique em **Google**
3. Ative o toggle **Enable Sign in with Google**

### 2. No Google Cloud Console

Se ainda não tem credenciais OAuth configuradas:

1. Acesse: [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Vá para: **APIs & Services** → **Credentials**
4. Clique em **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure:
   - **Application type:** Web application
   - **Name:** Assistente Financeiro IA (ou nome de sua preferência)
   
6. Em **Authorized redirect URIs**, adicione:
   ```
   https://SEU-PROJETO.supabase.co/auth/v1/callback
   ```
   
   > [!WARNING]
   > Substitua `SEU-PROJETO` pelo ID real do seu projeto Supabase (encontre em Project Settings → General → Project URL)

7. Clique em **Create**
8. Copie o **Client ID** e **Client Secret**

### 3. Conectar Google ao Supabase

De volta ao Supabase:

1. Na página do provider Google, cole:
   - **Client ID** (from Google)
   - **Client Secret** (from Google)
2. Clique em **Save**

## ✅ Verificação

Para verificar se está tudo configurado:

1. **Teste em produção:**
   - Acesse: https://financas-ia-chi.vercel.app/login
   - Clique em "Entrar com Google"
   - Verifique se redireciona corretamente após login

2. **Teste em desenvolvimento:**
   - Acesse: http://localhost:3000/login
   - Clique em "Entrar com Google"
   - Verifique se funciona localmente

## 🐛 Problemas Comuns

### "redirect_uri_mismatch"

**Causa:** A URL de callback não está registrada no Google Cloud Console.

**Solução:** 
- Verifique se `https://SEU-PROJETO.supabase.co/auth/v1/callback` está nas Authorized redirect URIs do Google Cloud

### "Invalid Redirect URL"

**Causa:** A URL de callback não está nas Redirect URLs do Supabase.

**Solução:**
- Adicione `https://financas-ia-chi.vercel.app/auth/callback` nas Redirect URLs do Supabase

### Ainda redireciona para localhost

**Causa:** Variável de ambiente `NEXT_PUBLIC_APP_URL` não está configurada na Vercel.

**Solução:**
- Veja o [Guia de Deploy da Vercel](./deploy-vercel.md) para configurar as variáveis de ambiente

## 📸 Screenshots

### URL Configuration no Supabase

```
Site URL:
https://financas-ia-chi.vercel.app

Redirect URLs:
https://financas-ia-chi.vercel.app/auth/callback
http://localhost:3000/auth/callback
```

### Google OAuth Provider

```
Provider: Google
Enabled: ✓
Client ID: xxx...xxx.apps.googleusercontent.com
Client Secret: GOCSPX-xxx...xxx
```

## 🔗 Links de Referência

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Google OAuth Setup](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Vercel Deployment Guide](./deploy-vercel.md)
