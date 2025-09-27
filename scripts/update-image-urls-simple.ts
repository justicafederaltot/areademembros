import { query, closePool } from '../lib/database'

async function updateImageUrlsSimple() {
  try {
    console.log('Atualizando URLs das imagens para nomes simples...')
    
    // Atualizar curso "Como gerar RPVs"
    await query(
      'UPDATE courses SET image_url = $1 WHERE title = $2',
      ['/uploads/CAPA RPV.png', 'Como gerar RPVs']
    )
    console.log('URL atualizada para "Como gerar RPVs": /uploads/CAPA RPV.png')
    
    // Atualizar curso "Como sentenciar processos"
    await query(
      'UPDATE courses SET image_url = $1 WHERE title = $2',
      ['/uploads/SENTENÇA.png', 'Como sentenciar processos']
    )
    console.log('URL atualizada para "Como sentenciar processos": /uploads/SENTENÇA.png')
    
    // Verificar resultado final
    const finalResult = await query('SELECT title, image_url FROM courses WHERE title IN ($1, $2)', ['Como gerar RPVs', 'Como sentenciar processos'])
    console.log('Status final dos cursos:')
    finalResult.rows.forEach(course => {
      console.log(`- ${course.title}: ${course.image_url}`)
    })
    
  } catch (error) {
    console.error('Erro ao atualizar URLs:', error)
  } finally {
    await closePool()
  }
}

updateImageUrlsSimple()
