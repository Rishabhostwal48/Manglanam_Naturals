# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/4e703890-f82d-405c-b23c-5414db0bb124

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/4e703890-f82d-405c-b23c-5414db0bb124) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Express.js
- MongoDB
- Socket.IO
- Twilio (for SMS notifications)

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/4e703890-f82d-405c-b23c-5414db0bb124) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes it is!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Messaging Notifications (SMS & WhatsApp)

This project includes both SMS and WhatsApp notifications for order tracking. When a customer places an order or when an order status changes, they will receive a notification with tracking information through their preferred channel.

### Setup Messaging Notifications

1. Create a Twilio account at [twilio.com](https://www.twilio.com)
2. Get your Account SID, Auth Token, and a Twilio phone number
3. For WhatsApp, set up the Twilio WhatsApp sandbox or Business API
4. Add these credentials to your `.env` file:
   ```
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_phone_number
   TWILIO_WHATSAPP_NUMBER=your_twilio_whatsapp_number
   ```
5. Ensure customers provide their phone numbers during registration or checkout
6. Notifications will be sent automatically when:
   - A new order is placed (with tracking ID)
   - Order status is updated

### WhatsApp Integration

The system allows customers to:
1. Provide their WhatsApp number during registration (optional)
2. Choose WhatsApp as their preferred notification channel
3. Provide a different WhatsApp number during checkout if needed
4. Receive order confirmations and status updates via WhatsApp

If a customer has both a WhatsApp number and a regular phone number, the system will use their preferred channel based on their settings.
