import { query, closePool } from '../lib/database'

async function updateCourseImages() {
  try {
    console.log('Verificando imagens dos cursos...')

    // Verificar cursos sem imagem
    const coursesWithoutImage = await query(`
      SELECT id, title, category, image_url 
      FROM courses 
      WHERE image_url = '' OR image_url IS NULL
    `)

    console.log('Cursos sem imagem encontrados:', coursesWithoutImage.rows.length)

    if (coursesWithoutImage.rows.length > 0) {
      // Atualizar apenas cursos JEF sem imagem
      await query(`
        UPDATE courses 
        SET image_url = '/images/banner/BANNER1.png' 
        WHERE category = 'jef' AND (image_url = '' OR image_url IS NULL)
      `)

      // Atualizar apenas cursos VARA sem imagem
      await query(`
        UPDATE courses 
        SET image_url = '/images/banner/BANNER2.png' 
        WHERE category = 'vara' AND (image_url = '' OR image_url IS NULL)
      `)

      console.log('Imagens padrão adicionadas para cursos sem imagem!')
    } else {
      console.log('Todos os cursos já possuem imagens!')
    }
    
    // Verificar todos os cursos
    const result = await query('SELECT title, category, image_url FROM courses ORDER BY category, title')
    console.log('Status atual dos cursos:')
    result.rows.forEach(course => {
      console.log(`- ${course.title} (${course.category}): ${course.image_url || 'Sem imagem'}`)
    })
    
  } catch (error) {
    console.error('Erro ao verificar imagens:', error)
  } finally {
    await closePool()
  }
}

updateCourseImages()
