import pool, { initDatabase } from '../lib/database'
import bcrypt from 'bcryptjs'

async function createAdminUser() {
  try {
    // Verificar se já existe um usuário admin
    const existingAdmin = await pool.query(
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
    await pool.query(
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
        title: 'BASE DE OPERAÇÃO',
        description: 'Configure a Estrutura de Anunciante Profissional',
        category: 'jef',
        image_url: ''
      },
      {
        title: 'DOMÍNIO DO TRÁFEGO',
        description: 'Domine a Criação das Campanhas de Resultados',
        category: 'jef',
        image_url: ''
      },
      {
        title: 'MÁQUINAS DE VENDAS ONLINE',
        description: 'A Caixa Preta de Estratégias que Geram Milhões',
        category: 'jef',
        image_url: ''
      },
      {
        title: 'PROFISSÃO GESTOR DE TRÁFEGO',
        description: 'Aprenda a ser um gestor de tráfego profissional',
        category: 'vara',
        image_url: ''
      },
      {
        title: 'RECORRÊNCIA ETERNA Google Ads',
        description: 'Estratégias para criar recorrência no Google Ads',
        category: 'vara',
        image_url: ''
      }
    ]

    for (const course of courses) {
      const result = await pool.query(
        'INSERT INTO courses (title, description, category, image_url) VALUES ($1, $2, $3, $4) RETURNING id',
        [course.title, course.description, course.category, course.image_url]
      )

      const courseId = result.rows[0].id

      // Criar aulas de exemplo para cada curso
      const lessons = [
        {
          title: 'BOAS VINDAS',
          description: 'Aula de boas-vindas ao curso',
          video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          order_index: 1
        },
        {
          title: 'INTRODUÇÃO AO CONTEÚDO',
          description: 'Introdução aos conceitos principais',
          video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          order_index: 2
        }
      ]

      for (const lesson of lessons) {
        await pool.query(
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
    process.exit(0)
  } catch (error) {
    console.error('Erro na inicialização:', error)
    process.exit(1)
  }
}

main()
