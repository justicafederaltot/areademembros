@echo off
echo Testando salvamento de curso...
echo.

powershell -Command "try { $body = @{ title = 'Curso Teste'; description = 'Descrição do curso teste'; category = 'jef'; image_url = '/images/banner/BANNER1.png' } | ConvertTo-Json; $response = Invoke-RestMethod -Uri 'http://localhost:3000/api/courses' -Method POST -ContentType 'application/json' -Body $body; Write-Host 'SUCCESS: Curso salvo com sucesso!' -ForegroundColor Green; Write-Host 'ID:' $response.id; Write-Host 'Titulo:' $response.title } catch { Write-Host 'ERROR:' $_.Exception.Message -ForegroundColor Red }"

echo.
echo Teste concluido.
pause

