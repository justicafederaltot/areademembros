@echo off
echo Testando exclusão de aulas...
echo.

echo 1. Listando aulas do curso 1:
powershell -Command "try { $response = Invoke-RestMethod -Uri 'http://localhost:3000/api/courses/1/lessons' -Method GET; Write-Host 'SUCCESS: Aulas encontradas:' $response.Count -ForegroundColor Green; foreach($lesson in $response) { Write-Host '  -' $lesson.title '(ID:' $lesson.id ')' } } catch { Write-Host 'ERROR:' $_.Exception.Message -ForegroundColor Red }"

echo.
echo 2. Testando exclusão de uma aula (ID 6):
powershell -Command "try { $response = Invoke-RestMethod -Uri 'http://localhost:3000/api/lessons/6' -Method DELETE; Write-Host 'SUCCESS: Aula excluída com sucesso!' -ForegroundColor Green; Write-Host 'Mensagem:' $response.message } catch { Write-Host 'ERROR:' $_.Exception.Message -ForegroundColor Red }"

echo.
echo 3. Verificando se a aula foi excluída:
powershell -Command "try { $response = Invoke-RestMethod -Uri 'http://localhost:3000/api/courses/1/lessons' -Method GET; Write-Host 'SUCCESS: Aulas restantes:' $response.Count -ForegroundColor Green; foreach($lesson in $response) { Write-Host '  -' $lesson.title '(ID:' $lesson.id ')' } } catch { Write-Host 'ERROR:' $_.Exception.Message -ForegroundColor Red }"

echo.
echo Teste concluido.
pause

