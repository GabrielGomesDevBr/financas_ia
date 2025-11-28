# Guia de Configuração PWA - Vercel

## Por que o PWA não funciona em desenvolvimento local?

O PWA está **intencionalmente desabilitado** em ambiente de desenvolvimento (ver [next.config.js](next.config.js:3)):

```javascript
disable: process.env.NODE_ENV === 'development',
```

**Motivo**: Chrome requer **HTTPS** para PWA funcionar. Em desenvolvimento local (HTTP), o PWA não funcionará.

## Como Testar o PWA

### ❌ NÃO FUNCIONA:
- `http://localhost:3000` - Sem HTTPS, sem PWA
- Navegador em modo desenvolvimento local

### ✅ FUNCIONA:
- **Vercel (produção)**: `https://seu-dominio.vercel.app`
- **Vercel (preview)**: Deploy de preview também tem HTTPS
- Qualquer ambiente com HTTPS válido

## Configuração no Vercel

### 1. Variáveis de Ambiente

No painel da Vercel, configure:

```
NEXT_PUBLIC_APP_URL=https://seu-dominio.vercel.app
NODE_ENV=production
```

### 2. Build Settings

O Vercel detecta automaticamente Next.js, mas confirme:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 3. Headers (vercel.json)

O arquivo `vercel.json` já está configurado com:

- **Service Worker** (`/sw.js`):
  - `Cache-Control: public, max-age=0, must-revalidate` - Sempre busca nova versão
  - `Service-Worker-Allowed: /` - Permite SW em todo o site

- **Manifest** (`/manifest.json`):
  - `Content-Type: application/manifest+json` - Tipo correto
  - `Cache-Control: public, max-age=3600` - Cache de 1 hora

- **Ícones** (`/icons/*`):
  - `Cache-Control: public, max-age=31536000, immutable` - Cache permanente

## Como Testar Após Deploy

### 1. Acesse a URL de Produção
```
https://seu-dominio.vercel.app
```

### 2. Verifique no Chrome DevTools (Desktop)
1. F12 → Aba **Application**
2. **Manifest**: Deve mostrar todos os campos
3. **Service Workers**: Deve estar "activated and running"
4. **Storage**: Deve ter cache do Workbox

### 3. Teste no Chrome Mobile (Android)

#### Método 1: Menu dos Três Pontos
1. Navegue pelo app por ~30 segundos
2. Menu (⋮) → Deve aparecer **"Instalar app"**
3. Se aparecer só "Adicionar à tela inicial", aguarde mais ou recarregue

#### Método 2: Banner Customizado
1. Navegue pelo app
2. Banner aparece automaticamente (indigo/roxo)
3. Clique em "Instalar"

### 4. Página de Diagnóstico
Acesse em produção:
```
https://seu-dominio.vercel.app/pwa-debug
```

Todos os checks devem estar **verdes (✓)**

## Checklist de Instalabilidade PWA

O Chrome verifica:

- [x] ✅ HTTPS válido
- [x] ✅ Manifest válido com campos obrigatórios
- [x] ✅ Ícone ≥192x192px
- [x] ✅ Ícone ≥512x512px (maskable)
- [x] ✅ `display: standalone`
- [x] ✅ `start_url` definido
- [x] ✅ Service Worker registrado
- [x] ✅ Service Worker com fetch handler
- [x] ✅ ~30 segundos de engajamento do usuário

## Arquivos PWA Importantes

```
/public
├── manifest.json          # Configuração do PWA
├── sw.js                  # Service Worker (gerado automaticamente)
└── /icons
    ├── icon-72x72.png
    ├── icon-96x96.png
    ├── icon-128x128.png
    ├── icon-144x144.png
    ├── icon-152x152.png
    ├── icon-192x192.png   # ⭐ Obrigatório (≥192px)
    ├── icon-384x384.png
    └── icon-512x512.png   # ⭐ Obrigatório (≥512px)

/src
├── /hooks
│   └── usePWAInstall.ts   # Hook do beforeinstallprompt
├── /components
│   └── /pwa
│       └── PWAInstallPrompt.tsx  # Banner de instalação
└── /lib
    └── pwa-register.ts    # Registro manual do SW
```

## Troubleshooting

### "Instalar app" não aparece no Chrome

**Possíveis causas:**
1. **Não aguardou 30 segundos** - Chrome precisa de engajamento
2. **Service Worker não ativado** - Verifique em DevTools
3. **Manifest com erro** - Use `/pwa-debug` para diagnosticar
4. **Já instalado** - Desinstale e teste novamente
5. **Cache do navegador** - Hard refresh (Ctrl+Shift+R)

**Solução:**
```bash
# Desktop - Chrome DevTools
1. F12 → Application → Clear storage → "Clear site data"
2. Recarregue a página
3. Aguarde 30-60 segundos
4. Verifique novamente
```

### Service Worker não registra

**Verifique:**
```javascript
// Console do navegador
navigator.serviceWorker.getRegistration().then(reg => {
  console.log('SW State:', reg?.active?.state)
})
```

**Estados válidos:**
- `activated` ✅ - Funcionando
- `activating` ⏳ - Aguarde
- `installed` ⏳ - Aguarde
- `installing` ⏳ - Aguarde
- `undefined` ❌ - Não registrado

### Manifest não carrega

**Verifique:**
```javascript
// Console do navegador
fetch('/manifest.json')
  .then(r => r.json())
  .then(m => console.log('Manifest:', m))
```

## Comandos Úteis

```bash
# Desenvolvimento local (PWA desabilitado)
npm run dev

# Build de produção
npm run build

# Testar build localmente (ainda sem HTTPS)
npm run start

# Deploy no Vercel
git push origin main  # Auto-deploy se configurado
# OU
vercel --prod
```

## Links Úteis

- [Chrome PWA Installability](https://web.dev/install-criteria/)
- [Next PWA Docs](https://github.com/shadowwalker/next-pwa)
- [Workbox](https://developers.google.com/web/tools/workbox)
- [Web App Manifest](https://web.dev/add-manifest/)
- [Service Worker Lifecycle](https://web.dev/service-worker-lifecycle/)

## Qual é a URL do seu app no Vercel?

Após o deploy, sua URL será algo como:
```
https://contas-ia.vercel.app
https://financas-ia.vercel.app
https://seu-dominio-customizado.com
```

**Configure em**:
1. Vercel Dashboard → Settings → Domains
2. Vercel Dashboard → Settings → Environment Variables → `NEXT_PUBLIC_APP_URL`

---

**Resumo**: O PWA **só funciona em produção (HTTPS)**. Faça deploy no Vercel e teste lá! 🚀
