import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { query } from '@/lib/database'

// Forçar rota dinâmica
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { email, newPassword } = await request.json()

    if (!email || !newPassword) {
      return NextResponse.json(
        { error: 'Email e nova senha são obrigatórios' },
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

    // Criar hash da nova senha
    const hashedNewPassword = await bcrypt.hash(newPassword, 10)

    // Atualizar senha
    await query(
      'UPDATE users SET password = $1 WHERE email = $2',
      [hashedNewPassword, email]
    )

    console.log('✅ Senha resetada para:', user.email)

    return NextResponse.json({
      success: true,
      message: 'Senha resetada com sucesso',
      credentials: {
        email: user.email,
        password: newPassword
      }
    })

  } catch (error) {
    console.error('❌ Erro ao resetar senha:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
