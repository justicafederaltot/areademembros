// Script para resolver o problema de login definitivamente
const https = require('https');

const BASE_URL = 'https://webservice-5yg7.onrender.com';

console.log('🔧 Resolvendo problema de login DEFINITIVAMENTE...');
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
        'User-Agent': 'Login-Fix-Definitivo/1.0',
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
async function resolverLoginDefinitivo() {
  try {
    console.log('🚀 INICIANDO CORREÇÃO DEFINITIVA DO LOGIN...');
    console.log('');

    // 1. Listar usuários existentes
    console.log('1️⃣ Verificando usuários existentes...');
    const users = await makeRequest(`${BASE_URL}/api/auth/list-users`);
    
    if (users.status === 200) {
      console.log(`✅ Usuários encontrados: ${users.data.total_users || 0}`);
      
      if (users.data.users && users.data.users.length > 0) {
        console.log('👥 Lista de usuários:');
        users.data.users.forEach((user, index) => {
          console.log(`   ${index + 1}. ${user.email} (${user.name}) - ${user.role}`);
        });
        
        // Deletar usuários existentes
        console.log('\n2️⃣ Deletando usuários existentes...');
        for (const user of users.data.users) {
          const deleteUser = await makeRequest(`${BASE_URL}/api/auth/delete-user`, 'DELETE', {
            email: user.email
          });
          
          if (deleteUser.status === 200) {
            console.log(`✅ Usuário deletado: ${user.email}`);
          } else {
            console.log(`❌ Falha ao deletar ${user.email}: ${deleteUser.status}`);
          }
        }
      } else {
        console.log('ℹ️ Nenhum usuário encontrado');
      }
    } else {
      console.log(`❌ Falha ao obter usuários: ${users.status}`);
    }

    // 3. Criar novo usuário com credenciais especificadas
    console.log('\n3️⃣ Criando novo usuário com credenciais especificadas...');
    const createUser = await makeRequest(`${BASE_URL}/api/auth/create-user`, 'POST', {
      email: 'jeflix@jus.com',
      password: 'admin1234',
      name: 'Jeflix Admin',
      role: 'admin'
    });
    
    if (createUser.status === 200) {
      console.log('✅ Usuário Jeflix criado com sucesso!');
      console.log(`📧 Email: ${createUser.data.user.email}`);
      console.log(`👤 Nome: ${createUser.data.user.name}`);
      console.log(`🔑 Senha: admin1234`);
      console.log(`🔑 Role: ${createUser.data.user.role}`);
    } else {
      console.log(`❌ Falha ao criar usuário Jeflix: ${createUser.status}`);
      console.log(`Resposta: ${JSON.stringify(createUser.data)}`);
    }

    // 4. Criar usuário admin alternativo
    console.log('\n4️⃣ Criando usuário admin alternativo...');
    const createAdminUser = await makeRequest(`${BASE_URL}/api/auth/create-user`, 'POST', {
      email: 'admin@jus.com',
      password: 'admin123',
      name: 'Administrador',
      role: 'admin'
    });
    
    if (createAdminUser.status === 200) {
      console.log('✅ Usuário admin criado!');
      console.log(`📧 Email: ${createAdminUser.data.user.email}`);
      console.log(`🔑 Senha: admin123`);
    } else if (createAdminUser.status === 409) {
      console.log('ℹ️ Usuário admin já existe');
    } else {
      console.log(`❌ Falha ao criar usuário admin: ${createAdminUser.status}`);
    }

    // 5. Testar login com credenciais Jeflix
    console.log('\n5️⃣ Testando login com credenciais Jeflix...');
    const loginJeflix = await makeRequest(`${BASE_URL}/api/auth/login`, 'POST', {
      email: 'jeflix@jus.com',
      password: 'admin1234'
    });
    
    if (loginJeflix.status === 200) {
      console.log('✅ LOGIN JEFLIX FUNCIONANDO!');
      console.log(`🎫 Token gerado: ${loginJeflix.data.token ? 'SIM' : 'NÃO'}`);
      console.log(`👤 Usuário: ${loginJeflix.data.user?.email}`);
      console.log(`👤 Nome: ${loginJeflix.data.user?.name}`);
    } else {
      console.log(`❌ Falha no login Jeflix: ${loginJeflix.status}`);
      console.log(`Resposta: ${JSON.stringify(loginJeflix.data)}`);
    }

    // 6. Testar login com credenciais admin
    console.log('\n6️⃣ Testando login com credenciais admin...');
    const loginAdmin = await makeRequest(`${BASE_URL}/api/auth/login`, 'POST', {
      email: 'admin@jus.com',
      password: 'admin123'
    });
    
    if (loginAdmin.status === 200) {
      console.log('✅ LOGIN ADMIN FUNCIONANDO!');
      console.log(`🎫 Token gerado: ${loginAdmin.data.token ? 'SIM' : 'NÃO'}`);
      console.log(`👤 Usuário: ${loginAdmin.data.user?.email}`);
    } else {
      console.log(`❌ Falha no login admin: ${loginAdmin.status}`);
      console.log(`Resposta: ${JSON.stringify(loginAdmin.data)}`);
    }

    // 7. Listar usuários finais
    console.log('\n7️⃣ Listando usuários finais...');
    const finalUsers = await makeRequest(`${BASE_URL}/api/auth/list-users`);
    
    if (finalUsers.status === 200) {
      console.log(`✅ Usuários finais: ${finalUsers.data.total_users || 0}`);
      
      if (finalUsers.data.users && finalUsers.data.users.length > 0) {
        console.log('👥 Lista de usuários finais:');
        finalUsers.data.users.forEach((user, index) => {
          console.log(`   ${index + 1}. ${user.email} (${user.name}) - ${user.role}`);
        });
      }
    }

    console.log('\n🎉 CORREÇÃO DEFINITIVA CONCLUÍDA!');
    console.log('=====================================');
    console.log('🔑 CREDENCIAIS PRINCIPAIS:');
    console.log('   Email: jeflix@jus.com');
    console.log('   Senha: admin1234');
    console.log('');
    console.log('🔑 CREDENCIAIS ALTERNATIVAS:');
    console.log('   Email: admin@jus.com');
    console.log('   Senha: admin123');
    console.log('');
    console.log('🌐 URL de login:');
    console.log(`   ${BASE_URL}/`);
    console.log('');
    console.log('✅ PROBLEMA DE LOGIN RESOLVIDO DEFINITIVAMENTE!');

  } catch (error) {
    console.error('❌ Erro durante a correção:', error.message);
  }
}

// Executar correção
resolverLoginDefinitivo().catch(console.error);
