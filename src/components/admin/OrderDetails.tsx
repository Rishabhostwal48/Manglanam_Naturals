import React, { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Order, OrderStatus, useOrders } from "@/context/OrderContext";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

interface OrderDetailsProps {
  orderId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderDetails({ orderId, open, onOpenChange }: OrderDetailsProps) {
  const { getOrderById, updateOrderStatus } = useOrders();
  const [order, setOrder] = useState<Order | null>(null);
  
  useEffect(() => {
    const fetchOrder = async () => {
      if (orderId) {
        const orderData = await getOrderById(orderId);
        setOrder(orderData);
      }
    };
    fetchOrder();
  }, [orderId, getOrderById]);
  
  if (!order) {
    return null;
  }
  
  const getStatusBadge = (status: OrderStatus) => {
    switch(status) {
      case "pending":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>;
      case "processing":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Processing</Badge>;
      case "shipped":
        return <Badge className="bg-amber-500 hover:bg-amber-600">Shipped</Badge>;
      case "delivered":
        return <Badge className="bg-green-500 hover:bg-green-600">Delivered</Badge>;
      case "canceled":
        return <Badge variant="outline" className="text-red-500 border-red-500">Canceled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  const handleStatusChange = (value: OrderStatus) => {
    updateOrderStatus(order._id, value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Order #{order._id}</span>
            {getStatusBadge(order.status)}
          </DialogTitle>
          <DialogDescription>
            Placed on {new Date(order.createdAt).toLocaleDateString()} by {order.user.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Customer Information</h3>
              <p>{order.user.name}</p>
              <p>{order.user.email}</p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Shipping Address</h3>
              <p>{order.shippingAddress.address}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
              <p>{order.shippingAddress.country}</p>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="font-medium mb-2">Order Items</h3>
            <div className="space-y-3">
              {order.orderItems.map((item) => (
                <div key={item._id} className="flex items-center">
                  <div className="w-12 h-12 rounded overflow-hidden bg-gray-100 mr-3">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatCurrency(item.price)} × {item.quantity}
                    </div>
                  </div>
                  <div className="font-medium">
                    {formatCurrency(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <Separator />
          
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium mb-2">Payment Method</h3>
              <p className="capitalize">{order.paymentMethod.replace('-', ' ')}</p>
              <p>{order.isPaid ? 'Paid' : 'Not Paid'}</p>
            </div>
            <div className="text-right">
              <div className="flex justify-between gap-8 mb-1">
                <span>Subtotal:</span>
                <span>{formatCurrency(order.itemsPrice)}</span>
              </div>
              <div className="flex justify-between gap-8 mb-1">
                <span>Shipping:</span>
                <span>{formatCurrency(order.shippingPrice)}</span>
              </div>
              <div className="flex justify-between gap-8 mb-1">
                <span>Tax:</span>
                <span>{formatCurrency(order.taxPrice)}</span>
              </div>
              <div className="flex justify-between gap-8 font-bold">
                <span>Total:</span>
                <span>{formatCurrency(order.totalPrice)}</span>
              </div>
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Status:</span>
            <Select defaultValue={order.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button onClick={() => onOpenChange(false)}>
              Print Order
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
