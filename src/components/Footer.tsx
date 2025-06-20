import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, MessageCircle, Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function Footer() {
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add newsletter subscription logic here
  };

  return (
    <footer className="bg-gray-50 border-t pt-16 pb-8">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="space-y-4">
            <h3 className="text-xl font-bold font-playfair text-primary">Manglanam Naturals</h3>
            <p className="text-sm text-gray-600">
              Premium spices and herbs sourced directly from farmers around the world, bringing authentic flavors to your kitchen.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com/manglanam" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary transition-colors">
                <Facebook size={20} />
              </a>
              <a href="https://www.instagram.com/manglanam.naturals" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary transition-colors">
                <Instagram size={20} />
              </a>
              <a href="https://www.youtube.com/@Manglanam" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary transition-colors">
                <Youtube size={20} />
              </a>
              <a href="https://wa.me/917974706071" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary transition-colors">
                <MessageCircle size={20} />
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-md mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-primary transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-600 hover:text-primary transition-colors text-sm">
                  Shop
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-600 hover:text-primary transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-600 hover:text-primary transition-colors text-sm">
                  Blog
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-md mb-4">Contact Us</h4>
            <address className="not-italic text-sm text-gray-600 space-y-2">
              <p>Plot No. 70 Numkeen Cluster & Food Allite Park</p>
              <p>Karamdi, dist. Ratlam ,457001</p>
              <div className="flex items-center gap-2">
                <Mail size={16} />
                <a href="mailto:info@manglanam.com" className="hover:text-primary transition-colors">
                  info@manglanam.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} />
                <a href="tel:+917974706071" className="hover:text-primary transition-colors">
                  +91 7974706071
                </a>
              </div>
            </address>
          </div>

          {/* <div>
            <h4 className="font-semibold text-md mb-4">Newsletter</h4>
            <p className="text-sm text-gray-600 mb-4">
              Subscribe to our newsletter for exclusive offers and updates.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className="w-full"
                required
              />
              <Button type="submit" className="w-full bg-spice-500 hover:bg-spice-600">
                Subscribe
              </Button>
            </form>
          </div> */}
        </div>
        
        <div className="border-t pt-8 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Manglanam Naturals. All rights reserved.</p>
          <div className="mt-2 flex flex-wrap justify-center gap-4">
            <Link to="/privacy" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <Link to="/shipping" className="hover:text-primary transition-colors">
              Shipping Policy
            </Link>
            <Link to="/refund" className="hover:text-primary transition-colors">
              Refund Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
