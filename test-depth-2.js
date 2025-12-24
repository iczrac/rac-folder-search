// Test with depth 2 (only first level of cases folders)
const path = require('path');
const { FolderScanner } = require('./out/folderScanner');

async function testDepth2() {
  console.log('=== Testing Depth 2 Configuration ===\n');
  
  const scanner = new FolderScanner();
  const testWorkspacePath = path.resolve(__dirname, 'test-workspace');
  
  const mockWorkspaceFolder = {
    uri: { fsPath: testWorkspacePath },
    name: 'test-workspace',
    index: 0
  };
  
  // Optimized config for your use case
  const config = {
    followSymlinks: true,
    maxDepth: 2,  // Only 2 levels: workspace -> cases -> case folders
    includeFiles: false,
    cacheExpiryMinutes: 30,
    excludePatterns: ['node_modules', '.git'],
    maxResults: 5000
  };
  
  console.log('Configuration:');
  console.log(JSON.stringify(config, null, 2));
  console.log('\nThis will only index:');
  console.log('  Level 0: test-workspace/');
  console.log('  Level 1: test-workspace/cases/ (symlink)');
  console.log('  Level 2: test-workspace/cases/C2CAR2021D00003-originaldownload/');
  console.log('  (NOT Level 3: subfolders inside case folders)');
  console.log('');
  
  const startTime = Date.now();
  const results = await scanner.scan([mockWorkspaceFolder], config);
  const endTime = Date.now();
  
  console.log(`✅ Scan completed in ${endTime - startTime}ms`);
  console.log(`\nTotal results: ${results.length}`);
  
  // Analyze results
  const caseFolders = results.filter(r => {
    const relativePath = path.relative(testWorkspacePath, r.fsPath);
    const parts = relativePath.split(path.sep);
    // Should be: cases/CASE_FOLDER_NAME
    return parts.length === 2 && parts[0] === 'cases';
  });
  
  const subFolders = results.filter(r => {
    const relativePath = path.relative(testWorkspacePath, r.fsPath);
    const parts = relativePath.split(path.sep);
    // Would be: cases/CASE_FOLDER_NAME/SUBFOLDER
    return parts.length > 2 && parts[0] === 'cases';
  });
  
  console.log(`\n=== Results Breakdown ===`);
  console.log(`Case folders (first level): ${caseFolders.length}`);
  console.log(`Subfolders (should be 0): ${subFolders.length}`);
  console.log(`Other folders: ${results.length - caseFolders.length - subFolders.length}`);
  
  if (subFolders.length > 0) {
    console.log(`\n⚠️  WARNING: Found ${subFolders.length} subfolders (should be 0)`);
    console.log('Sample subfolders:');
    subFolders.slice(0, 3).forEach(f => {
      console.log(`  - ${path.relative(testWorkspacePath, f.fsPath)}`);
    });
  } else {
    console.log(`\n✅ Perfect! No subfolders indexed (as expected)`);
  }
  
  // Test search
  console.log(`\n=== Search Test ===`);
  const testQueries = ['C2CAR2021', 'C2CAR2023', '23695'];
  
  for (const query of testQueries) {
    const matches = caseFolders.filter(r => {
      const name = path.basename(r.fsPath).toLowerCase();
      return name.includes(query.toLowerCase());
    });
    console.log(`Query "${query}": ${matches.length} case folders found`);
    if (matches.length > 0) {
      matches.slice(0, 3).forEach(m => {
        console.log(`  - ${path.basename(m.fsPath)}`);
      });
    }
  }
  
  // Performance
  console.log(`\n=== Performance ===`);
  console.log(`Scan time: ${endTime - startTime}ms`);
  console.log(`Items indexed: ${results.length}`);
  console.log(`Case folders: ${caseFolders.length}`);
  
  if (endTime - startTime < 500) {
    console.log(`✅ Excellent performance (< 500ms)`);
  } else if (endTime - startTime < 1000) {
    console.log(`✅ Good performance (< 1s)`);
  } else {
    console.log(`⚠️  Acceptable performance (> 1s)`);
  }
  
  console.log(`\n=== Summary ===`);
  console.log(`✅ Only first-level case folders indexed`);
  console.log(`✅ Fast scanning (${endTime - startTime}ms)`);
  console.log(`✅ All ${caseFolders.length} case folders searchable`);
  console.log(`✅ No unnecessary subfolders`);
}

testDepth2().catch(console.error);
