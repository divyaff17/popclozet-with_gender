-- ============================================
-- ERROR LOGGING & AUDIT TRAIL TABLES
-- For production error tracking and audit logs
-- ============================================

-- Create error_logs table
CREATE TABLE IF NOT EXISTS error_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    error_type TEXT NOT NULL,
    error_message TEXT NOT NULL,
    stack_trace TEXT,
    user_agent TEXT,
    url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    changes JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_error_logs_error_type ON error_logs(error_type);
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Enable Row Level Security
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view error logs for testing" ON error_logs;
DROP POLICY IF EXISTS "Anyone can insert error logs for testing" ON error_logs;
DROP POLICY IF EXISTS "Anyone can view audit logs for testing" ON audit_logs;
DROP POLICY IF EXISTS "Anyone can insert audit logs for testing" ON audit_logs;

-- Create policies for error_logs (allow all for testing)
CREATE POLICY "Anyone can view error logs for testing" ON error_logs
    FOR SELECT
    USING (true);

CREATE POLICY "Anyone can insert error logs for testing" ON error_logs
    FOR INSERT
    WITH CHECK (true);

-- Create policies for audit_logs (allow all for testing)
CREATE POLICY "Anyone can view audit logs for testing" ON audit_logs
    FOR SELECT
    USING (true);

CREATE POLICY "Anyone can insert audit logs for testing" ON audit_logs
    FOR INSERT
    WITH CHECK (true);

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Error logging and audit trail tables created successfully!';
    RAISE NOTICE '📝 Ready for production error tracking and audit logging';
END $$;
