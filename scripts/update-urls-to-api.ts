import pool from '../lib/database'

async function updateUrlsToApi() {
  try {
    console.log('Atualizando URLs para usar a API route...')
    
    // Atualizar curso "Como gerar RPVs"
    await pool.query(
      'UPDATE courses SET image_url = $1 WHERE title = $2',
      ['/api/images/CAPA RPV.png', 'Como gerar RPVs']
    )
    console.log('URL atualizada para "Como gerar RPVs": /api/images/CAPA RPV.png')
    
    // Atualizar curso "Como sentenciar processos"
    await pool.query(
      'UPDATE courses SET image_url = $1 WHERE title = $2',
      ['/api/images/SENTENÇA.png', 'Como sentenciar processos']
    )
    console.log('URL atualizada para "Como sentenciar processos": /api/images/SENTENÇA.png')
    
    // Atualizar curso "TESTE" se existir
    await pool.query(
      'UPDATE courses SET image_url = $1 WHERE title = $2',
      ['/api/images/download.jpg', 'TESTE']
    )
    console.log('URL atualizada para "TESTE": /api/images/download.jpg')
    
    // Verificar resultado final
    const finalResult = await pool.query('SELECT title, image_url FROM courses ORDER BY title')
    console.log('Status final dos cursos:')
    finalResult.rows.forEach(course => {
      console.log(`- ${course.title}: ${course.image_url}`)
    })
    
  } catch (error) {
    console.error('Erro ao atualizar URLs:', error)
  } finally {
    await pool.end()
  }
}

updateUrlsToApi()
