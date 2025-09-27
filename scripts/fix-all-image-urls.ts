import { query, closePool } from '../lib/database'
import { readdir } from 'fs/promises'
import { join } from 'path'

async function fixAllImageUrls() {
  try {
    console.log('Corrigindo todas as URLs de imagens...')

    // Listar arquivos no diretório uploads
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    const files = await readdir(uploadDir)
    const imageFiles = files.filter(file => file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg'))
    
    console.log('Arquivos encontrados:', imageFiles)

    // Buscar todos os cursos
    const courses = await query('SELECT id, title, image_url FROM courses')
    
    console.log('Cursos encontrados:', courses.rows.length)

    // Corrigir URLs baseado nos arquivos existentes
    for (const course of courses.rows) {
      const currentUrl = course.image_url
      
      if (!currentUrl || currentUrl === '') {
        console.log(`Curso sem imagem: ${course.title}`)
        continue
      }
      
      if (currentUrl.startsWith('/uploads/')) {
        const fileName = currentUrl.split('/').pop() // Pega o nome do arquivo da URL
        
        // Verificar se o arquivo existe
        const fileExists = imageFiles.some(file => file === fileName)
        
        if (!fileExists) {
          console.log(`Arquivo não encontrado para: ${course.title} - ${fileName}`)
          
          // Tentar encontrar um arquivo similar baseado no título
          let similarFile = null
          
          if (course.title.includes('RPV')) {
            similarFile = imageFiles.find(file => file.includes('RPV'))
          } else if (course.title.includes('SENTENÇA') || course.title.includes('sentenciar')) {
            similarFile = imageFiles.find(file => file.includes('SENTENÇA'))
          }
          
          if (similarFile) {
            const newUrl = `/uploads/${similarFile}`
            await query(
              'UPDATE courses SET image_url = $1 WHERE id = $2',
              [newUrl, course.id]
            )
            console.log(`URL corrigida para ${course.title}: ${newUrl}`)
          } else {
            console.log(`Nenhum arquivo similar encontrado para: ${course.title}`)
          }
        } else {
          console.log(`Arquivo encontrado para: ${course.title} - ${fileName}`)
        }
      }
    }

    // Verificar resultado final
    const finalResult = await query('SELECT title, image_url FROM courses ORDER BY title')
    console.log('Status final dos cursos:')
    finalResult.rows.forEach(course => {
      console.log(`- ${course.title}: ${course.image_url || 'Sem imagem'}`)
    })
    
  } catch (error) {
    console.error('Erro ao corrigir URLs:', error)
  } finally {
    await closePool()
  }
}

fixAllImageUrls()
