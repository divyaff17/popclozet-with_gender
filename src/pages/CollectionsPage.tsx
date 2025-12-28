// src/pages/CollectionsPage.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import AnnouncementTicker from "@/components/AnnouncementTicker";
import { Heart, ChevronRight, Sparkles, Shirt, PartyPopper, Wine, Briefcase, Footprints, Palmtree } from "lucide-react";
import { fadeInUp, staggerContainer, staggerItem } from "@/utils/animations";
import SignupModal from "@/components/SignupModal";

interface Product {
  id: string;
  title: string;
  image: string;
  occasion: string;
  price: string;
  rentalPrice: string;
}

interface MoodData {
  title: string;
  icon: React.ReactNode;
  products: Product[];
}

// Product data for each mood - using uploaded images
const MOOD_PRODUCTS: Record<string, MoodData> = {
  casual: {
    title: "Casual",
    icon: <Shirt className="w-5 h-5" />,
    products: [
      { id: "c1", title: "Premium Sweatshirt", image: "/src/images/Mens Products/Mens Products/New - Sweatshirt HC/IMG_3934.JPG", occasion: "Everyday comfort", price: "₹3,999", rentalPrice: "₹599" },
      { id: "c2", title: "Casual Sweatshirt", image: "/src/images/Mens Products/Mens Products/New - Sweatshirt HC/IMG_3935.JPG", occasion: "Weekend ready", price: "₹3,499", rentalPrice: "₹499" },
      { id: "c3", title: "Cozy Grey Sweatshirt", image: "/src/images/Mens Products/Mens Products/New - Sweatshirt HC/IMG_3959 3.JPG", occasion: "Relaxed style", price: "₹3,299", rentalPrice: "₹479" },
      { id: "c4", title: "Classic Solid Tee", image: "/src/images/Mens Products/Mens Products/New - T shirts HC/Solids/IMG_3936 2.JPG", occasion: "Essential basic", price: "₹1,999", rentalPrice: "₹299" },
      { id: "c5", title: "Navy Blue Tee", image: "/src/images/Mens Products/Mens Products/New - T shirts HC/Solids/IMG_3937 2.JPG", occasion: "Office casual", price: "₹1,999", rentalPrice: "₹299" },
      { id: "c6", title: "Olive Green Tee", image: "/src/images/Mens Products/Mens Products/New - T shirts HC/Solids/IMG_3938 2.JPG", occasion: "Nature vibes", price: "₹1,999", rentalPrice: "₹299" },
      { id: "c7", title: "Floral Day Dress", image: "/src/images/Womens Products/Womens Products/Dresses/IMG_3839.jpg", occasion: "Brunch perfect", price: "₹4,999", rentalPrice: "₹749" },
      { id: "c8", title: "Light Summer Dress", image: "/src/images/Womens Products/Womens Products/Dresses/IMG_3879.jpg", occasion: "Coffee date", price: "₹4,499", rentalPrice: "₹699" },
      { id: "c9", title: "Casual Midi Dress", image: "/src/images/Womens Products/Womens Products/Dresses/IMG_3760.jpg", occasion: "Shopping day", price: "₹4,299", rentalPrice: "₹649" },
      { id: "c10", title: "Everyday Comfort Dress", image: "/src/images/Womens Products/Womens Products/Dresses/IMG_3762.jpg", occasion: "Daily wear", price: "₹4,199", rentalPrice: "₹629" },
      { id: "c11", title: "Relaxed Fit Dress", image: "/src/images/Womens Products/Womens Products/Dresses/IMG_3763.jpg", occasion: "Weekend style", price: "₹4,099", rentalPrice: "₹599" },
      { id: "c12", title: "Soft Cotton Dress", image: "/src/images/Womens Products/Womens Products/Dresses/IMG_3764.jpg", occasion: "All-day comfort", price: "₹3,999", rentalPrice: "₹579" },
    ],
  },
  party: {
    title: "Party",
    icon: <PartyPopper className="w-5 h-5" />,
    products: [
      { id: "p1", title: "Elegant Party Dress", image: "/src/images/Womens Products/Womens Products/Dresses/IMG_3702.jpg", occasion: "Dance floor ready", price: "₹6,999", rentalPrice: "₹999" },
      { id: "p2", title: "Chic Evening Dress", image: "/src/images/Womens Products/Womens Products/Dresses/IMG_3720.jpg", occasion: "VIP vibes", price: "₹7,499", rentalPrice: "₹1,099" },
      { id: "p3", title: "Glamorous Night Dress", image: "/src/images/Womens Products/Womens Products/Dresses/IMG_3703.jpg", occasion: "Night out glam", price: "₹7,999", rentalPrice: "₹1,199" },
      { id: "p4", title: "Bold Statement Dress", image: "/src/images/Womens Products/Womens Products/Dresses/IMG_3706.jpg", occasion: "Party queen", price: "₹8,499", rentalPrice: "₹1,249" },
      { id: "p5", title: "Stunning Party Look", image: "/src/images/Womens Products/Womens Products/Dresses/IMG_3715.jpg", occasion: "Club ready", price: "₹7,299", rentalPrice: "₹1,049" },
      { id: "p6", title: "Midnight Glam Dress", image: "/src/images/Womens Products/Womens Products/Dresses/IMG_3716.jpg", occasion: "After party", price: "₹8,999", rentalPrice: "₹1,299" },
      { id: "p7", title: "Printed Party Tee", image: "/src/images/Mens Products/Mens Products/New - T shirts HC/Printed/IMG_3955.jpg", occasion: "Casual party", price: "₹2,499", rentalPrice: "₹399" },
      { id: "p8", title: "Graphic Print Tee", image: "/src/images/Mens Products/Mens Products/New - T shirts HC/Printed/IMG_3956.JPG", occasion: "Street party", price: "₹2,499", rentalPrice: "₹399" },
      { id: "p9", title: "Bold Print Shirt", image: "/src/images/Mens Products/Mens Products/New - T shirts HC/Printed/IMG_3957.JPG", occasion: "Festival ready", price: "₹2,999", rentalPrice: "₹449" },
      { id: "p10", title: "Artistic Design Tee", image: "/src/images/Mens Products/Mens Products/New - T shirts HC/Printed/IMG_3960.JPG", occasion: "Music fest", price: "₹2,799", rentalPrice: "₹429" },
      { id: "p11", title: "Statement Print", image: "/src/images/Mens Products/Mens Products/New - T shirts HC/Printed/IMG_3961.JPG", occasion: "House party", price: "₹2,599", rentalPrice: "₹419" },
    ],
  },
  cocktail: {
    title: "Cocktail",
    icon: <Wine className="w-5 h-5" />,
    products: [
      { id: "ct1", title: "Designer Cocktail Dress", image: "/src/images/Womens Products/Womens Products/Dresses/IMG_3714.jpg", occasion: "Cocktail hour", price: "₹10,999", rentalPrice: "₹1,599" },
      { id: "ct2", title: "Midnight Glamour", image: "/src/images/Womens Products/Womens Products/Dresses/IMG_3725.jpg", occasion: "After party", price: "₹9,499", rentalPrice: "₹1,399" },
      { id: "ct3", title: "Elegant Midi", image: "/src/images/Womens Products/Womens Products/Dresses/IMG_3726.jpg", occasion: "Sophisticated charm", price: "₹11,499", rentalPrice: "₹1,699" },
      { id: "ct4", title: "Classic Cocktail", image: "/src/images/Womens Products/Womens Products/Dresses/IMG_3728.jpg", occasion: "Timeless beauty", price: "₹9,999", rentalPrice: "₹1,499" },
      { id: "ct5", title: "Luxe Evening Dress", image: "/src/images/Womens Products/Womens Products/Dresses/IMG_3729.jpg", occasion: "Black tie ready", price: "₹12,999", rentalPrice: "₹1,899" },
      { id: "ct6", title: "Satin Elegance", image: "/src/images/Womens Products/Womens Products/Dresses/IMG_3752.jpg", occasion: "Gala night", price: "₹13,499", rentalPrice: "₹1,999" },
      { id: "ct7", title: "Velvet Dream", image: "/src/images/Womens Products/Womens Products/Dresses/IMG_3753.jpg", occasion: "VIP event", price: "₹14,999", rentalPrice: "₹2,199" },
      { id: "ct8", title: "Chiffon Beauty", image: "/src/images/Womens Products/Womens Products/Dresses/IMG_3757.jpg", occasion: "Wedding guest", price: "₹11,999", rentalPrice: "₹1,799" },
      { id: "ct9", title: "Sequin Stunner", image: "/src/images/Womens Products/Womens Products/Dresses/IMG_3758.jpg", occasion: "Award night", price: "₹15,999", rentalPrice: "₹2,399" },
      { id: "ct10", title: "Silk Sensation", image: "/src/images/Womens Products/Womens Products/Dresses/IMG_3769.jpg", occasion: "Opera night", price: "₹12,499", rentalPrice: "₹1,849" },
    ],
  },
  formal: {
    title: "Formal",
    icon: <Briefcase className="w-5 h-5" />,
    products: [
      { id: "f1", title: "Classic Men's Blazer", image: "/src/images/Mens Products/Mens Products/Thrift- Blazzer/IMG_7929 2.jpg", occasion: "Office elegance", price: "₹12,999", rentalPrice: "₹1,899" },
      { id: "f2", title: "Power Blazer", image: "/src/images/Mens Products/Mens Products/Thrift- Blazzer/3XL.  IMG_7926 2.jpg", occasion: "Boardroom boss", price: "₹14,999", rentalPrice: "₹2,199" },
      { id: "f3", title: "Executive Blazer", image: "/src/images/Mens Products/Mens Products/Thrift- Blazzer/40.   IMG_7922 2.jpg", occasion: "Meeting ready", price: "₹13,499", rentalPrice: "₹1,999" },
      { id: "f4", title: "Formal Jacket", image: "/src/images/Mens Products/Mens Products/Thrift- Blazzer/4XL.  IMG_7924 2.jpg", occasion: "Professional chic", price: "₹11,999", rentalPrice: "₹1,799" },
      { id: "f5", title: "Formal Day Dress", image: "/src/images/Womens Products/Womens Products/Dresses/M.  IMG_3708.jpg", occasion: "Corporate style", price: "₹8,999", rentalPrice: "₹1,299" },
      { id: "f6", title: "Office Elegance", image: "/src/images/Womens Products/Womens Products/Dresses/M.  IMG_3709.jpg", occasion: "Business meeting", price: "₹9,499", rentalPrice: "₹1,399" },
      { id: "f7", title: "Professional Look", image: "/src/images/Womens Products/Womens Products/Dresses/M.  IMG_3711.jpg", occasion: "Office party", price: "₹8,499", rentalPrice: "₹1,249" },
      { id: "f8", title: "Executive Dress", image: "/src/images/Womens Products/Womens Products/Dresses/M.  IMG_3712.jpg", occasion: "Conference ready", price: "₹9,999", rentalPrice: "₹1,499" },
      { id: "f9", title: "Business Chic", image: "/src/images/Womens Products/Womens Products/Dresses/L.  IMG_3707.jpg", occasion: "Client meeting", price: "₹10,499", rentalPrice: "₹1,549" },
      { id: "f10", title: "Power Dress", image: "/src/images/Womens Products/Womens Products/Dresses/M.  IMG_3721.jpg", occasion: "Leadership style", price: "₹11,999", rentalPrice: "₹1,749" },
    ],
  },
  street: {
    title: "Streetwear",
    icon: <Footprints className="w-5 h-5" />,
    products: [
      { id: "s1", title: "Thrift Denim Jacket", image: "/src/images/Thrift - Jackets/Thrift - Jackets/IMG_7905 2.jpg", occasion: "Eco-chic style", price: "₹4,999", rentalPrice: "₹699" },
      { id: "s2", title: "Vintage Jacket", image: "/src/images/Thrift - Jackets/Thrift - Jackets/IMG_7920 2.jpg", occasion: "Retro vibes", price: "₹5,499", rentalPrice: "₹799" },
      { id: "s3", title: "Classic Thrift Find", image: "/src/images/Thrift - Jackets/Thrift - Jackets/L.   IMG_7911 2.jpg", occasion: "One of a kind", price: "₹4,499", rentalPrice: "₹649" },
      { id: "s4", title: "Urban Jacket", image: "/src/images/Thrift - Jackets/Thrift - Jackets/L.   IMG_7913 2.jpg", occasion: "Street style", price: "₹5,299", rentalPrice: "₹779" },
      { id: "s5", title: "Edgy Denim", image: "/src/images/Thrift - Jackets/Thrift - Jackets/L.   IMG_7917 2.jpg", occasion: "Urban explorer", price: "₹4,799", rentalPrice: "₹699" },
      { id: "s6", title: "Casual Street Jacket", image: "/src/images/Thrift - Jackets/Thrift - Jackets/L.  IMG_7941 2.jpg", occasion: "City walks", price: "₹5,999", rentalPrice: "₹879" },
      { id: "s7", title: "Solid Classic Tee", image: "/src/images/Mens Products/Mens Products/New - T shirts HC/Solids/IMG_3939 2.JPG", occasion: "Street essential", price: "₹1,999", rentalPrice: "₹299" },
      { id: "s8", title: "Urban Tee", image: "/src/images/Mens Products/Mens Products/New - T shirts HC/Solids/IMG_3941 2.JPG", occasion: "Skate park", price: "₹1,999", rentalPrice: "₹299" },
      { id: "s9", title: "Street Print Tee", image: "/src/images/Mens Products/Mens Products/New - T shirts HC/Printed/IMG_3962.jpg", occasion: "Graffiti vibes", price: "₹2,499", rentalPrice: "₹399" },
      { id: "s10", title: "Bold Street Tee", image: "/src/images/Mens Products/Mens Products/New - T shirts HC/Printed/IMG_3963.jpg", occasion: "Hip hop style", price: "₹2,499", rentalPrice: "₹399" },
      { id: "s11", title: "Graphic Street Wear", image: "/src/images/Mens Products/Mens Products/New - T shirts HC/Printed/IMG_3964.jpg", occasion: "Skateboard session", price: "₹2,299", rentalPrice: "₹379" },
    ],
  },
  vacation: {
    title: "Vacation",
    icon: <Palmtree className="w-5 h-5" />,
    products: [
      { id: "v1", title: "Summer Midi Dress", image: "/src/images/Womens Products/Womens Products/Dresses/IMG_3752.jpg", occasion: "Vacation ready", price: "₹5,999", rentalPrice: "₹849" },
      { id: "v2", title: "Beach Day Dress", image: "/src/images/Womens Products/Womens Products/Dresses/S IMG_3755.jpg", occasion: "Tropical vibes", price: "₹5,499", rentalPrice: "₹799" },
      { id: "v3", title: "Resort Chic", image: "/src/images/Womens Products/Womens Products/Dresses/S IMG_3756.jpg", occasion: "Island hopping", price: "₹5,299", rentalPrice: "₹779" },
      { id: "v4", title: "Poolside Look", image: "/src/images/Womens Products/Womens Products/Dresses/S.  IMG_3719.jpg", occasion: "Resort ready", price: "₹4,999", rentalPrice: "₹749" },
      { id: "v5", title: "Coastal Breeze", image: "/src/images/Womens Products/Womens Products/Dresses/S.  IMG_3727.jpg", occasion: "Beach walk", price: "₹5,199", rentalPrice: "₹759" },
      { id: "v6", title: "Sunset Dress", image: "/src/images/Womens Products/Womens Products/Dresses/S.  IMG_3754.jpg", occasion: "Evening stroll", price: "₹5,399", rentalPrice: "₹789" },
      { id: "v7", title: "Travel Comfort Dress", image: "/src/images/Womens Products/Womens Products/Dresses/S. IMG_3705.jpg", occasion: "Airport style", price: "₹4,799", rentalPrice: "₹699" },
      { id: "v8", title: "Holiday Dress", image: "/src/images/Womens Products/Womens Products/Dresses/XS. IMG_3704.jpg", occasion: "Holiday mood", price: "₹5,599", rentalPrice: "₹819" },
      { id: "v9", title: "Tropical Print Tee", image: "/src/images/Mens Products/Mens Products/New - T shirts HC/Printed/IMG_3965.jpg", occasion: "Beach bar", price: "₹2,499", rentalPrice: "₹399" },
      { id: "v10", title: "Island Vibes Tee", image: "/src/images/Mens Products/Mens Products/New - T shirts HC/Printed/IMG_3966.jpg", occasion: "Boat cruise", price: "₹2,499", rentalPrice: "₹399" },
      { id: "v11", title: "Vacation Print", image: "/src/images/Mens Products/Mens Products/New - T shirts HC/Printed/IMG_3967.jpg", occasion: "Sunset party", price: "₹2,299", rentalPrice: "₹379" },
    ],
  },
};

