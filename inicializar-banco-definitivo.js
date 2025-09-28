// Script para inicializar o banco de dados definitivamente
const https = require('https');

const BASE_URL = 'https://webservice-5yg7.onrender.com';

console.log('🔧 Inicializando banco de dados definitivamente...');
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
        'User-Agent': 'Banco-Init-Definitivo/1.0',
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
async function inicializarBancoDefinitivo() {
  try {
    console.log('🚀 INICIANDO INICIALIZAÇÃO DEFINITIVA DO BANCO...');
    console.log('');

    // 1. Verificar status da aplicação
    console.log('1️⃣ Verificando status da aplicação...');
    const status = await makeRequest(`${BASE_URL}/api/init-database`);
    
    if (status.status === 200) {
      console.log('✅ Aplicação está funcionando');
      console.log(`📊 Status: ${status.data.status}`);
      console.log(`🔗 Banco conectado: ${status.data.database_connected ? '✅ SIM' : '❌ NÃO'}`);
      
      if (!status.data.database_connected) {
        console.log('❌ Banco de dados não está conectado!');
        console.log('🔧 PROBLEMA: Banco de dados não foi inicializado');
        console.log('');
        console.log('🛠️ SOLUÇÕES NECESSÁRIAS:');
        console.log('1. Acesse o painel da Render: https://dashboard.render.com');
        console.log('2. Vá para sua aplicação (webservice-5yg7)');
        console.log('3. Clique em "Environment"');
        console.log('4. Adicione a variável: INIT_TOKEN=init-secret-token-2024');
        console.log('5. Salve as alterações');
        console.log('6. Faça redeploy da aplicação');
        console.log('7. Aguarde o deploy ser concluído');
        console.log('8. Execute este script novamente');
        console.log('');
        console.log('🔧 ALTERNATIVA: Inicializar banco manualmente');
        console.log('Acesse: https://webservice-5yg7.onrender.com/api/init-database');
        console.log('E execute o POST com o token correto');
        return;
      }
    } else {
      console.log(`❌ Aplicação não está respondendo: ${status.status}`);
      return;
    }

    // 2. Tentar inicializar banco
    console.log('\n2️⃣ Tentando inicializar banco de dados...');
    const initResult = await makeRequest(`${BASE_URL}/api/init-database`, 'POST', null, {
      'Authorization': 'Bearer init-secret-token-2024'
    });
    
    if (initResult.status === 200) {
      console.log('✅ Banco de dados inicializado com sucesso!');
      console.log(`📧 Email admin: ${initResult.data.credentials?.email}`);
      console.log(`🔑 Senha admin: ${initResult.data.credentials?.password}`);
    } else if (initResult.status === 401) {
      console.log('❌ Token de autorização inválido');
      console.log('🔧 Configure a variável INIT_TOKEN na Render');
    } else {
      console.log(`❌ Falha ao inicializar banco: ${initResult.status}`);
      console.log(`Resposta: ${JSON.stringify(initResult.data)}`);
    }

    // 3. Verificar usuários após inicialização
    console.log('\n3️⃣ Verificando usuários após inicialização...');
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
        console.log('🔧 Criando usuário Jeflix...');
        
        // Criar usuário Jeflix
        const createJeflix = await makeRequest(`${BASE_URL}/api/auth/create-user`, 'POST', {
          email: 'jeflix@jus.com',
          password: 'admin1234',
          name: 'Jeflix Admin',
          role: 'admin'
        });
        
        if (createJeflix.status === 200) {
          console.log('✅ Usuário Jeflix criado com sucesso!');
          console.log(`📧 Email: ${createJeflix.data.user.email}`);
          console.log(`🔑 Senha: admin1234`);
        } else {
          console.log(`❌ Falha ao criar usuário Jeflix: ${createJeflix.status}`);
        }
      }
    } else {
      console.log(`❌ Falha ao obter usuários: ${users.status}`);
    }

    // 4. Testar login
    console.log('\n4️⃣ Testando login...');
    const loginTest = await makeRequest(`${BASE_URL}/api/auth/login`, 'POST', {
      email: 'jeflix@jus.com',
      password: 'admin1234'
    });
    
    if (loginTest.status === 200) {
      console.log('✅ LOGIN FUNCIONANDO!');
      console.log(`🎫 Token gerado: ${loginTest.data.token ? 'SIM' : 'NÃO'}`);
      console.log(`👤 Usuário: ${loginTest.data.user?.email}`);
    } else {
      console.log(`❌ Falha no login: ${loginTest.status}`);
      console.log(`Resposta: ${JSON.stringify(loginTest.data)}`);
    }

    console.log('\n📋 RESUMO:');
    console.log('===========');
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
inicializarBancoDefinitivo().catch(console.error);
