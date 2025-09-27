const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

async function testAuth() {
  try {
    console.log('🔍 Testando autenticação...');
    
    const db = new Database('database.sqlite');
    
    // Buscar usuário
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get('admin@jus.com');
    console.log('Usuário encontrado:', !!user);
    
    if (user) {
      console.log('Email:', user.email);
      console.log('Nome:', user.name);
      console.log('Role:', user.role);
      
      // Testar senha
      const isValidPassword = await bcrypt.compare('admin123', user.password);
      console.log('Senha válida:', isValidPassword);
    }
    
    db.close();
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testAuth();

