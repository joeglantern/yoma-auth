/**
 * Test for the Kenyan phone number formatter
 */

const { formatKenyanPhoneNumber } = require('./utils/phoneFormatter');

// Test cases
const testCases = [
  // International format
  { input: '+254722123456', expected: '+254722123456', description: 'Already in international format' },
  
  // Standard Kenya formats
  { input: '0722123456', expected: '+254722123456', description: '10-digit with leading 0' },
  { input: '0733123456', expected: '+254733123456', description: '10-digit with 0 (Safaricom)' },
  { input: '0712123456', expected: '+254712123456', description: '10-digit with 0 (Safaricom)' },
  { input: '0110123456', expected: '+254110123456', description: '10-digit with 0 (Airtel)' },
  { input: '0738123456', expected: '+254738123456', description: '10-digit with 0 (Telkom)' },
  
  // Without leading 0
  { input: '722123456', expected: '+254722123456', description: '9-digit without leading 0' },
  { input: '733123456', expected: '+254733123456', description: '9-digit without leading 0' },
  
  // With spaces or formatting
  { input: '+254 722 123 456', expected: '+254722123456', description: 'With spaces' },
  { input: '0722-123-456', expected: '+254722123456', description: 'With dashes' },
  
  // Other formats
  { input: '254722123456', expected: '+254722123456', description: 'With country code but no plus' },
  
  // Edge cases
  { input: '', expected: '', description: 'Empty string' },
  { input: null, expected: null, description: 'Null' },
  { input: '12345', expected: '12345', description: 'Too short, invalid format' },
  { input: 'abcdefghij', expected: 'abcdefghij', description: 'Non-numeric' }
];

// Run tests
console.log('Testing Kenyan Phone Number Formatter');
console.log('=====================================');

let passCount = 0;
let failCount = 0;

testCases.forEach((test, index) => {
  const result = formatKenyanPhoneNumber(test.input);
  const passed = result === test.expected;
  
  if (passed) {
    passCount++;
    console.log(`✓ Test #${index + 1}: ${test.description}`);
  } else {
    failCount++;
    console.log(`❌ Test #${index + 1}: ${test.description}`);
    console.log(`   Input:    "${test.input}"`);
    console.log(`   Expected: "${test.expected}"`);
    console.log(`   Got:      "${result}"`);
  }
});

console.log('\nSummary:');
console.log(`Passed: ${passCount}/${testCases.length}`);
console.log(`Failed: ${failCount}/${testCases.length}`);

if (failCount === 0) {
  console.log('\n✓ All tests passed!');
} else {
  console.log('\n❌ Some tests failed!');
  process.exit(1);
} 