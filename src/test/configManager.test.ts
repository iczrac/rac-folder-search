import * as assert from 'assert';
import { ConfigManager } from '../configManager';

suite('ConfigManager Test Suite', () => {
  let configManager: ConfigManager;

  setup(() => {
    configManager = new ConfigManager();
  });

  test('getConfig returns valid configuration', () => {
    const config = configManager.getConfig();
    
    assert.strictEqual(typeof config.followSymlinks, 'boolean');
    assert.strictEqual(typeof config.maxDepth, 'number');
    assert.strictEqual(typeof config.includeFiles, 'boolean');
    assert.strictEqual(typeof config.cacheExpiryMinutes, 'number');
    assert.ok(Array.isArray(config.excludePatterns));
    assert.strictEqual(typeof config.maxResults, 'number');
  });

  test('validateConfig accepts valid configuration', () => {
    const config = configManager.getConfig();
    const isValid = configManager.validateConfig(config);
    
    assert.strictEqual(isValid, true);
  });

  test('validateConfig rejects maxDepth < 1', () => {
    const config = configManager.getConfig();
    config.maxDepth = 0;
    
    const isValid = configManager.validateConfig(config);
    assert.strictEqual(isValid, false);
  });

  test('validateConfig rejects maxDepth > 20', () => {
    const config = configManager.getConfig();
    config.maxDepth = 21;
    
    const isValid = configManager.validateConfig(config);
    assert.strictEqual(isValid, false);
  });

  test('validateConfig rejects cacheExpiryMinutes < 1', () => {
    const config = configManager.getConfig();
    config.cacheExpiryMinutes = 0;
    
    const isValid = configManager.validateConfig(config);
    assert.strictEqual(isValid, false);
  });

  test('validateConfig rejects maxResults < 100', () => {
    const config = configManager.getConfig();
    config.maxResults = 50;
    
    const isValid = configManager.validateConfig(config);
    assert.strictEqual(isValid, false);
  });
});
