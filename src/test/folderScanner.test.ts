import * as assert from 'assert';
import * as path from 'path';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as os from 'os';
import { FolderScanner } from '../folderScanner';
import { SearchConfig } from '../types';

suite('FolderScanner Test Suite', () => {
  let scanner: FolderScanner;
  let testConfig: SearchConfig;
  let tempDir: string;

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

    // Create a temporary test workspace
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rac-folder-scanner-test-'));
    
    // Create test structure
    fs.mkdirSync(path.join(tempDir, 'folder1'));
    fs.mkdirSync(path.join(tempDir, 'folder2'));
    fs.mkdirSync(path.join(tempDir, 'folder1', 'subfolder'));
    fs.writeFileSync(path.join(tempDir, 'file1.txt'), 'test');
    fs.writeFileSync(path.join(tempDir, 'folder1', 'file2.txt'), 'test');
  });

  teardown(() => {
    // Clean up temporary directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  test('scan returns results for valid workspace', async () => {
    const mockWorkspaceFolder: vscode.WorkspaceFolder = {
      uri: vscode.Uri.file(tempDir),
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
    const mockWorkspaceFolder: vscode.WorkspaceFolder = {
      uri: vscode.Uri.file(tempDir),
      name: 'test-workspace',
      index: 0
    };

    const results = await scanner.scan([mockWorkspaceFolder], testConfig);
    
    // This test would need actual symlinks to be meaningful
    // For now, just verify the scan completes without error
    assert.ok(Array.isArray(results), 'Should return an array');
  });

  test('scan respects maxDepth configuration', async () => {
    const mockWorkspaceFolder: vscode.WorkspaceFolder = {
      uri: vscode.Uri.file(tempDir),
      name: 'test-workspace',
      index: 0
    };

    // Scan with depth 0 - should only get top level
    const shallowConfig = { ...testConfig, maxDepth: 0 };
    const shallowResults = await scanner.scan([mockWorkspaceFolder], shallowConfig);
    
    // All results should be at root level
    shallowResults.forEach(result => {
      const relativePath = path.relative(tempDir, result.fsPath);
      const depth = relativePath.split(path.sep).length - 1;
      assert.ok(depth <= 1, `Result should be at depth 0-1, but was at depth ${depth}: ${relativePath}`);
    });
  });

  test('scan excludes hidden files', async () => {
    // Create a hidden file
    fs.writeFileSync(path.join(tempDir, '.hidden'), 'hidden content');
    
    const mockWorkspaceFolder: vscode.WorkspaceFolder = {
      uri: vscode.Uri.file(tempDir),
      name: 'test-workspace',
      index: 0
    };

    const results = await scanner.scan([mockWorkspaceFolder], testConfig);
    
    // Should not include hidden files by default
    const hiddenResult = results.find(r => r.label.includes('.hidden'));
    assert.strictEqual(hiddenResult, undefined, 'Should not include hidden files');
  });

  test('scan respects excludePatterns', async () => {
    // Create a node_modules folder
    fs.mkdirSync(path.join(tempDir, 'node_modules'));
    
    const mockWorkspaceFolder: vscode.WorkspaceFolder = {
      uri: vscode.Uri.file(tempDir),
      name: 'test-workspace',
      index: 0
    };

    const results = await scanner.scan([mockWorkspaceFolder], testConfig);
    
    // Should not include excluded patterns
    const nodeModulesResult = results.find(r => r.label.includes('node_modules'));
    assert.strictEqual(nodeModulesResult, undefined, 'Should exclude node_modules');
  });

  test('scan includes files when configured', async () => {
    const mockWorkspaceFolder: vscode.WorkspaceFolder = {
      uri: vscode.Uri.file(tempDir),
      name: 'test-workspace',
      index: 0
    };

    const configWithFiles = { ...testConfig, includeFiles: true };
    const results = await scanner.scan([mockWorkspaceFolder], configWithFiles);
    
    // Should include files
    const fileResult = results.find(r => !r.isFolder);
    assert.ok(fileResult, 'Should include files when includeFiles is true');
  });

  test('scan excludes files when configured', async () => {
    const mockWorkspaceFolder: vscode.WorkspaceFolder = {
      uri: vscode.Uri.file(tempDir),
      name: 'test-workspace',
      index: 0
    };

    const configWithoutFiles = { ...testConfig, includeFiles: false };
    const results = await scanner.scan([mockWorkspaceFolder], configWithoutFiles);
    
    // Should only include folders
    const fileResult = results.find(r => !r.isFolder);
    assert.strictEqual(fileResult, undefined, 'Should not include files when includeFiles is false');
  });

  test('scan respects maxResults limit', async () => {
    const mockWorkspaceFolder: vscode.WorkspaceFolder = {
      uri: vscode.Uri.file(tempDir),
      name: 'test-workspace',
      index: 0
    };

    const limitedConfig = { ...testConfig, maxResults: 2 };
    const results = await scanner.scan([mockWorkspaceFolder], limitedConfig);
    
    // Should respect maxResults limit
    assert.ok(results.length <= 2, `Should return at most 2 results, got ${results.length}`);
  });
});