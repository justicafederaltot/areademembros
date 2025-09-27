@echo off
echo Testando login final...
echo.
echo Fazendo login com admin@jus.com / admin123
echo.

powershell -Command "try { $body = @{ email = 'admin@jus.com'; password = 'admin123' } | ConvertTo-Json; $response = Invoke-RestMethod -Uri 'http://localhost:3000/api/auth/login' -Method POST -ContentType 'application/json' -Body $body; Write-Host 'SUCCESS: Login funcionou!' -ForegroundColor Green; Write-Host 'Token:' $response.token; Write-Host 'Usuario:' $response.user.email } catch { Write-Host 'ERROR:' $_.Exception.Message -ForegroundColor Red }"

echo.
echo Teste concluido.
pause

