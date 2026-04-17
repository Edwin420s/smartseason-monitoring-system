# Quick Start Guide

## Prerequisites
- Node.js 18+ installed
- PostgreSQL database (local or cloud)

## One-Command Setup

```bash
# Clone and run setup
git clone <repository-url>
cd smartseason-monitoring-system
./setup.sh
```

## Manual Setup

### Backend
```bash
cd backend
npm install
cp .env.example .env  # Edit with your database credentials
npx prisma generate
npx prisma db push
npx prisma db seed
npm run dev
```

### Frontend
```bash
cd frontend
npm install
echo "VITE_API_URL=http://localhost:5000/api" > .env
npm run dev
```

## Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api

## Login Credentials

- **Admin**: admin@shamba.com / admin123
- **Agent**: john@shamba.com / agent123
- **Agent**: mary@shamba.com / agent123

## Test the System

1. **Admin Dashboard**: View all fields, create new fields
2. **Agent Dashboard**: View assigned fields, add updates
3. **Field Updates**: Try adding GPS location and photos
4. **Status Logic**: Fields become "At Risk" after 7 days without updates

## Troubleshooting

### Database Connection Error
- Check PostgreSQL is running
- Verify DATABASE_URL in backend/.env
- Ensure database exists: `createdb smartseason`

### Frontend API Error
- Ensure backend is running on port 5000
- Check VITE_API_URL in frontend/.env
- Verify CORS is configured correctly

### Permission Denied
- Check user role in database
- Verify JWT_SECRET is set in .env
- Clear browser localStorage and login again
