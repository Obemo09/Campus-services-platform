# 🎓 Campus Services Platform

A unified microservices-based web platform that consolidates essential university services for students and staff at ICT University Cameroon.

## 👥 Team
- **Obemo** — Backend Architecture, API Gateway, Docker Deployment
- **Yoyo** — Frontend Development, UI/UX Design, Service Integration

## 🏗️ Architecture

This platform is built using a **Microservices Architecture** with:
- **API Gateway** — Single entry point for all client requests
- **Event-Driven Communication** via RabbitMQ
- **Containerization** via Docker Compose
- **React Frontend** with mobile-responsive design

## 🗺️ Architecture Diagram

```mermaid
graph TD
    Client(["🌐 React Frontend\n(Vite + Tailwind CSS)"])
    Gateway["🔀 API Gateway\nPort 3000"]
    Auth["🔐 Auth Service\nPort 3001"]
    Booking["📅 Booking Service\nPort 3002"]
    Events["🎉 Events Service\nPort 3003"]
    Marketplace["🛒 Marketplace Service\nPort 3004"]
    LostFound["🔍 Lost & Found Service\nPort 3005"]
    Carpooling["🚗 Carpooling Service\nPort 3006"]
    Notification["🔔 Notification Service\nPort 3007"]
    MongoDB[("🍃 MongoDB\nPort 27017")]
    RabbitMQ[("🐰 RabbitMQ\nPort 5672")]

    Client -->|HTTP Requests| Gateway
    Gateway -->|/auth| Auth
    Gateway -->|/bookings| Booking
    Gateway -->|/events| Events
    Gateway -->|/marketplace| Marketplace
    Gateway -->|/lost-found| LostFound
    Gateway -->|/carpooling| Carpooling
    Gateway -->|/notifications| Notification

    Auth -->|Read/Write| MongoDB
    Booking -->|Read/Write| MongoDB
    Events -->|Read/Write| MongoDB
    Marketplace -->|Read/Write| MongoDB
    LostFound -->|Read/Write| MongoDB
    Carpooling -->|Read/Write| MongoDB

    Booking -->|BookingConfirmed| RabbitMQ
    Events -->|EventCreated| RabbitMQ
    RabbitMQ -->|Consume Events| Notification

    style Client fill:#1a2438,stroke:#c9a84c,color:#f5f0e8
    style Gateway fill:#1a2438,stroke:#60a5fa,color:#f5f0e8
    style Auth fill:#1a2438,stroke:#4ade80,color:#f5f0e8
    style Booking fill:#1a2438,stroke:#60a5fa,color:#f5f0e8
    style Events fill:#1a2438,stroke:#f472b6,color:#f5f0e8
    style Marketplace fill:#1a2438,stroke:#c9a84c,color:#f5f0e8
    style LostFound fill:#1a2438,stroke:#a78bfa,color:#f5f0e8
    style Carpooling fill:#1a2438,stroke:#4ade80,color:#f5f0e8
    style Notification fill:#1a2438,stroke:#fb923c,color:#f5f0e8
    style MongoDB fill:#1a2438,stroke:#4ade80,color:#f5f0e8
    style RabbitMQ fill:#1a2438,stroke:#fb923c,color:#f5f0e8
```

## 🚀 Services

| Service | Port | Description |
|---|---|---|
| API Gateway | 3000 | Routes requests to all services |
| Auth Service | 3001 | User authentication & authorization |
| Booking Service | 3002 | Facility booking & management |
| Events Service | 3003 | Campus events & RSVP |
| Marketplace Service | 3004 | Buy & sell within campus |
| Lost & Found Service | 3005 | Report & claim lost items |
| Carpooling Service | 3006 | Share rides between students |
| Notification Service | 3007 | Event-driven notifications |

## 🛠️ Tech Stack

**Backend:**
- Node.js + Express.js
- MongoDB (per service database)
- RabbitMQ (event messaging)
- Docker + Docker Compose

**Frontend:**
- React (Vite)
- Tailwind CSS v4
- React Router DOM
- Axios

## 📦 Installation & Setup

### Prerequisites
- Docker Desktop installed
- Node.js 20+
- Git

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/campus-services-platform.git
cd campus-services-platform
```

### 2. Create environment files
Copy `.env.example` to `.env` for each service:
```bash
cp services/auth-service/.env.example services/auth-service/.env
cp services/api-gateway/.env.example services/api-gateway/.env
```

### 3. Start all services
```bash
docker-compose up --build
```

### 4. Start the frontend
```bash
cd frontend
npm install
npm run dev
```

### 5. Access the app
- **Frontend:** http://localhost:5173
- **API Gateway:** http://localhost:3000
- **RabbitMQ Dashboard:** http://localhost:15672

## 👤 Default Admin Account
- **Email:** admin@campus.com
- **Password:** admin123456

## 📱 Features

### For Students
- 📅 Book computer labs and lecture halls
- 🎉 Browse and RSVP to campus events
- 🛒 Buy and sell items in the marketplace
- 🔍 Report and claim lost items
- 🚗 Post and join carpools

### For Admins
- ✅ Confirm or reject booking requests
- 🏛️ Add, edit and delete facilities
- 📊 View all bookings across campus

## 📄 License
MIT License — ICT University Cameroon, 2026