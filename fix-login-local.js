// Script para resolver o problema de login na versão local
const http = require('http');

const BASE_URL = 'http://localhost:3000';

console.log('🔧 Resolvendo problema de login na versão local...');
console.log(`🌐 URL: ${BASE_URL}`);
console.log('');

// Função para fazer requisições HTTP
function makeRequest(url, method = 'GET', data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 3000,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Login-Fix-Script/1.0',
        ...headers
      }
    };

    if (data) {
      const jsonData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(jsonData);
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve({ status: res.statusCode, data: result });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Função principal
async function fixLoginLocal() {
  try {
    // 1. Verificar se aplicação está rodando
    console.log('1️⃣ Verificando se aplicação local está rodando...');
    
    try {
      const status = await makeRequest(`${BASE_URL}/api/init-database`);
      console.log('✅ Aplicação local está funcionando');
    } catch (error) {
      console.log('❌ Aplicação local não está rodando');
      console.log('🔧 Execute: npm run dev');
      return;
    }

    // 2. Listar usuários existentes
    console.log('\n2️⃣ Verificando usuários existentes...');
    const users = await makeRequest(`${BASE_URL}/api/auth/list-users`);
    
    if (users.status === 200) {
      console.log(`✅ Usuários encontrados: ${users.data.total_users || 0}`);
      
      if (users.data.users && users.data.users.length > 0) {
        console.log('👥 Lista de usuários:');
        users.data.users.forEach((user, index) => {
          console.log(`   ${index + 1}. ${user.email} (${user.name}) - ${user.role}`);
        });
      } else {
        console.log('❌ Nenhum usuário encontrado!');
        console.log('🔧 Criando usuário admin...');
        
        // Criar usuário admin
        const createUser = await makeRequest(`${BASE_URL}/api/auth/create-user`, 'POST', {
          email: 'admin@jus.com',
          password: 'admin123',
          name: 'Administrador',
          role: 'admin'
        });
        
        if (createUser.status === 200) {
          console.log('✅ Usuário admin criado com sucesso!');
          console.log(`📧 Email: ${createUser.data.user.email}`);
          console.log(`👤 Nome: ${createUser.data.user.name}`);
          console.log(`🔑 Role: ${createUser.data.user.role}`);
        } else {
          console.log(`❌ Falha ao criar usuário: ${createUser.status}`);
          console.log(`Resposta: ${JSON.stringify(createUser.data)}`);
        }
      }
    } else {
      console.log(`❌ Falha ao obter usuários: ${users.status}`);
    }

    // 3. Testar login
    console.log('\n3️⃣ Testando login...');
    const loginTest = await makeRequest(`${BASE_URL}/api/auth/login`, 'POST', {
      email: 'admin@jus.com',
      password: 'admin123'
    });
    
    if (loginTest.status === 200) {
      console.log('✅ Login funcionando!');
      console.log(`🎫 Token gerado: ${loginTest.data.token ? 'SIM' : 'NÃO'}`);
      console.log(`👤 Usuário: ${loginTest.data.user?.email}`);
    } else {
      console.log(`❌ Falha no login: ${loginTest.status}`);
      console.log(`Resposta: ${JSON.stringify(loginTest.data)}`);
      
      // Tentar resetar senha
      console.log('\n4️⃣ Tentando resetar senha...');
      const resetPassword = await makeRequest(`${BASE_URL}/api/auth/reset-password`, 'POST', {
        email: 'admin@jus.com',
        newPassword: 'admin123'
      });
      
      if (resetPassword.status === 200) {
        console.log('✅ Senha resetada com sucesso!');
        console.log(`📧 Email: ${resetPassword.data.credentials.email}`);
        console.log(`🔑 Nova senha: ${resetPassword.data.credentials.password}`);
      } else {
        console.log(`❌ Falha ao resetar senha: ${resetPassword.status}`);
      }
    }

    // 5. Criar usuário alternativo
    console.log('\n5️⃣ Criando usuário alternativo...');
    const createAltUser = await makeRequest(`${BASE_URL}/api/auth/create-user`, 'POST', {
      email: 'admin@destrava.com',
      password: 'destrava123',
      name: 'Admin Destrava',
      role: 'admin'
    });
    
    if (createAltUser.status === 200) {
      console.log('✅ Usuário alternativo criado!');
      console.log(`📧 Email: ${createAltUser.data.user.email}`);
      console.log(`🔑 Senha: destrava123`);
    } else if (createAltUser.status === 409) {
      console.log('ℹ️ Usuário alternativo já existe');
    } else {
      console.log(`❌ Falha ao criar usuário alternativo: ${createAltUser.status}`);
    }

    console.log('\n📋 RESUMO:');
    console.log('===========');
    console.log('🔑 Credenciais para login:');
    console.log('   Email: admin@jus.com');
    console.log('   Senha: admin123');
    console.log('');
    console.log('🔑 Credenciais alternativas:');
    console.log('   Email: admin@destrava.com');
    console.log('   Senha: destrava123');
    console.log('');
    console.log('🌐 URL de login:');
    console.log(`   ${BASE_URL}/`);

  } catch (error) {
    console.error('❌ Erro durante a correção:', error.message);
  }
}

// Executar correção
fixLoginLocal().catch(console.error);
