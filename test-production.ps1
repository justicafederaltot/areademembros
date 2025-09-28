# Script PowerShell para testar a aplicação em produção
# Este script testa todas as rotas necessárias para o login

$baseUrl = "https://areademembros.onrender.com"

Write-Host "🔍 Testando aplicação em produção..." -ForegroundColor Green
Write-Host "🌐 URL: $baseUrl" -ForegroundColor Cyan
Write-Host ""

# Função para fazer requisições HTTP
function Invoke-ApiRequest {
    param(
        [string]$Url,
        [string]$Method = "GET",
        [object]$Body = $null,
        [hashtable]$Headers = @{}
    )
    
    try {
        $defaultHeaders = @{
            "Content-Type" = "application/json"
            "User-Agent" = "Production-Test-Script/1.0"
        }
        
        $allHeaders = $defaultHeaders + $Headers
        
        if ($Body) {
            $jsonBody = $Body | ConvertTo-Json -Depth 10
            $response = Invoke-RestMethod -Uri $Url -Method $Method -Headers $allHeaders -Body $jsonBody
        } else {
            $response = Invoke-RestMethod -Uri $Url -Method $Method -Headers $allHeaders
        }
        
        return @{
            Success = $true
            Data = $response
        }
    }
    catch {
        return @{
            Success = $false
            Error = $_.Exception.Message
            StatusCode = $_.Exception.Response.StatusCode.value__
        }
    }
}

# 1. Teste básico de conectividade
Write-Host "1️⃣ Testando conectividade básica..." -ForegroundColor Yellow
$basicTest = Invoke-ApiRequest -Url $baseUrl

if ($basicTest.Success) {
    Write-Host "✅ Aplicação está respondendo" -ForegroundColor Green
} else {
    Write-Host "❌ Aplicação não está respondendo: $($basicTest.Error)" -ForegroundColor Red
    Write-Host "🔧 SOLUÇÕES:" -ForegroundColor Yellow
    Write-Host "1. Verifique se a aplicação está rodando na Render" -ForegroundColor White
    Write-Host "2. Aguarde alguns minutos para o deploy ser concluído" -ForegroundColor White
    Write-Host "3. Verifique os logs da Render no painel de administração" -ForegroundColor White
    Write-Host "4. Verifique se o domínio está correto" -ForegroundColor White
    return
}

# 2. Teste de status do banco
Write-Host "`n2️⃣ Verificando status do banco de dados..." -ForegroundColor Yellow
$dbStatus = Invoke-ApiRequest -Url "$baseUrl/api/init-database"

if ($dbStatus.Success) {
    Write-Host "✅ Rota de status funcionando" -ForegroundColor Green
    Write-Host "📊 Status: $($dbStatus.Data.status)" -ForegroundColor Cyan
    Write-Host "🔗 Banco conectado: $(if ($dbStatus.Data.database_connected) { '✅ SIM' } else { '❌ NÃO' })" -ForegroundColor $(if ($dbStatus.Data.database_connected) { 'Green' } else { 'Red' })
} else {
    Write-Host "❌ Rota de status falhou: $($dbStatus.Error)" -ForegroundColor Red
}

# 3. Diagnóstico completo
Write-Host "`n3️⃣ Executando diagnóstico completo..." -ForegroundColor Yellow
$diagnostic = Invoke-ApiRequest -Url "$baseUrl/api/debug/full-diagnostic"

