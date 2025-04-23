const { execSync } = require('child_process');

// List your test files in the order you want them to run
const testFiles = [
  'test/client.test.ts',
  //'test/compare.test.ts',
  'test/refine.test.ts',
  // 'test/other.test.ts', // Example: comment out to skip
];

for (const file of testFiles) {
  if (file.startsWith('//')) continue; // skip commented out
  console.log(`\n=== Running ${file} ===`);
  try {
    execSync(`npx jest --runInBand ${file}`, { stdio: 'inherit' });
  } catch (err) {
    console.error(`Test failed in ${file}`);
    process.exit(1);
  }
} 