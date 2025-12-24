// Diagnostic script to check why some folders are not found
const path = require('path');
const fs = require('fs');
const { FolderScanner } = require('./out/folderScanner');

async function diagnose() {
  console.log('=== Folder Search Diagnostic Tool ===\n');
  
  const scanner = new FolderScanner();
  const testWorkspacePath = path.resolve(__dirname, 'test-workspace');
  
  const mockWorkspaceFolder = {
    uri: { fsPath: testWorkspacePath },
    name: 'test-workspace',
    index: 0
  };
  
  // Test with different configurations
  const configs = [
    {
      name: 'Default Config',
      config: {
        followSymlinks: true,
        maxDepth: 10,
        includeFiles: false,
        cacheExpiryMinutes: 10,
        excludePatterns: ['node_modules', '.git'],
        maxResults: 10000
      }
    },
    {
      name: 'Limited Depth',
      config: {
        followSymlinks: true,
        maxDepth: 3,
        includeFiles: false,
        cacheExpiryMinutes: 10,
        excludePatterns: ['node_modules', '.git'],
        maxResults: 10000
      }
    },
    {
      name: 'No Symlinks',
      config: {
        followSymlinks: false,
        maxDepth: 10,
        includeFiles: false,
        cacheExpiryMinutes: 10,
        excludePatterns: ['node_modules', '.git'],
        maxResults: 10000
      }
    }
  ];
  
  for (const { name, config } of configs) {
    console.log(`\n--- Testing: ${name} ---`);
    console.log(`Config: maxDepth=${config.maxDepth}, followSymlinks=${config.followSymlinks}, maxResults=${config.maxResults}`);
    
    const startTime = Date.now();
    const results = await scanner.scan([mockWorkspaceFolder], config);
    const endTime = Date.now();
    
    const caseFolders = results.filter(r => r.fsPath.includes('cases/'));
    const symlinks = results.filter(r => r.isSymlink);
    
    console.log(`Scan time: ${endTime - startTime}ms`);
    console.log(`Total results: ${results.length}`);
    console.log(`Case folders: ${caseFolders.length}`);
    console.log(`Symlinks: ${symlinks.length}`);
    
    if (results.length >= config.maxResults) {
      console.log(`⚠️  WARNING: Hit maxResults limit! Some folders may be missing.`);
    }
  }
  
  // Check actual case folder count
  console.log('\n--- Actual Case Folder Count ---');
  const casesPath = path.join(testWorkspacePath, 'cases');
  try {
    const actualCases = fs.readdirSync(casesPath);
    console.log(`Actual case folders in directory: ${actualCases.length}`);
    
    // Sample some case names
    console.log('\nSample case folders:');
    actualCases.slice(0, 10).forEach((name, i) => {
      console.log(`  ${i + 1}. ${name}`);
    });
    
    // Check for specific patterns
    const c2carCases = actualCases.filter(name => name.includes('C2CAR'));
    console.log(`\nC2CAR cases: ${c2carCases.length}`);
    c2carCases.slice(0, 5).forEach((name, i) => {
      console.log(`  ${i + 1}. ${name}`);
    });
    
  } catch (error) {
    console.error('Error reading cases directory:', error.message);
  }
  
  // Test search functionality
  console.log('\n--- Search Test ---');
  const config = {
    followSymlinks: true,
    maxDepth: 10,
    includeFiles: false,
    cacheExpiryMinutes: 10,
    excludePatterns: ['node_modules', '.git'],
    maxResults: 10000
  };
  
  const results = await scanner.scan([mockWorkspaceFolder], config);
  
  const testQueries = ['C2CAR2021', 'C2CAR2023', '23695', '26954'];
  
  for (const query of testQueries) {
    const matches = results.filter(r => {
      const name = path.basename(r.fsPath).toLowerCase();
      return name.includes(query.toLowerCase());
    });
    console.log(`Query "${query}": ${matches.length} matches`);
    if (matches.length > 0) {
      matches.slice(0, 3).forEach(m => {
        console.log(`  - ${path.basename(m.fsPath)}`);
      });
    }
  }
  
  // Check if we're hitting limits
  console.log('\n--- Limit Analysis ---');
  const caseFolders = results.filter(r => r.fsPath.includes('cases/'));
  const otherFolders = results.filter(r => !r.fsPath.includes('cases/'));
  
  console.log(`Case folders indexed: ${caseFolders.length}`);
  console.log(`Other folders indexed: ${otherFolders.length}`);
  console.log(`Total indexed: ${results.length}`);
  console.log(`maxResults setting: ${config.maxResults}`);
  
  if (caseFolders.length < 1715) {
    console.log(`\n⚠️  ISSUE FOUND: Only ${caseFolders.length} out of 1715 case folders were indexed!`);
    console.log(`Possible reasons:`);
    console.log(`  1. Hit maxResults limit (${config.maxResults})`);
    console.log(`  2. Depth limit too low`);
    console.log(`  3. Some folders excluded by patterns`);
    console.log(`\nRecommendation: Increase maxResults to at least 2000`);
  } else {
    console.log(`\n✅ All case folders appear to be indexed`);
  }
}

diagnose().catch(console.error);
