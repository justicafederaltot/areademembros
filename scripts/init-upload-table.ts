import { initDatabase } from '../lib/database'

async function initUploadTable() {
  try {
    console.log('Inicializando tabela uploaded_images...')
    
    await initDatabase()
    
    console.log('✅ Tabela uploaded_images criada com sucesso!')
    console.log('\nAgora o sistema pode:')
    console.log('- Em desenvolvimento: salvar imagens no sistema de arquivos')
    console.log('- Em produção (Render): salvar imagens no banco de dados PostgreSQL')
    
  } catch (error) {
    console.error('❌ Erro ao inicializar tabela:', error)
  } finally {
    process.exit(0)
  }
}

initUploadTable()
