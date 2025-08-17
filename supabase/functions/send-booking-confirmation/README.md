# Send Booking Confirmation & Quote Notification Function

This enhanced Supabase Edge Function handles both **booking confirmations** and **quote request notifications** using Gmail SMTP, with built-in preparation for SMS integration via Twilio.

## ✨ **Features:**

- 📧 **Booking Confirmation Emails**: Professional confirmation with payment details
- 📋 **Quote Request Notifications**: Acknowledgment emails for quote requests
- 🎨 **Dual Templates**: Separate designs for bookings (orange) and quotes (blue)
- 📱 **SMS Ready**: Prepared for Twilio SMS integration
- 🖼️ **Noble Lane Branding**: Includes your logo and professional styling
- 📧 **Anti-Spam Optimized**: HTML + text versions, proper headers
- 🔄 **Backward Compatible**: Existing booking confirmations still work

## Setup Instructions

### 1. Gmail Configuration

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Select "Mail" and generate a password
   - Copy the generated 16-character password

### 2. Environment Variables

Set these environment variables in your Supabase project:

```bash
# Gmail SMTP Configuration
SMTP_HOSTNAME=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-16-char-app-password
SMTP_FROM=Noble Lane Transportation <your-email@gmail.com>
```

### 3. Deployment

Deploy the function to Supabase:

```bash
supabase functions deploy send-booking-confirmation
```

### 4. Set Environment Variables in Supabase

```bash
# Set environment variables
supabase secrets set SMTP_HOSTNAME=smtp.gmail.com
supabase secrets set SMTP_PORT=587
supabase secrets set SMTP_SECURE=false
supabase secrets set SMTP_USERNAME=your-email@gmail.com
supabase secrets set SMTP_PASSWORD=your-app-password
supabase secrets set SMTP_FROM="Noble Lane Transportation <your-email@gmail.com>"
```

## Usage

### 📧 **Booking Confirmations**

Called automatically by `process-booking-payment` webhook:

```json
{
  "type": "booking",
  "bookingId": "uuid-here",
  "confirmationNumber": "NL-ABC123",
  "customerEmail": "customer@email.com",
  "customerName": "John Doe",
  "pickupAddress": "Airport address...",
  "destinationAddress": "Hotel address...",
  "pickupDate": "August 20, 2025",
  "pickupTime": "2:00 PM",
  "passengers": 2,
  "vehicleName": "Luxury Sedan",
  "totalAmount": 150.0
}
```

### 📋 **Quote Requests**

Called by `create-quote` function:

```json
{
  "type": "quote",
  "quoteId": "uuid-here",
  "quoteNumber": "QT-XYZ789",
  "customerEmail": "customer@email.com",
  "customerName": "Jane Smith",
  "pickupAddress": "Airport address...",
  "destinationAddress": "Hotel address...",
  "pickupDate": "September 15, 2025",
  "pickupTime": "10:30 AM",
  "passengers": 4,
  "vehicleName": "Luxury SUV",
  "sendSMS": true,
  "phoneNumber": "+1234567890"
}
```

### 🔄 **Auto-Detection**

The function automatically detects the type based on the data provided:

- If `confirmationNumber` or `bookingId` exists → **Booking**
- Otherwise → **Quote**

### Manual Testing

You can test the enhanced email function:

```bash
curl -i --location --request POST 'https://your-project.supabase.co/functions/v1/send-booking-confirmation' \
  --header 'Authorization: Bearer YOUR_SUPABASE_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "bookingId": "123",
    "customerEmail": "customer@example.com",
    "customerName": "John Doe",
    "pickupAddress": "Dallas Fort Worth International Airport (DFW), 2400 Aviation Dr, DFW Airport, TX 75261, USA",
    "destinationAddress": "Downtown Dallas, 1500 Main St, Dallas, TX 75201, USA",
    "pickupDate": "August 20, 2025",
    "pickupTime": "2:00 PM",
    "passengers": 2,
    "vehicleName": "Luxury Sedan",
    "totalAmount": 150.00,
    "confirmationNumber": "NL-ABC123"
  }'
```

The email will include:

- ✅ Noble Lane logo (automatically loaded from your domain)
- ✅ Professional responsive design
- ✅ Detailed booking information
- ✅ Next steps for customer
- ✅ Contact information and social links
- ✅ Both HTML and text versions for better deliverability

## Email Template

The function generates a professional HTML email with:

- Booking confirmation details
- Trip information
- Next steps for the customer
- Company branding

## Error Handling

- Validates all required fields
- Provides detailed error messages
- Updates booking record when email is sent successfully
- Logs all activities for debugging

## Email Deliverability & Anti-Spam Measures

### ✅ **Built-in Anti-Spam Features:**

1. **Dual Format Emails**: Both HTML and plain text versions
2. **Proper Email Headers**: Including List-Unsubscribe, X-Mailer, etc.
3. **Professional Design**: Clean, corporate template with proper structure
4. **Consistent Branding**: Noble Lane logo and professional styling
5. **Transactional Nature**: Confirmation emails have high deliverability

### 🚀 **Production Deployment Recommendations:**

1. **Domain Authentication**:

   ```bash
   # Set up SPF record in your DNS:
   # TXT record: "v=spf1 include:_spf.google.com ~all"

   # Set up DKIM (Domain Keys Identified Mail):
   # Google Admin Console > Apps > Gmail > Authenticate email

   # Set up DMARC record:
   # TXT record for _dmarc.yourdomain.com: "v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com"
   ```

2. **Use Custom Domain Email**:

   ```bash
   # Instead of personal Gmail, use:
   SMTP_USERNAME=noreply@gonoblelane.com
   SMTP_FROM=Noble Lane Transportation <noreply@gonoblelane.com>
   ```

3. **Gmail Business/Workspace Setup** (Recommended):

   - Use Google Workspace for professional email
   - Better deliverability than personal Gmail accounts
   - Higher sending limits

4. **Monitor Email Reputation**:
   - Use tools like Google Postmaster Tools
   - Monitor bounce rates and spam complaints
   - Keep bounce rate < 5% and complaint rate < 0.3%

### 📊 **Expected Deliverability:**

- **Inbox Rate**: 95-98% (with proper setup)
- **Spam Rate**: 1-3% (industry standard for transactional emails)
- **Bounce Rate**: <2% (for valid email addresses)

### 🔧 **Production Environment Variables:**

```bash
# Use these for production:
SMTP_HOSTNAME=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USERNAME=noreply@gonoblelane.com  # Use custom domain
SMTP_PASSWORD=your-app-password
SMTP_FROM=Noble Lane Transportation <noreply@gonoblelane.com>
NEXT_PUBLIC_SITE_URL=https://gonoblelane.com  # For logo URL
```

### 📧 **Email Template Features:**

- **Professional Design**: Modern, responsive layout
- **Noble Lane Branding**: Logo and consistent styling
- **Mobile Responsive**: Looks great on all devices
- **Accessibility**: Proper color contrast and structure
- **Anti-Spam Optimized**: Clean code, proper headers
