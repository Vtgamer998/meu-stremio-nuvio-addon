const NodeCache = require("node-cache");

const cache = new NodeCache({
  stdTTL: parseInt(process.env.CACHE_TTL) || 3600,
  checkperiod: 600,
  useClones: false,
});

module.exports = {
  get: (key) => cache.get(key),

  set: (key, value, ttl = null) => {
    if (ttl) return cache.set(key, value, ttl);
    return cache.set(key, value);
  },

  del: (key) => cache.del(key),

  flush: () => cache.flushAll(),

  stats: () => cache.getStats(),
};
