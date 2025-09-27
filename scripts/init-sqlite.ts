import { initDatabase, createAdminUser, createSampleData } from '../lib/database-sqlite'

async function main() {
  try {
    console.log('🚀 Inicializando banco SQLite...')
    console.log('================================')
    
    console.log('📊 Inicializando banco de dados...')
    await initDatabase()
    
    console.log('👤 Criando usuário admin...')
    await createAdminUser()
    
    console.log('📚 Criando dados de exemplo...')
    await createSampleData()
    
    console.log('')
    console.log('🎉 Inicialização concluída com sucesso!')
    console.log('')
    console.log('📋 Credenciais de acesso:')
    console.log('   Email: admin@jus.com')
    console.log('   Senha: admin123')
    console.log('')
    console.log('🚀 Execute: npm run dev')
    console.log('🌐 Acesse: http://localhost:3000')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Erro na inicialização:', error)
    process.exit(1)
  }
}

main()

