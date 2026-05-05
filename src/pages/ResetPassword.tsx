import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "../services/authService";
import { 
  Brain, 
  ArrowRight, 
  Warning, 
  CircleNotch, 
  Eye, 
  EyeSlash,
  Lock
} from "@phosphor-icons/react";
import { toast } from "sonner";

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    email: location.state?.email || "",
    otp: "",
    new_password: "",
    confirmPassword: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.new_password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.new_password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword({
        email: formData.email,
        otp: formData.otp,
        new_password: formData.new_password
      });
      toast.success("Password reset successful! Please login.");
      navigate("/auth");
    } catch (error: any) {
      console.error("Reset password error:", error);
      toast.error(error.response?.data?.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-6">
      <div className="w-full max-w-md space-y-8 bg-card p-8 rounded-3xl border shadow-xl animate-fade-in">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
              <Brain className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
          <h2 className="text-3xl font-bold tracking-tight">Reset password</h2>
          <p className="text-muted-foreground">
            Enter the code sent to your email and your new password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">Email address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="h-12 px-4"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="otp" className="text-sm font-medium">Reset Code (OTP)</Label>
            <Input
              id="otp"
              type="text"
              placeholder="Enter 6-digit code"
              value={formData.otp}
              onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
              className="h-12 px-4 font-mono text-center text-lg tracking-widest"
              required
              maxLength={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">New Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Minimum 8 characters"
                value={formData.new_password}
                onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                className="h-12 px-4 pr-12 transition-all duration-200"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
              >
                {showPassword ? <EyeSlash className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="h-12 px-4 transition-all duration-200"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 gradient-primary text-primary-foreground font-medium text-base shadow-glow hover:shadow-lg transition-all duration-300 group"
          >
            {isLoading ? (
              <CircleNotch className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Reset Password
                <Lock className="w-4 h-4 ml-2 group-hover:rotate-12 transition-transform" />
              </>
            )}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Didn't receive a code?{" "}
            <button 
              type="button"
              className="text-primary font-medium hover:underline"
              onClick={() => navigate("/forgot-password")}
            >
              Try again
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
