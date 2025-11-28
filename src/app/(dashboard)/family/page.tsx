'use client'

import { useEffect, useState } from 'react'
import { Metadata } from 'next'
import {
  Users,
  Crown,
  Shield,
  UserPlus,
  Mail,
  MoreVertical,
  UserMinus,
  X,
  Loader2,
} from 'lucide-react'
import { MobileHeader } from '@/components/mobile/MobileHeader'
import toast from 'react-hot-toast'

interface FamilyMember {
  id: string
  name: string
  email: string
  role: 'admin' | 'member' | 'dependent'
  avatar_url: string | null
  joined_at: string
  transactions_count: number
}

interface FamilyInvite {
  id: string
  email: string
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'expired'
  created_at: string
  expires_at: string
  invited_by_user: {
    name: string
    email: string
  }
}

interface FamilyData {
  id: string
  name: string
  created_at: string
  members_count: number
  transactions_count: number
}

export default function FamilyPage() {
  const [family, setFamily] = useState<FamilyData | null>(null)
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [invites, setInvites] = useState<FamilyInvite[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteEmail, setInviteEmail] = useState('')
  const [sendingInvite, setSendingInvite] = useState(false)
  const [currentUserRole, setCurrentUserRole] = useState<string>('')

  useEffect(() => {
    fetchFamilyData()
  }, [])

  const fetchFamilyData = async () => {
    try {
      setLoading(true)

      // Fetch members
      const membersRes = await fetch('/api/family/members')
      if (!membersRes.ok) {
        throw new Error('Failed to fetch members')
      }
      const membersData = await membersRes.json()
      setFamily(membersData.family)
      setMembers(membersData.members)

      // Fetch current user profile to get role
      const profileRes = await fetch('/api/profile')
      if (profileRes.ok) {
        const profileData = await profileRes.json()
        setCurrentUserRole(profileData.profile.family?.role || '')
      }

      // Fetch invites
      const invitesRes = await fetch('/api/family/invite')
      if (invitesRes.ok) {
        const invitesData = await invitesRes.json()
        setInvites(invitesData.invites || [])
      }
    } catch (error) {
      console.error('Error fetching family data:', error)
      toast.error('Erro ao carregar dados da família')
    } finally {
      setLoading(false)
    }
  }

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!inviteEmail.trim()) {
      toast.error('Digite um email válido')
      return
    }

    try {
      setSendingInvite(true)

      const response = await fetch('/api/family/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao enviar convite')
      }

      toast.success('Convite enviado com sucesso!')
      setInviteEmail('')
      fetchFamilyData()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao enviar convite')
    } finally {
      setSendingInvite(false)
    }
  }

  const handleCancelInvite = async (inviteId: string) => {
    try {
      const response = await fetch(`/api/family/invite/${inviteId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao cancelar convite')
      }

      toast.success('Convite cancelado com sucesso')
      fetchFamilyData()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao cancelar convite')
    }
  }

  const handleResendInvite = async (inviteId: string) => {
    try {
      const response = await fetch(`/api/family/invite/${inviteId}/resend`, {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao reenviar convite')
      }

      toast.success('Convite reenviado com sucesso')
      fetchFamilyData()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao reenviar convite')
    }
  }

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (
      !confirm(
        `Tem certeza que deseja remover ${memberName} da família? Esta ação não pode ser desfeita.`
      )
    ) {
      return
    }

    try {
      const response = await fetch(`/api/family/members/${memberId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao remover membro')
      }

      toast.success('Membro removido com sucesso')
      fetchFamilyData()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao remover membro')
    }
  }

  const isAdmin = currentUserRole === 'admin'
  const pendingInvites = invites.filter((inv) => inv.status === 'pending')

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    )
  }

  if (!family) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <Users className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Você não está em uma família
        </h2>
        <p className="text-gray-600">
          Crie uma família ou aguarde um convite para começar.
        </p>
      </div>
    )
  }

  return (
    <>
      <MobileHeader title="Família" />
      <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="relative">
          {/* Decorative gradient blobs */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl -z-10 animate-pulse-subtle" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -z-10" />

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-h1 text-gray-900">
                Família
              </h1>
              <p className="text-muted-foreground mt-2 text-body-lg">
                Gerencie os membros da sua família
              </p>
            </div>
            {isAdmin && (
              <button
                onClick={() =>
                  document.getElementById('invite-section')?.scrollIntoView({
                    behavior: 'smooth',
                  })
                }
                className="flex items-center justify-center md:justify-start gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-200 touch-target"
              >
                <UserPlus className="w-5 h-5" />
                <span className="font-medium">Convidar Membro</span>
              </button>
            )}
          </div>
        </div>

        {/* Family Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="bg-white rounded-2xl p-6 shadow-lg shadow-blue-500/5 border border-blue-100 hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                <Users className="w-6 h-6" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">Total de Membros</p>
            <p className="text-3xl font-bold text-gray-900">
              {family.members_count}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg shadow-green-500/5 border border-green-100 hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-50 rounded-xl text-green-600">
                <Users className="w-6 h-6" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">Transações</p>
            <p className="text-3xl font-bold text-gray-900">
              {family.transactions_count}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg shadow-yellow-500/5 border border-yellow-100 hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-50 rounded-xl text-yellow-600">
                <Mail className="w-6 h-6" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">Convites Pendentes</p>
            <p className="text-3xl font-bold text-gray-900">
              {pendingInvites.length}
            </p>
          </div>
        </div>

        {/* Family Info Card */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200 animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white rounded-xl shadow-sm">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{family.name}</h3>
              <p className="text-sm text-gray-600 mb-3">
                Criada em{' '}
                {new Date(family.created_at).toLocaleDateString('pt-BR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
              <div className="flex flex-wrap gap-2">
                <div className="px-3 py-1 bg-white text-blue-600 text-xs font-bold rounded-full shadow-sm">
                  {family.members_count} MEMBROS
                </div>
                <div className="px-3 py-1 bg-white text-green-600 text-xs font-bold rounded-full shadow-sm">
                  {family.transactions_count} TRANSAÇÕES
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Members List */}
        <div className="space-y-4 animate-slide-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full" />
            <h2 className="text-h3 text-gray-900">
              Membros da Família
            </h2>
          </div>

          <div className="grid gap-4">
            {members.map((member) => {
              const initials = member.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)

              return (
                <div
                  key={member.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 p-4 md:p-6"
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full opacity-75 group-hover:opacity-100 blur transition duration-200" />
                      <div className="relative">
                        {member.avatar_url ? (
                          <img
                            src={member.avatar_url}
                            alt={member.name}
                            className="w-14 h-14 md:w-16 md:h-16 rounded-full object-cover border-2 border-white"
                          />
                        ) : (
                          <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 text-xl font-bold border-2 border-white">
                            {initials}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 pt-1">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-gray-900 text-base md:text-lg">
                            {member.name}
                          </h3>
                          {member.role === 'admin' && (
                            <div className="flex items-center gap-1 px-2.5 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full border border-yellow-200">
                              <Crown className="w-3 h-3" />
                              <span>Admin</span>
                            </div>
                          )}
                          {member.role === 'dependent' && (
                            <div className="px-2.5 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded-full border border-purple-200">
                              Dependente
                            </div>
                          )}
                        </div>
                      </div>

                      <p className="text-sm text-gray-500 mb-3">
                        {member.email}
                      </p>

                      {/* Stats */}
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex items-center gap-1.5 text-gray-600 bg-gray-50 px-2 py-1 rounded-lg">
                          <Shield className="w-3.5 h-3.5" />
                          <span>
                            Desde {new Date(member.joined_at).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-600 bg-gray-50 px-2 py-1 rounded-lg">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          <span>{member.transactions_count} transações</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Member Actions */}
                  {isAdmin && member.role !== 'admin' && (
                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                      <button
                        onClick={() => handleRemoveMember(member.id, member.name)}
                        className="flex items-center gap-2 px-3 py-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
                      >
                        <UserMinus className="w-4 h-4" />
                        Remover da Família
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Pending Invites */}
        {isAdmin && pendingInvites.length > 0 && (
          <div className="space-y-4 animate-slide-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-gradient-to-b from-yellow-500 to-yellow-600 rounded-full" />
              <h2 className="text-h3 text-gray-900">
                Convites Pendentes
              </h2>
            </div>

            <div className="space-y-3">
              {pendingInvites.map((invite) => (
                <div
                  key={invite.id}
                  className="bg-yellow-50/50 rounded-xl border border-yellow-200 p-4 hover:bg-yellow-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 bg-yellow-100 rounded-lg text-yellow-600">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {invite.email}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Enviado em {new Date(invite.created_at).toLocaleDateString('pt-BR')} • Expira em {new Date(invite.expires_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleResendInvite(invite.id)}
                        className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                      >
                        Reenviar
                      </button>
                      <button
                        onClick={() => handleCancelInvite(invite.id)}
                        className="px-3 py-1.5 border border-gray-300 bg-white text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Invite Section */}
        {isAdmin && (
          <div
            id="invite-section"
            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-slide-in-up"
            style={{ animationDelay: '0.5s' }}
          >
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                  <UserPlus className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Convidar Novo Membro
                </h3>
              </div>

              <p className="text-gray-600 mb-6 max-w-2xl">
                Envie um convite por email para adicionar um novo membro à sua
                família. Eles poderão registrar transações e visualizar as
                finanças compartilhadas.
              </p>

              <form onSubmit={handleSendInvite}>
                <div className="flex flex-col md:flex-row gap-3">
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="Digite o email do membro"
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    disabled={sendingInvite}
                  />
                  <button
                    type="submit"
                    disabled={sendingInvite}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-medium whitespace-nowrap touch-target disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30"
                  >
                    {sendingInvite ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Enviando...</span>
                      </>
                    ) : (
                      'Enviar Convite'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Permissions Info */}
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 animate-slide-in-up" style={{ animationDelay: '0.6s' }}>
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-gray-600" />
            Sobre Permissões
          </h3>
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-yellow-700 font-semibold">
                <Crown className="w-4 h-4" />
                Administradores
              </div>
              <p className="text-gray-600 leading-relaxed">
                Podem adicionar/remover membros, editar configurações da família e ter acesso total às finanças.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-blue-700 font-semibold">
                <Users className="w-4 h-4" />
                Membros
              </div>
              <p className="text-gray-600 leading-relaxed">
                Podem registrar transações, visualizar relatórios e gerenciar suas próprias metas.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-purple-700 font-semibold">
                <Shield className="w-4 h-4" />
                Dependentes
              </div>
              <p className="text-gray-600 leading-relaxed">
                Têm acesso limitado, podendo apenas visualizar transações e saldo disponível.
              </p>
            </div>
          </div>
        </div>

        {/* Mobile FAB */}
        {isAdmin && (
          <button
            type="button"
            onClick={() =>
              document.getElementById('invite-section')?.scrollIntoView({
                behavior: 'smooth',
              })
            }
            className="md:hidden fixed bottom-24 right-4 w-14 h-14 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full shadow-lg shadow-blue-500/40 hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center z-30"
            aria-label="Convidar membro"
          >
            <UserPlus className="w-6 h-6" />
          </button>
        )}
      </div>
    </>
  )
}
