
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowLeft, Mail, MoreHorizontal, Search, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";

// Sample customers data
const customers = [
  {
    id: "CUST-001",
    name: "John Doe",
    email: "john.doe@example.com",
    status: "active",
    orders: 5,
    totalSpent: 128.75,
    lastOrder: "2025-04-03",
    joinDate: "2024-11-15",
  },
  {
    id: "CUST-002",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    status: "active",
    orders: 3,
    totalSpent: 87.98,
    lastOrder: "2025-03-29",
    joinDate: "2024-12-01",
  },
  {
    id: "CUST-003",
    name: "Robert Johnson",
    email: "robert.johnson@example.com",
    status: "active",
    orders: 8,
    totalSpent: 245.92,
    lastOrder: "2025-04-04",
    joinDate: "2024-10-22",
  },
  {
    id: "CUST-004",
    name: "Emily Davis",
    email: "emily.davis@example.com",
    status: "inactive",
    orders: 1,
    totalSpent: 24.99,
    lastOrder: "2025-02-15",
    joinDate: "2025-01-30",
  },
  {
    id: "CUST-005",
    name: "Michael Wilson",
    email: "michael.wilson@example.com",
    status: "active",
    orders: 4,
    totalSpent: 102.96,
    lastOrder: "2025-04-01",
    joinDate: "2024-12-18",
  },
];

export default function AdminCustomers() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.id.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const getStatusBadge = (status: string) => {
    return status === "active" ? (
      <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
    ) : (
      <Badge variant="outline" className="text-gray-500 border-gray-500">Inactive</Badge>
    );
  };
  
  const handleContactCustomer = (customerId: string, email: string) => {
    toast.info(`Sending email to ${email} (demo only)`);
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  return (
    <div className="flex-1 space-y-6 p-4 md:p-8">
      <div className="flex items-center mb-4">
        <Button 
          onClick={() => navigate("/admin")} 
          variant="ghost" 
          size="sm" 
          className="mr-3"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h2 className="text-xl md:text-3xl font-bold tracking-tight">Customers</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 md:p-6">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-muted-foreground mb-1">Total Customers</span>
            <span className="text-2xl md:text-3xl font-bold">{customers.length}</span>
          </div>
        </Card>
        <Card className="p-4 md:p-6">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-muted-foreground mb-1">Active Customers</span>
            <span className="text-2xl md:text-3xl font-bold">{customers.filter(c => c.status === 'active').length}</span>
          </div>
        </Card>
        <Card className="p-4 md:p-6">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-muted-foreground mb-1">New This Month</span>
            <span className="text-2xl md:text-3xl font-bold">2</span>
          </div>
        </Card>
        <Card className="p-4 md:p-6">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-muted-foreground mb-1">Average Spend</span>
            <span className="text-2xl md:text-3xl font-bold">{formatCurrency(118.12)}</span>
          </div>
        </Card>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search customers..."
            className="pl-10 h-11"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {/* Desktop view: Table */}
      <div className="rounded-lg border shadow-sm bg-white hidden md:block overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-medium">Customer ID</TableHead>
              <TableHead className="font-medium">Name</TableHead>
              <TableHead className="font-medium">Email</TableHead>
              <TableHead className="font-medium">Status</TableHead>
              <TableHead className="font-medium">Orders</TableHead>
              <TableHead className="font-medium">Total Spent</TableHead>
              <TableHead className="font-medium">Join Date</TableHead>
              <TableHead className="text-right font-medium">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  <div className="flex flex-col items-center py-4">
                    <Search className="h-8 w-8 text-muted-foreground/50 mb-2" />
                    <p className="text-muted-foreground">No customers found.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map((customer) => (
                <TableRow key={customer.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium">{customer.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      {customer.name}
                    </div>
                  </TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{getStatusBadge(customer.status)}</TableCell>
                  <TableCell>{customer.orders}</TableCell>
                  <TableCell>{formatCurrency(customer.totalSpent)}</TableCell>
                  <TableCell>{customer.joinDate}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => toast.info(`View ${customer.name}'s profile (demo only)`)}>
                          <User className="mr-2 h-4 w-4" />
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/admin/orders?customer=${customer.id}`)}>
                          <User className="mr-2 h-4 w-4" />
                          View Orders
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleContactCustomer(customer.id, customer.email)}>
                          <Mail className="mr-2 h-4 w-4" />
                          Contact
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Mobile view: Card Layout */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {filteredCustomers.length === 0 ? (
          <div className="text-center p-6 border rounded-lg bg-white dark:bg-gray-800">
            <Search className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-muted-foreground">No customers found.</p>
          </div>
        ) : (
          filteredCustomers.map((customer) => (
            <Card key={customer.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{customer.name}</h3>
                      <p className="text-sm text-muted-foreground">{customer.email}</p>
                    </div>
                  </div>
                  <div>{getStatusBadge(customer.status)}</div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Customer ID</p>
                    <p className="text-sm font-medium">{customer.id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Join Date</p>
                    <p className="text-sm font-medium">{customer.joinDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Orders</p>
                    <p className="text-sm font-medium">{customer.orders}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Spent</p>
                    <p className="text-sm font-medium">{formatCurrency(customer.totalSpent)}</p>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-2 border-t">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => toast.info(`View ${customer.name}'s profile (demo only)`)}
                    className="flex-1"
                  >
                    <User className="h-4 w-4 mr-1" />
                    Profile
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/admin/orders?customer=${customer.id}`)}
                    className="flex-1"
                  >
                    <User className="h-4 w-4 mr-1" />
                    Orders
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleContactCustomer(customer.id, customer.email)}
                    className="flex-1"
                  >
                    <Mail className="h-4 w-4 mr-1" />
                    Contact
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
