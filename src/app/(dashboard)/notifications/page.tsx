'use client'

import { useState } from 'react'
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Info,
  Receipt,
  Target,
  Users,
  Settings,
  Trash2,
  Check,
  Loader2,
  X,
} from 'lucide-react'
import { useNotifications } from '@/hooks/useNotifications'
import Link from 'next/link'

type NotificationType = 'transaction' | 'budget' | 'goal' | 'family' | 'system'

type FilterType = 'all' | 'unread' | 'transaction' | 'budget' | 'goal' | 'family'

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case 'transaction':
      return Receipt
    case 'budget':
      return AlertCircle
    case 'goal':
      return Target
    case 'family':
      return Users
    case 'system':
      return Info
    default:
      return Bell
  }
}

function getNotificationColor(type: NotificationType) {
  switch (type) {
    case 'transaction':
      return 'bg-purple-100 text-purple-600'
    case 'budget':
      return 'bg-yellow-100 text-yellow-600'
    case 'goal':
      return 'bg-green-100 text-green-600'
    case 'family':
      return 'bg-indigo-100 text-indigo-600'
    case 'system':
      return 'bg-blue-100 text-blue-600'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}

function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp)
  const now = new Date()
  const diffInHours = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  )

  if (diffInHours < 1) {
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    )
    if (diffInMinutes < 1) return 'Agora'
    return `${diffInMinutes}m atrás`
  } else if (diffInHours < 24) {
    return `${diffInHours}h atrás`
  } else {
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays === 1) return 'Ontem'
    if (diffInDays < 7) return `${diffInDays}d atrás`
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    })
  }
}

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications()

  const [filter, setFilter] = useState<FilterType>('all')

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === 'all') return true
    if (filter === 'unread') return !notif.is_read
    return notif.type === filter
  })

  const handleClearRead = async () => {
    const readNotifications = notifications.filter((n) => n.is_read)
    for (const notif of readNotifications) {
      await deleteNotification(notif.id)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="relative">
        {/* Decorative gradient blobs */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl -z-10 animate-pulse-subtle" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl -z-10" />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-h1 text-gray-900">
                Notificações
              </h1>
              {unreadCount > 0 && (
                <div className="px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full shadow-lg shadow-red-500/30 animate-pulse-subtle">
                  {unreadCount}
                </div>
              )}
            </div>
            <p className="text-muted-foreground mt-2 text-body-lg">
              Acompanhe suas atualizações e alertas
            </p>
          </div>

          <Link
            href="/settings"
            className="flex items-center justify-center md:justify-start gap-2 px-4 py-2 text-gray-600 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl transition-all hover:shadow-md touch-target"
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Configurar</span>
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      {notifications.length > 0 && (
        <div className="flex flex-wrap gap-2 animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
          <button
            type="button"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none"
          >
            <Check className="w-4 h-4" />
            Marcar todas como lidas
          </button>
          <button
            type="button"
            onClick={handleClearRead}
            disabled={notifications.filter((n) => n.is_read).length === 0}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm hover:shadow-md text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            <Trash2 className="w-4 h-4" />
            Limpar lidas
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${filter === 'all'
              ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20 scale-105'
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
            }`}
        >
          Todas
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${filter === 'unread'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 scale-105'
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
            }`}
        >
          Não lidas {unreadCount > 0 && `(${unreadCount})`}
        </button>
        <button
          onClick={() => setFilter('transaction')}
          className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${filter === 'transaction'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20 scale-105'
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
            }`}
        >
          Transações
        </button>
        <button
          onClick={() => setFilter('budget')}
          className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${filter === 'budget'
              ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20 scale-105'
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
            }`}
        >
          Orçamentos
        </button>
        <button
          onClick={() => setFilter('goal')}
          className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${filter === 'goal'
              ? 'bg-green-600 text-white shadow-lg shadow-green-600/20 scale-105'
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
            }`}
        >
          Metas
        </button>
        <button
          onClick={() => setFilter('family')}
          className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${filter === 'family'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 scale-105'
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
            }`}
        >
          Família
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3 animate-slide-in-up" style={{ animationDelay: '0.3s' }}>
        {filteredNotifications.map((notification) => {
          const Icon = getNotificationIcon(notification.type)
          const colorClass = getNotificationColor(notification.type)

          return (
            <div
              key={notification.id}
              className={`bg-white rounded-2xl shadow-sm border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${notification.is_read
                  ? 'border-gray-100'
                  : 'border-blue-200 bg-blue-50/30'
                }`}
            >
              <div className="p-4 md:p-6">
                <div className="flex gap-4">
                  {/* Icon */}
                  <div className={`p-3 rounded-xl ${colorClass} flex-shrink-0 shadow-sm`}>
                    <Icon className="w-5 h-5 md:w-6 md:h-6" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className={`font-bold text-sm md:text-base ${notification.is_read ? 'text-gray-900' : 'text-blue-900'}`}>
                        {notification.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        {!notification.is_read && (
                          <div className="w-2.5 h-2.5 bg-blue-600 rounded-full flex-shrink-0 mt-1.5 shadow-[0_0_8px_rgba(37,99,235,0.5)] animate-pulse-subtle" />
                        )}
                        <button
                          type="button"
                          onClick={() => deleteNotification(notification.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors p-1 hover:bg-red-50 rounded-lg"
                          aria-label="Excluir notificação"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                      {notification.message}
                    </p>

                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                        {formatTimestamp(notification.created_at)}
                      </span>

                      {notification.action_url && (
                        <Link
                          href={notification.action_url}
                          onClick={() => {
                            if (!notification.is_read) {
                              markAsRead(notification.id)
                            }
                          }}
                          className="text-xs text-blue-600 hover:text-blue-700 font-bold hover:underline flex items-center gap-1"
                        >
                          {notification.action_label || 'Ver detalhes'}
                          <span aria-hidden="true">&rarr;</span>
                        </Link>
                      )}

                      {!notification.is_read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs text-gray-500 hover:text-gray-900 font-medium transition-colors"
                        >
                          Marcar como lida
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredNotifications.length === 0 && (
        <div className="bg-white rounded-2xl p-12 shadow-lg border border-gray-100 text-center animate-scale-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-50 rounded-2xl mb-6 shadow-inner">
            <Bell className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-h3 text-gray-900 mb-2">
            {filter === 'all'
              ? 'Nenhuma notificação'
              : filter === 'unread'
                ? 'Nenhuma notificação não lida'
                : `Nenhuma notificação de ${filter}`}
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto text-body-lg">
            {filter === 'all'
              ? 'Você está em dia! Quando houver novidades, elas aparecerão aqui.'
              : 'Altere o filtro para ver outras notificações.'}
          </p>
        </div>
      )}
    </div>
  )
}
