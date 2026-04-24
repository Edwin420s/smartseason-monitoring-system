# SmartSeason Technical Documentation

## Architecture Overview

SmartSeason is a full-stack agricultural monitoring system built with a modern technology stack. The system follows a client-server architecture with clear separation of concerns.

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (React)       │◄──►│   (Node.js)     │◄──►│  (PostgreSQL)   │
│                 │    │                 │    │                 │
│ - User Interface│    │ - API Endpoints │    │ - Data Storage  │
│ - State Mgmt    │    │ - Auth          │    │ - Relations     │
│ - Routing       │    │ - Validation    │    │ - Constraints   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │  Cloudinary     │
                    │  (Image Storage)│
                    └─────────────────┘
```

## Technology Stack

### Frontend
- **React 18**: Modern UI library with hooks and concurrent features
- **Vite**: Fast build tool and development server
- **React Router**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **Axios**: HTTP client for API communication

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **Prisma ORM**: Database ORM with type safety
- **PostgreSQL**: Relational database
- **JWT**: Authentication tokens
- **bcryptjs**: Password hashing
- **Multer**: File upload handling
- **Cloudinary**: Cloud image storage

### Infrastructure
- **Netlify**: Frontend hosting
- **Railway**: Backend hosting
- **Neon**: PostgreSQL database hosting
- **Cloudinary**: Image CDN and storage

## Database Schema

### Core Entities

#### User
```sql
- id: UUID (Primary Key)
- name: String
- email: String (Unique)
- password: String (Hashed)
- role: Enum (ADMIN | AGENT)
- phone: String (Optional)
- createdAt: DateTime
- updatedAt: DateTime
```

#### Field
```sql
- id: UUID (Primary Key)
- name: String
- cropType: String
- plantingDate: DateTime
- currentStage: Enum (PLANTED | GROWING | READY | HARVESTED)
- assignedAgentId: UUID (Foreign Key to User)
- createdById: UUID (Foreign Key to User)
- locationLat: Float (Optional)
- locationLng: Float (Optional)
- createdAt: DateTime
- updatedAt: DateTime
```

#### FieldUpdate
```sql
- id: UUID (Primary Key)
- fieldId: UUID (Foreign Key to Field)
- updatedById: UUID (Foreign Key to User)
- stage: Enum (PLANTED | GROWING | READY | HARVESTED)
- notes: String (Optional)
- imageUrl: String (Optional)
- latitude: Float (Optional)
- longitude: Float (Optional)
- createdAt: DateTime
```

### Relationships
- **User ↔ Field**: One-to-many (both as assigned agent and creator)
- **Field ↔ FieldUpdate**: One-to-many
- **User ↔ FieldUpdate**: One-to-many

## API Architecture

### Authentication Flow
1. User sends credentials to `/api/auth/login`
2. Backend validates credentials and generates JWT
3. JWT stored in frontend localStorage
4. Subsequent requests include JWT in Authorization header
5. Backend validates JWT for protected routes

### Route Structure
```
/api/
├── auth/
│   ├── POST /login
│   ├── POST /register
│   └── GET /me
├── fields/
│   ├── GET /
│   ├── POST /
│   ├── GET /:id
│   ├── PUT /:id
│   └── DELETE /:id
├── updates/
│   ├── POST /field/:fieldId
│   └── GET /field/:fieldId
├── users/
│   └── GET /agents
├── dashboard/
│   ├── GET /admin
│   └── GET /agent
└── health/
    └── GET /
