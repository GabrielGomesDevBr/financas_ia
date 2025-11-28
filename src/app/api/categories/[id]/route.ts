import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const maxDuration = 30

// PUT /api/categories/[id] - Atualizar categoria
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params

    // 2. Verificar se a categoria existe e pertence à família
    const { data: existingCategory, error: fetchError } = await supabase
      .from('categories')
      .select('family_id, is_default')
      .eq('id', id)
      .single()

    if (fetchError || !existingCategory) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      )
    }

    // Não permitir editar categorias default
    if (existingCategory.is_default) {
      return NextResponse.json(
        { error: 'Não é possível editar categorias padrão' },
        { status: 403 }
      )
    }

    // Verificar se o usuário pertence à mesma família
    const { data: familyMember } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('user_id', user.id)
      .single()

    if (familyMember?.family_id !== existingCategory.family_id) {
      return NextResponse.json(
        { error: 'Sem permissão para editar esta categoria' },
        { status: 403 }
      )
    }

    // 3. Extrair dados do body
    const body = await request.json()
    const { name, icon, color, type, subcategories } = body

    // 4. Validar tipo se fornecido
    if (type !== undefined && !['income', 'expense'].includes(type)) {
      return NextResponse.json(
        { error: 'type deve ser income ou expense' },
        { status: 400 }
      )
    }

    // 5. Atualizar categoria
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (icon !== undefined) updateData.icon = icon
    if (color !== undefined) updateData.color = color
    if (type !== undefined) updateData.type = type

    const { data: category, error: updateError } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single()

    if (updateError) {
      console.error('Erro ao atualizar categoria:', updateError)

      // Verificar erro de duplicata
      if (updateError.code === '23505') {
        return NextResponse.json(
          { error: 'Já existe uma categoria com este nome e tipo' },
          { status: 409 }
        )
      }

      return NextResponse.json(
        { error: 'Erro ao atualizar categoria' },
        { status: 500 }
      )
    }

    // 6. Atualizar subcategorias se fornecidas
    let updatedSubcategories: any[] = []
    if (subcategories !== undefined && Array.isArray(subcategories)) {
      // Deletar subcategorias existentes
      await supabase.from('subcategories').delete().eq('category_id', id)

      // Inserir novas subcategorias
      if (subcategories.length > 0) {
        const subcategoriesData = subcategories.map((sub: string) => ({
          category_id: id,
          name: sub,
        }))

        const { data: subs, error: subsError } = await supabase
          .from('subcategories')
          .insert(subcategoriesData)
          .select('*')

        if (!subsError) {
          updatedSubcategories = subs || []
        }
      }
    } else {
      // Buscar subcategorias existentes
      const { data: subs } = await supabase
        .from('subcategories')
        .select('*')
        .eq('category_id', id)

      updatedSubcategories = subs || []
    }

    return NextResponse.json({
      success: true,
      category: {
        ...category,
        subcategories: updatedSubcategories,
      },
    })
  } catch (error) {
    console.error('Erro na API de categorias:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/categories/[id] - Excluir categoria
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params

    // 2. Verificar se a categoria existe e pertence à família
    const { data: existingCategory, error: fetchError } = await supabase
      .from('categories')
      .select('family_id, is_default')
      .eq('id', id)
      .single()

    if (fetchError || !existingCategory) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      )
    }

    // Não permitir excluir categorias default
    if (existingCategory.is_default) {
      return NextResponse.json(
        { error: 'Não é possível excluir categorias padrão' },
        { status: 403 }
      )
    }

    // Verificar se o usuário pertence à mesma família
    const { data: familyMember } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('user_id', user.id)
      .single()

    if (familyMember?.family_id !== existingCategory.family_id) {
      return NextResponse.json(
        { error: 'Sem permissão para excluir esta categoria' },
        { status: 403 }
      )
    }

    // 3. Verificar se há transações usando esta categoria
    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('id')
      .eq('category_id', id)
      .limit(1)

    if (!transactionsError && transactions && transactions.length > 0) {
      return NextResponse.json(
        {
          error:
            'Não é possível excluir esta categoria pois existem transações associadas',
        },
        { status: 409 }
      )
    }

    // 4. Verificar se há orçamentos usando esta categoria
    const { data: budgets, error: budgetsError } = await supabase
      .from('budgets')
      .select('id')
      .eq('category_id', id)
      .limit(1)

    if (!budgetsError && budgets && budgets.length > 0) {
      return NextResponse.json(
        {
          error:
            'Não é possível excluir esta categoria pois existem orçamentos associados',
        },
        { status: 409 }
      )
    }

    // 5. Excluir categoria (subcategorias serão excluídas em cascata)
    const { error: deleteError } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Erro ao excluir categoria:', deleteError)
      return NextResponse.json(
        { error: 'Erro ao excluir categoria' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Categoria excluída com sucesso',
    })
  } catch (error) {
    console.error('Erro na API de categorias:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
