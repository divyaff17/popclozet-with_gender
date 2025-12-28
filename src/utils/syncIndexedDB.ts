import { supabase } from '@/integrations/supabase/client';
import { cacheProductDB } from '@/lib/db';

/**
 * Sync all products from Supabase to IndexedDB
 * This populates the IndexedDB cache with product data for offline access
 */
export async function syncProductsToIndexedDB(): Promise<number> {
    try {
        console.log('🔄 Starting product sync to IndexedDB...');

        // Fetch all available products from Supabase
        const { data: products, error } = await (supabase as any)
            .from('products')
            .select('*')
            .eq('is_available', true)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('❌ Error fetching products:', error);
            throw error;
        }

        if (!products || products.length === 0) {
            console.log('⚠️ No products found in Supabase');
            return 0;
        }

        // Cache each product in IndexedDB
        let cachedCount = 0;
        for (const product of products) {
            try {
                await cacheProductDB(product.id, product);
                cachedCount++;
            } catch (err) {
                console.error(`Failed to cache product ${product.id}:`, err);
            }
        }

        console.log(`✅ Synced ${cachedCount} products to IndexedDB`);
        return cachedCount;
    } catch (error) {
        console.error('❌ Failed to sync products to IndexedDB:', error);
        throw error;
    }
}

/**
 * Initialize IndexedDB with data from Supabase
 * Call this on app startup to populate the cache
 */
export async function initializeIndexedDBCache(): Promise<void> {
    try {
        console.log('🚀 Initializing IndexedDB cache...');

        // Sync products
        const productCount = await syncProductsToIndexedDB();

        console.log(`✅ IndexedDB initialized with ${productCount} products`);
    } catch (error) {
        console.error('❌ Failed to initialize IndexedDB cache:', error);
    }
}
