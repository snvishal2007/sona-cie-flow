-- Configure Supabase to send actual OTP codes instead of magic links
-- We need to disable email confirmations and enable OTP-only authentication

-- Update auth settings to use OTP instead of magic links
UPDATE auth.config SET
  enable_email_confirmations = false,
  enable_signup = true,
  enable_email_change_confirmations = false
WHERE TRUE;

-- Create a custom email template for OTP (if needed)
-- Note: Email templates are typically configured through the Supabase dashboard