import * as assert from 'assert';
import * as path from 'path';
import * as vscode from 'vscode';
import { FolderScanner } from '../folderScanner';
import { SearchConfig } from '../types';

suite('FolderScanner Test Suite', () => {
  let scanner: FolderScanner;
  let testConfig: SearchConfig;

  setup(() => {
    scanner = new FolderScanner();
    testConfig = {
      followSymlinks: true,
      maxDepth: 10,
      includeFiles: true,
      cacheExpiryMinutes: 10,
      excludePatterns: ['node_modules', '.git'],
      maxResults: 10000
    };
  });

  test('scan returns results for valid workspace', async () => {
    // Create a mock workspace folder
    const testWorkspacePath = path.resolve(__dirname, '../../test-workspace');
    const mockWorkspaceFolder: vscode.WorkspaceFolder = {
      uri: vscode.Uri.file(testWorkspacePath),
      name: 'test-workspace',
      index: 0
    };

    const results = await scanner.scan([mockWorkspaceFolder], testConfig);
    
    // Should have some results
    assert.ok(results.length > 0, 'Should return at least one result');
    
    // Check that results have required properties
    results.forEach(result => {
      assert.ok(result.label, 'Result should have label');
      assert.ok(result.fsPath, 'Result should have fsPath');
      assert.strictEqual(typeof result.isFolder, 'boolean', 'isFolder should be boolean');
      assert.strictEqual(typeof result.isSymlink, 'boolean', 'isSymlink should be boolean');
    });
  });

  test('scan follows symlinks when configured', async () => {
    const testWorkspacePath = path.resolve(__dirname, '../../test-workspace');
    const mockWorkspaceFolder: vscode.WorkspaceFolder = {
      uri: vscode.Uri.file(testWorkspacePath),
      name: 'test-workspace',
      index: 0
    };

    const results = await scanner.scan([mockWorkspaceFolder], testConfig);
    
    // Look for symlink folder
    const symlinkResult = results.find(r => r.label.includes('symlink-folder'));
    
    if (symlinkResult) {
      assert.ok(symlinkResult.label.includes('🔗'), 'Symlink should be marked with 🔗');
      assert.strictEqual(symlinkResult.isSymlink, true, 'isSymlink should be true');
    }
  });

  test('scan respects maxDepth configuration', async () => {
    const testWorkspacePath = path.resolve(__dirname, '../../test-workspace');
    const mockWorkspaceFolder: vscode.WorkspaceFolder = {
      uri: vscode.Uri.file(testWorkspacePath),
      name: 'test-workspace',
      index: 0
    };

    // Scan with depth 0 - should only get top level
    const shallowConfig = { ...testConfig, maxDepth: 0 };
    const shallowResults = await scanner.scan([mockWorkspaceFolder], shallowConfig);
    
    // All results should be at root level
    shallowResults.forEach(result => {
      const relativePath = path.relative(testWorkspacePath, result.fsPath);
      const depth = relativePath.split(path.sep).length - 1;
      assert.ok(depth <= 1, `Result depth ${depth} should be <= 1 for maxDepth 0`);
    });
  });

  test('scan excludes hidden files', async () => {
    const testWorkspacePath = path.resolve(__dirname, '../../test-workspace');
    const mockWorkspaceFolder: vscode.WorkspaceFolder = {
      uri: vscode.Uri.file(testWorkspacePath),
      name: 'test-workspace',
      index: 0
    };

    const results = await scanner.scan([mockWorkspaceFolder], testConfig);
    
    // No results should start with '.'
    results.forEach(result => {
      const basename = path.basename(result.fsPath);
      assert.ok(!basename.startsWith('.'), `Hidden file/folder found: ${basename}`);
    });
  });

  test('scan respects excludePatterns', async () => {
    const testWorkspacePath = path.resolve(__dirname, '../../test-workspace');
    const mockWorkspaceFolder: vscode.WorkspaceFolder = {
      uri: vscode.Uri.file(testWorkspacePath),
      name: 'test-workspace',
      index: 0
    };

    const configWithExcludes = {
      ...testConfig,
      excludePatterns: ['folder1', 'node_modules']
    };

    const results = await scanner.scan([mockWorkspaceFolder], configWithExcludes);
    
    // Should not contain 'folder1'
    const hasFolder1 = results.some(r => path.basename(r.fsPath) === 'folder1');
    assert.strictEqual(hasFolder1, false, 'folder1 should be excluded');
  });

  test('scan includes files when configured', async () => {
    const testWorkspacePath = path.resolve(__dirname, '../../test-workspace');
    const mockWorkspaceFolder: vscode.WorkspaceFolder = {
      uri: vscode.Uri.file(testWorkspacePath),
      name: 'test-workspace',
      index: 0
    };

    const results = await scanner.scan([mockWorkspaceFolder], testConfig);
    
    // Should have at least one file
    const hasFiles = results.some(r => !r.isFolder);
    assert.ok(hasFiles, 'Should include files when includeFiles is true');
  });

  test('scan excludes files when configured', async () => {
    const testWorkspacePath = path.resolve(__dirname, '../../test-workspace');
    const mockWorkspaceFolder: vscode.WorkspaceFolder = {
      uri: vscode.Uri.file(testWorkspacePath),
      name: 'test-workspace',
      index: 0
    };

    const configNoFiles = { ...testConfig, includeFiles: false };
    const results = await scanner.scan([mockWorkspaceFolder], configNoFiles);
    
    // Should only have folders
    results.forEach(result => {
      assert.strictEqual(result.isFolder, true, 'All results should be folders');
    });
  });

  test('scan respects maxResults limit', async () => {
    const testWorkspacePath = path.resolve(__dirname, '../../test-workspace');
    const mockWorkspaceFolder: vscode.WorkspaceFolder = {
      uri: vscode.Uri.file(testWorkspacePath),
      name: 'test-workspace',
      index: 0
    };

    const configWithLimit = { ...testConfig, maxResults: 3 };
    const results = await scanner.scan([mockWorkspaceFolder], configWithLimit);
    
    assert.ok(results.length <= 3, `Should respect maxResults limit (got ${results.length})`);
  });
});
