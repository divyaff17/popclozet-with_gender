import { supabase } from '@/integrations/supabase/client';

export interface ErrorLog {
    id?: string;
    errorType: string;
    errorMessage: string;
    stackTrace?: string;
    userAgent: string;
    url: string;
    metadata?: Record<string, any>;
    createdAt?: string;
}

export interface AuditLog {
    id?: string;
    action: string;
    userId?: string;
    resourceType: string;
    resourceId?: string;
    changes?: Record<string, any>;
    ipAddress?: string;
    userAgent: string;
    createdAt?: string;
}

class ErrorLoggingService {
    /**
     * Log an error to the database
     */
    async logError(
        errorType: string,
        errorMessage: string,
        error?: Error,
        metadata?: Record<string, any>
    ): Promise<void> {
        try {
            const errorLog: ErrorLog = {
                errorType,
                errorMessage,
                stackTrace: error?.stack,
                userAgent: navigator.userAgent,
                url: window.location.href,
                metadata: {
                    ...metadata,
                    timestamp: new Date().toISOString(),
                },
            };

            const { error: dbError } = await supabase
                .from('error_logs')
                .insert({
                    error_type: errorLog.errorType,
                    error_message: errorLog.errorMessage,
                    stack_trace: errorLog.stackTrace,
                    user_agent: errorLog.userAgent,
                    url: errorLog.url,
                    metadata: errorLog.metadata,
                });

            if (dbError) {
                console.error('Failed to log error to database:', dbError);
            } else {
                console.log('✅ Error logged to database');
            }
        } catch (err) {
            console.error('Error logging service failed:', err);
        }
    }

    /**
     * Log an audit event
     */
    async logAudit(
        action: string,
        resourceType: string,
        resourceId?: string,
        changes?: Record<string, any>
    ): Promise<void> {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            const auditLog: AuditLog = {
                action,
                userId: user?.id,
                resourceType,
                resourceId,
                changes,
                userAgent: navigator.userAgent,
            };

            const { error } = await supabase
                .from('audit_logs')
                .insert({
                    action: auditLog.action,
                    user_id: auditLog.userId,
                    resource_type: auditLog.resourceType,
                    resource_id: auditLog.resourceId,
                    changes: auditLog.changes,
                    user_agent: auditLog.userAgent,
                });

            if (error) {
                console.error('Failed to log audit event:', error);
            } else {
                console.log('✅ Audit event logged');
            }
        } catch (err) {
            console.error('Audit logging failed:', err);
        }
    }

    /**
     * Retry a failed operation with exponential backoff
     */
    async retryWithBackoff<T>(
        operation: () => Promise<T>,
        maxRetries: number = 3,
        baseDelay: number = 1000
    ): Promise<T> {
        let lastError: Error | undefined;

        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error as Error;

                if (attempt < maxRetries - 1) {
                    const delay = baseDelay * Math.pow(2, attempt);
                    console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }

        // Log the final failure
        await this.logError(
            'retry_failed',
            `Operation failed after ${maxRetries} retries`,
            lastError,
            { maxRetries, baseDelay }
        );

        throw lastError;
    }

    /**
     * Get recent errors
     */
    async getRecentErrors(limit: number = 50): Promise<ErrorLog[]> {
        try {
            const { data, error } = await supabase
                .from('error_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;

            return (data || []).map(row => ({
                id: row.id,
                errorType: row.error_type,
                errorMessage: row.error_message,
                stackTrace: row.stack_trace,
                userAgent: row.user_agent,
                url: row.url,
                metadata: row.metadata,
                createdAt: row.created_at,
            }));
        } catch (error) {
            console.error('Failed to get recent errors:', error);
            return [];
        }
    }

    /**
     * Get audit logs
     */
    async getAuditLogs(limit: number = 100): Promise<AuditLog[]> {
        try {
            const { data, error } = await supabase
                .from('audit_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;

            return (data || []).map(row => ({
                id: row.id,
                action: row.action,
                userId: row.user_id,
                resourceType: row.resource_type,
                resourceId: row.resource_id,
                changes: row.changes,
                ipAddress: row.ip_address,
                userAgent: row.user_agent,
                createdAt: row.created_at,
            }));
        } catch (error) {
            console.error('Failed to get audit logs:', error);
            return [];
        }
    }

    /**
     * Clear old error logs
     */
    async clearOldErrors(daysToKeep: number = 30): Promise<number> {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

            const { data, error } = await supabase
                .from('error_logs')
                .delete()
                .lt('created_at', cutoffDate.toISOString())
                .select();

            if (error) throw error;

            const deletedCount = data?.length || 0;
            console.log(`✅ Deleted ${deletedCount} old error logs`);
            return deletedCount;
        } catch (error) {
            console.error('Failed to clear old errors:', error);
            return 0;
        }
    }
}

// Export singleton instance
export const errorLoggingService = new ErrorLoggingService();
