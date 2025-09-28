# 🔧 Solução para Problema de Login na Versão Deployada

## 🚨 Problema Identificado

O erro "Connection failed" indica que a aplicação não consegue se conectar ao banco de dados PostgreSQL na Render. Isso pode ser causado por:

1. **Aplicação não está rodando** - Deploy falhou ou não foi concluído
2. **Banco de dados não inicializado** - Tabelas e usuários não foram criados
3. **Variáveis de ambiente incorretas** - DATABASE_URL ou outras variáveis mal configuradas
4. **Banco PostgreSQL inativo** - Banco não está acessível

## 🛠️ Soluções Passo a Passo

### 1. **Verificar Status do Deploy na Render**

1. Acesse o painel da Render: https://dashboard.render.com
2. Vá em **Web Services** e encontre sua aplicação
3. Verifique se o status está **Live** (verde)
4. Se estiver **Build Failed** ou **Deploy Failed**, veja os logs de erro

### 2. **Verificar Variáveis de Ambiente**

No painel da Render, vá em **Environment** e verifique se estão configuradas:

```env
NODE_ENV=production
JWT_SECRET=sua-chave-secreta-muito-segura-aqui-2024
DATABASE_URL=postgresql://banco_de_dados_ahwt_user:HmFYomHKqCBRvPCz0i2bWpedhKCiTaTz@dpg-d3c58d37mgec73a82gp0-a.oregon-postgres.render.com/banco_de_dados_ahwt
INIT_TOKEN=init-secret-token-2024
```

### 3. **Verificar Banco PostgreSQL**

1. No painel da Render, vá em **PostgreSQL**
2. Verifique se o banco está **Active** (verde)
3. Se estiver **Paused**, clique em **Resume**

### 4. **Inicializar Banco de Dados**

Após verificar que a aplicação está rodando, execute um dos comandos abaixo:

#### Opção A: Via Browser (Mais Fácil)
```
https://areademembros.onrender.com/api/init-database
```

#### Opção B: Via cURL
```bash
curl -X POST https://areademembros.onrender.com/api/init-database \
  -H "Authorization: Bearer init-secret-token-2024" \
  -H "Content-Type: application/json"
```

#### Opção C: Via PowerShell
```powershell
Invoke-RestMethod -Uri "https://areademembros.onrender.com/api/init-database" -Method POST -Headers @{
    "Authorization" = "Bearer init-secret-token-2024"
    "Content-Type" = "application/json"
}
```

### 5. **Verificar se Funcionou**

Após a inicialização, você deve ver uma resposta como:
```json
{
  "success": true,
  "message": "Banco de dados inicializado com sucesso",
  "credentials": {
    "email": "admin@jus.com",
    "password": "admin123"
  }
}
```

### 6. **Testar Login**

1. Acesse: https://areademembros.onrender.com/
2. Use as credenciais:
   - **Email**: `admin@jus.com`
   - **Senha**: `admin123`

## 🔍 Diagnóstico Avançado

### Se a aplicação não estiver respondendo:

1. **Verifique os logs da Render** no painel de administração
2. **Aguarde alguns minutos** para o deploy ser concluído
3. **Verifique se o domínio está correto**
4. **Teste outras rotas** como `/api/init-database`

### Se o banco não estiver conectado:

1. **Verifique a URL do banco** na variável `DATABASE_URL`
2. **Verifique se o banco PostgreSQL está ativo**
3. **Teste a conexão** com o banco
4. **Execute o script de inicialização**

### Se o login ainda não funcionar:

1. **Verifique se os usuários foram criados**
2. **Teste com credenciais diferentes**
3. **Verifique os logs da aplicação**
4. **Execute o diagnóstico completo**

## 🚀 Scripts de Ajuda

### Script de Teste de Conexão
```javascript
// test-connection.js
const https = require('https');

async function testConnection() {
  try {
    const response = await fetch('https://areademembros.onrender.com/api/init-database');
    const data = await response.json();
    console.log('Status:', data.status);
    console.log('Banco conectado:', data.database_connected);
  } catch (error) {
    console.error('Erro:', error.message);
  }
}

testConnection();
```

### Script de Inicialização
```javascript
// init-database.js
const https = require('https');

async function initDatabase() {
  try {
    const response = await fetch('https://areademembros.onrender.com/api/init-database', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer init-secret-token-2024',
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    console.log('Resultado:', data);
  } catch (error) {
    console.error('Erro:', error.message);
  }
}

initDatabase();
```

## 📞 Suporte Adicional

Se ainda tiver problemas:

1. **Verifique os logs da Render** no painel de administração
2. **Teste a rota de status**: `GET /api/init-database`
3. **Verifique as variáveis de ambiente** estão configuradas
4. **Aguarde alguns minutos** após o deploy para estabilização
5. **Verifique se o banco PostgreSQL está ativo**

## 🎯 Comandos Úteis

```bash
# Verificar status da aplicação
curl https://areademembros.onrender.com/api/init-database

# Inicializar banco de dados
curl -X POST https://areademembros.onrender.com/api/init-database \
  -H "Authorization: Bearer init-secret-token-2024"

# Verificar se a aplicação está rodando
curl https://areademembros.onrender.com
```

---

**🎉 Após seguir estes passos, sua aplicação estará funcionando perfeitamente!**

## 🔑 Credenciais Finais

- **Email**: `admin@jus.com`
- **Senha**: `admin123`
- **URL**: `https://areademembros.onrender.com/`
