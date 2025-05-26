import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Loader2, MapPin } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import RazorpayCheckout from '@/components/checkout/RazorpayCheckout';
import { useOrders } from '@/context/OrderContext';
import api from '@/services/api';

const checkoutSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email is required'),
  whatsappNumber: z.string().optional(),
  phone: z.string().min(10, 'Phone number is required'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  postalCode: z.string().min(4, 'Postal code is required'),
  country: z.string().min(2, 'Country is required'),
  paymentMethod: z.enum(['razorpay', 'cash-on-delivery'])
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

const Checkout = () => {
  const { items: cart, subtotal, checkout, loading: cartLoading, clearCart } = useCart();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { createOrder } = useOrders();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [showRazorpay, setShowRazorpay] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<any>(null);
  const navigate = useNavigate();

  // Calculate summary values
  const taxRate = 0.1; // 10%
  const taxAmount = subtotal * taxRate;
  const shippingCost = subtotal > 100 ? 0 : 10; // Free shipping over $100
  const totalAmount = subtotal + taxAmount + shippingCost;

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: user?.name || '',
      email: user?.email || '',
      whatsappNumber: user?.whatsappNumber || '',
      phone: '',
      address: '',
      city: '',
      postalCode: '',
      country: '',
      paymentMethod: 'razorpay'
    }
  });

  useEffect(() => {
    // If user is authenticated, pre-fill the form fields
    if (isAuthenticated && user) {
      form.setValue('fullName', user.name);
      form.setValue('email', user.email);
    }
    
    // Redirect to login if not authenticated
    if (!authLoading && !isAuthenticated) {
      // Remember the current location so we can redirect back after login
      navigate('/login', { state: { from: '/checkout' } });
      toast.info('Please log in to proceed with checkout');
    }
  }, [isAuthenticated, authLoading, user, form, navigate]);

  const onSubmit = async (values: CheckoutFormValues) => {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const shippingAddress = {
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        whatsappNumber: values.whatsappNumber,
        street: values.address,
        city: values.city,
        state: '', // Add state field to form if needed
        zipCode: values.postalCode,
        country: values.country
      };

      // Format cart items to match OrderItem interface
      const orderItems = cart.map(item => ({
        product: item.product._id,
        name: item.product.name,
        size: item.size,
        quantity: item.quantity,
        price: item.product.price,
        image: item.product.image
      }));

      // Calculate prices
      const itemsPrice = cart.reduce((total, item) => 
        total + (item.product.salePrice || item.product.price) * item.quantity, 
        0
      );
      const taxPrice = itemsPrice * 0.1; // 10% tax
      const shippingPrice = itemsPrice > 1000 ? 0 : 100; // Free shipping over ₹1000
      const totalPrice = itemsPrice + taxPrice + shippingPrice;

      // Create order
      const order = await createOrder({
        orderItems,
        shippingAddress,
        paymentMethod: values.paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        isPaid: false,
        isDelivered: false,
        status: 'pending'
      });

      if (!order || !order._id) {
        throw new Error('Failed to create order');
      }

      setOrderId(order._id);
      
      // Save customer info for Razorpay
      setCustomerInfo({
        name: values.fullName,
        email: values.email,
        whatsappNumber: values.whatsappNumber
      });
      
      if (values.paymentMethod === 'razorpay') {
        // Show Razorpay checkout
        setShowRazorpay(true);
      } else {
        // For cash on delivery, process the order directly
        await checkout(values.paymentMethod);
        clearCart();
        toast.success('Order placed successfully!');
        navigate(`/order-confirmation/${order._id}`);
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.response?.data?.message || 'Error processing your order. Please try again.');
      setShowRazorpay(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = async (paymentId: string, razorpayOrderId: string, signature: string) => {
    try {
      if (!orderId) {
        console.error('No order ID available for payment confirmation');
        toast.error('Error processing payment: No order ID');
        return;
      }

      // Verify payment with backend
      const response = await api.post('/payments/verify-razorpay', {
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
        orderId
      });

      if (response.data.isPaid) {
        // Clear cart and navigate to order confirmation
        await checkout('razorpay');
        clearCart();
        toast.success('Payment successful!');
        navigate(`/order-confirmation/${orderId}`);
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error: any) {
      console.error('Error processing payment:', error);
      toast.error(error.response?.data?.message || 'Error processing payment. Please try again.');
      setShowRazorpay(false);
    }
  };

  const handlePaymentFailure = (error: any) => {
    console.error('Payment failed:', error);
    toast.error(error.message || 'Payment failed. Please try again.');
    setShowRazorpay(false);
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-spice-500" />
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="container-custom py-20">
        <div className="text-center">
          <h1 className="font-serif text-2xl mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-6">
            Add some products to your cart to proceed with checkout.
          </p>
          <Button 
            onClick={() => navigate('/shop')}
            className="bg-spice-500 hover:bg-spice-600"
          >
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-16">
      <h1 className="font-serif text-3xl mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
              <CardDescription>
                Enter your shipping details and payment method
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="your.email@example.com" type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="whatsappNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Whatsapp Number</FormLabel>
                          <FormControl>
                            <Input placeholder="+1 (555) 123-4567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="+1 (555) 123-4567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Spice Street" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="New York" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="postalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Postal Code</FormLabel>
                          <FormControl>
                            <Input placeholder="10001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input placeholder="United States" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Separator className="my-4" />
                  
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Payment Method</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-2"
                          >
                            <FormItem key="payment-razorpay" className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="razorpay" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Pay Online (Razorpay)
                              </FormLabel>
                            </FormItem>
                            <FormItem key="payment-cod" className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="cash-on-delivery" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Cash on Delivery
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {showRazorpay && orderId && customerInfo ? (
                    <div className="mt-4">
                      <RazorpayCheckout 
                        order={orderId}
                        customerInfo={customerInfo}
                        onSuccess={handlePaymentSuccess}
                        onFailure={handlePaymentFailure}
                      />
                    </div>
                  ) : (
                    <Button
                    type="submit" 
                    className="w-full"
                    variant="spice"
                    size="lg"
                      disabled={isSubmitting || cartLoading}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        `Place Order (₹${totalAmount.toFixed(2)})`
                      )}
                    </Button>
                  )}
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        
        {/* Order Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Items list */}
              <div className="space-y-3">
                {cart.map((item, index) => (
                  <div key={`${item.product._id || item.product.id}-${index}`} className="flex justify-between">
                    <span className="text-gray-600">
                      {item.quantity} x {item.product.name} ({item.size})
                    </span>
                    <span className="font-medium">
                      ₹{((item.salePrice || item.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              
              <Separator />
              
              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (10%)</span>
                  <span>₹{taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Shipping {subtotal > 100 && <span className="text-green-600">(Free)</span>}
                  </span>
                  <span>₹{shippingCost.toFixed(2)}</span>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span className="text-spice-700">₹{totalAmount.toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 text-sm text-gray-600 rounded-b-lg">
              <div className="flex items-start">
                <MapPin className="h-4 w-4 mr-2 mt-0.5 text-gray-400" />
                <p>Orders typically ship within 1-2 business days</p>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
