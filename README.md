<div align="center">
  <img src="public/logo.png" alt="Rydex Logo" width="100"/>
  <h1>🚕 Rydex - The Next-Gen Ride Hailing Platform</h1>
  <p>A full-stack, enterprise-grade Uber clone featuring Real-Time GPS Tracking, Razorpay Payments, Multi-Step KYC, and Google OAuth.</p>
</div>

---

## 🌟 Why Rydex is Built Differently
Rydex isn't just a UI clone. It is a highly complex, robust, full-stack application that handles real-world state transitions, background GPS tracking, secure OTP handshakes, and live financial transactions. 

Whether you are a rider looking for a cab, or a partner joining the fleet, Rydex delivers a seamless, native-like web experience.

## ✨ Core Features

### 🔐 1. Next-Gen Authentication (NextAuth.js)
- **Google OAuth Integration:** One-click secure login for users.
- **Credentials Provider:** Custom email & password authentication with `bcryptjs` hashing.
- **Role-Based Access Control:** Strict JWT-based routing for `user`, `partner`, and `admin` roles.

### 🚗 2. User App (Rider Experience)
- **Live Location Autocomplete:** Powered by OpenStreetMap (OSRM/Nominatim) for hyper-accurate pickup and drop search.
- **Dynamic Pricing Engine:** Calculates distance-based fares for different vehicle types (Auto, Bike, Cab).
- **Secure OTP Ride Start:** Generates a unique 4-digit OTP. The driver *must* enter this OTP to start the trip, ensuring the user is in the right vehicle.
- **Live GPS Tracking:** Watch your assigned driver move towards you on the map in real-time, just like Uber!
- **Payment Flexibility:** Integrated with **Razorpay** for seamless online payments, along with a traditional Cash option.
- **Ride History:** Detailed invoice and history of all past rides.

### 💼 3. Partner App (Driver Experience)
- **7-Step Rigorous Onboarding:** A highly secure multi-step partner registration flow (Vehicle Details, RC, Driving License, Aadhar).
- **🔴 Video KYC Verification:** Built-in Video KYC process where drivers must record themselves for identity verification before they are approved!
- **Real-Time Ride Radar:** Drivers instantly receive nearby ride requests and can accept them with one tap.
- **Earnings Wallet:** Live tracking of daily earnings, completed rides, and automated deduction of the **6% Admin Commission**.
- **Turn-by-Turn Navigation:** Live map showing the exact route polyline to the user's pickup and drop locations.

### 👨‍💻 4. Developer DX & Simulator
- **Live Driving Simulator:** Developing a GPS app on a stationary desktop is hard. We built a native **"Simulate Driving"** toggle in the Partner app! 
  - *How it works:* It mocks the GPS coordinates, perfectly iterating through the actual road polyline arrays to animate the car moving smoothly on the map across both User and Partner screens!

### 👑 5. Admin Portal
- Dedicated `admin@rydex.com` portal to monitor fleet growth, track total platform revenue, and approve pending Partner KYC applications.

---

## 🛠 Tech Stack Deep Dive

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | Next.js 14 (App Router), React, TailwindCSS, Framer Motion, Lucide Icons |
| **Backend** | Next.js Serverless API Routes, Node.js |
| **Database** | MongoDB, Mongoose ORM |
| **Maps & Routing** | Leaflet (React-Leaflet), OpenStreetMap, OSRM (Open Source Routing Machine) |
| **Authentication** | NextAuth.js, Google OAuth, Bcryptjs |
| **Payments** | Razorpay Gateway Integration |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Cluster (MongoDB Atlas or Local)
- Razorpay API Keys
- Google OAuth Client ID & Secret

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/yourusername/rydex.git
cd rydex
npm install
```

2. **Environment Variables:**
Create a `.env.local` file in the root directory and add the following keys:
```env
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Google OAuth
AUTH_GOOGLE_ID=your_google_client_id
AUTH_GOOGLE_SECRET=your_google_client_secret

# Razorpay Keys
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Admin Secret
ADMIN_PASSWORD=your_secure_admin_password
```

3. **Start the development server:**
```bash
npm run dev
```

4. Open `http://localhost:3000` and start booking rides! 🚕

---
*Built with ❤️ and an obsession for detail.*
