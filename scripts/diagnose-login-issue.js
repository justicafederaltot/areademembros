#!/usr/bin/env node

/**
 * Script para diagnosticar e resolver problemas de login na versão deployada
 * 
 * Este script testa:
 * 1. Conexão com o banco de dados
 * 2. Existência de usuários
 * 3. Criação de usuário admin se necessário
 * 4. Teste de autenticação
 */

const https = require('https');
const http = require('http');

// Configuração
const BASE_URL = process.env.BASE_URL || 'https://areademembros.onrender.com';
const DEBUG_ENDPOINTS = {
  fullDiagnostic: '/api/debug/full-diagnostic',
  users: '/api/debug/users',
  authTest: '/api/debug/auth-test',
  createUser: '/api/debug/create-user'
};

// Função para fazer requisições HTTP
function makeRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Login-Diagnostic-Script/1.0'
      }
    };

    if (data) {
      const jsonData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(jsonData);
    }

    const client = urlObj.protocol === 'https:' ? https : http;
    
    const req = client.request(options, (res) => {
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
async function diagnoseLoginIssue() {
  console.log('🔍 Iniciando diagnóstico de login...\n');
  console.log(`🌐 URL base: ${BASE_URL}\n`);

  try {
    // 1. Teste de diagnóstico completo
    console.log('1️⃣ Testando diagnóstico completo...');
    const diagnosticResult = await makeRequest(`${BASE_URL}${DEBUG_ENDPOINTS.fullDiagnostic}`);
    
    if (diagnosticResult.status === 200) {
      const diagnostic = diagnosticResult.data;
      console.log('✅ Diagnóstico completo obtido');
      console.log(`📊 Ambiente: ${diagnostic.environment?.node_env || 'N/A'}`);
      console.log(`🔗 Conexão com banco: ${diagnostic.database?.connected ? '✅ OK' : '❌ FALHOU'}`);
      console.log(`👥 Total de usuários: ${diagnostic.users?.total || 0}`);
      console.log(`👤 Admin existe: ${diagnostic.users?.admin_exists ? '✅ SIM' : '❌ NÃO'}`);
      
      if (diagnostic.database?.error) {
        console.log(`❌ Erro do banco: ${diagnostic.database.error}`);
      }
    } else {
      console.log(`❌ Falha no diagnóstico: ${diagnosticResult.status}`);
    }

    console.log('\n2️⃣ Verificando usuários existentes...');
    const usersResult = await makeRequest(`${BASE_URL}${DEBUG_ENDPOINTS.users}`);
    
    if (usersResult.status === 200) {
      const users = usersResult.data;
      console.log(`✅ Usuários encontrados: ${users.total_users || 0}`);
      
      if (users.users && users.users.length > 0) {
        console.log('👥 Lista de usuários:');
        users.users.forEach((user, index) => {
          console.log(`   ${index + 1}. ${user.email} (${user.name}) - ${user.role}`);
        });
      } else {
        console.log('❌ Nenhum usuário encontrado!');
      }
    } else {
      console.log(`❌ Falha ao obter usuários: ${usersResult.status}`);
    }

    // 3. Criar usuário admin se necessário
    console.log('\n3️⃣ Verificando/criando usuário admin...');
    const createUserResult = await makeRequest(`${BASE_URL}${DEBUG_ENDPOINTS.createUser}`, 'POST', {
      email: 'admin@destrava.com',
      password: 'destrava123',
      name: 'Admin Destrava'
    });
    
    if (createUserResult.status === 200) {
      const userData = createUserResult.data;
      console.log('✅ Usuário admin criado/verificado');
      console.log(`📧 Email: ${userData.credentials?.email}`);
      console.log(`🔑 Senha: ${userData.credentials?.password}`);
    } else {
      console.log(`❌ Falha ao criar usuário: ${createUserResult.status}`);
      console.log(`Detalhes: ${JSON.stringify(createUserResult.data)}`);
    }

    // 4. Testar autenticação
    console.log('\n4️⃣ Testando autenticação...');
    const authTestResult = await makeRequest(`${BASE_URL}${DEBUG_ENDPOINTS.authTest}`, 'POST', {
      email: 'admin@destrava.com',
      password: 'destrava123'
    });
    
    if (authTestResult.status === 200) {
      const authData = authTestResult.data;
      if (authData.success) {
        console.log('✅ Autenticação bem-sucedida!');
        console.log(`👤 Usuário: ${authData.user?.email}`);
      } else {
        console.log(`❌ Falha na autenticação: ${authData.message}`);
        console.log(`Passo: ${authData.step}`);
      }
    } else {
      console.log(`❌ Falha no teste de autenticação: ${authTestResult.status}`);
    }

    // 5. Testar também com credenciais originais
    console.log('\n5️⃣ Testando credenciais originais...');
    const originalAuthTest = await makeRequest(`${BASE_URL}${DEBUG_ENDPOINTS.authTest}`, 'POST', {
      email: 'admin@jus.com',
      password: 'admin123'
    });
    
    if (originalAuthTest.status === 200) {
      const authData = originalAuthTest.data;
      if (authData.success) {
        console.log('✅ Autenticação com credenciais originais bem-sucedida!');
      } else {
        console.log(`❌ Falha com credenciais originais: ${authData.message}`);
      }
    }

    console.log('\n📋 RESUMO DO DIAGNÓSTICO:');
    console.log('================================');
    console.log('🔑 Credenciais para teste:');
    console.log('   Email: admin@destrava.com');
    console.log('   Senha: destrava123');
    console.log('');
    console.log('🔑 Credenciais originais:');
    console.log('   Email: admin@jus.com');
    console.log('   Senha: admin123');
    console.log('');
    console.log('🌐 URL de login:');
    console.log(`   ${BASE_URL}/`);
    console.log('');
    console.log('🔧 Se ainda não funcionar:');
    console.log('   1. Verifique se o banco de dados está funcionando');
    console.log('   2. Verifique as variáveis de ambiente');
    console.log('   3. Teste as rotas de debug manualmente');

  } catch (error) {
    console.error('❌ Erro durante o diagnóstico:', error.message);
    console.log('\n🔧 Possíveis soluções:');
    console.log('1. Verifique se a URL está correta');
    console.log('2. Verifique se o servidor está rodando');
    console.log('3. Verifique a conectividade de rede');
  }
}

// Executar diagnóstico
if (require.main === module) {
  diagnoseLoginIssue().catch(console.error);
}

module.exports = { diagnoseLoginIssue, makeRequest };


