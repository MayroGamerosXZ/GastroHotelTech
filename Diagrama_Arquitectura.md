```mermaid
graph TD
    %% Definición de Estilos
    classDef client fill:#e0f2fe,stroke:#2563eb,stroke-width:2px,color:#1e3a8a
    classDef frontend fill:#fce7f3,stroke:#db2777,stroke-width:2px,color:#831843
    classDef backend fill:#dcfce7,stroke:#059669,stroke-width:2px,color:#064e3b
    classDef devops fill:#fef08a,stroke:#d97706,stroke-width:2px,color:#78350f
    classDef cloud fill:#ffedd5,stroke:#ea580c,stroke-width:2px,color:#7c2d12

    %% Actores
    User([👨‍💼 Usuario / Cliente]):::client
    Staff([👩‍🍳 Personal del Hotel]):::client
    Developer([💻 Desarrollador]):::client

    %% Nube de AWS (Producción)
    subgraph "☁️ Entorno de Producción (AWS EC2 - t3.micro)"
        direction TB
        Nginx["🌐 Nginx (Docker Container)\nPuerto 80"]:::cloud
        Dist["📁 Archivos Estáticos\n(Angular Build /dist)"]:::cloud
        
        Nginx --- Dist
    end

    %% Capa Frontend (Lógica)
    subgraph "📱 Frontend (Angular & Capacitor)"
        direction TB
        Angular["🅰️ Framework Angular\n(Web App)"]:::frontend
        Capacitor["⚡ Ionic Capacitor\n(Android Wrapper)"]:::frontend
        
        Angular -.->|Empaquetado| Capacitor
    end

    %% Capa Backend
    subgraph "⚙️ Backend (Python)"
        direction TB
        FastAPI["🚀 FastAPI\n(REST API)"]:::backend
        SQLAlchemy["🔗 SQLAlchemy ORM"]:::backend
        DB[("🗄️ Base de Datos\nSQLite / PostgreSQL")]:::backend
        
        FastAPI -->|Consultas| SQLAlchemy
        SQLAlchemy -->|Lectura/Escritura| DB
    end

    %% Herramientas SRE / DevOps
    subgraph "🛠️ DevOps & Monitoreo"
        direction LR
        GitHub["🐙 GitHub Repository\n(Rama 'main')"]:::devops
        Actions["🤖 GitHub Actions\n(CI/CD Pipeline)"]:::devops
        UptimeRobot["⏰ UptimeRobot\n(Monitoreo 24/7)"]:::devops
        
        GitHub -->|Trigger on Push| Actions
    end

    %% Conexiones y Flujos
    User -->|Navegador Web| Nginx
    Staff -->|Tablet / Celular| Capacitor
    Capacitor -->|Llamadas HTTP| FastAPI
    Angular -->|Llamadas HTTP| FastAPI
    
    Developer -->|Git Push| GitHub
    Actions -->|Conexión SSH y Docker Restart| Nginx
    
    UptimeRobot -->|Health Check - Ping HTTP| Nginx
