import { NextRequest, NextResponse } from 'next/server'
import { initializeDatabase } from '@/lib/database'

// Forçar rota dinâmica
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Debug: Inicializando banco de dados (sem autenticação)...')
    
    // Inicializar banco de dados
    await initializeDatabase()
    
    console.log('✅ Banco de dados inicializado com sucesso (debug)!')
    
    return NextResponse.json({
      success: true,
      message: 'Banco de dados inicializado com sucesso (debug mode)',
      credentials: {
        email: 'admin@jus.com',
        password: 'admin123'
      },
      warning: 'Esta rota não tem autenticação - use apenas para debug'
    })
    
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados (debug):', error)
    
    return NextResponse.json(
      { 
        error: 'Erro ao inicializar banco de dados',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
