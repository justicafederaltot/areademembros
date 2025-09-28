// Script para resolver o problema de login na versão deployada
// Execute este script para testar e corrigir a conexão

const https = require('https');

const BASE_URL = 'https://areademembros.onrender.com';

console.log('🔧 Resolvendo problema de login...');
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
        'User-Agent': 'Login-Fix-Script/1.0',
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
async function resolverLogin() {
  try {
    // 1. Teste básico de conectividade
    console.log('1️⃣ Testando conectividade básica...');
    try {
      const basicTest = await makeRequest(`${BASE_URL}/`);
      if (basicTest.status === 200) {
        console.log('✅ Aplicação está respondendo');
      } else {
        console.log(`❌ Aplicação retornou status: ${basicTest.status}`);
        console.log('🔧 Aguarde alguns minutos para o deploy ser concluído');
        return;
      }
    } catch (error) {
      console.log(`❌ Erro de conectividade: ${error.message}`);
      console.log('🔧 SOLUÇÕES:');
      console.log('1. Verifique se a aplicação está rodando na Render');
      console.log('2. Aguarde alguns minutos para o deploy ser concluído');
      console.log('3. Verifique os logs da Render no painel de administração');
      console.log('4. Verifique se o domínio está correto');
      return;
    }

    // 2. Teste de status do banco
    console.log('\n2️⃣ Verificando status do banco de dados...');
    try {
      const dbStatus = await makeRequest(`${BASE_URL}/api/init-database`);
      if (dbStatus.status === 200) {
        console.log('✅ Rota de status funcionando');
        console.log(`📊 Status: ${dbStatus.data.status}`);
        console.log(`🔗 Banco conectado: ${dbStatus.data.database_connected ? '✅ SIM' : '❌ NÃO'}`);
        
        if (!dbStatus.data.database_connected) {
          console.log('❌ Banco de dados não está conectado!');
          console.log('🔧 Tentando inicializar banco...');
          
          // Tentar inicializar banco
          const initResult = await makeRequest(`${BASE_URL}/api/init-database`, 'POST', null, {
            'Authorization': 'Bearer init-secret-token-2024'
          });
          
          if (initResult.status === 200) {
            console.log('✅ Banco de dados inicializado com sucesso!');
            console.log(`📧 Email admin: ${initResult.data.credentials?.email}`);
            console.log(`🔑 Senha admin: ${initResult.data.credentials?.password}`);
          } else if (initResult.status === 401) {
            console.log('❌ Token de autorização inválido');
            console.log('🔧 Verifique se a variável INIT_TOKEN está configurada na Render');
          } else {
            console.log(`❌ Falha ao inicializar banco: ${initResult.status}`);
            console.log(`Resposta: ${JSON.stringify(initResult.data)}`);
          }
        }
      } else {
        console.log(`❌ Rota de status falhou: ${dbStatus.status}`);
        console.log('🔧 Verifique se a aplicação está rodando corretamente');
      }
    } catch (error) {
      console.log(`❌ Erro ao verificar status do banco: ${error.message}`);
    }

    // 3. Verificar usuários
    console.log('\n3️⃣ Verificando usuários...');
    try {
      const users = await makeRequest(`${BASE_URL}/api/debug/users`);
      if (users.status === 200) {
        console.log(`✅ Usuários encontrados: ${users.data.total_users || 0}`);
        
        if (users.data.users && users.data.users.length > 0) {
          console.log('👥 Lista de usuários:');
          users.data.users.forEach((user, index) => {
            console.log(`   ${index + 1}. ${user.email} (${user.name}) - ${user.role}`);
          });
        } else {
          console.log('❌ Nenhum usuário encontrado!');
          console.log('🔧 Execute o script de inicialização do banco');
        }
      } else {
        console.log(`❌ Falha ao obter usuários: ${users.status}`);
      }
    } catch (error) {
      console.log(`❌ Erro ao verificar usuários: ${error.message}`);
    }

    // 4. Teste de login
    console.log('\n4️⃣ Testando login...');
    try {
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
        console.log('🔧 SOLUÇÕES:');
        console.log('1. Verifique se o banco de dados foi inicializado');
        console.log('2. Verifique se as credenciais estão corretas');
        console.log('3. Execute o script de inicialização do banco');
      }
    } catch (error) {
      console.log(`❌ Erro ao testar login: ${error.message}`);
    }

    // 5. Resumo final
    console.log('\n📋 RESUMO:');
    console.log('===========');
    console.log('🔑 Credenciais para login:');
    console.log('   Email: admin@jus.com');
    console.log('   Senha: admin123');
    console.log('');
    console.log('🌐 URL de login:');
    console.log(`   ${BASE_URL}/`);
    console.log('');
    console.log('🔧 Se ainda não funcionar:');
    console.log('1. Verifique se a aplicação está rodando na Render');
    console.log('2. Verifique as variáveis de ambiente na Render');
    console.log('3. Execute o script de inicialização do banco');
    console.log('4. Aguarde alguns minutos para estabilização');
    console.log('5. Verifique os logs da Render no painel de administração');

  } catch (error) {
    console.error('❌ Erro durante a resolução:', error.message);
    console.log('\n🔧 Possíveis soluções:');
    console.log('1. Verifique se a aplicação está rodando');
    console.log('2. Verifique a conectividade de rede');
    console.log('3. Verifique as variáveis de ambiente na Render');
    console.log('4. Aguarde alguns minutos para estabilização');
  }
}

// Executar resolução
resolverLogin().catch(console.error);
