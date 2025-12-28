import { supabase } from '@/integrations/supabase/client';

export interface DeviceCapabilities {
    hasCamera: boolean;
    hasLocalStorage: boolean;
    hasIndexedDB: boolean;
    isOnline: boolean;
    userAgent: string;
    platform: string;
}

export interface DeviceCapabilityStatus {
    camera: 'available' | 'denied' | 'unavailable' | 'checking';
    localStorage: 'available' | 'unavailable';
    indexedDB: 'available' | 'unavailable';
    network: 'online' | 'offline';
}

class DeviceCapabilitiesService {
    private sessionId: string;

    constructor() {
        // Generate unique session ID
        this.sessionId = this.generateSessionId();
    }

    private generateSessionId(): string {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Detect camera access and availability
     */
    async detectCameraAccess(): Promise<'available' | 'denied' | 'unavailable'> {
        try {
            // Check if getUserMedia is supported
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                console.warn('⚠️ Camera API not supported');
                return 'unavailable';
            }

            // Try to get camera permission
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });

            // Stop the stream immediately
            stream.getTracks().forEach(track => track.stop());

            console.log('✅ Camera access granted');
            return 'available';
        } catch (error: any) {
            if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                console.warn('⚠️ Camera access denied by user');
                return 'denied';
            }
            console.error('❌ Camera detection error:', error);
            return 'unavailable';
        }
    }

    /**
     * Detect localStorage availability
     */
    detectLocalStorage(): boolean {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            console.warn('⚠️ localStorage not available:', error);
            return false;
        }
    }

    /**
     * Detect IndexedDB availability
     */
    detectIndexedDB(): boolean {
        try {
            return typeof indexedDB !== 'undefined';
        } catch (error) {
            console.warn('⚠️ IndexedDB not available:', error);
            return false;
        }
    }

    /**
     * Detect network status
     */
    detectNetworkStatus(): boolean {
        return typeof navigator !== 'undefined' ? navigator.onLine : true;
    }

    /**
     * Get complete device capabilities
     */
    async getDeviceCapabilities(): Promise<DeviceCapabilities> {
        const cameraStatus = await this.detectCameraAccess();

        return {
            hasCamera: cameraStatus === 'available',
            hasLocalStorage: this.detectLocalStorage(),
            hasIndexedDB: this.detectIndexedDB(),
            isOnline: this.detectNetworkStatus(),
            userAgent: navigator.userAgent,
            platform: navigator.platform || 'unknown',
        };
    }

    /**
     * Get detailed capability status for UI display
     */
    async getCapabilityStatus(): Promise<DeviceCapabilityStatus> {
        const cameraStatus = await this.detectCameraAccess();

        return {
            camera: cameraStatus,
            localStorage: this.detectLocalStorage() ? 'available' : 'unavailable',
            indexedDB: this.detectIndexedDB() ? 'available' : 'unavailable',
            network: this.detectNetworkStatus() ? 'online' : 'offline',
        };
    }

    /**
     * Log device capabilities to database
     */
    async logCapabilities(): Promise<void> {
        try {
            const capabilities = await this.getDeviceCapabilities();

            const { error } = await supabase
                .from('device_capabilities')
                .insert({
                    session_id: this.sessionId,
                    has_camera: capabilities.hasCamera,
                    has_local_storage: capabilities.hasLocalStorage,
                    has_indexeddb: capabilities.hasIndexedDB,
                    user_agent: capabilities.userAgent,
                    platform: capabilities.platform,
                    metadata: {
                        is_online: capabilities.isOnline,
                        timestamp: new Date().toISOString(),
                    },
                });

            if (error) {
                console.error('❌ Failed to log device capabilities:', error);
            } else {
                console.log('✅ Device capabilities logged');
            }
        } catch (error) {
            console.error('❌ Error logging capabilities:', error);
        }
    }

    /**
     * Check if all required features are available for QR scanning
     */
    async canScanQRCodes(): Promise<{ canScan: boolean; missingFeatures: string[] }> {
        const capabilities = await this.getDeviceCapabilities();
        const missingFeatures: string[] = [];

        if (!capabilities.hasCamera) {
            missingFeatures.push('Camera access');
        }

        if (!capabilities.hasLocalStorage && !capabilities.hasIndexedDB) {
            missingFeatures.push('Local storage');
        }

        return {
            canScan: missingFeatures.length === 0,
            missingFeatures,
        };
    }

    /**
     * Request camera permission explicitly
     */
    async requestCameraPermission(): Promise<boolean> {
        const status = await this.detectCameraAccess();
        return status === 'available';
    }

    /**
     * Get session ID for tracking
     */
    getSessionId(): string {
        return this.sessionId;
    }
}

// Export singleton instance
export const deviceCapabilitiesService = new DeviceCapabilitiesService();
