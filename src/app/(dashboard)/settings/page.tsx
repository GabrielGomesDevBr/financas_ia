'use client'

import { useEffect, useState } from 'react'
import {
  Bell,
  Lock,
  Globe,
  Moon,
  Download,
  Trash2,
  Shield,
  CreditCard,
  Loader2,
  Eye,
  EyeOff,
  X,
  Target,
  Receipt,
  Users,
  Code,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react'
import { MobileHeader } from '@/components/mobile/MobileHeader'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface UserSettings {
  notifications_enabled: boolean
  budget_alerts: boolean
  goal_alerts: boolean
  transaction_alerts: boolean
  family_alerts: boolean
  theme: 'light' | 'dark' | 'auto'
  language: string
  currency: string
  date_format: string
  profile_visibility: 'public' | 'family' | 'private'
  show_transaction_details: boolean
  assistant_personality: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [changingPassword, setChangingPassword] = useState(false)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchSettings()
    checkSuperAdmin()
  }, [])

  const checkSuperAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: userData } = await supabase
        .from('users')
        .select('user_type')
        .eq('id', user.id)
        .single()
      setIsSuperAdmin(userData?.user_type === 'super_admin')
    }
  }

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/settings')
      if (!response.ok) throw new Error('Failed to fetch settings')

      const data = await response.json()
      setSettings(data.settings)
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast.error('Erro ao carregar configurações')
    } finally {
      setLoading(false)
    }
  }

  const updateSetting = async (key: keyof UserSettings, value: any) => {
    try {
      setSaving(true)

      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value }),
      })

      if (!response.ok) throw new Error('Failed to update setting')

      const data = await response.json()
      setSettings(data.settings)
      toast.success('Configuração atualizada')
    } catch (error) {
      console.error('Error updating setting:', error)
      toast.error('Erro ao atualizar configuração')
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = (key: keyof UserSettings) => {
    if (!settings) return
    const newValue = !settings[key]
    setSettings({ ...settings, [key]: newValue })
    updateSetting(key, newValue)
  }

  const handleExportData = async () => {
    try {
      const response = await fetch('/api/user/export-data')
      if (!response.ok) throw new Error('Failed to export data')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `transacoes_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('Dados exportados com sucesso')
    } catch (error) {
      console.error('Error exporting data:', error)
      toast.error('Erro ao exportar dados')
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('As senhas não coincidem')
      return
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('A nova senha deve ter pelo menos 6 caracteres')
      return
    }

    try {
      setChangingPassword(true)

      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password')
      }

      toast.success('Senha alterada com sucesso')
      setShowPasswordModal(false)
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (error: any) {
      console.error('Error changing password:', error)
      toast.error(error.message || 'Erro ao alterar senha')
    } finally {
      setChangingPassword(false)
    }
  }

  const handleClearCache = () => {
    try {
      // Clear localStorage
      const keysToKeep = ['supabase.auth.token']
      const allKeys = Object.keys(localStorage)
      allKeys.forEach((key) => {
        if (!keysToKeep.includes(key)) {
          localStorage.removeItem(key)
        }
      })

      // Clear service worker cache if available
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach((name) => {
            caches.delete(name)
          })
        })
      }

      toast.success('Cache limpo com sucesso')
    } catch (error) {
      console.error('Error clearing cache:', error)
      toast.error('Erro ao limpar cache')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Erro ao carregar configurações</p>
      </div>
    )
  }

  return (
    <>
      <MobileHeader title="Configurações" />
      <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="relative">
          {/* Decorative gradient blobs */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-gray-500/5 rounded-full blur-3xl -z-10 animate-pulse-subtle" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -z-10" />

          <div>
            <h1 className="text-h1 text-gray-900">
              Configurações
            </h1>
            <p className="text-muted-foreground mt-2 text-body-lg">
              Personalize sua experiência
            </p>
          </div>
        </div>

        {/* Dev Mode Section - Only for Super Admin */}
        {isSuperAdmin && (
          <div className="animate-slide-in-up bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl shadow-2xl shadow-red-500/30 border-2 border-red-400/50 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                  <Code className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-white" />
                    <h2 className="text-xl font-bold text-white">Modo Desenvolvedor</h2>
                  </div>
                  <p className="text-white/90 text-sm mb-4">
                    Você tem acesso ao painel administrativo e ferramentas de monitoramento do sistema.
                  </p>
                  <button
                    onClick={() => router.push('/admin/dashboard')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-red-600 rounded-xl font-semibold hover:bg-red-50 transition-all hover:scale-105 shadow-lg"
                  >
                    <Shield className="w-4 h-4" />
                    Acessar Painel Admin
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm px-6 py-3 border-t border-white/20">
              <p className="text-xs text-white/80">
                💡 <strong>Dica:</strong> O painel admin também está disponível no menu "Mais" (ícone ⋮) no rodapé.
              </p>
            </div>
          </div>
        )}

        {/* Settings Sections */}
        <div className="space-y-8">
          {/* Notifications */}
          <div className="animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 ml-1">
              Notificações
            </h2>

            <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 divide-y divide-gray-100 overflow-hidden">
              <SettingToggle
                icon={Bell}
                label="Notificações Ativadas"
                description="Receba alertas sobre atividades importantes"
                value={settings.notifications_enabled}
                onChange={() => handleToggle('notifications_enabled')}
                disabled={saving}
                color="blue"
              />
              <SettingToggle
                icon={CreditCard}
                label="Alertas de Orçamento"
                description="Avisar quando ultrapassar limite do orçamento"
                value={settings.budget_alerts}
                onChange={() => handleToggle('budget_alerts')}
                disabled={saving}
                color="orange"
              />
              <SettingToggle
                icon={Target}
                label="Alertas de Metas"
                description="Notificar sobre progresso das metas"
                value={settings.goal_alerts}
                onChange={() => handleToggle('goal_alerts')}
                disabled={saving}
                color="green"
              />
              <SettingToggle
                icon={Receipt}
                label="Alertas de Transações"
                description="Notificar quando transação for registrada"
                value={settings.transaction_alerts}
                onChange={() => handleToggle('transaction_alerts')}
                disabled={saving}
                color="purple"
              />
              <SettingToggle
                icon={Users}
                label="Alertas da Família"
                description="Notificar sobre atividades de membros da família"
                value={settings.family_alerts}
                onChange={() => handleToggle('family_alerts')}
                disabled={saving}
                color="indigo"
              />
            </div>
          </div >

          {/* Preferences */}
          < div className="animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 ml-1">
              Preferências
            </h2>

            <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 divide-y divide-gray-100 overflow-hidden">
              <SettingItem
                icon={Globe}
                label="Idioma"
                description="Português (Brasil)"
                action="info"
                color="blue"
              />
              <SettingItem
                icon={CreditCard}
                label="Moeda"
                description="Real (R$)"
                action="info"
                color="green"
              />
              <SettingToggle
                icon={Shield}
                label="Mostrar Detalhes de Transações"
                description="Exibir valores completos nas listas"
                value={settings.show_transaction_details}
                onChange={() => handleToggle('show_transaction_details')}
                disabled={saving}
                color="gray"
              />
            </div>
          </div >

          {/* Security */}
          < div className="animate-slide-in-up" style={{ animationDelay: '0.3s' }}>
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 ml-1">
              Segurança
            </h2>

            <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 divide-y divide-gray-100 overflow-hidden">
              <SettingItem
                icon={Lock}
                label="Alterar Senha"
                description="Atualize sua senha de acesso"
                action="button"
                onClick={() => setShowPasswordModal(true)}
                color="red"
              />
            </div>
          </div >

          {/* Data */}
          < div className="animate-slide-in-up" style={{ animationDelay: '0.4s' }}>
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 ml-1">
              Dados
            </h2>

            <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 divide-y divide-gray-100 overflow-hidden">
              <SettingItem
                icon={Download}
                label="Exportar Dados"
                description="Baixe todas as suas transações em CSV"
                action="button"
                onClick={handleExportData}
                color="blue"
              />
              <SettingItem
                icon={Trash2}
                label="Limpar Cache"
                description="Libere espaço removendo dados temporários"
                action="button"
                onClick={handleClearCache}
                color="orange"
              />
            </div>
          </div >

          {/* Personality */}
          < div className="animate-slide-in-up" style={{ animationDelay: '0.5s' }}>
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 ml-1">
              Personalidade do Assistente
            </h2>

            <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6 overflow-hidden">
              <p className="text-sm text-gray-600 mb-4">
                Escolha como o assistente vai se comunicar com você
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <PersonalityCard
                  id="padrao"
                  icon="🤖"
                  name="Padrão"
                  description="Profissional e amigável"
                  selected={settings.assistant_personality === 'padrao'}
                  onClick={() => updateSetting('assistant_personality', 'padrao')}
                  disabled={saving}
                />
                <PersonalityCard
                  id="julius"
                  icon="🤑"
                  name="Julius"
                  description="Econômico e engraçado"
                  selected={settings.assistant_personality === 'julius'}
                  onClick={() => updateSetting('assistant_personality', 'julius')}
                  disabled={saving}
                />
                <PersonalityCard
                  id="severina"
                  icon="😠"
                  name="Dra. Severina"
                  description="Brava e direta"
                  selected={settings.assistant_personality === 'severina'}
                  onClick={() => updateSetting('assistant_personality', 'severina')}
                  disabled={saving}
                />
                <PersonalityCard
                  id="augusto"
                  icon="📊"
                  name="Dr. Augusto"
                  description="Técnico e preciso"
                  selected={settings.assistant_personality === 'augusto'}
                  onClick={() => updateSetting('assistant_personality', 'augusto')}
                  disabled={saving}
                />
                <PersonalityCard
                  id="luna"
                  icon="🌟"
                  name="Luna"
                  description="Motivadora positiva"
                  selected={settings.assistant_personality === 'luna'}
                  onClick={() => updateSetting('assistant_personality', 'luna')}
                  disabled={saving}
                />
                <PersonalityCard
                  id="marcos"
                  icon="😏"
                  name="Marcos"
                  description="Sarcástico sincero"
                  selected={settings.assistant_personality === 'marcos'}
                  onClick={() => updateSetting('assistant_personality', 'marcos')}
                  disabled={saving}
                />
              </div>
            </div>
          </div >
        </div >

        {/* Danger Zone */}
        <div className="animate-slide-in-up" style={{ animationDelay: '0.6s' }}>
          <h2 className="text-sm font-bold text-red-600 uppercase tracking-wider mb-4 ml-1">
            ⚠️ Zona de Perigo
          </h2>

          <div className="bg-red-50 border-2 border-red-200 rounded-2xl shadow-lg shadow-red-200/50 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-100 rounded-xl text-red-600">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-red-900 mb-2">Deletar Conta</h3>
                  <p className="text-sm text-red-700 leading-relaxed mb-4">
                    Ao deletar sua conta, você terá <strong>30 dias</strong> para recuperá-la. Após esse período, todos os seus dados serão permanentemente removidos.
                  </p>
                  <div className="bg-white rounded-xl p-4 mb-4">
                    <p className="text-xs text-red-900 font-semibold mb-2">⚠️ Esta ação irá:</p>
                    <ul className="text-xs text-red-800 space-y-1.5">
                      <li className="flex items-start gap-2">
                        <span className="text-red-500 mt-0.5">•</span>
                        <span>Remover você da sua família atual</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500 mt-0.5">•</span>
                        <span>Deletar todas as suas transações</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500 mt-0.5">•</span>
                        <span>Deletar suas metas e orçamentos</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500 mt-0.5">•</span>
                        <span>Deletar suas conversas com o assistente</span>
                      </li>
                    </ul>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(true)}
                    className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-semibold shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 hover:-translate-y-0.5 flex items-center gap-2"
                  >
                    <Trash2 className="w-5 h-5" />
                    Deletar Minha Conta
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Version Info */}
        < div className="text-center text-sm text-gray-400 pb-8 animate-fade-in" >
          <p>Versão 1.0.0 • Build 2025.01.19</p>
        </div >

        {/* Delete Account Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Deletar Conta
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false)
                    setDeleteConfirmText('')
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-sm text-red-900 font-semibold mb-2">
                    ⚠️ Atenção!
                  </p>
                  <p className="text-sm text-red-800">
                    Sua conta será <strong>desativada por 30 dias</strong>. Você poderá recuperá-la fazendo login novamente durante este período.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Digite <strong>DELETE</strong> para confirmar:
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="DELETE"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeleteModal(false)
                      setDeleteConfirmText('')
                    }}
                    className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all"
                    disabled={deleting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (deleteConfirmText !== 'DELETE') {
                        toast.error('Digite DELETE para confirmar')
                        return
                      }

                      try {
                        setDeleting(true)

                        const response = await fetch('/api/user/delete-account', {
                          method: 'DELETE',
                          headers: { 'Content-Type': 'application/json' },
                        })

                        const data = await response.json()

                        if (!response.ok) {
                          throw new Error(data.error || 'Erro ao deletar conta')
                        }

                        toast.success('Conta marcada para deleção. Você tem 30 dias para recuperá-la.')

                        // Redirect to login after a short delay
                        setTimeout(() => {
                          router.push('/login')
                        }, 2000)
                      } catch (error: any) {
                        console.error('Error deleting account:', error)
                        toast.error(error.message || 'Erro ao deletar conta')
                        setDeleting(false)
                      }
                    }}
                    disabled={deleting || deleteConfirmText !== 'DELETE'}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white font-medium rounded-xl hover:from-red-700 hover:to-red-800 transition-all shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {deleting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Deletando...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Deletar Conta
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Password Change Modal */}
        {
          showPasswordModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">
                    Alterar Senha
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
                    aria-label="Fechar modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Senha Atual
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        value={passwordForm.currentPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            currentPassword: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswords({
                            ...showPasswords,
                            current: !showPasswords.current,
                          })
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label={showPasswords.current ? "Ocultar senha" : "Mostrar senha"}
                      >
                        {showPasswords.current ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Nova Senha
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        value={passwordForm.newPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            newPassword: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-10"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswords({
                            ...showPasswords,
                            new: !showPasswords.new,
                          })
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label={showPasswords.new ? "Ocultar senha" : "Mostrar senha"}
                      >
                        {showPasswords.new ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Confirmar Nova Senha
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={passwordForm.confirmPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            confirmPassword: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-10"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswords({
                            ...showPasswords,
                            confirm: !showPasswords.confirm,
                          })
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label={showPasswords.confirm ? "Ocultar senha" : "Mostrar senha"}
                      >
                        {showPasswords.confirm ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-8">
                    <button
                      type="button"
                      onClick={() => setShowPasswordModal(false)}
                      className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all"
                      disabled={changingPassword}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={changingPassword}
                      className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {changingPassword ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Alterando...
                        </>
                      ) : (
                        'Alterar Senha'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )
        }
      </div>
    </>
  )
}

// Setting Toggle Component
function SettingToggle({
  icon: Icon,
  label,
  description,
  value,
  onChange,
  disabled,
  color = 'blue',
}: {
  icon: any
  label: string
  description: string
  value: boolean
  onChange: () => void
  disabled?: boolean
  color?: 'blue' | 'green' | 'red' | 'orange' | 'purple' | 'indigo' | 'gray'
}) {
  const colorStyles = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    gray: 'bg-gray-50 text-gray-600',
  }

  return (
    <div className="flex items-center justify-between p-5 hover:bg-gray-50/50 transition-colors group">
      <div className="flex items-start gap-4 flex-1">
        <div className={`p-2.5 rounded-xl transition-transform group-hover:scale-110 duration-300 ${colorStyles[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{label}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{description}</p>
        </div>
      </div>

      <div className="ml-4">
        <button
          type="button"
          onClick={onChange}
          disabled={disabled}
          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${value ? 'bg-blue-600 shadow-lg shadow-blue-500/30' : 'bg-gray-200'
            }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${value ? 'translate-x-6' : 'translate-x-1'
              }`}
          />
        </button>
      </div>
    </div>
  )
}

// Setting Item Component
function SettingItem({
  icon: Icon,
  label,
  description,
  action,
  onClick,
  color = 'blue',
}: {
  icon: any
  label: string
  description: string
  action: 'button' | 'info'
  onClick?: () => void
  color?: 'blue' | 'green' | 'red' | 'orange' | 'purple' | 'indigo' | 'gray'
}) {
  const colorStyles = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    gray: 'bg-gray-50 text-gray-600',
  }

  return (
    <div className="flex items-center justify-between p-5 hover:bg-gray-50/50 transition-colors group">
      <div className="flex items-start gap-4 flex-1">
        <div className={`p-2.5 rounded-xl transition-transform group-hover:scale-110 duration-300 ${colorStyles[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{label}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{description}</p>
        </div>
      </div>

      <div className="ml-4">
        {action === 'button' && (
          <button
            type="button"
            onClick={onClick}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${label.includes('Limpar') || label.includes('Alterar Senha')
              ? 'text-red-600 bg-red-50 hover:bg-red-100 hover:shadow-sm'
              : 'text-blue-600 bg-blue-50 hover:bg-blue-100 hover:shadow-sm'
              }`}
          >
            {label.includes('Exportar') ? 'Exportar' : label.includes('Limpar') ? 'Limpar' : 'Alterar'}
          </button>
        )}
      </div>
    </div>
  )
}

// Personality Card Component
function PersonalityCard({
  id,
  icon,
  name,
  description,
  selected,
  onClick,
  disabled,
}: {
  id: string
  icon: string
  name: string
  description: string
  selected: boolean
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`p-4 border-2 rounded-xl transition-all text-left ${selected
        ? 'border-blue-500 bg-blue-50 shadow-md'
        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <div className="text-3xl mb-2">{icon}</div>
      <div className="font-semibold text-gray-900">{name}</div>
      <div className="text-xs text-gray-600 mt-1">{description}</div>
    </button>
  )
}
