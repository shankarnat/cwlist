# Content Lens Manager - Heroku Deployment

This application is dockerized and configured to work on Heroku with proper CORS settings for Salesforce iframe embedding.

## Setup Instructions

### 1. Local Development

```bash
# Install dependencies
npm install

# Run locally
npm run dev

# Or use Docker
docker-compose up
```

### 2. Deploy to Heroku

```bash
# Create Heroku app
heroku create your-app-name

# Set stack to container
heroku stack:set container

# Deploy
git add .
git commit -m "Initial commit"
git push heroku main

# Check logs
heroku logs --tail
```

### 3. Salesforce Setup

1. **Create Custom Setting** (for Heroku URL):
   - Name: `ContentLensSettings__c`
   - Add field: `HerokuAppURL__c` (Text, 255)
   - Set value: `https://your-app-name.herokuapp.com`

2. **Deploy Visualforce Page**:
   - Deploy `ContentLensIframe.page`
   - Create Visualforce Tab

3. **Configure Remote Site Settings**:
   - Go to Setup → Security → Remote Site Settings
   - Add your Heroku app URL

## CORS Configuration

The Express server is configured to accept requests from:
- `*.salesforce.com`
- `*.force.com`
- `*.visualforce.com`
- `*.lightning.force.com`

## Security Features

- Helmet.js for security headers
- CSP configured for Salesforce iframe embedding
- Non-root user in Docker container
- CORS with origin validation

## API Endpoints

- `GET /api/lenses` - Get all lenses
- `POST /api/lenses` - Create new lens
- `POST /api/lenses/clone` - Clone lenses
- `GET /health` - Health check

## Environment Variables

No environment variables required for basic operation. The app uses:
- `PORT` - Automatically set by Heroku
- `NODE_ENV` - Set to 'production' in Dockerfile

## Troubleshooting

1. **CORS Issues**: Check browser console for specific CORS errors
2. **Iframe Not Loading**: Verify Remote Site Settings in Salesforce
3. **API Errors**: Check Heroku logs with `heroku logs --tail`

## Development vs Production

- Development: Uses `nodemon` for auto-reload
- Production: Uses `node` directly with optimized settings