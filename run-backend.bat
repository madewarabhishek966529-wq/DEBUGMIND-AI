@echo off
setlocal
echo =======================================================
echo          Starting DebugMind AI Backend Server
echo =======================================================

:: Free port 8080 if already in use
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8080 ^| findstr LISTENING') do (
    echo Freeing occupied port 8080 (PID: %%a)...
    taskkill /F /PID %%a >nul 2>&1
)

set SCRIPT_DIR=%~dp0
set BACKEND_DIR=%SCRIPT_DIR%debugmind-ai\backend

cd /d "%BACKEND_DIR%"
call "%BACKEND_DIR%\mvnw.cmd" spring-boot:run
pause
