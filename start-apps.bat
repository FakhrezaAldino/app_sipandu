@echo off
TITLE PKH Application Launcher

echo Starting PKH Application...

echo.
echo [1/2] Starting Backend Server...
start powershell -ExecutionPolicy Bypass -NoExit -Command "cd apps/pkh-backend; npm run dev"

echo.
echo [2/2] Starting Dashboard (Frontend)...
start powershell -ExecutionPolicy Bypass -NoExit -Command "cd apps/pkh-dashboard; npm run dev"

echo.
echo PKH Application is starting in new windows.
echo Dashboard: http://localhost:5173
echo Backend API: http://localhost:3001/health
echo.
pause
