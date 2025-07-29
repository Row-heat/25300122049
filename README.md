# URL Shortener Backend

A simple and efficient URL shortening service built with Node.js and Express.js.

## Features

- ✅ Shorten URLs with custom or auto-generated codes
- ✅ Set expiry time for shortened URLs (default: 30 minutes)
- ✅ Track click analytics and statistics
- ✅ CORS enabled for cross-origin requests
- ✅ Request logging middleware
- ✅ Health check endpoint

## API Endpoints

### 1. Health Check
```
GET /health
```
Returns the server status.

### 2. Create Short URL
```
POST /shorturls
Content-Type: application/json

{
  "url": "https://example.com",
  "validity": 60,
  "shortcode": "custom123"
}
```

**Parameters:**
- `url` (required): The original URL to shorten
- `validity` (optional): Expiry time in minutes (default: 30)
- `shortcode` (optional): Custom shortcode (auto-generated if not provided)

**Response:**
```json
{
  "shortLink": "http://localhost:5000/abc123",
  "expiry": "2025-07-29T10:30:00.000Z"
}
```

### 3. Redirect to Original URL
```
GET /:code
```
Redirects to the original URL and logs the click.

### 4. Get URL Statistics
```
GET /shorturls/:code
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
      "location": "127.0.0.1"
    }
  ]
}
```

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file (optional):
   ```
   PORT=5000
   BASE_URL=http://localhost:5000
   DEFAULT_EXPIRY_MINUTES=30
   ```

4. Start the server:
   ```bash
   npm start
   ```

The server will start on `http://localhost:5000`

## Project Structure

```
url-shortener/
├── controllers/
│   └── urlController.js    # Business logic for URL operations
├── middleware/
│   └── logger.js          # Request logging middleware
├── routes/
│   └── urlRoutes.js       # Route definitions
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── .env                   # Environment variables
├── .gitignore            # Git ignore rules
└── README.md             # Project documentation
```

## Technologies Used

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **nanoid** - Unique ID generator for short codes
- **dayjs** - Date manipulation library
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variable management

## Development

- `npm start` - Start the production server
- `npm run dev` - Start the development server

## Notes

- URLs are stored in memory (not persistent across restarts)
- For production use, consider implementing a database for persistence
- Default expiry time is 30 minutes but can be customized per URL
- All requests are logged to `access.log` file
