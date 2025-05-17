
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";
import { User, Settings, Save } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    whatsappNumber: user?.whatsappNumber || '',
    preferWhatsapp: user?.preferWhatsapp || false
  });

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      preferWhatsapp: checked
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await updateProfile({
        name: formData.name,
        whatsappNumber: formData.whatsappNumber,
        preferWhatsapp: formData.preferWhatsapp
      });
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully."
      });
      
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

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
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input 
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                <Input 
                  id="whatsappNumber"
                  name="whatsappNumber"
                  value={formData.whatsappNumber}
                  onChange={handleChange}
                  placeholder="+91XXXXXXXXXX"
                />
                <p className="text-xs text-muted-foreground">Include country code (e.g., +91)</p>
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox 
                  id="preferWhatsapp" 
                  checked={formData.preferWhatsapp}
                  onCheckedChange={handleCheckboxChange}
                />
                <Label htmlFor="preferWhatsapp">Prefer WhatsApp for order updates</Label>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center">
                      <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                      Saving...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </span>
                  )}
                </Button>
              </div>
            </form>
          ) : (
            <>
              <div className="space-y-2">
                <h3 className="font-medium text-sm text-muted-foreground">Name</h3>
                <p className="text-lg">{user.name}</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-sm text-muted-foreground">Email</h3>
                <p className="text-lg">{user.email}</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-sm text-muted-foreground">WhatsApp Number</h3>
                <p className="text-lg">{user.whatsappNumber || 'Not provided'}</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-sm text-muted-foreground">Communication Preference</h3>
                <p className="text-lg">{user.preferWhatsapp ? 'WhatsApp' : 'Email'}</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-sm text-muted-foreground">Role</h3>
                <p className="text-lg capitalize">{user.role}</p>
              </div>
              
              <div className="pt-6 flex flex-col gap-4">
                <Button 
                  onClick={() => setIsEditing(true)} 
                  variant="outline"
                  className="w-full"
                >
                  Edit Profile
                </Button>
                
                {user.role === 'admin' && (
                  <Link to="/admin">
                    <Button className="w-full" variant="default">
                      <Settings className="mr-2 h-4 w-4" />
                      Access Admin Panel
                    </Button>
                  </Link>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
