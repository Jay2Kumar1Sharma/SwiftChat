# SwiftChat - Distributed Real-Time Chat Application

[![CI](https://github.com/Jay2Kumar1Sharma/SwiftChat/workflows/CI/badge.svg)](https://github.com/Jay2Kumar1Sharma/SwiftChat/actions)
[![Health Check](https://github.com/Jay2Kumar1Sharma/SwiftChat/workflows/Health%20Check/badge.svg)](https://github.com/Jay2Kumar1Sharma/SwiftChat/actions)

🔧 **Project**: SwiftChat - Modern Real-Time Chat Platform  
🎯 **Goal**: Scalable, real-time messaging system with microservices architecture

## 🚀 **QUICK START - RUN THE PROJECT**

### ⚡ **One-Click Launch** (Recommended)
```bash
# Navigate to the project directory and run:
start-all.bat
```
This will:
- ✅ Install all dependencies automatically
- ✅ Start all services in separate windows  
- ✅ Open the chat application in your browser
- ✅ Show health status of all services

### 🎮 **Demo Mode Features**
- **No Database Required**: Runs with mock data for quick testing
- **Full Chat Functionality**: Real-time messaging simulation
- **Modern UI**: Beautiful, responsive SwiftChat interface
- **User Management**: Registration, login, user profiles
- **Group Chat**: Multiple chat rooms and channels
- **Real Database Support**: Can be configured with PostgreSQL and Redis

### 📱 **Access the Application**
- **SwiftChat Interface**: http://localhost:3000
- **API Gateway**: http://localhost:4000/health
- **Auth Service**: http://localhost:4002/health

### 🔧 **Manual Startup** (Alternative)
```bash
# 1. Auth Service
cd "auth-service"
npm install && npm run dev

# 2. API Gateway  
cd "api-gateway"
npm install && npm run dev

# 3. WebSocket Gateway
cd "websocket-gateway"
npm install && npm run dev

# 4. Chat Service
cd "chat-service"
npm install && npm run dev

# 5. Notification Service
cd "notification-service"
npm install && npm run dev

# 6. Frontend
cd "frontend"  
npm install && npm start
```

## 🏗️ System Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │  WebSocket       │    │  API Gateway    │
│   React/TS      │◄──►│  Gateway         │◄──►│  Express.js     │
│   Port: 3000    │    │  Socket.IO       │    │  Port: 4000     │
└─────────────────┘    │  Port: 4001      │    └─────────────────┘
                       └──────────────────┘             │
                                │                       │
                       ┌────────▼────────┐    ┌────────▼────────┐
                       │     Redis       │    │  Microservices  │
                       │   Pub/Sub       │    │  Auth/Chat/     │
                       │   (Optional)    │    │  Notification   │
                       └─────────────────┘    └─────────────────┘
                                                       │
                                              ┌────────▼────────┐
                                              │   PostgreSQL    │
                                              │   (Optional)    │
                                              │   Database      │
                                              └─────────────────┘
```

## 🛠️ Tech Stack

| Component | Technology | Port | Local Status | Production Status |
|-----------|------------|------|--------------|-------------------|
| Frontend | React.js + TypeScript | 3000 | ✅ Active | 🔄 Ready to Deploy |
| WebSocket Gateway | Node.js + Socket.IO | 4001 | ✅ Active | ✅ **Live on Render.com** |
| API Gateway | Express.js + TypeScript | 4000 | ✅ Active | 🔄 Ready to Deploy |
| Auth Service | Node.js + JWT | 4002 | ✅ Active | 🔄 Ready to Deploy |
| Chat Service | Node.js + Express | 4003 | ✅ Active | 🔄 Ready to Deploy |
| Notification Service | Node.js + Express | 4004 | ✅ Active | 🔄 Ready to Deploy |
| Database | PostgreSQL (Optional) | 5432 | 🔧 Configurable | 🔄 External Service |
| Cache | Redis (Optional) | 6379 | 🔧 Configurable | ❌ Not Available |

## 🎯 Current Production Status

### ✅ **What's Working**
- **WebSocket Gateway**: Live on Render.com, handling real-time messaging
- **Redis Fallback**: Graceful handling of Redis connection failures
- **Demo Mode**: Frontend automatically switches to demo mode when backend is unavailable
- **Local Development**: Full stack runs smoothly with `start-all.bat`
- **Error Handling**: Robust error handling across all services

### 🔄 **What's Next**
- Deploy remaining services (API Gateway, Auth Service, Chat Service) to Render.com
- Consider Redis hosting solution (RedisLabs, AWS ElastiCache) for production
- Frontend deployment to Vercel/Netlify
- Optional: Database hosting (PostgreSQL on Render.com or external service)

### 🚨 **Known Issues**
- Redis connection failures in production (expected behavior with current setup)
- Some API endpoints may timeout during cold starts (30s timeout configured)
- Demo mode is used as fallback when services are unavailable

## 📋 Features

### ✅ Core Features
- **Real-time messaging** with Socket.IO
- **User authentication** (JWT-based)
- **Group chats** and direct messages
- **Modern UI** with SwiftChat branding
- **Typing indicators** and message status
- **User presence** and online status
- **Demo mode** with mock data
- **Production ready** with real database support

### 🏗️ Architecture
- **Microservices design** with 5 independent services
- **Horizontal scalability** ready
- **Graceful fallback** to demo mode
- **Load balancing** compatible
- **Container deployment** ready
- **Health monitoring** for all services
- **Real-time communication** via WebSocket

### 🌐 **Development Options**
- **Demo Mode**: No external dependencies required
- **Production Mode**: Local PostgreSQL + Redis for full functionality
- **Configurable**: Switch between demo and production modes

## 🔒 Security
- **JWT authentication** with secure token handling
- **Rate limiting** to prevent abuse
- **Input validation** and sanitization
- **CORS protection** for cross-origin requests
- **XSS prevention** with proper escaping
- **SQL injection protection** with parameterized queries
- **Environment variables** for sensitive configuration

## 🚀 Production Deployment

### 🌐 **Live Services**
- **WebSocket Gateway**: https://chat-websocket-gateway.onrender.com
  - Status: ✅ Live and operational
  - Handles Redis failures gracefully
  - Logs available in Render.com dashboard

### 🔧 **Production Environment Setup**
All services are configured to work in production with:
- Environment variable configuration
- Graceful Redis fallback
- Robust error handling
- Health check endpoints

### 📋 **Deployment Checklist**
- [x] WebSocket Gateway deployed to Render.com
- [ ] API Gateway deployment
- [ ] Auth Service deployment  
- [ ] Chat Service deployment
- [ ] Notification Service deployment
- [ ] Frontend deployment
- [ ] Redis hosting (optional)
- [ ] PostgreSQL hosting (optional)

### ⚠️ **Production Notes**
- Redis connection failures are expected without hosted Redis
- Services continue to work in demo mode
- All logs are available in Render.com dashboard
- Cold start delays may occur (30s timeout configured)

## 🛠️ Troubleshooting

### 🔧 **Redis Connection Issues**
If you encounter 404 errors from the auth service, it may be due to Redis connection issues:

**✅ **Fixed**: Redis connection failures are now handled gracefully**
- Auth service continues to work without Redis
- Automatic fallback to demo mode
- Service logs warnings but doesn't crash
- JWT tokens still work (only refresh token persistence affected)

**📋 Check Service Status:**
- API Gateway: http://localhost:4000/health
- Auth Service: http://localhost:4002/health

**🎮 Demo Mode Activation:**
- Automatically activates on Redis/DB connection failures
- Uses demo users: `demo@example.com/demo123`
- Full functionality without external dependencies

## 🛠️ Local Development Setup

### **Setting Up Real Database (Optional)**
1. **Install PostgreSQL** locally
2. **Install Redis** locally
3. **Configure Environment Variables** in each service
4. **Run Database Migrations** using provided schema
5. **Start Services** with database connections

### **Environment Configuration**
Each service can be configured with environment variables to switch between:
- **Demo Mode**: Uses mock data and in-memory storage
- **Production Mode**: Uses PostgreSQL and Redis connections

---
**SwiftChat - Modern Real-Time Chat Platform**  
*Built with React, TypeScript, Node.js, and Socket.IO*

🔧 **Project**: SwiftChat - Modern Real-Time Chat Platform  
🎯 **Goal**: Scalable, real-time messaging system with microservices architecture

## 🚀 **QUICK START - RUN THE PROJECT**

### ⚡ **One-Click Launch** (Recommended)
```bash
# Navigate to the project directory and run:
start-all.bat
```
This will:
- ✅ Install all dependencies automatically
- ✅ Start all services in separate windows  
- ✅ Open the chat application in your browser
- ✅ Show health status of all services

### 🎮 **Demo Mode Features**
- **No Database Required**: Runs with mock data for quick testing
- **Full Chat Functionality**: Real-time messaging simulation
- **Modern UI**: Beautiful, responsive SwiftChat interface
- **User Management**: Registration, login, user profiles
- **Group Chat**: Multiple chat rooms and channels
- **Real Database Support**: Can be configured with PostgreSQL and Redis

### 📱 **Access the Application**
- **SwiftChat Interface**: http://localhost:3000
- **API Gateway**: http://localhost:4000/health
- **Auth Service**: http://localhost:4002/health

### 🔧 **Manual Startup** (Alternative)
```bash
# 1. Auth Service
cd "auth-service"
npm install && npm run dev

# 2. API Gateway  
cd "api-gateway"
npm install && npm run dev

# 3. WebSocket Gateway
cd "websocket-gateway"
npm install && npm run dev

# 4. Chat Service
cd "chat-service"
npm install && npm run dev

# 5. Notification Service
cd "notification-service"
npm install && npm run dev

# 6. Frontend
cd "frontend"  
npm install && npm start
```

## 🏗️ System Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │  WebSocket       │    │  API Gateway    │
│   React/TS      │◄──►│  Gateway         │◄──►│  Express.js     │
│   Port: 3000    │    │  Socket.IO       │    │  Port: 4000     │
└─────────────────┘    │  Port: 4001      │    └─────────────────┘
                       └──────────────────┘             │
                                │                       │
                       ┌────────▼────────┐    ┌────────▼────────┐
                       │     Redis       │    │  Microservices  │
                       │   Pub/Sub       │    │  Auth/Chat/     │
                       │   (Optional)    │    │  Notification   │
                       └─────────────────┘    └─────────────────┘
                                                       │
                                              ┌────────▼────────┐
                                              │   PostgreSQL    │
                                              │   (Optional)    │
                                              │   Database      │
                                              └─────────────────┘
```

## 🛠️ Tech Stack

| Component | Technology | Port | Local Status | Production Status |
|-----------|------------|------|--------------|-------------------|
| Frontend | React.js + TypeScript | 3000 | ✅ Active | 🔄 Ready to Deploy |
| WebSocket Gateway | Node.js + Socket.IO | 4001 | ✅ Active | ✅ **Live on Render.com** |
| API Gateway | Express.js + TypeScript | 4000 | ✅ Active | 🔄 Ready to Deploy |
| Auth Service | Node.js + JWT | 4002 | ✅ Active | 🔄 Ready to Deploy |
| Chat Service | Node.js + Express | 4003 | ✅ Active | 🔄 Ready to Deploy |
| Notification Service | Node.js + Express | 4004 | ✅ Active | 🔄 Ready to Deploy |
| Database | PostgreSQL (Optional) | 5432 | 🔧 Configurable | 🔄 External Service |
| Cache | Redis (Optional) | 6379 | 🔧 Configurable | ❌ Not Available |

## 🎯 Current Production Status

### ✅ **What's Working**
- **WebSocket Gateway**: Live on Render.com, handling real-time messaging
- **Redis Fallback**: Graceful handling of Redis connection failures
- **Demo Mode**: Frontend automatically switches to demo mode when backend is unavailable
- **Local Development**: Full stack runs smoothly with `start-all.bat`
- **Error Handling**: Robust error handling across all services

### 🔄 **What's Next**
- Deploy remaining services (API Gateway, Auth Service, Chat Service) to Render.com
- Consider Redis hosting solution (RedisLabs, AWS ElastiCache) for production
- Frontend deployment to Vercel/Netlify
- Optional: Database hosting (PostgreSQL on Render.com or external service)

### 🚨 **Known Issues**
- Redis connection failures in production (expected behavior with current setup)
- Some API endpoints may timeout during cold starts (30s timeout configured)
- Demo mode is used as fallback when services are unavailable

## 📋 Features

### ✅ Core Features
- **Real-time messaging** with Socket.IO
- **User authentication** (JWT-based)
- **Group chats** and direct messages
- **Modern UI** with SwiftChat branding
- **Typing indicators** and message status
- **User presence** and online status
- **Demo mode** with mock data
- **Production ready** with real database support

### 🏗️ Architecture
- **Microservices design** with 5 independent services
- **Horizontal scalability** ready
- **Graceful fallback** to demo mode
- **Load balancing** compatible
- **Container deployment** ready
- **Health monitoring** for all services
- **Real-time communication** via WebSocket

### 🌐 **Development Options**
- **Demo Mode**: No external dependencies required
- **Production Mode**: Local PostgreSQL + Redis for full functionality
- **Configurable**: Switch between demo and production modes

## 🔒 Security
- **JWT authentication** with secure token handling
- **Rate limiting** to prevent abuse
- **Input validation** and sanitization
- **CORS protection** for cross-origin requests
- **XSS prevention** with proper escaping
- **SQL injection protection** with parameterized queries
- **Environment variables** for sensitive configuration

## 🚀 Production Deployment

### 🌐 **Live Services**
- **WebSocket Gateway**: https://chat-websocket-gateway.onrender.com
  - Status: ✅ Live and operational
  - Handles Redis failures gracefully
  - Logs available in Render.com dashboard

### 🔧 **Production Environment Setup**
All services are configured to work in production with:
- Environment variable configuration
- Graceful Redis fallback
- Robust error handling
- Health check endpoints

### 📋 **Deployment Checklist**
- [x] WebSocket Gateway deployed to Render.com
- [ ] API Gateway deployment
- [ ] Auth Service deployment  
- [ ] Chat Service deployment
- [ ] Notification Service deployment
- [ ] Frontend deployment
- [ ] Redis hosting (optional)
- [ ] PostgreSQL hosting (optional)

### ⚠️ **Production Notes**
- Redis connection failures are expected without hosted Redis
- Services continue to work in demo mode
- All logs are available in Render.com dashboard
- Cold start delays may occur (30s timeout configured)

## 🛠️ Troubleshooting

### 🔧 **Redis Connection Issues**
If you encounter 404 errors from the auth service, it may be due to Redis connection issues:

**✅ **Fixed**: Redis connection failures are now handled gracefully**
- Auth service continues to work without Redis
- Automatic fallback to demo mode
- Service logs warnings but doesn't crash
- JWT tokens still work (only refresh token persistence affected)

**📋 Check Service Status:**
- API Gateway: http://localhost:4000/health
- Auth Service: http://localhost:4002/health

**🎮 Demo Mode Activation:**
- Automatically activates on Redis/DB connection failures
- Uses demo users: `demo@example.com/demo123`
- Full functionality without external dependencies

## 🛠️ Local Development Setup

### **Setting Up Real Database (Optional)**
1. **Install PostgreSQL** locally
2. **Install Redis** locally
3. **Configure Environment Variables** in each service
4. **Run Database Migrations** using provided schema
5. **Start Services** with database connections

### **Environment Configuration**
Each service can be configured with environment variables to switch between:
- **Demo Mode**: Uses mock data and in-memory storage
- **Production Mode**: Uses PostgreSQL and Redis connections

---
**SwiftChat - Modern Real-Time Chat Platform**  
*Built with React, TypeScript, Node.js, and Socket.IO*
