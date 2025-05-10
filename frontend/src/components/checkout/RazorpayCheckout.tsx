import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayCheckoutProps {
  amount: number;
  orderId: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  onSuccess: (paymentId: string, razorpayOrderId: string, signature: string) => void;
  onFailure: (error: any) => void;
}

const RazorpayCheckout: React.FC<RazorpayCheckoutProps> = ({
  amount,
  orderId,
  customerInfo,
  onSuccess,
  onFailure,
}) => {
  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = () => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Enter the Key ID generated from the Dashboard
      amount: amount * 100, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
      currency: 'INR',
      name: 'Manglanam Naturals',
      description: `Order ${orderId}`,
      image: '/logo.png',
      order_id: orderId,
      handler: function (response: any) {
        onSuccess(
          response.razorpay_payment_id,
          response.razorpay_order_id,
          response.razorpay_signature
        );
      },
      prefill: {
        name: customerInfo.name,
        email: customerInfo.email,
        contact: customerInfo.phone,
      },
      notes: {
        address: 'Manglanam Naturals Corporate Office'
      },
      theme: {
        color: '#B76E79'
      }
    };

    try {
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      onFailure(error);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      className="w-full mt-6 bg-spice-500 hover:bg-spice-600"
    >
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Pay ₹{amount.toFixed(2)}
    </Button>
  );
};

export default RazorpayCheckout;
