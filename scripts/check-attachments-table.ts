import { query, closePool } from '../lib/database'

async function checkAttachmentsTable() {
  try {
    console.log('🔍 Verificando estrutura da tabela lesson_attachments...')
    
    // Verificar se a tabela existe
    const tableExists = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'lesson_attachments'
      )
    `)
    
    if (!tableExists.rows[0].exists) {
      console.log('❌ Tabela lesson_attachments não existe! Criando...')
      
      await query(`
        CREATE TABLE IF NOT EXISTS lesson_attachments (
          id SERIAL PRIMARY KEY,
          lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
          filename VARCHAR(255) NOT NULL,
          original_name VARCHAR(255) NOT NULL,
          content_type VARCHAR(100) NOT NULL,
          file_size INTEGER NOT NULL,
          file_data BYTEA NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)
      
      console.log('✅ Tabela lesson_attachments criada com sucesso!')
    } else {
      console.log('✅ Tabela lesson_attachments já existe')
    }
    
    // Verificar estrutura da tabela
    const columns = await query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'lesson_attachments' 
      ORDER BY ordinal_position
    `)
    
    console.log('\n📋 Estrutura da tabela lesson_attachments:')
    columns.rows.forEach((col: any) => {
      console.log(`- ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(NOT NULL)'} ${col.column_default ? `DEFAULT: ${col.column_default}` : ''}`)
    })
    
    // Verificar dados existentes
    const attachmentsCount = await query('SELECT COUNT(*) FROM lesson_attachments')
    console.log(`\n📊 Total de anexos cadastrados: ${attachmentsCount.rows[0].count}`)
    
    if (parseInt(attachmentsCount.rows[0].count) > 0) {
      const sampleAttachment = await query('SELECT id, lesson_id, filename, original_name, content_type, file_size, created_at FROM lesson_attachments LIMIT 1')
      console.log('\n📝 Exemplo de anexo:')
      console.log(sampleAttachment.rows[0])
    }
    
    // Verificar se o campo attachments existe na tabela lessons
    const lessonsColumns = await query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'lessons' AND column_name = 'attachments'
    `)
    
    if (lessonsColumns.rows.length === 0) {
      console.log('\n⚠️  Campo attachments não existe na tabela lessons! Adicionando...')
      
      await query(`
        ALTER TABLE lessons 
        ADD COLUMN attachments JSONB DEFAULT '[]'
      `)
      
      console.log('✅ Campo attachments adicionado com sucesso!')
    } else {
      console.log('\n✅ Campo attachments já existe na tabela lessons')
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar tabela:', error)
  } finally {
    await closePool()
    process.exit(0)
  }
}

checkAttachmentsTable()
