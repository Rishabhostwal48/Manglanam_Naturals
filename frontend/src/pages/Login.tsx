import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { ChefHat, LogIn } from 'lucide-react';
import { authService } from '@/services/api';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Use the login function from AuthContext directly instead of authService
      await login(email, password);
      
      // The toast is already shown in the AuthContext login function
      
      // Get the latest user data after login
      const userInfo = localStorage.getItem('userInfo');
      const userData = userInfo ? JSON.parse(userInfo) : null;
      
      // Force a page reload after successful login to refresh the application state
      setTimeout(() => {
        // Redirect based on user role
        if (userData?.role === 'admin') {
          window.location.href = '/admin';
        } else {
          window.location.href = '/';
        }
      }, 500); // Small delay to allow the toast to be visible
      
    } catch (error) {
      // Error handling is already done in the AuthContext login function
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md shadow-lg border border-border/40">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="w-16 h-16 bg-spice-100 rounded-full flex items-center justify-center mb-4 bg-primary/10">
            <ChefHat className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-playfair text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center text-base">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="user@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
                autoComplete="username"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <a href="#" className="text-sm text-primary hover:text-primary/80 font-medium">
                  Forgot password?
                </a>
              </div>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11"
                autoComplete="current-password"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pb-6">
            <Button 
              type="submit" 
              className="w-full"
              variant="spice"
              size="lg"
              disabled={loading}
            >
              <LogIn className="w-5 h-5 mr-2" />
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
            <div className="text-center pt-2">
              <span className="text-sm text-muted-foreground">Don't have an account? </span>
              <Button 
                type="button" 
                variant="link" 
                className="px-1"
                onClick={() => navigate('/register')}
              >
                Create an account
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
