import pool from '../lib/database'
import bcrypt from 'bcryptjs'

async function testConnection() {
  try {
    console.log('Testando conexão com o banco de dados...')
    
    // Testar conexão básica
    const result = await pool.query('SELECT NOW()')
    console.log('✅ Conexão bem-sucedida!', result.rows[0])
    
    // Verificar se a tabela users existe
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `)
    
    console.log('Tabela users existe:', tableCheck.rows[0].exists)
    
    if (tableCheck.rows[0].exists) {
      // Verificar se já existe usuário admin
      const adminCheck = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        ['admin@jus.com']
      )
      
      if (adminCheck.rows.length > 0) {
        console.log('✅ Usuário admin já existe!')
        console.log('Email:', adminCheck.rows[0].email)
        console.log('Nome:', adminCheck.rows[0].name)
        console.log('Role:', adminCheck.rows[0].role)
      } else {
        console.log('❌ Usuário admin não encontrado!')
        console.log('Criando usuário admin...')
        
        // Criar hash da senha
        const hashedPassword = await bcrypt.hash('admin123', 10)
        
        // Inserir usuário admin
        await pool.query(
          'INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4)',
          ['admin@jus.com', hashedPassword, 'Administrador', 'admin']
        )
        
        console.log('✅ Usuário admin criado com sucesso!')
        console.log('Email: admin@jus.com')
        console.log('Senha: admin123')
      }
    } else {
      console.log('❌ Tabela users não existe. Execute o script init-db.ts primeiro.')
    }
    
  } catch (error) {
    console.error('❌ Erro na conexão:', error.message)
    console.error('Detalhes:', error)
  } finally {
    await pool.end()
    process.exit(0)
  }
}

testConnection()

