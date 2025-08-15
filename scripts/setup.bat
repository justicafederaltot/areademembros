@echo off
echo 🚀 Configurando Área de Membros - Destrava Academy
echo ==================================================

REM Verificar se o Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js não encontrado. Por favor, instale o Node.js 18+ primeiro.
    pause
    exit /b 1
)

echo ✅ Node.js encontrado
node --version

REM Verificar se o npm está instalado
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm não encontrado. Por favor, instale o npm primeiro.
    pause
    exit /b 1
)

echo ✅ npm encontrado
npm --version

REM Instalar dependências
echo 📦 Instalando dependências...
npm install

REM Criar arquivo .env.local se não existir
if not exist .env.local (
    echo 🔧 Criando arquivo .env.local...
    (
        echo # Chave secreta para JWT ^(gere uma chave segura^)
        echo JWT_SECRET=sua-chave-secreta-muito-segura-aqui
        echo.
        echo # URL do banco PostgreSQL da Render
        echo DATABASE_URL=postgresql://banco_de_dados_vuva_user:LHQJEKNnL3xqOP0YVBLewsO7iLwyBDUV@dpg-d2f3skmmcj7s73893m80-a.oregon-postgres.render.com/banco_de_dados_vuva
    ) > .env.local
    echo ✅ Arquivo .env.local criado
) else (
    echo ✅ Arquivo .env.local já existe
)

REM Inicializar banco de dados
echo 🗄️ Inicializando banco de dados...
npx tsx scripts/init-db.ts

echo.
echo 🎉 Configuração concluída!
echo.
echo 📋 Próximos passos:
echo 1. Execute: npm run dev
echo 2. Acesse: http://localhost:3000
echo 3. Faça login com: admin@destrava.com / admin123
echo.
echo 🔧 Para personalizar:
echo - Edite o arquivo .env.local com suas configurações
echo - Modifique os dados de exemplo no script scripts/init-db.ts
echo.
echo 📚 Documentação completa no README.md
pause
