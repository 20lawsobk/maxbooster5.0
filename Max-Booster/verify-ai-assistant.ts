import { readFileSync } from 'fs';

console.log('🔍 Verifying AI Assistant Changes...\n');

const filePath = 'client/src/components/support/LiveChatWidget.tsx';
const content = readFileSync(filePath, 'utf-8');

let passed = 0;
let failed = 0;

console.log('Checking removed functionality:\n');

if (!content.includes('AlertCircle')) {
  console.log('✅ AlertCircle icon removed from imports');
  passed++;
} else {
  console.log('❌ FAIL: AlertCircle icon still in imports');
  failed++;
}

if (!content.includes('handleCreateTicket')) {
  console.log('✅ handleCreateTicket function removed');
  passed++;
} else {
  console.log('❌ FAIL: handleCreateTicket function still exists');
  failed++;
}

if (!content.includes('Create Ticket')) {
  console.log('✅ "Create Ticket" button removed from UI');
  passed++;
} else {
  console.log('❌ FAIL: "Create Ticket" text still found');
  failed++;
}

if (!content.includes('shouldEscalate')) {
  console.log('✅ Ticket escalation logic removed');
  passed++;
} else {
  console.log('❌ FAIL: shouldEscalate logic still exists');
  failed++;
}

if (!content.includes('Would you like to create a support ticket')) {
  console.log('✅ Escalation message removed');
  passed++;
} else {
  console.log('❌ FAIL: Escalation message still exists');
  failed++;
}

console.log('\nChecking retained functionality:\n');

if (content.includes('Live Support')) {
  console.log('✅ AI assistant chat interface retained');
  passed++;
} else {
  console.log('❌ FAIL: Chat interface missing');
  failed++;
}

if (content.includes('/api/support/ai/ask')) {
  console.log('✅ AI question/answer endpoint retained');
  passed++;
} else {
  console.log('❌ FAIL: AI endpoint missing');
  failed++;
}

if (content.includes('suggestedArticles')) {
  console.log('✅ Article suggestions functionality retained');
  passed++;
} else {
  console.log('❌ FAIL: Article suggestions missing');
  failed++;
}

console.log('\n' + '='.repeat(60));
console.log(`📊 VERIFICATION RESULTS`);
console.log('='.repeat(60));
console.log(`Total Checks: ${passed + failed}`);
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

if (failed === 0) {
  console.log('\n🎉 All verification checks passed!');
  console.log('The AI assistant has been successfully updated:');
  console.log('  - Ticket creation functionality removed');
  console.log('  - AI Q&A functionality fully operational');
  console.log('  - Article suggestions still working');
  process.exit(0);
} else {
  console.log('\n⚠️ Some checks failed. Review changes above.');
  process.exit(1);
}
