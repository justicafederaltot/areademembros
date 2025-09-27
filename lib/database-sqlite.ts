import Database from 'better-sqlite3'
import bcrypt from 'bcryptjs'

// Criar conexão com SQLite
const db = new Database('database.sqlite')

// Função helper para executar queries
export async function query(text: string, params: any[] = []) {
  try {
    const stmt = db.prepare(text)
    const result = stmt.run(...params)
    
    // Para SELECT queries, retornar os dados
    if (text.trim().toLowerCase().startsWith('select')) {
      const selectStmt = db.prepare(text)
      const rows = selectStmt.all(...params)
      return { rows }
    }
    
    // Para outras queries (INSERT, UPDATE, DELETE), retornar o resultado
    return { rows: [result] }
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}

// Função para inicializar as tabelas do banco
export async function initDatabase() {
  try {
    console.log('Inicializando banco SQLite...')
    
    // Tabela de usuários
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT DEFAULT 'member',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Tabela de cursos
    db.exec(`
      CREATE TABLE IF NOT EXISTS courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        image_url TEXT,
        category TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Tabela de aulas
    db.exec(`
      CREATE TABLE IF NOT EXISTS lessons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        video_url TEXT NOT NULL,
        order_index INTEGER DEFAULT 0,
        attachments TEXT DEFAULT '[]',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Tabela de progresso do usuário
    db.exec(`
      CREATE TABLE IF NOT EXISTS user_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
        completed BOOLEAN DEFAULT FALSE,
        completed_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, lesson_id)
      )
    `)

    // Tabela de imagens uploadadas
    db.exec(`
      CREATE TABLE IF NOT EXISTS uploaded_images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT NOT NULL,
        original_name TEXT NOT NULL,
        content_type TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        file_data BLOB NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Tabela de anexos de aulas
    db.exec(`
      CREATE TABLE IF NOT EXISTS lesson_attachments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
        filename TEXT NOT NULL,
        original_name TEXT NOT NULL,
        content_type TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        file_data BLOB NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    console.log('✅ Banco SQLite inicializado com sucesso!')
  } catch (error) {
    console.error('❌ Erro ao inicializar banco SQLite:', error)
    throw error
  }
}

// Função para criar usuário admin
export async function createAdminUser() {
  try {
    // Verificar se já existe um usuário admin
    const existingAdmin = await query(
      'SELECT * FROM users WHERE email = ?',
      ['admin@jus.com']
    )

    if (existingAdmin.rows.length > 0) {
      console.log('✅ Usuário admin já existe!')
      return
    }

    // Criar hash da senha
    const hashedPassword = await bcrypt.hash('admin123', 10)

    // Inserir usuário admin
    await query(
      'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
      ['admin@jus.com', hashedPassword, 'Administrador', 'admin']
    )

    console.log('✅ Usuário admin criado com sucesso!')
    console.log('📧 Email: admin@jus.com')
    console.log('🔑 Senha: admin123')
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
        image_url: '/images/banner/BANNER1.png'
      },
      {
        title: 'Como sentenciar processos',
        description: 'Guia prático para sentenciar processos na Justiça Federal',
        category: 'jef',
        image_url: '/images/banner/BANNER1.png'
      }
    ]

    for (const course of courses) {
      const result = await query(
        'INSERT INTO courses (title, description, category, image_url) VALUES (?, ?, ?, ?)',
        [course.title, course.description, course.category, course.image_url]
      )

      const courseId = result.rows[0].lastInsertRowid

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
          'INSERT INTO lessons (course_id, title, description, video_url, order_index) VALUES (?, ?, ?, ?, ?)',
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

export default db

