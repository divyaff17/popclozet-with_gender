-- ============================================
-- QR SCAN TRACKING & DEVICE CAPABILITIES SYSTEM
-- Tracks all QR scan events with metadata
-- Supports offline scanning with sync
-- ============================================

-- Create QR scan logs table
CREATE TABLE IF NOT EXISTS qr_scan_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    qr_code_data TEXT NOT NULL,
    scan_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_agent TEXT,
    is_online BOOLEAN DEFAULT true,
    synced_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create device capabilities table
CREATE TABLE IF NOT EXISTS device_capabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL,
    has_camera BOOLEAN DEFAULT false,
    has_local_storage BOOLEAN DEFAULT false,
    has_indexeddb BOOLEAN DEFAULT false,
    user_agent TEXT,
    platform TEXT,
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_qr_scan_logs_product_id ON qr_scan_logs(product_id);
CREATE INDEX IF NOT EXISTS idx_qr_scan_logs_scan_timestamp ON qr_scan_logs(scan_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_qr_scan_logs_is_online ON qr_scan_logs(is_online);
CREATE INDEX IF NOT EXISTS idx_qr_scan_logs_synced_at ON qr_scan_logs(synced_at);
CREATE INDEX IF NOT EXISTS idx_device_capabilities_session_id ON device_capabilities(session_id);
CREATE INDEX IF NOT EXISTS idx_device_capabilities_detected_at ON device_capabilities(detected_at DESC);

-- Enable Row Level Security
ALTER TABLE qr_scan_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_capabilities ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view scan logs for testing" ON qr_scan_logs;
DROP POLICY IF EXISTS "Anyone can insert scan logs for testing" ON qr_scan_logs;
DROP POLICY IF EXISTS "Anyone can view device capabilities for testing" ON device_capabilities;
DROP POLICY IF EXISTS "Anyone can insert device capabilities for testing" ON device_capabilities;

-- Create policies for qr_scan_logs (allow all for testing)
CREATE POLICY "Anyone can view scan logs for testing" ON qr_scan_logs
    FOR SELECT
    USING (true);

CREATE POLICY "Anyone can insert scan logs for testing" ON qr_scan_logs
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Anyone can update scan logs for testing" ON qr_scan_logs
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Create policies for device_capabilities (allow all for testing)
CREATE POLICY "Anyone can view device capabilities for testing" ON device_capabilities
    FOR SELECT
    USING (true);

CREATE POLICY "Anyone can insert device capabilities for testing" ON device_capabilities
    FOR INSERT
    WITH CHECK (true);

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ QR scan tracking tables created successfully!';
    RAISE NOTICE '✅ Device capabilities tracking enabled';
    RAISE NOTICE '📝 Ready for offline QR scanning with sync support';
END $$;
