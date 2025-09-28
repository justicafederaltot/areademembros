import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { query } from '@/lib/database'

// Forçar rota dinâmica
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { email = 'admin@destrava.com', password = 'destrava123', name = 'Admin Destrava' } = await request.json()
    
    console.log(`👤 Criando usuário alternativo: ${email}`)
    
    // Verificar se já existe
    const existingResult = await query('SELECT * FROM users WHERE email = $1', [email])
    
    if (existingResult.rows.length > 0) {
      console.log('⚠️ Usuário já existe, removendo...')
      await query('DELETE FROM users WHERE email = $1', [email])
    }
    
    // Criar hash da senha
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Inserir usuário
    const result = await query(
      'INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role, created_at',
      [email, hashedPassword, name, 'admin']
    )
    
    const newUser = result.rows[0]
    
    console.log('✅ Usuário criado com sucesso!')
    console.log(`📧 Email: ${newUser.email}`)
    console.log(`🔑 Senha: ${password}`)
    console.log(`👤 Nome: ${newUser.name}`)
    console.log(`🆔 ID: ${newUser.id}`)
    
    return NextResponse.json({
      success: true,
      message: 'Usuário criado com sucesso',
      user: newUser,
      credentials: {
        email: newUser.email,
        password: password
      },
      login_url: `${request.nextUrl.origin}/`,
      instructions: [
        '1. Use as credenciais acima para fazer login',
        '2. Se ainda não funcionar, verifique o diagnóstico completo',
        '3. Teste também as credenciais originais: admin@jus.com / admin123'
      ]
    })
    
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error)
    
    return NextResponse.json(
      { 
        error: 'Erro ao criar usuário',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
