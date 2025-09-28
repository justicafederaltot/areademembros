// Script para inicializar banco manualmente sem token
const https = require('https');

const BASE_URL = 'https://webservice-5yg7.onrender.com';

console.log('🔧 Inicializando banco manualmente...');
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
        'User-Agent': 'Banco-Init-Manual/1.0',
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
async function inicializarBancoManual() {
  try {
    console.log('🚀 INICIANDO INICIALIZAÇÃO MANUAL DO BANCO...');
    console.log('');

    // 1. Verificar status atual
    console.log('1️⃣ Verificando status atual...');
    const status = await makeRequest(`${BASE_URL}/api/init-database`);
    
    console.log(`Status: ${status.status}`);
    console.log(`Banco conectado: ${status.data?.database_connected ? 'SIM' : 'NÃO'}`);
    
    if (status.data?.database_connected) {
      console.log('✅ Banco já está conectado!');
      return;
    }

    // 2. Tentar inicializar sem token (método alternativo)
    console.log('\n2️⃣ Tentando inicializar sem token...');
    const initResult = await makeRequest(`${BASE_URL}/api/init-database`, 'POST');
    
    console.log(`Status: ${initResult.status}`);
    console.log(`Resposta: ${JSON.stringify(initResult.data, null, 2)}`);
    
    if (initResult.status === 200) {
      console.log('✅ Banco inicializado com sucesso!');
    } else if (initResult.status === 401) {
      console.log('❌ Token de autorização necessário');
      console.log('🔧 Configure INIT_TOKEN na Render ou use o método alternativo');
    } else {
      console.log(`❌ Falha ao inicializar banco: ${initResult.status}`);
    }

    // 3. Verificar se banco foi inicializado
    console.log('\n3️⃣ Verificando se banco foi inicializado...');
    const status2 = await makeRequest(`${BASE_URL}/api/init-database`);
    
    console.log(`Status: ${status2.status}`);
    console.log(`Banco conectado: ${status2.data?.database_connected ? 'SIM' : 'NÃO'}`);
    
    if (status2.data?.database_connected) {
      console.log('✅ Banco foi inicializado com sucesso!');
      
      // 4. Criar usuário Jeflix
      console.log('\n4️⃣ Criando usuário Jeflix...');
      const createJeflix = await makeRequest(`${BASE_URL}/api/auth/create-user`, 'POST', {
        email: 'jeflix@jus.com',
        password: 'admin1234',
        name: 'Jeflix Admin',
        role: 'admin'
      });
      
      console.log(`Status: ${createJeflix.status}`);
      console.log(`Resposta: ${JSON.stringify(createJeflix.data, null, 2)}`);
      
      if (createJeflix.status === 200) {
        console.log('✅ Usuário Jeflix criado com sucesso!');
        console.log(`📧 Email: ${createJeflix.data.user.email}`);
        console.log(`🔑 Senha: admin1234`);
      } else {
        console.log('❌ Falha ao criar usuário Jeflix');
      }

      // 5. Testar login
      console.log('\n5️⃣ Testando login...');
      const loginTest = await makeRequest(`${BASE_URL}/api/auth/login`, 'POST', {
        email: 'jeflix@jus.com',
        password: 'admin1234'
      });
      
      console.log(`Status: ${loginTest.status}`);
      console.log(`Resposta: ${JSON.stringify(loginTest.data, null, 2)}`);
      
      if (loginTest.status === 200) {
        console.log('✅ LOGIN FUNCIONANDO!');
        console.log(`🎫 Token gerado: ${loginTest.data.token ? 'SIM' : 'NÃO'}`);
        console.log(`👤 Usuário: ${loginTest.data.user?.email}`);
      } else {
        console.log('❌ Falha no login');
      }

    } else {
      console.log('❌ Banco ainda não foi inicializado');
      console.log('');
      console.log('🛠️ SOLUÇÕES NECESSÁRIAS:');
      console.log('1. Configure INIT_TOKEN na Render:');
      console.log('   - Acesse: https://dashboard.render.com');
      console.log('   - Vá para sua aplicação (webservice-5yg7)');
      console.log('   - Clique em "Environment"');
      console.log('   - Adicione: INIT_TOKEN=init-secret-token-2024');
      console.log('   - Salve e faça redeploy');
      console.log('');
      console.log('2. Ou acesse diretamente:');
      console.log('   https://webservice-5yg7.onrender.com/api/init-database');
      console.log('   E execute o POST com o token correto');
    }

    console.log('\n📋 RESUMO:');
    console.log('==========');
    console.log('🔑 Credenciais para login:');
    console.log('   Email: jeflix@jus.com');
    console.log('   Senha: admin1234');
    console.log('');
    console.log('🌐 URL de login:');
    console.log(`   ${BASE_URL}/`);

  } catch (error) {
    console.error('❌ Erro durante a inicialização:', error.message);
  }
}

// Executar inicialização
inicializarBancoManual().catch(console.error);
