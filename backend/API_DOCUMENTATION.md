# SmartSeason API Documentation

## Overview

The SmartSeason API provides endpoints for agricultural field monitoring, user management, and real-time data collection with GPS verification and image upload capabilities.

## Base URL
```
http://localhost:5000/api
```

## Authentication

The API uses JWT (JSON Web Token) authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Rate Limiting

- **General endpoints**: 100 requests per 15 minutes per IP
- **Authentication endpoints**: 5 requests per 15 minutes per IP  
- **Update submissions**: 10 requests per minute per IP

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Maximum requests per window
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Time when rate limit resets (Unix timestamp)

## Error Response Format

All errors follow this structure:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2026-04-24T08:00:00.000Z",
  "details": "Additional error details (if applicable)"
}
```

## Endpoints

### Authentication

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "name": "John Agent",
  "email": "john@shamba.com",
  "password": "agent123",
  "role": "AGENT",
  "phone": "+254711111111"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "name": "John Agent",
    "email": "john@shamba.com",
    "role": "AGENT",
    "phone": "+254711111111"
  },
  "token": "jwt-token"
}
```

**Validation Rules:**
- `name`: 2-100 characters, required
- `email`: Valid email format, required
- `password`: Min 8 characters, at least 1 letter and 1 number, required
- `role`: "ADMIN" or "AGENT", optional (defaults to AGENT)
- `phone`: Valid phone number, optional

---

#### POST /auth/login
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "john@shamba.com",
  "password": "agent123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "name": "John Agent",
    "email": "john@shamba.com",
    "role": "AGENT",
    "phone": "+254711111111"
  },
  "token": "jwt-token"
}
```

---

#### GET /auth/me
Get current user profile (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "id": "uuid",
  "name": "John Agent",
  "email": "john@shamba.com",
  "role": "AGENT",
  "phone": "+254711111111"
}
```

---

### Fields Management

#### GET /fields
Get all fields (filtered by user role).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response (Admin):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": "uuid",
      "name": "Nairobi Plot A",
      "cropType": "Maize",
      "plantingDate": "2026-03-01",
      "currentStage": "GROWING",
      "status": "Active",
      "locationLat": -1.2921,
      "locationLng": 36.8219,
      "assignedAgent": {
        "id": "uuid",
        "name": "John Agent",
        "email": "john@shamba.com"
      },
      "createdBy": {
        "id": "uuid",
        "name": "Admin User"
      },
      "updatesCount": 3
    }
  ]
}
```

**Response (Agent):** Only fields assigned to the agent

---

#### POST /fields
Create a new field (Admin only).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "name": "Nairobi Plot A",
  "cropType": "Maize",
  "plantingDate": "2026-03-01",
  "assignedAgentId": "uuid",
  "locationLat": -1.2921,
  "locationLng": 36.8219
}
```

**Validation Rules:**
- `name`: 2-100 characters, required
- `cropType`: 2-50 characters, required
- `plantingDate`: Valid date, required
- `assignedAgentId`: Valid UUID, required
- `locationLat`: -90 to 90, optional
- `locationLng`: -180 to 180, optional

---

#### GET /fields/:id
Get a specific field by ID.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Nairobi Plot A",
    "cropType": "Maize",
    "plantingDate": "2026-03-01",
    "currentStage": "GROWING",
    "status": "Active",
    "locationLat": -1.2921,
    "locationLng": 36.8219,
    "assignedAgent": {
      "id": "uuid",
      "name": "John Agent",
      "email": "john@shamba.com"
    },
    "updates": [
      {
        "id": "uuid",
        "stage": "GROWING",
        "notes": "Germination good, some weeds present",
        "imageUrl": "https://example.com/image.jpg",
        "latitude": -1.2922,
        "longitude": 36.8220,
        "createdAt": "2026-04-21T10:00:00.000Z",
        "updatedBy": {
          "id": "uuid",
          "name": "John Agent"
        }
      }
    ]
  }
}
```

---

#### PUT /fields/:id
Update field details (Admin only).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "name": "Updated Field Name",
  "cropType": "Beans",
  "assignedAgentId": "uuid",
  "locationLat": -1.2921,
  "locationLng": 36.8219
}
```

