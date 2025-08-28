import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, Lock, Shield } from "lucide-react";

interface LoginFormProps {
  role: string;
  onBack: () => void;
  onLogin: (credentials: { email: string; otp?: string }) => void;
}

export const LoginForm = ({ role, onBack, onLogin }: LoginFormProps) => {
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const getRoleTitle = (role: string) => {
    const titles: Record<string, string> = {
      student: "Student",
      "class-teacher": "Class Teacher",
      faculty: "Faculty",
      hod: "Head of Department",
      ceo: "CEO"
    };
    return titles[role] || role;
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate OTP sending
    setTimeout(() => {
      setLoading(false);
      setStep("otp");
    }, 2000);
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate OTP verification
    setTimeout(() => {
      setLoading(false);
      onLogin({ email, otp });
    }, 1500);
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
              Sign in with your Sona College email
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === "email" ? (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-academic-navy">
                    College Email
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
              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-academic-navy">
                    Enter OTP
                  </Label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-3 h-4 w-4 text-academic-gray" />
                    <Input
                      id="otp"
                      type="text"
                      placeholder="6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="pl-10 text-center tracking-widest"
                      maxLength={6}
                      required
                    />
                  </div>
                  <p className="text-sm text-academic-gray">
                    OTP sent to {email}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setStep("email")}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button 
                    type="submit" 
                    variant="academic" 
                    className="flex-1"
                    disabled={loading}
                  >
                    {loading ? "Verifying..." : "Login"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};