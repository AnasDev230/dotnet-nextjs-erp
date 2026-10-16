@echo off
echo Starting Bunyan ERP...
start "ERP Backend" cmd /k "cd /d %~dp0src\Server\Server && dotnet run --launch-profile https"
timeout /t 3 /nobreak >nul
start "ERP Frontend" cmd /k "cd /d %~dp0src\client && npm run dev"
echo.
echo Backend: https://localhost:7086
echo Frontend: http://localhost:3000
echo Close each terminal window to stop its service.
