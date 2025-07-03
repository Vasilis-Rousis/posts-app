# Posts App - Full Stack Social Media API

A modern, containerized social media backend API with authentication, CRUD operations, and real-time like functionality. Built with Node.js, Express, Prisma, and PostgreSQL.

![Node.js](https://img.shields.io/badge/Node.js-20-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)
![Docker](https://img.shields.io/badge/Docker-Containerized-blue)
![Prisma](https://img.shields.io/badge/Prisma-ORM-indigo)
![JWT](https://img.shields.io/badge/Auth-JWT-orange)

## 🚀 Features

### Core Functionality

- **User Authentication** - Secure registration and login with JWT tokens
- **Post Management** - Create, read, update, delete posts with pagination
- **Social Features** - Like/unlike posts, view liked posts
- **User Profiles** - User information with post and like statistics
- **Search & Pagination** - Efficient data retrieval with pagination support

### Technical Excellence

- **Docker Containerization** - One-command setup with Docker Compose
- **Smart Database Seeding** - Automatic population with sample data
- **Professional API Design** - RESTful endpoints with proper error handling
- **Environment Management** - Secure configuration with environment variables
- **Database Relations** - Proper foreign keys and cascade operations
- **Production Ready** - Follows industry best practices

## 🛠️ Technology Stack

### Backend

- **Node.js 20** (LTS) - JavaScript runtime
- **Express.js** - Web framework
- **Prisma** - Modern database ORM
- **PostgreSQL 15** - Relational database
- **JWT** - Secure authentication
- **bcryptjs** - Password hashing

### DevOps

- **Docker & Docker Compose** - Containerization
- **pgAdmin** - Database management interface
- **Environment Variables** - Secure configuration
- **Automated Setup** - One-command deployment

## 📋 Quick Start

### Prerequisites

- [Docker](https://www.docker.com/get-started) and Docker Compose
- [Node.js](https://nodejs.org/) (for generating JWT secret)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Vasilis-Rousis/posts-app.git
   cd posts-app
   ```

2. **Set up environment variables**

   Create a .env file at the *root* of the project with these values
   
   ```env
   # Database
   POSTGRES_DB=posts_app
   POSTGRES_USER=admin
   POSTGRES_PASSWORD=yourpostgrespassword
   DATABASE_URL=postgresql://admin:password123@postgres:5432/posts_app
   
   # pgAdmin
   PGADMIN_DEFAULT_EMAIL=admin@admin.com
   PGADMIN_DEFAULT_PASSWORD=yourpgadminpassword
   
   # Backend
   JWT_SECRET=yourgeneratedjwtsecret
   NODE_ENV=development
   PORT=3001
   
   # Frontend
   FRONTEND_PORT=3000
   VITE_API_URL=http://localhost:3001/api
   
   # Docker
   POSTGRES_PORT=5432
   PGADMIN_PORT=8080
   ```

3. **Generate a secure JWT secret**

   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

   Copy the output and replace `your_generated_jwt_secret_here` in the `.env` file.

4. **Start the application**

   ```bash
   docker-compose up --build
   ```

5. **Verify the setup**

   ```bash
   # Test API health
   curl http://localhost:3001/api/health

   # Run comprehensive tests
   node test-api.js
   ```

### What Happens Automatically

The setup process will:

- 🏗️ Build all containers (PostgreSQL, pgAdmin, Backend API)
- ⏳ Wait for PostgreSQL to be ready
- 🔧 Generate Prisma client and apply database schema
- 🌱 Seed database with sample data (100 posts, 10 users) **only if empty**
- 🚀 Start the API server with auto-reload

## 🌐 Access Points

| Service        | URL                              | Credentials                |
| -------------- | -------------------------------- | -------------------------- |
| **API Base**   | http://localhost:3001            | -                          |
| **API Health** | http://localhost:3001/api/health | -                          |
| **pgAdmin**    | http://localhost:8080            | admin@admin.com / admin123 |
| **Database**   | localhost:5432                   | admin / password123        |

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint             | Description       | Auth Required |
| ------ | -------------------- | ----------------- | ------------- |
| `POST` | `/api/auth/register` | Register new user | ❌            |
| `POST` | `/api/auth/login`    | User login        | ❌            |

**Example Registration:**

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Example Login:**

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Posts Endpoints

| Method   | Endpoint         | Description               | Auth Required |
| -------- | ---------------- | ------------------------- | ------------- |
| `GET`    | `/api/posts`     | Get all posts (paginated) | ✅            |
| `POST`   | `/api/posts`     | Create new post           | ✅            |
| `GET`    | `/api/posts/:id` | Get single post           | ✅            |
| `PUT`    | `/api/posts/:id` | Update post (author only) | ✅            |
| `DELETE` | `/api/posts/:id` | Delete post (author only) | ✅            |

**Query Parameters for GET /api/posts:**

- `page` - Page number (default: 1)
- `limit` - Posts per page (default: 10)
- `search` - Search in title/body

**Example:**

```bash
# Get posts with pagination and search
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3001/api/posts?page=1&limit=5&search=test"
```

### Likes Endpoints

| Method   | Endpoint                      | Description            | Auth Required |
| -------- | ----------------------------- | ---------------------- | ------------- |
| `POST`   | `/api/posts/:id/like`         | Toggle like on post    | ✅            |
| `GET`    | `/api/user/liked-posts`       | Get user's liked posts | ✅            |
| `DELETE` | `/api/user/liked-posts/clear` | Clear all user's likes | ✅            |

### User Endpoints

| Method | Endpoint            | Description              | Auth Required |
| ------ | ------------------- | ------------------------ | ------------- |
| `GET`  | `/api/user/profile` | Get current user profile | ✅            |
| `GET`  | `/api/user/posts`   | Get user's own posts     | ✅            |

## 🧪 Testing

### Automated Testing

```bash
# Run the comprehensive test suite
node test-api.js
```

This will test:

- User registration and authentication
- Post creation and retrieval
- Like/unlike functionality
- User profile endpoints
- Error handling

### Manual Testing

**Sample User Credentials** (available after seeding):

```
Email: Sincere@april.biz
Password: password123
```

### Health Check

```bash
curl http://localhost:3001/api/health
```

## 🗄️ Database

### Schema Overview

- **Users** - User accounts with authentication
- **Posts** - User-generated content with metadata
- **Likes** - Many-to-many relationship between users and posts

### Sample Data

The application automatically seeds the database with:

- **10 users** from JSONPlaceholder API
- **100 posts** from JSONPlaceholder API
- **8 sample likes** for demonstration

### Database Management

Access pgAdmin at http://localhost:8080 to:

- View and edit data
- Run custom queries
- Monitor database performance
- Manage schema

## 🔧 Development

### Project Structure

```
posts-app/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma      # Database schema
│   ├── scripts/
│   │   └── seed.js            # Database seeding
│   ├── server.js              # Main application
│   ├── package.json           # Dependencies
│   └── Dockerfile             # Container config
├── docker-compose.yml         # Multi-container setup
├── .env.example               # Environment template
├── test-api.js                # API test suite
└── README.md                  # This file
```

### Available Scripts

**Backend:**

```bash
npm run dev          # Start development server
npm run start        # Start production server
npm run db:seed      # Seed database
npm run db:reset     # Reset and reseed database
npm run db:studio    # Open Prisma Studio
```

**Docker:**

```bash
docker-compose up --build     # Build and start all services
docker-compose down           # Stop all services
docker-compose logs backend   # View backend logs
```

### Making Changes

**Code Changes:**

- Backend code changes auto-reload with nodemon
- No rebuild needed for JavaScript changes

**Schema Changes:**

```bash
# After modifying prisma/schema.prisma
docker-compose restart backend
```

**Dependency Changes:**

```bash
# After modifying package.json
docker-compose build --no-cache backend
docker-compose up
```

## 🔒 Security Features

- **Password Hashing** - bcryptjs with salt rounds
- **JWT Authentication** - Secure token-based auth (24h expiry)
- **Input Validation** - Server-side validation for all inputs
- **SQL Injection Protection** - Prisma ORM prevents SQL injection
- **Environment Variables** - Sensitive data in environment files
- **CORS Configuration** - Cross-origin resource sharing setup


## 📈 Performance Features

- **Connection Pooling** - Efficient database connections via Prisma
- **Pagination** - Large datasets handled efficiently
- **Indexing** - Database indexes on frequently queried fields
- **Alpine Images** - Lightweight Docker containers
- **Lazy Loading** - Efficient data fetching strategies

## 🚢 Production Considerations

### Deployment Checklist

- [ ] Change default passwords in production
- [ ] Use strong JWT secrets (64+ characters)
- [ ] Set shorter JWT expiry times (15m-2h)
- [ ] Enable HTTPS/TLS
- [ ] Set up database backups
- [ ] Configure logging and monitoring
- [ ] Use production-grade database hosting
- [ ] Set up CI/CD pipeline

### Scaling Considerations

- Add Redis for session management
- Implement rate limiting
- Add caching layers
- Database read replicas
- Load balancing
- Container orchestration (Kubernetes)

## 🐛 Troubleshooting

### Common Issues

**Database Connection Failed:**

```bash
# Check if PostgreSQL is running
docker-compose logs postgres

# Restart database
docker-compose restart postgres
```

**Port Already in Use:**

```bash
# Change ports in .env file
PORT=3002
POSTGRES_PORT=5433
PGADMIN_PORT=8081
```

**Prisma Client Issues:**

```bash
# Regenerate Prisma client
docker exec posts_backend npm run db:generate
```

**Reset Everything:**

```bash
# Nuclear option - complete reset
docker-compose down -v
docker system prune -a
docker-compose up --build
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📞 Support

For questions or issues:

- Check the troubleshooting section above
- Review the API documentation
- Check Docker logs: `docker-compose logs`
- Verify environment variables in `.env`

---

**Built with ❤️ using modern web technologies and best practices.**
