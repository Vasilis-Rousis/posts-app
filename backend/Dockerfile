FROM node:18-alpine

# Install PostgreSQL client for health checks
RUN apk add --no-cache postgresql-client

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose port
EXPOSE 3001

# Start with inline script
CMD ["sh", "-c", "until pg_isready -h postgres -p 5432 -U admin; do echo 'Waiting for PostgreSQL...'; sleep 2; done && echo 'PostgreSQL ready!' && npm run db:generate && npm run db:push && npm run db:seed && npm run dev"]