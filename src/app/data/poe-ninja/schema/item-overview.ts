export interface ItemOverviewResponse {
  lines: ItemOverviewLine[]
  url: string
}

export interface ItemOverviewLine {
  name: string
  baseType: string
  mapTier: number
  links: number
  gemLevel: number
  gemQuality: number
  corrupted: boolean
  itemClass: number
  chaosValue: number
  sparkline: SparkLine
}

export interface SparkLine {
  data: number[]
  totalChange: number
}
