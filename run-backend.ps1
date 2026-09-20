Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "        Starting DebugMind AI Backend Server          " -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan

# Check and free port 8080 if currently occupied
$existingProc = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue
if ($existingProc) {
    $pids = $existingProc | Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($p in $pids) {
        if ($p -gt 0) {
            Write-Host "Freeing occupied port 8080 (PID: $p)..." -ForegroundColor Yellow
            Stop-Process -Id $p -Force -ErrorAction SilentlyContinue
        }
    }
    Start-Sleep -Seconds 1
}

$backendDir = Join-Path $PSScriptRoot "debugmind-ai\backend"
Set-Location $backendDir
& ".\mvnw.cmd" spring-boot:run
