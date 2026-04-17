# SmartSeason Field Monitoring System

A full-stack web application for tracking crop progress across multiple agricultural fields during a growing season. Built for Shamba Records technical assessment.

## Overview

SmartSeason enables agricultural coordinators (Admins) and field agents to collaborate on monitoring farm fields, tracking crop stages, and ensuring timely updates for optimal crop management.

### Key Features

- **Role-based Access Control**: Admin and Field Agent roles with appropriate permissions
- **Field Management**: Create, assign, and track agricultural fields
- **Real-time Updates**: Field agents can update crop stages with notes, photos, and GPS location
- **Automatic Status Calculation**: Fields automatically classified as Active, At Risk, or Completed
- **Dashboard Analytics**: Role-specific dashboards with field statistics and insights
- **Mobile-friendly Design**: Responsive UI optimized for field use

## Tech Stack

### Backend
- **Node.js** with Express.js
- **PostgreSQL** with Prisma ORM
- **JWT Authentication**
- **Multer** for file uploads
- **Cloudinary** integration (optional) for image storage

### Frontend
- **React 18** with Vite
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API communication
- **Lucide React** for icons

## Project Structure

```
smartseason-monitoring-system/
|
|-- backend/
|   |-- src/
|   |   |-- controllers/     # Route handlers
|   |   |-- middleware/     # Auth, upload, role middleware
|   |   |-- routes/         # API routes
|   |   |-- services/       # Business logic
|   |   |-- config/         # Database and cloud configs
|   |   |-- app.js          # Express app setup
|   |   |-- server.js       # Server entry point
|   |-- prisma/
|   |   |-- schema.prisma   # Database schema
|   |   |-- seed.js         # Database seeding
|   |-- .env                # Environment variables
|   |-- package.json
|
|-- frontend/
|   |-- src/
|   |   |-- components/     # Reusable UI components
|   |   |-- pages/          # Page components
|   |   |-- context/        # React context (Auth)
|   |   |-- services/       # API service
|   |   |-- App.jsx         # Main app component
|   |   |-- main.jsx        # Entry point
|   |-- .env                # Frontend environment variables
|   |-- package.json
|
|-- README.md
```

## Database Design

### Core Entities

1. **Users**: Admins and Field Agents with role-based permissions
2. **Fields**: Agricultural plots with crop information and GPS coordinates
3. **Field Updates**: Progress reports with stage, notes, images, and location data

### Relationships

- Admin creates fields and assigns to agents
- Agents update field progress
- Fields have many updates over time
- Status computed from stage and update frequency

## Business Logic

### Field Status Calculation

- **Completed**: Field stage is HARVESTED
- **At Risk**: No updates for more than 7 days
- **Active**: Regular updates and not harvested

### Crop Stages Lifecycle

1. **PLANTED** -> Initial planting
2. **GROWING** -> Crop development
3. **READY** -> Ready for harvest
4. **HARVESTED** -> Harvest completed

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- Git

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your database URL and JWT secret.

4. Set up Prisma:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Seed the database:
   ```bash
   npx prisma db seed
   ```

6. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   echo "VITE_API_URL=http://localhost:5000/api" > .env
   ```

4. Start the frontend:
   ```bash
   npm run dev
   ```

## Demo Credentials

### Admin Account
- **Email**: admin@shamba.com
- **Password**: admin123

### Agent Accounts
- **Email**: john@shamba.com
- **Password**: agent123
- **Email**: mary@shamba.com
- **Password**: agent123

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Fields
- `GET /api/fields` - Get all fields (filtered by role)
- `POST /api/fields` - Create new field (Admin only)
- `GET /api/fields/:id` - Get field details
- `PUT /api/fields/:id` - Update field (Admin only)
- `DELETE /api/fields/:id` - Delete field (Admin only)

### Updates
- `POST /api/updates/field/:id` - Add field update
- `GET /api/updates/field/:id` - Get field updates

### Users
- `GET /api/users/agents` - Get all agents (Admin only)

### Dashboard
- `GET /api/dashboard/admin` - Admin dashboard stats
- `GET /api/dashboard/agent` - Agent dashboard stats

## Design Decisions

### Architecture Choices

1. **Monorepo Structure**: Backend and frontend in same repository for easier development
2. **Prisma ORM**: Type-safe database access with excellent migration support
3. **JWT Authentication**: Stateless authentication with role-based access
4. **RESTful API**: Clean, predictable API design
5. **Component-based Frontend**: Reusable React components with clear separation

### Status Logic

The field status algorithm prioritizes:
- Recent updates (within 7 days) = Active
- No recent updates = At Risk
- Harvested stage = Completed

This simple logic ensures fields needing attention are highlighted while avoiding false positives.

### Image Upload Strategy

- **Development**: Local file storage for simplicity
- **Production**: Cloudinary integration for scalable image handling
- **GPS Verification**: Location capture ensures field visits

## Assumptions Made

1. **Internet Connectivity**: Agents have periodic internet access for sync
2. **GPS Availability**: Mobile devices can capture location coordinates
3. **Image Quality**: Photos are sufficient for basic verification
4. **Update Frequency**: Weekly updates are expected for active fields
5. **Single Agent Assignment**: Each field has one primary agent

## Future Enhancements

1. **Offline Support**: Local storage for updates when offline
2. **Push Notifications**: Alerts for at-risk fields
3. **Advanced Analytics**: Yield predictions and trend analysis
4. **Multi-language Support**: Localized interface for field agents
5. **Batch Operations**: Bulk field updates and assignments
6. **Audit Trail**: Complete history of all changes

## Deployment

### Backend Deployment (Render/Railway)
1. Connect PostgreSQL database
2. Set environment variables
3. Deploy Node.js application
4. Run database migrations

### Frontend Deployment (Vercel/Netlify)
1. Set API URL environment variable
2. Build static files
3. Deploy to hosting platform

## Security Considerations

- JWT tokens for authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation and sanitization
- File upload restrictions
- CORS configuration

## Performance Optimizations

- Database indexing on frequently queried fields
- Image compression and resizing
- API response caching where appropriate
- Lazy loading for large datasets
- Optimized database queries with Prisma

## Testing Strategy

- Unit tests for business logic
- Integration tests for API endpoints
- E2E tests for critical user flows
- Database seeding for consistent test data

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request

## License

This project is for demonstration purposes as part of a technical assessment.

## Contact

Built for Shamba Records technical assessment by [Your Name].

---

**Note**: This is a demonstration project. For production use, additional security, testing, and monitoring would be required.
