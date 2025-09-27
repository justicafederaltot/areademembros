#!/usr/bin/env node

/**
 * Script para inicializar o banco de dados em produção
 * Uso: node scripts/init-production-db.js [URL_DO_DEPLOY]
 */

const https = require('https');
const http = require('http');

const DEPLOY_URL = process.argv[2] || 'https://areademembros.onrender.com';
const INIT_TOKEN = process.env.INIT_TOKEN || 'init-secret-token-2024';

async function initializeDatabase() {
  console.log('🚀 Inicializando banco de dados em produção...');
  console.log(`📡 URL: ${DEPLOY_URL}`);
  
  const url = new URL(`${DEPLOY_URL}/api/init-database`);
  const isHttps = url.protocol === 'https:';
  const client = isHttps ? https : http;
  
  const options = {
    hostname: url.hostname,
    port: url.port || (isHttps ? 443 : 80),
    path: url.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${INIT_TOKEN}`
    }
  };

  return new Promise((resolve, reject) => {
    const req = client.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          if (res.statusCode === 200) {
            console.log('✅ Banco de dados inicializado com sucesso!');
            console.log('📋 Credenciais de acesso:');
            console.log(`   Email: ${response.credentials.email}`);
            console.log(`   Senha: ${response.credentials.password}`);
            console.log('');
            console.log('🎉 Agora você pode fazer login na aplicação!');
            resolve(response);
          } else {
            console.error('❌ Erro ao inicializar banco de dados:');
            console.error(response);
            reject(new Error(`HTTP ${res.statusCode}: ${response.error}`));
          }
        } catch (error) {
          console.error('❌ Erro ao processar resposta:', error);
          console.error('📄 Resposta recebida:', data);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Erro de conexão:', error.message);
      reject(error);
    });

    req.end();
  });
}

async function checkStatus() {
  console.log('🔍 Verificando status da aplicação...');
  
  const url = new URL(`${DEPLOY_URL}/api/init-database`);
  const isHttps = url.protocol === 'https:';
  const client = isHttps ? https : http;
  
  const options = {
    hostname: url.hostname,
    port: url.port || (isHttps ? 443 : 80),
    path: url.pathname,
    method: 'GET'
  };

  return new Promise((resolve, reject) => {
    const req = client.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('📊 Status da aplicação:');
          console.log(`   API: ${response.status}`);
          console.log(`   Banco de dados: ${response.database_connected ? '✅ Conectado' : '❌ Desconectado'}`);
          resolve(response);
        } catch (error) {
          console.error('❌ Erro ao processar status:', error);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Erro de conexão:', error.message);
      reject(error);
    });

    req.end();
  });
}

async function main() {
  try {
    // Verificar status primeiro
    await checkStatus();
    console.log('');
    
    // Inicializar banco de dados
    await initializeDatabase();
    
  } catch (error) {
    console.error('❌ Falha na inicialização:', error.message);
    console.log('');
    console.log('💡 Dicas para resolver:');
    console.log('1. Verifique se a aplicação está rodando na URL fornecida');
    console.log('2. Verifique se a variável INIT_TOKEN está configurada');
    console.log('3. Verifique se a variável DATABASE_URL está configurada');
    console.log('4. Aguarde alguns minutos se a aplicação acabou de ser deployada');
    process.exit(1);
  }
}

// Verificar se foi chamado diretamente
if (require.main === module) {
  main();
}
