import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { query } from '@/lib/database'

// Forçar rota dinâmica
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, role = 'member' } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, senha e nome são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se usuário já existe
    const existingUser = await query('SELECT * FROM users WHERE email = $1', [email])
    
    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: 'Usuário já existe com este email' },
        { status: 409 }
      )
    }

    // Criar hash da senha
    const hashedPassword = await bcrypt.hash(password, 10)

    // Inserir novo usuário
    const result = await query(
      'INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role, created_at',
      [email, hashedPassword, name, role]
    )

    const newUser = result.rows[0]

    console.log('✅ Novo usuário criado:', newUser.email)

    return NextResponse.json({
      success: true,
      message: 'Usuário criado com sucesso',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        created_at: newUser.created_at
      }
    })

  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
