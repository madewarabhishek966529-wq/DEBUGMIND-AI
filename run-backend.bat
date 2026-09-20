@echo off
setlocal
echo =======================================================
echo          Starting DebugMind AI Backend Server
echo =======================================================

set SCRIPT_DIR=%~dp0
set BACKEND_DIR=%SCRIPT_DIR%debugmind-ai\backend

cd /d "%BACKEND_DIR%"
call "%BACKEND_DIR%\mvnw.cmd" spring-boot:run
pause
