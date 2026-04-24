# SmartSeason Farm Field Monitoring System

## Overview

SmartSeason is a production-ready agricultural monitoring platform designed to help organizations manage farming activities across multiple locations with verified, real-time data collection. The system provides field agents with tools to report farm progress while ensuring accountability through GPS verification and visual evidence.

## Problem Statement

Modern agricultural organizations face critical challenges:
- Supervisors cannot physically visit every farm daily
- Field agents may miss important crop issues
- Decisions are often made with outdated information
- No verification system for field visits

## Solution

SmartSeason provides a structured platform for:
- **Real-time field monitoring** with GPS verification
- **Visual evidence collection** through timestamped photos
- **Automated status tracking** based on update frequency
- **Role-based access control** for admins and agents
- **Comprehensive audit trails** for all farm activities

## Key Features

### Field Agent Capabilities
- View assigned farms and current status
- Submit updates with crop stage information
- Add detailed notes about farm conditions
- Capture and upload timestamped photos
- Automatic GPS location capture
- Complete update history for each field

### Admin/Supervisor Capabilities
- Create and manage farm profiles
- Assign farms to field agents
- Monitor all farms from centralized dashboard
- View detailed farm history and updates
- Identify inactive or at-risk farms automatically
- Export data for reporting and analysis

### System Capabilities
- Automatic field status calculation (Active/At Risk/Completed)
- GPS location verification for field visits
- Image storage and management via Cloudinary
- Real-time dashboard with comprehensive metrics
- Secure authentication and authorization
- Mobile-responsive design for field use

## Technology Stack

### Backend
- **Node.js** with Express.js framework
- **PostgreSQL** database with Prisma ORM
- **JWT Authentication** for secure access
- **Multer** for file upload handling
- **Cloudinary** for image storage
- **bcryptjs** for password hashing

### Frontend
- **React 18** with modern hooks and features
- **Vite** for fast development and building
- **Tailwind CSS** for responsive styling
- **React Router** for navigation
- **Axios** for API communication
- **Lucide React** for icons

### Infrastructure
- **Netlify** for frontend hosting
- **Railway** for backend deployment
- **Neon PostgreSQL** for managed database
- **Cloudinary** for image CDN

## Quick Start

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- Git for version control

### Installation

#### Backend Setup
```bash
cd backend
npm install
cp .env.example .env  # Edit with your database credentials
npx prisma generate
npx prisma db push
npx prisma db seed
npm run dev
```

#### Frontend Setup
```bash
cd frontend
npm install
echo "VITE_API_URL=http://localhost:5000/api" > .env
npm run dev
```

### Access Points
- **Frontend Application**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **API Documentation**: http://localhost:5000/api/health

### Demo Credentials
- **Admin**: admin@shamba.com / admin123
- **Agent**: john@shamba.com / agent123
- **Agent**: mary@shamba.com / agent123

## Project Structure

```
smartseason-monitoring-system/
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Express middleware
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Utility functions
│   │   ├── config/          # Configuration files
│   │   ├── app.js           # Express app setup
│   │   └── server.js        # Server entry point
│   ├── prisma/              # Database schema and migrations
│   ├── services/            # Additional services
│   └── package.json         # Dependencies and scripts
├── frontend/                # React application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # React context providers
│   │   ├── pages/           # Route components
│   │   ├── services/        # API service layer
│   │   ├── App.jsx          # Main app component
│   │   └── main.jsx         # Entry point
│   ├── public/              # Static assets
│   └── package.json         # Dependencies and scripts
├── README.md                # This file
├── TECHNICAL_DOCUMENTATION.md # Detailed technical docs
└── .gitignore              # Git ignore rules
```

## API Documentation

Comprehensive API documentation is available in:
- **Backend/API_DOCUMENTATION.md**: Detailed endpoint documentation
- **TECHNICAL_DOCUMENTATION.md**: Complete architecture overview

### Key Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

#### Fields Management
- `GET /api/fields` - List all fields (filtered by role)
- `POST /api/fields` - Create new field (Admin only)
- `GET /api/fields/:id` - Get field details
- `PUT /api/fields/:id` - Update field (Admin only)
- `DELETE /api/fields/:id` - Delete field (Admin only)

