#!/usr/bin/env node

console.log('🔥 SIMPLE TEST: Script started');
console.log('🔥 SIMPLE TEST: Node version:', process.version);
console.log('🔥 SIMPLE TEST: Platform:', process.platform);
console.log('🔥 SIMPLE TEST: Working directory:', process.cwd());
console.log('🔥 SIMPLE TEST: Arguments:', process.argv);

setTimeout(() => {
  console.log('🔥 SIMPLE TEST: Script completed successfully');
  process.exit(0);
}, 100);