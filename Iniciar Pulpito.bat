@echo off
title Pulpito - Servidor de Pregacao
echo.
echo   Iniciando servidor Pulpito...
echo   Abra o navegador em: http://localhost:3000
echo.
start "" "http://localhost:3000"
node "%~dp0server.js"
pause