interface OccasionTab {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const OCCASIONS: OccasionTab[] = [
  { id: "casual", label: "Casual", icon: <Shirt className="w-5 h-5" /> },
  { id: "party", label: "Party", icon: <PartyPopper className="w-5 h-5" /> },
  { id: "cocktail", label: "Cocktail", icon: <Wine className="w-5 h-5" /> },
  { id: "formal", label: "Formal", icon: <Briefcase className="w-5 h-5" /> },
  { id: "street", label: "Streetwear", icon: <Footprints className="w-5 h-5" /> },
  { id: "vacation", label: "Vacation", icon: <Palmtree className="w-5 h-5" /> },
];

const CollectionsPage: React.FC = () => {
  const { moodId } = useParams<{ moodId?: string }>();
  const navigate = useNavigate();
  const [selectedMood, setSelectedMood] = useState<string>(moodId || "casual");
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Update selected mood when URL param changes
  useEffect(() => {
    if (moodId && MOOD_PRODUCTS[moodId]) {
      setSelectedMood(moodId);
    }
  }, [moodId]);

  // Fetch products from database when mood changes
  useEffect(() => {
    loadProductsFromDatabase();
  }, [selectedMood]);

  const loadProductsFromDatabase = async () => {
    setIsLoadingProducts(true);
    try {
      // Import productService dynamically to avoid circular dependencies
      const { productService } = await import('@/services/productService');

      // Fetch products for the selected event category
      const products = await productService.getProductsByEvent(selectedMood as any);

      console.log(`📦 Loaded ${products.length} products from database for ${selectedMood}`);
      setDbProducts(products);
    } catch (error) {
      console.error('❌ Failed to load products from database:', error);
      setDbProducts([]);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const handleMoodChange = (newMood: string) => {
    setLoading(true);
    setSelectedMood(newMood);
    navigate(`/collections/${newMood}`, { replace: true });
    setTimeout(() => setLoading(false), 300);
  };

  // Transform database products to match the Product interface expected by the UI
  const transformDbProduct = (dbProduct: any): Product => {
    return {
      id: dbProduct.id,
      title: dbProduct.name,
      image: dbProduct.imageUrl || '/placeholder-product.jpg',
      occasion: dbProduct.description || `Perfect for ${selectedMood} occasions`,
      price: `₹${dbProduct.price}`,
      rentalPrice: `₹${dbProduct.rentalPrice || Math.floor(dbProduct.price * 0.15)}`,
    };
  };

  // Merge hardcoded products with database products
  const currentMoodData = MOOD_PRODUCTS[selectedMood] || MOOD_PRODUCTS.casual;
  const transformedDbProducts = dbProducts.map(transformDbProduct);

  // Combine both sources - database products first (newest inventory), then hardcoded
  const allProducts = [...transformedDbProducts, ...currentMoodData.products];

  const currentOccasion = OCCASIONS.find(o => o.id === selectedMood);

  return (
    <div className="min-h-screen bg-[#F6F0E0] dark:bg-[#1A1A1A]">
      <AnnouncementTicker />
      <Navigation />

      <main className="pt-[140px] md:pt-[150px]">
        <section className="py-12 md:py-16">
          <div className="container-custom">
            {/* Header */}
            <motion.div className="text-center mb-14" {...fadeInUp}>
              <div className="inline-flex items-center gap-2 bg-[#C0E2AD] dark:bg-[#99C08D] text-black px-6 py-2.5 rounded-full mb-6">
                <Sparkles className="w-5 h-5" />
                <span className="font-bold text-sm tracking-wide">Curated Style Collections</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-playfair font-bold mb-3 sm:mb-4 px-4 text-black dark:text-[#FAFAFA]">
                <span>Shop by </span>
                <span className="text-[#EB76C2]">Mood</span>
              </h1>
              <p className="text-black/60 dark:text-[#FAFAFA]/60 text-base sm:text-lg max-w-2xl mx-auto px-4">
                Find the perfect outfit for every occasion. Rent designer fashion at a fraction of the price.
              </p>
            </motion.div>

            {/* Mood Selector Tabs */}
            <motion.div
              className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 mb-12 px-2"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {OCCASIONS.map((occasion) => (
                <motion.button
                  key={occasion.id}
                  variants={staggerItem}
                  onClick={() => handleMoodChange(occasion.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`group relative px-4 py-3 sm:px-5 sm:py-3 md:px-6 md:py-3.5 rounded-full font-semibold transition-all duration-300 flex items-center gap-2 md:gap-3 touch-manipulation min-h-[48px] ${selectedMood === occasion.id
                    ? "bg-[#E3BBE6] dark:bg-[#302038] text-black dark:text-[#FAFAFA] shadow-lg"
                    : "bg-transparent text-black dark:text-[#FAFAFA] hover:border-[#C0E2AD] border border-black/10 dark:border-[#FAFAFA]/10"
                    }`}
                >
                  <span className={`transition-transform duration-300 ${selectedMood === occasion.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                    {occasion.icon}
                  </span>
                  <span className="text-sm sm:text-base md:text-base">{occasion.label}</span>
                </motion.button>
              ))}
            </motion.div>

            {/* Collection Title */}
            <motion.div
              className="flex items-center gap-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={selectedMood}
            >
              <div className="w-14 h-14 rounded-2xl bg-[#E3BBE6] dark:bg-[#302038] flex items-center justify-center text-black dark:text-[#FAFAFA]">
                {currentMoodData.icon}
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-playfair font-bold text-black dark:text-[#FAFAFA]">
                  {currentMoodData.title} Collection
                </h2>
                <p className="text-black/60 dark:text-[#FAFAFA]/60">
                  {allProducts.length} curated outfits for your {currentMoodData.title.toLowerCase()} occasions
                  {dbProducts.length > 0 && (
                    <span className="ml-2 text-green-600 dark:text-green-400 font-semibold">
                      ({dbProducts.length} new arrivals!)
                    </span>
                  )}
                </p>
              </div>
            </motion.div>

            {/* Products Grid */}
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="rounded-2xl bg-white/50 dark:bg-[#282828]/50 aspect-[3/4] animate-pulse" />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key={selectedMood}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
                >
                  {allProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group bg-white dark:bg-[#282828] rounded-2xl border border-black/5 dark:border-[#FAFAFA]/5 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden"
                    >
                      {/* Image */}
                      <div className="relative aspect-[3/4] overflow-hidden">
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
                        />

                        {/* Heart Button */}
                        <motion.button
                          className="absolute top-3 left-3 w-9 h-9 bg-white/90 dark:bg-[#282828]/90 backdrop-blur-sm rounded-full flex items-center justify-center text-black/50 dark:text-[#FAFAFA]/50 hover:text-[#EB76C2] transition-all shadow-lg"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Heart className="w-4 h-4" />
                        </motion.button>
                      </div>

                      {/* Product Info */}
                      <div className="p-4">
                        <h3 className="font-bold text-sm md:text-base text-black dark:text-[#FAFAFA] truncate">
                          {product.title}
                        </h3>
                        <p className="text-black/50 dark:text-[#FAFAFA]/50 text-xs mb-3">
                          {product.occasion}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-black/40 dark:text-[#FAFAFA]/40 line-through">
                              {product.price}
                            </span>
                            <span className="text-lg font-bold text-black dark:text-[#FAFAFA]">
                              {product.rentalPrice}
                            </span>
                          </div>

                          <motion.button
                            onClick={() => setIsSignupOpen(true)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-3 py-2 bg-[#C0E2AD] dark:bg-[#99C08D] text-black rounded-full text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1"
                          >
                            Rent
                            <ChevronRight className="w-3 h-3" />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* View More Button - Navigate to dedicated mood page for even more products */}
            <motion.div
              className="flex justify-center mt-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <motion.button
                onClick={() => navigate(`/mood/${selectedMood}`)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-[#E3BBE6] dark:bg-[#302038] text-black dark:text-[#FAFAFA] rounded-full font-bold text-base shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              >
                View All {currentMoodData.title} Outfits
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
      <SignupModal isOpen={isSignupOpen} onClose={() => setIsSignupOpen(false)} />
    </div>
  );
};

export default CollectionsPage;
