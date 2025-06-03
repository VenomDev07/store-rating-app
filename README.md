# Store Rating System

A comprehensive web application for managing stores, users, and ratings with three distinct user roles: System Administrator, Normal User, and Store Owner.

## Quick Start

> **❗Important**: After downloading/cloning the project, run the following commands in order:

### Backend Setup
```bash
# Install dependencies (if not already done)
npm install

# Navigate to backend directory
cd backend/prisma

# Generate Prisma client
npx prisma generate

# Start the backend server (For Parallelly Running npm run start:dev & npx prisma studio)
npm run dev

# Can also start seperate
npm run start:dev

# Then
npx prisma studio 
```

### Frontend Setup
```bash
# Navigate to frontend directory (in a new terminal)
cd frontend

# Install dependencies (if not already done)
npm install

# Start the frontend development server
npm run dev
```

## Project Overview

This application provides a platform for managing stores and collecting user ratings with role-based access control. The system supports three user types with distinct functionalities and permissions.

## User Roles & Functionalities

### 👨‍💻System Administrator
**Full system control and management capabilities**

**User Management**
- Add new stores, normal users, and admin users
- View comprehensive user lists with Name, Email, Address, and Role
- Apply filters on all listings (Name, Email, Address, Role)
- View detailed user profiles including ratings for Store Owners

**Store Owner Creation Process**
- When creating a new store, administrator must select a Normal User from dropdown
- Upon store creation, the selected Normal User is automatically converted to Store Owner role  
- This ensures every store has an associated owner (❗Note: The user must be created first before store creation)
- 
**Dashboard Analytics**
- Total number of users
- Total number of stores
- Total number of submitted ratings

**Store Management**
- View all stores with Name, Email, Address, and Rating
- Comprehensive store oversight

**❗Database Management**
- Access and view all database records through Prisma Studio
- Real-time database inspection and management capabilities

**Account Management**
- Secure logout functionality

### 🙎🏻Normal User
**Store discovery and rating capabilities**

**Account Management**
- Sign up with Name, Email, Address, Password
- Secure login/logout
- Update password after authentication

**Store Interaction**
- View all registered stores
- Search stores by Name and Address
- View store details: Name, Address, Overall Rating
- See personal submitted ratings
- Submit new ratings (1-5 scale)
- Modify existing ratings

### 🏪🙎🏻Store Owner
**Store management and rating oversight**

**Account Management**
- Secure login/logout
- Update password after authentication

**Store Dashboard**
- View users who rated their store
- Monitor average store rating
- Track rating trends

## Form Validations

**Field Requirements**
- **Name**: 20-60 characters
- **Address**: Maximum 400 characters
- **Password**: 8-16 characters, must include:
  - At least one uppercase letter
  - At least one special character
- **Email**: Standard email format validation

## Key Features

**Data Management**
- **Sortable Tables**: All data tables support ascending/descending sorting
- **Advanced Filtering**: Multi-criteria filtering across all user and store listings
- **Real-time Updates**: Dynamic rating calculations and display

**User Experience**
- **Responsive Design**: Optimized for all device sizes
- **Intuitive Navigation**: Role-based interface customization
- **Secure Authentication**: Protected routes and data access

## Technical Architecture

**Frontend**
- Modern React/Vue.js application
- Responsive UI components
- State management for user sessions
- Form validation and error handling

**Backend**
- RESTful API architecture
- Database integration with Prisma ORM
- Role-based access control
- Secure authentication and authorization

**Database**
- Optimized schema design
- Proper indexing for performance
- Data integrity constraints
- Efficient relationship modeling

## Database Schema

The application uses a well-structured database with the following key entities:
- **Users** (with roles: Admin, Normal User, Store Owner)
- **Stores** (with associated ratings and owner relationships)
- **Ratings** (linking users to stores with rating values)

## Security Features

- Password encryption and secure storage
- Role-based access control (RBAC)
- Input validation and sanitization
- Protected API endpoints
- Secure session management

## Development Best Practices

**Code Quality**
- Clean, maintainable code structure
- Consistent naming conventions
- Comprehensive error handling
- Input validation on both frontend and backend

**Database Design**
- Normalized database schema
- Proper foreign key relationships
- Optimized queries for performance
- Data integrity constraints

**API Design**
- RESTful endpoints
- Consistent response formats
- Proper HTTP status codes
- Comprehensive error responses

## User Interface Features

- **Dashboard Views**: Role-specific dashboards with relevant metrics
- **Search & Filter**: Advanced search capabilities across all data
- **Sorting**: Clickable column headers for data organization
- **Responsive Design**: Mobile-friendly interface
- **Real-time Updates**: Dynamic content updates without page refresh

## Getting Started

1. **Clone the repository**
2. **Follow the Quick Start instructions above**
3. **Set up environment variables** (database connection, JWT secrets, etc.)
4. **Run database migrations** if applicable
5. **Start both backend and frontend servers**
6. **Access the application** through your browser

## API Endpoints

The application provides comprehensive REST API endpoints for:
- User authentication (login, logout, signup)
- User management (CRUD operations)
- Store management (CRUD operations)
- Rating system (submit, update, retrieve ratings)
- Dashboard analytics (user/store/rating counts)

## Contributing

Follow the established coding standards and best practices when contributing to this project. Ensure all form validations are properly implemented and tested.

## License

[Add your license information here]

---

**Note**: This application implements a complete role-based access control system with secure authentication and comprehensive data management capabilities.
