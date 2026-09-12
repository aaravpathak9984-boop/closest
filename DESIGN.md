# 🎨 MediClinic Care (`closest`) — Complete Design System & Schema Specification

> **Project**: MediClinic Care (`closest`)  
> **Database**: MongoDB Atlas Cloud (`closest`)  
> **Repository**: [https://github.com/aaravpathak9984-boop/closest.git](https://github.com/aaravpathak9984-boop/closest.git)  

---

## 1. 📌 Executive Overview & Design Philosophy

**MediClinic Care** follows a curated, hybrid design language combining **macOS Minimalist Glassmorphism**, **Editorial Paper Craft Aesthetics**, and **High-Contrast Clinical Precision**.

### Core Visual Principles
1. **High-Contrast Editorial Typography**: Pairs classic serif display titles (`Fraunces`) with clean sans-serif body text (`Inter`) and technical monospace metadata tags (`IBM Plex Mono`).
2. **Layered Tactile Surfaces**: Combines soft off-white canvas backgrounds (`#F5F3EF`), crisp paper cards (`#FFFFFF`), and translucent glass backdrop blurs (`rgba(255, 255, 255, 0.82)` with `12px` blur).
3. **Purposeful Color System**: Avoids generic primary colors in favor of rich deep crimson accents (`#8F2D2D`), dark zinc inks (`#18181B`), and muted paper borders (`#DED8CD`).
4. **Live Status Visual Cues**: Uses explicit status badges, macOS traffic light window headers, and real-time waiting list queue tokens (`🎟️ Token #1 - 🚨 Next Patient`).

---

## 2. 🎨 Color Palette & Design Tokens

### 2.1 CSS Variables (`main.css`)

```css
:root {
  /* Surface & Canvas Tokens */
  --bg-canvas: #F5F3EF;          /* Warm paper canvas background */
  --bg-white: #FFFFFF;           /* Crisp card background */
  --bg-paper: #EDE8DF;           /* Editorial paper tint for headers & tables */
  --bg-glass: rgba(255, 255, 255, 0.85); /* Translucent glass backdrop */

  /* Text & Ink Tokens */
  --color-ink: #18181B;          /* Primary dark zinc text */
  --color-soft-ink: #3F3F46;     /* Secondary readable body text */
  --color-muted: #71717A;        /* Muted labels & captions */

  /* Brand Accent Tokens */
  --color-red-accent: #8F2D2D;   /* Primary brand crimson accent */
  --color-red-dark: #681F22;     /* Hover state for primary actions */
  --color-red-light: rgba(143, 45, 45, 0.08); /* Soft crimson tint */

  /* Border & Divider Tokens */
  --color-border: #DED8CD;        /* Paper card outline */
  --color-border-subtle: rgba(216, 208, 194, 0.5); /* Subtle table row separator */

  /* Glassmorphism & Shadow Tokens */
  --glass-bg: rgba(255, 255, 255, 0.82);
  --glass-border: 1px solid rgba(216, 208, 194, 0.7);
  --glass-shadow: 0 10px 30px -5px rgba(24, 24, 27, 0.06), 0 4px 12px -2px rgba(24, 24, 27, 0.03);
  --glass-blur: blur(12px);

  /* Spacing & Border Radii */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-pill: 9999px;
  --container-max: 1160px;
}
```

### 2.2 Semantic & Status Colors

| Role | Color Code | Background Tint | Use Case |
| :--- | :--- | :--- | :--- |
| **Primary Brand Accent** | `#8F2D2D` (Crimson) | `rgba(143, 45, 45, 0.08)` | Primary buttons, active tabs, doctor specializations |
| **Primary Text / Dark Ink** | `#18181B` (Zinc 900) | N/A | Headings, primary button backgrounds, high-contrast labels |
| **Success / Accepted / Verified** | `#1B5E34` (Forest Green) | `rgba(34, 117, 68, 0.08)` | Confirmed appointments, eKYC verified badge, Next Patient alert |
| **Warning / Pending / Waiting** | `#8C550A` / `#D9822B` (Amber) | `rgba(184, 118, 20, 0.08)` | Pending appointments, queue tokens, eKYC under review |
| **Danger / Rejected / Delete** | `#8F2D2D` (Deep Red) | `#FDF4F4` | Account deletion, rejected applications, error alerts |
| **Info / Slot Assigned** | `#1A3258` (Slate Blue) | `#F4F6FB` | General notifications, assigned video call slots |

---

## 3. ✒️ Typography System

The application utilizes a 3-tier font hierarchy loaded via Google Fonts:

```html
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,400&family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

### Typography Hierarchy & Rules

| Category | Font Family | Variable Name | Weight & Sizes | Application |
| :--- | :--- | :--- | :--- | :--- |
| **Display Headings** | `'Fraunces', Georgia, serif` | `--font-serif` | 600 / 700<br>`h1`: 2.6rem<br>`h2`: 1.8rem<br>`h3`: 1.3rem | Main page titles, metric numbers, hero headers |
| **Body & UI Controls** | `'Inter', -apple-system, sans-serif` | `--font-sans` | 400 (Body)<br>500 (Medium)<br>600 (Semibold) | Paragraphs, buttons, form inputs, navigation links |
| **Technical Labels** | `'IBM Plex Mono', monospace` | `--font-mono` | 500 / 600<br>0.68rem – 0.85rem | Queue tokens, timestamps, time slots (`09:30`), badges |

---

## 4. 🧩 UI Components & Layout Specifications

### 4.1 Buttons (`components.css`)
- **Primary Button (`.btn-primary`)**: Solid dark zinc (`#18181B`) with white text and smooth 0.15s hover elevation (`translateY(-1px)`).
- **Accent Button (`.btn-accent`)**: Crimson background (`#8F2D2D`) for key actions like *"Book Appointment"* or *"Call Next Patient"*.
- **Secondary Button (`.btn-secondary`)**: Off-white paper background (`#EDE8DF`) with dark text and paper border (`#DED8CD`).
- **Outline Button (`.btn-outline`)**: White surface with a 1px paper border that darkens on hover.

### 4.2 Cards & Surfaces
- **Glass Card (`.glass-card`)**: Uses `backdrop-filter: blur(12px)` over `rgba(255, 255, 255, 0.82)` with soft layered shadows. Includes optional macOS top traffic light dots (`🔴 🟡 🟢`).
- **Paper Card (`.paper-card`)**: Solid white background (`#FFFFFF`) with 1px border (`#DED8CD`) and 16px corner radius.

### 4.3 Form Controls & Interactive Elements (`forms.css`)
- **Form Controls (`.form-control`)**: Clean input fields with 3px subtle focus ring (`rgba(24, 24, 27, 0.08)`). Invalid fields highlight in crimson (`#8F2D2D`) with `.is-invalid`.
- **Password Input Wrapper (`.password-input-wrapper`)**: Contains an absolute-positioned visibility toggle button (`👁️` / `🙈`) that toggles password visibility safely.
- **Password Strength Meter (`.strength-meter-bar`)**: Dynamic visual meter indicating `Weak` (25% red), `Fair` (50% orange), `Good` (75% green), and `Strong` (100% forest green).
- **Slot Selection Pills (`.slot-pill`)**: Monospace time slot pills that highlight dark zinc when selected.

---

## 5. 🗄️ Database Schema & Data Models Design

The database operates on a streamlined, high-performance **6-collection architecture** in MongoDB Atlas Cloud (`closest`).

```
                    ┌─────────────────────────┐
                    │      User (users)       │
                    │  name, email, password  │
                    │  role: patient|doctor|  │
                    │         admin           │
                    └────────────┬────────────┘
                                 │ 1:1
           ┌─────────────────────┼─────────────────────┐
           ▼                     ▼                     ▼
┌────────────────────┐ ┌────────────────────┐ ┌────────────────────┐
│  Patient (patients)│ │   Doctor (doctors) │ │   Admin (admins)   │
│  phone, address,   │ │ license, govt ID,  │ │ master permissions │
│  bloodGroup, DOB   │ │ ekycStatus, fee,   │ └────────────────────┘
└──────────┬─────────┘ │ workingHours, bio  │
           │           └─────────┬──────────┘
           │ 1:N                 │ 1:N
           ▼                     ▼
┌───────────────────────────────────────────────────┐
│              Appointment (bookings)               │
│  patient (FK), doctor (FK), date, timeSlot,      │
│  status: pending|accepted|rejected|completed      │
└───────────────────────────────────────────────────┘
                         │ 1:N
                         ▼
┌───────────────────────────────────────────────────┐
│                 Review (reviews)                  │
│  doctor (FK), patient (FK), rating (1-5), comment │
└───────────────────────────────────────────────────┘
```

### 5.1 Collection Specs

#### 1. `users` Collection (`src/models/User.js`)
Stores authentication credentials and role definitions.
```javascript
{
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true }, // Bcrypt hashed (cost factor 10)
  role: { type: String, enum: ['patient', 'doctor', 'admin'], default: 'patient' }
}
```

#### 2. `doctors` Collection (`src/models/Doctor.js`)
Stores practitioner qualifications, practice hours, ratings, and eKYC verification status.
```javascript
{
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  specialization: { type: String, required: true, index: true },
  qualification: { type: String, default: '' },
  licenseNumber: { type: String, default: '' },
  govtIdType: { type: String, default: 'Medical Council Registration Certificate' },
  govtIdNumber: { type: String, default: '' },
  experienceYears: { type: Number, default: 0 },
  consultationFee: { type: Number, default: 0 },
  bio: { type: String, default: '' },
  workingHours: {
    start: { type: String, default: '09:00' },
    end: { type: String, default: '17:00' },
    slotDurationMinutes: { type: Number, default: 30 }
  },
  ekycStatus: { 
    type: String, 
    enum: ['not_applied', 'applied', 'slot_assigned', 'verified', 'rejected'], 
    default: 'not_applied' 
  },
  ekycSlot: {
    requestedDate: String,
    requestedTime: String,
    assignedSlot: String,
    adminNotes: String
  },
  isVerified: { type: Boolean, default: false },
  verificationStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  averageRating: { type: Number, default: 0, min: 0, max: 5.0 },
  reviewCount: { type: Number, default: 0 }
}
```

#### 3. `bookings` Collection (`src/models/Appointment.js`)
Stores patient consultation bookings mapped to physical MongoDB collection `'bookings'`. Includes double-booking lock compound index.
```javascript
{
  patient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
  date: { type: String, required: true, index: true }, // YYYY-MM-DD
  timeSlot: { type: String, required: true },          // HH:MM
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'], default: 'pending' },
  patientName: String,
  patientPhone: String,
  symptoms: String,
  reason: { type: String, default: 'General Consultation' }
}

// Compound Index for Atomic Double-Booking Collision Prevention:
appointmentSchema.index({ doctor: 1, date: 1, timeSlot: 1 });
```

#### 4. `reviews` Collection (`src/models/Review.js`)
Stores patient feedback ratings and reviews.
```javascript
{
  doctor: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
  patient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  patientName: String,
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  isVerifiedPatient: { type: Boolean, default: true }
}
```

#### 5. `patients` Collection (`src/models/Patient.js`)
Stores patient medical profiles.

#### 6. `admins` Collection (`src/models/Admin.js`)
Stores administrator access details.

---

## 6. 🔄 Key Interaction Flows

### 6.1 Doctor eKYC Verification & Video Slot Flow
1. **Registration**: Doctor signs up at `/signup`. Profile created with `ekycStatus: 'not_applied'` (no fake auto-filled values).
2. **Application Submission (`/doctors/ekyc`)**: Doctor enters Medical License Number, Govt ID, Degree, and requests preferred video call date/time slot. Status becomes `applied`.
3. **Admin Slot Assignment (`/admin/dashboard`)**: Master Admin assigns video verification slot (`POST /admin/doctors/:id/assign-slot`). Status becomes `slot_assigned`.
4. **Completion & Activation**: Admin completes eKYC (`POST /admin/doctors/:id/complete-ekyc`). Doctor status becomes `verified` & `approved` and appears in public searches.

### 6.2 Patient Booking & Live Waiting Queue
1. **Atomic Collision Check**: Checks for duplicate doctor + date + timeSlot. If taken, auto-recommends next available slot.
2. **Queue Token Generation**: Computes live waiting list token (`🎟️ Token #1`, `🎟️ Token #2 (~15m wait)`).
3. **Doctor Workspace Queue (`/appointments/doctor-queue`)**: Displays green **Next Patient Alert Banner (`Token #1`)** with 1-click `"Complete Consultation & Call Next"` button.

### 6.3 Permanent Account & Data Deletion
- **1-Click Self-Service Purge (`POST /profile/delete-account`)**: Deletes user, doctor/patient profiles, bookings, and reviews permanently from MongoDB Atlas.
