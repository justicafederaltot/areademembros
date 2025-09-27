const fetch = require('node-fetch');

async function testLogin() {
  try {
    console.log('🧪 Testando login...');
    
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@jus.com',
        password: 'admin123'
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Login bem-sucedido!');
      console.log('Token:', data.token ? 'Presente' : 'Ausente');
      console.log('Usuário:', data.user ? data.user.email : 'N/A');
    } else {
      console.log('❌ Login falhou:', data.error);
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

testLogin();

