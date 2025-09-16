@echo off
REM Setup Python virtual environment and install dependencies
cd /d %~dp0
python -m venv venv
call venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt

echo Backend setup complete. To start the server, run run_backend.bat.
