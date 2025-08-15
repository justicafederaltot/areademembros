import pool from '../lib/database'

async function updateCourseImages() {
  try {
    console.log('Atualizando imagens dos cursos...')

    // Atualizar cursos JEF
    await pool.query(`
      UPDATE courses 
      SET image_url = '/images/banner/BANNER1.png' 
      WHERE category = 'jef' AND (image_url = '' OR image_url IS NULL)
    `)

    // Atualizar cursos VARA
    await pool.query(`
      UPDATE courses 
      SET image_url = '/images/banner/BANNER2.png' 
      WHERE category = 'vara' AND (image_url = '' OR image_url IS NULL)
    `)

    console.log('Imagens dos cursos atualizadas com sucesso!')
    
    // Verificar os resultados
    const result = await pool.query('SELECT title, category, image_url FROM courses')
    console.log('Cursos atualizados:', result.rows)
    
  } catch (error) {
    console.error('Erro ao atualizar imagens:', error)
  } finally {
    await pool.end()
  }
}

updateCourseImages()
