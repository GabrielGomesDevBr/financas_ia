'use client'

import { useState } from 'react'
import { Save, Mail, Database, Shield, Bell } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState({
        systemName: 'Assistente Financeiro IA',
        adminEmail: process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL || 'admin@exemplo.com',
        autoApproveUsers: false,
        emailNotifications: true,
        maintenanceMode: false,
        maxUsersPerFamily: 10,
        chatRateLimit: 50,
    })

    const [saving, setSaving] = useState(false)

    const handleSave = async () => {
        setSaving(true)
        try {
            // Simular salvamento
            await new Promise(resolve => setTimeout(resolve, 1000))
            toast.success('Configurações salvas com sucesso!')
        } catch (error) {
            toast.error('Erro ao salvar configurações')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Configurações do Sistema</h1>
                <p className="text-gray-600 mt-1">Gerencie as configurações globais da aplicação</p>
            </div>

            <div className="space-y-6">
                {/* General Settings */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Shield className="w-6 h-6 text-blue-600" />
                        <h2 className="text-lg font-semibold text-gray-900">Configurações Gerais</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nome do Sistema
                            </label>
                            <input
                                type="text"
                                value={settings.systemName}
                                onChange={(e) => setSettings({ ...settings, systemName: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email do Administrador
                            </label>
                            <input
                                type="email"
                                value={settings.adminEmail}
                                onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* Access Control */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Database className="w-6 h-6 text-purple-600" />
                        <h2 className="text-lg font-semibold text-gray-900">Controle de Acesso</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-900">Aprovar usuários automaticamente</p>
                                <p className="text-sm text-gray-600">Novos usuários terão acesso imediato</p>
                            </div>
                            <button
                                onClick={() => setSettings({ ...settings, autoApproveUsers: !settings.autoApproveUsers })}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.autoApproveUsers ? 'bg-blue-600' : 'bg-gray-200'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.autoApproveUsers ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Máximo de usuários por família
                            </label>
                            <input
                                type="number"
                                value={settings.maxUsersPerFamily}
                                onChange={(e) => setSettings({ ...settings, maxUsersPerFamily: parseInt(e.target.value) })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Bell className="w-6 h-6 text-green-600" />
                        <h2 className="text-lg font-semibold text-gray-900">Notificações</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-900">Notificações por email</p>
                                <p className="text-sm text-gray-600">Receber alertas sobre novos usuários e erros</p>
                            </div>
                            <button
                                onClick={() => setSettings({ ...settings, emailNotifications: !settings.emailNotifications })}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.emailNotifications ? 'bg-blue-600' : 'bg-gray-200'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Rate Limiting */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Mail className="w-6 h-6 text-orange-600" />
                        <h2 className="text-lg font-semibold text-gray-900">Limites de Uso</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mensagens de chat por dia (por usuário)
                            </label>
                            <input
                                type="number"
                                value={settings.chatRateLimit}
                                onChange={(e) => setSettings({ ...settings, chatRateLimit: parseInt(e.target.value) })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                0 = sem limite
                            </p>
                        </div>
                    </div>
                </div>

                {/* Maintenance Mode */}
                <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-1">Modo de Manutenção</h3>
                            <p className="text-sm text-gray-600">
                                Bloquear acesso de todos os usuários (exceto super admins)
                            </p>
                        </div>
                        <button
                            onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.maintenanceMode ? 'bg-red-600' : 'bg-gray-200'
                                }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save className="w-5 h-5" />
                        {saving ? 'Salvando...' : 'Salvar Configurações'}
                    </button>
                </div>
            </div>
        </div>
    )
}
