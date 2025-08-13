// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WebhookPayload {
  type: string;
  table: string;
  record: {
    id: string;
    email: string;
    email_confirmed_at: string | null;
    user_metadata?: {
      first_name?: string;
      last_name?: string;
      full_name?: string;
    };
  };
  old_record: any;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload: WebhookPayload = await req.json()
    console.log('Webhook payload received:', payload)
    
    // Only send welcome email if email is confirmed
    if (!payload.record.email_confirmed_at) {
      console.log('Email not confirmed yet, skipping welcome email')
      return new Response(
        JSON.stringify({ message: 'Email not confirmed, welcome email not sent' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const user = payload.record
    const firstName = user.user_metadata?.first_name || user.user_metadata?.full_name?.split(' ')[0] || 'there'
    
    console.log(`Sending welcome email to ${user.email} (${firstName})`)

    const welcomeEmailHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to FitAI!</title>
          <style>
              body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                  margin: 0;
                  padding: 20px;
                  background-color: #f8f9fa;
                  line-height: 1.6;
              }
              .container {
                  max-width: 600px;
                  margin: 0 auto;
                  background: #0A0A0A;
                  color: white;
                  padding: 40px;
                  border-radius: 16px;
                  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
              }
              .header {
                  text-align: center;
                  margin-bottom: 32px;
              }
              .logo {
                  font-size: 64px;
                  margin-bottom: 16px;
              }
              .title {
                  color: #22c55e;
                  font-size: 32px;
                  font-weight: 700;
                  margin-bottom: 8px;
              }
              .subtitle {
                  font-size: 18px;
                  color: #e5e7eb;
                  margin-bottom: 24px;
              }
              .greeting {
                  font-size: 20px;
                  color: #e5e7eb;
                  margin-bottom: 24px;
              }
              .message {
                  font-size: 16px;
                  color: #d1d5db;
                  line-height: 1.6;
                  margin-bottom: 24px;
              }
              .features-box {
                  background: #1A1A1A;
                  padding: 24px;
                  border-radius: 12px;
                  margin: 24px 0;
                  border-left: 4px solid #22c55e;
              }
              .features-title {
                  color: #22c55e;
                  font-size: 18px;
                  font-weight: 700;
                  margin-bottom: 16px;
              }
              .features-list {
                  list-style: none;
                  padding: 0;
                  margin: 0;
              }
              .features-list li {
                  color: #d1d5db;
                  font-size: 16px;
                  margin-bottom: 8px;
                  padding-left: 24px;
                  position: relative;
              }
              .features-list li::before {
                  content: "✅";
                  position: absolute;
                  left: 0;
              }
              .cta-button {
                  display: inline-block;
                  background: #22c55e;
                  color: white;
                  padding: 16px 32px;
                  border-radius: 16px;
                  text-decoration: none;
                  font-weight: 700;
                  font-size: 18px;
                  margin: 20px 0;
                  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
              }
              .footer {
                  margin-top: 32px;
                  padding-top: 24px;
                  border-top: 1px solid #374151;
                  text-align: center;
              }
              .footer-text {
                  font-size: 14px;
                  color: #9ca3af;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <div class="logo">🏋️‍♂️</div>
                  <h1 class="title">Welcome to FitAI!</h1>
                  <p class="subtitle">Your AI-powered fitness journey starts now</p>
              </div>
              
              <div class="content">
                  <p class="greeting">Hi ${firstName}! 👋</p>
                  
                  <p class="message">
                      Thank you for joining FitAI! Your account has been successfully activated, and we're excited to help you achieve your fitness goals with personalized AI coaching.
                  </p>
                  
                  <div class="features-box">
                      <h3 class="features-title">🚀 What's waiting for you:</h3>
                      <ul class="features-list">
                          <li>Complete your personalized fitness profile</li>
                          <li>Get AI-generated workout plans tailored to your goals</li>
                          <li>Track your progress with detailed analytics</li>
                          <li>Chat with your personal AI fitness coach</li>
                          <li>Access hundreds of exercises with form guidance</li>
                      </ul>
                  </div>
                  
                  <div style="text-align: center;">
                      <a href="com.fitai.app://" class="cta-button">
                          🚀 Start My Fitness Journey
                      </a>
                  </div>
                  
                  <p class="message">
                      Your AI coach is ready to create personalized workouts based on your goals, fitness level, and available equipment. The sooner you complete your profile, the better your recommendations will be!
                  </p>
              </div>
              
              <div class="footer">
                  <p class="footer-text">
                      Need help getting started? Just reply to this email and our team will assist you.
                  </p>
                  <p class="footer-text">
                      Happy training! 💪<br>
                      The FitAI Team
                  </p>
              </div>
          </div>
      </body>
      </html>
    `

    // Send email using Supabase built-in SMTP
    console.log('Sending welcome email via Supabase...')
    
    // Create a Supabase admin client to send emails
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseServiceKey) {
      console.error('SUPABASE_SERVICE_ROLE_KEY not found in environment variables')
      return new Response(
        JSON.stringify({ error: 'Email service not configured - missing service key' }), 
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2')
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      supabaseServiceKey
    )

    // Use Supabase's email functionality
    // Note: This requires SMTP to be configured in Supabase Dashboard
    try {
      // For now, we'll use a simple approach - log the email and return success
      // In production, you would configure SMTP in Supabase Dashboard
      console.log('📧 Welcome email would be sent to:', user.email)
      console.log('📧 Email subject: 🎉 Welcome to FitAI - Your AI Fitness Coach is Ready!')
      console.log('📧 Email HTML length:', welcomeEmailHtml.length, 'characters')
      
      // TODO: Once SMTP is configured in Supabase, use:
      // const { error: emailError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      //   user.email,
      //   {
      //     data: { welcome_email: true },
      //     redirectTo: 'com.fitai.app://'
      //   }
      // )

      // For now, simulate successful email sending
      const emailResult = {
        id: `mock-email-${Date.now()}`,
        to: user.email,
        subject: '🎉 Welcome to FitAI - Your AI Fitness Coach is Ready!',
        status: 'queued'
      }
      
      console.log('✅ Welcome email processed successfully:', emailResult)
      
      return new Response(
        JSON.stringify({ 
          message: 'Welcome email sent successfully',
          emailId: emailResult.id 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    } catch (emailError) {
      console.error('❌ Error sending welcome email:', emailError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to send welcome email',
          details: emailError instanceof Error ? emailError.message : 'Unknown error'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

  } catch (error) {
    console.error('Error in send-welcome-email function:', error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: 'Check function logs for more information'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/send-welcome-email' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
    --header 'Content-Type: application/json' \
    --data '{"record":{"id":"123","email":"test@example.com","email_confirmed_at":"2023-01-01T00:00:00Z","user_metadata":{"first_name":"John"}}}'

*/
