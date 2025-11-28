import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/settings - Get user settings
export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Get user settings
    const { data: settings, error: settingsError } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // If settings don't exist, create default ones
    if (settingsError && settingsError.code === 'PGRST116') {
      const { data: newSettings, error: createError } = await supabase
        .from('user_settings')
        .insert({
          user_id: user.id,
        })
        .select()
        .single()

      if (createError) {
        console.error('Error creating default settings:', createError)
        return NextResponse.json(
          { error: 'Erro ao criar configurações' },
          { status: 500 }
        )
      }

      return NextResponse.json({ settings: newSettings })
    }

    if (settingsError) {
      console.error('Error fetching settings:', settingsError)
      return NextResponse.json(
        { error: 'Erro ao buscar configurações' },
        { status: 500 }
      )
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Error in GET /api/settings:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/settings - Update user settings
export async function PUT(request: Request) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const updates = await request.json()

    // Remove fields that shouldn't be updated directly
    const {
      id,
      user_id,
      created_at,
      updated_at,
      ...allowedUpdates
    } = updates

    // Update or insert settings (upsert)
    const { data: updatedSettings, error: updateError } = await supabase
      .from('user_settings')
      .upsert(
        {
          user_id: user.id,
          ...allowedUpdates,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id',
        }
      )
      .select()
      .single()

    if (updateError) {
      console.error('Error updating settings:', updateError)
      return NextResponse.json(
        { error: 'Erro ao atualizar configurações' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Configurações atualizadas com sucesso',
      settings: updatedSettings,
    })
  } catch (error) {
    console.error('Error in PUT /api/settings:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
