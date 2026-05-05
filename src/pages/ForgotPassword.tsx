import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "../services/authService";
import { 
  Brain, 
  ArrowRight, 
  Warning, 
  CircleNotch, 
  CaretLeft,
  PaperPlaneTilt
} from "@phosphor-icons/react";
import { toast } from "sonner";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);
    try {
      await authService.forgotPassword(email);
      toast.success("Reset code sent to your email!");
      navigate("/reset-password", { state: { email } });
    } catch (error: any) {
      console.error("Forgot password error:", error);
      toast.error(error.response?.data?.message || "Failed to send reset code");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-6">
      <div className="w-full max-w-md space-y-8 bg-card p-8 rounded-3xl border shadow-xl animate-fade-in">
        <div className="text-center space-y-2">
          <Link to="/auth" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-4 group">
            <CaretLeft className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1" />
            Back to Login
          </Link>
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
              <Brain className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
          <h2 className="text-3xl font-bold tracking-tight">Forgot password?</h2>
          <p className="text-muted-foreground">
            No worries, we'll send you reset instructions.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
                Send reset code
                <PaperPlaneTilt className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Remembered your password?{" "}
            <Link to="/auth" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
