import { query, closePool } from '../lib/database'

async function fixCourseImages() {
  try {
    console.log('Corrigindo URLs das imagens dos cursos...')
    
    // Mapeamento de imagens que não existem para imagens que existem
    const imageMapping: Record<string, string> = {
      'audiencia.png': 'CAPA RPV.png',
      'triagem.png': 'SENTENÇA.png',
      'PERÍCIAS.png': 'CAPA RPV.png',
      'SENTENÇA CRIMINAL.png': 'SENTENÇA.png',
      'analise.png': 'CAPA RPV.png',
      'CAPA SENTENÇA.png': 'SENTENÇA.png'
    }
    
    // Buscar todos os cursos
    const result = await query('SELECT * FROM courses ORDER BY id')
    
    console.log(`\nTotal de cursos encontrados: ${result.rows.length}`)
    
    for (const course of result.rows) {
      const currentImageUrl = course.image_url
      
      // Extrair o nome do arquivo da URL
      const fileName: string = currentImageUrl.replace('/api/images/', '')
      
      // Verificar se a imagem atual não existe e se há um mapeamento
      if (fileName in imageMapping) {
        const newImageUrl = `/api/images/${imageMapping[fileName]}`
        
        console.log(`\nCurso ID ${course.id}: "${course.title}"`)
        console.log(`  Imagem atual: ${currentImageUrl}`)
        console.log(`  Nova imagem: ${newImageUrl}`)
        
        // Atualizar a URL da imagem no banco
        await query(
          'UPDATE courses SET image_url = $1 WHERE id = $2',
          [newImageUrl, course.id]
        )
        
        console.log(`  ✅ Atualizado com sucesso!`)
      } else {
        console.log(`\nCurso ID ${course.id}: "${course.title}"`)
        console.log(`  Imagem: ${currentImageUrl} (mantida como está)`)
      }
    }
    
    console.log('\n✅ Correção das imagens concluída!')
    
  } catch (error) {
    console.error('Erro ao corrigir imagens dos cursos:', error)
  } finally {
    await closePool()
  }
}

fixCourseImages()
