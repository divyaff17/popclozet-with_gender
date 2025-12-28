# 🔬 QR Scanner & AI Hygiene SOP System

> **AI-Powered Inventory Hygiene Pipeline for Rental Apparel**

Automatically generates, stores, and securely exposes standardized cleaning and hygiene SOPs for each apparel item using QR-based access control.

---

## ✨ Features

### 🤖 AI-Powered SOP Generation
- **Minimal Data Entry**: Only requires category, gender, and optional fabric hint
- **Automatic Fabric Inference**: AI determines fabric type from product details
- **Comprehensive Procedures**: Generates cleaning, hygiene, storage, and inspection procedures
- **Fallback Templates**: Works even without AI API (uses rule-based templates)

### 📱 QR Code System
- **Unique QR Codes**: Each product gets a unique scannable QR code
- **Secure Access**: Admin and staff only access to internal hygiene data
- **Download & Print**: Generate printable labels for physical inventory
- **Bulk Generation**: Create QR codes for entire inventory at once

### 🔒 Role-Based Access Control
- **Admin**: Full access to all features, bulk operations, dashboard
- **Staff**: Can scan QR codes and view hygiene information
- **Customer**: No access to internal hygiene data (security first)

### 📊 Admin Dashboard
- **Real-time Stats**: Track products with SOPs, QR codes, and pending items
- **Bulk Operations**: Generate SOPs and QR codes for multiple products
- **Inventory Management**: View all products and their hygiene status

### 💾 Offline Support
- **IndexedDB Caching**: SOPs cached locally for offline access
- **Automatic Sync**: Data syncs when connection is restored
- **Progressive Web App**: Works as a PWA with offline capabilities

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
├─────────────────────────────────────────────────────────────┤
│  Pages:                                                      │
│  • /product-intake     → Add products with AI SOP           │
│  • /qr-scanner         → Scan QR codes (admin/staff)        │
│  • /admin/hygiene      → Hygiene management dashboard       │
├─────────────────────────────────────────────────────────────┤
│  Components:                                                 │
│  • QRScanner           → Camera-based QR scanning           │
│  • HygieneSopViewer    → Display SOP information            │
│  • ProductIntakeForm   → Minimal product entry form         │
│  • QRCodeDisplay       → Show/download QR codes             │
├─────────────────────────────────────────────────────────────┤
│  Services:                                                   │
│  • aiSopService        → Google Gemini AI integration       │
│  • qrCodeService       → QR code generation/validation      │
│  • hygieneSopService   → SOP management & storage           │
│  • authService         → Role-based access control          │
│  • productService      → Product data management            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Supabase)                        │
├─────────────────────────────────────────────────────────────┤
│  Tables:                                                     │
│  • hygiene_sops        → AI-generated hygiene procedures    │
│  • product_qr_codes    → QR code mappings                   │
│  • user_roles          → Role-based access control          │
│  • products            → Product inventory (enhanced)       │
├─────────────────────────────────────────────────────────────┤
│  Security:                                                   │
│  • Row Level Security (RLS) on all tables                   │
│  • Admin-only policies for sensitive operations             │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                 AI Service (Google Gemini)                   │
├─────────────────────────────────────────────────────────────┤
│  • Gemini 2.0 Flash (optimized for 2025)                    │
│  • Fabric type inference                                    │
│  • Hygiene SOP generation                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 File Structure

```
src/
├── services/
│   ├── aiSopService.ts          # AI-powered SOP generation
│   ├── qrCodeService.ts         # QR code management
│   ├── hygieneSopService.ts     # SOP storage & retrieval
│   ├── authService.ts           # Role-based access control
│   └── productService.ts        # Product management (updated)
│
├── components/
│   ├── QRScanner.tsx            # QR code scanner component
│   ├── HygieneSopViewer.tsx     # SOP display component
│   ├── ProductIntakeForm.tsx    # Product entry form
│   └── QRCodeDisplay.tsx        # QR code display/download
│
├── pages/
│   ├── QRScannerPage.tsx        # QR scanner page
│   ├── ProductIntakePage.tsx    # Product intake page
│   └── AdminHygieneDashboard.tsx # Admin dashboard
│
├── config/
│   └── aiConfig.ts              # AI service configuration
│
└── supabase/
    └── migrations/
        └── 20251224_create_hygiene_tables.sql  # Database schema
```

---

## 🚀 Quick Setup

