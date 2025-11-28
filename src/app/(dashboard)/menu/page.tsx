import { Metadata } from 'next'
import Link from 'next/link'
import {
  Target,
  Tags,
  Settings,
  Users,
  Bell,
  HelpCircle,
  LogOut,
  ChevronRight,
  User,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Menu',
}

interface MenuSection {
  title: string
  items: MenuItem[]
}

interface MenuItem {
  icon: React.ComponentType<{ className?: string }>
  label: string
  href: string
  badge?: string
}

const menuSections: MenuSection[] = [
  {
    title: 'Finanças',
    items: [
      { icon: Target, label: 'Metas', href: '/goals' },
      { icon: Tags, label: 'Categorias', href: '/categories' },
    ],
  },
  {
    title: 'Conta',
    items: [
      { icon: User, label: 'Perfil', href: '/profile' },
      { icon: Users, label: 'Família', href: '/family' },
      { icon: Bell, label: 'Notificações', href: '/notifications', badge: '3' },
      { icon: Settings, label: 'Configurações', href: '/settings' },
    ],
  },
  {
    title: 'Suporte',
    items: [
      { icon: HelpCircle, label: 'Ajuda', href: '/help' },
    ],
  },
]

export default function MenuPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Menu</h1>
        <p className="text-sm md:text-base text-gray-500 mt-1">
          Acesse todas as funcionalidades
        </p>
      </div>

      {/* Menu Sections */}
      <div className="space-y-6">
        {menuSections.map((section, index) => (
          <div key={index}>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              {section.title}
            </h2>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
              {section.items.map((item, itemIndex) => {
                const Icon = item.icon

                return (
                  <Link
                    key={itemIndex}
                    href={item.href}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors touch-target"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Icon className="w-5 h-5 text-gray-600" />
                      </div>
                      <span className="font-medium text-gray-900">
                        {item.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.badge && (
                        <span className="px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded-full">
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}

        {/* Logout */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <button className="w-full flex items-center gap-3 p-4 text-red-600 hover:bg-red-50 transition-colors rounded-xl touch-target">
            <div className="p-2 bg-red-50 rounded-lg">
              <LogOut className="w-5 h-5" />
            </div>
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </div>

      {/* App Info */}
      <div className="text-center text-sm text-gray-500 pb-4">
        <p>Contas com IA v1.0.0</p>
        <p className="mt-1">© 2025 Todos os direitos reservados</p>
      </div>
    </div>
  )
}
