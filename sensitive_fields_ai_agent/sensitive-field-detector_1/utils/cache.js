// Multi-level caching system for performance optimization
// Implements session, domain, global, and AI response caching

console.log('💾 cache.js loading...', window.location.href);

class CacheManager {
  constructor() {
    this.sessionCache = new Map();
    this.domainCache = new Map();
    this.globalCache = new Map();
    this.aiCache = new Map();
    
    this.cacheSettings = {
      session: { maxSize: 1000, ttl: 0 }, // No TTL for session
      domain: { maxSize: 500, ttl: 7 * 24 * 60 * 60 * 1000 }, // 7 days
      global: { maxSize: 200, ttl: 30 * 24 * 60 * 60 * 1000 }, // 30 days
      ai: { maxSize: 100, ttl: 24 * 60 * 60 * 1000 } // 24 hours
    };
    
    this.initializeCache();
  }

  async initializeCache() {
    try {
      // Load persistent caches from storage
      const stored = await chrome.storage.local.get(['domainCache', 'globalCache', 'aiCache']);
      
      if (stored.domainCache) {
        this.domainCache = new Map(Object.entries(stored.domainCache));
      }
      if (stored.globalCache) {
        this.globalCache = new Map(Object.entries(stored.globalCache));
      }
      if (stored.aiCache) {
        this.aiCache = new Map(Object.entries(stored.aiCache));
      }
      
      // Clean expired entries
      this.cleanExpiredEntries();
      
      // Set up periodic cleanup
      setInterval(() => this.cleanExpiredEntries(), 60 * 60 * 1000); // Every hour
    } catch (error) {
      console.warn('Cache initialization failed:', error);
    }
  }

  // Generate cache key from element metadata
  generateElementKey(element) {
    const keyParts = [
      element.tag,
      element.type,
      element.name,
      element.id,
      element.placeholder,
      element.labelText
    ].filter(Boolean);
    
    return this.hashString(keyParts.join('|'));
  }

  // Generate domain-specific key
  generateDomainKey(domain, elementKey) {
    return `${domain}:${elementKey}`;
  }

