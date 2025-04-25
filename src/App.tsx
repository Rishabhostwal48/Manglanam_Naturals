import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { OrderProvider } from "@/context/OrderContext";
import { AuthProvider } from "@/context/AuthContext";
import Profile from "./pages/Profile";

// Pages
import Home from "./pages/Home";
import ProductsPage from "./pages/ProductsPage";
import ProductDetail from "./pages/ProductDetail";
import About from "./pages/About";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import NotFound from "./pages/NotFound";
import Register from "./pages/Register";
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import TermsOfService from "./pages/legal/TermsOfService";
import ShippingPolicy from "./pages/legal/ShippingPolicy";
import Orders from '@/pages/Orders';
import OrderConfirmation from '@/pages/OrderConfirmation';

// Admin Pages
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminProducts from "./pages/admin/Products";
import AdminOrders from "./pages/admin/Orders";
import AdminLogin from "./pages/admin/Login";
import AdminCustomers from "./pages/admin/Customers";
import AdminSettings from "./pages/admin/Settings";
import AdminBlogPosts from "./pages/admin/BlogPosts";
import AddProduct from "./pages/admin/AddProduct";
import EditProduct from "./pages/admin/EditProduct";
import AddBlogPost from "./pages/admin/AddBlogPost";
import EditBlogPost from "./pages/admin/EditBlogPost";

// Components
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { Cart } from "./components/Cart";
import Login from "./pages/Login";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <OrderProvider>
          <CartProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<Login />} />
                
                <Route path="/profile" element={
                  <div className="flex flex-col min-h-screen">
                    <Navbar />
                    <main className="flex-1">
                      <Profile />
                    </main>
                    <Footer />
                    <Cart />
                  </div>
                } />
                
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="products/add" element={<AddProduct />} />
                  <Route path="products/edit/:id" element={<EditProduct />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="customers" element={<AdminCustomers />} />
                  <Route path="settings" element={<AdminSettings />} />
                  <Route path="blog-posts" element={<AdminBlogPosts />} />
                  <Route path="blog-posts/add" element={<AddBlogPost />} />
                  <Route path="blog-posts/edit/:id" element={<EditBlogPost />} />
                </Route>
                
                <Route path="/register" element={
                  <div className="flex flex-col min-h-screen">
                    <main className="flex-1">
                      <Register />
                    </main>
                  </div>
                } />

                <Route path="/privacy" element={
                  <div className="flex flex-col min-h-screen">
                    <Navbar />
                    <main className="flex-1">
                      <PrivacyPolicy />
                    </main>
                    <Footer />
                    <Cart />
                  </div>
                } />
                <Route path="/terms" element={
                  <div className="flex flex-col min-h-screen">
                    <Navbar />
                    <main className="flex-1">
                      <TermsOfService />
                    </main>
                    <Footer />
                    <Cart />
                  </div>
                } />
                <Route path="/shipping" element={
                  <div className="flex flex-col min-h-screen">
                    <Navbar />
                    <main className="flex-1">
                      <ShippingPolicy />
                    </main>
                    <Footer />
                    <Cart />
                  </div>
                } />
                
                <Route path="/" element={
                  <div className="flex flex-col min-h-screen">
                    <Navbar />
                    <main className="flex-1">
                      <Home />
                    </main>
                    <Footer />
                    <Cart />
                  </div>
                } />
                <Route path="/products" element={
                  <div className="flex flex-col min-h-screen">
                    <Navbar />
                    <main className="flex-1">
                      <ProductsPage />
                    </main>
                    <Footer />
                    <Cart />
                  </div>
                } />
                <Route path="/product/:id" element={
                  <div className="flex flex-col min-h-screen">
                    <Navbar />
                    <main className="flex-1">
                      <ProductDetail />
                    </main>
                    <Footer />
                    <Cart />
                  </div>
                } />
                <Route path="/checkout" element={
                  <div className="flex flex-col min-h-screen">
                    <Navbar />
                    <main className="flex-1">
                      <Checkout />
                    </main>
                    <Footer />
                    <Cart />
                  </div>
                } />
                <Route path="/orders" element={
                  <div className="flex flex-col min-h-screen">
                    <Navbar />
                    <main className="flex-1">
                      <Orders />
                    </main>
                    <Footer />
                    <Cart />
                  </div>
                } />
                <Route path="/order-confirmation/:orderId" element={
                  <div className="flex flex-col min-h-screen">
                    <Navbar />
                    <main className="flex-1">
                      <OrderConfirmation />
                    </main>
                    <Footer />
                    <Cart />
                  </div>
                } />
                <Route path="/order-success" element={
                  <div className="flex flex-col min-h-screen">
                    <Navbar />
                    <main className="flex-1">
                      <OrderSuccess />
                    </main>
                    <Footer />
                  </div>
                } />
                <Route path="/blog" element={
                  <div className="flex flex-col min-h-screen">
                    <Navbar />
                    <main className="flex-1">
                      <Blog />
                    </main>
                    <Footer />
                    <Cart />
                  </div>
                } />
                <Route path="/blog/:id" element={
                  <div className="flex flex-col min-h-screen">
                    <Navbar />
                    <main className="flex-1">
                      <BlogPost />
                    </main>
                    <Footer />
                    <Cart />
                  </div>
                } />
                <Route path="/about" element={
                  <div className="flex flex-col min-h-screen">
                    <Navbar />
                    <main className="flex-1">
                      <About />
                    </main>
                    <Footer />
                    <Cart />
                  </div>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </CartProvider>
        </OrderProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
