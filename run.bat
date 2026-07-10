@echo off
:: Automatically navigate to wherever this batch file was launched from
cd /d "%~dp0"

:: If a Backend folder exists, jump right into it automatically
if exist "Backend" cd Backend

echo Running Server from: %CD%
python main.py
pause