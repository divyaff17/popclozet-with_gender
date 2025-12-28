import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import PageTransition from "./components/PageTransition";
import ScrollProgress from "./components/ScrollProgress";
import Index from "./pages/Index";
import { lazy, useEffect, useState, Suspense } from "react";
const CartPage = lazy(() => import("./pages/CartPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const HowItWorksPage = lazy(() => import("./pages/HowItWorksPage"));
const ChromaticClosetPage = lazy(() => import("./pages/ChromaticClosetPage"));
const MoodPage = lazy(() => import("./pages/MoodPage"));
const CollectionsPage = lazy(() => import("./pages/CollectionsPage"));
const GenderCategoryPage = lazy(() => import("./pages/GenderCategoryPage"));
// Direct imports for QR hygiene pages to avoid lazy loading issues
import QRHygienePage from "./pages/QRHygienePage";
import QRScannerPage from "./pages/QRScannerPage";
import ProductIntakePage from "./pages/ProductIntakePage";
import AdminHygieneDashboard from "./pages/AdminHygieneDashboard";
import QRHygieneTestPage from "./pages/QRHygieneTestPage";
import ProductQRGalleryPage from "./pages/ProductQRGalleryPage";
import QRAnalyticsPage from "./pages/QRAnalyticsPage";
import QRManagementPage from "./pages/QRManagementPage";
import VirtualTryOnPage from "./pages/VirtualTryOnPage";
import MobileProductDetailPage from "./pages/MobileProductDetailPage";
import NotFound from "./pages/NotFound";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { FlyToCartProvider } from "./context/FlyToCartContext";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { StyleAssistant } from "./components/StyleAssistant";
import { OfflineIndicator } from "./components/OfflineIndicator";
import { InstallPrompt } from "./components/InstallPrompt";
import { useOfflineSync } from "./hooks/useOfflineSync";
import { initializeIndexedDBCache } from "./utils/syncIndexedDB";

const queryClient = new QueryClient();

function App() {
  const [showWelcome, setShowWelcome] = useState(false);
  const location = useLocation();

  // Enable offline sync functionality
  useOfflineSync();

  useEffect(() => {
    if (!showWelcome && typeof window !== "undefined") {
      sessionStorage.setItem("welcomeSeen", "true");
    }
  }, [showWelcome]);

  // Initialize IndexedDB cache with Supabase data
  useEffect(() => {
    initializeIndexedDBCache().catch(error => {
      console.error('Failed to initialize IndexedDB:', error);
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <WishlistProvider>
          <FlyToCartProvider>
            <TooltipProvider>
              <ScrollProgress />
              <Toaster />
              <Sonner />
              {showWelcome && (
                <WelcomeScreen onComplete={() => setShowWelcome(false)} />
              )}
              <StyleAssistant />
              <OfflineIndicator />
              <InstallPrompt />

              <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                  <Route path="/" element={
                    <PageTransition>
                      <Index />
                    </PageTransition>
                  } />
                  {/* QR Hygiene Routes - Place before dynamic routes to ensure they match correctly */}
                  <Route path="/qr-hygiene" element={
                    <PageTransition>
                      <QRHygienePage />
                    </PageTransition>
                  } />
                  <Route path="/qr-scanner" element={
                    <PageTransition>
                      <QRScannerPage />
                    </PageTransition>
                  } />
                  <Route path="/product-intake" element={
                    <PageTransition>
                      <ProductIntakePage />
                    </PageTransition>
                  } />
                  <Route path="/admin/hygiene" element={
                    <PageTransition>
                      <AdminHygieneDashboard />
                    </PageTransition>
                  } />
                  <Route path="/products/qr-gallery" element={
                    <PageTransition>
                      <ProductQRGalleryPage />
                    </PageTransition>
                  } />
                  <Route path="/test-qr" element={
                    <QRHygieneTestPage />
                  } />
                  <Route path="/admin/qr-analytics" element={
                    <PageTransition>
                      <QRAnalyticsPage />
                    </PageTransition>
                  } />
                  <Route path="/admin/qr-management" element={
                    <PageTransition>
                      <QRManagementPage />
                    </PageTransition>
                  } />
                  <Route path="/product/:productId" element={
                    <PageTransition>
                      <MobileProductDetailPage />
                    </PageTransition>
                  } />
                  {/* Other static routes */}
                  <Route path="/chromatic" element={
                    <PageTransition>
                      <ChromaticClosetPage />
                    </PageTransition>
                  } />
                  <Route path="/cart" element={
                    <PageTransition>
                      <CartPage />
                    </PageTransition>
                  } />
                  <Route path="/profile" element={
                    <PageTransition>
                      <ProfilePage />
                    </PageTransition>
                  } />
                  <Route path="/how-it-works" element={
                    <PageTransition>
                      <HowItWorksPage />
                    </PageTransition>
                  } />
                  <Route path="/virtual-tryon" element={
                    <PageTransition>
                      <VirtualTryOnPage />
                    </PageTransition>
                  } />
                  {/* Dynamic routes - should come after specific routes */}
                  <Route path="/collections" element={
                    <PageTransition>
                      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
                        <CollectionsPage />
                      </Suspense>
                    </PageTransition>
                  } />
                  <Route path="/mood/:moodId" element={
                    <PageTransition>
                      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
                        <MoodPage />
                      </Suspense>
                    </PageTransition>
                  } />
                  <Route path="/collections/:moodId" element={
                    <PageTransition>
                      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
                        <CollectionsPage />
                      </Suspense>
                    </PageTransition>
                  } />
                  <Route path="/shop/:gender" element={
                    <PageTransition>
                      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
                        <GenderCategoryPage />
                      </Suspense>
                    </PageTransition>
                  } />
                  <Route path="/shop/:gender/:event" element={
                    <PageTransition>
                      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
                        <CollectionsPage />
                      </Suspense>
                    </PageTransition>
                  } />
                  {/* 404 - must be last */}
                  <Route path="*" element={
                    <PageTransition>
                      <NotFound />
                    </PageTransition>
                  } />
                </Routes>
              </AnimatePresence>

            </TooltipProvider>
          </FlyToCartProvider>
        </WishlistProvider>
      </CartProvider>
    </QueryClientProvider>
  );
}

export default App;
