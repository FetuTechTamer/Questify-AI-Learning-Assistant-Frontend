import { useState } from "react";
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  CreditCard,
  Question,
  CaretRight,
  Moon,
  Sun,
  SpeakerHigh,
  Envelope,
  DeviceMobile,
  Check,
} from "@phosphor-icons/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { cn } from "@/lib/utils";
import { studentProfile } from "@/data/mockData";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";

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
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    studyReminders: true,
    examAlerts: true,
    weeklyReports: true,
    soundEffects: true,
    darkMode: false,
    language: "English",
  });

  const updateSetting = (key: string, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
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
                      ? "gradient-primary text-primary-foreground"
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
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary-foreground">
                        {studentProfile.name.split(" ").map((n) => n[0]).join("")}
                      </span>
                    </div>
                    <div>
                      <Button variant="outline" size="sm" onClick={() => toast.info("Photo upload coming soon!")}>Change Photo</Button>
                      <p className="text-xs text-muted-foreground mt-1">JPG, PNG up to 5MB</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input defaultValue={studentProfile.name} />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input defaultValue={studentProfile.email} />
                    </div>

                  </div>

                  <Button className="gradient-primary" onClick={() => toast.success("Profile updated successfully!")}>Save Changes</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Password</CardTitle>
                  <CardDescription>Change your password</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Current Password</Label>
                    <Input type="password" />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>New Password</Label>
                      <Input type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label>Confirm Password</Label>
                      <Input type="password" />
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => toast.success("Password updated successfully!")}>Update Password</Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Help Section */}
          {activeSection === "help" && (
            <div className="space-y-6 animate-fade-in">
              <Card>
                <CardHeader>
                  <CardTitle>Help & Support</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { title: "Getting Started Guide", desc: "Learn the basics of Questify" },
                    { title: "FAQ", desc: "Common questions answered" },
                    { title: "Contact Support", desc: "Get help from our team" },
                    { title: "Report a Bug", desc: "Help us fix issues" },
                  ].map((item) => (
                    <button
                      key={item.title}
                      className="w-full flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="text-left">
                        <p className="font-medium text-sm">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                      <CaretRight className="w-5 h-5 text-muted-foreground" />
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
