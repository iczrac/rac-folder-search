// Simple test runner for unit tests without VS Code
const Mocha = require('mocha');
const path = require('path');
const { glob } = require('glob');

const mocha = new Mocha({
  ui: 'tdd',
  color: true,
  timeout: 5000
});

// Find all unit test files
glob('out/test/unit/**/*.test.js', { cwd: __dirname })
  .then(files => {
    console.log(`Found ${files.length} test files`);
    
    files.forEach(file => {
      console.log(`Adding test: ${file}`);
      mocha.addFile(path.resolve(__dirname, file));
    });

    // Run tests
    mocha.run(failures => {
      process.exitCode = failures ? 1 : 0;
    });
  })
  .catch(err => {
    console.error('Error finding test files:', err);
    process.exit(1);
  });
