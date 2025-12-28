# QR Scanner Testing Guide

## Overview
This guide helps you test the complete QR Scanner & Hygiene SOP system with the automated pipeline.

## ✅ What's Already Set Up

1. **QR Scanner Integration**: Using `@yudiel/react-qr-scanner` (v2.5.0) - optimized for 2025
2. **Automatic Pipeline**: QR codes are automatically generated when new products are created
3. **AI SOP Generation**: Hygiene SOPs are automatically generated using AI when products are added
4. **Secure Access**: QR codes only reveal internal information to admin/staff users

## 🧪 Testing the Complete Flow

### Step 1: Add a New Product
1. Navigate to: `http://localhost:5173/product-intake` or click "Product Intake" from the main menu
2. Fill in the minimal product details:
   - Product Name (e.g., "Classic Navy Blazer")
   - Category (e.g., "blazer", "kurta", "dress")
   - Gender (mens/womens/unisex)
   - Event Category (casual/party/formal/etc.)
   - Color
   - Prices
   - Optional: Fabric Hint
3. Click "Create Product & Generate SOP"
4. **What happens automatically:**
   - ✅ Product is created in database
   - ✅ AI generates hygiene SOP (fabric inference, cleaning procedures, etc.)
   - ✅ QR code is automatically generated and linked to the product
   - ✅ QR code is displayed for download/printing

### Step 2: View Generated QR Code
After creating a product, you'll see:
- QR code image (can be downloaded or printed)
- Hygiene SOP details (fabric type, cleaning procedures, etc.)

### Step 3: Scan the QR Code
1. Navigate to: `http://localhost:5173/qr-scanner` or click "QR Scanner" from the menu
2. Click "Start Scanning"
3. Grant camera permissions when prompted
4. Point camera at the QR code (either from screen or printed)
5. The scanner will:
   - Detect the QR code
   - Validate it against the database
   - Fetch product details
   - Display hygiene SOP information

### Step 4: Verify Automatic Application
To verify that QR codes are automatically generated for all new inventory:

1. Add multiple products via the Product Intake form
2. Check that each product automatically gets:
   - A hygiene SOP
   - A QR code
   - All without manual intervention

## 🔍 Testing Checklist

- [ ] Create a new product via Product Intake form
- [ ] Verify QR code is automatically generated
- [ ] Download the QR code image
- [ ] Open QR Scanner page
- [ ] Scan the QR code successfully
- [ ] Verify hygiene SOP information is displayed
- [ ] Test with multiple products
- [ ] Verify admin/staff access control works

## 🎯 Key Features Being Tested

1. **Automatic QR Generation**: QR codes are created automatically when products are added
2. **AI SOP Generation**: Hygiene procedures are generated automatically using AI
3. **QR Scanner**: Uses @yudiel/react-qr-scanner (2025-optimized)
4. **Secure Access**: Only admin/staff can access hygiene information via QR scan
5. **Pipeline Automation**: No manual steps required after product creation

## 📱 Scanner Capabilities

The QR scanner supports multiple formats:
- QR Codes
- Code 128, Code 39, Code 93
- EAN-13, EAN-8
- UPC-A, UPC-E
- ITF, Codabar
- Data Matrix, Aztec, PDF417

## 🔧 Technical Details

- **QR Scanner Package**: `@yudiel/react-qr-scanner@^2.5.0`
- **QR Code Generation**: `qrcode@^1.5.4`
- **Automatic Trigger**: Happens in `hygieneSopService.generateAndStoreSOP()`
- **Database Tables**: `product_qr_codes`, `hygiene_sops`, `products`

## 🐛 Troubleshooting

**Camera not working:**
- Check browser permissions
- Try a different browser (Chrome/Edge recommended)
- Ensure HTTPS or localhost (camera requires secure context)

**QR code not scanning:**
- Ensure good lighting
- Hold steady
- Make sure QR code is clear and not damaged
- Check that QR code is from the same system

**QR code not found:**
- Verify product was created successfully
- Check browser console for errors
- Ensure database connection is working

## 🚀 Next Steps

After testing, you can:
1. Print QR codes and attach them to physical products
2. Use the scanner in day-to-day operations
3. Manage QR codes via Admin Dashboard
4. Bulk generate QR codes for existing products

## 📝 Notes

- Testing mode is enabled (authentication bypassed)
- All features are accessible for testing
- QR codes are unique per product
- SOPs are versioned and can be updated

