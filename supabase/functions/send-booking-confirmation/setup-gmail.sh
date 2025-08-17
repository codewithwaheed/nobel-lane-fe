#!/bin/bash

# Setup script for Gmail SMTP environment variables
# Run this script to set up all required environment variables for the send-booking-confirmation function

echo "🚀 Setting up Gmail SMTP environment variables for Supabase..."

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed. Please install it first:"
    echo "   npm install -g supabase"
    exit 1
fi

echo ""
echo "📧 Please provide your Gmail SMTP configuration:"
echo ""

# Get user input
read -p "Gmail username (your-email@gmail.com): " SMTP_USERNAME
read -p "Gmail app password (16-character password): " -s SMTP_PASSWORD
echo ""
read -p "From address (Noble Lane Transportation <your-email@gmail.com>): " SMTP_FROM

# Set default values
SMTP_HOSTNAME="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"

echo ""
echo "🔧 Setting environment variables in Supabase..."

# Set the environment variables
supabase secrets set SMTP_HOSTNAME="$SMTP_HOSTNAME"
supabase secrets set SMTP_PORT="$SMTP_PORT"
supabase secrets set SMTP_SECURE="$SMTP_SECURE"
supabase secrets set SMTP_USERNAME="$SMTP_USERNAME"
supabase secrets set SMTP_PASSWORD="$SMTP_PASSWORD"
supabase secrets set SMTP_FROM="$SMTP_FROM"

echo ""
echo "✅ Environment variables set successfully!"
echo ""
echo "📝 Configuration summary:"
echo "   SMTP_HOSTNAME: $SMTP_HOSTNAME"
echo "   SMTP_PORT: $SMTP_PORT"
echo "   SMTP_SECURE: $SMTP_SECURE"
echo "   SMTP_USERNAME: $SMTP_USERNAME"
echo "   SMTP_PASSWORD: [HIDDEN]"
echo "   SMTP_FROM: $SMTP_FROM"
echo ""
echo "🚀 Now deploy the function:"
echo "   supabase functions deploy send-booking-confirmation"
echo ""
echo "🧪 Test the function after deployment using the curl command in the README.md"
