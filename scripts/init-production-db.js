#!/usr/bin/env node

/**
 * Script para inicializar o banco de dados em produção
 * Este script deve ser executado após o deploy na Render
 */

const https = require('https');

// URL da aplicação deployada (substitua pela URL real)
const BASE_URL = process.argv[2] || 'https://areademembros.onrender.com';
const INIT_TOKEN = 'init-secret-token-2024';

console.log('🚀 Inicializando banco de dados em produção...');
console.log(`🌐 URL: ${BASE_URL}`);
console.log(`🔑 Token: ${INIT_TOKEN}`);
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
        'User-Agent': 'Production-DB-Init/1.0',
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
async function initializeProductionDatabase() {
  try {
    // 1. Verificar se a aplicação está rodando
    console.log('1️⃣ Verificando se a aplicação está rodando...');
    
    try {
      const status = await makeRequest(`${BASE_URL}/api/init-database`);
      
      if (status.status === 200) {
        console.log('✅ Aplicação está funcionando');
        console.log(`📊 Status: ${status.data.status}`);
        console.log(`🔗 Banco conectado: ${status.data.database_connected ? '✅ SIM' : '❌ NÃO'}`);
        
        if (status.data.database_connected) {
          console.log('✅ Banco de dados já está conectado!');
          return;
        }
      } else {
        console.log(`❌ Aplicação não está respondendo: ${status.status}`);
        console.log('🔧 Aguarde alguns minutos para o deploy ser concluído e tente novamente');
        return;
      }
    } catch (error) {
      console.log(`❌ Erro ao conectar com a aplicação: ${error.message}`);
      console.log('🔧 Verifique se a URL está correta e se a aplicação está rodando');
      return;
    }

    // 2. Inicializar banco de dados
    console.log('\n2️⃣ Inicializando banco de dados...');
    
    try {
      const initResult = await makeRequest(`${BASE_URL}/api/init-database`, 'POST', null, {
        'Authorization': `Bearer ${INIT_TOKEN}`
      });
      
      if (initResult.status === 200) {
        console.log('✅ Banco de dados inicializado com sucesso!');
        console.log(`📧 Email admin: ${initResult.data.credentials?.email}`);
        console.log(`🔑 Senha admin: ${initResult.data.credentials?.password}`);
      } else if (initResult.status === 401) {
        console.log('❌ Token de autorização inválido');
        console.log('🔧 Verifique se a variável INIT_TOKEN está configurada na Render');
        console.log(`Token usado: ${INIT_TOKEN}`);
      } else {
        console.log(`❌ Falha ao inicializar banco: ${initResult.status}`);
        console.log(`Resposta: ${JSON.stringify(initResult.data)}`);
      }
    } catch (error) {
      console.log(`❌ Erro ao inicializar banco: ${error.message}`);
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
        }
      } else {
        console.log(`❌ Falha ao obter usuários: ${users.status}`);
      }
    } catch (error) {
      console.log(`❌ Erro ao verificar usuários: ${error.message}`);
    }

    // 4. Testar login
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
      }
    } catch (error) {
      console.log(`❌ Erro ao testar login: ${error.message}`);
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
    console.log('🎉 Banco de dados inicializado com sucesso!');

  } catch (error) {
    console.error('❌ Erro durante a inicialização:', error.message);
    console.log('\n🔧 Possíveis soluções:');
    console.log('1. Verifique se a aplicação está rodando');
    console.log('2. Verifique se as variáveis de ambiente estão configuradas');
    console.log('3. Aguarde alguns minutos para estabilização');
    console.log('4. Verifique os logs da Render');
  }
}

// Executar inicialização
if (require.main === module) {
  initializeProductionDatabase().catch(console.error);
}

module.exports = { initializeProductionDatabase };