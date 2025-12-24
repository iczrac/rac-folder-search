// Test with real cases directory (1715+ folders)
const path = require('path');
const { FolderScanner } = require('./out/folderScanner');

async function testRealCases() {
  console.log('=== Testing with Real Cases Directory ===\n');
  
  const scanner = new FolderScanner();
  const testWorkspacePath = path.resolve(__dirname, 'test-workspace');
  
  const mockWorkspaceFolder = {
    uri: { fsPath: testWorkspacePath },
    name: 'test-workspace',
    index: 0
  };
  
  // Configuration optimized for large directory
  const config = {
    followSymlinks: true,
    maxDepth: 3,  // Limit depth for performance
    includeFiles: false,  // Only folders
    cacheExpiryMinutes: 30,
    excludePatterns: ['node_modules', '.git'],
    maxResults: 5000
  };
  
  console.log('Configuration:');
  console.log(JSON.stringify(config, null, 2));
  console.log('\nScanning workspace with cases symlink...');
  console.log('Expected: ~1715 case folders\n');
  
  const startTime = Date.now();
  
  try {
    const results = await scanner.scan([mockWorkspaceFolder], config);
    
    const endTime = Date.now();
    const scanTime = endTime - startTime;
    
    console.log(`\n✅ Scan completed in ${scanTime}ms (${(scanTime / 1000).toFixed(2)}s)`);
    console.log(`\nTotal items found: ${results.length}`);
    
    // Analyze results
    const folders = results.filter(r => r.isFolder);
    const files = results.filter(r => !r.isFolder);
    const symlinks = results.filter(r => r.isSymlink);
    const caseFolders = results.filter(r => r.fsPath.includes('cases/'));
    
    console.log(`\n=== Breakdown ===`);
    console.log(`Folders: ${folders.length}`);
    console.log(`Files: ${files.length}`);
    console.log(`Symlinks: ${symlinks.length}`);
    console.log(`Case folders (inside cases/): ${caseFolders.length}`);
    
    // Test search for specific case
    console.log(`\n=== Search Test ===`);
    const searchQuery = 'C2CAR2021';
    const matches = results.filter(r => {
      const name = path.basename(r.fsPath).toLowerCase();
      return name.includes(searchQuery.toLowerCase());
    });
    
    console.log(`Searching for "${searchQuery}"...`);
    console.log(`Found ${matches.length} matches:`);
    matches.slice(0, 10).forEach((m, i) => {
      console.log(`  ${i + 1}. ${path.basename(m.fsPath)}`);
    });
    if (matches.length > 10) {
      console.log(`  ... and ${matches.length - 10} more`);
    }
    
    // Performance check
    console.log(`\n=== Performance ===`);
    if (scanTime < 5000) {
      console.log(`✅ Scan time: ${scanTime}ms - EXCELLENT (< 5s target)`);
    } else if (scanTime < 10000) {
      console.log(`⚠️  Scan time: ${scanTime}ms - ACCEPTABLE (< 10s)`);
    } else {
      console.log(`❌ Scan time: ${scanTime}ms - SLOW (> 10s)`);
    }
    
    // Check if cases symlink was followed
    const casesSymlink = results.find(r => path.basename(r.fsPath) === 'cases');
    if (casesSymlink) {
      console.log(`\n✅ Cases symlink found and marked: ${casesSymlink.label}`);
      console.log(`   Has 🔗 marker: ${casesSymlink.label.includes('🔗')}`);
    }
    
    console.log(`\n✅ Test completed successfully!`);
    console.log(`\nThe extension can handle your ${caseFolders.length} case folders!`);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testRealCases();
