# Product Import Guide

## Overview
This guide explains how to import all products from your codebase (`config/products.ts`) into the database and generate QR codes and SOPs for them.

## Features

### ✅ What the Import Service Does

1. **Reads all products** from `src/config/products.ts`
   - Men's Collection (Suits, Sherwanis, T-shirts, etc.)
   - Women's Collection (Dresses, Sarees, Lehengas, etc.)
   - Unisex Collection (Jackets, Streetwear, Casual)

2. **Imports products to database**
   - Checks if product already exists (by name + gender)
   - Inserts new products with all details (images, prices, categories)
   - Handles duplicates gracefully

3. **Generates QR codes automatically**
   - Creates unique QR code for each product
   - Links QR code to product ID

4. **Generates AI-powered SOPs**
   - Extracts category from product name
   - Uses AI to infer fabric type
   - Generates complete hygiene SOP
   - Links SOP to product

5. **Handles existing products**
   - If product exists but missing QR code → generates it
   - If product exists but missing SOP → generates it
   - Skips products that already have everything

## How to Use

### Step 1: Go to Admin Dashboard
Navigate to: `http://localhost:5173/#/admin/hygiene`

### Step 2: Click Import Button
Click the green button: **"Import All Products from Codebase (Generate QR + SOPs)"**

### Step 3: Confirm
Click "OK" when prompted. The import will:
- Process all ~49 products from config
- Generate QR codes for each
- Generate SOPs for each
- Take several minutes (has delays to avoid rate limiting)

### Step 4: View Results
After import completes, you'll see:
- ✅ Success count
- ❌ Failed count  
- ⏭️ Skipped count (products that already existed)

### Step 5: View Products
Navigate to: `http://localhost:5173/#/products/qr-gallery`

You should now see:
- All products from your codebase
- QR codes visible on each product
- Ability to view/download QR codes
- Ability to view SOPs

## Product Categories Included

### Men's Products (16 products)
- Suits (Corporate Chic Blazer, Charcoal Suit, etc.)
- Sherwanis (Sherwani Set, Classic Black Sherwani)
- Casual (Linen Beach Shirt, Striped Shirt, Premium Sweatshirt)
- T-shirts (Printed Graphic Tee, Classic Solid Tee)

### Women's Products (29 products)
- Dresses (Summer Breeze Dress, Floral Summer Dress, etc.)
- Sarees (Royal Silk Saree, Chiffon Saree, Golden Banarasi Saree)
- Lehengas (Designer Lehenga, Rose Gold Lehenga)
- Gowns (Midnight Party Gown, Emerald Silk Gown, etc.)
- Casual (Boho Maxi Skirt, Denim Jumpsuit, etc.)

### Unisex Products (6 products)
- Thrift Jackets (Vintage Thrift Jacket, Retro Denim Jacket)
- Casual Jackets (Casual Denim Jacket, Leather Jacket)
- Trench Coats (Khaki Trench Coat)

## Technical Details

### Import Process
1. Reads `PRODUCTS` array from `src/config/products.ts`
2. For each product:
   - Checks if exists in database (by name + gender)
   - If exists: Checks for QR/SOP, generates missing ones
   - If new: Inserts product → Generates SOP → Generates QR code
   - Adds 500ms delay between products (rate limiting)

### Image Handling
- Product images are stored as URLs (from config)
- Supports both external URLs (Unsplash) and local paths
- Images are displayed in the Product Gallery

### QR Code Generation
- Each QR code contains: `POPCLOZET-{productId}-{timestamp}`
- QR codes are stored as base64 data URLs
- Can be downloaded or printed

### SOP Generation
- AI extracts category from product name
- Infers fabric type based on category + gender
- Generates complete cleaning procedures
- Creates hygiene checklists
- Defines storage guidelines

## Troubleshooting

### "No products found" in Gallery
- Products haven't been imported yet
- Run the import from Admin Dashboard
- Check browser console for errors

### Some products missing QR codes
- Import may have failed for those products
- Check console logs for errors
- Re-run import (it will skip existing products and generate missing QR/SOP)

### Import takes too long
- Normal behavior (49 products × 500ms delay = ~25 seconds minimum)
- Plus AI generation time for SOPs
- Be patient, it processes in the background

### Products show but no images
- Check image URLs in config
- Local images need to be in `public/` or served correctly
- External URLs should be accessible

## Next Steps After Import

1. **Verify Products**: Check Product Gallery shows all products
2. **Test QR Scanning**: Use QR Scanner to scan codes and view SOPs
3. **Download QR Codes**: Download and print QR codes for physical products
4. **Add New Products**: Use Product Intake form for new inventory

