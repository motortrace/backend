# Authentication Module

This module handles authentication using Supabase Auth for the vehicle service management system.

## Overview

- **Authentication Provider**: Supabase Auth
- **Token Type**: JWT (JSON Web Tokens)
- **Database**: Supabase manages auth.users, Prisma manages business data
- **Architecture**: Modular with separate routes, controllers, services, and middleware

## API Endpoints

### Public Endpoints

#### POST `/auth/signup`
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "email_confirmed_at": "2024-01-01T00:00:00Z",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### POST `/auth/login`
Authenticate user and get access token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "access_token": "jwt_token_here",
    "refresh_token": "refresh_token_here"
  }
}
```

### Protected Endpoints

All protected endpoints require the `Authorization` header:
```
Authorization: Bearer <jwt_token>
```

#### GET `/auth/me`
Get current user profile and information.

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "technician",
    "emailConfirmed": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "lastSignIn": "2024-01-01T00:00:00Z"
  },
  "profile": null,
  "message": "User profile retrieved successfully"
}
```

#### POST `/auth/logout`
Sign out the current user (client-side session only).

**Response:**
```json
{
  "message": "Signed out successfully"
}
```

## Middleware

### Authentication Middleware

```typescript
import { authenticateSupabaseToken } from './authSupabase.middleware';

// Protect a route
app.get('/protected', authenticateSupabaseToken, (req, res) => {
  // req.user is available here
  res.json({ user: req.user });
});
```

### Role-Based Authorization

```typescript
import { 
  requireRole, 
  requireAdmin, 
  requireManager,
  requireTechnician 
} from './authSupabase.middleware';

// Require specific roles
app.get('/admin', authenticateSupabaseToken, requireAdmin, (req, res) => {
  // Only admins can access
});

// Require multiple roles
app.get('/management', authenticateSupabaseToken, requireManager, (req, res) => {
  // Admins and managers can access
});

// Custom role requirements
app.get('/custom', authenticateSupabaseToken, requireRole(['technician', 'service_advisor']), (req, res) => {
  // Only technicians and service advisors can access
});
```

## User Roles

The system supports the following roles:

- `admin` - Full system access
- `manager` - Management-level access
- `service_advisor` - Service advisor access
- `inventory_manager` - Inventory management access
- `technician` - Technician access

Roles are stored in Supabase user metadata and can be set during signup or updated later.

## Error Handling

### Authentication Errors

- **401 Unauthorized**: Missing or invalid token
- **403 Forbidden**: Insufficient permissions
- **400 Bad Request**: Invalid request data

### Common Error Responses

```json
{
  "error": "Missing Authorization header",
  "message": "Please provide a valid Bearer token"
}
```

```json
{
  "error": "Invalid or expired token",
  "message": "Please login again to get a valid token"
}
```

```json
{
  "error": "Access denied",
  "message": "Required roles: admin, manager",
  "userRole": "technician"
}
```

## Testing

Use the provided test script to verify all endpoints:

```bash
# Install dependencies if needed
npm install axios

# Run the test script
npx ts-node scripts/test-auth.ts
```

The test script will:
1. Create a test user account
2. Test login functionality
3. Test protected routes
4. Test role-based access
5. Test logout functionality
6. Verify error handling

## Environment Variables

Required environment variables:

```env
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=your_anon_key_here
DATABASE_URL=your_prisma_database_url
```

## Security Considerations

1. **Token Storage**: Store tokens securely on the client side
2. **Token Expiration**: Tokens have a limited lifespan
3. **HTTPS**: Use HTTPS in production
4. **Rate Limiting**: Implement rate limiting for auth endpoints
5. **Password Policy**: Enforce strong password requirements
6. **Session Management**: Consider implementing session tracking

## Integration with Frontend

### React Native (Mobile App)

```typescript
// Store token securely
import AsyncStorage from '@react-native-async-storage/async-storage';

const storeToken = async (token: string) => {
  await AsyncStorage.setItem('authToken', token);
};

// Use token in API calls
const apiCall = async () => {
  const token = await AsyncStorage.getItem('authToken');
  const response = await fetch('/api/protected', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};
```

### React Web App

```typescript
// Store token in localStorage or secure storage
const storeToken = (token: string) => {
  localStorage.setItem('authToken', token);
};

// Use token in API calls
const apiCall = async () => {
  const token = localStorage.getItem('authToken');
  const response = await fetch('/api/protected', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};
```

## Next Steps

1. **User Profile Management**: Implement profile creation and updates
2. **Role Management**: Add admin interface for role management
3. **Password Reset**: Implement password reset functionality
4. **Email Verification**: Add email verification flow
5. **Social Login**: Add Google OAuth integration
6. **Session Tracking**: Implement server-side session management
7. **Audit Logging**: Add authentication event logging 