@echo off
echo Testando acesso às aulas...
echo.

echo 1. Testando listagem de cursos:
powershell -Command "try { $response = Invoke-RestMethod -Uri 'http://localhost:3000/api/courses' -Method GET; Write-Host 'SUCCESS: Cursos encontrados:' $response.Count -ForegroundColor Green; foreach($course in $response) { Write-Host '  -' $course.title '(ID:' $course.id ')' } } catch { Write-Host 'ERROR:' $_.Exception.Message -ForegroundColor Red }"

echo.
echo 2. Testando aulas do curso 1:
powershell -Command "try { $response = Invoke-RestMethod -Uri 'http://localhost:3000/api/courses/1/lessons' -Method GET; Write-Host 'SUCCESS: Aulas encontradas:' $response.Count -ForegroundColor Green; foreach($lesson in $response) { Write-Host '  -' $lesson.title '(ID:' $lesson.id ')' } } catch { Write-Host 'ERROR:' $_.Exception.Message -ForegroundColor Red }"

echo.
echo 3. Testando detalhes do curso 1:
powershell -Command "try { $response = Invoke-RestMethod -Uri 'http://localhost:3000/api/courses/1' -Method GET; Write-Host 'SUCCESS: Curso encontrado:' $response.title -ForegroundColor Green; Write-Host 'Aulas:' $response.lessons.Count } catch { Write-Host 'ERROR:' $_.Exception.Message -ForegroundColor Red }"

echo.
echo Teste concluido.
pause

