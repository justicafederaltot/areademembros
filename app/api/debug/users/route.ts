import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'

// Forçar rota dinâmica
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    console.log('🔍 Debug: Verificando usuários no banco...')
    
    // Buscar todos os usuários
    const result = await query('SELECT id, email, name, role, created_at FROM users ORDER BY id')
    
    console.log(`📊 Total de usuários encontrados: ${result.rows.length}`)
    
    if (result.rows.length > 0) {
      console.log('👥 Usuários no banco:')
      result.rows.forEach((user, index) => {
        console.log(`${index + 1}. ID: ${user.id}, Email: ${user.email}, Nome: ${user.name}, Role: ${user.role}`)
      })
    } else {
      console.log('❌ Nenhum usuário encontrado no banco!')
    }
    
    return NextResponse.json({
      success: true,
      total_users: result.rows.length,
      users: result.rows,
      message: result.rows.length > 0 ? 'Usuários encontrados' : 'Nenhum usuário encontrado'
    })
    
  } catch (error) {
    console.error('❌ Erro ao verificar usuários:', error)
    
    return NextResponse.json(
      { 
        error: 'Erro ao verificar usuários',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }
    
    console.log(`🔍 Debug: Verificando credenciais para ${email}...`)
    
    // Buscar usuário específico
    const result = await query('SELECT * FROM users WHERE email = $1', [email])
    const user = result.rows[0]
    
    if (!user) {
      console.log(`❌ Usuário não encontrado: ${email}`)
      return NextResponse.json({
        found: false,
        message: 'Usuário não encontrado',
        email: email
      })
    }
    
    console.log(`✅ Usuário encontrado: ${user.email}`)
    console.log(`📧 Email: ${user.email}`)
    console.log(`👤 Nome: ${user.name}`)
    console.log(`🔑 Role: ${user.role}`)
    console.log(`🔐 Senha hash: ${user.password.substring(0, 20)}...`)
    
    return NextResponse.json({
      found: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        created_at: user.created_at,
        password_hash_preview: user.password.substring(0, 20) + '...'
      },
      message: 'Usuário encontrado'
    })
    
  } catch (error) {
    console.error('❌ Erro ao verificar credenciais:', error)
    
    return NextResponse.json(
      { 
        error: 'Erro ao verificar credenciais',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}
