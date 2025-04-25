
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

export default function AdminSettings() {
  const navigate = useNavigate();
  
  // Store settings
  const [storeName, setStoreName] = useState("Manglanam Naturals");
  const [storeEmail, setStoreEmail] = useState("info@manglanam-naturals.com");
  const [storePhone, setStorePhone] = useState("+1 (555) 123-4567");
  const [storeAddress, setStoreAddress] = useState("123 Spice Market, Culinary District, CA 90210");
  
  // Notification settings
  const [newOrderNotifications, setNewOrderNotifications] = useState(true);
  const [lowStockNotifications, setLowStockNotifications] = useState(true);
  const [customerMessageNotifications, setCustomerMessageNotifications] = useState(true);
  
  // Payment settings
  const [acceptCreditCards, setAcceptCreditCards] = useState(true);
  const [acceptPaypal, setAcceptPaypal] = useState(true);
  const [acceptCrypto, setAcceptCrypto] = useState(false);
  
  // Shipping settings
  const [freeShippingThreshold, setFreeShippingThreshold] = useState("50");
  const [standardShippingRate, setStandardShippingRate] = useState("5.99");
  const [expressShippingRate, setExpressShippingRate] = useState("15.99");
  
  const handleSaveSettings = (section: string) => {
    toast.success(`${section} settings saved successfully!`);
  };
  
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
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
        <h2 className="text-xl md:text-3xl font-bold tracking-tight">Settings</h2>
      </div>
      
      <Tabs defaultValue="store" className="space-y-4">
        <div className="overflow-x-auto pb-2">
          <TabsList className="w-full md:w-auto flex md:inline-flex">
            <TabsTrigger value="store" className="flex-1 md:flex-none">Store</TabsTrigger>
            <TabsTrigger value="notifications" className="flex-1 md:flex-none">Notifications</TabsTrigger>
            <TabsTrigger value="payment" className="flex-1 md:flex-none">Payment</TabsTrigger>
            <TabsTrigger value="shipping" className="flex-1 md:flex-none">Shipping</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="store" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Store Information</CardTitle>
              <CardDescription>
                Manage your store details that appear on your website and receipts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="store-name">Store Name</Label>
                <Input 
                  id="store-name" 
                  value={storeName} 
                  onChange={(e) => setStoreName(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="store-email">Contact Email</Label>
                <Input 
                  id="store-email" 
                  type="email" 
                  value={storeEmail} 
                  onChange={(e) => setStoreEmail(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="store-phone">Contact Phone</Label>
                <Input 
                  id="store-phone" 
                  value={storePhone} 
                  onChange={(e) => setStorePhone(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="store-address">Store Address</Label>
                <Textarea 
                  id="store-address" 
                  value={storeAddress} 
                  onChange={(e) => setStoreAddress(e.target.value)} 
                  rows={3}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSaveSettings("Store")} className="w-full sm:w-auto">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Configure when and how you receive notifications about your store.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="new-order">New Order Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications when a new order is placed
                  </p>
                </div>
                <Switch
                  id="new-order"
                  checked={newOrderNotifications}
                  onCheckedChange={setNewOrderNotifications}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="low-stock">Low Stock Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when product inventory is running low
                  </p>
                </div>
                <Switch
                  id="low-stock"
                  checked={lowStockNotifications}
                  onCheckedChange={setLowStockNotifications}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="customer-message">Customer Messages</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when customers send messages or inquiries
                  </p>
                </div>
                <Switch
                  id="customer-message"
                  checked={customerMessageNotifications}
                  onCheckedChange={setCustomerMessageNotifications}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSaveSettings("Notification")} className="w-full sm:w-auto">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>
                Configure which payment methods are available to your customers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 flex-1 mr-4">
                  <Label htmlFor="credit-cards">Credit/Debit Cards</Label>
                  <p className="text-sm text-muted-foreground">
                    Accept Visa, Mastercard, American Express, etc.
                  </p>
                </div>
                <Switch
                  id="credit-cards"
                  checked={acceptCreditCards}
                  onCheckedChange={setAcceptCreditCards}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 flex-1 mr-4">
                  <Label htmlFor="paypal">PayPal</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow customers to pay using PayPal
                  </p>
                </div>
                <Switch
                  id="paypal"
                  checked={acceptPaypal}
                  onCheckedChange={setAcceptPaypal}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 flex-1 mr-4">
                  <Label htmlFor="crypto">Cryptocurrency</Label>
                  <p className="text-sm text-muted-foreground">
                    Accept Bitcoin, Ethereum and other cryptocurrencies
                  </p>
                </div>
                <Switch
                  id="crypto"
                  checked={acceptCrypto}
                  onCheckedChange={setAcceptCrypto}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSaveSettings("Payment")} className="w-full sm:w-auto">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="shipping" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Options</CardTitle>
              <CardDescription>
                Configure shipping rates and options for your customers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="free-shipping">Free Shipping Threshold ($)</Label>
                <Input 
                  id="free-shipping" 
                  type="number" 
                  value={freeShippingThreshold} 
                  onChange={(e) => setFreeShippingThreshold(e.target.value)} 
                />
                <p className="text-sm text-muted-foreground">
                  Orders above this amount qualify for free shipping
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="standard-shipping">Standard Shipping Rate ($)</Label>
                <Input 
                  id="standard-shipping" 
                  type="number" 
                  value={standardShippingRate} 
                  onChange={(e) => setStandardShippingRate(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="express-shipping">Express Shipping Rate ($)</Label>
                <Input 
                  id="express-shipping" 
                  type="number" 
                  value={expressShippingRate} 
                  onChange={(e) => setExpressShippingRate(e.target.value)} 
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSaveSettings("Shipping")} className="w-full sm:w-auto">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
