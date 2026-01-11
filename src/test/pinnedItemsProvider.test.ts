import * as assert from 'assert';
import * as vscode from 'vscode';
import { PinnedItemsProvider, PinnedItem } from '../pinnedItemsProvider';
import { PinnedItemType, PinnedItemData } from '../types';

suite('PinnedItemsProvider', () => {
  let provider: PinnedItemsProvider;
  let context: vscode.ExtensionContext;
  let workspaceState: Map<string, unknown>;

  setup(() => {
    // Create a mock workspace state that actually stores data
    workspaceState = new Map();
    
    // Create a mock context
    context = {
      workspaceState: {
        get: (key: string, defaultValue?: unknown) => {
          return workspaceState.get(key) ?? defaultValue;
        },
        update: async (key: string, value: unknown) => {
          if (value === undefined) {
            workspaceState.delete(key);
          } else {
            workspaceState.set(key, value);
          }
        }
      }
    } as unknown as vscode.ExtensionContext;

    provider = new PinnedItemsProvider(context);
  });

  test('should pin a folder', () => {
    const fsPath = '/test/folder';
    const label = 'test-folder';
    const description = '/test/folder';
    const isSymlink = false;

    provider.pinFolder(fsPath, label, description, isSymlink);
    assert.strictEqual(provider.isPinned(fsPath), true);
    assert.strictEqual(provider.getCount(), 1);
    assert.strictEqual(provider.getItemType(fsPath), PinnedItemType.folder);
  });

  test('should pin a file', () => {
    const fsPath = '/test/file.txt';
    const label = 'file.txt';
    const description = '/test/file.txt';
    const isSymlink = false;

    provider.pinFile(fsPath, label, description, isSymlink);
    assert.strictEqual(provider.isPinned(fsPath), true);
    assert.strictEqual(provider.getCount(), 1);
    assert.strictEqual(provider.getItemType(fsPath), PinnedItemType.file);
  });

  test('should unpin an item', async () => {
    const fsPath = '/test/folder';
    const label = 'test-folder';
    const description = '/test/folder';
    const isSymlink = false;

    provider.pinFolder(fsPath, label, description, isSymlink);
    assert.strictEqual(provider.isPinned(fsPath), true);

    const children = await provider.getChildren();
    assert.strictEqual(children.length, 1);

    provider.unpinItem(children[0]);
    assert.strictEqual(provider.isPinned(fsPath), false);
    assert.strictEqual(provider.getCount(), 0);
  });

  test('should unpin all items', async () => {
    provider.pinFolder('/test/folder1', 'folder1', '/test/folder1', false);
    provider.pinFile('/test/file1.txt', 'file1.txt', '/test/file1.txt', false);
    provider.pinFolder('/test/folder2', 'folder2', '/test/folder2', true);

    assert.strictEqual(provider.getCount(), 3);

    provider.unpinAll();
    assert.strictEqual(provider.getCount(), 0);
  });

  test('should not pin duplicate items', () => {
    const fsPath = '/test/folder';
    const label = 'test-folder';
    const description = '/test/folder';
    const isSymlink = false;

    provider.pinFolder(fsPath, label, description, isSymlink);
    provider.pinFolder(fsPath, label, description, isSymlink);

    assert.strictEqual(provider.getCount(), 1);
  });

  test('should return pinned items sorted by type then label', async () => {
    provider.pinFile('/test/zebra.txt', 'zebra.txt', '/test/zebra.txt', false);
    provider.pinFolder('/test/apple', 'apple', '/test/apple', false);
    provider.pinFile('/test/banana.txt', 'banana.txt', '/test/banana.txt', false);
    provider.pinFolder('/test/cherry', 'cherry', '/test/cherry', false);

    const children = await provider.getChildren();
    assert.strictEqual(children.length, 4);
    
    // Folders should come first
    assert.strictEqual(children[0].label, 'apple');
    assert.strictEqual(children[0].type, PinnedItemType.folder);
    assert.strictEqual(children[1].label, 'cherry');
    assert.strictEqual(children[1].type, PinnedItemType.folder);
    
    // Then files
    assert.strictEqual(children[2].label, 'banana.txt');
    assert.strictEqual(children[2].type, PinnedItemType.file);
    assert.strictEqual(children[3].label, 'zebra.txt');
    assert.strictEqual(children[3].type, PinnedItemType.file);
  });

  test('should mark symlinked items with indicator', async () => {
    provider.pinFolder('/test/symlink', 'symlink', '/test/symlink', true);
    provider.pinFile('/test/symlink.txt', 'symlink.txt', '/test/symlink.txt', true);

    const children = await provider.getChildren();
    assert.strictEqual(children.length, 2);
    assert.strictEqual(children[0].label, 'symlink 🔗');
    assert.strictEqual(children[1].label, 'symlink.txt 🔗');
  });

  test('should create folder tree item with correct properties', () => {
    const item = new PinnedItem(
      '/test/folder',
      'test-folder',
      '/test/folder',
      false,
      PinnedItemType.folder
    );

    assert.strictEqual(item.label, 'test-folder');
    assert.strictEqual(item.tooltip, '/test/folder');
    assert.strictEqual(item.contextValue, 'pinnedFolder');
    assert.strictEqual(item.command?.command, 'folder-search.openPinnedFolder');
    assert.strictEqual(item.type, PinnedItemType.folder);
  });

  test('should create file tree item with correct properties', () => {
    const item = new PinnedItem(
      '/test/file.txt',
      'file.txt',
      '/test/file.txt',
      false,
      PinnedItemType.file
    );

    assert.strictEqual(item.label, 'file.txt');
    assert.strictEqual(item.tooltip, '/test/file.txt');
    assert.strictEqual(item.contextValue, 'pinnedFile');
    assert.strictEqual(item.command?.command, 'folder-search.openPinnedFile');
    assert.strictEqual(item.type, PinnedItemType.file);
  });

  test('should create tree item with symlink indicator', () => {
    const item = new PinnedItem(
      '/test/symlink',
      'symlink',
      '/test/symlink',
      true,
      PinnedItemType.folder
    );

    assert.strictEqual(item.label, 'symlink 🔗');
  });

  // Data Migration Tests
  suite('Data Migration', () => {
    test('should migrate old pinnedFolders data to new format', async () => {
      // Setup old format data
      const oldData = [
        {
          fsPath: '/test/folder1',
          label: 'folder1',
          description: '/test/folder1',
          isSymlink: false
        },
        {
          fsPath: '/test/folder2',
          label: 'folder2',
          description: '/test/folder2',
          isSymlink: true
        }
      ];

      // Set up workspace state with old data
      workspaceState.set('pinnedFolders', oldData);
      workspaceState.set('migrationVersion', 0);

      // Create new provider to trigger migration
      const newProvider = new PinnedItemsProvider(context);
      
      // Wait for async initialization
      await new Promise(resolve => setTimeout(resolve, 10));

      // Check migration status
      const migrationStatus = newProvider.getMigrationStatus();
      assert.strictEqual(migrationStatus.completed, true);
      assert.strictEqual(migrationStatus.version, 1);
      assert.strictEqual(migrationStatus.hasOldData, false); // Should be cleared

      // Check that new format data exists
      const newData = workspaceState.get('pinnedItems') as PinnedItemData[];
      assert.strictEqual(newData.length, 2);
      assert.strictEqual(newData[0].fsPath, '/test/folder1');
      assert.strictEqual(newData[0].type, PinnedItemType.folder);
      assert.strictEqual(newData[1].fsPath, '/test/folder2');
      assert.strictEqual(newData[1].type, PinnedItemType.folder);
      assert.strictEqual(newData[1].isSymlink, true);

      // Check that old data is cleared
      assert.strictEqual(workspaceState.get('pinnedFolders'), undefined);
    });

    test('should handle migration with existing new format data', async () => {
      // Setup existing new format data
      const existingNewData: PinnedItemData[] = [
        {
          fsPath: '/existing/file.txt',
          label: 'file.txt',
          description: '/existing/file.txt',
          isSymlink: false,
          type: PinnedItemType.file
        }
      ];

      // Setup old format data
      const oldData = [
        {
          fsPath: '/test/folder1',
          label: 'folder1',
          description: '/test/folder1',
          isSymlink: false
        }
      ];

      workspaceState.set('pinnedItems', existingNewData);
      workspaceState.set('pinnedFolders', oldData);
      workspaceState.set('migrationVersion', 0);

      // Create new provider to trigger migration
      new PinnedItemsProvider(context);
      
      // Wait for async initialization
      await new Promise(resolve => setTimeout(resolve, 10));

      // Check that both existing and migrated data are present
      const finalData = workspaceState.get('pinnedItems') as PinnedItemData[];
      assert.strictEqual(finalData.length, 2);
      
      // Existing data should be preserved
      const existingItem = finalData.find(item => item.fsPath === '/existing/file.txt');
      assert.ok(existingItem);
      assert.strictEqual(existingItem.type, PinnedItemType.file);
      
      // Migrated data should be added
      const migratedItem = finalData.find(item => item.fsPath === '/test/folder1');
      assert.ok(migratedItem);
      assert.strictEqual(migratedItem.type, PinnedItemType.folder);
    });

    test('should avoid duplicate items during migration', async () => {
      // Setup existing new format data with same path as old data
      const existingNewData: PinnedItemData[] = [
        {
          fsPath: '/test/folder1',
          label: 'folder1',
          description: '/test/folder1',
          isSymlink: false,
          type: PinnedItemType.folder
        }
      ];

      // Setup old format data with same path
      const oldData = [
        {
          fsPath: '/test/folder1',
          label: 'folder1',
          description: '/test/folder1',
          isSymlink: false
        }
      ];

      workspaceState.set('pinnedItems', existingNewData);
      workspaceState.set('pinnedFolders', oldData);
      workspaceState.set('migrationVersion', 0);

      // Create new provider to trigger migration
      new PinnedItemsProvider(context);
      
      // Wait for async initialization
      await new Promise(resolve => setTimeout(resolve, 10));

      // Check that no duplicates were created
      const finalData = workspaceState.get('pinnedItems') as PinnedItemData[];
      assert.strictEqual(finalData.length, 1);
      assert.strictEqual(finalData[0].fsPath, '/test/folder1');
    });

    test('should handle invalid old data during migration', async () => {
      // Setup old format data with invalid items
      const oldData = [
        {
          fsPath: '/test/folder1',
          label: 'folder1',
          description: '/test/folder1',
          isSymlink: false
        },
        {
          // Missing fsPath
          label: 'invalid',
          description: '/test/invalid',
          isSymlink: false
        },
        {
          fsPath: '/test/folder2',
          // Missing label
          description: '/test/folder2',
          isSymlink: false
        },
        {
          fsPath: '/test/folder3',
          label: 'folder3',
          description: '/test/folder3',
          isSymlink: false
        }
      ];

      workspaceState.set('pinnedFolders', oldData);
      workspaceState.set('migrationVersion', 0);

      // Create new provider to trigger migration
      new PinnedItemsProvider(context);
      
      // Wait for async initialization
      await new Promise(resolve => setTimeout(resolve, 10));

      // Check that only valid items were migrated
      const newData = workspaceState.get('pinnedItems') as PinnedItemData[];
      assert.strictEqual(newData.length, 2); // Only 2 valid items
      assert.strictEqual(newData[0].fsPath, '/test/folder1');
      assert.strictEqual(newData[1].fsPath, '/test/folder3');
    });

    test('should skip migration if already completed', async () => {
      // Setup old format data
      const oldData = [
        {
          fsPath: '/test/folder1',
          label: 'folder1',
          description: '/test/folder1',
          isSymlink: false
        }
      ];

      // Set migration as already completed
      workspaceState.set('pinnedFolders', oldData);
      workspaceState.set('migrationVersion', 1);

      // Create new provider
      new PinnedItemsProvider(context);
      
      // Wait for async initialization
      await new Promise(resolve => setTimeout(resolve, 10));

      // Check that migration was skipped
      const pinnedItems = workspaceState.get('pinnedItems') as PinnedItemData[] | undefined;
      assert.strictEqual(pinnedItems?.length || 0, 0);
      const pinnedFolders = workspaceState.get('pinnedFolders') as Array<{ fsPath: string; label: string; description: string; isSymlink: boolean }> | undefined;
      assert.strictEqual(pinnedFolders?.length, 1); // Old data preserved
    });

    test('should handle empty old data gracefully', async () => {
      // Setup empty old data
      workspaceState.set('pinnedFolders', []);
      workspaceState.set('migrationVersion', 0);

      // Create new provider
      const newProvider = new PinnedItemsProvider(context);
      
      // Wait for async initialization
      await new Promise(resolve => setTimeout(resolve, 10));

      // Check migration status
      const migrationStatus = newProvider.getMigrationStatus();
      assert.strictEqual(migrationStatus.completed, true);
      assert.strictEqual(migrationStatus.version, 1);
    });

    test('should provide backward compatibility for loading data', async () => {
      // Setup old format data without migration
      const oldData = [
        {
          fsPath: '/test/folder1',
          label: 'folder1',
          description: '/test/folder1',
          isSymlink: false
        }
      ];

      workspaceState.set('pinnedFolders', oldData);
      workspaceState.set('migrationVersion', 0);
      // Don't set pinnedItems to simulate failed migration

      // Create new provider
      const newProvider = new PinnedItemsProvider(context);
      
      // Wait for async initialization
      await new Promise(resolve => setTimeout(resolve, 10));

      // Should still be able to access the data through backward compatibility
      assert.strictEqual(newProvider.getCount(), 1);
      assert.strictEqual(newProvider.isPinned('/test/folder1'), true);
      assert.strictEqual(newProvider.getItemType('/test/folder1'), PinnedItemType.folder);
    });
  });
});