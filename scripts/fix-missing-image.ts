import { query, closePool } from '../lib/database'

async function fixMissingImage() {
  try {
    console.log('Corrigindo curso sem imagem...')
    
    // Buscar o curso "Como gerar RPVs" que está sem imagem
    const result = await query(
      'SELECT id, title FROM courses WHERE title = $1 AND (image_url = \'\' OR image_url IS NULL)',
      ['Como gerar RPVs']
    )
    
    if (result.rows.length > 0) {
      const course = result.rows[0]
      console.log(`Curso encontrado: ${course.title} (ID: ${course.id})`)
      
      // Atualizar com a imagem correta
      await query(
        'UPDATE courses SET image_url = $1 WHERE id = $2',
        ['/uploads/1755214246152-RPV.png', course.id]
      )
      
      console.log('Imagem corrigida com sucesso!')
    } else {
      console.log('Curso não encontrado ou já tem imagem')
    }
    
    // Verificar resultado
    const finalResult = await query('SELECT title, image_url FROM courses WHERE title = $1', ['Como gerar RPVs'])
    console.log('Status final:')
    finalResult.rows.forEach(course => {
      console.log(`- ${course.title}: ${course.image_url}`)
    })
    
  } catch (error) {
    console.error('Erro ao corrigir imagem:', error)
  } finally {
    await closePool()
  }
}

fixMissingImage()
