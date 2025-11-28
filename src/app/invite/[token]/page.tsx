'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Users, Mail, Calendar, CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

interface InviteData {
    id: string
    email: string
    family: {
        id: string
        name: string
    }
    invited_by: {
        name: string
        email: string
    }
    expires_at: string
}

export default function InvitePage() {
    const params = useParams()
    const router = useRouter()
    const token = params.token as string
    const supabase = createClient()

    const [invite, setInvite] = useState<InviteData | null>(null)
    const [loading, setLoading] = useState(true)
    const [accepting, setAccepting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        checkAuthAndLoadInvite()
    }, [token])

    const checkAuthAndLoadInvite = async () => {
        try {
            // Check if user is authenticated
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)

            // Load invite details
            const response = await fetch(`/api/family/invite/${token}`)
            const data = await response.json()

            if (!response.ok) {
                setError(data.error || 'Erro ao carregar convite')
                return
            }

            setInvite(data.invite)
        } catch (err: any) {
            setError(err.message || 'Erro ao carregar convite')
        } finally {
            setLoading(false)
        }
    }

    const handleAcceptInvite = async () => {
        // Check if user is authenticated
        if (!user) {
            // Redirect to login with return URL
            const returnUrl = encodeURIComponent(`/invite/${token}`)
            router.push(`/login?redirect=/invite/${token}`)
            return
        }

        try {
            setAccepting(true)

            const response = await fetch(`/api/family/invite/${token}`, {
                method: 'POST',
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao aceitar convite')
            }

            toast.success('Convite aceito com sucesso!')

            // Redirect to dashboard after a short delay
            setTimeout(() => {
                router.push('/dashboard')
            }, 1500)
        } catch (err: any) {
            toast.error(err.message || 'Erro ao aceitar convite')
            setAccepting(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Carregando convite...</p>
                </div>
            </div>
        )
    }

    if (error || !invite) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-red-100 p-8 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <XCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Convite Inválido
                    </h1>
                    <p className="text-gray-600 mb-6">
                        {error || 'Este convite não está mais disponível.'}
                    </p>
                    <button
                        onClick={() => router.push('/login')}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                    >
                        Ir para Login
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
            <div className="max-w-2xl w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Users className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                        Convite para Família
                    </h1>
                    <p className="text-lg text-gray-600">
                        Você foi convidado para se juntar a uma família!
                    </p>
                </div>

                {/* Invite Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    {/* Gradient Header */}
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
                        <h2 className="text-2xl font-bold text-white text-center">
                            {invite.family.name}
                        </h2>
                    </div>

                    {/* Content */}
                    <div className="p-8 space-y-6">
                        {/* Invited By */}
                        <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Mail className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-500 mb-1">
                                    Convidado por
                                </p>
                                <p className="font-semibold text-gray-900">
                                    {invite.invited_by.name}
                                </p>
                                <p className="text-sm text-gray-600">
                                    {invite.invited_by.email}
                                </p>
                            </div>
                        </div>

                        {/* Your Email */}
                        <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-xl">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Mail className="w-5 h-5 text-purple-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-500 mb-1">
                                    Convite para
                                </p>
                                <p className="font-semibold text-gray-900">{invite.email}</p>
                            </div>
                        </div>

                        {/* Expiration */}
                        <div className="flex items-start gap-4 p-4 bg-yellow-50 rounded-xl">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <Calendar className="w-5 h-5 text-yellow-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-500 mb-1">
                                    Válido até
                                </p>
                                <p className="font-semibold text-gray-900">
                                    {new Date(invite.expires_at).toLocaleDateString('pt-BR', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </p>
                            </div>
                        </div>

                        {/* Benefits */}
                        <div className="bg-gray-50 rounded-xl p-6">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                Ao aceitar este convite você poderá:
                            </h3>
                            <ul className="space-y-2 text-gray-700">
                                <li className="flex items-start gap-2">
                                    <span className="text-green-600 mt-0.5">✓</span>
                                    <span>Registrar e visualizar transações da família</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-600 mt-0.5">✓</span>
                                    <span>Acompanhar orçamentos e metas compartilhadas</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-600 mt-0.5">✓</span>
                                    <span>Visualizar relatórios financeiros</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-600 mt-0.5">✓</span>
                                    <span>Colaborar na gestão financeira familiar</span>
                                </li>
                            </ul>
                        </div>

                        {/* Actions */}
                        <div className="space-y-3 pt-4">
                            {!user && (
                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                                    <p className="text-sm text-blue-800 text-center">
                                        Você precisa fazer login para aceitar este convite
                                    </p>
                                </div>
                            )}

                            <button
                                onClick={handleAcceptInvite}
                                disabled={accepting}
                                className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-bold text-lg shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {accepting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Aceitando...
                                    </>
                                ) : user ? (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        Aceitar Convite
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                ) : (
                                    <>
                                        Fazer Login para Aceitar
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>

                            <button
                                onClick={() => router.push('/')}
                                className="w-full px-6 py-3 border border-gray-300 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-gray-500 mt-6">
                    Se você não esperava este convite, pode ignorá-lo com segurança
                </p>
            </div>
        </div>
    )
}
