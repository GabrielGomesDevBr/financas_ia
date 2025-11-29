// Tools/Functions que o GPT pode chamar

export const tools = [
  {
    type: "function" as const,
    function: {
      name: "registrar_transacao",
      description: "Registra uma despesa ou receita. CHAME esta função quando você tiver: tipo (expense/income), valor (number), descrição (string) e categoria (string). Você pode obter essas informações da mensagem atual OU do histórico da conversa. Exemplo: se você perguntou 'Isso foi em Alimentação ou Lazer?' e o usuário respondeu 'Alimentação', então você TEM a categoria. Use o histórico para pegar valor e descrição de mensagens anteriores.",
      parameters: {
        type: "object",
        properties: {
          type: {
            type: "string",
            enum: ["expense", "income"],
            description: "Tipo da transação: expense (despesa) ou income (receita)"
          },
          amount: {
            type: "number",
            description: "Valor da transação em reais (apenas número, sem R$)"
          },
          description: {
            type: "string",
            description: "Descrição da transação"
          },
          category: {
            type: "string",
            description: "Nome da categoria (ex: Alimentação, Transporte, Salário, etc). Use APENAS as categorias principais, sem subcategorias."
          },
          date: {
            type: "string",
            description: "Data da transação no formato YYYY-MM-DD (se não mencionado, usar data atual)"
          }
        },
        required: ["type", "amount", "description", "category"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "buscar_transacoes",
      description: "Busca transações com filtros opcionais",
      parameters: {
        type: "object",
        properties: {
          type: {
            type: "string",
            enum: ["expense", "income", "all"],
            description: "Filtrar por tipo de transação"
          },
          category: {
            type: "string",
            description: "Filtrar por categoria específica"
          },
          start_date: {
            type: "string",
            description: "Data inicial (YYYY-MM-DD)"
          },
          end_date: {
            type: "string",
            description: "Data final (YYYY-MM-DD)"
          },
          limit: {
            type: "number",
            description: "Número máximo de resultados (padrão: 10)"
          }
        }
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "criar_orcamento",
      description: "Cria ou atualiza um orçamento para uma categoria",
      parameters: {
        type: "object",
        properties: {
          category: {
            type: "string",
            description: "Nome da categoria"
          },
          amount: {
            type: "number",
            description: "Valor do orçamento em reais"
          },
          period: {
            type: "string",
            enum: ["weekly", "monthly", "yearly"],
            description: "Período do orçamento (padrão: monthly)"
          }
        },
        required: ["category", "amount"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "criar_meta",
      description: "Cria uma meta financeira",
      parameters: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "Nome da meta (ex: 'Viagem para Europa')"
          },
          target_amount: {
            type: "number",
            description: "Valor alvo da meta em reais"
          },
          deadline: {
            type: "string",
            description: "Data limite para atingir a meta (YYYY-MM-DD)"
          },
          category: {
            type: "string",
            description: "Categoria da meta (viagem, emergência, compra, etc)"
          }
        },
        required: ["name", "target_amount"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "resumo_financeiro",
      description: "Retorna um resumo financeiro (receitas, despesas, saldo) de um período",
      parameters: {
        type: "object",
        properties: {
          period: {
            type: "string",
            enum: ["week", "month", "year", "all"],
            description: "Período para o resumo (padrão: month)"
          }
        }
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "explicar_funcionalidade",
      description: "Fornece explicações, tutoriais ou dicas sobre como usar uma funcionalidade específica da aplicação.",
      parameters: {
        type: "object",
        properties: {
          funcionalidade: {
            type: "string",
            enum: ["geral", "transacoes", "orcamentos", "metas", "relatorios", "chat"],
            description: "A funcionalidade que o utilizador quer entender. 'geral' para uma visão geral da app."
          },
          tipo: {
            type: "string",
            enum: ["tutorial", "dica", "explicacao"],
            description: "O tipo de conteúdo a ser retornado."
          }
        },
        required: ["funcionalidade"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "deletar_transacao",
      description: "Apaga uma transação existente. Use esta função quando o usuário pedir explicitamente para remover, apagar ou excluir uma despesa ou receita específica.",
      parameters: {
        type: "object",
        properties: {
          description: {
            type: "string",
            description: "Descrição da transação a ser apagada (para busca)"
          },
          amount: {
            type: "number",
            description: "Valor da transação (opcional, para ajudar na identificação)"
          },
          date: {
            type: "string",
            description: "Data da transação (opcional, YYYY-MM-DD)"
          }
        },
        required: ["description"]
      }
    }
  }
]
