import pool from '../lib/database'

async function checkCourses() {
  try {
    console.log('Verificando cursos no banco de dados...')
    
    const result = await pool.query('SELECT * FROM courses ORDER BY created_at DESC')
    
    console.log(`\nTotal de cursos encontrados: ${result.rows.length}`)
    
    if (result.rows.length === 0) {
      console.log('Nenhum curso encontrado no banco de dados.')
      return
    }
    
    console.log('\nDetalhes dos cursos:')
    console.log('='.repeat(80))
    
    result.rows.forEach((course, index) => {
      console.log(`\n${index + 1}. Curso ID: ${course.id}`)
      console.log(`   Título: ${course.title}`)
      console.log(`   Categoria: ${course.category}`)
      console.log(`   URL da Imagem: ${course.image_url}`)
      console.log(`   Criado em: ${course.created_at}`)
      console.log('-'.repeat(40))
    })
    
  } catch (error) {
    console.error('Erro ao verificar cursos:', error)
  } finally {
    await pool.end()
  }
}

checkCourses()
