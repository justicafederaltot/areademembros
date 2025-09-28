# 🚀 Guia para Upload das Atualizações para GitHub

## 📋 Arquivos Atualizados

Durante a sessão de resolução do problema de login, foram criados/atualizados os seguintes arquivos:

### ✅ Arquivos Corrigidos
1. **`render.yaml`** - Configuração corrigida do deploy na Render com URL do banco atualizada
2. **`scripts/init-production-db.js`** - Script para inicializar banco em produção  
3. **`scripts/diagnose-production.js`** - Script de diagnóstico completo
4. **`fix-database-connection.js`** - Script para corrigir conexão com banco
5. **`test-connection.js`** - Script para testar conectividade
6. **`resolver-login.js`** - Script para resolver problemas de login
7. **`test-production.ps1`** - Script PowerShell para testes
8. **`test-api.ps1`** - Script PowerShell para testar APIs
9. **`test-login.js`** - Script simples de teste de login
10. **`SOLUCAO-LOGIN.md`** - Guia completo de solução de problemas
11. **`UPLOAD-GITHUB.md`** - Este guia

## 🔧 Principal Correção

### `render.yaml` - Configuração Corrigida
```yaml
services:
  - type: web
    name: area-de-membros
    env: node
    plan: free
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: JWT_SECRET
        generateValue: true
      - key: DATABASE_URL
        value: postgresql://banco_de_dados_ahwt_user:HmFYomHKqCBRvPCz0i2bWpedhKCiTaTz@dpg-d3c58d37mgec73a82gp0-a.oregon-postgres.render.com/banco_de_dados_ahwt
      - key: INIT_TOKEN
        value: init-secret-token-2024
    healthCheckPath: /
```

## 📂 Como Fazer o Upload

### Opção 1: Via GitHub Desktop (Mais Fácil)

1. **Abra o GitHub Desktop**
2. **Navegue para o projeto**:
   - File > Add Local Repository
   - Selecione: `C:\Users\Edilson\Documents\JUSTIÇA FEDERAL\AREA DE MEMBROS\areademembros`
3. **Conecte ao repositório remoto**:
   - Repository > Repository Settings
   - Remote: `https://github.com/justicafederaltot/areademembros.git`
4. **Faça o commit**:
   - Adicione uma mensagem: "Correção de problemas de login e configuração do banco de dados"
   - Clique em "Commit to main"
5. **Faça o push**:
   - Clique em "Push origin"

### Opção 2: Via Linha de Comando (Git Bash)

1. **Abra o Git Bash no diretório do projeto**
2. **Execute os comandos**:
```bash
# Inicializar repositório (se necessário)
git init

# Conectar ao repositório remoto
git remote add origin https://github.com/justicafederaltot/areademembros.git

# Adicionar todos os arquivos
git add .

# Fazer commit
git commit -m "Correção de problemas de login e configuração do banco de dados

- Corrigida URL do banco de dados no render.yaml
- Adicionados scripts de diagnóstico e resolução de problemas
- Criado guia completo de solução de problemas de login
- Corrigida configuração de variáveis de ambiente"

# Fazer push
git push -u origin main
```

### Opção 3: Via Visual Studio Code

1. **Abra o VS Code no diretório do projeto**
2. **Vá para a aba Source Control (Ctrl+Shift+G)**
3. **Inicialize o repositório Git**:
   - Clique em "Initialize Repository"
4. **Conecte ao repositório remoto**:
   - Terminal > New Terminal
   - Digite: `git remote add origin https://github.com/justicafederaltot/areademembros.git`
5. **Faça o commit**:
   - Adicione uma mensagem: "Correção de problemas de login e configuração do banco de dados"
   - Clique em "✓" (Commit)
6. **Faça o push**:
   - Clique em "..." > "Push"

## 🎯 Resumo das Mudanças

### 🔧 Problema Resolvido
- **Erro**: "Connection failed" no login da versão deployada
- **Causa**: URL incorreta do banco de dados no `render.yaml`
- **Solução**: Atualizada URL do banco PostgreSQL

### 📝 Arquivos Principais Modificados
1. **`render.yaml`**: URL do banco corrigida
2. **Scripts**: Adicionados scripts de diagnóstico e resolução
3. **Documentação**: Criado guia completo de solução

### 🚀 Próximos Passos Após Upload
1. **Fazer redeploy na Render**:
   - A Render detectará as mudanças automaticamente
   - Aguardar conclusão do deploy
2. **Inicializar banco de dados**:
   - Acessar: `https://areademembros.onrender.com/api/init-database`
   - Usar token: `init-secret-token-2024`
3. **Testar login**:
   - Email: `admin@jus.com`
   - Senha: `admin123`

## 🔗 Links Úteis

- **Repositório**: https://github.com/justicafederaltot/areademembros
- **Deploy Render**: https://areademembros.onrender.com
- **Documentação**: SOLUCAO-LOGIN.md

## 📞 Suporte

Se tiver dificuldades:
1. Use o GitHub Desktop (mais fácil)
2. Verifique se está no diretório correto do projeto
3. Certifique-se de ter permissões no repositório
4. Em caso de erro, use o Git Bash ou VS Code

---

**🎉 Após o upload, o problema de login na versão deployada será resolvido!**
