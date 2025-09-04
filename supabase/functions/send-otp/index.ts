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

    const emailResponse = await resend.emails.send({
      from: "Academic System <onboarding@resend.dev>",
      to: [email],
      subject: `Your ${getRoleTitle(role)} Login OTP`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1e3a8a; text-align: center;">Academic Management System</h1>
          
          <h2 style="color: #374151;">Your Login OTP</h2>
          
          <p>Hello,</p>
          
          <p>You have requested to login as a <strong>${getRoleTitle(role)}</strong>. Please use the following 6-digit OTP to complete your login:</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <h2 style="color: #1e3a8a; font-size: 32px; letter-spacing: 8px; margin: 0;">${otp}</h2>
          </div>
          
          <p><strong>Important:</strong></p>
          <ul>
            <li>This OTP is valid for <strong>5 minutes</strong> only</li>
            <li>Do not share this OTP with anyone</li>
            <li>If you didn't request this login, please ignore this email</li>
          </ul>
          
          <p style="color: #6b7280; margin-top: 30px;">
            Best regards,<br>
            Academic Management System
          </p>
        </div>
      `,
    });

    console.log("OTP email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "OTP sent successfully",
      id: emailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-otp function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);