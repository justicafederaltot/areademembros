import { query, closePool } from '../lib/database'

async function checkAllCourses() {
  try {
    console.log('Verificando todos os cursos no banco...')
    
    const result = await query('SELECT id, title, description, category, image_url FROM courses ORDER BY id')
    
    console.log(`Total de cursos: ${result.rows.length}`)
    console.log('Cursos encontrados:')
    
    result.rows.forEach((course, index) => {
      console.log(`${index + 1}. ID: ${course.id}`)
      console.log(`   Título: ${course.title}`)
      console.log(`   Categoria: ${course.category}`)
      console.log(`   Imagem: ${course.image_url || 'Sem imagem'}`)
      console.log(`   Descrição: ${course.description}`)
      console.log('---')
    })
    
  } catch (error) {
    console.error('Erro ao verificar cursos:', error)
  } finally {
    await closePool()
  }
}

checkAllCourses()
