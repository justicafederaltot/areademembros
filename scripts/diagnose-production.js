#!/usr/bin/env node

/**
 * Script de diagnóstico completo para produção
 * Identifica e resolve problemas de login na versão deployada
 */

const https = require('https');

const BASE_URL = 'https://areademembros.onrender.com';

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
        'User-Agent': 'Production-Diagnostic/1.0',
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

// Função principal de diagnóstico
async function diagnoseProduction() {
  console.log('🔍 Diagnóstico completo da aplicação em produção...\n');
  console.log(`🌐 URL: ${BASE_URL}\n`);

  const results = {
    app_responding: false,
    database_connected: false,
    users_exist: false,
    login_working: false,
    issues: []
  };

  try {
    // 1. Teste básico de conectividade
    console.log('1️⃣ Testando conectividade básica...');
    try {
      const basicTest = await makeRequest(`${BASE_URL}/`);
      if (basicTest.status === 200) {
        console.log('✅ Aplicação está respondendo');
        results.app_responding = true;
      } else {
        console.log(`❌ Aplicação retornou status: ${basicTest.status}`);
        results.issues.push('Aplicação não está respondendo corretamente');
      }
    } catch (error) {
      console.log(`❌ Erro de conectividade: ${error.message}`);
      results.issues.push('Erro de conectividade com a aplicação');
      console.log('\n🔧 SOLUÇÕES:');
      console.log('1. Verifique se a aplicação está rodando na Render');
      console.log('2. Aguarde alguns minutos para o deploy ser concluído');
      console.log('3. Verifique os logs da Render no painel de administração');
      console.log('4. Verifique se o domínio está correto');
      return results;
    }

    // 2. Teste de status do banco
    console.log('\n2️⃣ Verificando status do banco de dados...');
    try {
      const dbStatus = await makeRequest(`${BASE_URL}/api/init-database`);
      if (dbStatus.status === 200) {
        console.log('✅ Rota de status funcionando');
        console.log(`📊 Status: ${dbStatus.data.status}`);
        console.log(`🔗 Banco conectado: ${dbStatus.data.database_connected ? '✅ SIM' : '❌ NÃO'}`);
        
        if (dbStatus.data.database_connected) {
          results.database_connected = true;
        } else {
          results.issues.push('Banco de dados não está conectado');
        }
      } else {
        console.log(`❌ Rota de status falhou: ${dbStatus.status}`);
        results.issues.push('Rota de status do banco não está funcionando');
      }
    } catch (error) {
      console.log(`❌ Erro ao verificar status do banco: ${error.message}`);
      results.issues.push('Erro ao verificar status do banco');
    }

    // 3. Diagnóstico completo
    console.log('\n3️⃣ Executando diagnóstico completo...');
    try {
      const diagnostic = await makeRequest(`${BASE_URL}/api/debug/full-diagnostic`);
      if (diagnostic.status === 200) {
        console.log('✅ Diagnóstico obtido');
        console.log(`🔗 Conexão com banco: ${diagnostic.data.database?.connected ? '✅ OK' : '❌ FALHOU'}`);
        console.log(`👥 Total de usuários: ${diagnostic.data.users?.total || 0}`);
        console.log(`👤 Admin existe: ${diagnostic.data.users?.admin_exists ? '✅ SIM' : '❌ NÃO'}`);
        
        if (diagnostic.data.database?.error) {
          console.log(`❌ Erro do banco: ${diagnostic.data.database.error}`);
          results.issues.push(`Erro do banco: ${diagnostic.data.database.error}`);
        }
        
        if (diagnostic.data.users?.total > 0) {
          results.users_exist = true;
        } else {
          results.issues.push('Nenhum usuário encontrado no banco');
        }
      } else {
        console.log(`❌ Falha no diagnóstico: ${diagnostic.status}`);
        results.issues.push('Falha no diagnóstico completo');
      }
    } catch (error) {
      console.log(`❌ Erro no diagnóstico: ${error.message}`);
      results.issues.push('Erro no diagnóstico completo');
    }

    // 4. Verificar usuários
    console.log('\n4️⃣ Verificando usuários...');
    try {
      const users = await makeRequest(`${BASE_URL}/api/debug/users`);
      if (users.status === 200) {
        console.log(`✅ Usuários encontrados: ${users.data.total_users || 0}`);
        
        if (users.data.users && users.data.users.length > 0) {
          console.log('👥 Lista de usuários:');
          users.data.users.forEach((user, index) => {
            console.log(`   ${index + 1}. ${user.email} (${user.name}) - ${user.role}`);
          });
          results.users_exist = true;
        } else {
          console.log('❌ Nenhum usuário encontrado!');
          results.issues.push('Nenhum usuário encontrado');
        }
      } else {
        console.log(`❌ Falha ao obter usuários: ${users.status}`);
        results.issues.push('Falha ao obter usuários');
      }
    } catch (error) {
      console.log(`❌ Erro ao verificar usuários: ${error.message}`);
      results.issues.push('Erro ao verificar usuários');
    }

    // 5. Testar login
    console.log('\n5️⃣ Testando login...');
    try {
      const loginTest = await makeRequest(`${BASE_URL}/api/auth/login`, 'POST', {
        email: 'admin@jus.com',
        password: 'admin123'
      });
      
      if (loginTest.status === 200) {
        console.log('✅ Login funcionando!');
        console.log(`🎫 Token gerado: ${loginTest.data.token ? 'SIM' : 'NÃO'}`);
        console.log(`👤 Usuário: ${loginTest.data.user?.email}`);
        results.login_working = true;
      } else {
        console.log(`❌ Falha no login: ${loginTest.status}`);
        console.log(`Resposta: ${JSON.stringify(loginTest.data)}`);
        results.issues.push('Falha no login');
      }
    } catch (error) {
      console.log(`❌ Erro ao testar login: ${error.message}`);
      results.issues.push('Erro ao testar login');
    }

    // 6. Tentar inicializar banco se necessário
    if (!results.database_connected || !results.users_exist) {
      console.log('\n6️⃣ Tentando inicializar banco de dados...');
      try {
        const initResult = await makeRequest(`${BASE_URL}/api/init-database`, 'POST', null, {
          'Authorization': 'Bearer init-secret-token-2024'
        });
        
        if (initResult.status === 200) {
          console.log('✅ Banco de dados inicializado!');
          console.log(`📧 Email admin: ${initResult.data.credentials?.email}`);
          console.log(`🔑 Senha admin: ${initResult.data.credentials?.password}`);
          results.database_connected = true;
          results.users_exist = true;
        } else if (initResult.status === 401) {
          console.log('❌ Token de autorização inválido');
          results.issues.push('Token de autorização inválido para inicialização');
        } else {
          console.log(`❌ Falha ao inicializar banco: ${initResult.status}`);
          results.issues.push('Falha ao inicializar banco de dados');
        }
      } catch (error) {
        console.log(`❌ Erro ao inicializar banco: ${error.message}`);
        results.issues.push('Erro ao inicializar banco de dados');
      }
    }

    // Resumo final
    console.log('\n📋 RESUMO DO DIAGNÓSTICO:');
    console.log('==========================');
    console.log(`🌐 Aplicação respondendo: ${results.app_responding ? '✅ SIM' : '❌ NÃO'}`);
    console.log(`🔗 Banco conectado: ${results.database_connected ? '✅ SIM' : '❌ NÃO'}`);
    console.log(`👥 Usuários existem: ${results.users_exist ? '✅ SIM' : '❌ NÃO'}`);
    console.log(`🔐 Login funcionando: ${results.login_working ? '✅ SIM' : '❌ NÃO'}`);
    
    if (results.issues.length > 0) {
      console.log('\n❌ PROBLEMAS IDENTIFICADOS:');
      results.issues.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue}`);
      });
    }

    if (results.login_working) {
      console.log('\n🎉 LOGIN FUNCIONANDO!');
      console.log('🔑 Credenciais:');
      console.log('   Email: admin@jus.com');
      console.log('   Senha: admin123');
      console.log(`🌐 URL: ${BASE_URL}/`);
    } else {
      console.log('\n🔧 PRÓXIMOS PASSOS:');
      console.log('1. Verifique se a aplicação está rodando na Render');
      console.log('2. Verifique as variáveis de ambiente na Render');
      console.log('3. Execute o script de inicialização do banco');
      console.log('4. Aguarde alguns minutos para estabilização');
    }

    return results;

  } catch (error) {
    console.error('❌ Erro durante o diagnóstico:', error.message);
    results.issues.push(`Erro geral: ${error.message}`);
    return results;
  }
}

// Executar diagnóstico
if (require.main === module) {
  diagnoseProduction().catch(console.error);
}

module.exports = { diagnoseProduction };

