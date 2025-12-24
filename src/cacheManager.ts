import { ScanResult, CacheEntry } from './types';

/**
 * Manages scan result caching with time-based expiration
 */
export class CacheManager {
  private cache: CacheEntry | null = null;
  private buildPromise: Promise<ScanResult[]> | null = null;
  private isBuilding = false;

  /**
   * Gets cached results or builds new cache if expired
   * @param builder Function to build new cache
   * @param expiryMinutes Cache expiration time in minutes
   * @returns Scan results (cached or freshly built)
   */
  async getOrBuild(
    builder: () => Promise<ScanResult[]>,
    expiryMinutes: number
  ): Promise<ScanResult[]> {
    // Check if cache is valid
    if (this.isValid(expiryMinutes)) {
      return this.cache!.results;
    }

    // Prevent concurrent builds - wait for existing build
    if (this.isBuilding && this.buildPromise) {
      await this.buildPromise;
      return this.cache!.results;
    }

    // Build new cache
    this.isBuilding = true;
    this.buildPromise = builder();

    try {
      const results = await this.buildPromise;
      this.cache = {
        results,
        timestamp: Date.now()
      };
      return results;
    } finally {
      this.isBuilding = false;
      this.buildPromise = null;
    }
  }

  /**
   * Checks if cache is valid (exists and not expired)
   * @param expiryMinutes Cache expiration time in minutes
   * @returns true if cache is valid, false otherwise
   */
  isValid(expiryMinutes: number): boolean {
    if (!this.cache) {
      return false;
    }

    const expiryMs = expiryMinutes * 60 * 1000;
    const age = Date.now() - this.cache.timestamp;
    return age < expiryMs;
  }

  /**
   * Clears the cache
   */
  clear(): void {
    this.cache = null;
    this.isBuilding = false;
    this.buildPromise = null;
  }
}
