import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import api from '@/services/api';
import { toast } from 'sonner';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayCheckoutProps {
  order: any;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  onSuccess: (paymentId: string, orderId: string, signature: string) => void;
  onFailure: (error: any) => void;
}

const RazorpayCheckout = ({
  order,
  customerInfo,
  onSuccess,
  onFailure
}: RazorpayCheckoutProps) => {
  useEffect(() => {
    const loadRazorpay = async () => {
      try {
        // Load Razorpay script
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);

        script.onload = () => {
          if (!order.razorpayOrder) {
            toast.error('Error initializing payment');
            return;
          }

          const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: order.totalPrice * 100,
            currency: 'INR',
            name: 'Manglanam Spices',
            description: `Order #${order._id}`,
            order_id: order.razorpayOrder.id,
            prefill: {
              name: customerInfo.name,
              email: customerInfo.email,
              contact: customerInfo.phone
            },
            handler: function (response: any) {
              onSuccess(
                response.razorpay_payment_id,
                response.razorpay_order_id,
                response.razorpay_signature
              );
            },
            modal: {
              ondismiss: function () {
                onFailure({ message: 'Payment cancelled by user' });
              }
            },
            theme: {
              color: '#E11D48'
            }
          };

          const razorpay = new window.Razorpay(options);
          razorpay.open();
        };

        script.onerror = () => {
          toast.error('Error loading payment gateway');
          onFailure({ message: 'Failed to load payment gateway' });
        };
      } catch (error) {
        console.error('Error initializing Razorpay:', error);
        onFailure(error);
      }
    };

    loadRazorpay();

    return () => {
      // Cleanup script on unmount
      const script = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (script) {
        document.body.removeChild(script);
      }
    };
  }, [order, customerInfo, onSuccess, onFailure]);

  return null;
};

export default RazorpayCheckout;
