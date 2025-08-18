import { initDatabase } from '../lib/database'

async function initAttachmentsTable() {
  try {
    console.log('Inicializando tabela lesson_attachments...')
    
    await initDatabase()
    
    console.log('✅ Tabela lesson_attachments criada com sucesso!')
    console.log('\nAgora o sistema pode:')
    console.log('- Em desenvolvimento: salvar anexos no sistema de arquivos')
    console.log('- Em produção (Render): salvar anexos no banco de dados PostgreSQL')
    console.log('- Suportar tipos: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV, ZIP, RAR')
    console.log('- Tamanho máximo: 50MB por arquivo')
    
  } catch (error) {
    console.error('❌ Erro ao inicializar tabela:', error)
  } finally {
    process.exit(0)
  }
}

initAttachmentsTable()
