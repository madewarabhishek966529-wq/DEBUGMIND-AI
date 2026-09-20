@echo off
setlocal
echo =======================================================
echo          Running DebugMind AI Test Suites
echo =======================================================

set SCRIPT_DIR=%~dp0

echo.
echo [1/2] Running VS Code Extension Unit Tests...
cd /d "%SCRIPT_DIR%debugmind-ai\extension"
call npm test
if %errorlevel% neq 0 (
    echo [ERROR] Extension tests failed!
    exit /b %errorlevel%
)

echo.
echo [2/2] Running Spring Boot Backend Tests...
cd /d "%SCRIPT_DIR%debugmind-ai\backend"
call "%SCRIPT_DIR%debugmind-ai\backend\mvnw.cmd" test
if %errorlevel% neq 0 (
    echo [ERROR] Backend tests failed!
    exit /b %errorlevel%
)

echo.
echo =======================================================
echo     ALL TESTS PASSED SUCCESSFULLY! (100% GREEN)
echo =======================================================
