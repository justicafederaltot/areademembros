import { initializeDatabase } from '../lib/database'

async function main() {
  try {
    console.log('🚀 Iniciando configuração do banco PostgreSQL...')
    
    // Verificar se a variável de ambiente está configurada
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL não está configurada!')
      console.error('Configure a variável de ambiente DATABASE_URL com a URL do seu banco PostgreSQL')
      process.exit(1)
    }
    
    console.log('✅ DATABASE_URL configurada')
    console.log('📡 Conectando ao banco PostgreSQL...')
    
    // Inicializar o banco
    await initializeDatabase()
    
    console.log('🎉 Banco PostgreSQL configurado com sucesso!')
    console.log('📋 Próximos passos:')
    console.log('   1. Execute: npm run dev')
    console.log('   2. Acesse: http://localhost:3000')
    console.log('   3. Faça login com: admin@jus.com / admin123')
    
  } catch (error) {
    console.error('❌ Erro ao configurar banco PostgreSQL:', error)
    process.exit(1)
  }
}

main()
