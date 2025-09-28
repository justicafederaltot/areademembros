// Diagnóstico completo do problema de login
const https = require('https');

const BASE_URL = 'https://webservice-5yg7.onrender.com';

console.log('🔍 DIAGNÓSTICO COMPLETO DO PROBLEMA DE LOGIN');
console.log(`🌐 URL: ${BASE_URL}`);
console.log('='.repeat(60));
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
        'User-Agent': 'Diagnostico-Completo/1.0',
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
async function diagnosticoCompleto() {
  try {
    console.log('🚀 INICIANDO DIAGNÓSTICO COMPLETO...');
    console.log('');

    // 1. Verificar se aplicação está online
    console.log('1️⃣ VERIFICANDO SE APLICAÇÃO ESTÁ ONLINE...');
    try {
      const appStatus = await makeRequest(`${BASE_URL}/`);
      console.log(`Status da aplicação: ${appStatus.status}`);
      if (appStatus.status === 200) {
        console.log('✅ Aplicação está online');
      } else {
        console.log('❌ Aplicação não está respondendo corretamente');
      }
    } catch (error) {
      console.log('❌ Aplicação não está acessível');
      console.log('🔧 PROBLEMA: Aplicação não está rodando na Render');
      return;
    }

    // 2. Verificar status do banco de dados
    console.log('\n2️⃣ VERIFICANDO STATUS DO BANCO DE DADOS...');
    const dbStatus = await makeRequest(`${BASE_URL}/api/init-database`);
    console.log(`Status: ${dbStatus.status}`);
    console.log(`Resposta: ${JSON.stringify(dbStatus.data, null, 2)}`);
    
    if (dbStatus.status === 200) {
      console.log('✅ API de banco está funcionando');
      console.log(`🔗 Banco conectado: ${dbStatus.data.database_connected ? 'SIM' : 'NÃO'}`);
      
      if (!dbStatus.data.database_connected) {
        console.log('❌ PROBLEMA: Banco de dados não está conectado');
        console.log('🔧 CAUSA: PostgreSQL não está acessível ou não foi inicializado');
      }
    } else {
      console.log('❌ API de banco não está funcionando');
    }

    // 3. Tentar inicializar banco de dados
    console.log('\n3️⃣ TENTANDO INICIALIZAR BANCO DE DADOS...');
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
      console.log('🔧 PROBLEMA: INIT_TOKEN não está configurado corretamente');
    } else if (initResult.status === 500) {
      console.log('❌ Erro interno do servidor');
      console.log('🔧 PROBLEMA: Não foi possível conectar ao PostgreSQL');
    } else {
      console.log(`❌ Falha inesperada: ${initResult.status}`);
    }

    // 4. Verificar usuários existentes
    console.log('\n4️⃣ VERIFICANDO USUÁRIOS EXISTENTES...');
    const usersResult = await makeRequest(`${BASE_URL}/api/auth/list-users`);
    console.log(`Status: ${usersResult.status}`);
    console.log(`Resposta: ${JSON.stringify(usersResult.data, null, 2)}`);
    
    if (usersResult.status === 200) {
      console.log(`✅ Usuários encontrados: ${usersResult.data.total_users || 0}`);
      if (usersResult.data.users && usersResult.data.users.length > 0) {
        console.log('👥 Lista de usuários:');
        usersResult.data.users.forEach((user, index) => {
          console.log(`   ${index + 1}. ${user.email} (${user.name}) - ${user.role}`);
        });
      } else {
        console.log('❌ Nenhum usuário encontrado');
        console.log('🔧 PROBLEMA: Banco não foi inicializado ou usuários não foram criados');
      }
    } else {
      console.log('❌ Não foi possível obter usuários');
    }

    // 5. Testar login com diferentes credenciais
    console.log('\n5️⃣ TESTANDO LOGIN COM DIFERENTES CREDENCIAIS...');
    
    const credenciais = [
      { email: 'jeflix@jus.com', password: 'admin1234', nome: 'Jeflix' },
      { email: 'admin@jus.com', password: 'admin123', nome: 'Admin' },
      { email: 'admin@example.com', password: 'admin123', nome: 'Admin Padrão' },
      { email: 'test@test.com', password: 'test123', nome: 'Teste' }
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

    // 6. Tentar criar usuário Jeflix
    console.log('\n6️⃣ TENTANDO CRIAR USUÁRIO JEFLIX...');
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
    } else if (createJeflix.status === 409) {
      console.log('ℹ️ Usuário Jeflix já existe');
    } else {
      console.log('❌ Falha ao criar usuário Jeflix');
    }

    // 7. Testar login Jeflix após criação
    console.log('\n7️⃣ TESTANDO LOGIN JEFLIX APÓS CRIAÇÃO...');
    const loginJeflix = await makeRequest(`${BASE_URL}/api/auth/login`, 'POST', {
      email: 'jeflix@jus.com',
      password: 'admin1234'
    });
    
    console.log(`Status: ${loginJeflix.status}`);
    console.log(`Resposta: ${JSON.stringify(loginJeflix.data, null, 2)}`);
    
    if (loginJeflix.status === 200) {
      console.log('✅ LOGIN JEFLIX FUNCIONANDO!');
      console.log(`🎫 Token: ${loginJeflix.data.token ? 'GERADO' : 'NÃO GERADO'}`);
      console.log(`👤 Usuário: ${loginJeflix.data.user?.email}`);
    } else {
      console.log('❌ LOGIN JEFLIX AINDA FALHANDO');
    }

    // 8. Verificar variáveis de ambiente
    console.log('\n8️⃣ VERIFICANDO VARIÁVEIS DE AMBIENTE...');
    console.log('🔧 Variáveis necessárias na Render:');
    console.log('   NODE_ENV=production');
    console.log('   JWT_SECRET=c9e30a7a75eddaa52d0d5e28f682e889');
    console.log('   DATABASE_URL=postgresql://banco_de_dados_ahwt_user:HmFYomHKqCBRvPCz0i2bWpedhKCiTaTz@dpg-d3c58d37mgec73a82gp0-a.oregon-postgres.render.com/banco_de_dados_ahwt');
    console.log('   INIT_TOKEN=init-secret-token-2024');

    // 9. Resumo do diagnóstico
    console.log('\n📋 RESUMO DO DIAGNÓSTICO:');
    console.log('==========================');
    console.log(`🔍 Aplicação online: ${appStatus?.status === 200 ? '✅ SIM' : '❌ NÃO'}`);
    console.log(`🔍 Banco conectado: ${dbStatus.data?.database_connected ? '✅ SIM' : '❌ NÃO'}`);
    console.log(`🔍 Inicialização: ${initResult.status === 200 ? '✅ SUCESSO' : '❌ FALHA'}`);
    console.log(`🔍 Usuários existentes: ${usersResult.data?.total_users || 0}`);
    console.log(`🔍 Login Jeflix: ${loginJeflix.status === 200 ? '✅ FUNCIONANDO' : '❌ FALHANDO'}`);

    // 10. Soluções recomendadas
    console.log('\n🛠️ SOLUÇÕES RECOMENDADAS:');
    console.log('==========================');
    
    if (appStatus?.status !== 200) {
      console.log('1. ❌ APLICAÇÃO NÃO ESTÁ ONLINE');
      console.log('   - Verifique se a aplicação está rodando na Render');
      console.log('   - Faça redeploy da aplicação');
    }
    
    if (!dbStatus.data?.database_connected) {
      console.log('2. ❌ BANCO DE DADOS NÃO CONECTADO');
      console.log('   - Verifique se o banco PostgreSQL existe na Render');
      console.log('   - Confirme se o DATABASE_URL está correto');
      console.log('   - Faça redeploy da aplicação');
    }
    
    if (initResult.status !== 200) {
      console.log('3. ❌ BANCO NÃO FOI INICIALIZADO');
      console.log('   - Configure INIT_TOKEN na Render');
      console.log('   - Faça redeploy da aplicação');
      console.log('   - Execute inicialização manual');
    }
    
    if (usersResult.data?.total_users === 0) {
      console.log('4. ❌ NENHUM USUÁRIO EXISTE');
      console.log('   - Inicialize o banco de dados');
      console.log('   - Crie usuários manualmente');
    }
    
    if (loginJeflix.status !== 200) {
      console.log('5. ❌ LOGIN AINDA FALHANDO');
      console.log('   - Verifique se o banco foi inicializado');
      console.log('   - Confirme se os usuários foram criados');
      console.log('   - Teste com credenciais diferentes');
    }

    console.log('\n🎯 PRÓXIMOS PASSOS:');
    console.log('===================');
    console.log('1. Configure todas as variáveis de ambiente na Render');
    console.log('2. Faça redeploy da aplicação');
    console.log('3. Aguarde alguns minutos');
    console.log('4. Execute este diagnóstico novamente');
    console.log('5. Se ainda falhar, crie usuários manualmente');

  } catch (error) {
    console.error('❌ Erro durante o diagnóstico:', error.message);
  }
}

// Executar diagnóstico
diagnosticoCompleto().catch(console.error);
