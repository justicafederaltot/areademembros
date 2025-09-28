# Script PowerShell para testar as APIs de login
# Este script testa as rotas de debug e login da aplicação deployada

$baseUrl = "https://areademembros.onrender.com"

Write-Host "🔍 Testando APIs de login na versão deployada..." -ForegroundColor Green
Write-Host "🌐 URL base: $baseUrl" -ForegroundColor Cyan
Write-Host ""

# Função para fazer requisições HTTP
function Invoke-ApiRequest {
    param(
        [string]$Url,
        [string]$Method = "GET",
        [object]$Body = $null
    )
    
    try {
        $headers = @{
            "Content-Type" = "application/json"
            "User-Agent" = "Login-Test-Script/1.0"
        }
        
        if ($Body) {
            $jsonBody = $Body | ConvertTo-Json -Depth 10
            $response = Invoke-RestMethod -Uri $Url -Method $Method -Headers $headers -Body $jsonBody
        } else {
            $response = Invoke-RestMethod -Uri $Url -Method $Method -Headers $headers
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

# 1. Teste de diagnóstico completo
Write-Host "1️⃣ Executando diagnóstico completo..." -ForegroundColor Yellow
$diagnostic = Invoke-ApiRequest -Url "$baseUrl/api/debug/full-diagnostic"

if ($diagnostic.Success) {
    Write-Host "✅ Diagnóstico obtido com sucesso" -ForegroundColor Green
    Write-Host "📊 Ambiente: $($diagnostic.Data.environment.node_env)" -ForegroundColor Cyan
    Write-Host "🔗 Conexão com banco: $(if ($diagnostic.Data.database.connected) { '✅ OK' } else { '❌ FALHOU' })" -ForegroundColor $(if ($diagnostic.Data.database.connected) { 'Green' } else { 'Red' })
    Write-Host "👥 Total de usuários: $($diagnostic.Data.users.total)" -ForegroundColor Cyan
    Write-Host "👤 Admin existe: $(if ($diagnostic.Data.users.admin_exists) { '✅ SIM' } else { '❌ NÃO' })" -ForegroundColor $(if ($diagnostic.Data.users.admin_exists) { 'Green' } else { 'Red' })
    
    if ($diagnostic.Data.database.error) {
        Write-Host "❌ Erro do banco: $($diagnostic.Data.database.error)" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Falha no diagnóstico: $($diagnostic.Error)" -ForegroundColor Red
}

Write-Host ""

# 2. Verificar usuários
Write-Host "2️⃣ Verificando usuários..." -ForegroundColor Yellow
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

Write-Host ""

# 3. Criar usuário de teste
Write-Host "3️⃣ Criando usuário de teste..." -ForegroundColor Yellow
$createUser = Invoke-ApiRequest -Url "$baseUrl/api/debug/create-user" -Method "POST" -Body @{
    email = "teste@login.com"
    password = "teste123"
    name = "Usuário Teste"
}

if ($createUser.Success) {
    Write-Host "✅ Usuário de teste criado" -ForegroundColor Green
    Write-Host "📧 Email: $($createUser.Data.credentials.email)" -ForegroundColor Cyan
    Write-Host "🔑 Senha: $($createUser.Data.credentials.password)" -ForegroundColor Cyan
} else {
    Write-Host "❌ Falha ao criar usuário: $($createUser.Error)" -ForegroundColor Red
}

Write-Host ""

# 4. Testar autenticação
Write-Host "4️⃣ Testando autenticação..." -ForegroundColor Yellow
$authTest = Invoke-ApiRequest -Url "$baseUrl/api/debug/auth-test" -Method "POST" -Body @{
    email = "teste@login.com"
    password = "teste123"
}

if ($authTest.Success) {
    if ($authTest.Data.success) {
        Write-Host "✅ Autenticação bem-sucedida!" -ForegroundColor Green
        Write-Host "👤 Usuário: $($authTest.Data.user.email)" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Falha na autenticação: $($authTest.Data.message)" -ForegroundColor Red
        Write-Host "Passo: $($authTest.Data.step)" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Falha no teste de autenticação: $($authTest.Error)" -ForegroundColor Red
}

Write-Host ""

# 5. Testar login real
Write-Host "5️⃣ Testando login real..." -ForegroundColor Yellow
$realLogin = Invoke-ApiRequest -Url "$baseUrl/api/auth/login" -Method "POST" -Body @{
    email = "teste@login.com"
    password = "teste123"
}

if ($realLogin.Success) {
    Write-Host "✅ Login real bem-sucedido!" -ForegroundColor Green
    Write-Host "🎫 Token gerado: $(if ($realLogin.Data.token) { 'SIM' } else { 'NÃO' })" -ForegroundColor Cyan
    Write-Host "👤 Usuário: $($realLogin.Data.user.email)" -ForegroundColor Cyan
} else {
    Write-Host "❌ Falha no login real: $($realLogin.Error)" -ForegroundColor Red
}

Write-Host ""
Write-Host "📋 RESUMO:" -ForegroundColor Green
Write-Host "===========" -ForegroundColor Green
Write-Host "🔑 Credenciais para teste:" -ForegroundColor Yellow
Write-Host "   Email: teste@login.com" -ForegroundColor White
Write-Host "   Senha: teste123" -ForegroundColor White
Write-Host ""
Write-Host "🌐 URL de login:" -ForegroundColor Yellow
Write-Host "   $baseUrl/" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Se ainda não funcionar:" -ForegroundColor Yellow
Write-Host "   1. Verifique se o banco de dados está funcionando" -ForegroundColor White
Write-Host "   2. Verifique as variáveis de ambiente" -ForegroundColor White
Write-Host "   3. Teste as rotas de debug manualmente" -ForegroundColor White