---

#### DELETE /fields/:id
Delete a field (Admin only).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Field deleted successfully"
}
```

---

### Field Updates

#### POST /updates/field/:fieldId
Submit a field update (Agent or Admin).

**Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: multipart/form-data
```

**Request Body (FormData):**
```
stage: GROWING
notes: Germination good, some weeds present
latitude: -1.2922
longitude: 36.8220
image: [file]
```

**Validation Rules:**
- `stage`: "PLANTED", "GROWING", "READY", or "HARVESTED", required
- `notes`: Max 1000 characters, optional
- `latitude`: -90 to 90, optional
- `longitude`: -180 to 180, optional
- `image`: Image file, optional

**Response:**
```json
{
  "success": true,
  "message": "Field update logged successfully",
  "data": {
    "update": {
      "id": "uuid",
      "stage": "GROWING",
      "notes": "Germination good, some weeds present",
      "imageUrl": "https://example.com/image.jpg",
      "latitude": -1.2922,
      "longitude": 36.8220,
      "createdAt": "2026-04-21T10:00:00.000Z"
    },
    "computedStatus": "Active"
  }
}
```

---

#### GET /updates/field/:fieldId
Get all updates for a specific field.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": "uuid",
      "stage": "GROWING",
      "notes": "Germination good, some weeds present",
      "imageUrl": "https://example.com/image.jpg",
      "latitude": -1.2922,
      "longitude": 36.8220,
      "createdAt": "2026-04-21T10:00:00.000Z",
      "updatedBy": {
        "id": "uuid",
        "name": "John Agent"
      }
    }
  ]
}
```

---

### Users

#### GET /users/agents
Get all agents (Admin only).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "John Agent",
      "email": "john@shamba.com",
      "role": "AGENT",
      "phone": "+254711111111"
    }
  ]
}
```

---

### Dashboard

#### GET /dashboard/admin
Get admin dashboard statistics (Admin only).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "summary": {
    "totalFields": 10,
    "active": 7,
    "atRisk": 2,
    "completed": 1,
    "agents": 3
  }
}
```

---

#### GET /dashboard/agent
Get agent dashboard statistics (Agent only).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "summary": {
    "totalAssigned": 5,
    "active": 4,
    "atRisk": 1,
    "completed": 0
  }
}
```

---

## Field Status Logic

Fields are automatically categorized based on the latest update:

- **Active**: Recent updates (within 7 days) or current stage is not HARVESTED
- **At Risk**: No updates for more than 7 days and not harvested
- **Completed**: Current stage is HARVESTED

## Image Upload

- Supported formats: JPEG, PNG, GIF
- Maximum file size: 5MB
- Images are stored on Cloudinary (or locally in development)
- Image URL is returned in the response

## GPS Coordinates

- Latitude must be between -90 and 90
- Longitude must be between -180 and 180
- Coordinates are optional but recommended for verification

## Error Codes

| Code | HTTP Status | Description |
|------|------------|-------------|
| VALIDATION_ERROR | 400 | Request validation failed |
| INVALID_CREDENTIALS | 401 | Authentication failed |
| UNAUTHORIZED | 401 | No authentication token provided |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| EMAIL_ALREADY_EXISTS | 409 | Email already registered |
| RATE_LIMIT_EXCEEDED | 429 | Too many requests |
| INTERNAL_ERROR | 500 | Server error |

## Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run database migrations: `npx prisma db push`
5. Seed database: `npx prisma db seed`
6. Start server: `npm run dev`

The API will be available at `http://localhost:5000/api`

## Testing

Use the provided demo credentials:
- Admin: `admin@shamba.com` / `admin123`
- Agent: `john@shamba.com` / `agent123`

## Logging

The API includes comprehensive logging:
- Request/response logging
- Audit logging for important actions
- Error logging with stack traces
- Logs are stored in the `logs/` directory

## Security Features

- JWT authentication with expiration
- Password hashing with bcrypt
- Rate limiting to prevent abuse
- Input validation and sanitization
- Role-based access control
- HTTPS recommended for production
