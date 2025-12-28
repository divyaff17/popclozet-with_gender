# QR Hygiene System - Route Reference

## ✅ Correct URLs to Access QR Hygiene Pages

Since this app uses HashRouter, routes can be accessed in two ways:

### Option 1: Direct URL (with #)
If typing directly in the browser address bar, use:

- Main Hub: `http://localhost:5173/#/qr-hygiene`
- Product Intake: `http://localhost:5173/#/product-intake`
- QR Scanner: `http://localhost:5173/#/qr-scanner`
- Admin Dashboard: `http://localhost:5173/#/admin/hygiene`
- Test Page (All-in-one): `http://localhost:5173/#/test-qr`

### Option 2: Using Navigation Links
When clicking on Link components in the app, React Router automatically handles the hash, so you can use:
- Click on links in the QRHygienePage
- They will navigate correctly automatically

## 🔍 Route Order (Fixed)
Routes have been reordered to ensure QR hygiene routes are matched before dynamic routes:

1. `/qr-hygiene` ✅
2. `/qr-scanner` ✅
3. `/product-intake` ✅
4. `/admin/hygiene` ✅
5. `/test-qr` ✅
6. Then other static routes
7. Then dynamic routes (like `/collections/:moodId`)

## 🧪 Quick Test
1. Start dev server: `npm run dev`
2. Open browser: `http://localhost:5173`
3. Navigate to: `http://localhost:5173/#/qr-hygiene`
4. You should see the QR Hygiene main page with all the cards

## 📝 Notes
- All routes use HashRouter (HashRouter in main.tsx)
- Links in the app use React Router's `Link` component which handles hashes automatically
- Direct browser navigation requires the `#` prefix
- Routes are now correctly ordered to prevent conflicts

