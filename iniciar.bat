@echo off
cd /d "%~dp0"

echo ==========================================
echo   EducaPlay - iniciando...
echo ==========================================
echo.

node --version >nul 2>&1
if errorlevel 1 (
  echo O Node.js nao foi encontrado neste computador.
  echo Instale a versao 22.13 ou mais nova em https://nodejs.org
  echo e abra este arquivo de novo.
  echo.
  pause
  exit /b
)

if not exist node_modules (
  echo Primeira vez: instalando tudo. Pode demorar alguns minutos...
  echo.
  call npm install
  echo.
)

echo Ligando o backend e o site...
echo O navegador vai abrir sozinho em cerca de 30 segundos.
echo Para desligar tudo, feche esta janela ou aperte Ctrl + C.
echo.

start "" /min cmd /c "timeout /t 30 /nobreak >nul & start http://localhost:4200"
call npm start

pause