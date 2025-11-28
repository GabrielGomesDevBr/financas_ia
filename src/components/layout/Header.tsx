'use client'

import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LogOut, User, Users, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import { logger } from '@/lib/logger'

export function Header() {
  const [user, setUser] = useState<any>(null)
  const [family, setFamily] = useState<any>(null)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
        logger.debug('Header',)
        const response = await fetch('/api/user/me')

        if (!response.ok) {
          throw new Error('Erro ao buscar dados do usuário')
        }

        const data = await response.json()
        logger.debug('Header', data)

        if (data.user) {
          setUser(data.user)
          // Check if super admin
          setIsSuperAdmin(data.user.user_type === 'super_admin')
        }

        if (data.family) {
          setFamily(data.family)
        }
      } catch (error) {
        logger.error('Header', error)
      }
    }
    fetchData()
  }, [])

  const handleLogout = async () => {
    const toastId = toast.loading('Saindo...')

    try {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut()

      if (error) {
        throw error
      }

      toast.success('Logout realizado com sucesso!', { id: toastId })

      // Limpar dados locais
      setUser(null)
      setFamily(null)

      // Redirecionar para login
      router.push('/login')
      router.refresh()
    } catch (error) {
      logger.error('App', 'Erro ao fazer logout:', error)
      toast.error('Erro ao fazer logout', { id: toastId })
    }
  }

  return (
    <header className="hidden md:flex h-16 border-b bg-white/70 backdrop-blur-xl px-6 items-center justify-between sticky top-0 z-30 transition-all duration-200">
      <div>
        {family && (
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary-50 border border-primary-100">
              <Users className="w-4 h-4 text-primary-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">{family.name}</h3>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
              <p className="text-sm font-semibold text-gray-900">
                {user.user_metadata.full_name || 'Usuário'}
              </p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>

            <div className="relative group cursor-pointer">
              <div className="absolute -inset-0.5 bg-gradient-to-br from-primary-500 to-accent-600 rounded-full opacity-75 group-hover:opacity-100 transition duration-200 blur-[1px]"></div>
              {user.user_metadata.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt="Avatar"
                  className="relative h-10 w-10 rounded-full border-2 border-white object-cover"
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                  onError={(e) => e.currentTarget.style.display = 'none'}
                />
              ) : null}
              <div
                className="relative h-10 w-10 rounded-full bg-white flex items-center justify-center border-2 border-white"
                style={{ display: user.user_metadata.avatar_url ? 'none' : 'flex' }}
              >
                <User className="h-5 w-5 text-primary-600" />
              </div>
            </div>

            {isSuperAdmin && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/admin/dashboard')}
                title="Painel Admin"
                className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors rounded-xl gap-2"
              >
                <Shield className="h-4 w-4" />
                <span className="hidden lg:inline">Admin</span>
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              title="Sair"
              className="text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors rounded-xl"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}
