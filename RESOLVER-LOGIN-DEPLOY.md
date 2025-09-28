# 🔧 Resolver Problema de Login na Versão Deployada

## 🚨 Problema Identificado

A aplicação está rodando em `https://webservice-5yg7.onrender.com/` mas o login não funciona porque:

1. **Banco de dados não foi inicializado** - As tabelas e usuários não foram criados
2. **Token de autorização não configurado** - A variável `INIT_TOKEN` não está definida na Render
3. **Erro**: "Email ou senha incorretos"

## 🛠️ Solução Passo a Passo

### 1. **Configurar Variável de Ambiente na Render**

1. **Acesse o painel da Render**: https://dashboard.render.com
2. **Vá para sua aplicação** (webservice-5yg7)
3. **Clique em "Environment"**
4. **Adicione a variável**:
   ```
   INIT_TOKEN=init-secret-token-2024
   ```
5. **Salve as alterações**

### 2. **Fazer Redeploy da Aplicação**

1. **No painel da Render**, clique em **"Manual Deploy"**
2. **Aguarde o deploy ser concluído** (alguns minutos)
3. **Verifique se a aplicação está rodando**

### 3. **Inicializar Banco de Dados**

Após o redeploy, execute um dos comandos abaixo:

#### Opção A: Via Browser (Mais Fácil)
```
https://webservice-5yg7.onrender.com/api/init-database
```

#### Opção B: Via cURL
```bash
curl -X POST https://webservice-5yg7.onrender.com/api/init-database \
  -H "Authorization: Bearer init-secret-token-2024" \
  -H "Content-Type: application/json"
```

#### Opção C: Via PowerShell
```powershell
Invoke-RestMethod -Uri "https://webservice-5yg7.onrender.com/api/init-database" -Method POST -Headers @{
    "Authorization" = "Bearer init-secret-token-2024"
    "Content-Type" = "application/json"
}
```

### 4. **Verificar se Funcionou**

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

### 5. **Testar Login**

1. **Acesse**: https://webservice-5yg7.onrender.com/
2. **Use as credenciais**:
   - **Email**: `admin@jus.com`
   - **Senha**: `admin123`

## 🔍 Diagnóstico Avançado

### Se ainda não funcionar:

1. **Verifique os logs da Render** no painel de administração
2. **Teste a rota de status**: `GET /api/init-database`
3. **Verifique se as variáveis de ambiente** estão configuradas
4. **Aguarde alguns minutos** para estabilização

### Scripts de Ajuda

Execute estes scripts para diagnosticar:

```bash
# Verificar status
node fix-production-login.js

# Inicializar banco
node init-production-database.js
```

## 📋 Resumo das Variáveis de Ambiente

Certifique-se de que estas variáveis estão configuradas na Render:

```env
NODE_ENV=production
JWT_SECRET=sua-chave-secreta-muito-segura-aqui-2024
DATABASE_URL=postgresql://banco_de_dados_ahwt_user:HmFYomHKqCBRvPCz0i2bWpedhKCiTaTz@dpg-d3c58d37mgec73a82gp0-a.oregon-postgres.render.com/banco_de_dados_ahwt
INIT_TOKEN=init-secret-token-2024
```

## 🎯 Resultado Esperado

Após seguir estes passos:

1. ✅ **Aplicação funcionando**
2. ✅ **Banco de dados conectado**
3. ✅ **Usuários criados**
4. ✅ **Login funcionando**

## 🔑 Credenciais Finais

- **Email**: `admin@jus.com`
- **Senha**: `admin123`
- **URL**: `https://webservice-5yg7.onrender.com/`

---

**🎉 Após seguir estes passos, o login funcionará perfeitamente!**
