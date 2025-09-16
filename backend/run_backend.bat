@echo off
REM Activate Python virtual environment and run Flask backend
cd /d %~dp0
call venv\Scripts\activate
set FLASK_APP=app.py
set FLASK_ENV=development
python app.py

