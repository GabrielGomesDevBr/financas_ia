import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const maxDuration = 30

// POST /api/profile/avatar - Upload de avatar
export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // 1. Validar autenticação
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    // 2. Extrair dados do FormData
    const formData = await request.formData()
    const file = formData.get('avatar') as File

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    // 3. Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de arquivo inválido. Use JPG, PNG ou WEBP' },
        { status: 400 }
      )
    }

    // 4. Validar tamanho (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Tamanho máximo: 5MB' },
        { status: 400 }
      )
    }

    // 5. Criar nome único para o arquivo
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}-${Date.now()}.${fileExt}`
    const filePath = `avatars/${fileName}`

    // 6. Converter File para ArrayBuffer e depois para Uint8Array
    const arrayBuffer = await file.arrayBuffer()
    const fileData = new Uint8Array(arrayBuffer)

    // 7. Upload para Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, fileData, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Erro ao fazer upload:', uploadError)
      return NextResponse.json(
        { error: 'Erro ao fazer upload do arquivo' },
        { status: 500 }
      )
    }

    // 8. Obter URL pública
    const {
      data: { publicUrl },
    } = supabase.storage.from('avatars').getPublicUrl(filePath)

    // 9. Atualizar user_metadata
    const { error: updateError } = await supabase.auth.updateUser({
      data: { avatar_url: publicUrl },
    })

    if (updateError) {
      console.error('Erro ao atualizar usuário:', updateError)
      // Não falhar a operação, mas logar o erro
    }

    // 10. Atualizar tabela users
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single()

    if (existingUser) {
      await supabase.from('users').update({ avatar_url: publicUrl }).eq('id', user.id)
    } else {
      await supabase.from('users').insert({
        id: user.id,
        email: user.email,
        avatar_url: publicUrl,
      })
    }

    return NextResponse.json({
      success: true,
      avatar_url: publicUrl,
      message: 'Avatar atualizado com sucesso',
    })
  } catch (error) {
    console.error('Erro na API de upload de avatar:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/profile/avatar - Remover avatar
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()

    // 1. Validar autenticação
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    // 2. Atualizar user_metadata (remover avatar)
    const { error: updateError } = await supabase.auth.updateUser({
      data: { avatar_url: null },
    })

    if (updateError) {
      console.error('Erro ao atualizar usuário:', updateError)
    }

    // 3. Atualizar tabela users
    await supabase.from('users').update({ avatar_url: null }).eq('id', user.id)

    return NextResponse.json({
      success: true,
      message: 'Avatar removido com sucesso',
    })
  } catch (error) {
    console.error('Erro na API de remoção de avatar:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
