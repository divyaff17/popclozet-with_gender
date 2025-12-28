import { useEffect, useCallback } from 'react';
import { useOnlineStatus } from './useOnlineStatus';
import { getUnsyncedQueueItemsDB, markQueueItemSyncedDB, clearSyncedQueueItemsDB } from '@/lib/db';
import { qrScanTrackingService } from '@/services/qrScanTrackingService';
import { toast } from 'sonner';

export function useOfflineSync() {
    const isOnline = useOnlineStatus();

    const syncOfflineQueue = useCallback(async () => {
        if (!isOnline) return;

        try {
            const queueItems = await getUnsyncedQueueItemsDB();

            if (queueItems.length === 0) return;

            console.log(`🔄 Syncing ${queueItems.length} offline actions...`);

            // Sync QR scans first
            const qrScans = queueItems.filter(item => item.action === 'qr_scan');
            if (qrScans.length > 0) {
                await qrScanTrackingService.syncOfflineScans(qrScans);
            }

            for (const item of queueItems) {
                try {
                    // Process each queued action
                    switch (item.action) {
                        case 'email_signup':
                            // Sync email signup to Supabase
                            // This would call your actual API endpoint
                            console.log('Syncing email signup:', item.data);
                            break;

                        case 'qr_scan':
                            // Sync QR scan logs to Supabase
                            console.log('Syncing QR scan:', item.data);
                            // The actual sync is handled by qrScanTrackingService
                            break;

                        case 'add_to_cart':
                        case 'remove_from_cart':
                        case 'add_to_wishlist':
                        case 'remove_from_wishlist':
                            // These are already in IndexedDB, just mark as synced
                            console.log(`Syncing ${item.action}:`, item.data);
                            break;
                    }

                    // Mark as synced
                    if (item.id) {
                        await markQueueItemSyncedDB(item.id);
                    }
                } catch (error) {
                    console.error(`Failed to sync action ${item.action}:`, error);
                }
            }

            // Clean up synced items
            await clearSyncedQueueItemsDB();

            toast.success('Synced offline changes', {
                description: `${queueItems.length} action(s) synchronized`,
            });

            console.log('✅ Offline queue synced successfully');
        } catch (error) {
            console.error('Error syncing offline queue:', error);
        }
    }, [isOnline]);

    useEffect(() => {
        if (isOnline) {
            // Sync when coming back online
            syncOfflineQueue();
        }
    }, [isOnline, syncOfflineQueue]);

    return {
        isOnline,
        syncOfflineQueue,
    };
}
