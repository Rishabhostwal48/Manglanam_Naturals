
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { User, Settings } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Please login to view your profile</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Link to="/login">
              <Button>Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <User className="w-10 h-10" />
          </div>
          <CardTitle className="text-2xl">My Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="font-medium text-sm text-muted-foreground">Name</h3>
            <p className="text-lg">{user.name}</p>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium text-sm text-muted-foreground">Email</h3>
            <p className="text-lg">{user.email}</p>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium text-sm text-muted-foreground">Role</h3>
            <p className="text-lg capitalize">{user.role}</p>
          </div>
          
          <div className="pt-6 flex flex-col gap-4">
            {user.role === 'admin' && (
              <Link to="/admin">
                <Button className="w-full" variant="default">
                  <Settings className="mr-2 h-4 w-4" />
                  Access Admin Panel
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
