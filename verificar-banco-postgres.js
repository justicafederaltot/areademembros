// Script para verificar status do banco PostgreSQL
const https = require('https');

const BASE_URL = 'https://webservice-5yg7.onrender.com';

console.log('🔍 Verificando status do banco PostgreSQL...');
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
        'User-Agent': 'Banco-Check-Postgres/1.0',
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
async function verificarBancoPostgres() {
  try {
    console.log('🚀 VERIFICANDO STATUS DO BANCO POSTGRESQL...');
    console.log('');

    // 1. Verificar status da aplicação
    console.log('1️⃣ Verificando status da aplicação...');
    const status = await makeRequest(`${BASE_URL}/api/init-database`);
    
    console.log(`Status: ${status.status}`);
    console.log(`Resposta: ${JSON.stringify(status.data, null, 2)}`);
    
    if (status.status === 200) {
      console.log('✅ Aplicação está funcionando');
      console.log(`🔗 Banco conectado: ${status.data.database_connected ? 'SIM' : 'NÃO'}`);
      
      if (status.data.database_connected) {
        console.log('✅ Banco PostgreSQL está conectado!');
        return;
      }
    } else {
      console.log('❌ Aplicação não está respondendo');
      return;
    }

    // 2. Tentar inicializar banco
    console.log('\n2️⃣ Tentando inicializar banco...');
    const initResult = await makeRequest(`${BASE_URL}/api/init-database`, 'POST', null, {
      'Authorization': 'Bearer init-secret-token-2024'
    });
    
    console.log(`Status: ${initResult.status}`);
    console.log(`Resposta: ${JSON.stringify(initResult.data, null, 2)}`);
    
    if (initResult.status === 200) {
      console.log('✅ Banco inicializado com sucesso!');
    } else if (initResult.status === 401) {
      console.log('❌ Token de autorização inválido');
      console.log('🔧 A aplicação ainda não foi redeployada');
    } else if (initResult.status === 500) {
      console.log('❌ Erro interno do servidor');
      console.log('🔧 Possíveis causas:');
      console.log('   - Banco PostgreSQL não está acessível');
      console.log('   - DATABASE_URL incorreto');
      console.log('   - Banco não foi criado na Render');
      console.log('   - Aplicação precisa ser redeployada');
    } else {
      console.log(`❌ Falha inesperada: ${initResult.status}`);
    }

    // 3. Verificar se banco foi inicializado
    console.log('\n3️⃣ Verificando se banco foi inicializado...');
    const status2 = await makeRequest(`${BASE_URL}/api/init-database`);
    
    console.log(`Status: ${status2.status}`);
    console.log(`Banco conectado: ${status2.data?.database_connected ? 'SIM' : 'NÃO'}`);
    
    if (status2.data?.database_connected) {
      console.log('✅ Banco foi inicializado com sucesso!');
    } else {
      console.log('❌ Banco ainda não foi inicializado');
    }

    console.log('\n📋 DIAGNÓSTICO:');
    console.log('================');
    console.log('🔍 Status da aplicação: ' + (status.status === 200 ? '✅ OK' : '❌ FALHA'));
    console.log('🔍 Banco conectado: ' + (status.data?.database_connected ? '✅ SIM' : '❌ NÃO'));
    console.log('🔍 Inicialização: ' + (initResult.status === 200 ? '✅ SUCESSO' : '❌ FALHA'));
    
    if (initResult.status === 500) {
      console.log('\n🛠️ SOLUÇÕES NECESSÁRIAS:');
      console.log('1. Verifique se o banco PostgreSQL foi criado na Render');
      console.log('2. Confirme se o DATABASE_URL está correto');
      console.log('3. Faça redeploy da aplicação');
      console.log('4. Aguarde alguns minutos e tente novamente');
    }

  } catch (error) {
    console.error('❌ Erro durante a verificação:', error.message);
  }
}

// Executar verificação
verificarBancoPostgres().catch(console.error);
