import { TestBed } from '@angular/core/testing'
import { CacheService } from '@app/service/cache.service'

let cache: CacheService

const mockLeagues: any = require('doc/poe/api_trade_data_leagues.json')
const mockExchangeRates: any = require('doc/poe-ninja/currencyoverviewcache.json')

beforeAll(() => {
  cache = TestBed.inject<CacheService>(CacheService)
  cache.store(`leagues_1`, mockLeagues.result, 99999, false)
  cache.store('currency_chaos_equivalents_Delirium', mockExchangeRates, 99999, false)
})
