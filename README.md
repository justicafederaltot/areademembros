# Área de Membros - Destrava Academy

Sistema completo de área de membros com cursos e aulas, desenvolvido com Next.js, TypeScript e PostgreSQL.

## 🚀 Funcionalidades

### Página Principal
- Layout moderno e sofisticado baseado nas imagens de referência
- Banner principal com mensagem de boas-vindas
- Seções de cursos organizadas por categoria
- Cards de cursos com imagens, títulos e descrições
- Navegação responsiva

### Página de Aulas
- Player de vídeo do YouTube integrado
- Lista lateral de aulas com status de conclusão
- Navegação entre aulas sem recarregar a página
- Marcação automática de aulas como concluídas
- Layout baseado na imagem de referência

### Painel Administrativo
- Cadastro e edição de cursos
- Cadastro e edição de aulas com links do YouTube
- Salvamento automático no banco de dados
- Interface intuitiva para administradores

### Sistema de Autenticação
- Login seguro com JWT
- Controle de acesso por roles (admin/member)
- Proteção de rotas
- Persistência de sessão

## 🛠️ Tecnologias Utilizadas

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Next.js API Routes
- **Banco de Dados**: PostgreSQL (Render)
- **Autenticação**: JWT, bcryptjs
- **Ícones**: Lucide React
- **Deploy**: Render

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Conta no Render (para banco PostgreSQL)

## 🔧 Instalação

### Opção 1: Setup Automático (Recomendado)

**Linux/Mac:**
```bash
git clone <url-do-repositorio>
cd area-de-membros
chmod +x scripts/setup.sh
./scripts/setup.sh
```

**Windows:**
```bash
git clone <url-do-repositorio>
cd area-de-membros
scripts\setup.bat
```

### Opção 2: Setup Manual

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd area-de-membros
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
Crie um arquivo `.env.local` na raiz do projeto:
```env
JWT_SECRET=sua-chave-secreta-aqui
DATABASE_URL=postgresql://banco_de_dados_vuva_user:LHQJEKNnL3xqOP0YVBLewsO7iLwyBDUV@dpg-d2f3skmmcj7s73893m80-a.oregon-postgres.render.com/banco_de_dados_vuva
```

4. **Inicialize o banco de dados**
```bash
npx tsx scripts/init-db.ts
```

5. **Execute o projeto em desenvolvimento**
```bash
npm run dev
```

O projeto estará disponível em `http://localhost:3000`

## 👤 Credenciais de Acesso

Após executar o script de inicialização, você terá acesso com:

**Administrador:**
- Email: `admin@destrava.com`
- Senha: `admin123`

## 📱 Como Usar

### Para Administradores

1. **Acesse o painel administrativo**
   - Faça login com as credenciais de admin
   - Clique em "Admin" no header

2. **Cadastre cursos**
   - Vá para a aba "Cursos"
   - Preencha título, descrição, URL da imagem e categoria
   - Clique em "Salvar Curso"

3. **Cadastre aulas**
   - Vá para a aba "Aulas"
   - Selecione um curso
   - Preencha título, descrição, URL do vídeo do YouTube e ordem
   - Clique em "Salvar Aula"

### Para Membros

1. **Acesse a área de membros**
   - Faça login com suas credenciais
   - Visualize os cursos disponíveis

2. **Assista às aulas**
   - Clique em um curso para ver suas aulas
   - Selecione uma aula na lista lateral
   - O vídeo será carregado automaticamente
   - As aulas são marcadas como concluídas automaticamente

## 🗄️ Estrutura do Banco de Dados

### Tabelas

- **users**: Usuários do sistema (admin/member)
- **courses**: Cursos disponíveis
- **lessons**: Aulas de cada curso
- **user_progress**: Progresso dos usuários nas aulas

### Relacionamentos

- Um curso pode ter várias aulas
- Um usuário pode ter progresso em várias aulas
- Cada aula pertence a um curso específico

## 🚀 Deploy no Render

### Opção 1: Deploy Automático (Recomendado)

1. **Conecte seu repositório ao Render**
   - Acesse [render.com](https://render.com)
   - Clique em "New" > "Web Service"
   - Conecte seu repositório GitHub/GitLab

2. **Configure o serviço**
   - **Name**: `area-de-membros`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: `Free`

3. **Configure as variáveis de ambiente**
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: Gere uma chave secreta segura
   - `DATABASE_URL`: URL do seu banco PostgreSQL

4. **Deploy**
   - Clique em "Create Web Service"
   - O Render fará o deploy automaticamente

### Opção 2: Deploy Manual

1. **Crie um banco PostgreSQL no Render**
   - Acesse [render.com](https://render.com)
   - Clique em "New" > "PostgreSQL"
   - Configure o banco e copie a URL de conexão

2. **Configure as variáveis de ambiente**
   - `JWT_SECRET`: Chave secreta para JWT
   - `DATABASE_URL`: URL do banco PostgreSQL

3. **Deploy**
   - Use os comandos de build e start padrão do Next.js

## 📁 Estrutura do Projeto

```
areademembros/
├── app/
│   ├── api/                 # APIs do backend
│   ├── admin/              # Página administrativa
│   ├── course/             # Página de aulas
│   ├── globals.css         # Estilos globais
│   ├── layout.tsx          # Layout principal
│   └── page.tsx            # Página inicial
├── components/             # Componentes React
├── lib/                    # Configurações (banco, etc.)
├── scripts/                # Scripts de inicialização
├── types/                  # Tipos TypeScript
└── README.md
```

## 🔒 Segurança

- Autenticação JWT
- Senhas criptografadas com bcrypt
- Proteção de rotas por role
- Validação de dados nas APIs
- Conexão SSL com o banco PostgreSQL

## 📱 Responsividade

O sistema é totalmente responsivo e funciona em:
- Desktop
- Tablet
- Mobile

## 🎨 Design

- Tema escuro moderno
- Cores baseadas na identidade visual da Destrava
- Interface limpa e profissional
- Animações suaves
- Ícones consistentes

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

## 📞 Suporte

Para dúvidas ou suporte, entre em contato através dos canais oficiais da Destrava Academy.
