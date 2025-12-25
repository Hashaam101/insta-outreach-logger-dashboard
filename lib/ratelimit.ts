import { LRUCache } from 'lru-cache';

const options = {
  max: 500, // Store 500 unique users/IPs
  ttl: 60 * 1000, // 1 minute window
};

const tokenCache = new LRUCache<string, number>(options);

export function rateLimit(identifier: string, limit: number = 20) {
  const currentUsage = tokenCache.get(identifier) || 0;
  
  if (currentUsage >= limit) {
    return { success: false, usage: currentUsage };
  }

  tokenCache.set(identifier, currentUsage + 1);
  return { success: true, usage: currentUsage + 1 };
}
