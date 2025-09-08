import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerifyOtpRequest {
  email: string;
  otp: string;
  role: string;
  phone?: string;
  action?: string;
}

interface OtpSession {
  email: string;
  otp: string;
  role: string;
  created_at: string;
  expires_at: string;
}

// In-memory storage for OTP sessions (in production, use Redis or database)
const otpSessions = new Map<string, OtpSession>();

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    if (req.method === 'POST' && req.url.endsWith('/store')) {
      // Store OTP endpoint
      const { email, otp, role }: VerifyOtpRequest = await req.json();
      
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
      const sessionKey = `${email}-${role}`;
      
      otpSessions.set(sessionKey, {
        email,
        otp,
        role,
        created_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString()
      });

      console.log(`OTP stored for ${email} (${role}): ${otp}`);

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (req.method === 'POST') {
      // Verify OTP endpoint
      const { email, otp, role }: VerifyOtpRequest = await req.json();
      
      if (!email || !otp || !role) {
        throw new Error('Missing required fields: email, otp, role');
      }

      const sessionKey = `${email}-${role}`;
      const session = otpSessions.get(sessionKey);

      if (!session) {
        throw new Error('OTP not found or expired');
      }

      // Check if OTP is expired
      if (new Date() > new Date(session.expires_at)) {
        otpSessions.delete(sessionKey);
        throw new Error('OTP has expired');
      }

      // Verify OTP
      if (session.otp !== otp) {
        throw new Error('Invalid OTP');
      }

      // OTP is valid, clean up
      otpSessions.delete(sessionKey);

      // Get or create user
      let { data: existingUser, error: getUserError } = await supabase.auth.admin.getUserByEmail(email);
      
      if (getUserError && !getUserError.message.includes('User not found')) {
        throw new Error(`Error checking user: ${getUserError.message}`);
      }

      let userId: string;

      if (!existingUser.user) {
        // Create new user - auto-determine role from email
        const userRole = email.endsWith('@sonatech.ac.in') ? 'student' : 'class_teacher';
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email,
          email_confirm: true,
          user_metadata: { role: userRole }
        });

        if (createError) {
          throw new Error(`Error creating user: ${createError.message}`);
        }

        userId = newUser.user!.id;
        console.log(`Created new user: ${email} with role: ${userRole}`);
      } else {
        userId = existingUser.user.id;
        console.log(`Found existing user: ${email}`);
      }

      // Generate JWT token for the user
      const { data: { session: authSession }, error: sessionError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email,
        options: {
          redirectTo: `${req.headers.get('origin') || 'http://localhost:5173'}/`
        }
      });

      if (sessionError) {
        throw new Error(`Error generating session: ${sessionError.message}`);
      }

      console.log(`OTP verified successfully for ${email} (${role})`);

      return new Response(JSON.stringify({ 
        success: true, 
        user: { id: userId, email, role },
        message: "OTP verified successfully"
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    throw new Error('Method not allowed');

  } catch (error: any) {
    console.error("Error in verify-otp function:", error);
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