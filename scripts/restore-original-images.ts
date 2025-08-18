import pool from '../lib/database'

async function restoreOriginalImages() {
  try {
    console.log('Restaurando URLs originais das imagens dos cursos...')
    
    // Mapeamento para restaurar as URLs originais
    const imageMapping = {
      'CAPA RPV.png': 'audiencia.png',
      'SENTENÇA.png': 'triagem.png',
      'CAPA RPV.png': 'PERÍCIAS.png',
      'SENTENÇA.png': 'SENTENÇA CRIMINAL.png',
      'CAPA RPV.png': 'analise.png',
      'SENTENÇA.png': 'CAPA SENTENÇA.png'
    }
    
    // Buscar todos os cursos
    const result = await pool.query('SELECT * FROM courses ORDER BY id')
    
    console.log(`\nTotal de cursos encontrados: ${result.rows.length}`)
    
    for (const course of result.rows) {
      const currentImageUrl = course.image_url
      
      // Extrair o nome do arquivo da URL
      const fileName = currentImageUrl.replace('/api/images/', '')
      
      // Verificar se a imagem atual foi alterada e se há um mapeamento para restaurar
      if (fileName === 'CAPA RPV.png' || fileName === 'SENTENÇA.png') {
        // Determinar qual era a imagem original baseado no título do curso
        let originalImage = ''
        
        if (course.title.includes('audiência') || course.title.includes('audiencia')) {
          originalImage = 'audiencia.png'
        } else if (course.title.includes('triagem')) {
          originalImage = 'triagem.png'
        } else if (course.title.includes('perícia') || course.title.includes('pericia')) {
          originalImage = 'PERÍCIAS.png'
        } else if (course.title.includes('sentença') || course.title.includes('sentenca')) {
          if (course.title.includes('criminal')) {
            originalImage = 'SENTENÇA CRIMINAL.png'
          } else {
            originalImage = 'CAPA SENTENÇA.png'
          }
        } else if (course.title.includes('análise') || course.title.includes('analise') || 
                   course.title.includes('prisão') || course.title.includes('presidio') ||
                   course.title.includes('inquérito') || course.title.includes('inquerito')) {
          originalImage = 'analise.png'
        } else if (course.title.includes('RPV')) {
          originalImage = 'CAPA RPV.png'
        } else {
          // Manter como está se não conseguir determinar
          console.log(`\nCurso ID ${course.id}: "${course.title}"`)
          console.log(`  Imagem: ${currentImageUrl} (mantida como está)`)
          continue
        }
        
        const newImageUrl = `/api/images/${originalImage}`
        
        console.log(`\nCurso ID ${course.id}: "${course.title}"`)
        console.log(`  Imagem atual: ${currentImageUrl}`)
        console.log(`  Imagem original: ${newImageUrl}`)
        
        // Atualizar a URL da imagem no banco
        await pool.query(
          'UPDATE courses SET image_url = $1 WHERE id = $2',
          [newImageUrl, course.id]
        )
        
        console.log(`  ✅ Restaurado com sucesso!`)
      } else {
        console.log(`\nCurso ID ${course.id}: "${course.title}"`)
        console.log(`  Imagem: ${currentImageUrl} (já está correta)`)
      }
    }
    
    console.log('\n✅ Restauração das imagens concluída!')
    
  } catch (error) {
    console.error('Erro ao restaurar imagens dos cursos:', error)
  } finally {
    await pool.end()
  }
}

restoreOriginalImages()
