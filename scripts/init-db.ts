import { query, initDatabase, closePool } from '../lib/database'
import bcrypt from 'bcryptjs'

async function createAdminUser() {
  try {
    // Verificar se já existe um usuário admin
    const existingAdmin = await query(
      'SELECT * FROM users WHERE email = $1',
      ['admin@jus.com']
    )

    if (existingAdmin.rows.length > 0) {
      console.log('Usuário admin já existe')
      return
    }

    // Criar hash da senha
    const hashedPassword = await bcrypt.hash('admin123', 10)

    // Inserir usuário admin
    await query(
      'INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4)',
      ['admin@jus.com', hashedPassword, 'Administrador', 'admin']
    )

    console.log('Usuário admin criado com sucesso!')
    console.log('Email: admin@jus.com')
    console.log('Senha: admin123')
  } catch (error) {
    console.error('Erro ao criar usuário admin:', error)
  }
}

async function createSampleData() {
  try {
    // Criar cursos de exemplo
    const courses = [
      {
        title: 'Como gerar RPVs',
        description: 'Tutorial completo sobre como gerar RPVs no sistema',
        category: 'jef',
        image_url: '/images/banner/BANNER1.png'
      },
      {
        title: 'Como sentenciar processos',
        description: 'Guia prático para sentenciar processos na Justiça Federal',
        category: 'jef',
        image_url: '/images/banner/BANNER1.png'
      },
      {
        title: 'Tutorial VARA - Processo 1',
        description: 'Primeiro tutorial da VARA sobre procedimentos específicos',
        category: 'vara',
        image_url: '/images/banner/BANNER2.png'
      },
      {
        title: 'Tutorial VARA - Processo 2',
        description: 'Segundo tutorial da VARA sobre procedimentos específicos',
        category: 'vara',
        image_url: '/images/banner/BANNER2.png'
      },
      {
        title: 'Tutorial VARA - Processo 3',
        description: 'Terceiro tutorial da VARA sobre procedimentos específicos',
        category: 'vara',
        image_url: '/images/banner/BANNER2.png'
      }
    ]

    for (const course of courses) {
      const result = await query(
        'INSERT INTO courses (title, description, category, image_url) VALUES ($1, $2, $3, $4) RETURNING id',
        [course.title, course.description, course.category, course.image_url]
      )

      const courseId = result.rows[0].id

      // Criar aulas de exemplo para cada curso
      const lessons = [
        {
          title: 'Introdução',
          description: 'Aula introdutória ao tutorial',
          video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          order_index: 1
        },
        {
          title: 'Passo a Passo',
          description: 'Tutorial detalhado passo a passo',
          video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          order_index: 2
        }
      ]

      for (const lesson of lessons) {
        await query(
          'INSERT INTO lessons (course_id, title, description, video_url, order_index) VALUES ($1, $2, $3, $4, $5)',
          [courseId, lesson.title, lesson.description, lesson.video_url, lesson.order_index]
        )
      }
    }

    console.log('Dados de exemplo criados com sucesso!')
  } catch (error) {
    console.error('Erro ao criar dados de exemplo:', error)
  }
}

async function main() {
  try {
    console.log('Inicializando banco de dados...')
    await initDatabase()
    
    console.log('Criando usuário admin...')
    await createAdminUser()
    
    console.log('Criando dados de exemplo...')
    await createSampleData()
    
    console.log('Inicialização concluída!')
    await closePool()
    process.exit(0)
  } catch (error) {
    console.error('Erro na inicialização:', error)
    await closePool()
    process.exit(1)
  }
}

main()
