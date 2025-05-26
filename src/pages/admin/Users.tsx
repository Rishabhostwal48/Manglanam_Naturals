import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { userService } from '@/services/api';
import type { User } from '@/context/AuthContext';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminUsers() {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      toast.error('Admin access required');
      navigate('/');
      return;
    }

    const fetchUsers = async () => {
      try {
        setLoading(true);
        console.log('Fetching users...');
        const response = await userService.getAllUsers();
        console.log('Users response:', response);
        if (!response) {
          toast.error('Failed to fetch users');
          return;
        }
        if (response.length > 0) {
          console.log('First user data structure:', response[0]);
        }
        setUsers(response);
      } catch (error: any) {
        console.error('Failed to fetch users:', error);
        console.error('Error details:', {
          status: error?.response?.status,
          message: error?.response?.data?.message,
          headers: error?.response?.headers
        });
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          toast.error('Not authorized to view users');
          navigate('/');
        } else {
          toast.error(error?.response?.data?.message || 'Failed to fetch users');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isAuthenticated, isAdmin, navigate]);

  useEffect(() => {
    console.log('Current users state:', users);
  }, [users]);

  const filteredUsers = users.filter(user => {
    const searchString = searchQuery.toLowerCase();
    return (
      user.name.toLowerCase().includes(searchString) ||
      user.email.toLowerCase().includes(searchString) ||
      (user.whatsappNumber && user.whatsappNumber.includes(searchString))
    );
  });

  useEffect(() => {
    console.log('Filtered users:', filteredUsers);
  }, [filteredUsers]);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-red-500">Admin</Badge>;
      default:
        return <Badge variant="outline">Customer</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex-1 w-full space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center">
          <Button 
            onClick={() => navigate("/admin")} 
            variant="ghost" 
            size="sm" 
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h2 className="text-xl md:text-3xl font-bold tracking-tight">Users</h2>
        </div>
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button 
            onClick={() => navigate("/admin")} 
            variant="ghost" 
            size="sm" 
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h2 className="text-xl md:text-3xl font-bold tracking-tight">Users</h2>
        </div>
        <Button onClick={() => navigate('/admin/users/new')}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Admin
        </Button>
      </div>

      <div className="flex items-center py-4">
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>WhatsApp</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => {
                console.log('Rendering user:', user); // Debug log
                return (
                  <TableRow key={user._id || user.id}>
                    <TableCell className="font-medium">{user.name || 'N/A'}</TableCell>
                    <TableCell>{user.email || 'N/A'}</TableCell>
                    <TableCell>
                      {user.whatsappNumber || 'Not provided'}
                      {user.preferWhatsapp && (
                        <Badge variant="outline" className="ml-2">Preferred</Badge>
                      )}
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role || 'user')}</TableCell>
                    <TableCell>
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/admin/users/${user._id || user.id}`)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 