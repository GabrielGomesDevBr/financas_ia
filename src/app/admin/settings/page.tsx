'use client'

import { useState, useEffect } from 'react'
import { Save, Mail, Database, Shield, Bell, Settings as SettingsIcon, DollarSign, AlertTriangle, RefreshCw, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

interface SystemSettings {
    systemName: string
    adminEmail: string
    autoApproveUsers: boolean
    emailNotifications: boolean
    maintenanceMode: boolean
    maxUsersPerFamily: number
    chatRateLimit: number
    openaiModel: string
    openaiMaxTokens: number
    enableWaitlist: boolean
}

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<SystemSettings>({
        systemName: 'Assistente Financeiro IA',
        adminEmail: process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL || 'admin@exemplo.com',
        autoApproveUsers: false,
        emailNotifications: true,
        maintenanceMode: false,
        maxUsersPerFamily: 10,
        chatRateLimit: 50,
        openaiModel: 'gpt-4o-mini',
        openaiMaxTokens: 1000,
        enableWaitlist: true,
    })

    const [saving, setSaving] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)

    useEffect(() => {
        // Detectar mudanças
        setHasChanges(true)
    }, [settings])

    const handleSave = async () => {
        setSaving(true)
        try {
            // TODO: Implementar API para salvar configurações
            await new Promise(resolve => setTimeout(resolve, 1500))
            toast.success('Configurações salvas com sucesso!')
            setHasChanges(false)
        } catch (error) {
            toast.error('Erro ao salvar configurações')
        } finally {
            setSaving(false)
        }
    }

    const handleClearCache = async () => {
        if (!confirm('Tem certeza que deseja limpar o cache? Isso pode afetar a performance temporariamente.')) return

        try {
            toast.loading('Limpando cache...')
            await new Promise(resolve => setTimeout(resolve, 1000))
            toast.dismiss()
            toast.success('Cache limpo com sucesso!')
        } catch (error) {
            toast.error('Erro ao limpar cache')
        }
    }

    const ToggleSwitch = ({ checked, onChange }: { checked: boolean, onChange: () => void }) => (
        <button
            onClick={onChange}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-gray-300'
                }`}
        >
            <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'
                    }`}
            />
        </button>
    )

    return (
        <div className="space-y-4 md:space-y-6 animate-fade-in pb-6">
            {/* Hero Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-gray-800 via-gray-900 to-black p-6 md:p-8 text-white shadow-2xl"
            >
                <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-white/5 rounded-full blur-3xl -z-0" />
                <div className="absolute bottom-0 left-0 w-48 h-48 md:w-72 md:h-72 bg-white/5 rounded-full blur-3xl -z-0" />

                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-xl">
                                <SettingsIcon className="h-8 w-8 md:h-10 md:w-10" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold">Configurações do Sistema</h1>
                                <p className="text-white/80 text-sm md:text-base mt-1">
                                    Gerencie configurações globais da aplicação
                                </p>
                            </div>
                        </div>

                        {hasChanges && (
                            <motion.button
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                onClick={handleSave}
                                disabled={saving}
                                className="px-6 py-3 bg-white text-gray-900 rounded-xl font-semibold hover:bg-white/90 transition-all shadow-lg disabled:opacity-50 flex items-center gap-2"
                            >
                                <Save className="w-5 h-5" />
                                {saving ? 'Salvando...' : 'Salvar Alterações'}
                            </motion.button>
                        )}
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* General Settings */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-50 rounded-xl">
                            <Shield className="w-6 h-6 text-blue-600" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">Configurações Gerais</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Nome do Sistema
                            </label>
                            <input
                                type="text"
                                value={settings.systemName}
                                onChange={(e) => setSettings({ ...settings, systemName: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Email do Administrador
                            </label>
                            <input
                                type="email"
                                value={settings.adminEmail}
                                onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Access Control */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.15 }}
                    className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-purple-50 rounded-xl">
                            <Database className="w-6 h-6 text-purple-600" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">Controle de Acesso</h2>
                    </div>

                    <div className="space-y-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-semibold text-gray-900">Aprovar automaticamente</p>
                                <p className="text-sm text-gray-600">Novos usuários terão acesso imediato</p>
                            </div>
                            <ToggleSwitch
                                checked={settings.autoApproveUsers}
                                onChange={() => setSettings({ ...settings, autoApproveUsers: !settings.autoApproveUsers })}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-semibold text-gray-900">Sistema de Waitlist</p>
                                <p className="text-sm text-gray-600">Ativar fila de aprovação</p>
                            </div>
                            <ToggleSwitch
                                checked={settings.enableWaitlist}
                                onChange={() => setSettings({ ...settings, enableWaitlist: !settings.enableWaitlist })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Máximo de usuários por família
                            </label>
                            <input
                                type="number"
                                value={settings.maxUsersPerFamily}
                                onChange={(e) => setSettings({ ...settings, maxUsersPerFamily: parseInt(e.target.value) })}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Notifications */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-green-50 rounded-xl">
                            <Bell className="w-6 h-6 text-green-600" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">Notificações</h2>
                    </div>

                    <div className="space-y-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-semibold text-gray-900">Notificações por email</p>
                                <p className="text-sm text-gray-600">Alertas sobre novos usuários e erros</p>
                            </div>
                            <ToggleSwitch
                                checked={settings.emailNotifications}
                                onChange={() => setSettings({ ...settings, emailNotifications: !settings.emailNotifications })}
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Rate Limiting */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.25 }}
                    className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-orange-50 rounded-xl">
                            <Zap className="w-6 h-6 text-orange-600" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">Limites de Uso</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Mensagens de chat por dia (por usuário)
                            </label>
                            <input
                                type="number"
                                value={settings.chatRateLimit}
                                onChange={(e) => setSettings({ ...settings, chatRateLimit: parseInt(e.target.value) })}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                            <p className="text-xs text-gray-500 mt-2">
                                0 = sem limite
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* OpenAI Config */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-pink-50 rounded-xl">
                            <DollarSign className="w-6 h-6 text-pink-600" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">Configurações OpenAI</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Modelo
                            </label>
                            <select
                                value={settings.openaiModel}
                                onChange={(e) => setSettings({ ...settings, openaiModel: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                            >
                                <option value="gpt-4o">GPT-4o (Mais Inteligente)</option>
                                <option value="gpt-4o-mini">GPT-4o Mini (Balanceado)</option>
                                <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Mais Barato)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Max Tokens por Resposta
                            </label>
                            <input
                                type="number"
                                value={settings.openaiMaxTokens}
                                onChange={(e) => setSettings({ ...settings, openaiMaxTokens: parseInt(e.target.value) })}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                            <p className="text-xs text-gray-500 mt-2">
                                Recomendado: 500-2000
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* System Tools */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.35 }}
                    className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-cyan-50 rounded-xl">
                            <RefreshCw className="w-6 h-6 text-cyan-600" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">Ferramentas do Sistema</h2>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={handleClearCache}
                            className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold rounded-xl transition-colors border border-gray-200 flex items-center justify-center gap-2"
                        >
                            <RefreshCw className="w-5 h-5" />
                            Limpar Cache
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* Danger Zone */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="bg-white rounded-2xl shadow-lg border-2 border-red-200 p-6"
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-red-50 rounded-xl">
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    <h2 className="text-lg font-bold text-red-900">Zona de Perigo</h2>
                </div>

                <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-200">
                    <div>
                        <h3 className="font-bold text-red-900 mb-1">Modo de Manutenção</h3>
                        <p className="text-sm text-red-700">
                            Bloquear acesso de todos os usuários (exceto super admins)
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            if (settings.maintenanceMode) {
                                setSettings({ ...settings, maintenanceMode: false })
                            } else if (confirm('⚠️ Ativar modo de manutenção? Todos os usuários (exceto admins) serão bloqueados.')) {
                                setSettings({ ...settings, maintenanceMode: true })
                            }
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.maintenanceMode ? 'bg-red-600' : 'bg-gray-300'
                            }`}
                    >
                        <span
                            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform ${settings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                                }`}
                        />
                    </button>
                </div>
            </motion.div>

            {/* Bottom Save Button (Mobile) */}
            {hasChanges && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:hidden fixed bottom-20 left-4 right-4 z-10"
                >
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all shadow-2xl disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        <Save className="w-5 h-5" />
                        {saving ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                </motion.div>
            )}
        </div>
    )
}
