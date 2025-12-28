class RateLimitService {
    private scanLimits: Map<string, { count: number; resetTime: number }> = new Map();
    private readonly MAX_SCANS_PER_MINUTE = 10;
    private readonly WINDOW_MS = 60 * 1000; // 1 minute

    /**
     * Check if a scan is allowed for the given identifier
     */
    canScan(identifier: string = 'default'): boolean {
        const now = Date.now();
        const limit = this.scanLimits.get(identifier);

        // No previous scans or window expired
        if (!limit || now > limit.resetTime) {
            this.scanLimits.set(identifier, {
                count: 1,
                resetTime: now + this.WINDOW_MS,
            });
            return true;
        }

        // Within window, check count
        if (limit.count < this.MAX_SCANS_PER_MINUTE) {
            limit.count++;
            return true;
        }

        // Rate limit exceeded
        return false;
    }

    /**
     * Get remaining scans for identifier
     */
    getRemainingScans(identifier: string = 'default'): number {
        const limit = this.scanLimits.get(identifier);
        if (!limit || Date.now() > limit.resetTime) {
            return this.MAX_SCANS_PER_MINUTE;
        }
        return Math.max(0, this.MAX_SCANS_PER_MINUTE - limit.count);
    }

    /**
     * Get time until reset (in seconds)
     */
    getTimeUntilReset(identifier: string = 'default'): number {
        const limit = this.scanLimits.get(identifier);
        if (!limit || Date.now() > limit.resetTime) {
            return 0;
        }
        return Math.ceil((limit.resetTime - Date.now()) / 1000);
    }

    /**
     * Reset limits for identifier
     */
    reset(identifier: string = 'default'): void {
        this.scanLimits.delete(identifier);
    }

    /**
     * Clear all limits
     */
    clearAll(): void {
        this.scanLimits.clear();
    }
}

// Export singleton instance
export const rateLimitService = new RateLimitService();
