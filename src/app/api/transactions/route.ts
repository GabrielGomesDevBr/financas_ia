import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const maxDuration = 30

// POST /api/transactions - Criar transação manual
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

    // 2. Extrair dados do body
    const body = await request.json()
    const {
      type,
      amount,
      description,
      date,
      category_id,
      subcategory_id,
    } = body

    // 3. Validar campos obrigatórios
    if (!type || !amount || !description || !date) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: type, amount, description, date' },
        { status: 400 }
      )
    }

    // Validar type
    if (type !== 'income' && type !== 'expense') {
      return NextResponse.json(
        { error: 'Type deve ser "income" ou "expense"' },
        { status: 400 }
      )
    }

    // Validar amount
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Amount deve ser um número maior que zero' },
        { status: 400 }
      )
    }

    // 4. Buscar family_id do usuário
    const { data: familyMember, error: familyError } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('user_id', user.id)
      .single()

    if (familyError || !familyMember) {
      return NextResponse.json(
        { error: 'Usuário não pertence a nenhuma família' },
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

    // 6. Inserir no Supabase
    const { data: transaction, error: insertError } = await supabase
      .from('transactions')
      .insert({
        family_id: familyMember.family_id,
        user_id: user.id,
        type,
        amount,
        description,
        date,
        category_id: category_id || null,
        subcategory_id: subcategory_id || null,
        source: 'manual',
      })
      .select(
        'id, type, amount, description, date, source, created_at, category_id, subcategory_id, category:categories!transactions_category_id_fkey(name), subcategory:subcategories!transactions_subcategory_id_fkey(name)'
      )
      .single()

    if (insertError) {
      console.error('Erro ao inserir transação:', insertError)
      return NextResponse.json(
        { error: 'Erro ao criar transação' },
        { status: 500 }
      )
    }

    // 7. Transformar dados para formato esperado
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
