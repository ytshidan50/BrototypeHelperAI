@echo off
setlocal enabledelayedexpansion

echo =======================================================
echo      Brototype Helper AI - Auto Updater
echo =======================================================
echo.

set "TARGET_DIR=%LOCALAPPDATA%\BrototypeHelperAI"
set "ZIP_PATH=%TEMP%\brototype_helper_latest.zip"

echo [1/3] Checking for latest release from GitHub...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$repo = 'ytshidan/Brototype-Helper-AI';" ^
  "try {" ^
  "  $release = Invoke-RestMethod -Uri \"https://api.github.com/repos/$repo/releases/latest\";" ^
  "  $asset = $release.assets | Where-Object { $_.name -like '*.zip' } | Select-Object -First 1;" ^
  "  if (-not $asset) { throw 'No zip found in latest release.' }" ^
  "  Write-Host 'Found version:' $release.tag_name;" ^
  "  Write-Host 'Downloading:' $asset.name;" ^
  "  Invoke-WebRequest -Uri $asset.browser_download_url -OutFile '%ZIP_PATH%';" ^
  "} catch {" ^
  "  Write-Host 'Update check failed:' $_.Exception.Message -ForegroundColor Red;" ^
  "  exit 1;" ^
  "}"

if not exist "%ZIP_PATH%" (
  echo [!] Download failed.
  pause
  exit /b 1
)

echo [2/3] Updating files in "%TARGET_DIR%"...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "Expand-Archive -Path '%ZIP_PATH%' -DestinationPath '%TARGET_DIR%' -Force; Remove-Item '%ZIP_PATH%' -Force"

echo [3/3] Done!
echo.
echo =======================================================
echo  Update Applied Successfully!
echo  Just click the Reload icon on the extension card in
echo  chrome://extensions/ (or restart your browser).
echo =======================================================
echo.

pause
