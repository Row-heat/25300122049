# URL Shortener Backend

A secure and efficient URL shortening service built with Node.js and Express.js with JWT authentication.

## Features

- ✅ **JWT Authentication** - Secure login with provided credentials
- ✅ **Auto-login** - Instant access with pre-configured token
- ✅ Shorten URLs with custom or auto-generated codes
- ✅ Set expiry time for shortened URLs (default: 30 minutes)
- ✅ Track click analytics and statistics with user attribution
- ✅ **Security Features** - Rate limiting, CORS, Helmet protection
- ✅ **Optional Authentication** - Works with or without login
- ✅ Request logging middleware
- ✅ Health check and API documentation endpoints

## Quick Start

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```
4. The server will start on `http://localhost:5000`

## API Endpoints

### Authentication

#### Auto-Login (Instant Access)
```
GET /auth/auto-login
```
**Response:**
```json
{
  "token_type": "Bearer",
  "access_token": "your-jwt-token",
  "expires_in": 1753774095,
  "user": {
    "email": "rohitsingh24685@hmail.com",
    "name": "rohit singh",
    "rollNo": "25300122049",
    "clientID": "e640ccbd-d324-47a7-9fac-32bb7c3ccde6"
  },
  "message": "Auto-logged in with provided credentials"
}
```

#### Manual Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "rohitsingh24685@hmail.com",
  "accessCode": "AYkwcf"
}
```

#### Get User Profile (Authenticated)
```
GET /auth/profile
Authorization: Bearer your-jwt-token
```

#### Logout
```
POST /auth/logout
Authorization: Bearer your-jwt-token
```

### URL Shortening

#### Create Short URL
```
POST /shorturls
Content-Type: application/json
Authorization: Bearer your-jwt-token (optional)

{
  "url": "https://example.com",
  "validity": 60,
  "shortcode": "custom123"
}
```

**Parameters:**
- `url` (required): The original URL to shorten
- `validity` (optional): Expiry time in minutes (default: 30, max: 10080)
- `shortcode` (optional): Custom shortcode (auto-generated if not provided)

**Response:**
```json
{
  "shortLink": "http://localhost:5000/abc123",
  "expiry": "2025-07-29T10:30:00.000Z",
  "code": "abc123",
  "createdBy": "rohit singh"
}
```

#### Get All URLs
```
GET /shorturls
Authorization: Bearer your-jwt-token (optional)
```

#### Get URL Statistics
```
GET /shorturls/:code
Authorization: Bearer your-jwt-token (optional)
```

**Response:**
```json
{
  "originalUrl": "https://example.com",
  "createdAt": "2025-07-29T09:00:00.000Z",
  "expiry": "2025-07-29T10:30:00.000Z",
  "totalClicks": 5,
  "clickDetails": [
    {
      "timestamp": "2025-07-29T09:15:00.000Z",
      "source": "direct",
      "location": "127.0.0.1",
      "userAgent": "Mozilla/5.0..."
    }
  ],
  "isExpired": false,
  "createdBy": {
    "email": "rohitsingh24685@hmail.com",
    "name": "rohit singh",
    "rollNo": "25300122049",
    "clientID": "e640ccbd-d324-47a7-9fac-32bb7c3ccde6"
  }
}
```

#### Redirect to Original URL
```
GET /:code
```
Redirects to the original URL and logs the click.

### System Endpoints

#### Health Check
```
GET /health
```

#### API Documentation
```
GET /api/info
```

## User Credentials

The application is configured with the following user:
- **Name:** rohit singh
- **Email:** rohitsingh24685@hmail.com
- **Roll No:** 25300122049
- **Access Code:** AYkwcf
- **Client ID:** e640ccbd-d324-47a7-9fac-32bb7c3ccde6

## Project Structure

```
url-shortener/
├── controllers/
│   ├── authController.js    # JWT authentication logic
│   ├── logController.js     # Logging functionality 
│   └── urlController.js     # URL shortening business logic
├── middleware/
│   ├── auth.js             # Authentication middleware
│   └── logger.js           # Request logging middleware
├── routes/
│   ├── authRoutes.js       # Authentication endpoints
│   ├── logRoutes.js        # Logging endpoints
│   └── urlRoutes.js        # URL shortening endpoints
├── server.js               # Main server file with security config
├── package.json            # Dependencies and scripts
├── .env                    # Environment variables (configured)
├── .gitignore             # Git ignore rules
├── test-complete-api.ps1   # Comprehensive API test suite
└── README.md              # Project documentation
```

## Technologies Used

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **JWT (jsonwebtoken)** - Authentication tokens
- **nanoid** - Unique ID generator for short codes
- **dayjs** - Date manipulation library
- **cors** - Cross-origin resource sharing
- **helmet** - Security headers
- **express-rate-limit** - Rate limiting protection
- **dotenv** - Environment variable management
- **uuid** - Unique ID generation for logs

## Security Features

- **JWT Authentication** - Secure token-based authentication
- **Rate Limiting** - 100 requests per 15 minutes per IP
- **CORS Protection** - Configurable cross-origin policies
- **Helmet Security** - HTTP security headers
- **Input Validation** - URL format and parameter validation
- **Token Expiration** - Automatic token expiry handling

## Development

- `npm start` - Start the production server
- `npm run dev` - Start the development server
- Run `test-complete-api.ps1` - Execute comprehensive API tests

## Testing

A comprehensive test script is included (`test-complete-api.ps1`) that tests:
- Authentication (auto-login and manual login)
- URL creation with and without authentication
- URL statistics and listing
- Redirect functionality
- Security (invalid credentials handling)
- All API endpoints

## Notes

- URLs are stored in memory (not persistent across restarts)
- For production use, implement a database for persistence
- Default expiry time is 30 minutes, maximum is 1 week
- All requests are logged to `access.log` file
- Authentication is optional for most endpoints
- User data is tracked for authenticated sessions

## GitHub Repository

🚀 **Repository:** https://github.com/Row-heat/25300122049
