# Supabase-Only Email Setup (No Resend Needed)

## Option 1: Use Supabase Built-in Email + Skip Confirmation

### Step 1: Disable Email Confirmation
In Supabase Dashboard → Authentication → Settings:
- Set "Enable email confirmations" to **OFF**
- Users will be immediately active after signup

### Step 2: Send Welcome Email via Edge Function
Instead of email confirmation, send welcome immediately after signup:

```typescript
// In your signup function
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: { first_name, last_name }
  }
});

if (!error) {
  // Trigger welcome email immediately
  await supabase.functions.invoke('send-welcome-email', {
    body: { 
      record: {
        email: data.user?.email,
        user_metadata: data.user?.user_metadata
      }
    }
  });
}
```

### Step 3: Use Supabase SMTP for Welcome Emails
Configure your own email provider in Supabase:

1. Go to Supabase Dashboard → Settings → Authentication
2. Scroll to "SMTP Settings"
3. Add your email provider (Gmail, Outlook, etc.):
   ```
   Host: smtp.gmail.com
   Port: 587
   Username: your-app-email@gmail.com
   Password: your-app-password
   ```

---

## Option 2: Custom SMTP in Edge Functions (No External Service)

Update your Edge Function to use Supabase's built-in SMTP:

```typescript
// supabase/functions/send-welcome-email/index.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

Deno.serve(async (req) => {
  const { record } = await req.json()
  
  // Use Supabase's built-in email function
  const { error } = await supabase.auth.admin.generateLink({
    type: 'invite',
    email: record.email,
    options: {
      data: {
        welcome_message: 'Welcome to FitAI!',
        // Custom data for email template
      }
    }
  })
  
  // Or send custom email via your SMTP
  // (Configure SMTP in Supabase Dashboard first)
  
  return new Response(JSON.stringify({ success: !error }))
})
```

---

## Option 3: Gmail/Outlook SMTP (Free Alternative)

Instead of Resend, use free email providers:

### Gmail Setup:
1. Enable 2FA on your Gmail account
2. Generate an "App Password" for your FitAI app
3. Use these SMTP settings:
   ```
   Host: smtp.gmail.com
   Port: 587
   Username: your-fitai-app@gmail.com
   Password: your-16-digit-app-password
   ```

### Outlook Setup:
1. Create Outlook account for your app
2. Use these SMTP settings:
   ```
   Host: smtp-mail.outlook.com
   Port: 587
   Username: your-fitai-app@outlook.com
   Password: your-account-password
   ```

---

## Recommendation

**For simplicity and no external dependencies:**

1. **Disable email confirmation** in Supabase
2. **Configure Gmail/Outlook SMTP** in Supabase settings  
3. **Send welcome email immediately** after successful signup
4. **Use your existing Edge Function** but replace Resend API with Supabase SMTP

This gives you:
- ✅ No external services needed
- ✅ Custom welcome emails
- ✅ Free (using Gmail/Outlook)
- ✅ Immediate user activation
- ✅ Your existing beautiful email template

Would you like me to implement this Supabase-only approach?