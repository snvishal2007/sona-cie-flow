import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { ArrowLeft, Mail, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PhoneOTPLoginFormProps {
  role: string;
  onBack: () => void;
  onLogin: (user: any) => void;
}

export const PhoneOTPLoginForm = ({ role, onBack, onLogin }: PhoneOTPLoginFormProps) => {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [otpExpiry, setOtpExpiry] = useState<Date | null>(null);
  const [otpExpired, setOtpExpired] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendCountdown > 0) {
      interval = setInterval(() => {
        setResendCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendCountdown]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpExpiry) {
      interval = setInterval(() => {
        if (new Date() > otpExpiry) {
          setOtpExpired(true);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpExpiry]);

  const getRoleTitle = (role: string) => {
    const titles: Record<string, string> = {
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
    if (!email || !phone) return;

    setLoading(true);
    try {
      const generatedOTP = generateOTP();
      
      // Send OTP via edge function
      const { error: sendError } = await supabase.functions.invoke('send-otp', {
        body: { 
          email, 
          otp: generatedOTP, 
          role,
          phone
        }
      });

      if (sendError) throw sendError;

      toast({
        title: "OTP Sent",
        description: `OTP sent to ${phone}. Check your messages.`,
      });

      setOtpSent(true);
      setOtpExpiry(new Date(Date.now() + 5 * 60 * 1000)); // 5 minutes
      setResendCountdown(30);
      setOtpExpired(false);
    } catch (error: any) {
      toast({
        title: "Failed to send OTP",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;

    if (otpExpired) {
      toast({
        title: "OTP Expired",
        description: "Please request a new OTP",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: { email, otp, role, phone }
      });

      if (error) throw error;

      toast({
        title: "Login Successful",
        description: "Welcome to the portal!"
      });

      onLogin(data.user);
    } catch (error: any) {
      toast({
        title: "Invalid OTP",
        description: error.message || "Please check your OTP and try again",
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
              {otpSent ? "Enter the OTP sent to your phone" : "Enter your details to receive OTP"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!otpSent ? (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-academic-navy">
                    Outlook Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-academic-gray" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.name@sonatech.ac.in"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-academic-navy">
                    Phone Number
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-academic-gray" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  variant="academic" 
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? "Sending OTP..." : "Send OTP"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-academic-navy">
                    Enter OTP
                  </Label>
                  <div className="flex justify-center">
                    <InputOTP
                      value={otp}
                      onChange={setOtp}
                      maxLength={6}
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
                  <div className="text-center space-y-2">
                    {otpExpired ? (
                      <p className="text-sm text-destructive">OTP has expired</p>
                    ) : (
                      <p className="text-sm text-academic-gray">
                        OTP expires in {otpExpiry ? Math.max(0, Math.floor((otpExpiry.getTime() - Date.now()) / 1000)) : 0} seconds
                      </p>
                    )}
                    {resendCountdown > 0 ? (
                      <p className="text-sm text-academic-gray">
                        Resend OTP in {resendCountdown} seconds
                      </p>
                    ) : (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={handleSendOTP}
                        className="text-academic-blue hover:text-academic-blue-dark"
                      >
                        Resend OTP
                      </Button>
                    )}
                  </div>
                </div>
                <Button 
                  type="submit" 
                  variant="academic" 
                  className="w-full"
                  disabled={loading || otp.length !== 6 || otpExpired}
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};