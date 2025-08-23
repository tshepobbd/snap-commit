# Snap-Commit Backend Service

Backend API service for the snap-commit CLI tool that handles OpenAI API calls securely.

## Features

- 🔒 **Secure**: API key stored server-side, never exposed to clients
- 🚀 **Fast**: Optimized for quick commit message generation
- 🛡️ **Protected**: Rate limiting and CORS protection
- 📊 **Reliable**: Fallback responses and error handling
- 🔧 **Configurable**: Environment-based configuration

## Quick Start

### Local Development

1. **Clone the repository**

   ```bash
   git clone <your-backend-repo>
   cd snap-commit-backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp env.example .env
   # Edit .env with your OpenAI API key
   ```

4. **Start the server**
   ```bash
   npm run dev
   ```

### Render.com Deployment

1. **Create a new Web Service** on Render.com
2. **Connect your GitHub repository**
3. **Configure the service:**

   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment Variables**:
     - `OPENAI_API_KEY`: Your OpenAI API key
     - `PORT`: 3000 (or let Render set it)

4. **Deploy!**

## API Endpoints

### Health Check

```http
GET /health
```

### Generate Commit Messages

```http
POST /api/generate-commit
Content-Type: application/json

{
  "diff": "your git diff here",
  "count": 3
}
```

**Response:**

```json
{
  "success": true,
  "messages": [
    "feat: add new user authentication",
    "fix: resolve login validation issue",
    "docs: update API documentation"
  ],
  "model": "gpt-3.5-turbo",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Environment Variables

| Variable          | Description          | Default  |
| ----------------- | -------------------- | -------- |
| `OPENAI_API_KEY`  | Your OpenAI API key  | Required |
| `PORT`            | Server port          | 3000     |
| `ALLOWED_ORIGINS` | CORS allowed origins | `*`      |

## Rate Limiting

- **No rate limiting** - unlimited requests allowed
- Users can make as many requests as needed

## Security Features

- ✅ Helmet.js for security headers
- ✅ CORS protection
- ✅ Rate limiting
- ✅ Input validation
- ✅ Error handling
- ✅ No sensitive data in responses

## Monitoring

The service includes:

- Health check endpoint
- Structured error logging
- Request/response logging
- Performance monitoring ready

## Support

For issues or questions, please open an issue in the repository.
