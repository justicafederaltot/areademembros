# 🐘 Configuração PostgreSQL - Área de Membros

Este projeto foi configurado para usar PostgreSQL como banco de dados, garantindo que todas as alterações sejam salvas permanentemente no banco da Render.

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Acesso ao banco PostgreSQL da Render
- Variáveis de ambiente configuradas

## 🚀 Configuração Inicial

### 1. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com:

```bash
# Chave secreta para JWT (gere uma chave segura)
JWT_SECRET=sua-chave-secreta-muito-segura-aqui

# URL do banco PostgreSQL da Render
DATABASE_URL=postgresql://banco_de_dados_ahwt_user:HmFYomHKqCBRvPCz0i2bWpedhKCiTaTz@dpg-d3c58d37mgec73a82gp0-a.oregon-postgres.render.com/banco_de_dados_ahwt

# Ambiente (development/production)
NODE_ENV=production
```

### 2. Instalar Dependências

```bash
npm install
```

### 3. Inicializar Banco de Dados

```bash
npm run init-postgres
```

Este comando irá:
- ✅ Testar a conexão com PostgreSQL
- ✅ Criar todas as tabelas necessárias
- ✅ Criar usuário admin padrão
- ✅ Inserir dados de exemplo

### 4. Executar o Projeto

```bash
npm run dev
```

## 🔑 Credenciais Padrão

Após a inicialização, você pode fazer login com:

- **Email**: `admin@jus.com`
- **Senha**: `admin123`

## 📊 Estrutura do Banco

### Tabelas Criadas:

1. **users** - Usuários do sistema
2. **courses** - Cursos disponíveis
3. **lessons** - Aulas dos cursos
4. **user_progress** - Progresso dos usuários
5. **uploaded_images** - Imagens enviadas
6. **lesson_attachments** - Anexos das aulas

## 🔧 Funcionalidades

### ✅ Implementado:
- [x] Autenticação JWT
- [x] CRUD de cursos e aulas
- [x] Sistema de progresso
- [x] Upload de imagens (salvas no banco)
- [x] Upload de anexos (salvos no banco)
- [x] Interface responsiva
- [x] Sistema de permissões (admin/member)

### 📱 Responsividade:
- [x] Layout mobile otimizado
- [x] Menu hambúrguer
- [x] Cards responsivos
- [x] Vídeo player adaptativo

## 🚀 Deploy na Render

### Variáveis de Ambiente na Render:

1. Acesse seu projeto na Render
2. Vá em **Environment**
3. Adicione as variáveis:

```
DATABASE_URL=postgresql://banco_de_dados_ahwt_user:HmFYomHKqCBRvPCz0i2bWpedhKCiTaTz@dpg-d3c58d37mgec73a82gp0-a.oregon-postgres.render.com/banco_de_dados_ahwt
JWT_SECRET=sua-chave-secreta-muito-segura-aqui
NODE_ENV=production
```

### Build Commands:

```
Build Command: npm run build
Start Command: npm start
```

## 🐛 Troubleshooting

### Erro de Conexão:
- Verifique se a `DATABASE_URL` está correta
- Confirme se o banco PostgreSQL está ativo na Render
- Teste a conexão: `npm run init-postgres`

### Erro de Permissão:
- Verifique se o usuário tem permissão para criar tabelas
- Confirme se o banco aceita conexões SSL

### Erro de Dependências:
```bash
npm install --legacy-peer-deps
```

## 📞 Suporte

Em caso de problemas:
1. Verifique os logs do console
2. Confirme as variáveis de ambiente
3. Teste a conexão com o banco
4. Verifique se todas as dependências estão instaladas

## 🎯 Próximos Passos

Após a configuração:
1. Faça login como admin
2. Crie seus cursos e aulas
3. Configure as imagens e anexos
4. Teste todas as funcionalidades
5. Faça o deploy na Render

---

**✅ Projeto configurado com PostgreSQL - Todas as alterações serão salvas permanentemente no banco!**
