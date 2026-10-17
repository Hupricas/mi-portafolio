@echo off
cd /d "%~dp0"
where py >nul 2>&1
if %errorlevel%==0 (
    py -3 editor_local.py
) else (
    python editor_local.py
)
if errorlevel 1 (
  echo.
  echo No se ha podido iniciar. Instala Python 3 desde python.org y reinicia este archivo.
  pause
)
