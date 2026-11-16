@echo off
setlocal enabledelayedexpansion

echo =======================================================
echo     Brototype Helper AI - Automated Installer
echo =======================================================
echo.

set "TARGET_DIR=%LOCALAPPDATA%\BrototypeHelperAI"
set "ZIP_PATH=%TEMP%\brototype_helper_latest.zip"

echo [1/4] Preparing permanent directory: "%TARGET_DIR%"
if not exist "%TARGET_DIR%" mkdir "%TARGET_DIR%"

echo [2/4] Fetching latest release from GitHub...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$repo = 'ytshidan/Brototype-Helper-AI';" ^
  "try {" ^
  "  $release = Invoke-RestMethod -Uri \"https://api.github.com/repos/$repo/releases/latest\";" ^
  "  $asset = $release.assets | Where-Object { $_.name -like '*.zip' } | Select-Object -First 1;" ^
  "  if (-not $asset) { throw 'No zip asset found in release.' }" ^
  "  Write-Host 'Downloading:' $asset.name;" ^
  "  Invoke-WebRequest -Uri $asset.browser_download_url -OutFile '%ZIP_PATH%';" ^
  "} catch {" ^
  "  Write-Host 'Error downloading release:' $_.Exception.Message -ForegroundColor Red;" ^
  "  exit 1;" ^
  "}"

if not exist "%ZIP_PATH%" (
  echo [!] Failed to download extension package. Please check your internet connection.
  pause
  exit /b 1
)

echo [3/4] Extracting extension to "%TARGET_DIR%"...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "Expand-Archive -Path '%ZIP_PATH%' -DestinationPath '%TARGET_DIR%' -Force; Remove-Item '%ZIP_PATH%' -Force"

echo [4/4] Installation Complete!
echo.
echo =======================================================
echo  Final Step:
echo  1. Chrome's Extensions page will now open.
echo  2. Enable 'Developer mode' (top-right).
echo  3. Click 'Load unpacked' and select the folder:
echo     %TARGET_DIR%
echo =======================================================
echo.

start "" "chrome://extensions"
explorer "%TARGET_DIR%"

pause
