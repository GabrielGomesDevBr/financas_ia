## Teste Rápido da Waitlist

**Objetivo:** Verificar se a página `/admin/waitlist` está funcionando apesar do erro de console.

### Passos:

1. Com o servidor rodando (`npm run dev`), abra o navegador
2. Acesse: `http://localhost:3000/admin/waitlist`
3. Aguarde carregar

### O que verificar:

**✅ SUCESSO se:**
- Página carregar normalmente
- Aparecer "Lucilene Gregorio da Silva" na lista
- E-mail: lucilenegreg83@gmail.com
- Botões "Aprovar" e "Bloquear" visíveis

**❌ FALHA se:**
- Página ficar em branco
- Erro "403 Forbidden"
- Mensagem "Erro ao carregar waitlist"

---

## Sobre os Erros do Console

### Erro 1: TypeError da sessão
**Não deve impedir funcionalidade** - É um warning sobre serialização de dados. Provavelmente ocorre em algum componente que tenta modificar a sessão.

### Erro 2: Service Worker  
**Pode ignorar** - Relacionado ao PWA, não afeta a waitlist.

---

## Se a Página Funcionar

Você pode **aprovar a Lucilene** clicando no botão "Aprovar". Ela receberá um e-mail de aprovação.

## Se a Página NÃO Funcionar

Me avise o que aparece (erro, tela branca, etc.) que vamos investigar mais.