if ($diagnostic.Success) {
    Write-Host "✅ Diagnóstico obtido" -ForegroundColor Green
    Write-Host "🔗 Conexão com banco: $(if ($diagnostic.Data.database.connected) { '✅ OK' } else { '❌ FALHOU' })" -ForegroundColor $(if ($diagnostic.Data.database.connected) { 'Green' } else { 'Red' })
    Write-Host "👥 Total de usuários: $($diagnostic.Data.users.total)" -ForegroundColor Cyan
    Write-Host "👤 Admin existe: $(if ($diagnostic.Data.users.admin_exists) { '✅ SIM' } else { '❌ NÃO' })" -ForegroundColor $(if ($diagnostic.Data.users.admin_exists) { 'Green' } else { 'Red' })
    
    if ($diagnostic.Data.database.error) {
        Write-Host "❌ Erro do banco: $($diagnostic.Data.database.error)" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Falha no diagnóstico: $($diagnostic.Error)" -ForegroundColor Red
}

# 4. Verificar usuários
Write-Host "`n4️⃣ Verificando usuários..." -ForegroundColor Yellow
$users = Invoke-ApiRequest -Url "$baseUrl/api/debug/users"

if ($users.Success) {
    Write-Host "✅ Usuários encontrados: $($users.Data.total_users)" -ForegroundColor Green
    
    if ($users.Data.users -and $users.Data.users.Count -gt 0) {
        Write-Host "👥 Lista de usuários:" -ForegroundColor Cyan
        for ($i = 0; $i -lt $users.Data.users.Count; $i++) {
            $user = $users.Data.users[$i]
            Write-Host "   $($i + 1). $($user.email) ($($user.name)) - $($user.role)" -ForegroundColor White
        }
    } else {
        Write-Host "❌ Nenhum usuário encontrado!" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Falha ao obter usuários: $($users.Error)" -ForegroundColor Red
}

# 5. Tentar inicializar banco se necessário
if (-not $diagnostic.Success -or -not $diagnostic.Data.database.connected -or $users.Data.total_users -eq 0) {
    Write-Host "`n5️⃣ Tentando inicializar banco de dados..." -ForegroundColor Yellow
    $initResult = Invoke-ApiRequest -Url "$baseUrl/api/init-database" -Method "POST" -Headers @{
        "Authorization" = "Bearer init-secret-token-2024"
    }
    
    if ($initResult.Success) {
        Write-Host "✅ Banco de dados inicializado!" -ForegroundColor Green
        Write-Host "📧 Email admin: $($initResult.Data.credentials.email)" -ForegroundColor Cyan
        Write-Host "🔑 Senha admin: $($initResult.Data.credentials.password)" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Falha ao inicializar banco: $($initResult.Error)" -ForegroundColor Red
        if ($initResult.StatusCode -eq 401) {
            Write-Host "🔧 Token de autorização inválido" -ForegroundColor Yellow
            Write-Host "Verifique se a variável INIT_TOKEN está configurada na Render" -ForegroundColor White
        }
    }
}

# 6. Testar login
Write-Host "`n6️⃣ Testando login..." -ForegroundColor Yellow
$loginTest = Invoke-ApiRequest -Url "$baseUrl/api/auth/login" -Method "POST" -Body @{
    email = "admin@jus.com"
    password = "admin123"
}

if ($loginTest.Success) {
    Write-Host "✅ Login funcionando!" -ForegroundColor Green
    Write-Host "🎫 Token gerado: $(if ($loginTest.Data.token) { 'SIM' } else { 'NÃO' })" -ForegroundColor Cyan
    Write-Host "👤 Usuário: $($loginTest.Data.user.email)" -ForegroundColor Cyan
} else {
    Write-Host "❌ Falha no login: $($loginTest.Error)" -ForegroundColor Red
    Write-Host "Resposta: $($loginTest.Data | ConvertTo-Json)" -ForegroundColor Yellow
}

# Resumo final
Write-Host "`n📋 RESUMO:" -ForegroundColor Green
Write-Host "===========" -ForegroundColor Green
Write-Host "🔑 Credenciais para login:" -ForegroundColor Yellow
Write-Host "   Email: admin@jus.com" -ForegroundColor White
Write-Host "   Senha: admin123" -ForegroundColor White
Write-Host ""
Write-Host "🌐 URL de login:" -ForegroundColor Yellow
Write-Host "   $baseUrl/" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Se ainda não funcionar:" -ForegroundColor Yellow
Write-Host "1. Verifique se a aplicação está rodando na Render" -ForegroundColor White
Write-Host "2. Verifique as variáveis de ambiente na Render" -ForegroundColor White
Write-Host "3. Execute o script de inicialização do banco" -ForegroundColor White
Write-Host "4. Aguarde alguns minutos para estabilização" -ForegroundColor White

