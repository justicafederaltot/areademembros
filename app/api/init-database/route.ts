import { NextRequest, NextResponse } from 'next/server'
import { initializeDatabase } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Inicializando banco de dados via API...')
    
    // Verificar se é uma requisição autorizada (opcional)
    const authHeader = request.headers.get('authorization')
    const expectedToken = process.env.INIT_TOKEN || 'init-secret-token'
    
    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Token de autorização inválido' },
        { status: 401 }
      )
    }

    // Inicializar banco de dados
    await initializeDatabase()
    
    console.log('✅ Banco de dados inicializado com sucesso via API!')
    
    return NextResponse.json({
      success: true,
      message: 'Banco de dados inicializado com sucesso',
      credentials: {
        email: 'admin@jus.com',
        password: 'admin123'
      }
    })
    
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados via API:', error)
    
    return NextResponse.json(
      { 
        error: 'Erro ao inicializar banco de dados',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}

// Rota GET para verificar status (sem autenticação)
export async function GET() {
  try {
    const { testConnection } = await import('@/lib/database')
    const isConnected = await testConnection()
    
    return NextResponse.json({
      status: 'ok',
      database_connected: isConnected,
      message: 'API funcionando corretamente'
    })
    
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'error',
        database_connected: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}
