# 📧 Supabase SMTP Setup Guide (No External Services)

## 🎯 **Overview**
This setup eliminates the need for Resend and uses Supabase's built-in email functionality with your own SMTP provider.

---

## ✅ **Step 1: Disable Email Confirmation**

1. Go to **Supabase Dashboard** → **Authentication** → **Settings**
2. Scroll to **"Email Confirmations"**
3. **Disable** "Enable email confirmations"
4. **Save** the changes

This allows users to login immediately after signup without email verification.

---

## 📧 **Step 2: Configure SMTP in Supabase**

### **Option A: Gmail SMTP (Recommended for Development)**

1. **Create a Gmail account** for your app (e.g., `fitai.noreply@gmail.com`)
2. **Enable 2-Factor Authentication** on the Gmail account
3. **Generate App Password**:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - **Save the 16-digit password**

4. **Configure in Supabase**:
   - Go to **Supabase Dashboard** → **Settings** → **Authentication**
   - Scroll to **"SMTP Settings"**
   - Fill in:
     ```
     SMTP Host: smtp.gmail.com
     SMTP Port: 587
     SMTP Username: fitai.noreply@gmail.com
     SMTP Password: [your-16-digit-app-password]
     SMTP Sender Name: FitAI
     SMTP Sender Email: fitai.noreply@gmail.com
     ```
   - **Enable SMTP**
   - **Save** settings

### **Option B: Outlook SMTP (Alternative)**

1. **Create Outlook account** for your app
2. **Configure in Supabase**:
   ```
   SMTP Host: smtp-mail.outlook.com
   SMTP Port: 587
   SMTP Username: fitai.noreply@outlook.com
   SMTP Password: [your-account-password]
   SMTP Sender Name: FitAI
   SMTP Sender Email: fitai.noreply@outlook.com
   ```

---

## 🚀 **Step 3: Update Edge Function for Production**

Once SMTP is configured, update the Edge Function to actually send emails:

```typescript
// Replace the TODO section in send-welcome-email/index.ts with:

const { error: emailError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
  user.email,
  {
    data: { 
      welcome_email: true,
      first_name: firstName 
    },
    redirectTo: 'com.fitai.app://'
  }
)

if (emailError) {
  console.error('Failed to send welcome email:', emailError)
  throw new Error(`Email sending failed: ${emailError.message}`)
}
```

---

## 🧪 **Step 4: Test the Setup**

1. **Deploy the updated Edge Function**:
   ```bash
   npx supabase functions deploy send-welcome-email
   ```

2. **Test signup in your app**:
   - New users should be able to login immediately
   - Welcome emails should be sent automatically
   - Check Supabase logs for email delivery status

---

## 🔍 **Step 5: Monitoring & Debugging**

### **Check Email Logs**:
- **Supabase Dashboard** → **Settings** → **Authentication** → **Logs**
- Look for SMTP delivery status

### **Common Issues**:

1. **"SMTP not configured"**:
   - Verify SMTP settings in Supabase Dashboard
   - Check username/password are correct
   - Ensure 2FA and App Password for Gmail

2. **"Authentication failed"**:
   - Double-check Gmail App Password (16 digits)
   - Verify Gmail account has 2FA enabled

3. **"Connection timeout"**:
   - Try port 465 with SSL for Gmail
   - Check firewall settings

---

## 📊 **Benefits of This Setup**:

✅ **No external services** (Resend, SendGrid, etc.)
✅ **Immediate user activation** (no email confirmation wait)
✅ **Free** for reasonable email volumes
✅ **Professional welcome emails** with your beautiful template
✅ **Simple to maintain** - all in Supabase dashboard

---

## 🔄 **Current Status**

- ✅ AuthContext updated to send welcome emails immediately
- ✅ Edge Function updated to use Supabase SMTP
- ✅ Email confirmation disabled
- 🚧 **Next: Configure SMTP in Supabase Dashboard**

---

**Ready to go live!** Once you configure SMTP in Supabase Dashboard, the welcome email system will be fully operational.