  // Simple hash function for cache keys
  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  // Session cache operations (non-persistent)
  setSession(key, value) {
    if (this.sessionCache.size >= this.cacheSettings.session.maxSize) {
      const firstKey = this.sessionCache.keys().next().value;
      this.sessionCache.delete(firstKey);
    }
    
    this.sessionCache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  getSession(key) {
    const entry = this.sessionCache.get(key);
    return entry ? entry.value : null;
  }

  // Domain cache operations (persistent)
  async setDomain(domain, key, value) {
    const domainKey = this.generateDomainKey(domain, key);
    
    if (this.domainCache.size >= this.cacheSettings.domain.maxSize) {
      await this.evictOldestEntries(this.domainCache, 1);
    }
    
    this.domainCache.set(domainKey, {
      value,
      timestamp: Date.now(),
      domain
    });
    
    await this.persistCache('domainCache');
  }

  getDomain(domain, key) {
    const domainKey = this.generateDomainKey(domain, key);
    const entry = this.domainCache.get(domainKey);
    
    if (entry && this.isEntryValid(entry, this.cacheSettings.domain.ttl)) {
      return entry.value;
    }
    
    if (entry) {
      this.domainCache.delete(domainKey);
    }
    
    return null;
  }

  // Global cache operations (persistent)
  async setGlobal(key, value) {
    if (this.globalCache.size >= this.cacheSettings.global.maxSize) {
      await this.evictOldestEntries(this.globalCache, 1);
    }
    
    this.globalCache.set(key, {
      value,
      timestamp: Date.now()
    });
    
    await this.persistCache('globalCache');
  }

  getGlobal(key) {
    const entry = this.globalCache.get(key);
    
    if (entry && this.isEntryValid(entry, this.cacheSettings.global.ttl)) {
      return entry.value;
    }
    
    if (entry) {
      this.globalCache.delete(key);
    }
    
    return null;
  }

  // AI response cache operations (persistent)
  async setAI(key, value) {
    if (this.aiCache.size >= this.cacheSettings.ai.maxSize) {
      await this.evictOldestEntries(this.aiCache, 1);
    }
    
    this.aiCache.set(key, {
      value,
      timestamp: Date.now()
    });
    
    await this.persistCache('aiCache');
  }

  getAI(key) {
    const entry = this.aiCache.get(key);
    
    if (entry && this.isEntryValid(entry, this.cacheSettings.ai.ttl)) {
      return entry.value;
    }
    
    if (entry) {
      this.aiCache.delete(key);
    }
    
    return null;
  }

  // Hierarchical cache lookup
  async get(element, domain = null) {
    const elementKey = this.generateElementKey(element);
    
    // 1. Check session cache first (fastest)
    let result = this.getSession(elementKey);
    if (result) {
      return result;
    }
    
    // 2. Check domain cache if domain provided
    if (domain) {
      result = this.getDomain(domain, elementKey);
      if (result) {
        // Cache in session for faster future access
        this.setSession(elementKey, result);
        return result;
      }
    }
    
    // 3. Check global cache
    result = this.getGlobal(elementKey);
    if (result) {
      // Cache in session and domain for faster future access
      this.setSession(elementKey, result);
      if (domain) {
        await this.setDomain(domain, elementKey, result);
      }
      return result;
    }
    
    return null;
  }

  // Set result in appropriate cache levels
  async set(element, value, domain = null, level = 'session') {
    const elementKey = this.generateElementKey(element);
    
    // Always cache in session
    this.setSession(elementKey, value);
    
    // Cache in higher levels based on confidence and level parameter
    if (level === 'domain' && domain) {
      await this.setDomain(domain, elementKey, value);
    } else if (level === 'global') {
      await this.setGlobal(elementKey, value);
      if (domain) {
        await this.setDomain(domain, elementKey, value);
      }
    }
  }

  // Cache AI responses
  async cacheAIResponse(prompt, response) {
    const promptKey = this.hashString(prompt);
    await this.setAI(promptKey, response);
  }

  // Get cached AI response
  getCachedAIResponse(prompt) {
    const promptKey = this.hashString(prompt);
    return this.getAI(promptKey);
  }

  // Utility methods
  isEntryValid(entry, ttl) {
    if (ttl === 0) return true; // No expiration
    return (Date.now() - entry.timestamp) < ttl;
  }

  async evictOldestEntries(cache, count) {
    const entries = Array.from(cache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    for (let i = 0; i < count && i < entries.length; i++) {
      cache.delete(entries[i][0]);
    }
  }

  cleanExpiredEntries() {
    const now = Date.now();
    
    // Clean domain cache
    for (const [key, entry] of this.domainCache.entries()) {
      if (!this.isEntryValid(entry, this.cacheSettings.domain.ttl)) {
        this.domainCache.delete(key);
      }
    }
    
    // Clean global cache
    for (const [key, entry] of this.globalCache.entries()) {
      if (!this.isEntryValid(entry, this.cacheSettings.global.ttl)) {
        this.globalCache.delete(key);
      }
    }
    
    // Clean AI cache
    for (const [key, entry] of this.aiCache.entries()) {
      if (!this.isEntryValid(entry, this.cacheSettings.ai.ttl)) {
        this.aiCache.delete(key);
      }
    }
  }

  async persistCache(cacheType) {
    try {
      const cacheMap = this[cacheType];
      const cacheObject = Object.fromEntries(cacheMap);
      await chrome.storage.local.set({ [cacheType]: cacheObject });
    } catch (error) {
      console.warn(`Failed to persist ${cacheType}:`, error);
    }
  }

  // Get cache statistics
  getStats() {
    return {
      session: {
        size: this.sessionCache.size,
        maxSize: this.cacheSettings.session.maxSize
      },
      domain: {
        size: this.domainCache.size,
        maxSize: this.cacheSettings.domain.maxSize
      },
      global: {
        size: this.globalCache.size,
        maxSize: this.cacheSettings.global.maxSize
      },
      ai: {
        size: this.aiCache.size,
        maxSize: this.cacheSettings.ai.maxSize
      }
    };
  }

  // Clear all caches
  async clearAll() {
    this.sessionCache.clear();
    this.domainCache.clear();
    this.globalCache.clear();
    this.aiCache.clear();
    
    await chrome.storage.local.remove(['domainCache', 'globalCache', 'aiCache']);
  }

  // Clear specific cache type
  async clear(type) {
    switch (type) {
      case 'session':
        this.sessionCache.clear();
        break;
      case 'domain':
        this.domainCache.clear();
        await chrome.storage.local.remove(['domainCache']);
        break;
      case 'global':
        this.globalCache.clear();
        await chrome.storage.local.remove(['globalCache']);
        break;
      case 'ai':
        this.aiCache.clear();
        await chrome.storage.local.remove(['aiCache']);
        break;
    }
  }
}

// Initialize global cache manager
window.cacheManager = new CacheManager();
