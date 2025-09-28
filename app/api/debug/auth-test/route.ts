import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { query } from '@/lib/database'

// Forçar rota dinâmica
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }
    
    console.log(`🔍 Debug Auth: Testando login para ${email}...`)
    
    // Buscar usuário no banco
    const result = await query('SELECT * FROM users WHERE email = $1', [email])
    const user = result.rows[0]
    
    if (!user) {
      console.log(`❌ Usuário não encontrado: ${email}`)
      return NextResponse.json({
        success: false,
        step: 'user_not_found',
        message: 'Usuário não encontrado',
        email: email
      })
    }
    
    console.log(`✅ Usuário encontrado: ${user.email}`)
    console.log(`🔐 Testando senha...`)
    
    // Testar senha
    const isValidPassword = await bcrypt.compare(password, user.password)
    
    if (!isValidPassword) {
      console.log(`❌ Senha incorreta para: ${email}`)
      return NextResponse.json({
        success: false,
        step: 'invalid_password',
        message: 'Senha incorreta',
        email: email,
        user_found: true
      })
    }
    
    console.log(`✅ Senha correta para: ${email}`)
    
    return NextResponse.json({
      success: true,
      message: 'Autenticação bem-sucedida',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        created_at: user.created_at
      }
    })
    
  } catch (error) {
    console.error('❌ Erro no teste de autenticação:', error)
    
    return NextResponse.json(
      { 
        error: 'Erro no teste de autenticação',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}
