import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/user/export-data - Export user data as CSV
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

    // Get user's family
    const { data: userData } = await supabase
      .from('users')
      .select('family_id')
      .eq('id', user.id)
      .single()

    if (!userData || !userData.family_id) {
      return NextResponse.json(
        { error: 'Usuário sem família associada' },
        { status: 404 }
      )
    }

    // Get all transactions with categories
    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select(
        `
        id,
        date,
        type,
        amount,
        description,
        category:categories!transactions_category_id_fkey(name),
        subcategory:subcategories(name),
        source,
        created_at
      `
      )
      .eq('family_id', userData.family_id)
      .order('date', { ascending: false })

    if (transactionsError) {
      console.error('Error fetching transactions:', transactionsError)
      return NextResponse.json(
        { error: 'Erro ao buscar transações' },
        { status: 500 }
      )
    }

    // Convert to CSV
    const headers = [
      'Data',
      'Tipo',
      'Categoria',
      'Subcategoria',
      'Descrição',
      'Valor',
      'Origem',
      'Data de Criação',
    ]

    const rows = transactions.map((t: any) => [
      new Date(t.date).toLocaleDateString('pt-BR'),
      t.type === 'expense' ? 'Despesa' : 'Receita',
      t.category?.name || '',
      t.subcategory?.name || '',
      t.description || '',
      `R$ ${parseFloat(t.amount).toFixed(2).replace('.', ',')}`,
      t.source || 'manual',
      new Date(t.created_at).toLocaleString('pt-BR'),
    ])

    // Build CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row
          .map((cell) =>
            // Escape cells with commas or quotes
            typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))
              ? `"${cell.replace(/"/g, '""')}"`
              : cell
          )
          .join(',')
      ),
    ].join('\n')

    // Add BOM for Excel UTF-8 compatibility
    const bom = '\uFEFF'
    const csvWithBom = bom + csvContent

    // Return as downloadable file
    return new Response(csvWithBom, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="transacoes_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error('Error in GET /api/user/export-data:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
