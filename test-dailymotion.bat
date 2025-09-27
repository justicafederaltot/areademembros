@echo off
echo Testando suporte ao Dailymotion...
echo.

echo Testando URL do YouTube:
powershell -Command "try { $body = @{ title = 'Aula Teste YouTube'; description = 'Teste YouTube'; video_url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'; order_index = 1 } | ConvertTo-Json; $response = Invoke-RestMethod -Uri 'http://localhost:3000/api/courses/1/lessons' -Method POST -ContentType 'application/json' -Body $body; Write-Host 'SUCCESS: Aula YouTube criada!' -ForegroundColor Green; Write-Host 'ID:' $response.id } catch { Write-Host 'ERROR YouTube:' $_.Exception.Message -ForegroundColor Red }"

echo.
echo Testando URL do Dailymotion:
powershell -Command "try { $body = @{ title = 'Aula Teste Dailymotion'; description = 'Teste Dailymotion'; video_url = 'https://www.dailymotion.com/video/x8j8j8j'; order_index = 2 } | ConvertTo-Json; $response = Invoke-RestMethod -Uri 'http://localhost:3000/api/courses/1/lessons' -Method POST -ContentType 'application/json' -Body $body; Write-Host 'SUCCESS: Aula Dailymotion criada!' -ForegroundColor Green; Write-Host 'ID:' $response.id } catch { Write-Host 'ERROR Dailymotion:' $_.Exception.Message -ForegroundColor Red }"

echo.
echo Teste concluido.
pause

