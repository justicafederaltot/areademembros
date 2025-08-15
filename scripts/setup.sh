#!/bin/bash

echo "🚀 Configurando Área de Membros - Destrava Academy"
echo "=================================================="

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale o Node.js 18+ primeiro."
    exit 1
fi

echo "✅ Node.js encontrado: $(node --version)"

# Verificar se o npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm não encontrado. Por favor, instale o npm primeiro."
    exit 1
fi

echo "✅ npm encontrado: $(npm --version)"

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Criar arquivo .env.local se não existir
if [ ! -f .env.local ]; then
    echo "🔧 Criando arquivo .env.local..."
    cat > .env.local << EOF
# Chave secreta para JWT (gere uma chave segura)
JWT_SECRET=sua-chave-secreta-muito-segura-aqui

# URL do banco PostgreSQL da Render
DATABASE_URL=postgresql://banco_de_dados_vuva_user:LHQJEKNnL3xqOP0YVBLewsO7iLwyBDUV@dpg-d2f3skmmcj7s73893m80-a.oregon-postgres.render.com/banco_de_dados_vuva
EOF
    echo "✅ Arquivo .env.local criado"
else
    echo "✅ Arquivo .env.local já existe"
fi

# Inicializar banco de dados
echo "🗄️ Inicializando banco de dados..."
npx tsx scripts/init-db.ts

echo ""
echo "🎉 Configuração concluída!"
echo ""
echo "📋 Próximos passos:"
echo "1. Execute: npm run dev"
echo "2. Acesse: http://localhost:3000"
echo "3. Faça login com: admin@destrava.com / admin123"
echo ""
echo "🔧 Para personalizar:"
echo "- Edite o arquivo .env.local com suas configurações"
echo "- Modifique os dados de exemplo no script scripts/init-db.ts"
echo ""
echo "📚 Documentação completa no README.md"
