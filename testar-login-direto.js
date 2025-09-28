// Script para testar login diretamente
const https = require('https');

const BASE_URL = 'https://webservice-5yg7.onrender.com';

console.log('🔍 Testando login diretamente...');
console.log(`🌐 URL: ${BASE_URL}`);
console.log('');

// Função para fazer requisições HTTP
function makeRequest(url, method = 'GET', data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Login-Test-Direto/1.0',
        ...headers
      }
    };

    if (data) {
      const jsonData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(jsonData);
    }

    const req = https.request(options, (res) => {
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
async function testarLoginDireto() {
  try {
    console.log('🚀 TESTANDO LOGIN DIRETAMENTE...');
    console.log('');

    // 1. Testar credenciais Jeflix
    console.log('1️⃣ Testando credenciais Jeflix...');
    const loginJeflix = await makeRequest(`${BASE_URL}/api/auth/login`, 'POST', {
      email: 'jeflix@jus.com',
      password: 'admin1234'
    });
    
    console.log(`Status: ${loginJeflix.status}`);
    console.log(`Resposta: ${JSON.stringify(loginJeflix.data, null, 2)}`);
    
    if (loginJeflix.status === 200) {
      console.log('✅ LOGIN JEFLIX FUNCIONANDO!');
    } else {
      console.log('❌ LOGIN JEFLIX FALHOU');
    }

    // 2. Testar credenciais admin
    console.log('\n2️⃣ Testando credenciais admin...');
    const loginAdmin = await makeRequest(`${BASE_URL}/api/auth/login`, 'POST', {
      email: 'admin@jus.com',
      password: 'admin123'
    });
    
    console.log(`Status: ${loginAdmin.status}`);
    console.log(`Resposta: ${JSON.stringify(loginAdmin.data, null, 2)}`);
    
    if (loginAdmin.status === 200) {
      console.log('✅ LOGIN ADMIN FUNCIONANDO!');
    } else {
      console.log('❌ LOGIN ADMIN FALHOU');
    }

    // 3. Testar credenciais padrão
    console.log('\n3️⃣ Testando credenciais padrão...');
    const loginPadrao = await makeRequest(`${BASE_URL}/api/auth/login`, 'POST', {
      email: 'admin@example.com',
      password: 'admin123'
    });
    
    console.log(`Status: ${loginPadrao.status}`);
    console.log(`Resposta: ${JSON.stringify(loginPadrao.data, null, 2)}`);
    
    if (loginPadrao.status === 200) {
      console.log('✅ LOGIN PADRÃO FUNCIONANDO!');
    } else {
      console.log('❌ LOGIN PADRÃO FALHOU');
    }

    // 4. Verificar usuários existentes
    console.log('\n4️⃣ Verificando usuários existentes...');
    const users = await makeRequest(`${BASE_URL}/api/auth/list-users`);
    
    console.log(`Status: ${users.status}`);
    console.log(`Resposta: ${JSON.stringify(users.data, null, 2)}`);
    
    if (users.status === 200) {
      console.log(`✅ Usuários encontrados: ${users.data.total_users || 0}`);
    } else {
      console.log('❌ Falha ao obter usuários');
    }

    // 5. Verificar status do banco
    console.log('\n5️⃣ Verificando status do banco...');
    const status = await makeRequest(`${BASE_URL}/api/init-database`);
    
    console.log(`Status: ${status.status}`);
    console.log(`Resposta: ${JSON.stringify(status.data, null, 2)}`);
    
    if (status.status === 200) {
      console.log(`✅ Status do banco: ${status.data.status}`);
      console.log(`🔗 Banco conectado: ${status.data.database_connected ? 'SIM' : 'NÃO'}`);
    } else {
      console.log('❌ Falha ao verificar status do banco');
    }

    // 6. Tentar inicializar banco
    console.log('\n6️⃣ Tentando inicializar banco...');
    const initResult = await makeRequest(`${BASE_URL}/api/init-database`, 'POST', null, {
      'Authorization': 'Bearer init-secret-token-2024'
    });
    
    console.log(`Status: ${initResult.status}`);
    console.log(`Resposta: ${JSON.stringify(initResult.data, null, 2)}`);
    
    if (initResult.status === 200) {
      console.log('✅ Banco inicializado com sucesso!');
    } else {
      console.log('❌ Falha ao inicializar banco');
    }

    // 7. Criar usuário Jeflix
    console.log('\n7️⃣ Tentando criar usuário Jeflix...');
    const createJeflix = await makeRequest(`${BASE_URL}/api/auth/create-user`, 'POST', {
      email: 'jeflix@jus.com',
      password: 'admin1234',
      name: 'Jeflix Admin',
      role: 'admin'
    });
    
    console.log(`Status: ${createJeflix.status}`);
    console.log(`Resposta: ${JSON.stringify(createJeflix.data, null, 2)}`);
    
    if (createJeflix.status === 200) {
      console.log('✅ Usuário Jeflix criado!');
    } else {
      console.log('❌ Falha ao criar usuário Jeflix');
    }

    // 8. Testar login Jeflix novamente
    console.log('\n8️⃣ Testando login Jeflix novamente...');
    const loginJeflix2 = await makeRequest(`${BASE_URL}/api/auth/login`, 'POST', {
      email: 'jeflix@jus.com',
      password: 'admin1234'
    });
    
    console.log(`Status: ${loginJeflix2.status}`);
    console.log(`Resposta: ${JSON.stringify(loginJeflix2.data, null, 2)}`);
    
    if (loginJeflix2.status === 200) {
      console.log('✅ LOGIN JEFLIX FUNCIONANDO APÓS CRIAÇÃO!');
      console.log(`🎫 Token: ${loginJeflix2.data.token ? 'GERADO' : 'NÃO GERADO'}`);
    } else {
      console.log('❌ LOGIN JEFLIX AINDA FALHANDO');
    }

    console.log('\n📋 RESUMO DOS TESTES:');
    console.log('=====================');
    console.log('🔍 Teste de login Jeflix: ' + (loginJeflix2.status === 200 ? '✅ SUCESSO' : '❌ FALHA'));
    console.log('🔍 Teste de login admin: ' + (loginAdmin.status === 200 ? '✅ SUCESSO' : '❌ FALHA'));
    console.log('🔍 Teste de login padrão: ' + (loginPadrao.status === 200 ? '✅ SUCESSO' : '❌ FALHA'));
    console.log('🔍 Banco conectado: ' + (status.data?.database_connected ? '✅ SIM' : '❌ NÃO'));
    console.log('🔍 Usuários existentes: ' + (users.data?.total_users || 0));

  } catch (error) {
    console.error('❌ Erro durante os testes:', error.message);
  }
}

// Executar testes
testarLoginDireto().catch(console.error);
