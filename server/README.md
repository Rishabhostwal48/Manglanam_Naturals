# Manglanam Server

Backend API server for the Manglanam e-commerce platform. This server provides RESTful API endpoints for products, users, orders, and payments.

## Features

- **User Authentication**: Secure user registration and login with JWT
- **Product Management**: CRUD operations for products with image uploads
- **Order Processing**: Create and manage orders
- **Payment Integration**: Stripe payment processing
- **Notifications**: SMS and WhatsApp notifications via Twilio
- **Real-time Updates**: Socket.IO for real-time order updates

## Tech Stack

- **Node.js**: JavaScript runtime
- **Express**: Web framework
- **MongoDB**: Database
- **Mongoose**: MongoDB object modeling
- **JWT**: Authentication
- **Multer**: File uploads
- **Socket.IO**: Real-time communication
- **Stripe**: Payment processing
- **Twilio**: SMS and WhatsApp notifications

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB instance (local or Atlas)
- Stripe account (for payments)
- Twilio account (for notifications)

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd manglanam_server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   NODE_ENV=development
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   STRIPE_SECRET_KEY=your_stripe_secret_key
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_phone_number
   FRONTEND_URL=http://localhost:3000
   ```

4. Start the development server:
   ```
   npm run dev
   ```

### API Endpoints

#### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create a new product (admin only)
- `PUT /api/products/:id` - Update a product (admin only)
- `DELETE /api/products/:id` - Delete a product (admin only)

#### Users
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

#### Orders
- `POST /api/orders` - Create a new order
- `GET /api/orders` - Get all orders (admin only)
- `GET /api/orders/myorders` - Get logged in user's orders
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/pay` - Update order to paid
- `PUT /api/orders/:id/deliver` - Update order to delivered (admin only)

#### Payments
- `POST /api/payments/create-payment-intent` - Create Stripe payment intent

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## License

This project is licensed under the ISC License.