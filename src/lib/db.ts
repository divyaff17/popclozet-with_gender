import { openDB, DBSchema, IDBPDatabase } from 'idb';

// Define the database schema
interface PopClozetDB extends DBSchema {
    cart: {
        key: string;
        value: {
            productId: string;
            quantity: number;
            addedAt: number;
        };
    };
    wishlist: {
        key: string;
        value: {
            productId: string;
            addedAt: number;
        };
    };
    products: {
        key: string;
        value: {
            id: string;
            data: any;
            cachedAt: number;
        };
    };
    offlineQueue: {
        key: number;
        value: {
            id?: number;
            action: 'add_to_cart' | 'remove_from_cart' | 'add_to_wishlist' | 'remove_from_wishlist' | 'email_signup' | 'qr_scan';
            data: any;
            timestamp: number;
            synced: boolean;
        };
        indexes: { 'by-synced': boolean };
    };
    preferences: {
        key: string;
        value: any;
    };
}

const DB_NAME = 'PopClozet';
const DB_VERSION = 2;

let dbInstance: IDBPDatabase<PopClozetDB> | null = null;

// Initialize the database
export async function initDB(): Promise<IDBPDatabase<PopClozetDB>> {
    if (dbInstance) {
        return dbInstance;
    }

    dbInstance = await openDB<PopClozetDB>(DB_NAME, DB_VERSION, {
        upgrade(db, oldVersion, newVersion, transaction) {
            // Create cart store
            if (!db.objectStoreNames.contains('cart')) {
                db.createObjectStore('cart', { keyPath: 'productId' });
            }

            // Create wishlist store
            if (!db.objectStoreNames.contains('wishlist')) {
                db.createObjectStore('wishlist', { keyPath: 'productId' });
            }

            // Create products cache store
            if (!db.objectStoreNames.contains('products')) {
                db.createObjectStore('products', { keyPath: 'id' });
            }

            // Create offline queue store
            if (!db.objectStoreNames.contains('offlineQueue')) {
                const queueStore = db.createObjectStore('offlineQueue', {
                    keyPath: 'id',
                    autoIncrement: true,
                });
                queueStore.createIndex('by-synced', 'synced');
            }

            // Create preferences store
            if (!db.objectStoreNames.contains('preferences')) {
                db.createObjectStore('preferences');
            }
        },
    });

    return dbInstance;
}

// Cart operations
export async function addToCartDB(productId: string, quantity: number = 1) {
    const db = await initDB();
    const existing = await db.get('cart', productId);

    await db.put('cart', {
        productId,
        quantity: existing ? existing.quantity + quantity : quantity,
        addedAt: Date.now(),
    });
}

export async function removeFromCartDB(productId: string) {
    const db = await initDB();
    await db.delete('cart', productId);
}

export async function updateCartQuantityDB(productId: string, quantity: number) {
    const db = await initDB();
    if (quantity <= 0) {
        await removeFromCartDB(productId);
    } else {
        await db.put('cart', {
            productId,
            quantity,
            addedAt: Date.now(),
        });
    }
}

export async function getCartItemsDB() {
    const db = await initDB();
    return await db.getAll('cart');
}

export async function clearCartDB() {
    const db = await initDB();
    await db.clear('cart');
}

// Wishlist operations
export async function addToWishlistDB(productId: string) {
    const db = await initDB();
    await db.put('wishlist', {
        productId,
        addedAt: Date.now(),
    });
}

export async function removeFromWishlistDB(productId: string) {
    const db = await initDB();
    await db.delete('wishlist', productId);
}

export async function getWishlistItemsDB() {
    const db = await initDB();
    return await db.getAll('wishlist');
}

export async function isInWishlistDB(productId: string): Promise<boolean> {
    const db = await initDB();
    const item = await db.get('wishlist', productId);
    return !!item;
}

// Product cache operations
export async function cacheProductDB(id: string, data: any) {
    const db = await initDB();
    await db.put('products', {
        id,
        data,
        cachedAt: Date.now(),
    });
}

export async function getCachedProductDB(id: string) {
    const db = await initDB();
    const cached = await db.get('products', id);

    // Cache expires after 1 hour
    if (cached && Date.now() - cached.cachedAt < 60 * 60 * 1000) {
        return cached.data;
    }

    return null;
}

// Offline queue operations
export async function addToOfflineQueueDB(
    action: 'add_to_cart' | 'remove_from_cart' | 'add_to_wishlist' | 'remove_from_wishlist' | 'email_signup' | 'qr_scan',
    data: any
) {
    const db = await initDB();
    const id = await db.add('offlineQueue', {
        action,
        data,
        timestamp: Date.now(),
        synced: false,
    });
    console.log(`📥 Added to offline queue: ${action}`, { id, data });
    return id;
}

