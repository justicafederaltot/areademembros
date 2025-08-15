import pool from '../lib/database'
import { readdir } from 'fs/promises'
import { join } from 'path'

async function fixImageUrls() {
  try {
    console.log('Corrigindo URLs das imagens...')

    // Listar arquivos no diretório uploads
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    const files = await readdir(uploadDir)
    const imageFiles = files.filter(file => file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg'))
    
    console.log('Arquivos encontrados:', imageFiles)

    // Buscar todos os cursos com imagens
    const courses = await pool.query('SELECT id, title, image_url FROM courses WHERE image_url LIKE \'/uploads/%\'')
    
    console.log('Cursos com imagens:', courses.rows)

    // Corrigir URLs baseado nos arquivos existentes
    for (const course of courses.rows) {
      const currentUrl = course.image_url
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
          await pool.query(
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

    // Verificar resultado final
    const finalResult = await pool.query('SELECT title, image_url FROM courses ORDER BY title')
    console.log('Status final dos cursos:')
    finalResult.rows.forEach(course => {
      console.log(`- ${course.title}: ${course.image_url}`)
    })
    
  } catch (error) {
    console.error('Erro ao corrigir URLs:', error)
  } finally {
    await pool.end()
  }
}

fixImageUrls()
