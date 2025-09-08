import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

interface OTPLoginFormProps {
  role: string;
  onBack: () => void;
  onLogin: (user: any) => void;
}

export const OTPLoginForm = ({ role, onBack, onLogin }: OTPLoginFormProps) => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpExpiry, setOtpExpiry] = useState<Date | null>(null);
  const { toast } = useToast();

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Check OTP expiry
  useEffect(() => {
    if (otpExpiry && otpSent) {
      const checkExpiry = setInterval(() => {
        if (new Date() > otpExpiry) {
          setOtpSent(false);
          setOtp("");
          setOtpExpiry(null);
          toast({
            title: "OTP Expired",
            description: "Your OTP has expired. Please request a new one.",
            variant: "destructive"
          });
        }
      }, 1000);
      return () => clearInterval(checkExpiry);
    }
  }, [otpExpiry, otpSent, toast]);

  const getRoleTitle = (role: string) => {
    const titles: Record<string, string> = {
      student: "Student",
      "class-teacher": "Class Teacher",
      faculty: "Faculty",
      hod: "Head of Department",
      coe: "COE"
    };
    return titles[role] || role;
  };

  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate email format - only @sonatech.ac.in emails allowed
      if (!email.endsWith('@sonatech.ac.in')) {
        toast({
          title: "Invalid Email",
          description: "Please use your institutional email address (@sonatech.ac.in)",
          variant: "destructive"
        });
        return;
      }

      // Generate 6-digit OTP
      const generatedOtp = generateOTP();

      // Store OTP in the backend
      const { error: storeError } = await supabase.functions.invoke('verify-otp/store', {
        body: { email, otp: generatedOtp, role }
      });

      if (storeError) {
        throw new Error(storeError.message);
      }

      // Send OTP via email
      const { error: sendError } = await supabase.functions.invoke('send-otp', {
        body: { email, otp: generatedOtp, role }
      });

      if (sendError) {
        throw new Error(sendError.message);
      }

      setOtpSent(true);
      setResendCooldown(60); // 60 second cooldown
      setOtpExpiry(new Date(Date.now() + 5 * 60 * 1000)); // 5 minutes expiry
      toast({
        title: "OTP Sent",
        description: "Check your email for the 6-digit verification code (valid for 5 minutes)"
      });

    } catch (error: any) {
      toast({
        title: "Failed to send OTP",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Verify OTP with our custom backend
      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: { email, otp, role }
      });

      if (error) {
        toast({
          title: "Invalid OTP",
          description: error.message,
          variant: "destructive"
        });
      } else if (data?.success) {
        // OTP verified successfully
        onLogin(data.user);
        toast({
          title: "Login Successful",
          description: "You have been logged in successfully!"
        });
      } else {
        throw new Error("Verification failed");
      }
    } catch (error: any) {
      toast({
        title: "Verification Error",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-large">
          <CardHeader className="text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="absolute left-4 top-4 text-academic-gray hover:text-academic-navy"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-2xl text-academic-navy">
              {getRoleTitle(role)} Login
            </CardTitle>
            <CardDescription>
              Sign in with your institutional email using OTP
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!otpSent ? (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-academic-navy">
                    Institutional Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-academic-gray" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.rollno@sonatech.ac.in"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-primary hover:bg-primary-hover text-white"
                  disabled={loading}
                >
                  {loading ? "Sending OTP..." : "Send OTP"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-academic-navy">
                    Enter 6-digit OTP sent to {email}
                  </Label>
                  {otpExpiry && (
                    <div className="flex items-center justify-center text-sm text-academic-gray">
                      <Clock className="h-4 w-4 mr-1" />
                      Expires in: {Math.max(0, Math.ceil((otpExpiry.getTime() - Date.now()) / 1000 / 60))} minutes
                    </div>
                  )}
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={otp}
                      onChange={(value) => setOtp(value)}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-primary hover:bg-primary-hover text-white"
                  disabled={loading || otp.length !== 6}
                >
                  {loading ? "Verifying..." : "Verify & Login"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleSendOTP}
                  disabled={resendCooldown > 0}
                  className="w-full text-academic-blue hover:text-academic-blue-dark"
                >
                  {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : "Resend OTP"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};