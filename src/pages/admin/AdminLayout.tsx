import { useNavigate, Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarSeparator
} from "@/components/ui/sidebar";
import {
  BarChart3,
  Home,
  Package,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  Book,
  Menu,
  X,
  Sun,
  Moon
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "next-themes";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetClose,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export default function AdminLayout() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const isMobile = useIsMobile();
  const pendingOrdersCount = 3; // Example value, should be from a real context in production
  const { theme, setTheme } = useTheme();
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  
  // Auto-collapse sidebar on mobile
  useEffect(() => {
    if (isMobile) {
      setCollapsed(true);
    } else {
      setCollapsed(false);
    }
  }, [isMobile]);

  const handleLogout = () => {
    toast.success("Logged out successfully");
    navigate("/");
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const navigateTo = (path: string) => {
    navigate(path);
    setMobileSheetOpen(false);
  };

  const navItems = [
    { icon: BarChart3, label: "Dashboard", path: "/admin" },
    { icon: Package, label: "Products", path: "/admin/products" },
    { icon: ShoppingCart, label: "Orders", path: "/admin/orders", badge: pendingOrdersCount },
    { icon: Book, label: "Blog Posts", path: "/admin/blog-posts" },
    { icon: Users, label: "Customers", path: "/admin/customers" },
    { icon: Settings, label: "Settings", path: "/admin/settings" },
    { icon: Home, label: "View Store", path: "/" },
    { icon: LogOut, label: "Logout", path: "", action: handleLogout, danger: true },
  ];

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-gray-50 dark:bg-gray-900">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <Sidebar className={cn(
            "border-r bg-white dark:bg-gray-800 transition-all duration-300 hidden md:block",
            collapsed ? "w-[70px]" : "w-[250px]"
          )}>
            <SidebarHeader className="flex flex-col gap-2 px-4 py-5">
              <div className="flex items-center justify-between">
                {!collapsed && (
                  <h2 className="text-xl font-bold text-primary truncate">Manglanam Admin</h2>
                )}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={toggleSidebar} 
                  className="h-8 w-8 rounded-full hover:bg-gray-100"
                >
                  {collapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
                </Button>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarMenu>
                {navItems.slice(0, 6).map((item, index) => (
                  <SidebarMenuItem key={index}>
                    <SidebarMenuButton 
                      onClick={() => navigate(item.path)}
                      tooltip={item.label}
                      className={cn(
                        "px-3 py-2.5 text-sm font-medium rounded-lg relative",
                        collapsed ? "flex justify-center items-center" : "",
                        item.danger ? "text-red-500 hover:bg-red-50" : ""
                      )}
                    >
                      <item.icon className={cn("h-5 w-5", collapsed ? "" : "mr-3")} />
                      {!collapsed && <span>{item.label}</span>}
                      {item.badge && item.badge > 0 && (
                        <Badge className={cn(
                          "bg-red-500",
                          collapsed ? "absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center" : "ml-2"
                        )}>
                          {item.badge}
                        </Badge>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarContent>
            <SidebarSeparator />
            <SidebarFooter className="pb-5">
              <SidebarMenu>
                {navItems.slice(6).map((item, index) => (
                  <SidebarMenuItem key={index}>
                    <SidebarMenuButton 
                      onClick={item.action || (() => navigate(item.path))}
                      tooltip={item.label}
                      className={cn(
                        "px-3 py-2.5 text-sm font-medium rounded-lg",
                        collapsed ? "flex justify-center items-center" : "",
                        item.danger ? "text-red-500 hover:bg-red-50" : ""
                      )}
                    >
                      <item.icon className={cn("h-5 w-5", collapsed ? "" : "mr-3")} />
                      {!collapsed && <span>{item.label}</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarFooter>
          </Sidebar>
        )}
        
        <div className={cn(
          "flex flex-col flex-1 w-full overflow-hidden transition-all duration-300",
          !isMobile && (collapsed ? "w-[calc(100%-70px)]" : "w-[calc(100%-250px)]")
        )}>
          <header className="h-16 border-b bg-white dark:bg-gray-800 flex items-center justify-between px-4 shadow-sm">
            {/* Mobile menu button */}
            {isMobile && (
              <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
                <SheetTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="md:hidden"
                    aria-label="Toggle admin menu"
                  >
                    <Menu className="h-5 w-5 text-primary" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent 
                  side="left" 
                  className="w-[85%] max-w-[350px] sm:max-w-sm bg-white dark:bg-gray-800 p-0"
                  aria-describedby="admin-sheet-description"
                >
                  <SheetHeader className="border-b border-gray-200 dark:border-gray-700 p-4">
                    <SheetTitle className="text-xl font-bold text-primary">Manglanam Admin</SheetTitle>
                    <span id="admin-sheet-description" className="sr-only">
                      Admin navigation menu with dashboard controls and settings
                    </span>
                    <SheetClose className="absolute right-4 top-4" aria-label="Close admin menu">
                      <X className="h-5 w-5 text-primary" />
                    </SheetClose>
                  </SheetHeader>
                  <div className="py-4 flex flex-col h-full overflow-auto">
                    <div className="flex-1 space-y-1 px-2">
                      {navItems.map((item, idx) => (
                        <SheetClose key={idx} asChild>
                          <Button 
                            variant="ghost" 
                            className={cn(
                              "w-full justify-start pl-3 py-6 rounded-lg mb-1",
                              item.danger ? "text-red-500 hover:bg-red-50/30" : ""
                            )}
                            onClick={item.action || (() => navigateTo(item.path))}
                          >
                            <item.icon className="mr-3 h-5 w-5" />
                            {item.label}
                            {item.badge && item.badge > 0 && (
                              <Badge className="ml-auto bg-red-500">{item.badge}</Badge>
                            )}
                          </Button>
                        </SheetClose>
                      ))}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            )}
            
            {/* Logo (centered on mobile) */}
            <div className={cn(
              "flex items-center", 
              isMobile ? "mx-auto" : "mr-auto ml-0"
            )}>
              <h2 className="text-xl font-bold text-primary">Manglanam Admin</h2>
            </div>
            
            {/* Right-side controls */}
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleTheme}
                className="rounded-full"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="rounded-full p-0" aria-label="User menu">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src="/placeholder.svg" alt="Admin" />
                      <AvatarFallback>AN</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-0.5">
                      <p className="text-sm font-medium">Admin User</p>
                      <p className="text-xs text-muted-foreground">admin@manglanam.com</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/admin/settings/profile")}>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/admin/settings")}>
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto w-full">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
