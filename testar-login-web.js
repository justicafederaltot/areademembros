// Script para testar login via interface web
const https = require('https');

const BASE_URL = 'https://webservice-5yg7.onrender.com';

console.log('🔍 Testando login via interface web...');
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
        'User-Agent': 'Login-Web-Test/1.0',
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
async function testarLoginWeb() {
  try {
    console.log('🚀 TESTANDO LOGIN VIA INTERFACE WEB...');
    console.log('');

    // 1. Testar login Jeflix
    console.log('1️⃣ Testando login Jeflix via API...');
    const loginJeflix = await makeRequest(`${BASE_URL}/api/auth/login`, 'POST', {
      email: 'jeflix@jus.com',
      password: 'admin1234'
    });
    
    console.log(`Status: ${loginJeflix.status}`);
    console.log(`Resposta: ${JSON.stringify(loginJeflix.data, null, 2)}`);
    
    if (loginJeflix.status === 200) {
      console.log('✅ Login Jeflix via API funcionando!');
      console.log(`🎫 Token: ${loginJeflix.data.token ? 'GERADO' : 'NÃO GERADO'}`);
      console.log(`👤 Usuário: ${loginJeflix.data.user?.email}`);
      
      // 2. Testar verificação de auth com token
      console.log('\n2️⃣ Testando verificação de auth com token...');
      const authCheck = await makeRequest(`${BASE_URL}/api/auth/me`, 'GET', null, {
        'Authorization': `Bearer ${loginJeflix.data.token}`
      });
      
      console.log(`Status: ${authCheck.status}`);
      console.log(`Resposta: ${JSON.stringify(authCheck.data, null, 2)}`);
      
      if (authCheck.status === 200) {
        console.log('✅ Verificação de auth funcionando!');
        console.log(`👤 Usuário verificado: ${authCheck.data.email}`);
      } else {
        console.log('❌ Falha na verificação de auth');
      }
    } else {
      console.log('❌ Login Jeflix via API falhou');
    }

    // 3. Testar login Admin
    console.log('\n3️⃣ Testando login Admin via API...');
    const loginAdmin = await makeRequest(`${BASE_URL}/api/auth/login`, 'POST', {
      email: 'admin@jus.com',
      password: 'admin123'
    });
    
    console.log(`Status: ${loginAdmin.status}`);
    console.log(`Resposta: ${JSON.stringify(loginAdmin.data, null, 2)}`);
    
    if (loginAdmin.status === 200) {
      console.log('✅ Login Admin via API funcionando!');
      console.log(`🎫 Token: ${loginAdmin.data.token ? 'GERADO' : 'NÃO GERADO'}`);
      console.log(`👤 Usuário: ${loginAdmin.data.user?.email}`);
    } else {
      console.log('❌ Login Admin via API falhou');
    }

    // 4. Verificar usuários existentes
    console.log('\n4️⃣ Verificando usuários existentes...');
    const users = await makeRequest(`${BASE_URL}/api/auth/list-users`);
    
    console.log(`Status: ${users.status}`);
    console.log(`Resposta: ${JSON.stringify(users.data, null, 2)}`);
    
    if (users.status === 200) {
      console.log(`✅ Usuários encontrados: ${users.data.total_users || 0}`);
      if (users.data.users && users.data.users.length > 0) {
        console.log('👥 Lista de usuários:');
        users.data.users.forEach((user, index) => {
          console.log(`   ${index + 1}. ${user.email} (${user.name}) - ${user.role}`);
        });
      }
    } else {
      console.log('❌ Falha ao obter usuários');
    }

    // 5. Testar diferentes combinações de credenciais
    console.log('\n5️⃣ Testando diferentes combinações de credenciais...');
    
    const credenciais = [
      { email: 'jeflix@jus.com', password: 'admin1234', nome: 'Jeflix' },
      { email: 'jeflix@jus.com', password: 'admin123', nome: 'Jeflix (senha errada)' },
      { email: 'admin@jus.com', password: 'admin123', nome: 'Admin' },
      { email: 'admin@jus.com', password: 'admin1234', nome: 'Admin (senha errada)' }
    ];

    for (const cred of credenciais) {
      console.log(`\n   Testando ${cred.nome}...`);
      const loginResult = await makeRequest(`${BASE_URL}/api/auth/login`, 'POST', {
        email: cred.email,
        password: cred.password
      });
      
      console.log(`   Status: ${loginResult.status}`);
      if (loginResult.status === 200) {
        console.log(`   ✅ LOGIN ${cred.nome.toUpperCase()} FUNCIONANDO!`);
        console.log(`   🎫 Token: ${loginResult.data.token ? 'GERADO' : 'NÃO GERADO'}`);
        console.log(`   👤 Usuário: ${loginResult.data.user?.email}`);
      } else {
        console.log(`   ❌ Login ${cred.nome} falhou: ${loginResult.status}`);
        if (loginResult.data?.error) {
          console.log(`   📝 Erro: ${loginResult.data.error}`);
        }
      }
    }

    // 6. Verificar se há problema com hash de senha
    console.log('\n6️⃣ Verificando hash de senhas...');
    const userDetails = await makeRequest(`${BASE_URL}/api/debug/users`);
    
    console.log(`Status: ${userDetails.status}`);
    if (userDetails.status === 200) {
      console.log('✅ Debug de usuários funcionando');
      console.log(`Resposta: ${JSON.stringify(userDetails.data, null, 2)}`);
    } else {
      console.log('❌ Debug de usuários não disponível');
    }

    console.log('\n📋 RESUMO DOS TESTES:');
    console.log('=====================');
    console.log('🔍 Login Jeflix via API: ' + (loginJeflix.status === 200 ? '✅ SUCESSO' : '❌ FALHA'));
    console.log('🔍 Login Admin via API: ' + (loginAdmin.status === 200 ? '✅ SUCESSO' : '❌ FALHA'));
    console.log('🔍 Verificação de auth: ' + (authCheck?.status === 200 ? '✅ SUCESSO' : '❌ FALHA'));
    console.log('🔍 Usuários existentes: ' + (users.data?.total_users || 0));

    if (loginJeflix.status === 200 && authCheck?.status === 200) {
      console.log('\n✅ LOGIN VIA API ESTÁ FUNCIONANDO!');
      console.log('🔧 PROBLEMA: Pode ser na interface web ou cache do browser');
      console.log('🛠️ SOLUÇÕES:');
      console.log('1. Limpe o cache do browser (Ctrl+F5)');
      console.log('2. Teste em modo incógnito');
      console.log('3. Verifique se não há erro de JavaScript no console');
    } else {
      console.log('\n❌ LOGIN VIA API AINDA FALHANDO');
      console.log('🔧 PROBLEMA: Banco de dados ou configuração');
    }

  } catch (error) {
    console.error('❌ Erro durante os testes:', error.message);
  }
}

// Executar testes
testarLoginWeb().catch(console.error);
