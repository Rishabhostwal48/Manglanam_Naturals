import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { ChefHat, ShieldCheck } from 'lucide-react';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      
      if (userInfo.role === 'admin') {
        navigate('/admin');
        toast({
          title: 'Login successful',
          description: `Welcome back, ${userInfo.name}!`,
        });
      } else {
        throw new Error('Not authorized as admin');
      }
    } catch (error) {
      let message = 'Invalid email or password';
      if (error instanceof Error) {
        message = error.message === 'Not authorized as admin' 
          ? 'You are not authorized to access admin panel' 
          : 'Invalid email or password';
      }
      
      toast({
        title: 'Login failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md shadow-lg border border-border/40">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-playfair text-center">Admin Login</CardTitle>
          <CardDescription className="text-center text-base">
            Enter your credentials to access the admin dashboard
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="admin@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
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
              <ShieldCheck className="w-5 h-5 mr-2" />
              {loading ? 'Authenticating...' : 'Admin Sign In'}
            </Button>
            <div className="text-center pt-2">
              <Button 
                type="button" 
                variant="link" 
                className="px-1"
                onClick={() => navigate('/login')}
              >
                Return to regular login
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
