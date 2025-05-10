import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ShoppingBag, Search, User, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const { openCart, cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { user, logout, isAuthenticated } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setIsMenuOpen(false);
    }
  };

  const handleAccountClick = () => {
    if (isAuthenticated) {
      navigate("/profile");
    } else {
      navigate("/login", { state: { from: location } });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setIsScrolled(offset > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const navLinks = [
    { title: "Home", path: "/" },
    { title: "Shop", path: "/products" },
    { title: "Recipes", path: "/blog" },
    { title: "About Us", path: "/about" },
  ];

  return (
    <>
      {/* Main Navigation Bar */}
      <header
        className={cn(
          "sticky top-0 z-40 transition-all duration-300",
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-md py-2"
            : "bg-white/80 backdrop-blur-sm py-4"
        )}
      >
        <div className="container-custom">
          {/* Mobile Navigation */}
          {isMobile ? (
            <div className="flex items-center justify-between">
              {/* Cart Icon (Left) */}
              <Button
                variant="ghost"
                size="icon"
                onClick={openCart}
                className="relative hover:bg-primary/10 rounded-full h-10 w-10"
              >
                <ShoppingBag className="h-5 w-5 text-primary" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-cinnamon text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>

              {/* Logo (Center) */}
              <Link to="/" className="flex items-center">
                <h1 className="text-xl font-bold font-playfair text-primary">
                  Manglanam <span className="text-primary">Naturals</span>
                </h1>
              </Link>

              {/* Mobile Menu Drawer */}
              <Drawer>
                <DrawerTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-full"
                    aria-label="Open menu"
                  >
                    <Menu className="h-5 w-5 text-primary" />
                  </Button>
                </DrawerTrigger>
                <DrawerContent 
                  className="h-[80vh] rounded-t-[20px] bg-[#F8F8F2]"
                  aria-describedby="drawer-description"
                >
                  <DrawerHeader className="border-b border-primary/10 pb-4">
                    <DrawerTitle className="text-center font-playfair text-primary text-xl">
                      Menu
                    </DrawerTitle>
                    <span id="drawer-description" className="sr-only">
                      Navigation menu with search and main site links
                    </span>
                    <DrawerClose 
                      className="absolute right-4 top-4" 
                      aria-label="Close menu"
                      tabIndex={0}
                    >
                      <X className="h-5 w-5 text-primary" />
                    </DrawerClose>
                  </DrawerHeader>
                  <div className="py-6 px-6 overflow-y-auto">
                    {/* Mobile Search */}
                    <form onSubmit={handleSearch} className="mb-6">
                      <div className="relative">
                        <Input
                          type="search"
                          placeholder="Search spices..."
                          className="w-full py-6 pl-12 pr-4 rounded-full border-primary/20 bg-white/80"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          tabIndex={0}
                        />
                        <Search className="absolute top-1/2 left-4 transform -translate-y-1/2 h-5 w-5 text-primary/60" />
                      </div>
                    </form>

                    {/* Mobile Navigation Links */}
                    <nav className="space-y-1">
                      {navLinks.map((link) => (
                        <DrawerClose asChild key={link.path}>
                          <Link
                            to={link.path}
                            className={cn(
                              "flex items-center justify-between py-4 px-4 rounded-lg font-medium transition-colors",
                              isActive(link.path)
                                ? "bg-primary/10 text-primary"
                                : "hover:bg-primary/5 hover:text-primary"
                            )}
                            tabIndex={0}
                          >
                            <span>{link.title}</span>
                            <ChevronRight className="h-4 w-4" />
                            
                          </Link>
                        </DrawerClose>
                      ))}
                    </nav>

                    {/* User Account Section */}
                    <div className="mt-8 pt-6 border-t border-primary/10">
                      <h3 className="text-sm font-medium text-muted-foreground mb-4">
                        Account
                      </h3>
                      <div className="pt-2 flex space-x-4 border-t border-gray-100">
                {isAuthenticated ? (
                  <>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-gray-700"
                      onClick={() => navigate('/profile')}
                    >
                      <User size={18} className="mr-2" />
                      Profile
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-gray-700"
                      onClick={logout}
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-gray-700"
                    onClick={handleAccountClick}
                  >
                    <User size={18} className="mr-2" />
                    Account
                  </Button>
                )}
              </div>
                    </div>
                  </div>
                  <DrawerFooter className="pt-0">
                    <p className="text-center text-xs text-muted-foreground">
                      © {new Date().getFullYear()} Manglanam Naturals
                    </p>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>
            </div>
          ) : (
            /* Desktop Navigation */
            <div className="flex flex-col">
              {/* Top Row: Logo, Search, Cart, Account */}
              <div className="flex items-center justify-between py-2">
                {/* Logo (Left) */}
                <Link to="/" className="flex items-center">
                  <h1 className="text-2xl font-bold font-playfair text-primary">
                    Manglanam <span className="text-cardamom">Naturals</span>
                  </h1>
                </Link>

                {/* Search Bar (Center) */}
                <form
                  onSubmit={handleSearch}
                  className="relative w-1/3 max-w-md"
                >
                  <Input
                    type="search"
                    placeholder="Search spices..."
                    className="w-full pl-10 pr-4 py-2 rounded-full border-primary/20 bg-white/80"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search className="absolute top-1/2 left-3 transform -translate-y-1/2 h-4 w-4 text-primary/60" />
                </form>

                {/* Cart and Account (Right) */}
                {/* <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={openCart}
                    className="relative hover:bg-primary/10 rounded-full h-10 w-10"
                  >
                    <ShoppingBag className="h-5 w-5 text-primary" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-cinnamon text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </Button>
                  
                  <Link to="/login">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="hover:bg-primary/10 rounded-full h-10 w-10"
                    >
                      <User className="h-5 w-5 text-primary" />
                    </Button>
                  </Link>
                </div>*/}

              {/* Right Side Icons - Desktop */}
              <div className="flex items-center space-x-4">
                {isAuthenticated ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-700 hover:text-spice-500"
                        >
                        <User size={20} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate("/profile")}>
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/orders")}>
                        Orders
                      </DropdownMenuItem>
                      {user?.role === "admin" && (
                        <DropdownMenuItem
                        onClick={() => navigate("/admin")}
                        >
                          Admin Dashboard
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={logout}>
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-700 hover:text-spice-500"
                  onClick={handleAccountClick}
                  >
                    <User size={20} />
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="icon"
                  className="relative text-gray-700 hover:text-spice-500"
                  onClick={openCart}
                  >
                  <ShoppingBag size={20} />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2  text-white text-xs font-bold rounded-full w-5 h-5 bg-primary flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Button>
              </div>
            </div>

              {/* Second Row: Navigation Links */}
              <nav className="flex items-center justify-center space-x-8 py-3 border-t border-primary/10">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={cn(
                      "relative font-medium transition-colors hover:text-primary px-1 py-2",
                      isActive(link.path) ? "text-primary" : "text-foreground"
                    )}
                  >
                    <span>{link.title}</span>
                    {isActive(link.path) && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full"></span>
                    )}
                  </Link>
                ))}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Search Bar (below header) */}
      {isMobile && (
        <div className="bg-[#F8F8F2] py-4 px-4 shadow-sm">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Input
                type="search"
                placeholder="Search spices..."
                className="w-full py-5 pl-10 pr-4 rounded-full border-primary/20 bg-white/90"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute top-1/2 left-3 transform -translate-y-1/2 h-5 w-5 text-primary/60" />
            </div>
          </form>
        </div>
      )}
    </>
  );
}
