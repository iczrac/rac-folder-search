import * as assert from 'assert';
import { CacheManager } from '../cacheManager';
import { ScanResult } from '../types';

suite('CacheManager Test Suite', () => {
  let cacheManager: CacheManager;

  setup(() => {
    cacheManager = new CacheManager();
  });

  test('isValid returns false for empty cache', () => {
    assert.strictEqual(cacheManager.isValid(10), false);
  });

  test('getOrBuild builds cache on first call', async () => {
    const mockResults: ScanResult[] = [
      {
        label: '$(folder) test',
        description: '/',
        fsPath: '/test',
        isFolder: true,
        isSymlink: false
      }
    ];

    let builderCalled = false;
    const builder = async () => {
      builderCalled = true;
      return mockResults;
    };

    const results = await cacheManager.getOrBuild(builder, 10);
    
    assert.strictEqual(builderCalled, true);
    assert.deepStrictEqual(results, mockResults);
  });

  test('getOrBuild returns cached results on second call', async () => {
    const mockResults: ScanResult[] = [
      {
        label: '$(folder) test',
        description: '/',
        fsPath: '/test',
        isFolder: true,
        isSymlink: false
      }
    ];

    let builderCallCount = 0;
    const builder = async () => {
      builderCallCount++;
      return mockResults;
    };

    // First call - should build
    await cacheManager.getOrBuild(builder, 10);
    assert.strictEqual(builderCallCount, 1);

    // Second call - should use cache
    await cacheManager.getOrBuild(builder, 10);
    assert.strictEqual(builderCallCount, 1); // Still 1, not called again
  });

  test('clear removes cache', async () => {
    const mockResults: ScanResult[] = [];
    const builder = async () => mockResults;

    // Build cache
    await cacheManager.getOrBuild(builder, 10);
    assert.strictEqual(cacheManager.isValid(10), true);

    // Clear cache
    cacheManager.clear();
    assert.strictEqual(cacheManager.isValid(10), false);
  });

  test('expired cache triggers rebuild', async () => {
    const mockResults: ScanResult[] = [];
    let builderCallCount = 0;
    const builder = async () => {
      builderCallCount++;
      return mockResults;
    };

    // Build cache with 0 minute expiry (immediately expired)
    await cacheManager.getOrBuild(builder, 0);
    assert.strictEqual(builderCallCount, 1);

    // Wait a tiny bit to ensure expiry
    await new Promise(resolve => setTimeout(resolve, 10));

    // Should rebuild due to expiry
    await cacheManager.getOrBuild(builder, 0);
    assert.strictEqual(builderCallCount, 2);
  });
});
