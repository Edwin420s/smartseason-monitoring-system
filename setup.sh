#!/bin/bash

echo "=== SmartSeason Field Monitoring System Setup ==="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "Error: Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "Node.js version: $(node -v) - OK"

# Check if PostgreSQL is running (optional warning)
if ! command -v psql &> /dev/null; then
    echo "Warning: PostgreSQL client not found. Please ensure PostgreSQL is installed and running."
    echo "You can use a cloud database service like Supabase or Neon if not installed locally."
    echo ""
fi

# Backend setup
echo "=== Setting up Backend ==="
cd backend

# Install dependencies
echo "Installing backend dependencies..."
npm install

# Check if .env exists
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cat > .env << EOF
# Server
PORT=5000

# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/smartseason?schema=public"

# JWT
JWT_SECRET=smartseason-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Cloudinary (optional - set to false to use local storage)
USE_CLOUDINARY=false
EOF
    echo "Created .env file. Please update with your database credentials."
else
    echo ".env file already exists."
fi

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Database setup
echo "Setting up database..."
echo "Please ensure your PostgreSQL database is running and update DATABASE_URL in .env if needed."
read -p "Press Enter to continue with database setup..."

# Push database schema
echo "Pushing database schema..."
npx prisma db push

# Seed database
echo "Seeding database..."
npx prisma db seed

echo "Backend setup complete!"
echo ""

# Frontend setup
echo "=== Setting up Frontend ==="
cd ../frontend

# Install dependencies
echo "Installing frontend dependencies..."
npm install

# Create .env if not exists
if [ ! -f .env ]; then
    echo "Creating .env file..."
    echo "VITE_API_URL=http://localhost:5000/api" > .env
    echo "Created .env file."
else
    echo ".env file already exists."
fi

echo "Frontend setup complete!"
echo ""

# Go back to root
cd ..

echo "=== Setup Complete! ==="
echo ""
echo "To start the application:"
echo "1. Start backend: cd backend && npm run dev"
echo "2. Start frontend: cd frontend && npm run dev"
echo ""
echo "Demo Credentials:"
echo "Admin: admin@shamba.com / admin123"
echo "Agent: john@shamba.com / agent123"
echo "Agent: mary@shamba.com / agent123"
echo ""
echo "Access the application at: http://localhost:5173"
echo "Backend API at: http://localhost:5000/api"
