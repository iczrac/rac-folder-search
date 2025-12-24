import * as assert from 'assert';

// Test sorting logic without VS Code dependencies
suite('Sorting Logic Unit Tests', () => {
  test('Folders should sort before files', () => {
    const items = [
      { name: 'file.txt', isFolder: false },
      { name: 'folder', isFolder: true }
    ];

    items.sort((a, b) => {
      if (a.isFolder && !b.isFolder) {
        return -1;
      }
      if (!a.isFolder && b.isFolder) {
        return 1;
      }
      return 0;
    });

    assert.strictEqual(items[0].isFolder, true, 'Folder should be first');
    assert.strictEqual(items[1].isFolder, false, 'File should be second');
  });

  test('Exact matches should sort first', () => {
    const query = 'test';
    const items = [
      { name: 'testing', isFolder: true },
      { name: 'test', isFolder: true },
      { name: 'mytest', isFolder: true }
    ];

    items.sort((a, b) => {
      const aExact = a.name.toLowerCase() === query;
      const bExact = b.name.toLowerCase() === query;
      if (aExact && !bExact) {
        return -1;
      }
      if (!aExact && bExact) {
        return 1;
      }
      return 0;
    });

    assert.strictEqual(items[0].name, 'test', 'Exact match should be first');
  });

  test('Prefix matches should sort before substring matches', () => {
    const query = 'test';
    const items = [
      { name: 'mytest', isFolder: true },
      { name: 'testing', isFolder: true },
      { name: 'atest', isFolder: true }
    ];

    items.sort((a, b) => {
      const aStarts = a.name.toLowerCase().startsWith(query);
      const bStarts = b.name.toLowerCase().startsWith(query);
      if (aStarts && !bStarts) {
        return -1;
      }
      if (!aStarts && bStarts) {
        return 1;
      }
      return 0;
    });

    assert.strictEqual(items[0].name, 'testing', 'Prefix match should be first');
  });

  test('Shorter names should sort first when match quality is equal', () => {
    const items = [
      { name: 'verylongname', isFolder: true },
      { name: 'short', isFolder: true },
      { name: 'medium', isFolder: true }
    ];

    items.sort((a, b) => {
      return a.name.length - b.name.length;
    });

    assert.strictEqual(items[0].name, 'short', 'Shortest name should be first');
    assert.strictEqual(items[2].name, 'verylongname', 'Longest name should be last');
  });

  test('Combined sorting logic', () => {
    const query = 'test';
    const items = [
      { name: 'file.txt', isFolder: false, path: '/file.txt' },
      { name: 'testing', isFolder: true, path: '/testing' },
      { name: 'test', isFolder: true, path: '/test' },
      { name: 'mytest', isFolder: true, path: '/mytest' },
      { name: 'testfile', isFolder: false, path: '/testfile' }
    ];

    items.sort((a, b) => {
      // Priority 1: Folders first
      if (a.isFolder && !b.isFolder) {
        return -1;
      }
      if (!a.isFolder && b.isFolder) {
        return 1;
      }

      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      const q = query.toLowerCase();

      // Priority 2: Exact match
      const aExact = aName === q;
      const bExact = bName === q;
      if (aExact && !bExact) {
        return -1;
      }
      if (!aExact && bExact) {
        return 1;
      }

      // Priority 3: Prefix match
      const aStarts = aName.startsWith(q);
      const bStarts = bName.startsWith(q);
      if (aStarts && !bStarts) {
        return -1;
      }
      if (!aStarts && bStarts) {
        return 1;
      }

      // Priority 4: Length
      return aName.length - bName.length;
    });

    // Verify order
    assert.strictEqual(items[0].name, 'test', 'Exact match folder should be first');
    assert.strictEqual(items[0].isFolder, true, 'First should be folder');
    assert.ok(items[1].name.startsWith('test'), 'Second should be prefix match');
    assert.strictEqual(items[1].isFolder, true, 'Second should be folder');
  });
});