```

### Middleware Stack
1. **CORS**: Cross-origin resource sharing
2. **JSON Parser**: Request body parsing
3. **Rate Limiting**: API abuse prevention
4. **Request Logger**: Request/response logging
5. **Auth Middleware**: JWT validation
6. **Role Middleware**: Role-based access control
7. **Validation Middleware**: Input validation
8. **Error Handler**: Centralized error handling

## Frontend Architecture

### Component Structure
```
src/
├── components/          # Reusable UI components
│   ├── FieldCard.jsx
│   ├── Navbar.jsx
│   ├── StatusBadge.jsx
│   └── UpdateForm.jsx
├── context/            # React context providers
│   └── AuthContext.jsx
├── pages/              # Route components
│   ├── Login.jsx
│   ├── AdminDashboard.jsx
│   ├── AgentDashboard.jsx
│   ├── Fields.jsx
│   ├── FieldDetails.jsx
│   └── CreateField.jsx
├── services/           # API services
│   └── api.js
├── App.jsx             # Main app component
└── main.jsx            # Entry point
```

### State Management
- **AuthContext**: Global authentication state
- **Local State**: Component-level state with useState
- **Server State**: Data fetched from API via axios

### Routing Strategy
- **Protected Routes**: Role-based access control
- **Route Guards**: Authentication checks before navigation
- **Redirects**: Automatic redirection based on user role

## Security Features

### Authentication
- **JWT Tokens**: Secure, stateless authentication
- **Password Hashing**: bcryptjs with salt rounds
- **Token Expiration**: Configurable token lifetime
- **Secure Headers**: HTTP security headers

### Authorization
- **Role-Based Access**: ADMIN vs AGENT permissions
- **Resource Ownership**: Agents can only access assigned fields
- **Route Protection**: Middleware-based route guards

### Data Validation
- **Input Sanitization**: Comprehensive input validation
- **SQL Injection Prevention**: Prisma ORM parameterized queries
- **File Upload Security**: Cloudinary handles image validation

### Rate Limiting
- **General Endpoints**: 100 requests/15 minutes
- **Auth Endpoints**: 5 requests/15 minutes
- **Update Endpoints**: 10 requests/minute

## Business Logic

### Field Status Calculation
Fields are automatically categorized based on:
- **Current Stage**: PLANTED, GROWING, READY, HARVESTED
- **Last Update**: Timestamp of most recent field update
- **Time Threshold**: 7 days without updates = "At Risk"

### Status Rules
```javascript
if (currentStage === 'HARVESTED') return 'Completed';
if (!lastUpdateDate) return 'Active';
const daysSince = (new Date() - new Date(lastUpdateDate)) / (1000 * 60 * 60 * 24);
return daysSince > 7 ? 'At Risk' : 'Active';
```

### GPS Verification
- **Location Capture**: Automatic GPS coordinates during updates
- **Field Coordinates**: Optional field location for verification
- **Audit Trail**: Complete history of field visits

## Deployment Architecture

### Production Environment
- **Frontend**: Netlify static hosting
- **Backend**: Railway container hosting
- **Database**: Neon PostgreSQL
- **Images**: Cloudinary CDN

### Environment Variables
```bash
# Backend
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Frontend
VITE_API_URL=https://api.example.com/api
```

## Monitoring and Logging

### Application Logging
- **Request Logging**: All API requests logged
- **Audit Trail**: User actions tracked
- **Error Logging**: Structured error reporting
- **Performance Metrics**: Response time tracking

### Health Checks
- **API Health**: `/api/health` endpoint
- **Database Connectivity**: Connection validation
- **Service Dependencies**: External service status

## Development Workflow

### Local Development
```bash
# Backend
cd backend
npm install
cp .env.example .env
npx prisma generate
npx prisma db push
npx prisma db seed
npm run dev

# Frontend
cd frontend
npm install
echo "VITE_API_URL=http://localhost:5000/api" > .env
npm run dev
```

### Database Management
- **Migrations**: Prisma migrate for schema changes
- **Seeding**: Sample data for development
- **Studio**: Prisma Studio for database inspection

### Code Quality
- **ESLint**: Code linting (configured)
- **Prettier**: Code formatting (configured)
- **Type Safety**: Prisma generated types
- **Error Handling**: Centralized error management

## Performance Considerations

### Frontend Optimization
- **Code Splitting**: Route-based code splitting
- **Image Optimization**: Cloudinary automatic optimization
- **Caching**: Local storage for user data
- **Lazy Loading**: Component lazy loading

### Backend Optimization
- **Database Indexing**: Proper index strategy
- **Query Optimization**: Efficient Prisma queries
- **Response Compression**: Gzip compression
- **Rate Limiting**: Prevent abuse

### Database Optimization
- **Connection Pooling**: Prisma connection management
- **Query Efficiency**: Optimized database queries
- **Index Strategy**: Proper indexing for frequent queries

## Scalability Planning

### Horizontal Scaling
- **Stateless Backend**: Easy horizontal scaling
- **Database Scaling**: Read replicas for scaling
- **CDN**: Global content delivery

### Vertical Scaling
- **Resource Monitoring**: Memory and CPU usage
- **Database Performance**: Query optimization
- **Cache Strategy**: Redis for frequently accessed data

## Future Enhancements

### Technical Improvements
- **Microservices**: Service decomposition
- **Event-Driven Architecture**: Message queues
- **Advanced Caching**: Redis implementation
- **API Versioning**: Versioned API endpoints

### Feature Enhancements
- **Real-time Updates**: WebSocket implementation
- **Offline Support**: PWA capabilities
- **Mobile Application**: React Native development
- **Advanced Analytics**: Data visualization

This technical documentation provides a comprehensive overview of the SmartSeason system architecture, implementation details, and operational considerations for developers and system administrators.
