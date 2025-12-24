// Manual test script to verify scanner functionality
const path = require('path');
const { FolderScanner } = require('./out/folderScanner');

async function runManualTest() {
  console.log('=== Manual Scanner Test ===\n');
  
  const scanner = new FolderScanner();
  const testWorkspacePath = path.resolve(__dirname, 'test-workspace');
  
  // Mock workspace folder
  const mockWorkspaceFolder = {
    uri: { fsPath: testWorkspacePath },
    name: 'test-workspace',
    index: 0
  };
  
  const config = {
    followSymlinks: true,
    maxDepth: 10,
    includeFiles: true,
    cacheExpiryMinutes: 10,
    excludePatterns: ['node_modules', '.git'],
    maxResults: 10000
  };
  
  console.log('Test Configuration:');
  console.log(JSON.stringify(config, null, 2));
  console.log('\nScanning workspace:', testWorkspacePath);
  console.log('---\n');
  
  try {
    const results = await scanner.scan([mockWorkspaceFolder], config);
    
    console.log(`Found ${results.length} items:\n`);
    
    results.forEach((result, index) => {
      const type = result.isFolder ? 'FOLDER' : 'FILE';
      const symlink = result.isSymlink ? ' (SYMLINK)' : '';
      console.log(`${index + 1}. [${type}${symlink}] ${result.label}`);
      console.log(`   Path: ${result.fsPath}`);
      console.log(`   Description: ${result.description}`);
      console.log('');
    });
    
    // Check for symlink
    const symlinkResults = results.filter(r => r.isSymlink);
    console.log(`\n=== Symlink Test ===`);
    console.log(`Found ${symlinkResults.length} symlink(s)`);
    symlinkResults.forEach(r => {
      console.log(`  - ${r.label}`);
      console.log(`    Has 🔗 marker: ${r.label.includes('🔗')}`);
    });
    
    // Check folder vs file count
    const folders = results.filter(r => r.isFolder);
    const files = results.filter(r => !r.isFolder);
    console.log(`\n=== Summary ===`);
    console.log(`Total items: ${results.length}`);
    console.log(`Folders: ${folders.length}`);
    console.log(`Files: ${files.length}`);
    console.log(`Symlinks: ${symlinkResults.length}`);
    
    console.log('\n✅ Manual test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

runManualTest();
