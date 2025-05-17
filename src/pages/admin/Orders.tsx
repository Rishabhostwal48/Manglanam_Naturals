import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useOrders } from "@/context/OrderContext";
import { Input } from "@/components/ui/input";
import { OrderDetails } from "@/components/admin/OrderDetails";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminOrders() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { orders = [], loading, error } = useOrders();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  
  // Filter by customer ID if provided in URL parameters
  const customerFilter = searchParams.get("customer");
  
  const filteredOrders = Array.isArray(orders) ? orders.filter(order => {
    // Apply customer filter if present
    if (customerFilter && order?.user?._id !== customerFilter) {
      return false;
    }
    
    // Apply search query
    const searchString = searchQuery.toLowerCase();
    return (
      order?._id?.toLowerCase().includes(searchString) ||
      (order?.user?.name || '').toLowerCase().includes(searchString) ||
      (order?.user?.email || '').toLowerCase().includes(searchString)
    );
  }) : [];
  
  const getStatusBadge = (status: string) => {
    switch(status) {
      case "pending":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>;
      case "processing":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Processing</Badge>;
      case "shipped":
        return <Badge className="bg-amber-500 hover:bg-amber-600">Shipped</Badge>;
      case "completed":
        return <Badge className="bg-green-500 hover:bg-green-600">Completed</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="text-red-500 border-red-500">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  const handleViewOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    setShowOrderDetails(true);
  };
  
  // Show loading state
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
          <h2 className="text-xl md:text-3xl font-bold tracking-tight">Orders</h2>
        </div>
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
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
          <h2 className="text-xl md:text-3xl font-bold tracking-tight">Orders</h2>
        </div>
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
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
          <h2 className="text-xl md:text-3xl font-bold tracking-tight">Orders</h2>
        </div>
        
        {customerFilter && (
          <Button 
            variant="outline" 
            onClick={() => navigate("/admin/orders")}
            className="w-full sm:w-auto"
          >
            Clear Customer Filter
          </Button>
        )}
      </div>
      
      <div className="w-full max-w-sm mb-4">
        <Input 
          placeholder="Search orders..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {/* Desktop view: Table */}
      <div className="rounded-md border hidden md:block w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell className="font-medium">{order._id}</TableCell>
                  <TableCell>{order.user?.name || order.shippingAddress?.fullName || 'Guest'}</TableCell>
                  <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell>{order.orderItems.length}</TableCell>
                  <TableCell>{formatCurrency(order.totalPrice)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewOrder(order._id)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Mobile view: Card layout */}
      <div className="md:hidden space-y-4 w-full px-1">
        {filteredOrders.length === 0 ? (
          <div className="text-center p-6 border rounded-lg bg-white dark:bg-gray-800">
            <p className="text-muted-foreground">No orders found.</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order._id} className="overflow-hidden w-full">
              <CardContent className="p-0">
                <div className="p-4 border-b flex flex-col space-y-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">Order #{order._id}</h3>
                      <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>{getStatusBadge(order.status)}</div>
                  </div>
                </div>
                
                <div className="p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Customer:</span>
                    <span className="text-sm font-medium">{order.user?.name || order.shippingAddress?.fullName || 'Guest'}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Items:</span>
                    <span className="text-sm font-medium">{order.orderItems.length}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total:</span>
                    <span className="text-sm font-medium">{formatCurrency(order.totalPrice)}</span>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewOrder(order._id)}
                    className="w-full mt-2"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Order Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      
      <OrderDetails 
        orderId={selectedOrderId}
        open={showOrderDetails}
        onOpenChange={setShowOrderDetails}
      />
    </div>
  );
}
