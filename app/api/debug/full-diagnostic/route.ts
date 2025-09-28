import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { query, testConnection } from '@/lib/database'

// Forçar rota dinâmica
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    console.log('🔍 Iniciando diagnóstico completo...')
    
    const diagnostic = {
      timestamp: new Date().toISOString(),
      environment: {
        node_env: process.env.NODE_ENV,
        has_jwt_secret: !!process.env.JWT_SECRET,
        has_database_url: !!process.env.DATABASE_URL,
        has_init_token: !!process.env.INIT_TOKEN
      },
      database: {
        connected: false,
        error: null
      },
      users: {
        total: 0,
        list: [],
        admin_exists: false
      },
      tests: {
        connection_test: null,
        user_query_test: null,
        password_hash_test: null
      }
    }
    
    // Teste 1: Conexão com banco
    try {
      diagnostic.database.connected = await testConnection()
      diagnostic.tests.connection_test = 'success'
      console.log('✅ Conexão com banco: OK')
    } catch (error) {
      diagnostic.database.error = error instanceof Error ? error.message : 'Erro desconhecido'
      diagnostic.tests.connection_test = 'failed'
      console.log('❌ Conexão com banco: FALHOU')
      console.log('Erro:', error)
    }
    
    // Teste 2: Query de usuários
    try {
      const result = await query('SELECT id, email, name, role, created_at FROM users ORDER BY id')
      diagnostic.users.total = result.rows.length
      diagnostic.users.list = result.rows
      diagnostic.users.admin_exists = result.rows.some(user => user.email === 'admin@jus.com')
      diagnostic.tests.user_query_test = 'success'
      console.log(`✅ Query de usuários: OK (${result.rows.length} usuários)`)
    } catch (error) {
      diagnostic.tests.user_query_test = 'failed'
      console.log('❌ Query de usuários: FALHOU')
      console.log('Erro:', error)
    }
    
    // Teste 3: Hash de senha
    try {
      const testPassword = 'admin123'
      const hashedPassword = await bcrypt.hash(testPassword, 10)
      const isValid = await bcrypt.compare(testPassword, hashedPassword)
      diagnostic.tests.password_hash_test = isValid ? 'success' : 'failed'
      console.log('✅ Teste de hash: OK')
    } catch (error) {
      diagnostic.tests.password_hash_test = 'failed'
      console.log('❌ Teste de hash: FALHOU')
      console.log('Erro:', error)
    }
    
    console.log('📊 Diagnóstico completo finalizado')
    
    return NextResponse.json(diagnostic)
    
  } catch (error) {
    console.error('❌ Erro no diagnóstico:', error)
    
    return NextResponse.json(
      { 
        error: 'Erro no diagnóstico',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, email, password } = await request.json()
    
    console.log(`🔧 Ação solicitada: ${action}`)
    
    if (action === 'create_admin') {
      console.log('👤 Criando usuário admin...')
      
      // Verificar se já existe
      const existingResult = await query('SELECT * FROM users WHERE email = $1', [email || 'admin@jus.com'])
      
      if (existingResult.rows.length > 0) {
        console.log('⚠️ Usuário admin já existe, removendo...')
        await query('DELETE FROM users WHERE email = $1', [email || 'admin@jus.com'])
      }
      
      // Criar novo usuário admin
      const newPassword = password || 'admin123'
      const hashedPassword = await bcrypt.hash(newPassword, 10)
      
      const result = await query(
        'INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role',
        [email || 'admin@jus.com', hashedPassword, 'Administrador', 'admin']
      )
      
      const newUser = result.rows[0]
      
      console.log('✅ Usuário admin criado com sucesso!')
      console.log(`📧 Email: ${newUser.email}`)
      console.log(`🔑 Senha: ${newPassword}`)
      console.log(`🆔 ID: ${newUser.id}`)
      
      return NextResponse.json({
        success: true,
        message: 'Usuário admin criado com sucesso',
        user: newUser,
        credentials: {
          email: newUser.email,
          password: newPassword
        }
      })
    }
    
    if (action === 'test_login') {
      console.log(`🔍 Testando login para: ${email}`)
      
      const result = await query('SELECT * FROM users WHERE email = $1', [email])
      const user = result.rows[0]
      
      if (!user) {
        return NextResponse.json({
          success: false,
          step: 'user_not_found',
          message: 'Usuário não encontrado'
        })
      }
      
      const isValidPassword = await bcrypt.compare(password, user.password)
      
      return NextResponse.json({
        success: isValidPassword,
        step: isValidPassword ? 'success' : 'invalid_password',
        message: isValidPassword ? 'Login válido' : 'Senha incorreta',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      })
    }
    
    return NextResponse.json({
      error: 'Ação não reconhecida',
      available_actions: ['create_admin', 'test_login']
    }, { status: 400 })
    
  } catch (error) {
    console.error('❌ Erro na ação:', error)
    
    return NextResponse.json(
      { 
        error: 'Erro na ação',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}
