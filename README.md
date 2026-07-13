# Eventix

Eventix is a ticket booking and gate validation web application. It includes user role-based dashboards, mock/live payment processing via Razorpay, and a webcam-based QR code validation system for event entry gates.

## Features
- **User Roles & Auth**: Custom registration and JWT login for Attendees, Organizers, and Staff.
- **Event Discovery**: Attendees can browse published events and buy ticket packages.
- **Razorpay Payments**: Integrated with Razorpay checkout (supports developer sandbox simulation).
- **QR Code Gate Validation**: Staff can validate tickets at the door using their device webcam or a validation simulation helper.
- **Organizer Dashboard**: Organizers can create events, manage ticket tiers, and view real-time sales reports.

---

## Tech Stack

### Backend
- **Framework**: Spring Boot 3.4
- **Security**: Spring Security & JWT
- **Database**: MySQL (Hibernate ORM / JPA)
- **Payment SDK**: Razorpay Java SDK

### Frontend
- **Framework**: React (Vite)
- **Styling**: Vanilla CSS (Custom dark theme)
- **Icons**: Lucide React
- **QR Code Scanning**: `html5-qrcode`

---

## Getting Started

### Prerequisites
- Java 21
- Node.js (v18+)
- MySQL Server

---

### Backend Setup

1. Configure your database and keys in `backend/src/main/resources/application.properties` (or set them as environment variables):
   ```properties
   SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/eventix
   SPRING_DATASOURCE_USERNAME=root
   SPRING_DATASOURCE_PASSWORD=your_password
   JWT_SECRET=your_signing_key_at_least_256_bits_long
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   ```

2. Run the Spring Boot application from your IDE or via terminal:
   ```bash
   cd backend
   mvn spring-boot:run
   ```
   *(Note: The database tables will be created automatically, and default test accounts will be seeded on first boot).*

---

### Frontend Setup

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Start the Vite development server:
   ```bash
   npm run dev
   ```

3. Open your browser to `http://localhost:5173`.

---

## Seeding & Test Credentials
When the backend boots up with an empty database, it automatically creates three test accounts for local debugging (all passwords are `password`):
- **Attendee**: `attendee`
- **Organizer**: `organizer`
- **Staff**: `staff`
