
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

const OrderSuccess = () => {
  return (
    <div className="container-custom py-16">
      <div className="max-w-md mx-auto text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="text-cardamom h-24 w-24" />
        </div>
        
        <h1 className="text-3xl font-bold mb-4">Order Placed Successfully!</h1>
        
        <p className="text-muted-foreground mb-8">
          Thank you for your purchase. Your order has been received and is being processed.
          You will receive a confirmation email shortly.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link to="/products">Continue Shopping</Link>
          </Button>
          
          <Button variant="outline" asChild>
            <Link to="/">Return Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
