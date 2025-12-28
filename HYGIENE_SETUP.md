# QR Scanner & AI Hygiene SOP System - Quick Setup Guide

## 🚀 Quick Start (5 Minutes)

### Step 1: Install Dependencies ✅
Already installed:
- `@yudiel/react-qr-scanner` - QR code scanning
- `qrcode` - QR code generation
- `@google/generative-ai` - AI SOP generation

### Step 2: Configure Environment Variables

1. Get your Google Gemini API key from: https://aistudio.google.com/app/apikey

2. Add to your `.env` file:
```env
VITE_GEMINI_API_KEY=your_api_key_here
```

### Step 3: Run Database Migration

1. Open your Supabase project: https://supabase.com/dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of:
   `src/supabase/migrations/20251224_create_hygiene_tables.sql`
4. Click "Run" to execute the migration

This creates:
- `hygiene_sops` table
- `product_qr_codes` table
- `user_roles` table
- Adds hygiene columns to `products` table

### Step 4: Create Your First Admin User

1. Sign up/login to your app
2. Open browser console (F12)
3. Run this code (replace with your email):

```javascript
import { authService } from './src/services/authService';
await authService.createAdminUser('your-email@example.com');
```

Or use Supabase SQL Editor:
```sql
INSERT INTO user_roles (user_id, role)
VALUES ('your-user-id-from-auth-users-table', 'admin');
```

### Step 5: Test the System

#### Test 1: Add a Product with AI SOP
1. Navigate to: `http://localhost:5173/product-intake`
2. Fill in the form:
   - Name: "Classic Navy Blazer"
   - Category: "blazer"
   - Gender: "mens"
   - Event: "formal"
   - Color: "Navy Blue"
   - Price: 200
   - Rental Price: 50
3. Click "Create Product & Generate SOP"
4. ✅ AI will generate hygiene SOP automatically
5. ✅ QR code will be created

#### Test 2: Scan QR Code
1. Navigate to: `http://localhost:5173/qr-scanner`
2. Grant camera permissions
3. Scan the QR code from Test 1
4. ✅ View product details and hygiene SOP

#### Test 3: Admin Dashboard
1. Navigate to: `http://localhost:5173/admin/hygiene`
2. View stats and product inventory
3. Try bulk SOP generation

---

## 📱 Available Routes

| Route | Description | Access |
|-------|-------------|--------|
| `/product-intake` | Add new products with AI SOP generation | Admin/Staff |
| `/qr-scanner` | Scan QR codes to view hygiene info | Admin/Staff |
| `/admin/hygiene` | Hygiene management dashboard | Admin only |

---

## 🎯 Key Features

### Automatic AI SOP Generation
- Enter minimal product data (category, gender)
- AI infers fabric type
- Generates complete hygiene procedures
- Creates cleaning instructions
- Provides storage guidelines

### QR Code System
- Unique QR code per product
- Secure admin-only access
- Download and print labels
- Offline support

### Role-Based Access
- Admin: Full access to all features
- Staff: Can scan QR codes
- Customer: No access to internal hygiene data

---

## 🔧 Troubleshooting

### Issue: AI SOP generation fails
**Solution**: Check that `VITE_GEMINI_API_KEY` is set correctly in `.env`

### Issue: QR scanner shows "Access Denied"
**Solution**: Make sure you've created an admin user (Step 4)

### Issue: Camera not working
**Solution**: Grant camera permissions in browser settings

### Issue: Database errors
**Solution**: Ensure migration was run successfully in Supabase

---

## 📚 Documentation

- **Implementation Plan**: `implementation_plan.md`
- **Complete Walkthrough**: `walkthrough.md`
- **Task Breakdown**: `task.md`

---

## 🎉 You're Ready!

The QR Scanner & AI Hygiene SOP System is fully integrated and ready to use. Start adding products and scanning QR codes!

For questions or issues, refer to the walkthrough documentation.
