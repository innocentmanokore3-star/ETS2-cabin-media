@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo [1/3] Checking and Installing Dependencies...
echo ===================================================
python -m pip install keyboard flask flask-cors --user --no-warn-script-location

echo.
echo ===================================================
echo [2/3] Dynamically Locating Backend Directory...
echo ===================================================

if exist "%~dp0main.py" (
    cd /d "%~dp0"
    goto FOUND
)

if exist "%~dp0Backend\main.py" (
    cd /d "%~dp0Backend"
    goto FOUND
)

echo main.py not in immediate folders. Searching subdirectories...
for /r "%~dp0" %%i in (main.py) do (
    if exist "%%i" (
        cd /d "%%~dpi"
        goto FOUND
    )
)

echo [ERROR] Could not find 'main.py' anywhere in this project folder!
pause
exit /b

:FOUND
echo Current Directory: %CD%
echo Found main.py successfully.

echo.
echo ===================================================
echo [3/3] Launching Native Flask Server...
echo ===================================================
echo Starting Flask (Accepting external connections on Port 8000)...

:: Force Flask environment variables
set FLASK_APP=main.py
set FLASK_ENV=development

:: Run using native flask runner on host 0.0.0.0 and port 8000
python -m flask run --host=0.0.0.0 --port=8000

echo.
echo Server execution has ended.
pause