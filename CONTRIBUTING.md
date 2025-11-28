# Como Contribuir

Obrigado por considerar contribuir com o Assistente Financeiro IA! 🎉

## 📋 Código de Conduta

Este projeto segue um código de conduta. Ao participar, você concorda em manter um ambiente respeitoso e inclusivo.

## 🐛 Reportando Bugs

Antes de criar um issue:
1. Verifique se o bug já foi reportado
2. Use a versão mais recente
3. Inclua informações detalhadas:
   - Passos para reproduzir
   - Comportamento esperado vs atual
   - Screenshots (se aplicável)
   - Ambiente (OS, browser, versão)

## 💡 Sugerindo Features

Para sugerir novas funcionalidades:
1. Verifique se já não foi sugerida
2. Descreva claramente o problema que resolve
3. Explique como deveria funcionar
4. Considere alternativas

## 🔧 Desenvolvimento

### Setup

```bash
# Fork e clone o repositório
git clone https://github.com/seu-usuario/assistente-financeiro-ia.git

# Instale dependências
npm install

# Configure .env.local
cp .env.example .env.local

# Execute migrações
npm run db:migrate

# Inicie dev server
npm run dev
```

### Workflow

1. Crie uma branch: `git checkout -b feature/minha-feature`
2. Faça commits descritivos
3. Escreva/atualize testes se necessário
4. Execute `npm run lint` e `npm run type-check`
5. Push e abra um Pull Request

### Commits

Use mensagens claras e descritivas:
```
feat: adiciona filtro de período customizado
fix: corrige bug no registro de transações
docs: atualiza README com novas features
style: formata código com prettier
refactor: reorganiza estrutura de pastas
test: adiciona testes para chat API
```

### Pull Requests

- Descreva claramente as mudanças
- Referencie issues relacionados
- Inclua screenshots para mudanças visuais
- Mantenha PRs focados e pequenos
- Aguarde review antes de merge

## 📝 Documentação

Ao adicionar features:
- Atualize README.md
- Adicione entrada no CHANGELOG.md
- Documente APIs em docs/API.md
- Adicione JSDoc nos métodos principais

## 🧪 Testes

```bash
# Executar testes
npm run test

# Testes com UI
npm run test:ui

# Coverage
npm run test:coverage
```

## 🎨 Estilo de Código

- Use TypeScript
- Siga as regras do ESLint
- Use Prettier para formatação
- Mantenha componentes pequenos e focados
- Prefira hooks a classes
- Use nomes descritivos

## 📦 Estrutura de Pastas

```
src/
├── app/          # Rotas Next.js
├── components/   # Componentes React
├── hooks/        # Custom hooks
├── lib/          # Utilitários
├── services/     # Chamadas API
└── types/        # TypeScript types
```

## ❓ Dúvidas

Tem dúvidas? Abra uma discussão no GitHub ou entre em contato:
- Email: gabrielgomesdevbr@gmail.com

## 🙏 Obrigado!

Toda contribuição é valiosa, seja código, documentação, design ou feedback!
