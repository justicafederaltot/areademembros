#!/usr/bin/env node

/**
 * Script para corrigir a conexão com o banco de dados na versão deployada
 */

const https = require('https');

const BASE_URL = 'https://areademembros.onrender.com';

// Função para fazer requisições HTTP
function makeRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Database-Fix-Script/1.0'
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

// Função principal para corrigir a conexão
async function fixDatabaseConnection() {
  console.log('🔧 Corrigindo conexão com banco de dados...\n');
  console.log(`🌐 URL: ${BASE_URL}\n`);

  try {
    // 1. Verificar status da aplicação
    console.log('1️⃣ Verificando status da aplicação...');
    const status = await makeRequest(`${BASE_URL}/api/init-database`);
    
    if (status.status === 200) {
      console.log('✅ Aplicação está funcionando');
      console.log(`📊 Status: ${status.data.status}`);
      console.log(`🔗 Banco conectado: ${status.data.database_connected ? '✅ SIM' : '❌ NÃO'}`);
      
      if (!status.data.database_connected) {
        console.log('❌ Banco de dados não está conectado!');
      }
    } else {
      console.log(`❌ Aplicação não está respondendo: ${status.status}`);
      console.log(`Resposta: ${JSON.stringify(status.data)}`);
      return;
    }

    // 2. Executar diagnóstico completo
    console.log('\n2️⃣ Executando diagnóstico completo...');
    const diagnostic = await makeRequest(`${BASE_URL}/api/debug/full-diagnostic`);
    
    if (diagnostic.status === 200) {
      console.log('✅ Diagnóstico obtido');
      console.log(`🔗 Conexão com banco: ${diagnostic.data.database?.connected ? '✅ OK' : '❌ FALHOU'}`);
      console.log(`👥 Total de usuários: ${diagnostic.data.users?.total || 0}`);
      
      if (diagnostic.data.database?.error) {
        console.log(`❌ Erro do banco: ${diagnostic.data.database.error}`);
      }
    } else {
      console.log(`❌ Falha no diagnóstico: ${diagnostic.status}`);
    }

    // 3. Tentar inicializar o banco de dados
    console.log('\n3️⃣ Tentando inicializar banco de dados...');
    const initResult = await makeRequest(`${BASE_URL}/api/init-database`, 'POST');
    
    if (initResult.status === 200) {
      console.log('✅ Banco de dados inicializado com sucesso!');
      console.log(`📧 Email admin: ${initResult.data.credentials?.email}`);
      console.log(`🔑 Senha admin: ${initResult.data.credentials?.password}`);
    } else if (initResult.status === 401) {
      console.log('❌ Token de autorização inválido');
      console.log('🔧 Solução: Verifique se a variável INIT_TOKEN está configurada na Render');
    } else {
      console.log(`❌ Falha ao inicializar banco: ${initResult.status}`);
      console.log(`Resposta: ${JSON.stringify(initResult.data)}`);
    }

    // 4. Verificar usuários após inicialização
    console.log('\n4️⃣ Verificando usuários após inicialização...');
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
      }
    } else {
      console.log(`❌ Falha ao obter usuários: ${users.status}`);
    }

    // 5. Testar login
    console.log('\n5️⃣ Testando login...');
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
    }

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
    console.log('   1. Verifique as variáveis de ambiente na Render');
    console.log('   2. Verifique se o banco PostgreSQL está ativo');
    console.log('   3. Aguarde alguns minutos para estabilização');

  } catch (error) {
    console.error('❌ Erro durante a correção:', error.message);
    console.log('\n🔧 Possíveis soluções:');
    console.log('1. Verifique se a aplicação está rodando');
    console.log('2. Verifique a conectividade de rede');
    console.log('3. Verifique as variáveis de ambiente na Render');
  }
}

// Executar correção
if (require.main === module) {
  fixDatabaseConnection().catch(console.error);
}

module.exports = { fixDatabaseConnection };

