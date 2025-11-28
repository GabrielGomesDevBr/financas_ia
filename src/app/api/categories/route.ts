import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const maxDuration = 30

// GET /api/categories - Listar categorias (default + família)
export async function GET(request: Request) {
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

    // 2. Buscar family_id do usuário
    const { data: familyMember } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('user_id', user.id)
      .single()

    if (!familyMember) {
      return NextResponse.json(
        { error: 'Usuário não pertence a nenhuma família' },
        { status: 404 }
      )
    }

    // 3. Buscar categorias (default + da família) com subcategorias
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select(
        `
        id,
        name,
        icon,
        color,
        type,
        is_default,
        family_id,
        created_at,
        subcategories (
          id,
          name,
          created_at
        )
      `
      )
      .or(`is_default.eq.true,family_id.eq.${familyMember.family_id}`)
      .order('name')

    if (categoriesError) {
      console.error('Erro ao buscar categorias:', categoriesError)
      return NextResponse.json(
        { error: 'Erro ao buscar categorias' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      categories: categories || [],
    })
  } catch (error) {
    console.error('Erro na API de categorias:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST /api/categories - Criar nova categoria
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

    // 2. Buscar family_id do usuário
    const { data: familyMember } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('user_id', user.id)
      .single()

    if (!familyMember) {
      return NextResponse.json(
        { error: 'Usuário não pertence a nenhuma família' },
        { status: 404 }
      )
    }

    // 3. Extrair dados do body
    const body = await request.json()
    const { name, icon, color, type, subcategories = [] } = body

    // 4. Validar campos obrigatórios
    if (!name || !type) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: name, type' },
        { status: 400 }
      )
    }

    // 5. Validar tipo
    if (!['income', 'expense'].includes(type)) {
      return NextResponse.json(
        { error: 'type deve ser income ou expense' },
        { status: 400 }
      )
    }

    // 6. Inserir categoria
    const { data: category, error: insertError } = await supabase
      .from('categories')
      .insert({
        family_id: familyMember.family_id,
        name,
        icon: icon || null,
        color: color || null,
        type,
        is_default: false,
      })
      .select('*')
      .single()

    if (insertError) {
      console.error('Erro ao criar categoria:', insertError)

      // Verificar erro de duplicata (unique constraint)
      if (insertError.code === '23505') {
        return NextResponse.json(
          { error: 'Já existe uma categoria com este nome e tipo' },
          { status: 409 }
        )
      }

      return NextResponse.json(
        { error: 'Erro ao criar categoria' },
        { status: 500 }
      )
    }

    // 7. Inserir subcategorias se fornecidas
    let insertedSubcategories: any[] = []
    if (subcategories.length > 0) {
      const subcategoriesData = subcategories.map((sub: string) => ({
        category_id: category.id,
        name: sub,
      }))

      const { data: subs, error: subsError } = await supabase
        .from('subcategories')
        .insert(subcategoriesData)
        .select('*')

      if (subsError) {
        console.error('Erro ao criar subcategorias:', subsError)
        // Não falhar a operação por causa disso
      } else {
        insertedSubcategories = subs || []
      }
    }

    return NextResponse.json(
      {
        success: true,
        category: {
          ...category,
          subcategories: insertedSubcategories,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro na API de categorias:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
