# 🚀 Instruções para Deploy na Render

## 📋 Passo a Passo para Deploy

### 1. **Configurar Variáveis de Ambiente na Render**

No painel da Render, vá em **Environment** e adicione as seguintes variáveis:

```env
# Chave secreta para JWT (use uma chave segura)
JWT_SECRET=sua-chave-secreta-muito-segura-aqui-2024

# URL do banco PostgreSQL da Render
DATABASE_URL=postgresql://banco_de_dados_ahwt_user:HmFYomHKqCBRvPCz0i2bWpedhKCiTaTz@dpg-d3c58d37mgec73a82gp0-a.oregon-postgres.render.com/banco_de_dados_ahwt

# Token para inicialização do banco de dados (use uma chave segura)
INIT_TOKEN=init-secret-token-2024

# Ambiente
NODE_ENV=production
```

### 2. **Fazer Deploy**

1. Conecte o repositório GitHub na Render
2. Configure o **Build Command**: `npm install && npm run build`
3. Configure o **Start Command**: `npm start`
4. Faça o deploy

### 3. **Inicializar Banco de Dados**

Após o deploy ser concluído, execute um dos comandos abaixo:

#### Opção A: Via Script (Recomendado)
```bash
# Substitua pela URL real do seu deploy
npm run init-production https://sua-aplicacao.onrender.com
```

#### Opção B: Via cURL
```bash
curl -X POST https://sua-aplicacao.onrender.com/api/init-database \
  -H "Authorization: Bearer init-secret-token-2024" \
  -H "Content-Type: application/json"
```

#### Opção C: Via Browser (GET - apenas status)
```
https://sua-aplicacao.onrender.com/api/init-database
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

### 5. **Fazer Login**

Use as credenciais:
- **Email**: `admin@jus.com`
- **Senha**: `admin123`

## 🔧 Solução de Problemas

### Erro: "Email ou senha incorretos"
- ✅ **Causa**: Banco de dados não foi inicializado
- ✅ **Solução**: Execute o script de inicialização

### Erro: "Token de autorização inválido"
- ✅ **Causa**: Token `INIT_TOKEN` não configurado ou incorreto
- ✅ **Solução**: Verifique se a variável `INIT_TOKEN` está configurada na Render

### Erro: "Erro ao conectar ao banco"
- ✅ **Causa**: URL do banco incorreta ou banco não acessível
- ✅ **Solução**: Verifique se a variável `DATABASE_URL` está configurada corretamente

### Erro: "Aplicação não responde"
- ✅ **Causa**: Deploy ainda não foi concluído
- ✅ **Solução**: Aguarde alguns minutos e tente novamente

## 📞 Suporte

Se ainda tiver problemas:

1. **Verifique os logs da Render** no painel de administração
2. **Teste a rota de status**: `GET /api/init-database`
3. **Verifique as variáveis de ambiente** estão configuradas
4. **Aguarde alguns minutos** após o deploy para estabilização

## 🎯 Comandos Úteis

```bash
# Verificar status da aplicação
curl https://sua-aplicacao.onrender.com/api/init-database

# Inicializar banco de dados
curl -X POST https://sua-aplicacao.onrender.com/api/init-database \
  -H "Authorization: Bearer init-secret-token-2024"

# Verificar se a aplicação está rodando
curl https://sua-aplicacao.onrender.com
```

---

**🎉 Após seguir estes passos, sua aplicação estará funcionando perfeitamente!**
