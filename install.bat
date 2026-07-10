@echo off
echo ====================================================
echo   📦 ETS2 Cabin Media - Car Radio Stream Installer
echo ====================================================
echo.
echo Installing real-time streaming modules...
python -m pip install --upgrade pip
pip install fastapi uvicorn pydantic psutil python-multipart keyboard websockets
echo.
echo ====================================================
echo   ✅ Setup complete!
echo ====================================================
pause