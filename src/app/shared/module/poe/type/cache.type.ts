export enum CacheExpirationType {
  Instant = 1,
  Never = -1,
  Long = 1000 * 60 * 60 * 24,//1d
  Normal = 1000 * 60 * 60,//1h
  HalfNormal = 1000 * 60 * 30,//30m
  Medium = 1000 * 60 * 15,//15m
  Short = 1000 * 60 * 5,//5m
  VeryShort = 1000 * 60,//1m
}

export abstract class CacheExpiration {
  public static getExpiration(cacheExpiration: CacheExpirationType, defaultCacheExpiration: CacheExpirationType): number {
    if (cacheExpiration === CacheExpirationType.Never) {
      return defaultCacheExpiration
    }
    return cacheExpiration || defaultCacheExpiration
  }
}
