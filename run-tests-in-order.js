const { execSync } = require('child_process');

// List your test files in the order you want them to run
const testFiles = [
  'test/client.test.ts',
  //'test/generate.test.ts',
  // 'test/compare.test.ts',
  //'test/refine.test.ts',
  //  'test/validate.test.ts',
  'test/correct.test.ts'
];

for (const file of testFiles) {
  if (file.startsWith('//')) continue; // skip commented out
  console.log(`\n=== Running ${file} ===`);
  try {
    execSync(`npx jest --runInBand ${file} --verbose`, { stdio: 'inherit' });
  } catch (err) {
    console.error(`Test failed in ${file}`);
    process.exit(1);
  }
} 