import { supabase } from '@/integrations/supabase/client';
import { addToOfflineQueueDB } from '@/lib/db';
import { errorLoggingService } from './errorLoggingService';

export interface QRScanLog {
    id?: string;
    productId?: string;
    qrCodeData: string;
    scanTimestamp: string;
    userAgent: string;
    isOnline: boolean;
    syncedAt?: string;
    metadata?: Record<string, any>;
}

class QRScanTrackingService {
    /**
     * Log a QR scan event
     */
    async logScan(
        qrCodeData: string,
        productId?: string,
        additionalMetadata?: Record<string, any>
    ): Promise<void> {
        const isOnline = navigator.onLine;

        const scanLog: QRScanLog = {
            productId,
            qrCodeData,
            scanTimestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            isOnline,
            metadata: {
                ...additionalMetadata,
                platform: navigator.platform,
                language: navigator.language,
            },
        };

        if (isOnline) {
            // Log directly to database when online
            await this.logScanToDatabase(scanLog);
        } else {
            // Queue for later sync when offline
            await this.logOfflineScan(scanLog);
        }
    }

    /**
     * Log scan to database (online)
     */
    private async logScanToDatabase(scanLog: QRScanLog): Promise<void> {
        try {
            const { error } = await supabase
                .from('qr_scan_logs')
                .insert({
                    product_id: scanLog.productId || null,
                    qr_code_data: scanLog.qrCodeData,
                    scan_timestamp: scanLog.scanTimestamp,
                    user_agent: scanLog.userAgent,
                    is_online: scanLog.isOnline,
                    synced_at: new Date().toISOString(),
                    metadata: scanLog.metadata || {},
                });

            if (error) {
                console.error('❌ Failed to log QR scan:', error);
                // Fallback to offline queue if database insert fails
                await this.logOfflineScan(scanLog);
            } else {
                console.log('✅ QR scan logged to database');
                // Log audit event for QR scan
                await errorLoggingService.logAudit(
                    'qr_scan',
                    'qr_code',
                    scanLog.productId,
                    { qrCodeData: scanLog.qrCodeData, isOnline: scanLog.isOnline }
                );
            }
        } catch (error) {
            console.error('❌ Error logging QR scan:', error);
            // Fallback to offline queue
            await this.logOfflineScan(scanLog);
        }
    }

    /**
     * Queue scan for offline sync
     */
    async logOfflineScan(scanLog: QRScanLog): Promise<void> {
        try {
            await addToOfflineQueueDB('qr_scan', scanLog);
            console.log('📥 QR scan queued for offline sync');
        } catch (error) {
            console.error('❌ Failed to queue offline scan:', error);
        }
    }

    /**
     * Get scan history for a product
     */
    async getScanHistory(productId: string, limit: number = 50): Promise<QRScanLog[]> {
        try {
            const { data, error } = await supabase
                .from('qr_scan_logs')
                .select('*')
                .eq('product_id', productId)
                .order('scan_timestamp', { ascending: false })
                .limit(limit);

            if (error) throw error;

            return (data || []).map(row => ({
                id: row.id,
                productId: row.product_id,
                qrCodeData: row.qr_code_data,
                scanTimestamp: row.scan_timestamp,
                userAgent: row.user_agent,
                isOnline: row.is_online,
                syncedAt: row.synced_at,
                metadata: row.metadata,
            }));
        } catch (error) {
            console.error('❌ Failed to get scan history:', error);
            return [];
        }
    }

    /**
     * Get all scan logs (admin/analytics)
     */
    async getAllScans(limit: number = 100): Promise<QRScanLog[]> {
        try {
            const { data, error } = await supabase
                .from('qr_scan_logs')
                .select('*')
                .order('scan_timestamp', { ascending: false })
                .limit(limit);

            if (error) throw error;

            return (data || []).map(row => ({
                id: row.id,
                productId: row.product_id,
                qrCodeData: row.qr_code_data,
                scanTimestamp: row.scan_timestamp,
                userAgent: row.user_agent,
                isOnline: row.is_online,
                syncedAt: row.synced_at,
                metadata: row.metadata,
            }));
        } catch (error) {
            console.error('❌ Failed to get all scans:', error);
            return [];
        }
    }

    /**
     * Sync offline scans to database
     */
    async syncOfflineScans(queuedScans: any[]): Promise<number> {
        let syncedCount = 0;

        for (const queueItem of queuedScans) {
            if (queueItem.action !== 'qr_scan') continue;

            try {
                const scanLog = queueItem.data as QRScanLog;

                const { error } = await supabase
                    .from('qr_scan_logs')
                    .insert({
                        product_id: scanLog.productId || null,
                        qr_code_data: scanLog.qrCodeData,
                        scan_timestamp: scanLog.scanTimestamp,
                        user_agent: scanLog.userAgent,
                        is_online: false, // Was offline when scanned
                        synced_at: new Date().toISOString(),
                        metadata: scanLog.metadata || {},
                    });

                if (!error) {
                    syncedCount++;
                    console.log('✅ Offline scan synced:', scanLog.qrCodeData);
                    // Log audit event for offline sync
                    await errorLoggingService.logAudit(
                        'qr_scan_synced',
                        'qr_code',
                        scanLog.productId,
                        { qrCodeData: scanLog.qrCodeData, wasOffline: true }
                    );
                } else {
                    console.error('❌ Failed to sync scan:', error);
                }
            } catch (error) {
                console.error('❌ Error syncing offline scan:', error);
            }
        }

        console.log(`✅ Synced ${syncedCount} offline QR scans`);
        return syncedCount;
    }

    /**
     * Get scan statistics
     */
    async getScanStats(): Promise<{
        totalScans: number;
        onlineScans: number;
        offlineScans: number;
        uniqueProducts: number;
    }> {
        try {
            const { data, error } = await supabase
                .from('qr_scan_logs')
                .select('id, is_online, product_id');

            if (error) throw error;

            const totalScans = data?.length || 0;
            const onlineScans = data?.filter(s => s.is_online).length || 0;
            const offlineScans = totalScans - onlineScans;
            const uniqueProducts = new Set(
                data?.filter(s => s.product_id).map(s => s.product_id)
            ).size;

            return {
                totalScans,
                onlineScans,
                offlineScans,
                uniqueProducts,
            };
        } catch (error) {
            console.error('❌ Failed to get scan stats:', error);
            return {
                totalScans: 0,
                onlineScans: 0,
                offlineScans: 0,
                uniqueProducts: 0,
            };
        }
    }
}

// Export singleton instance
export const qrScanTrackingService = new QRScanTrackingService();
