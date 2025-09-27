@echo off
echo Testando URL encurtada do Dailymotion...
echo.

echo Testando URL: https://dai.ly/k3rgzeNoxUsal9DToSs
powershell -Command "try { $body = @{ title = 'Aula Teste Dailymotion Short'; description = 'Teste URL encurtada'; video_url = 'https://dai.ly/k3rgzeNoxUsal9DToSs'; order_index = 3 } | ConvertTo-Json; $response = Invoke-RestMethod -Uri 'http://localhost:3000/api/courses/1/lessons' -Method POST -ContentType 'application/json' -Body $body; Write-Host 'SUCCESS: Aula Dailymotion Short criada!' -ForegroundColor Green; Write-Host 'ID:' $response.id; Write-Host 'URL:' $response.video_url } catch { Write-Host 'ERROR:' $_.Exception.Message -ForegroundColor Red }"

echo.
echo Teste concluido.
pause

