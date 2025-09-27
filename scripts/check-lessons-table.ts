import { query, closePool } from '../lib/database'

async function checkLessonsTable() {
  try {
    console.log('🔍 Verificando estrutura da tabela lessons...')
    
    // Verificar se a tabela existe
    const tableExists = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'lessons'
      )
    `)
    
    if (!tableExists.rows[0].exists) {
      console.log('❌ Tabela lessons não existe!')
      return
    }
    
    console.log('✅ Tabela lessons existe')
    
    // Verificar estrutura da tabela
    const columns = await query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'lessons' 
      ORDER BY ordinal_position
    `)
    
    console.log('\n📋 Estrutura da tabela lessons:')
    columns.rows.forEach((col: any) => {
      console.log(`- ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(NOT NULL)'} ${col.column_default ? `DEFAULT: ${col.column_default}` : ''}`)
    })
    
    // Verificar se o campo attachments existe
    const hasAttachments = columns.rows.some((col: any) => col.column_name === 'attachments')
    
    if (!hasAttachments) {
      console.log('\n⚠️  Campo attachments não existe! Adicionando...')
      
      await query(`
        ALTER TABLE lessons 
        ADD COLUMN attachments JSONB DEFAULT '[]'
      `)
      
      console.log('✅ Campo attachments adicionado com sucesso!')
    } else {
      console.log('\n✅ Campo attachments já existe')
    }
    
    // Verificar dados existentes
    const lessonsCount = await query('SELECT COUNT(*) FROM lessons')
    console.log(`\n📊 Total de aulas cadastradas: ${lessonsCount.rows[0].count}`)
    
    if (parseInt(lessonsCount.rows[0].count) > 0) {
      const sampleLesson = await query('SELECT * FROM lessons LIMIT 1')
      console.log('\n📝 Exemplo de aula:')
      console.log(sampleLesson.rows[0])
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar tabela:', error)
  } finally {
    await closePool()
    process.exit(0)
  }
}

checkLessonsTable()
