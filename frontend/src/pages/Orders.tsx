import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '@/context/OrderContext';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/utils';
import { Package, ShoppingBag } from 'lucide-react';

const Orders = () => {
  const { getUserOrders } = useOrders();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/orders' } });
    }
  }, [isAuthenticated, navigate]);

  if (!user) {
    return null;
  }

  const orders = getUserOrders(user.id);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>;
      case 'processing':
        return <Badge className="bg-blue-500">Processing</Badge>;
      case 'shipped':
        return <Badge className="bg-amber-500">Shipped</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  if (orders.length === 0) {
    return (
      <div className="container-custom py-20">
        <div className="text-center">
          <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="font-serif text-2xl mb-4">No Orders Yet</h1>
          <p className="text-gray-600 mb-6">
            You haven't placed any orders yet. Start shopping to place your first order!
          </p>
          <Button onClick={() => navigate('/products')}>Start Shopping</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-16">
      <h1 className="font-serif text-3xl mb-8">My Orders</h1>
      
      <div className="space-y-6">
        {orders.map((order) => (
          <Card key={order._id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="font-serif text-xl mb-1">Order #{order._id}</h2>
                <p className="text-sm text-gray-600">
                  Placed on {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              {getStatusBadge(order.status)}
            </div>

            <Separator className="my-4" />

            {/* Order Items Preview */}
            <div className="space-y-4">
              {order.orderItems.slice(0, 2).map((item) => (
                <div key={item._id} className="flex items-center">
                  <div className="h-16 w-16 rounded-md border overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="ml-4 flex-1">
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm text-gray-600">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>
              ))}
              {order.orderItems.length > 2 && (
                <p className="text-sm text-gray-600">
                  +{order.orderItems.length - 2} more items
                </p>
              )}
            </div>

            <Separator className="my-4" />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-lg font-medium">{formatCurrency(order.totalPrice)}</p>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate(`/order-confirmation/${order._id}`)}
              >
                View Details
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Orders; 