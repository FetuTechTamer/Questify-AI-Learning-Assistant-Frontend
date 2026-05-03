import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "../services/authService";
import { useToast } from "@/hooks/use-toast";
import { Brain, CircleNotch, ArrowRight } from "@phosphor-icons/react";

const VerifyOTP = () => {
    const [otp, setOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const { toast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || "";

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!otp || otp.length !== 6) {
            toast({
                title: "Invalid OTP",
                description: "Please enter a valid 6-digit OTP",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        try {
            await authService.verify(email, otp);
            toast({
                title: "Account verified!",
                description: "You can now login to your account.",
            });
            navigate("/auth");
        } catch (error: any) {
            toast({
                title: "Verification failed",
                description: error.response?.data?.message || error.response?.data?.detail || error.message || "Invalid OTP",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (countdown > 0) return;
        setIsResending(true);
        try {
            await authService.resendOtp(email);
            setCountdown(60); // Start 60s countdown
            toast({
                title: "OTP resent",
                description: "Please check your email for the verification code.",
            });
        } catch (error: any) {
            toast({
                title: "Failed to resend OTP",
                description: error.response?.data?.message || error.response?.data?.detail || error.message || "Failed to resend OTP",
                variant: "destructive",
            });
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5">
            <div className="w-full max-w-md p-8">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 rounded-xl gradient-primary flex items-center justify-center">
                            <Brain className="w-8 h-8 text-primary-foreground" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold">Verify Your Email</h1>
                    <p className="text-muted-foreground mt-2">
                        We've sent a 6-digit verification code to<br />
                        <strong>{email || "your email"}</strong>
                    </p>
                </div>

                <form onSubmit={handleVerify} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="otp">Verification Code</Label>
                        <Input
                            id="otp"
                            type="text"
                            placeholder="Enter 6-digit code"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            maxLength={6}
                            className="text-center text-2xl tracking-widest h-14"
                            autoFocus
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 gradient-primary"
                    >
                        {isLoading ? (
                            <CircleNotch className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                Verify Account
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </>
                        )}
                    </Button>

                    <div className="text-center">
                        <button
                            type="button"
                            onClick={handleResendOTP}
                            disabled={isResending || countdown > 0}
                            className="text-sm text-primary hover:underline disabled:opacity-50 disabled:no-underline"
                        >
                            {isResending ? (
                                "Sending..."
                            ) : countdown > 0 ? (
                                `Resend code in ${countdown}s`
                            ) : (
                                "Resend verification code"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VerifyOTP;
