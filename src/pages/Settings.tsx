import { useState, useRef } from "react";
import {
  User,
  Question,
  CaretRight,
  Trash,
  Camera,
  CircleNotch,
} from "@phosphor-icons/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/authService";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SettingSection {
  id: string;
  label: string;
  icon: React.ElementType;
  description: string;
}

const sections: SettingSection[] = [
  { id: "account", label: "Account", icon: User, description: "Manage your account details" },
  { id: "help", label: "Help & Support", icon: Question, description: "Get assistance" },
];

export default function Settings() {
  const [activeSection, setActiveSection] = useState("account");
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpdateProfile = async () => {
    if (!fullName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    setIsUpdating(true);
    try {
      await authService.updateProfile({ full_name: fullName });
      toast.success("Profile updated successfully!");
      window.location.reload(); 
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setIsUploading(true);
    try {
      await authService.updateAvatar(file);
      toast.success("Avatar updated successfully!");
      window.location.reload();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to upload avatar");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteAvatar = async () => {
    setIsUploading(true);
    try {
      await authService.deleteAvatar();
      toast.success("Avatar removed");
      window.location.reload();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to remove avatar");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await authService.deleteAccount();
      logout();
      toast.success("Account permanently deleted");
      navigate("/auth");
    } catch (error: any) {
      if (error.response?.status === 404) {
        toast.error("Account deletion endpoint not found.");
      } else {
        toast.error(error.response?.data?.message || "Failed to delete account");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DashboardLayout title="Settings">
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <Card className="lg:col-span-1 h-fit">
          <CardContent className="p-4">
            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all",
                    activeSection === section.id
                      ? "gradient-primary text-primary-foreground font-bold shadow-md"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  <section.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{section.label}</span>
                </button>
              ))}
            </nav>
          </CardContent>
        </Card>

        {/* Settings Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Account Section */}
          {activeSection === "account" && (
            <div className="space-y-6 animate-fade-in">
              <Card className="overflow-hidden border-none shadow-lg">
                <CardHeader className="bg-muted/30">
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your personal details and avatar</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8 pt-6">
                  {/* Avatar Section */}
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="relative group">
                      <Avatar className="w-24 h-24 border-4 border-background shadow-xl">
                        <AvatarImage src={user?.avatar_url || ""} alt={user?.full_name} />
                        <AvatarFallback className="gradient-primary text-2xl font-bold text-primary-foreground">
                          {user?.full_name?.split(" ").map((n: string) => n[0]).join("") || "U"}
                        </AvatarFallback>
                      </Avatar>
                      {isUploading && (
                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                          <CircleNotch className="w-8 h-8 text-white animate-spin" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                        />
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          Change Photo
                        </Button>
                        {user?.avatar_url && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={handleDeleteAvatar}
                            disabled={isUploading}
                          >
                            <Trash className="w-4 h-4 mr-2" />
                            Remove
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">Recommended: Square JPG, PNG up to 5MB</p>
                    </div>
                  </div>

                  {/* Form Section */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</Label>
                      <Input 
                        value={fullName} 
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Your full name"
                        className="bg-muted/30 border-none h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</Label>
                      <Input value={user?.email || ""} disabled className="bg-muted h-12 border-none opacity-70" />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Button 
                      className="gradient-primary px-8 h-12 rounded-xl font-bold shadow-lg" 
                      onClick={handleUpdateProfile}
                      disabled={isUpdating}
                    >
                      {isUpdating ? <CircleNotch className="w-5 h-5 animate-spin" /> : "Save Changes"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Password Section */}
              <Card className="overflow-hidden border-none shadow-lg">
                <CardHeader className="bg-muted/30">
                  <CardTitle>Password</CardTitle>
                  <CardDescription>Change your account password</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Current Password</Label>
                    <Input type="password" placeholder="••••••••" className="bg-muted/30 border-none h-12" />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">New Password</Label>
                      <Input type="password" placeholder="••••••••" className="bg-muted/30 border-none h-12" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Confirm New Password</Label>
                      <Input type="password" placeholder="••••••••" className="bg-muted/30 border-none h-12" />
                    </div>
                  </div>
                  <div className="pt-4 flex justify-end">
                    <Button variant="outline" className="px-8 h-12 rounded-xl font-bold" onClick={() => toast.info("Password update feature coming soon!")}>
                      Update Password
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Danger Zone */}
              <Card className="border-destructive/20 bg-destructive/5 overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-destructive">Danger Zone</CardTitle>
                  <CardDescription>Permanently delete your account and all associated data</CardDescription>
                </CardHeader>
                <CardContent>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="font-bold">
                        <Trash className="w-4 h-4 mr-2" />
                        Delete Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your account
                          and remove your data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleDeleteAccount}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {isDeleting ? "Deleting..." : "Delete Permanently"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Help Section */}
          {activeSection === "help" && (
            <div className="space-y-6 animate-fade-in">
              <Card className="border-none shadow-lg">
                <CardHeader>
                  <CardTitle>Help & Support</CardTitle>
                  <CardDescription>Need assistance with Questify?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { title: "Getting Started Guide", desc: "Learn the basics of Questify AI" },
                    { title: "FAQ", desc: "Common questions about exams and credits" },
                    { title: "Contact Support", desc: "Get help from our technical team" },
                    { title: "Report a Bug", desc: "Help us improve your experience" },
                  ].map((item) => (
                    <button
                      key={item.title}
                      className="w-full flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-all group"
                    >
                      <div className="text-left">
                        <p className="font-bold text-sm group-hover:text-primary transition-colors">{item.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                      </div>
                      <CaretRight className="w-5 h-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                    </button>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
