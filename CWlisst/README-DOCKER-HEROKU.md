# Content Lens Manager - Heroku Container Deployment

This application uses Docker containers and can be deployed to Heroku using the Container Registry.

## Prerequisites

- Docker installed locally
- Heroku CLI installed
- Heroku account

## Local Development

```bash
# Install dependencies
npm install

# Run locally
npm start

# Or use Docker
docker build -t content-lens-manager .
docker run -p 3000:3000 -e PORT=3000 content-lens-manager

# Or use docker-compose
docker-compose up
```

## Deploy to Heroku Container Registry

```bash
# 1. Create a new Heroku app
heroku create your-app-name

# 2. Login to Heroku Container Registry
heroku container:login

# 3. Build and push the Docker image
heroku container:push web -a your-app-name

# 4. Release the container
heroku container:release web -a your-app-name

# 5. Open the app
heroku open -a your-app-name

# 6. View logs
heroku logs --tail -a your-app-name
```

## Important Notes

- The app automatically uses the `$PORT` environment variable provided by Heroku
- No need to specify EXPOSE in Dockerfile - Heroku handles port binding
- The server listens on `process.env.PORT || 3000`

## Alternative: Deploy Pre-built Image

If you have a Docker image in a registry:

```bash
# Tag your image for Heroku
docker tag content-lens-manager registry.heroku.com/your-app-name/web

# Push to Heroku registry
docker push registry.heroku.com/your-app-name/web

# Release
heroku container:release web -a your-app-name
```

## Salesforce Configuration

1. **Create Custom Setting**:
   - Name: `ContentLensSettings__c`
   - Field: `HerokuAppURL__c` (Text, 255)
   - Value: `https://your-app-name.herokuapp.com`

2. **Remote Site Settings**:
   - Add your Heroku app URL to Remote Site Settings
   - This allows Salesforce to communicate with your Heroku app

3. **Deploy Visualforce Page**:
   - Use `ContentLensIframe.page` to embed the Heroku app
   - Create a Visualforce Tab for easy access

## Environment Variables

The app uses these environment variables:

- `PORT` - Automatically set by Heroku (DO NOT SET MANUALLY)
- `NODE_ENV` - Set to 'production' in Dockerfile

## CORS Configuration

The app is configured to accept requests from:
- `*.salesforce.com`
- `*.force.com`
- `*.visualforce.com`
- `*.lightning.force.com`
- `*.salesforce-sites.com`

## Troubleshooting

### Container won't start
- Check logs: `heroku logs --tail -a your-app-name`
- Ensure you're not hardcoding the PORT

### CORS errors
- Verify your Salesforce domain is in the allowed origins
- Check browser console for specific errors

### Iframe not loading
- Verify Remote Site Settings in Salesforce
- Check Content Security Policy headers