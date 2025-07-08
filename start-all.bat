@echo off
echo ========================================
echo    SwiftChat - Starting All Services
echo ========================================
echo.

:: Set colors for better visibility
color 0A

:: Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [INFO] Node.js version:
node --version
echo.

:: Check if npm is installed
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed
    pause
    exit /b 1
)

echo [INFO] npm version:
npm --version
echo.

:: Install dependencies for all services
echo ========================================
echo    Installing Dependencies
echo ========================================
echo.

echo [STEP 1/6] Installing root dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install root dependencies
    pause
    exit /b 1
)

echo [STEP 2/6] Installing auth-service dependencies...
cd auth-service
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install auth-service dependencies
    cd ..
    pause
    exit /b 1
)
cd ..

echo [STEP 3/6] Installing api-gateway dependencies...
cd api-gateway
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install api-gateway dependencies
    cd ..
    pause
    exit /b 1
)
cd ..

echo [STEP 4/6] Installing websocket-gateway dependencies...
cd websocket-gateway
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install websocket-gateway dependencies
    cd ..
    pause
    exit /b 1
)
cd ..

echo [STEP 5/6] Installing chat-service dependencies...
cd chat-service
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install chat-service dependencies
    cd ..
    pause
    exit /b 1
)
cd ..

echo [STEP 6/6] Installing notification-service dependencies...
cd notification-service
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install notification-service dependencies
    cd ..
    pause
    exit /b 1
)
cd ..

echo [STEP 7/7] Installing frontend dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install frontend dependencies
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo ========================================
echo    Starting All Services
echo ========================================
echo.

:: Start all services in separate windows
echo [SERVICE 1/6] Starting Auth Service on port 4002...
start "SwiftChat - Auth Service" cmd /k "cd /d "%~dp0auth-service" && npm run dev"
timeout /t 2 /nobreak >nul

echo [SERVICE 2/6] Starting API Gateway on port 4000...
start "SwiftChat - API Gateway" cmd /k "cd /d "%~dp0api-gateway" && npm run dev"
timeout /t 2 /nobreak >nul

echo [SERVICE 3/6] Starting WebSocket Gateway on port 4001...
start "SwiftChat - WebSocket Gateway" cmd /k "cd /d "%~dp0websocket-gateway" && npm run dev"
timeout /t 2 /nobreak >nul

echo [SERVICE 4/6] Starting Chat Service on port 4003...
start "SwiftChat - Chat Service" cmd /k "cd /d "%~dp0chat-service" && npm run dev"
timeout /t 2 /nobreak >nul

echo [SERVICE 5/6] Starting Notification Service on port 4004...
start "SwiftChat - Notification Service" cmd /k "cd /d "%~dp0notification-service" && npm run dev"
timeout /t 2 /nobreak >nul

echo [SERVICE 6/6] Starting Frontend on port 3000...
start "SwiftChat - Frontend" cmd /k "cd /d "%~dp0frontend" && npm start"
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo    SwiftChat Services Status
echo ========================================
echo.
echo ✅ Auth Service:        http://localhost:4002/health
echo ✅ API Gateway:         http://localhost:4000/health  
echo ✅ WebSocket Gateway:   http://localhost:4001
echo ✅ Chat Service:        http://localhost:4003/health
echo ✅ Notification Service: http://localhost:4004/health
echo ✅ Frontend:            http://localhost:3000
echo.
echo ========================================
echo    Quick Access
echo ========================================
echo.
echo 🚀 SwiftChat App:       http://localhost:3000
echo 📊 API Health Check:   http://localhost:4000/health
echo.

:: Wait a moment for services to start
echo [INFO] Waiting for services to start...
timeout /t 5 /nobreak >nul

:: Open the application in default browser
echo [INFO] Opening SwiftChat in your default browser...
start http://localhost:3000

echo.
echo ========================================
echo    SwiftChat Successfully Started!
echo ========================================
echo.
echo All services are running in separate windows.
echo To stop all services, close the individual service windows.
echo.
echo Happy chatting with SwiftChat! 🎉
echo.
pause
