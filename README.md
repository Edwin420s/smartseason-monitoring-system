# Farm Field Monitoring System

## Overview

The Farm Field Monitoring System is a simple and reliable platform designed to help organizations track farming activities across multiple locations. It connects field agents working on farms with supervisors who need real-time updates and visibility.

The system improves how farm data is collected, verified, and monitored by combining regular updates, location tracking, and visual evidence.

## Problem

Managing multiple farms can be challenging, especially when supervisors rely on delayed or unverified reports. It becomes difficult to:

- Confirm whether field visits actually happened
- Track crop progress accurately
- Identify farms that need attention
- Maintain consistent reporting

## Solution

This system provides a structured way for field agents to report farm progress while ensuring accountability and transparency.

Each update includes:
- The current stage of the crops
- Notes about farm conditions
- The location where the update was made
- A photo showing the actual state of the farm

Supervisors can then monitor all farms from a single dashboard and make informed decisions quickly.

## Features

### Field Agent Capabilities
- View assigned farms
- Submit updates on crop progress
- Add notes about farm conditions
- Capture and upload images
- Automatically include location during updates

### Admin / Supervisor Capabilities
- Create and manage farms
- Assign farms to agents
- View updates from all farms
- Monitor farm progress in real-time
- Identify inactive or at-risk farms

### System Capabilities
- Tracks crop stages from planting to harvest
- Flags farms with no recent updates
- Stores visual and location-based evidence
- Provides a centralized monitoring dashboard

## How It Works

1. A farm is registered and assigned to a field agent
2. The agent visits the farm
3. The agent records:
   - Crop stage
   - Notes
   - A photo
   - Location (automatically captured)
4. The update is submitted to the system
5. Supervisors can instantly view the update on the dashboard

## Farm Status Logic

Each farm is automatically categorized based on updates:

- **Active** - Recent updates available
- **At Risk** - No updates for a while
- **Completed** - Crops have been harvested

## System Structure

The system is divided into two main parts:

### Frontend
User interface for agents and supervisors
Allows data entry, viewing, and interaction

### Backend
Handles data storage and processing
Manages updates, users, and farm records

## Project Structure
```
project/
|
|-- frontend/       # User interface
|-- backend/        # Server and logic
|-- README.md       # Project documentation
```

## User Roles

| Role | Description |
|------|-------------|
| Admin | Manages farms and monitors all activities |
| Agent | Visits farms and submits updates |

## Key Highlights

- Real-time farm monitoring
- Verified updates using location and images
- Easy-to-use interface
- Scalable for large agricultural operations
- Improves accountability and transparency

## Tech Stack

### Backend
- Node.js with Express.js
- PostgreSQL with Prisma ORM
- JWT Authentication
- Multer for file uploads

### Frontend
- React 18 with Vite
- Tailwind CSS for styling
- React Router for navigation
- Axios for API communication

## Quick Start

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database (local or cloud)

### One-Command Setup
```bash
# Clone and run setup
git clone <repository-url>
cd smartseason-monitoring-system
./setup.sh
```

### Manual Setup

#### Backend
```bash
cd backend
npm install
cp .env.example .env  # Edit with your database credentials
npx prisma generate
npx prisma db push
npx prisma db seed
npm run dev
```

#### Frontend
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

## Use Cases

- Agricultural organizations managing multiple farms
- NGOs monitoring farming projects
- Government agricultural programs
- Farm cooperatives

## Future Improvements

- Notifications for missed updates
- Data insights and reporting
- Offline support for remote areas
- Crop health analysis from images
- Mobile app version

## Contributing

Contributions are welcome! Feel free to fork the project and submit improvements.

## License

This project is open-source and available for learning and development purposes.

## Author

Edwin Mwenda Mwiti  
Email: eduedwyn5@gmail.com  
LinkedIn: www.linkedin.com/in/edwinmwiti234
