import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useOrders } from '@/context/OrderContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Package, Truck, Clock } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const OrderConfirmation = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { getOrderById } = useOrders();
  const order = orderId ? getOrderById(orderId) : null;

  if (!order) {
    return (
      <div className="container-custom py-20">
        <div className="text-center">
          <h1 className="font-serif text-2xl mb-4">Order Not Found</h1>
          <p className="text-gray-600 mb-6">
            We couldn't find the order you're looking for.
          </p>
          <Button asChild>
            <Link to="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-6 w-6 text-green-500" />;
      case 'processing':
        return <Package className="h-6 w-6 text-blue-500" />;
      case 'shipped':
        return <Truck className="h-6 w-6 text-amber-500" />;
      default:
        return <Clock className="h-6 w-6 text-gray-500" />;
    }
  };

  return (
    <div className="container-custom py-16">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="font-serif text-3xl mb-2">Order Confirmed!</h1>
          <p className="text-gray-600">
            Thank you for your order. We'll send you a confirmation email shortly.
          </p>
        </div>

        <Card className="mb-8">
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="font-serif text-xl mb-1">Order #{order.id}</h2>
                <p className="text-sm text-gray-600">
                  Placed on {new Date(order.date).toLocaleDateString()}
                </p>
              </div>
              <Badge variant="outline" className="text-lg">
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
            </div>

            <Separator className="my-6" />

            {/* Order Items */}
            <div className="space-y-4 mb-6">
              <h3 className="font-medium mb-4">Order Items</h3>
              {order.items.map((item) => (
                <div key={item.product._id} className="flex items-center">
                  <div className="h-16 w-16 rounded-md border overflow-hidden">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="ml-4 flex-1">
                    <h4 className="font-medium">{item.product.name}</h4>
                    <p className="text-sm text-gray-600">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium">
                    {formatCurrency(item.product.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <Separator className="my-6" />

            {/* Order Summary */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatCurrency(order.total - 5.99)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span>{formatCurrency(5.99)}</span>
              </div>
              <div className="flex justify-between font-medium text-lg mt-4">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Shipping Information */}
        <Card className="mb-8">
          <div className="p-6">
            <h3 className="font-medium mb-4">Shipping Information</h3>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="font-medium">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.street}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                  {order.shippingAddress.zipCode}
                </p>
                <p>{order.shippingAddress.country}</p>
              </div>
              <div>
                <p className="font-medium">Contact Information</p>
                <p>{order.shippingAddress.email}</p>
                <p>{order.shippingAddress.phone}</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex justify-center space-x-4">
          <Button asChild variant="outline">
            <Link to="/orders">View All Orders</Link>
          </Button>
          <Button asChild>
            <Link to="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation; 