Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "        Starting DebugMind AI Backend Server          " -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan

$backendDir = Join-Path $PSScriptRoot "debugmind-ai\backend"
Set-Location $backendDir
& ".\mvnw.cmd" spring-boot:run
