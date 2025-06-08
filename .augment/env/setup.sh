#!/bin/bash

# Setup script for Next.js 15 application with TypeScript
echo "🚀 Setting up Next.js 15 application environment..."

# Update package lists
sudo apt-get update

# Install Node.js 20 (LTS) if not already installed
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js 20 LTS..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo "✅ Node.js is already installed: $(node --version)"
fi

# Verify npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not available"
    exit 1
else
    echo "✅ npm is available: $(npm --version)"
fi

# Navigate to workspace directory
cd /mnt/persist/workspace

# Generate a valid RSA private key for mock Firebase configuration
echo "🔧 Generating mock RSA private key for Firebase..."
openssl genrsa -out mock_private_key.pem 2048 2>/dev/null

# Read the generated private key
MOCK_PRIVATE_KEY=$(cat mock_private_key.pem)

# Clean up the temporary file
rm mock_private_key.pem

# Create .env.local with mock environment variables for build
echo "🔧 Creating .env.local with mock environment variables for build..."
cat > .env.local << EOF
# Mock Firebase environment variables for build
FIREBASE_PROJECT_ID=mock-project-id
FIREBASE_PRIVATE_KEY_ID=mock-private-key-id
FIREBASE_PRIVATE_KEY="$MOCK_PRIVATE_KEY"
FIREBASE_CLIENT_EMAIL=mock@mock-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=123456789012345678901
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/mock%40mock-project.iam.gserviceaccount.com

# Mock Clerk environment variables
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_mock_key_for_build
CLERK_SECRET_KEY=sk_test_mock_key_for_build
CLERK_WEBHOOK_SECRET=whsec_mock_webhook_secret_for_build

# Mock Valorant API environment variables
VALORANT_API_KEY=mock_api_key_for_build
VALORANT_API_BASE_URL=https://api.henrikdev.xyz/valorant/v3

# Mock Next.js environment variables
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=mock_secret_for_build_only
EOF

# Install dependencies
echo "📦 Installing npm dependencies..."
npm install

# Verify TypeScript compilation
echo "🔍 Checking TypeScript compilation..."
npx tsc --noEmit

# Run ESLint to check code quality
echo "🔍 Running ESLint..."
npm run lint

echo "✅ Setup completed successfully!"