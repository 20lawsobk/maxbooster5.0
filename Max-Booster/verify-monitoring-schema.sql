-- ============================================================================
-- MONITORING SYSTEM SCHEMA VERIFICATION SCRIPT
-- ============================================================================
-- Run this script to verify all monitoring tables were created correctly
-- Usage: psql $DATABASE_URL -f verify-monitoring-schema.sql

\echo '🔍 Verifying Monitoring System Database Schema'
\echo '=============================================='
\echo ''

-- Check if all tables exist
\echo '📊 Step 1: Checking if all monitoring tables exist...'
SELECT 
  table_name,
  CASE 
    WHEN table_name IN ('email_messages', 'email_events', 'system_metrics', 'alert_rules', 'alert_incidents') 
    THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('email_messages', 'email_events', 'system_metrics', 'alert_rules', 'alert_incidents')
ORDER BY table_name;

\echo ''
\echo '📋 Step 2: Checking email_messages table structure...'
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'email_messages'
ORDER BY ordinal_position;

\echo ''
\echo '📋 Step 3: Checking email_events table structure...'
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'email_events'
ORDER BY ordinal_position;

\echo ''
\echo '📋 Step 4: Checking system_metrics table structure...'
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'system_metrics'
ORDER BY ordinal_position;

\echo ''
\echo '📋 Step 5: Verifying unique index on system_metrics...'
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'system_metrics'
  AND indexname = 'system_metrics_unique_idx';

\echo ''
\echo '📋 Step 6: Checking alert_rules table structure...'
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'alert_rules'
ORDER BY ordinal_position;

\echo ''
\echo '📋 Step 7: Checking alert_incidents table structure...'
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'alert_incidents'
ORDER BY ordinal_position;

\echo ''
\echo '✅ Schema verification complete!'
\echo ''
\echo 'Next steps:'
\echo '  1. Run test-monitoring.sh to test the endpoints'
\echo '  2. Configure SENDGRID_WEBHOOK_PUBLIC_KEY for webhook verification'
\echo '  3. Test with real SendGrid webhook events'
