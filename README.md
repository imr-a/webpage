# Authentication Backend

A secure Node.js Express backend for user authentication with JWT tokens, built to work with the Google-style login frontend.

## Features

- ✅ User registration and login
- ✅ JWT token authentication with refresh tokens
- ✅ Password hashing with bcrypt
- ✅ Input validation with Joi
- ✅ Rate limiting for security
- ✅ CORS support
- ✅ Security headers with Helmet
- ✅ File-based user storage (easily migrated to database)
- ✅ Environment-based configuration

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy the example environment file and customize it:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:8080
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
```

### 3. Start the Server

Development mode with auto-restart:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Authentication Routes

#### POST `/api/auth/register`
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe" // optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "name": "John Doe",
      "createdAt": "2023-01-01T00:00:00.000Z"
    },
    "token": "jwt-token",
    "refreshToken": "refresh-token"
  }
}
```

#### POST `/api/auth/login`
Login an existing user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "name": "John Doe",
      "lastLogin": "2023-01-01T00:00:00.000Z"
    },
    "token": "jwt-token",
    "refreshToken": "refresh-token"
  }
}
```

#### GET `/api/auth/me`
Get current user information (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "name": "John Doe",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "lastLogin": "2023-01-01T00:00:00.000Z"
    }
  }
}
```

#### POST `/api/auth/refresh`
Refresh JWT token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "refresh-token"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "token": "new-jwt-token",
    "refreshToken": "new-refresh-token"
  }
}
```

#### POST `/api/auth/logout`
Logout user and invalidate refresh token.

**Request Body:**
```json
{
  "refreshToken": "refresh-token"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

## Frontend Integration

To connect your frontend to this backend, update your JavaScript code:

```javascript
// Example login function
async function login(email, password) {
    try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        
        if (data.success) {
            // Store tokens
            localStorage.setItem('token', data.data.token);
            localStorage.setItem('refreshToken', data.data.refreshToken);
            
            // Redirect or update UI
            console.log('Login successful:', data.data.user);
        } else {
            console.error('Login failed:', data.message);
        }
    } catch (error) {
        console.error('Network error:', error);
    }
}

// Example authenticated request
async function getProfile() {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch('http://localhost:3000/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        
        if (data.success) {
            console.log('User profile:', data.data.user);
        }
    } catch (error) {
        console.error('Error fetching profile:', error);
    }
}
```

## Security Features

- **Password Hashing**: Uses bcrypt with 12 salt rounds
- **JWT Tokens**: Short-lived access tokens (24h) with longer refresh tokens (7d)
- **Rate Limiting**: 100 requests per 15 minutes, 5 auth requests per 15 minutes per IP
- **CORS Protection**: Configurable allowed origins
- **Input Validation**: Joi schema validation for all inputs
- **Security Headers**: Helmet.js for security headers

## File Structure

```
backend/
├── controllers/
│   └── userController.js     # User authentication logic
├── middleware/
│   └── authMiddleware.js     # JWT authentication middleware
├── models/
│   └── User.js              # User model with file storage
├── data/                    # Data storage directory (created automatically)
│   └── users.json          # User data file
├── package.json
├── server.js               # Main server file
├── .env                    # Environment variables
├── .env.example           # Environment template
└── README.md              # This file
```

## Development

### Adding New Features

1. **New Routes**: Add routes to `server.js`
2. **Controllers**: Add business logic to `controllers/`
3. **Middleware**: Add custom middleware to `middleware/`
4. **Models**: Extend the User model or add new models

### Database Migration

To migrate from file storage to a database:

1. Install database driver (e.g., `mongoose` for MongoDB)
2. Update `models/User.js` to use database operations
3. Update environment variables for database connection

### Testing

Add tests using Jest or Mocha:

```bash
npm install --save-dev jest
npm test
```

## Production Deployment

1. **Environment Variables**: Update `.env` with production values
2. **Database**: Replace file storage with a proper database
3. **HTTPS**: Use HTTPS in production
4. **Process Manager**: Use PM2 or similar for process management
5. **Logging**: Implement proper logging (Winston, etc.)
6. **Monitoring**: Add health checks and monitoring

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License