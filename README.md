# 📊 Multi-modal Sensor Data Analytics Dashboard

A full-stack monitoring and analytics platform designed to efficiently query and visualize large-scale multi-modal sensor data. The system ensures high data reliability through Python-based preprocessing and features a scalable infrastructure managed as code with Terraform on GCP.

## 🔗 Live Demo
- **Dashboard**: [https://sensor.sandylee.work](https://sensor.sandylee.work)

## 🚀 Key Features

### 🔍 Advanced Data Exploration
- **Node-specific Filtering**: Select specific Node IDs to isolate and visualize data from individual sensor devices.
- **Customizable Time-range Queries**: Quick selection buttons for preset intervals (Today, Last 7 Days) and manual date-range pickers for flexible exploration.
- **Sensor Value Range Search**: Granular filtering for metrics such as temperature, humidity, and illumination ranges.
- **Multi-modal Visualization**: Synchronized charts and data tables for comprehensive monitoring.

### 🛠 Infrastructure & DevOps
- **Infrastructure as Code (IaC)**: Automated provisioning of GCP resources (VM instances, Firewall, Network) using Terraform.
- **Secure Communication**: SSL-encrypted traffic via Nginx reverse proxy and automated Certbot renewal.
- **CI/CD Pipeline**: Seamless automated build and deployment flow using GitHub Actions and Docker Hub.
- **Data Preprocessing**: Python (Pandas) scripts for automated Node ID normalization and raw data cleaning.

## 🏗 System Architecture

The project is built with a modern decoupled architecture:
1. **Frontend**: Next.js (TypeScript) deployed on Vercel.
2. **Backend**: Express.js (TypeScript) running in a Docker container on GCP Compute Engine.
3. **Database**: PostgreSQL for persistent sensor data storage.
4. **Proxy/Security**: Nginx with SSL for secure routing and CORS management.

## 🛠 Tech Stack

| Category | Technologies |
| :--- | :--- |
| **Frontend** | Next.js, TypeScript, Tailwind CSS, Vercel |
| **Backend** | Node.js, Express.js, TypeScript, PostgreSQL, Python (Pandas) |
| **Infrastructure** | Terraform, GCP (Compute Engine), Docker, Docker Compose |
| **DevOps/Security** | GitHub Actions, Docker Hub, Nginx, Certbot (SSL) |

## 📦 Getting Started

### Prerequisites
- Docker & Docker Compose
- Terraform (for infrastructure provisioning)

### Installation & Deployment
1. **Clone the repository**
   ```bash
   git clone [https://github.com/sandyleedev/multi-modal-sensor-dashboard.git](https://github.com/sandyleedev/multi-modal-sensor-dashboard.git)
   cd multi-modal-sensor-dashboard
2. **Infrastructure Setup (Optional)**
   ```bash
   cd terraform
   terraform init
   terraform apply
   ```
3. **Backend Setup** - Create a .env file in the /server directory:
    ```bash
    DATABASE_URL=postgres://user:password@db:5432/dbname
    ALLOWED_ORIGIN=[https://sensor.sandylee.work]
    NODE_ENV=production
    ```
   
4. **Run with Docker Compose**
    ```
    docker compose up -d
    ```

## 🔒 Security & Optimization
- **CORS Policy**: Refactored to restrict API access exclusively to the production domain via environment variables.


- **Nginx Reverse Proxy**: Resolved Mixed Content and CORS blockers by unifying frontend and backend under a single SSL-secured domain.


- **Performance**: Optimized database queries for large datasets through efficient indexing and server-side filtering logic.