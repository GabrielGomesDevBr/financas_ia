'use client'

import { useEffect, useState, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  User,
  Mail,
  Phone,
  Calendar,
  Edit2,
  Camera,
  Save,
  X,
  Upload,
  Trash2,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Profile {
  id: string
  email: string
  full_name: string
  avatar_url?: string | null
  phone?: string | null
  created_at: string
  family?: {
    id: string
    name: string
    plan: string
    role: string
  } | null
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({ full_name: '', phone: '' })
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load profile
  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const response = await fetch('/api/profile')
      if (!response.ok) throw new Error('Erro ao carregar perfil')

      const data = await response.json()
      setProfile(data.profile)
      setEditData({
        full_name: data.profile.full_name || '',
        phone: data.profile.phone || '',
      })
    } catch (error) {
      console.error('[Profile] Erro ao carregar perfil:', error)
      toast.error('Erro ao carregar perfil')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle edit
  const handleSaveEdit = async () => {
    if (!editData.full_name.trim()) {
      toast.error('Nome não pode estar vazio')
      return
    }

    const toastId = toast.loading('Salvando alterações...')

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao atualizar perfil')
      }

      toast.success('Perfil atualizado com sucesso!', { id: toastId })
      setIsEditing(false)
      await loadProfile()
    } catch (error) {
      console.error('[Profile] Erro ao atualizar:', error)
      toast.error(
        error instanceof Error ? error.message : 'Erro ao atualizar perfil',
        { id: toastId }
      )
    }
  }

  // Handle avatar upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tamanho
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Tamanho máximo: 5MB')
      return
    }

    // Validar tipo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Tipo de arquivo inválido. Use JPG, PNG ou WEBP')
      return
    }

    setIsUploading(true)
    const toastId = toast.loading('Fazendo upload...')

    try {
      const formData = new FormData()
      formData.append('avatar', file)

      const response = await fetch('/api/profile/avatar', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao fazer upload')
      }

      toast.success('Avatar atualizado com sucesso!', { id: toastId })
      await loadProfile()
    } catch (error) {
      console.error('[Profile] Erro no upload:', error)
      toast.error(
        error instanceof Error ? error.message : 'Erro ao fazer upload',
        { id: toastId }
      )
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Handle remove avatar
  const handleRemoveAvatar = async () => {
    if (!confirm('Tem certeza que deseja remover o avatar?')) return

    const toastId = toast.loading('Removendo avatar...')

    try {
      const response = await fetch('/api/profile/avatar', {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao remover avatar')
      }

      toast.success('Avatar removido com sucesso!', { id: toastId })
      await loadProfile()
    } catch (error) {
      console.error('[Profile] Erro ao remover avatar:', error)
      toast.error(
        error instanceof Error ? error.message : 'Erro ao remover avatar',
        { id: toastId }
      )
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl animate-fade-in">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-12 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
            <p className="text-sm text-muted-foreground animate-pulse-subtle">Carregando perfil...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="space-y-6 max-w-4xl animate-fade-in">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-12 text-center">
          <p className="text-muted-foreground">Perfil não encontrado</p>
        </div>
      </div>
    )
  }

  const memberSince = new Date(profile.created_at).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  })

  // Get initials for avatar
  const initials = profile.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      {/* Header */}
      <div className="relative">
        {/* Decorative gradient blobs */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl -z-10 animate-pulse-subtle" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl -z-10" />

        <div>
          <h1 className="text-h1 text-gray-900">Meu Perfil</h1>
          <p className="text-muted-foreground mt-2 text-body-lg">Gerencie suas informações pessoais</p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-xl animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
        {/* Cover Image */}
        <div className="h-32 bg-gradient-to-r from-primary-500 via-primary-600 to-accent-500 relative overflow-hidden">
          <div className="absolute inset-0 mesh-gradient-soft opacity-30" />
        </div>

        {/* Profile Info */}
        <div className="px-6 pb-6">
          {/* Avatar */}
          <div className="relative -mt-16 mb-4">
            <div className="w-32 h-32 rounded-full bg-white p-1.5 shadow-2xl ring-4 ring-white">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Avatar"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                  {initials}
                </div>
              )}
            </div>

            {/* Avatar actions */}
            <div className="absolute bottom-2 right-2 flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="p-2.5 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full text-white shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 hover:scale-110 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Alterar avatar"
              >
                <Camera className="w-4 h-4" />
              </button>
              {profile.avatar_url && (
                <button
                  onClick={handleRemoveAvatar}
                  disabled={isUploading}
                  className="p-2.5 bg-gradient-to-br from-red-500 to-red-600 rounded-full text-white shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 hover:scale-110 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Remover avatar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Name & Bio */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-h2 text-gray-900">{profile.full_name || 'Sem nome'}</h2>
            </div>
            <p className="text-gray-600 text-sm flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              Membro desde {memberSince}
            </p>
            {profile.family && (
              <div className="flex items-center gap-2 mt-2">
                <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-primary-50 to-accent-50 border border-primary-200">
                  <p className="text-xs font-semibold text-primary-700">
                    Família: {profile.family.name}
                  </p>
                </div>
                <div className="px-3 py-1.5 rounded-full bg-accent-50 border border-accent-200">
                  <p className="text-xs font-semibold text-accent-700 capitalize">
                    {profile.family.role}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-lg animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-gradient-to-b from-primary-500 to-primary-600 rounded-full" />
              <h3 className="text-h3 text-gray-900">Informações Pessoais</h3>
            </div>
            {!isEditing ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="hover:bg-primary-50 hover:text-primary-600"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Editar
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsEditing(false)
                    setEditData({
                      full_name: profile.full_name || '',
                      phone: profile.phone || '',
                    })
                  }}
                  className="hover:bg-red-50 hover:text-red-600"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveEdit}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg shadow-green-500/30"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {/* Email */}
          <div className="p-6 flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-500 mb-1">Email</p>
              <p className="text-base font-medium text-gray-900">{profile.email}</p>
              <div className="inline-flex items-center gap-1.5 mt-2 px-2 py-1 rounded-md bg-gray-50 border border-gray-200">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                <p className="text-xs text-gray-500">Email não pode ser alterado</p>
              </div>
            </div>
          </div>

          {/* Name */}
          <div className="p-6 flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl">
              <User className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-500 mb-2">Nome Completo</p>
              {isEditing ? (
                <Input
                  value={editData.full_name}
                  onChange={(e) =>
                    setEditData({ ...editData, full_name: e.target.value })
                  }
                  placeholder="Seu nome completo"
                  className="border-2 focus:ring-2 focus:ring-purple-500"
                />
              ) : (
                <p className="text-base font-medium text-gray-900">
                  {profile.full_name || 'Não informado'}
                </p>
              )}
            </div>
          </div>

          {/* Phone */}
          <div className="p-6 flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl">
              <Phone className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-500 mb-2">Telefone</p>
              {isEditing ? (
                <Input
                  value={editData.phone}
                  onChange={(e) =>
                    setEditData({ ...editData, phone: e.target.value })
                  }
                  placeholder="(00) 00000-0000"
                  className="border-2 focus:ring-2 focus:ring-green-500"
                />
              ) : (
                <p className="text-base font-medium text-gray-900">
                  {profile.phone || 'Não informado'}
                </p>
              )}
            </div>
          </div>

          {/* Created At */}
          <div className="p-6 flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-xl">
              <Calendar className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-500 mb-1">Data de Cadastro</p>
              <p className="text-base font-medium text-gray-900">
                {new Date(profile.created_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