export async function getUnsyncedQueueItemsDB() {
    const db = await initDB();
    const allItems = await db.getAll('offlineQueue');
    return allItems.filter(item => !item.synced);
}

export async function markQueueItemSyncedDB(id: number) {
    const db = await initDB();
    const item = await db.get('offlineQueue', id);
    if (item) {
        item.synced = true;
        await db.put('offlineQueue', item);
    }
}

export async function clearSyncedQueueItemsDB() {
    const db = await initDB();
    const allItems = await db.getAll('offlineQueue');
    const syncedItems = allItems.filter(item => item.synced);

    for (const item of syncedItems) {
        if (item.id !== undefined) {
            await db.delete('offlineQueue', item.id);
        }
    }
}

// Preferences operations
export async function setPreferenceDB(key: string, value: any) {
    const db = await initDB();
    await db.put('preferences', value, key);
}

export async function getPreferenceDB(key: string) {
    const db = await initDB();
    return await db.get('preferences', key);
}

// Migration from localStorage
export async function migrateFromLocalStorage() {
    try {
        // Migrate cart
        const cartData = localStorage.getItem('cart');
        if (cartData) {
            const cart = JSON.parse(cartData);
            for (const [productId, quantity] of Object.entries(cart)) {
                await addToCartDB(productId, quantity as number);
            }
            console.log('✅ Cart migrated from localStorage to IndexedDB');
        }

        // Migrate wishlist
        const wishlistData = localStorage.getItem('wishlist');
        if (wishlistData) {
            const wishlist = JSON.parse(wishlistData);
            for (const productId of wishlist) {
                await addToWishlistDB(productId);
            }
            console.log('✅ Wishlist migrated from localStorage to IndexedDB');
        }

        // Migrate theme preference
        const theme = localStorage.getItem('theme');
        if (theme) {
            await setPreferenceDB('theme', theme);
            console.log('✅ Theme preference migrated to IndexedDB');
        }
    } catch (error) {
        console.error('Error migrating from localStorage:', error);
    }
}

// Initialize DB and migrate on first load
if (typeof window !== 'undefined') {
    initDB().then(() => {
        console.log('✅ IndexedDB initialized');
        // Check if migration is needed
        const migrated = localStorage.getItem('indexeddb_migrated');
        if (!migrated) {
            migrateFromLocalStorage().then(() => {
                localStorage.setItem('indexeddb_migrated', 'true');
            });
        }
    }).catch((error) => {
        console.error('Failed to initialize IndexedDB:', error);
    });
}

// Cleanup and optimization operations
export async function cleanupOldCache(maxAgeMs: number = 7 * 24 * 60 * 60 * 1000): Promise<number> {
    try {
        const db = await initDB();
        const allProducts = await db.getAll('products');
        const now = Date.now();
        let deletedCount = 0;

        for (const product of allProducts) {
            if (now - product.cachedAt > maxAgeMs) {
                await db.delete('products', product.id);
                deletedCount++;
            }
        }

        console.log(`✅ Cleaned up ${deletedCount} old cached products`);
        return deletedCount;
    } catch (error) {
        console.error('Failed to cleanup old cache:', error);
        return 0;
    }
}

export async function optimizeDatabase(): Promise<void> {
    try {
        // Clear synced queue items
        await clearSyncedQueueItemsDB();

        // Clean old cache
        await cleanupOldCache();

        console.log('✅ Database optimized');
    } catch (error) {
        console.error('Failed to optimize database:', error);
    }
}

export async function getCacheSize(): Promise<{
    products: number;
    cart: number;
    wishlist: number;
    queue: number;
}> {
    try {
        const db = await initDB();

        const [products, cart, wishlist, queue] = await Promise.all([
            db.getAll('products'),
            db.getAll('cart'),
            db.getAll('wishlist'),
            db.getAll('offlineQueue'),
        ]);

        return {
            products: products.length,
            cart: cart.length,
            wishlist: wishlist.length,
            queue: queue.length,
        };
    } catch (error) {
        console.error('Failed to get cache size:', error);
        return { products: 0, cart: 0, wishlist: 0, queue: 0 };
    }
}

export async function getStorageEstimate(): Promise<{
    usage: number;
    quota: number;
    percentage: number;
} | null> {
    try {
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            const estimate = await navigator.storage.estimate();
            const usage = estimate.usage || 0;
            const quota = estimate.quota || 0;
            const percentage = quota > 0 ? (usage / quota) * 100 : 0;

            return {
                usage,
                quota,
                percentage,
            };
        }
        return null;
    } catch (error) {
        console.error('Failed to get storage estimate:', error);
        return null;
    }
}