#### Updates
- `POST /api/updates/field/:fieldId` - Submit field update
- `GET /api/updates/field/:fieldId` - Get field updates

#### Dashboard
- `GET /api/dashboard/admin` - Admin dashboard stats
- `GET /api/dashboard/agent` - Agent dashboard stats

## Database Schema

The system uses PostgreSQL with the following main entities:

### Users
- **Roles**: ADMIN, AGENT
- **Fields**: Created by admins, assigned to agents
- **Updates**: Submitted by agents

### Fields
- **Stages**: PLANTED, GROWING, READY, HARVESTED
- **Status**: Automatically calculated (Active, At Risk, Completed)
- **Location**: Optional GPS coordinates

### Updates
- **Verification**: GPS coordinates and timestamped photos
- **History**: Complete audit trail of field activities

## Field Status Logic

Fields are automatically categorized based on:

1. **Current Stage**: PLANTED, GROWING, READY, HARVESTED
2. **Last Update**: Timestamp of most recent activity
3. **Time Threshold**: 7 days without updates = "At Risk"

### Status Rules
- **Completed**: Field stage is HARVESTED
- **At Risk**: No updates for more than 7 days
- **Active**: Recent updates available

## Security Features

### Authentication
- JWT-based secure authentication
- Password hashing with bcryptjs
- Token expiration management
- Secure session handling

### Authorization
- Role-based access control (RBAC)
- Resource ownership validation
- Protected route middleware
- API endpoint permissions

### Data Protection
- Input validation and sanitization
- SQL injection prevention via Prisma ORM
- Secure file upload handling
- Rate limiting for API protection

## Deployment

### Live Application
- **Frontend**: [https://smartseasonart.netlify.app](https://smartseasonart.netlify.app)
- **Backend**: [https://amused-insight-production.up.railway.app](https://amused-insight-production.up.railway.app)

### Deployment Architecture
- **Frontend**: Netlify (React + Vite)
- **Backend**: Railway (Node.js + Express)
- **Database**: Neon PostgreSQL
- **Images**: Cloudinary CDN
- **API**: RESTful with JWT authentication

### Environment Configuration

#### Backend Environment Variables
```bash
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
PORT=5000
NODE_ENV=production
```

#### Frontend Environment Variables
```bash
VITE_API_URL=https://api.example.com/api
```

## Monitoring and Maintenance

### Health Checks
- API health endpoint: `/api/health`
- Database connectivity monitoring
- Service dependency checks

### Logging
- Request/response logging
- Error tracking and reporting
- Audit trail for user actions
- Performance metrics collection

### Performance Optimization
- Database query optimization
- Response compression
- Image optimization via CDN
- Frontend code splitting

## Use Cases

### Target Organizations
- Agricultural cooperatives
- Farm management companies
- NGO agricultural programs
- Government agricultural agencies
- Large-scale farming operations

### Real-World Applications
- Crop monitoring across multiple locations
- Field agent accountability verification
- Remote farm management and supervision
- Data-driven agricultural decision making
- Compliance and audit trail maintenance

## Contributing

### Development Guidelines
1. Follow existing code patterns and conventions
2. Ensure proper error handling and validation
3. Add appropriate logging for debugging
4. Test thoroughly before submitting changes
5. Update documentation for new features

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "Add new feature"

# Push and create pull request
git push origin feature/new-feature
```

## Future Enhancements

### High Priority
- Offline support for remote field areas
- Push notifications for at-risk farms
- Advanced analytics and reporting
- Mobile application development

### Medium Priority
- Weather data integration
- Multi-language support
- Advanced search and filtering
- Data export capabilities

### Long-term Vision
- AI-powered crop disease detection
- Drone integration for aerial monitoring
- Blockchain for immutable records
- IoT sensor integration

## Support and Contact

### Technical Documentation
- See `TECHNICAL_DOCUMENTATION.md` for detailed architecture information
- See `backend/API_DOCUMENTATION.md` for complete API reference

### Author Information
**Edwin Mwenda Mwiti**
- Email: eduedwyn5@gmail.com
- LinkedIn: www.linkedin.com/in/edwinmwiti234

## License

This project is open-source and available for learning and development purposes. See LICENSE file for details.
