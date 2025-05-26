# Deployment Guide for Manglanam Server

This guide provides instructions for deploying the Manglanam Server to various platforms with a focus on cost-effective options.

## Table of Contents

- [Environment Setup](#environment-setup)
- [Deployment Options](#deployment-options)
  - [Render](#render)
  - [Railway](#railway)
  - [Fly.io](#flyio)
  - [Heroku](#heroku)
  - [Digital Ocean App Platform](#digital-ocean-app-platform)
- [Docker Deployment](#docker-deployment)
- [MongoDB Setup](#mongodb-setup)
- [Environment Variables](#environment-variables)
- [Continuous Integration/Deployment](#continuous-integrationdeployment)

## Environment Setup

Before deploying, ensure you have the following:

1. A MongoDB database (MongoDB Atlas offers a free tier)
2. Stripe account for payment processing
3. Twilio account for SMS notifications
4. Your environment variables ready (see [Environment Variables](#environment-variables))

## Deployment Options

### Render

[Render](https://render.com/) offers a free tier for web services with some limitations.

1. Create a Render account
2. Create a new Web Service
3. Connect your GitHub repository
4. Configure the service:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Add your environment variables
5. Deploy

**Pros**: Free tier available, easy setup, automatic deploys from GitHub
**Cons**: Free tier has sleep after inactivity

### Railway

[Railway](https://railway.app/) is a platform that makes deploying applications simple.

1. Create a Railway account
2. Create a new project
3. Connect your GitHub repository
4. Configure the service:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Add your environment variables
5. Deploy

**Pros**: Simple UI, good free tier, easy database integration
**Cons**: Free tier has usage limits

### Fly.io

[Fly.io](https://fly.io/) allows you to deploy close to your users.

1. Install the Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. Login: `fly auth login`
3. Create a new app: `fly launch`
4. Deploy: `fly deploy`

**Pros**: Free tier available, global deployment, good performance
**Cons**: Requires CLI knowledge

### Heroku

[Heroku](https://www.heroku.com/) is a well-established platform for Node.js applications.

1. Create a Heroku account
2. Install the Heroku CLI: `npm install -g heroku`
3. Login: `heroku login`
4. Create a new app: `heroku create manglanam-server`
5. Add a Procfile to your project root:
   ```
   web: npm start
   ```
6. Set environment variables: `heroku config:set KEY=VALUE`
7. Deploy: `git push heroku main`

**Pros**: Reliable, well-documented, good integration with add-ons
**Cons**: Free tier no longer available, can be expensive for small projects

### Digital Ocean App Platform

[Digital Ocean App Platform](https://www.digitalocean.com/products/app-platform/) offers a simple way to deploy applications.

1. Create a Digital Ocean account
2. Create a new App
3. Connect your GitHub repository
4. Configure the app:
   - Build Command: `npm install`
   - Run Command: `npm start`
   - Add your environment variables
5. Deploy

**Pros**: Reliable, good performance, fixed pricing
**Cons**: No free tier, starts at $5/month

## Docker Deployment

For Docker-based deployments, create a `Dockerfile` in your project root:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

Build and run the Docker image:

```bash
docker build -t manglanam-server .
docker run -p 5000:5000 --env-file .env manglanam-server
```

## MongoDB Setup

1. Create a MongoDB Atlas account at [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (the free tier is sufficient for starting)
3. Create a database user with read/write permissions
4. Whitelist your deployment platform's IP addresses (or use 0.0.0.0/0 for all IPs)
5. Get your connection string and add it to your environment variables

## Environment Variables

Ensure these environment variables are set in your deployment platform:

```
NODE_ENV=production
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
FRONTEND_URL=https://your-frontend-url.com
```

## Continuous Integration/Deployment

For automated testing and deployment, consider setting up a GitHub Actions workflow:

Create a file at `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Use Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18.x'
      - run: npm ci
      - run: npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to production
        uses: superfly/flyctl-actions/setup-flyctl@master
      - run: flyctl deploy --remote-only
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

This example uses Fly.io for deployment, but you can adapt it for other platforms.