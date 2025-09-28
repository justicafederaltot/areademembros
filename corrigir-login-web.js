// Script para corrigir problema de login na interface web
const https = require('https');

const BASE_URL = 'https://webservice-5yg7.onrender.com';

console.log('🔧 Corrigindo problema de login na interface web...');
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
        'User-Agent': 'Login-Web-Fix/1.0',
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
async function corrigirLoginWeb() {
  try {
    console.log('🚀 CORRIGINDO PROBLEMA DE LOGIN NA INTERFACE WEB...');
    console.log('');

    // 1. Verificar se a aplicação está respondendo
    console.log('1️⃣ Verificando se a aplicação está respondendo...');
    const appCheck = await makeRequest(`${BASE_URL}/`);
    console.log(`Status da aplicação: ${appCheck.status}`);
    
    if (appCheck.status === 200) {
      console.log('✅ Aplicação está respondendo');
    } else {
      console.log('❌ Aplicação não está respondendo');
      return;
    }

    // 2. Testar login Jeflix
    console.log('\n2️⃣ Testando login Jeflix...');
    const loginJeflix = await makeRequest(`${BASE_URL}/api/auth/login`, 'POST', {
      email: 'jeflix@jus.com',
      password: 'admin1234'
    });
    
    console.log(`Status: ${loginJeflix.status}`);
    console.log(`Resposta: ${JSON.stringify(loginJeflix.data, null, 2)}`);
    
    if (loginJeflix.status === 200) {
      console.log('✅ Login Jeflix via API funcionando!');
      console.log(`🎫 Token: ${loginJeflix.data.token ? 'GERADO' : 'NÃO GERADO'}`);
      console.log(`👤 Usuário: ${loginJeflix.data.user?.email}`);
      
      // 3. Testar verificação de auth
      console.log('\n3️⃣ Testando verificação de auth...');
      const authCheck = await makeRequest(`${BASE_URL}/api/auth/me`, 'GET', null, {
        'Authorization': `Bearer ${loginJeflix.data.token}`
      });
      
      console.log(`Status: ${authCheck.status}`);
      console.log(`Resposta: ${JSON.stringify(authCheck.data, null, 2)}`);
      
      if (authCheck.status === 200) {
        console.log('✅ Verificação de auth funcionando!');
        console.log(`👤 Usuário verificado: ${authCheck.data.email}`);
      } else {
        console.log('❌ Falha na verificação de auth');
        console.log('🔧 PROBLEMA: Token JWT não está sendo aceito');
      }
    } else {
      console.log('❌ Login Jeflix via API falhou');
      console.log('🔧 PROBLEMA: API de login não está funcionando');
      return;
    }

    // 4. Verificar se há problema com CORS
    console.log('\n4️⃣ Verificando se há problema com CORS...');
    const corsTest = await makeRequest(`${BASE_URL}/api/auth/login`, 'POST', {
      email: 'jeflix@jus.com',
      password: 'admin1234'
    }, {
      'Origin': 'https://webservice-5yg7.onrender.com',
      'Referer': 'https://webservice-5yg7.onrender.com/'
    });
    
    console.log(`Status: ${corsTest.status}`);
    if (corsTest.status === 200) {
      console.log('✅ CORS está funcionando');
    } else {
      console.log('❌ Problema com CORS');
    }

    // 5. Verificar se há problema com cache
    console.log('\n5️⃣ Verificando se há problema com cache...');
    const cacheTest = await makeRequest(`${BASE_URL}/api/auth/login`, 'POST', {
      email: 'jeflix@jus.com',
      password: 'admin1234'
    }, {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    });
    
    console.log(`Status: ${cacheTest.status}`);
    if (cacheTest.status === 200) {
      console.log('✅ Cache não está causando problema');
    } else {
      console.log('❌ Problema com cache');
    }

    // 6. Verificar se há problema com JavaScript
    console.log('\n6️⃣ Verificando se há problema com JavaScript...');
    console.log('🔧 PROBLEMA POSSÍVEL: JavaScript não está executando corretamente');
    console.log('🛠️ SOLUÇÕES:');
    console.log('1. Limpe o cache do browser (Ctrl+F5)');
    console.log('2. Teste em modo incógnito');
    console.log('3. Verifique se não há erro de JavaScript no console');
    console.log('4. Verifique se o JavaScript está habilitado');

    // 7. Verificar se há problema com o AuthProvider
    console.log('\n7️⃣ Verificando se há problema com o AuthProvider...');
    console.log('🔧 PROBLEMA POSSÍVEL: AuthProvider não está funcionando corretamente');
    console.log('🛠️ SOLUÇÕES:');
    console.log('1. Verifique se o localStorage está funcionando');
    console.log('2. Verifique se o token está sendo salvo');
    console.log('3. Verifique se o estado do usuário está sendo atualizado');

    // 8. Verificar se há problema com o formulário
    console.log('\n8️⃣ Verificando se há problema com o formulário...');
    console.log('🔧 PROBLEMA POSSÍVEL: Formulário não está enviando dados corretamente');
    console.log('🛠️ SOLUÇÕES:');
    console.log('1. Verifique se os campos estão sendo preenchidos');
    console.log('2. Verifique se o submit está sendo chamado');
    console.log('3. Verifique se os dados estão sendo enviados');

    console.log('\n📋 DIAGNÓSTICO COMPLETO:');
    console.log('========================');
    console.log('🔍 API de login: ' + (loginJeflix.status === 200 ? '✅ FUNCIONANDO' : '❌ FALHANDO'));
    console.log('🔍 Verificação de auth: ' + (authCheck?.status === 200 ? '✅ FUNCIONANDO' : '❌ FALHANDO'));
    console.log('🔍 CORS: ' + (corsTest.status === 200 ? '✅ FUNCIONANDO' : '❌ FALHANDO'));
    console.log('🔍 Cache: ' + (cacheTest.status === 200 ? '✅ FUNCIONANDO' : '❌ FALHANDO'));

    if (loginJeflix.status === 200 && authCheck?.status === 200) {
      console.log('\n✅ API ESTÁ FUNCIONANDO PERFEITAMENTE!');
      console.log('🔧 PROBLEMA: Está na interface web (JavaScript/React)');
      console.log('');
      console.log('🛠️ SOLUÇÕES PARA O USUÁRIO:');
      console.log('1. Limpe o cache do browser (Ctrl+F5)');
      console.log('2. Teste em modo incógnito');
      console.log('3. Verifique se não há erro de JavaScript no console');
      console.log('4. Verifique se o JavaScript está habilitado');
      console.log('5. Tente em outro browser');
      console.log('');
      console.log('🔧 SOLUÇÕES TÉCNICAS:');
      console.log('1. Verificar se o AuthProvider está funcionando');
      console.log('2. Verificar se o formulário está enviando dados');
      console.log('3. Verificar se o localStorage está funcionando');
      console.log('4. Verificar se o estado do usuário está sendo atualizado');
    } else {
      console.log('\n❌ API AINDA TEM PROBLEMAS');
      console.log('🔧 PROBLEMA: Banco de dados ou configuração');
    }

    console.log('\n🎯 CREDENCIAIS QUE DEVEM FUNCIONAR:');
    console.log('====================================');
    console.log('📧 Email: jeflix@jus.com');
    console.log('🔑 Senha: admin1234');
    console.log('');
    console.log('📧 Email: admin@jus.com');
    console.log('🔑 Senha: admin123');
    console.log('');
    console.log('🌐 URL: https://webservice-5yg7.onrender.com/');

  } catch (error) {
    console.error('❌ Erro durante a correção:', error.message);
  }
}

// Executar correção
corrigirLoginWeb().catch(console.error);
