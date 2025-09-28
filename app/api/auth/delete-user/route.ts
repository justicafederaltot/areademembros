import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'

// Forçar rota dinâmica
export const dynamic = 'force-dynamic'

export async function DELETE(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se usuário existe
    const existingUser = await query('SELECT * FROM users WHERE email = $1', [email])
    
    if (existingUser.rows.length === 0) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Deletar usuário
    await query('DELETE FROM users WHERE email = $1', [email])

    console.log('✅ Usuário deletado:', email)

    return NextResponse.json({
      success: true,
      message: 'Usuário deletado com sucesso',
      deleted_user: email
    })

  } catch (error) {
    console.error('❌ Erro ao deletar usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
