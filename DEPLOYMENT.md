# Deployment Guide for Manglanam Website

This guide will help you deploy the Manglanam website to your domain.

## Prerequisites

1. A domain name (e.g., yourdomain.com)
2. A web hosting service or VPS (Virtual Private Server)
3. Node.js (v16+) installed on your server
4. MongoDB database (either local or cloud-based like MongoDB Atlas)
5. Basic knowledge of server management and DNS configuration

## Deployment Steps

### 1. Prepare Your Environment Variables

Edit the `.env.production` file with your production settings:

```
NODE_ENV=production
MONGO_URI=mongodb://your_mongodb_connection_string
VITE_API_URL=/api
JWT_SECRET=your_secure_jwt_secret_key_here
PORT=80
FRONTEND_URL=https://yourdomain.com
```

Replace:
- `your_mongodb_connection_string` with your actual MongoDB connection string
- `your_secure_jwt_secret_key_here` with a strong, random string for JWT authentication
- `yourdomain.com` with your actual domain name

### 2. Build the Application

Run the production build command:

```bash
npm run build:prod
```

This will create optimized production files in the `dist` directory.

### 3. Deploy to Your Server

#### Option 1: Manual Deployment

1. Upload all files to your server using SFTP or any file transfer method
2. Install dependencies on the server:
   ```bash
   npm install --production
   ```
3. Start the server:
   ```bash
   npm run start
   ```

#### Option 2: Using PM2 (Recommended for Production)

[PM2](https://pm2.keymetrics.io/) is a process manager for Node.js applications that helps keep your app running.

1. Install PM2 globally:
   ```bash
   npm install -g pm2
   ```

2. Start your application with PM2:
   ```bash
   pm2 start server/index.js --name "manglanam"
   ```

3. Set up PM2 to start on server boot:
   ```bash
   pm2 startup
   pm2 save
   ```

### 4. Configure Nginx (Recommended)

If you're using a VPS, it's recommended to use Nginx as a reverse proxy:

1. Install Nginx:
   ```bash
   sudo apt update
   sudo apt install nginx
   ```

2. Create a new Nginx configuration file:
   ```bash
   sudo nano /etc/nginx/sites-available/manglanam
   ```

3. Add the following configuration (replace yourdomain.com with your domain):
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. Enable the site and restart Nginx:
   ```bash
   sudo ln -s /etc/nginx/sites-available/manglanam /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

### 5. Set Up SSL (HTTPS)

It's highly recommended to secure your site with SSL:

1. Install Certbot:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   ```

2. Obtain and install SSL certificate:
   ```bash
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

3. Follow the prompts to complete the SSL setup.

### 6. Configure DNS

1. Log in to your domain registrar's website
2. Update your domain's DNS settings to point to your server's IP address
3. Add an A record that points your domain to your server's IP address
4. If you want to use www subdomain, add a CNAME record pointing www to your main domain

### 7. Verify Deployment

1. Visit your domain in a web browser to ensure the website is working correctly
2. Test all functionality including user registration, product browsing, and checkout

## Troubleshooting

If you encounter issues:

1. Check server logs:
   ```bash
   pm2 logs manglanam
   ```

2. Verify MongoDB connection:
   ```bash
   mongo your_connection_string
   ```

3. Check Nginx error logs:
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

## Maintenance

1. To update your application:
   ```bash
   git pull
   npm run build:prod
   pm2 restart manglanam
   ```

2. Monitor server performance:
   ```bash
   pm2 monit
   ```

3. Set up regular database backups for your MongoDB database

## Security Considerations

1. Keep your server and Node.js updated with security patches
2. Use strong, unique passwords for all services
3. Consider implementing rate limiting and other security measures
4. Regularly audit your application for security vulnerabilities