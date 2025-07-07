# Posts App - Full Stack Social Media Platform

A modern, containerized full-stack social media application featuring a React frontend and Node.js backend with authentication, CRUD operations, and real-time like functionality. Built with React, Node.js, Express, Prisma, and PostgreSQL.

## Technology Stack

### Frontend

- **React 18** - Modern React with hooks and context

- **Vite** - Lightning-fast build tool and dev server

- **Tailwind CSS** - Utility-first CSS framework

- **shadcn/ui** - High-quality, accessible component library

- **React Hook Form** - Performant forms with easy validation

- **Axios** - Promise-based HTTP client

- **Lucide React** - Beautiful, customizable icons

- **React Query** - Server state management (in components)

### Backend

- **Node.js 20** (LTS) - JavaScript runtime

- **Express.js** - Web framework

- **Prisma** - Modern database ORM

- **PostgreSQL 15** - Relational database

- **JWT** - Secure authentication

- **bcryptjs** - Password hashing

### DevOps & Tools

- **Docker & Docker Compose** - Multi-container orchestration

- **pgAdmin** - Database management interface

- **ESLint** - Code linting and formatting

- **PostCSS** - CSS processing

- **Environment Variables** - Secure configuration

## Quick Start

### Prerequisites

- [Docker](https://www.docker.com/get-started) and Docker Compose

- [Node.js](https://nodejs.org/) (for generating JWT secret)

### Installation

1.  **Clone the repository**

```bash

git clone https://github.com/Vasilis-Rousis/posts-app.git

cd posts-app

```

2.  **Set up environment variables**

Create a `.env` file at the _root_ of the project:

```env

# Database

POSTGRES_DB=posts_app

POSTGRES_USER=admin

POSTGRES_PASSWORD=password123

DATABASE_URL=postgresql://admin:password123@postgres:5432/posts_app



# pgAdmin

PGADMIN_DEFAULT_EMAIL=admin@admin.com

PGADMIN_DEFAULT_PASSWORD=admin123



# Backend

JWT_SECRET=yourgeneratedjwtsecret

NODE_ENV=development

PORT=3001



# Frontend

FRONTEND_PORT=3000

VITE_API_URL=http://localhost:3001/api



# Docker Ports

POSTGRES_PORT=5432

PGADMIN_PORT=8080

```

3.  **Generate a secure JWT secret**

```bash

node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

```

Copy the output and replace `yourgeneratedjwtsecret` in the `.env` file.

4.  **Start the full application**

```bash

docker-compose up --build

```

5.  **Verify the setup**

```bash

# Test API health

curl http://localhost:3001/api/health



# Test frontend

curl http://localhost:3000



# Run comprehensive API tests

node test-api.js

```

## Access Points

| **Frontend App** | http://localhost:3000 | - | React application |

| **API Base** | http://localhost:3001 | - | Backend API |

| **API Health** | http://localhost:3001/api/health | - | Health check endpoint |

| **pgAdmin** | http://localhost:8080 | admin@admin.com / admin123 | Database management interface |

| **Database** | localhost:5432 | admin / password123 | Direct PostgreSQL connection |

## Database Schema

### Entity Relationships

```

Users (1) ←→ (N) Posts

Users (N) ←→ (N) Posts (through Likes)

```

### Sample Data

The application automatically seeds with:

- **10 users** from JSONPlaceholder API with hashed passwords

- **100 posts** with realistic content

- **8 sample likes** for demonstration

### Making Changes

**Frontend Code Changes:**

- React components auto-reload with Vite HMR

- Tailwind classes compile on-demand

- No rebuild needed for most changes

**Backend Code Changes:**

- Node.js auto-reloads with nodemon

- API endpoints update immediately

**Database Schema Changes:**

```bash

# After modifying prisma/schema.prisma

docker-compose  exec  backend  npm  run  db:push

docker-compose  restart  backend

```

**Dependency Changes:**

```bash

# Frontend

docker-compose  build  --no-cache  frontend



# Backend

docker-compose  build  --no-cache  backend

```

## Security Features

### Frontend Security

- **XSS Protection** - Input sanitization and validation

- **CSRF Protection** - SameSite cookie settings

- **Content Security Policy** - Restricted script execution

- **Secure Storage** - Safe token storage practices

### Backend Security

- **Password Hashing** - bcryptjs with salt rounds

- **JWT Authentication** - Secure token-based auth

- **Input Validation** - Server-side validation

- **SQL Injection Protection** - Prisma ORM safety
