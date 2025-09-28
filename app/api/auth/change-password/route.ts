import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { query } from '@/lib/database'

// Forçar rota dinâmica
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { email, currentPassword, newPassword } = await request.json()

    if (!email || !currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Email, senha atual e nova senha são obrigatórios' },
        { status: 400 }
      )
    }

    // Buscar usuário
    const result = await query('SELECT * FROM users WHERE email = $1', [email])
    const user = result.rows[0]

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Verificar senha atual
    const isValidPassword = await bcrypt.compare(currentPassword, user.password)

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Senha atual incorreta' },
        { status: 401 }
      )
    }

    // Criar hash da nova senha
    const hashedNewPassword = await bcrypt.hash(newPassword, 10)

    // Atualizar senha
    await query(
      'UPDATE users SET password = $1 WHERE email = $2',
      [hashedNewPassword, email]
    )

    console.log('✅ Senha alterada para:', user.email)

    return NextResponse.json({
      success: true,
      message: 'Senha alterada com sucesso'
    })

  } catch (error) {
    console.error('❌ Erro ao alterar senha:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
