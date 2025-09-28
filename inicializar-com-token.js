// Script para inicializar banco com token correto
const https = require('https');

const BASE_URL = 'https://webservice-5yg7.onrender.com';

console.log('🔧 Inicializando banco com token correto...');
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
        'User-Agent': 'Banco-Init-Token/1.0',
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
async function inicializarComToken() {
  try {
    console.log('🚀 INICIANDO INICIALIZAÇÃO COM TOKEN...');
    console.log('');

    // 1. Verificar status atual
    console.log('1️⃣ Verificando status atual...');
    const status = await makeRequest(`${BASE_URL}/api/init-database`);
    
    console.log(`Status: ${status.status}`);
    console.log(`Banco conectado: ${status.data?.database_connected ? 'SIM' : 'NÃO'}`);
    
    if (status.data?.database_connected) {
      console.log('✅ Banco já está conectado!');
      
      // Testar login
      console.log('\n2️⃣ Testando login...');
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
      
      return;
    }

    // 2. Tentar inicializar com token
    console.log('\n2️⃣ Tentando inicializar com token...');
    const initResult = await makeRequest(`${BASE_URL}/api/init-database`, 'POST', null, {
      'Authorization': 'Bearer init-secret-token-2024'
    });
    
    console.log(`Status: ${initResult.status}`);
    console.log(`Resposta: ${JSON.stringify(initResult.data, null, 2)}`);
    
    if (initResult.status === 200) {
      console.log('✅ Banco inicializado com sucesso!');
      console.log(`📧 Email admin: ${initResult.data.credentials?.email}`);
      console.log(`🔑 Senha admin: ${initResult.data.credentials?.password}`);
    } else if (initResult.status === 401) {
      console.log('❌ Token de autorização inválido');
      console.log('🔧 A aplicação ainda não foi redeployada com as novas variáveis');
      console.log('🛠️ SOLUÇÃO:');
      console.log('1. Na Render, clique em "Save, rebuild, and deploy"');
      console.log('2. Aguarde o deploy ser concluído');
      console.log('3. Execute este script novamente');
      return;
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
      console.log('1. Na Render, clique em "Save, rebuild, and deploy"');
      console.log('2. Aguarde o deploy ser concluído (alguns minutos)');
      console.log('3. Execute este script novamente');
      console.log('');
      console.log('4. Ou acesse diretamente:');
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
inicializarComToken().catch(console.error);
