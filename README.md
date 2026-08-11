# Rydex - Smart Vehicle Booking App 🚕

Rydex is a full-stack, real-time vehicle booking application built with Next.js 14, MongoDB, and TailwindCSS. It provides a seamless ride-hailing experience with live GPS tracking, real-time status updates, and integrated payment gateways.

## 🌟 Key Features

### 👤 User App (Rider)
- **Live Location Search**: Autocomplete location search powered by OpenStreetMap (OSRM/Nominatim).
- **Vehicle Selection**: Choose between Auto, Bike, or Cab with dynamic fare calculations based on distance.
- **Secure Payments**: Razorpay integration for online payments alongside traditional cash options.
- **Live Tracking**: Real-time map tracking of the driver's vehicle as it moves towards the pickup and drop-off locations.
- **Secure OTP Verification**: 4-digit OTP generation to ensure you enter the correct vehicle.
- **Ride History**: View past rides, invoices, and payment statuses.

### 🚗 Partner App (Driver)
- **Comprehensive Onboarding (7-Steps)**: A highly secure partner registration flow including document uploads and background checks.
- **Video KYC Verification**: Built-in Video KYC process to verify driver identity before they can accept rides, ensuring maximum security.
- **Driver Dashboard**: View available ride requests nearby and accept them with one tap.
- **Turn-by-Turn Navigation**: Live map showing the exact route to the user's pickup and drop locations.
- **Live Simulator**: Built-in developer simulator to test driving movement on the map without needing physical GPS spoofing.
- **Earnings Wallet**: Track daily earnings, admin commissions, and completed rides.
- **OTP Verification Flow**: Mandatory OTP entry before starting a ride to ensure security.

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TailwindCSS, Lucide Icons
- **Backend**: Next.js API Routes
- **Database**: MongoDB (Mongoose ORM)
- **Maps & Routing**: Leaflet (React-Leaflet), OpenStreetMap, OSRM (Open Source Routing Machine)
- **Payments**: Razorpay Gateway
- **Authentication**: NextAuth.js (Session-based)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Cluster (MongoDB Atlas or Local)
- Razorpay API Keys

### Installation

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Create a `.env.local` file in the root directory and add the following variables:
```env
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Razorpay Keys
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

3. Start the development server:
```bash
npm run dev
```

4. Open `http://localhost:3000` in your browser.

## 🗺 Map Configuration (Leaflet)
This project uses **CartoDB Voyager** map tiles for a clean, premium look. The maps are dynamically loaded on the client side using Next.js `dynamic` imports to prevent SSR window errors.

## 🧪 Developer Testing (Simulator)
When testing the Partner app on a Desktop computer, the physical GPS location does not change. We've included a **Simulate Driving** button on the Partner Tracking screen. 
- Click **"Mock GPS for Testing"** if your location is blocked to teleport to the pickup point.
- Click **"Simulate Driving"** to automatically animate the vehicle along the black route polyline towards the destination!

---
Built with ❤️ using Next.js and Tailwind CSS.
