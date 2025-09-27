// Importar configuração PostgreSQL
import { 
  query, 
  initDatabase, 
  createAdminUser, 
  createSampleData, 
  testConnection,
  closePool,
  default as pool
} from './database-postgres'

// Re-exportar funções do PostgreSQL
export { 
  query, 
  initDatabase, 
  createAdminUser, 
  createSampleData, 
  testConnection,
  closePool 
}

// Exportar pool como default
export { pool as default }

// Função para inicializar o banco completo
export async function initializeDatabase() {
  try {
    console.log('🚀 Inicializando banco de dados PostgreSQL...')
    
    // Testar conexão
    const connected = await testConnection()
    if (!connected) {
      throw new Error('Não foi possível conectar ao banco PostgreSQL')
    }
    
    // Inicializar tabelas
    await initDatabase()
    
    // Criar usuário admin
    await createAdminUser()
    
    // Criar dados de exemplo (opcional)
    await createSampleData()
    
    console.log('✅ Banco de dados inicializado com sucesso!')
    return true
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error)
    throw error
  }
}

