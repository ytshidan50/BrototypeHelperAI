# Brototype Helper AI - Safe Automated Installer
$ErrorActionPreference = "Stop"

Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "    Brototype Helper AI - Automated Installer          " -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host ""

$targetDir = "C:\BrototypeHelperAI"
$zipPath = "$env:TEMP\brototype_helper_latest.zip"

if (-not (Test-Path $targetDir)) {
    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
}

Write-Host "[1/3] Fetching latest release from GitHub..." -ForegroundColor Yellow
$repo = 'ytshidan50/BrototypeHelperAI'
try {
    $release = Invoke-RestMethod -Uri "https://api.github.com/repos/$repo/releases/latest" -Headers @{"User-Agent"="PowerShell"}
    $asset = $release.assets | Where-Object { $_.name -like '*.zip' } | Select-Object -First 1
    if (-not $asset) { throw "No zip asset found in release." }
    Write-Host "Downloading: $($asset.name) ($($release.tag_name))" -ForegroundColor Green
    Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $zipPath
} catch {
    Write-Host "Download failed: $($_.Exception.Message)" -ForegroundColor Red
    return
}

Write-Host "[2/3] Extracting extension to $targetDir..." -ForegroundColor Yellow
Expand-Archive -Path $zipPath -DestinationPath $targetDir -Force
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }

Write-Host "[3/3] Copying path to clipboard..." -ForegroundColor Yellow
try { Set-Clipboard -Value $targetDir } catch {}

Write-Host ""
Write-Host "=======================================================" -ForegroundColor Green
Write-Host " Installation Complete!" -ForegroundColor Green
Write-Host " 1. Chrome / Edge extensions page will open." -ForegroundColor White
Write-Host " 2. Enable 'Developer mode' (toggle in top-right)." -ForegroundColor White
Write-Host " 3. Click 'Load unpacked' and press Ctrl + V (Enter)!" -ForegroundColor Yellow
Write-Host "=======================================================" -ForegroundColor Green
Write-Host ""

try { Start-Process "chrome://extensions" } catch {}
try { Invoke-Item $targetDir } catch {}
