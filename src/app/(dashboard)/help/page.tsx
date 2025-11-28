import { Metadata } from 'next'
import {
  HelpCircle,
  Search,
  BookOpen,
  Video,
  MessageCircle,
  Mail,
  Phone,
  ChevronRight,
  ExternalLink,
  ChevronDown,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Ajuda',
}

interface FAQItem {
  question: string
  answer: string
  category: string
}

const faqs: FAQItem[] = [
  {
    category: 'Chat IA',
    question: 'Como registrar uma transação usando o Chat IA?',
    answer:
      'Basta conversar naturalmente com o assistente! Por exemplo: "Gastei R$ 50 no mercado hoje" ou "Recebi meu salário de R$ 5.000". O sistema entenderá e registrará automaticamente.',
  },
  {
    category: 'Chat IA',
    question: 'O Chat IA suporta que tipos de comandos?',
    answer:
      'O Chat IA pode registrar despesas e receitas, consultar saldos, criar orçamentos, verificar gastos por categoria e muito mais. Experimente fazer perguntas naturais!',
  },
  {
    category: 'Transações',
    question: 'Como editar ou excluir uma transação?',
    answer:
      'Vá para a página de Transações, encontre a transação desejada e clique no ícone de menu (três pontos). Você poderá editar ou excluir conforme necessário.',
  },
  {
    category: 'Transações',
    question: 'Posso importar transações de outros apps?',
    answer:
      'Sim! Vá em Configurações > Importar Dados e selecione um arquivo CSV ou conecte sua conta bancária. Estamos trabalhando para suportar mais formatos.',
  },
  {
    category: 'Orçamentos',
    question: 'Como criar um orçamento mensal?',
    answer:
      'Acesse a página de Orçamentos, clique em "Novo Orçamento", escolha a categoria e defina o valor limite. Você receberá alertas quando atingir 80% do limite.',
  },
  {
    category: 'Orçamentos',
    question: 'Posso ter orçamentos diferentes para cada membro da família?',
    answer:
      'Sim! Ao criar um orçamento, você pode definir se ele se aplica a toda a família ou apenas a membros específicos.',
  },
  {
    category: 'Família',
    question: 'Como adicionar membros à minha família?',
    answer:
      'Vá para a página Família e clique em "Convidar Membro". Digite o email da pessoa e envie o convite. Ela receberá um link para aceitar.',
  },
  {
    category: 'Família',
    question: 'Qual a diferença entre Admin e Membro?',
    answer:
      'Admins podem adicionar/remover membros, editar configurações e ter acesso total. Membros podem registrar transações e ver relatórios da família.',
  },
  {
    category: 'Segurança',
    question: 'Meus dados estão seguros?',
    answer:
      'Sim! Usamos criptografia de ponta a ponta, autenticação em duas etapas e seguimos as melhores práticas de segurança. Seus dados nunca são compartilhados com terceiros.',
  },
  {
    category: 'Conta',
    question: 'Como alterar minha senha?',
    answer:
      'Vá em Configurações > Segurança > Alterar Senha. Digite sua senha atual e a nova senha duas vezes para confirmar.',
  },
]

const helpCategories = [
  {
    icon: BookOpen,
    title: 'Primeiros Passos',
    description: 'Aprenda o básico para começar',
    articles: 12,
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: MessageCircle,
    title: 'Chat IA',
    description: 'Como usar o assistente inteligente',
    articles: 8,
    color: 'bg-purple-100 text-purple-600',
  },
  {
    icon: Video,
    title: 'Vídeos Tutoriais',
    description: 'Aprenda assistindo',
    articles: 15,
    color: 'bg-red-100 text-red-600',
  },
  {
    icon: HelpCircle,
    title: 'Perguntas Frequentes',
    description: 'Respostas rápidas',
    articles: 24,
    color: 'bg-green-100 text-green-600',
  },
]

export default function HelpPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="text-center md:text-left">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Central de Ajuda
        </h1>
        <p className="text-sm md:text-base text-gray-500 mt-2">
          Encontre respostas e aprenda a usar todos os recursos
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Pesquisar artigos, tutoriais, perguntas..."
          className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
        />
      </div>

      {/* Help Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {helpCategories.map((category, index) => {
          const Icon = category.icon

          return (
            <button
              key={index}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all text-left group"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${category.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                    {category.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">
                    {category.description}
                  </p>
                  <p className="text-xs text-gray-400">
                    {category.articles} artigos
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>
            </button>
          )
        })}
      </div>

      {/* FAQ Section */}
      <div className="space-y-4">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">
          Perguntas Frequentes
        </h2>

        {/* FAQ Categories Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium whitespace-nowrap">
            Todas
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium whitespace-nowrap">
            Chat IA
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium whitespace-nowrap">
            Transações
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium whitespace-nowrap">
            Orçamentos
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium whitespace-nowrap">
            Família
          </button>
        </div>

        {/* FAQ List */}
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <details
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-100 group"
            >
              <summary className="p-4 md:p-6 cursor-pointer list-none flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                      {faq.category}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm md:text-base">
                    {faq.question}
                  </h3>
                </div>
                <ChevronDown className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform flex-shrink-0" />
              </summary>
              <div className="px-4 md:px-6 pb-4 md:pb-6 pt-0">
                <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* Contact Support */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 md:p-8 border border-blue-200">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Ainda precisa de ajuda?
          </h3>
          <p className="text-gray-600">
            Nossa equipe está pronta para ajudar você
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Chat */}
          <button className="bg-white rounded-xl p-4 hover:shadow-md transition-shadow text-center group">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3 group-hover:bg-blue-200 transition-colors">
              <MessageCircle className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">Chat ao Vivo</h4>
            <p className="text-sm text-gray-500 mb-3">
              Resposta em minutos
            </p>
            <span className="text-sm text-blue-600 font-medium">
              Iniciar chat
            </span>
          </button>

          {/* Email */}
          <button className="bg-white rounded-xl p-4 hover:shadow-md transition-shadow text-center group">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-3 group-hover:bg-purple-200 transition-colors">
              <Mail className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">Email</h4>
            <p className="text-sm text-gray-500 mb-3">
              Resposta em 24h
            </p>
            <span className="text-sm text-purple-600 font-medium">
              Enviar email
            </span>
          </button>

          {/* Phone */}
          <button className="bg-white rounded-xl p-4 hover:shadow-md transition-shadow text-center group">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3 group-hover:bg-green-200 transition-colors">
              <Phone className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">Telefone</h4>
            <p className="text-sm text-gray-500 mb-3">
              Seg-Sex 9h-18h
            </p>
            <span className="text-sm text-green-600 font-medium">
              (11) 3000-0000
            </span>
          </button>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            Links Úteis
          </h3>
        </div>

        <div className="divide-y divide-gray-100">
          <a
            href="#"
            className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
              <span className="font-medium text-gray-900 group-hover:text-blue-600">
                Documentação Completa
              </span>
            </div>
            <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
          </a>

          <a
            href="#"
            className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <Video className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
              <span className="font-medium text-gray-900 group-hover:text-blue-600">
                Canal no YouTube
              </span>
            </div>
            <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
          </a>

          <a
            href="#"
            className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <MessageCircle className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
              <span className="font-medium text-gray-900 group-hover:text-blue-600">
                Comunidade no Discord
              </span>
            </div>
            <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
          </a>

          <a
            href="#"
            className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <HelpCircle className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
              <span className="font-medium text-gray-900 group-hover:text-blue-600">
                Base de Conhecimento
              </span>
            </div>
            <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
          </a>
        </div>
      </div>
    </div>
  )
}
