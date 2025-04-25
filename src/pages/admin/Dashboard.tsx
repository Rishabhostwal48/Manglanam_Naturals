
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { 
  BarChart3, 
  Package, 
  ShoppingCart, 
  Users,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getBestSellers, getFeaturedProducts, products } from "@/data/products";
import { formatCurrency } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const featuredProducts = getFeaturedProducts();
  const bestSellers = getBestSellers();
  
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <h2 className="text-xl md:text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex flex-wrap items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => navigate("/admin/products")}
            className="text-sm w-full sm:w-auto"
            size="sm"
          >
            Manage Products
          </Button>
          <Button 
            onClick={() => navigate("/admin/orders")} 
            size="sm" 
            className="text-sm w-full sm:w-auto"
          >
            <ShoppingCart className="mr-2 h-4 w-4" /> View Orders
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <div className="overflow-x-auto pb-2">
          <TabsList className="w-full sm:w-auto overflow-x-auto flex whitespace-nowrap p-0 sm:p-1">
            <TabsTrigger value="overview" className="flex-1 sm:flex-none">Overview</TabsTrigger>
            <TabsTrigger value="analytics" className="flex-1 sm:flex-none">Analytics</TabsTrigger>
            <TabsTrigger value="reports" className="flex-1 sm:flex-none">Reports</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(12567.89)}</div>
                <div className="flex items-center pt-1">
                  <ArrowUpRight className="h-4 w-4 text-emerald-500 mr-1" />
                  <span className="text-xs font-medium text-emerald-500">+20.1%</span>
                  <span className="text-xs text-muted-foreground ml-1">from last month</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Products</CardTitle>
                <div className="h-8 w-8 rounded-full bg-turmeric/10 flex items-center justify-center">
                  <Package className="h-4 w-4 text-turmeric" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{products.length}</div>
                <div className="flex items-center pt-1">
                  <ArrowUpRight className="h-4 w-4 text-emerald-500 mr-1" />
                  <span className="text-xs font-medium text-emerald-500">+3</span>
                  <span className="text-xs text-muted-foreground ml-1">since last month</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
                <div className="h-8 w-8 rounded-full bg-cinnamon/10 flex items-center justify-center">
                  <ShoppingCart className="h-4 w-4 text-cinnamon" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">27</div>
                <div className="flex items-center pt-1">
                  <ArrowUpRight className="h-4 w-4 text-emerald-500 mr-1" />
                  <span className="text-xs font-medium text-emerald-500">+8</span>
                  <span className="text-xs text-muted-foreground ml-1">from last week</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
                <div className="h-8 w-8 rounded-full bg-cardamom/10 flex items-center justify-center">
                  <Users className="h-4 w-4 text-cardamom" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">573</div>
                <div className="flex items-center pt-1">
                  <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                  <span className="text-xs font-medium text-red-500">-2%</span>
                  <span className="text-xs text-muted-foreground ml-1">from last quarter</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
            <Card className="col-span-full lg:col-span-4 bg-white dark:bg-gray-800">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>Monthly Revenue</CardTitle>
                  <CardDescription>Revenue trends over the past 6 months</CardDescription>
                </div>
                <div>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    Download Report
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[250px] sm:h-[300px] w-full flex items-center justify-center">
                  <BarChart3 className="h-16 w-16 text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Revenue chart visualization</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="col-span-full lg:col-span-3 bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle>Recent Sales</CardTitle>
                <CardDescription>
                  You made 27 sales this month
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Desktop: Table view */}
                <div className="overflow-x-auto hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bestSellers.slice(0, 5).map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-md overflow-hidden bg-gray-100 hidden sm:block">
                                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-medium line-clamp-1">{product.name}</span>
                                <span className="text-xs text-muted-foreground hidden sm:inline">#{product.id.slice(0, 8)}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{formatCurrency(product.price)}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                              Completed
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Mobile: Card list view */}
                <div className="space-y-3 md:hidden">
                  {bestSellers.slice(0, 5).map((product) => (
                    <div key={product.id} className="flex items-center justify-between border-b pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-100">
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-medium line-clamp-1">{product.name}</p>
                          <span className="text-xs text-muted-foreground">#{product.id.slice(0, 6)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(product.price)}</p>
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 mt-1">
                          Completed
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 flex justify-center">
                  <Button variant="outline" size="sm" onClick={() => navigate("/admin/orders")} className="w-full sm:w-auto">
                    View all orders
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <Card className="bg-white dark:bg-gray-800 p-4 sm:p-6">
            <h3 className="text-xl font-medium mb-4">Analytics</h3>
            <div className="flex items-center justify-center h-[250px] sm:h-[400px] text-muted-foreground">
              Analytics data will be displayed here
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-4">
          <Card className="bg-white dark:bg-gray-800 p-4 sm:p-6">
            <h3 className="text-xl font-medium mb-4">Reports</h3>
            <div className="flex items-center justify-center h-[250px] sm:h-[400px] text-muted-foreground">
              Reports will be displayed here
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
