# Guia de Deploy - Vercel

## ✅ Pré-Deploy Checklist

- [ ] Build local passou (`npm run build`)
- [ ] Variáveis de ambiente configuradas
- [ ] Migrações executadas no Supabase
- [ ] Google OAuth configurado
- [ ] Repositório no GitHub

## 🚀 Deploy no Vercel

### 1. Preparar Repositório

```bash
git add .
git commit -m "Preparando para deploy"
git push origin main
```

### 2. Importar no Vercel

1. Acesse [vercel.com](https://vercel.com)
2. **Add New Project**
3. Importe seu repositório do GitHub
4. Configure:
   - Framework: Next.js
   - Root Directory: `./`
   - Build Command: `npm run build`

### 3. Variáveis de Ambiente

No Vercel, vá em **Settings → Environment Variables**:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
OPENAI_API_KEY=sk-...
RESEND_API_KEY=re_...
NODE_ENV=production
```

**Importante:** Marque para todos os ambientes (Production, Preview, Development)

### 4. Configurar Supabase

No Supabase Dashboard:

**Authentication → URL Configuration:**
- Site URL: `https://seu-app.vercel.app`
- Redirect URLs: `https://seu-app.vercel.app/**`

### 5. Configurar Google OAuth

No Google Cloud Console:

**Authorized redirect URIs:**
```
https://seu-projeto.supabase.co/auth/v1/callback
```

### 6. Deploy!

Clique em **Deploy** e aguarde (2-5 min)

## ✅ Pós-Deploy

### Testar Funcionalidades

- [ ] Login com Google
- [ ] Chat registra transações
- [ ] Filtro de período
- [ ] Painel admin
- [ ] Mobile responsivo

### Performance

- [ ] Lighthouse Score > 90
- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 3s

## 🔧 Troubleshooting

**Erro: Invalid redirect URL**
→ Verificar URLs no Supabase

**Build falha**
→ Rodar `npm run build` local

**Chat não funciona**
→ Verificar `OPENAI_API_KEY`

## 📊 Monitoramento

- Vercel Analytics
- Function Logs
- Error tracking

Ver documentação completa em `walkthrough.md`
