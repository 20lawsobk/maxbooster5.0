#!/bin/bash

echo "🧪 Testing Max Booster Monitoring Systems"
echo "=========================================="
echo ""

# Get admin login (assuming you have an admin account)
echo "📝 Step 1: Login as admin and get session cookie"
echo "Run this in your browser console after logging in:"
echo "  document.cookie"
echo ""
read -p "Press Enter after you've logged in as admin..."

# Test metrics recording
echo ""
echo "📊 Step 2: Testing Metrics Recording"
curl -X POST http://localhost:5000/api/admin/metrics/test \
  -H "Content-Type: application/json" \
  -H "Cookie: YOUR_SESSION_COOKIE" \
  -d '{
    "metricName": "test.cpu.usage",
    "value": 45.5,
    "source": "test-server",
    "tags": {"environment": "test"}
  }'
echo ""
echo ""

# Get metrics
echo "📈 Step 3: Retrieving Recorded Metrics"
curl -X GET "http://localhost:5000/api/admin/metrics?metric=test.cpu.usage&period=1" \
  -H "Cookie: YOUR_SESSION_COOKIE"
echo ""
echo ""

# Create alert rule
echo "🚨 Step 4: Creating Alert Rule"
curl -X POST http://localhost:5000/api/admin/alerts/rules \
  -H "Content-Type: application/json" \
  -H "Cookie: YOUR_SESSION_COOKIE" \
  -d '{
    "name": "High CPU Usage",
    "metricName": "test.cpu.usage",
    "condition": "gt",
    "threshold": 80,
    "durationSecs": 60,
    "channels": {"email": true}
  }'
echo ""
echo ""

# Get email stats
echo "📧 Step 5: Getting Email Statistics"
curl -X GET "http://localhost:5000/api/admin/email/stats?days=30" \
  -H "Cookie: YOUR_SESSION_COOKIE"
echo ""
echo ""

# Test SendGrid webhook (simulation)
echo "📬 Step 6: Testing SendGrid Webhook (without signature - should fail in production)"
curl -X POST http://localhost:5000/api/webhooks/sendgrid \
  -H "Content-Type: application/json" \
  -d '[{
    "sg_message_id": "test-message-001",
    "email": "test@example.com",
    "event": "delivered",
    "timestamp": '$(date +%s)'
  }]'
echo ""
echo ""

echo "✅ Monitoring system tests completed!"
echo ""
echo "Next Steps:"
echo "1. Check database for recorded metrics: SELECT * FROM system_metrics LIMIT 5;"
echo "2. Check for email events: SELECT * FROM email_events LIMIT 5;"
echo "3. Check alert rules: SELECT * FROM alert_rules;"
echo "4. Configure SENDGRID_WEBHOOK_PUBLIC_KEY for production webhook verification"
