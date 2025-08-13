# 📧 Welcome Email Setup Guide

This guide will help you complete the welcome email automation setup using Supabase Edge Functions and Resend.

## ✅ **What's Already Done:**

1. ✅ Supabase CLI installed and initialized
2. ✅ Edge Function created (`send-welcome-email`)
3. ✅ Professional email template designed
4. ✅ TypeScript code with proper error handling

## 🚀 **Remaining Setup Steps:**

### **Step 1: Set up Resend Email Service**

1. **Sign up for Resend** (if you haven't already):

   - Go to [https://resend.com](https://resend.com)
   - Sign up with your email
   - Verify your account

2. **Get your API Key**:

   - In Resend dashboard, go to **API Keys**
   - Click **Create API Key**
   - Give it a name like "FitAI Welcome Emails"
   - Copy the API key (starts with `re_`)
   - **Save this key securely - you'll need it later**

   re_cc36wVo5_5jn2CsyZQLK8PuXzvBEphbZ3

3. **Set up Domain (Optional but Recommended)**:
   - In Resend dashboard, go to **Domains**
   - Add your domain (e.g., `fitai.app`)
   - Follow DNS verification steps
   - If you don't have a domain, you can use `onboarding@resend.dev` for testing

### **Step 2: Link Supabase Project**

1. **Get your project credentials**:

   - Go to your Supabase Dashboard
   - Settings → Project Settings → API
   - Copy your **Project URL** and **Project ID**

   https://stxrrrcfwlnmjwtugcvv.supabase.co
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0eHJycmNmd2xubWp3dHVnY3Z2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0NzE1OTIsImV4cCI6MjA3MDA0NzU5Mn0.2FwkXlpj-r9qNHFH4sbuOZ2P-1iAk_i9xt1xbBgyyFo

2. **Login to Supabase CLI**:

   ```bash
   npx supabase login
   ```

   - This will open a browser for authentication

3. **Link your project**:
   ```bash
   npx supabase link --project-ref YOUR_PROJECT_ID
   ```
   - Replace `YOUR_PROJECT_ID` with your actual project ID

### **Step 3: Deploy the Edge Function**

1. **Deploy the function**:

   ```bash
   npx supabase functions deploy send-welcome-email
   ```

2. **Set the Resend API Key**:
   ```bash
   npx supabase secrets set RESEND_API_KEY=your_resend_api_key_here
   ```
   - Replace with your actual Resend API key

### **Step 4: Configure the Database Webhook**

1. **Go to Supabase Dashboard** → **Database** → **Webhooks**

2. **Create New Webhook** with these settings:

   - **Name**: `send-welcome-email`
   - **Table**: `auth.users`
   - **Events**: Check ✅ `INSERT` and ✅ `UPDATE`
   - **Type**: `HTTP Request`
   - **Method**: `POST`
   - **URL**: `https://YOUR_PROJECT_ID.supabase.co/functions/v1/send-welcome-email`
     - Replace `YOUR_PROJECT_ID` with your actual project ID
   - **HTTP Headers**:
     ```
     Content-Type: application/json
     Authorization: Bearer YOUR_ANON_KEY
     ```
     - Get your anon key from Supabase Dashboard → Settings → API

3. **Add Filters** (Important):

   - Click **Add Filter**
   - **Column**: `email_confirmed_at`
   - **Operator**: `IS NOT NULL`
   - This ensures emails are only sent when users confirm their email

4. **Save the Webhook**

### **Step 5: Test the Setup**

1. **Test the function directly**:

   ```bash
   curl -i --location --request POST 'https://YOUR_PROJECT_ID.supabase.co/functions/v1/send-welcome-email' \
     --header 'Authorization: Bearer YOUR_ANON_KEY' \
     --header 'Content-Type: application/json' \
     --data '{
       "record": {
         "id": "test-123",
         "email": "your-email@example.com",
         "email_confirmed_at": "2023-01-01T00:00:00Z",
         "user_metadata": {
           "first_name": "Test"
         }
       }
     }'
   ```

2. **Test the full flow**:
   - Create a new account in your app
   - Confirm the email via the link
   - Check if you receive the welcome email
   - Check function logs in Supabase Dashboard → Edge Functions → send-welcome-email → Logs

### **Step 6: Update Email Template (Optional)**

If you want to customize the welcome email:

1. **Edit the template** in `/supabase/functions/send-welcome-email/index.ts`
2. **Update the sender address** on line 231:
   - If you have a verified domain: `FitAI <welcome@yourdomain.com>`
   - For testing: `FitAI <onboarding@resend.dev>`
3. **Redeploy**:
   ```bash
   npx supabase functions deploy send-welcome-email
   ```

## 🔍 **Troubleshooting:**

### **Common Issues:**

1. **"Email service not configured"**:

   - Check that RESEND_API_KEY is set correctly
   - Run: `npx supabase secrets list` to verify

2. **"Failed to send email"**:

   - Verify your domain in Resend (if using custom domain)
   - Check Resend dashboard for bounced emails
   - Use `onboarding@resend.dev` for testing

3. **Webhook not triggering**:

   - Check webhook URL is correct
   - Verify auth headers are set
   - Check webhook filters are configured properly

4. **Function logs show errors**:
   - Go to Supabase Dashboard → Edge Functions → Logs
   - Check for detailed error messages

### **Testing Commands:**

Check function logs:

```bash
npx supabase functions logs send-welcome-email
```

View secrets:

```bash
npx supabase secrets list
```

## 🎯 **Verification Checklist:**

- [ ] Resend account created and API key obtained
- [ ] Supabase CLI linked to project
- [ ] Edge function deployed successfully
- [ ] RESEND_API_KEY secret set
- [ ] Database webhook created and configured
- [ ] Test email received successfully
- [ ] Function logs show no errors

## 📧 **Email Template Features:**

The welcome email includes:

- ✅ Professional design matching your app's dark theme
- ✅ Personalized greeting with user's first name
- ✅ Clear call-to-action button
- ✅ List of app features and benefits
- ✅ Mobile-responsive design
- ✅ Branded colors and fonts
- ✅ Deep link to open the app

## 🚀 **Next Steps After Setup:**

Once the welcome email automation is working:

1. Monitor email deliverability in Resend dashboard
2. Track email open rates and click-through rates
3. Consider A/B testing different email templates
4. Set up additional email automations (password reset, workout reminders)

## 💡 **Pro Tips:**

1. **Start with the test domain** (`onboarding@resend.dev`) to verify everything works
2. **Set up your own domain later** for better deliverability and branding
3. **Monitor the logs** during the first few test signups
4. **Keep your Resend API key secure** - don't commit it to your repository

---

**Need help?** Check the function logs in your Supabase dashboard or refer to the Resend documentation at [https://resend.com/docs](https://resend.com/docs).
