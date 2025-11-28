import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const maxDuration = 30

// PUT /api/transactions/[id] - Editar transação
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

    // 2. Verificar se a transação existe e pertence ao usuário/família
    const { data: existingTransaction, error: fetchError } = await supabase
      .from('transactions')
      .select('*, family_members!inner(user_id)')
      .eq('id', id)
      .single()

    if (fetchError || !existingTransaction) {
      return NextResponse.json(
        { error: 'Transação não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se o usuário pertence à mesma família
    const { data: familyMember } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('user_id', user.id)
      .single()

    if (familyMember?.family_id !== existingTransaction.family_id) {
      return NextResponse.json(
        { error: 'Sem permissão para editar esta transação' },
        { status: 403 }
      )
    }

    // 3. Extrair dados do body
    const body = await request.json()
    const {
      type,
      amount,
      description,
      date,
      category_id,
      subcategory_id,
    } = body

    // 4. Validar campos se fornecidos
    if (type && type !== 'income' && type !== 'expense') {
      return NextResponse.json(
        { error: 'Type deve ser "income" ou "expense"' },
        { status: 400 }
      )
    }

    if (amount !== undefined && (typeof amount !== 'number' || amount <= 0)) {
      return NextResponse.json(
        { error: 'Amount deve ser um número maior que zero' },
        { status: 400 }
      )
    }

    // 5. Validar category_id se fornecido
    if (category_id) {
      const { data: category, error: categoryError } = await supabase
        .from('categories')
        .select('id')
        .eq('id', category_id)
        .single()

      if (categoryError || !category) {
        return NextResponse.json(
          { error: 'Categoria inválida' },
          { status: 400 }
        )
      }
    }

    // 6. Atualizar transação
    const updateData: any = {}
    if (type) updateData.type = type
    if (amount) updateData.amount = amount
    if (description) updateData.description = description
    if (date) updateData.date = date
    if (category_id !== undefined) updateData.category_id = category_id
    if (subcategory_id !== undefined)
      updateData.subcategory_id = subcategory_id

    const { data: transaction, error: updateError } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', id)
      .select(
        'id, type, amount, description, date, source, created_at, category_id, subcategory_id, category:categories!transactions_category_id_fkey(name), subcategory:subcategories!transactions_subcategory_id_fkey(name)'
      )
      .single()

    if (updateError) {
      console.error('Erro ao atualizar transação:', updateError)
      return NextResponse.json(
        { error: 'Erro ao atualizar transação' },
        { status: 500 }
      )
    }

    // 7. Transformar dados
    const transformedTransaction = {
      ...transaction,
      category: Array.isArray(transaction.category)
        ? transaction.category[0]
        : transaction.category,
      subcategory: Array.isArray(transaction.subcategory)
        ? transaction.subcategory[0]
        : transaction.subcategory,
    }

    return NextResponse.json({
      success: true,
      transaction: transformedTransaction,
    })
  } catch (error) {
    console.error('Erro na API de transações:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/transactions/[id] - Excluir transação
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

    // 2. Verificar se a transação existe e pertence ao usuário/família
    const { data: existingTransaction, error: fetchError } = await supabase
      .from('transactions')
      .select('family_id')
      .eq('id', id)
      .single()

    if (fetchError || !existingTransaction) {
      return NextResponse.json(
        { error: 'Transação não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se o usuário pertence à mesma família
    const { data: familyMember } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('user_id', user.id)
      .single()

    if (familyMember?.family_id !== existingTransaction.family_id) {
      return NextResponse.json(
        { error: 'Sem permissão para excluir esta transação' },
        { status: 403 }
      )
    }

    // 3. Excluir transação
    const { error: deleteError } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Erro ao excluir transação:', deleteError)
      return NextResponse.json(
        { error: 'Erro ao excluir transação' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Transação excluída com sucesso',
    })
  } catch (error) {
    console.error('Erro na API de transações:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
