#!/bin/bash

# Script to set up Twilio SMS environment variables for Supabase Edge Functions
echo "🚀 Setting up Twilio SMS environment variables for send-booking-confirmation function..."

# Check if user is in the correct directory
if [ ! -f "supabase/config.toml" ]; then
    echo "❌ Error: Please run this script from your project root directory (where supabase/config.toml exists)"
    exit 1
fi

echo ""
echo "📋 You'll need the following Twilio credentials:"
echo "   1. Account SID (starts with 'AC...')"
echo "   2. Auth Token"
echo "   3. Twilio Phone Number (e.g., +1234567890)"
echo ""
echo "🔍 You can find these at: https://console.twilio.com/"
echo ""

# Get Twilio credentials from user
read -p "Enter your Twilio Account SID: " TWILIO_ACCOUNT_SID
read -p "Enter your Twilio Auth Token: " TWILIO_AUTH_TOKEN
read -p "Enter your Twilio Phone Number (with +country code): " TWILIO_PHONE_NUMBER

# Validate inputs
if [ -z "$TWILIO_ACCOUNT_SID" ] || [ -z "$TWILIO_AUTH_TOKEN" ] || [ -z "$TWILIO_PHONE_NUMBER" ]; then
    echo "❌ Error: All fields are required"
    exit 1
fi

if [[ ! $TWILIO_ACCOUNT_SID == AC* ]]; then
    echo "⚠️  Warning: Account SID should start with 'AC'. Please verify your input."
fi

if [[ ! $TWILIO_PHONE_NUMBER == +* ]]; then
    echo "⚠️  Warning: Phone number should start with '+' and country code (e.g., +1234567890)"
fi

echo ""
echo "🔧 Setting up environment variables..."

# Set the secrets
echo "Setting TWILIO_ACCOUNT_SID..."
npx supabase secrets set TWILIO_ACCOUNT_SID="$TWILIO_ACCOUNT_SID"

echo "Setting TWILIO_AUTH_TOKEN..."
npx supabase secrets set TWILIO_AUTH_TOKEN="$TWILIO_AUTH_TOKEN"

echo "Setting TWILIO_PHONE_NUMBER..."
npx supabase secrets set TWILIO_PHONE_NUMBER="$TWILIO_PHONE_NUMBER"

echo ""
echo "✅ Twilio environment variables have been set!"
echo ""
echo "🚀 Next steps:"
echo "   1. Deploy the updated send-booking-confirmation function:"
echo "      supabase functions deploy send-booking-confirmation"
echo ""
echo "   2. Test SMS functionality with a booking or quote creation"
echo ""
echo "📋 Environment variables set:"
echo "   TWILIO_ACCOUNT_SID: ${TWILIO_ACCOUNT_SID:0:10}..."
echo "   TWILIO_AUTH_TOKEN: [HIDDEN]"
echo "   TWILIO_PHONE_NUMBER: $TWILIO_PHONE_NUMBER"
echo ""
echo "🔒 Security Note: These credentials are stored securely in Supabase and not in your local files."
