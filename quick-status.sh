#!/bin/bash
# Quick status check - run from anywhere

echo "════════════════════════════════════════════════════════════════"
echo "   MAX BOOSTER BURN-IN TEST - QUICK STATUS"
echo "   $(date '+%Y-%m-%d %H:%M:%S')"
echo "════════════════════════════════════════════════════════════════"
echo ""

echo "📊 BURN-IN TEST PROGRESS:"
echo "────────────────────────────────────────────────────────────────"
tail -15 /tmp/logs/Burn-in_Test_*.log 2>/dev/null || echo "  Test not started yet"
echo ""

echo "💾 MEMORY STATUS:"
echo "────────────────────────────────────────────────────────────────"
curl -s http://localhost:5000/api/system/memory | jq -r '
  "  Heap: \(.current.heapUsedMB)MB / \(.thresholds.warningMB)MB (warning)",
  "  RSS:  \(.current.rssMB)MB",
  "  Peak: \(.trend.maxHeapUsedMB)MB"
'
echo ""

echo "🔄 QUEUE STATUS:"
echo "────────────────────────────────────────────────────────────────"
curl -s http://localhost:5000/api/monitoring/queue-metrics | jq -r '
  if .metrics and (.metrics | length > 0) then
    .metrics[] | "  \(.queueName): \(.waiting) waiting, \(.failed) failed, paused=\(.paused)"
  else
    "  No queues active"
  end
'
echo ""

echo "✅ SYSTEM HEALTH:"
echo "────────────────────────────────────────────────────────────────"
curl -s http://localhost:5000/api/monitoring/system-health | jq -r '
  "  Status: \(if .healthy then "✅ HEALTHY" else "❌ UNHEALTHY" end)"
'
echo ""
echo "════════════════════════════════════════════════════════════════"
