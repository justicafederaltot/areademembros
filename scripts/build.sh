#!/bin/bash

echo "🚀 Iniciando build para produção..."

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Verificar se as variáveis de ambiente estão configuradas
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  DATABASE_URL não está configurada"
    exit 1
fi

if [ -z "$JWT_SECRET" ]; then
    echo "⚠️  JWT_SECRET não está configurada"
    exit 1
fi

# Inicializar banco de dados
echo "🗄️  Inicializando banco de dados..."
npx tsx scripts/init-db.ts

# Build do projeto
echo "🔨 Fazendo build do projeto..."
npm run build

echo "✅ Build concluído com sucesso!"
