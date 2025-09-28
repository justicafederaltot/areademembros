import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'

// Forçar rota dinâmica
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Buscar todos os usuários
    const result = await query(
      'SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC'
    )

    console.log(`✅ Usuários encontrados: ${result.rows.length}`)

    return NextResponse.json({
      success: true,
      total_users: result.rows.length,
      users: result.rows
    })

  } catch (error) {
    console.error('❌ Erro ao listar usuários:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
