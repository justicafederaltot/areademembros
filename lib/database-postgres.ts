import { Pool, PoolClient } from 'pg'
import bcrypt from 'bcryptjs'

// Configuração do pool de conexões PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 20, // máximo de conexões no pool
  idleTimeoutMillis: 30000, // fechar conexões inativas após 30s
  connectionTimeoutMillis: 2000, // timeout de conexão de 2s
})

console.log('✅ Usando PostgreSQL como banco de dados')

// Função helper para executar queries
export async function query(text: string, params: any[] = []): Promise<{ rows: any[] }> {
  let client: PoolClient | undefined
  
  try {
    client = await pool.connect()
    
    // Para SELECT queries, retornar os dados
    if (text.trim().toLowerCase().startsWith('select')) {
      const result = await client.query(text, params)
      return { rows: result.rows }
    }
    
    // Para outras queries (INSERT, UPDATE, DELETE), retornar o resultado
    const result = await client.query(text, params)
    return { rows: result.rows || [{ ...result }] }
  } catch (error) {
    console.error('PostgreSQL query error:', error)
    throw error
  } finally {
    if (client) {
      client.release()
    }
  }
}

// Função para inicializar as tabelas do banco
export async function initDatabase() {
  try {
    console.log('Inicializando banco PostgreSQL...')
    
    // Tabela de usuários
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'member',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Tabela de cursos
    await query(`
      CREATE TABLE IF NOT EXISTS courses (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        image_url TEXT,
        category VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Tabela de aulas
    await query(`
      CREATE TABLE IF NOT EXISTS lessons (
        id SERIAL PRIMARY KEY,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        video_url TEXT NOT NULL,
        order_index INTEGER DEFAULT 0,
        attachments TEXT DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Tabela de progresso do usuário
    await query(`
      CREATE TABLE IF NOT EXISTS user_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
        completed BOOLEAN DEFAULT FALSE,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, lesson_id)
      )
    `)

    // Tabela de imagens uploadadas
    await query(`
      CREATE TABLE IF NOT EXISTS uploaded_images (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        content_type VARCHAR(100) NOT NULL,
        file_size INTEGER NOT NULL,
        file_data BYTEA NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Tabela de anexos de aulas
    await query(`
      CREATE TABLE IF NOT EXISTS lesson_attachments (
        id SERIAL PRIMARY KEY,
        lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
        filename VARCHAR(255) NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        content_type VARCHAR(100) NOT NULL,
        file_size INTEGER NOT NULL,
        file_data BYTEA NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    console.log('✅ Banco PostgreSQL inicializado com sucesso!')
  } catch (error) {
    console.error('❌ Erro ao inicializar banco PostgreSQL:', error)
    throw error
  }
}

// Função para criar usuário admin
export async function createAdminUser() {
  try {
    // Verificar se já existe um usuário admin
    const existingAdmin = await query(
      'SELECT * FROM users WHERE email = $1',
      ['admin@jus.com']
    )

    if (existingAdmin.rows.length > 0) {
      console.log('✅ Usuário admin já existe!')
      return
    }

    // Criar hash da senha
    const hashedPassword = await bcrypt.hash('admin123', 10)

    // Inserir usuário admin
    const result = await query(
      'INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4) RETURNING id',
      ['admin@jus.com', hashedPassword, 'Administrador', 'admin']
    )

    console.log('✅ Usuário admin criado com sucesso!')
    console.log('📧 Email: admin@jus.com')
    console.log('🔑 Senha: admin123')
    console.log('🆔 ID:', result.rows[0].id)
  } catch (error) {
    console.error('❌ Erro ao criar usuário admin:', error)
    throw error
  }
}

// Função para criar dados de exemplo
export async function createSampleData() {
  try {
    // Criar cursos de exemplo
    const courses = [
      {
        title: 'Como gerar RPVs',
        description: 'Tutorial completo sobre como gerar RPVs no sistema',
        category: 'jef',
        image_url: '/images/banner/RPV.png'
      },
      {
        title: 'Como sentenciar processos',
        description: 'Guia prático para sentenciar processos na Justiça Federal',
        category: 'jef',
        image_url: '/images/banner/SENTENÇA.png'
      },
      {
        title: 'Tutoriais VARA',
        description: 'Conjunto de tutoriais específicos para VARA',
        category: 'vara',
        image_url: '/images/banner/BANNER1.png'
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

    console.log('✅ Dados de exemplo criados com sucesso!')
  } catch (error) {
    console.error('❌ Erro ao criar dados de exemplo:', error)
    throw error
  }
}

// Função para testar a conexão
export async function testConnection() {
  try {
    const result = await query('SELECT NOW() as current_time')
    console.log('✅ Conexão com PostgreSQL estabelecida!')
    console.log('⏰ Horário atual do servidor:', result.rows[0].current_time)
    return true
  } catch (error) {
    console.error('❌ Erro ao conectar com PostgreSQL:', error)
    return false
  }
}

// Função para fechar o pool de conexões
export async function closePool() {
  try {
    await pool.end()
    console.log('✅ Pool de conexões PostgreSQL fechado')
  } catch (error) {
    console.error('❌ Erro ao fechar pool de conexões:', error)
  }
}

export default pool
