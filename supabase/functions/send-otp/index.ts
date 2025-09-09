import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendOtpRequest {
  email: string;
  otp: string;
  role: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      throw new Error('Method not allowed');
    }

    const { email, otp, role }: SendOtpRequest = await req.json();
    
    if (!email || !otp || !role) {
      throw new Error('Missing required fields: email, otp, role');
    }

    const getRoleTitle = (role: string): string => {
      const titles: Record<string, string> = {
        student: "Student",
        "class-teacher": "Class Teacher",
        faculty: "Faculty",
        hod: "Head of Department",
        coe: "COE"
      };
      return titles[role] || role;
    };

    const emailResponse = await resend.emails.send({
      from: "Sonatech Authentication <onboarding@resend.dev>",
      to: [email],
      subject: `Your ${getRoleTitle(role)} Login OTP - Sonatech`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1e40af; margin: 0;">Sonatech College</h1>
            <p style="color: #6b7280; margin: 5px 0;">Authentication System</p>
          </div>
          
          <div style="background: #f8fafc; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
            <h2 style="color: #1e3a8a; margin-top: 0;">Your Login OTP</h2>
            <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">
              Hi there,<br><br>
              You requested to sign in as a <strong>${getRoleTitle(role)}</strong> to the Sonatech portal.
            </p>
            
            <div style="background: white; border: 2px solid #e5e7eb; border-radius: 6px; padding: 20px; text-align: center; margin: 20px 0;">
              <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px;">Your 6-digit verification code:</p>
              <div style="font-size: 32px; font-weight: bold; color: #1e40af; letter-spacing: 4px; font-family: monospace;">
                ${otp}
              </div>
            </div>
            
            <p style="color: #ef4444; font-size: 14px; margin-top: 20px;">
              ⚠️ This OTP will expire in 5 minutes for security reasons.
            </p>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; color: #6b7280; font-size: 14px;">
            <p><strong>Security Notice:</strong></p>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>Never share this OTP with anyone</li>
              <li>Sonatech staff will never ask for your OTP</li>
              <li>If you didn't request this, please ignore this email</li>
            </ul>
            
            <p style="margin-top: 20px; text-align: center; color: #9ca3af;">
              Sonatech College of Technology<br>
              Automated Authentication System
            </p>
          </div>
        </div>
      `,
    });

    console.log(`OTP email sent successfully to ${email} (${role}):`, emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      id: emailResponse.data?.id 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in send-otp function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);