### 1. Install Dependencies ✅
```bash
npm install @yudiel/react-qr-scanner qrcode @google/generative-ai
npm install --save-dev @types/qrcode
```

### 2. Configure Environment
Add to `.env`:
```env
VITE_GEMINI_API_KEY=your_google_gemini_api_key
```

Get API key: https://aistudio.google.com/app/apikey

### 3. Run Database Migration
Execute `src/supabase/migrations/20251224_create_hygiene_tables.sql` in Supabase SQL Editor

### 4. Create Admin User
```sql
INSERT INTO user_roles (user_id, role)
VALUES ('your-user-id', 'admin');
```

### 5. Start Using
- Add products: `/product-intake`
- Scan QR codes: `/qr-scanner`
- Manage hygiene: `/admin/hygiene`

**Full setup guide**: See `HYGIENE_SETUP.md`

---

## 📖 Usage

### Adding a New Product
1. Navigate to `/product-intake`
2. Enter minimal details (category, gender, color, pricing)
3. Optionally add fabric hint
4. Submit → AI generates SOP + QR code automatically

### Scanning QR Codes
1. Navigate to `/qr-scanner` (admin/staff only)
2. Grant camera permissions
3. Scan product QR code
4. View product details and hygiene SOP

### Managing Inventory
1. Navigate to `/admin/hygiene` (admin only)
2. View dashboard statistics
3. Bulk generate SOPs for existing products
4. Bulk generate QR codes

---

## 🎯 How It Works

### The Pipeline

```
1. Product Intake (Minimal Data)
   ↓
   Category: "blazer"
   Gender: "mens"
   Fabric Hint: "wool" (optional)
   
2. AI Fabric Inference
   ↓
   Analyzes category + gender + hint
   Infers: "Wool blend (80% wool, 20% polyester)"
   
3. AI SOP Generation
   ↓
   Generates:
   • Cleaning procedure (dry clean only, temperature, etc.)
   • Hygiene steps (pre-cleaning, sanitization, post-cleaning)
   • Storage guidelines (temperature, humidity, packaging)
   • Inspection checklist (quality checks before rental)
   
4. Database Storage
   ↓
   Stores SOP in hygiene_sops table
   Links to product via hygiene_sop_id
   
5. QR Code Generation
   ↓
   Creates unique QR code
   Stores in product_qr_codes table
   
6. QR Code Scanning (Admin/Staff)
   ↓
   Validates QR code
   Retrieves product + SOP data
   Displays hygiene information
```

---

## 🔐 Security

- **Row Level Security (RLS)**: All tables protected with RLS policies
- **Admin-Only Access**: QR scanner and dashboard require admin/staff role
- **Secure QR Codes**: QR codes contain only product IDs, not sensitive data
- **No Customer Access**: Internal hygiene data never exposed to customers

---

## 🧪 Testing

See `walkthrough.md` for detailed testing procedures:
- Product intake with AI SOP generation
- QR code scanning (admin)
- Bulk operations
- Offline functionality

---

## 📚 Documentation

- **Implementation Plan**: `implementation_plan.md`
- **Complete Walkthrough**: `walkthrough.md`
- **Quick Setup Guide**: `HYGIENE_SETUP.md`
- **Task Breakdown**: `task.md`

---

## 🎉 What's Included

✅ **5 Backend Services** - AI SOP, QR code, hygiene SOP, auth, product  
✅ **4 Frontend Components** - Scanner, viewer, intake form, QR display  
✅ **3 Pages** - QR scanner, product intake, admin dashboard  
✅ **Database Schema** - 3 new tables + enhanced products table  
✅ **Role-Based Access** - Admin, staff, customer roles  
✅ **Offline Support** - IndexedDB caching  
✅ **AI Integration** - Google Gemini 2.0 Flash  
✅ **Full Documentation** - Setup guides, walkthroughs, API docs  

---

## 🌟 Key Benefits

- ✅ **Reduces Manual Work**: No more manual SOP creation
- ✅ **Ensures Consistency**: AI generates standardized procedures
- ✅ **Scales Automatically**: Works for 10 or 10,000 products
- ✅ **Improves Hygiene**: Comprehensive cleaning procedures
- ✅ **Secure Access**: Role-based QR code scanning
- ✅ **Works Offline**: IndexedDB caching for offline access
- ✅ **Production Ready**: Fully tested and documented

---

**Built with**: React, TypeScript, Supabase, Google Gemini AI, @yudiel/react-qr-scanner

**Status**: ✅ Production Ready
