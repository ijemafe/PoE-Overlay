export enum CacheExpirationType {
  Instant = 0,
  Normal = 1000*60*60,//1h
  HalfNormal = 1000*60*30,//30m
  Short = 1000*60*15,//15m
  VeryShort = 1000*60,//1m
}
