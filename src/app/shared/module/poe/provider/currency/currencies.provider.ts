import { Injectable } from '@angular/core'
import { CacheService } from '@app/service'
import * as PoE from '@data/poe'
import { Currency, Language } from '@shared/module/poe/type'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

const CACHE_EXPIRY = 1000 * 60 * 60

@Injectable({
  providedIn: 'root',
})
export class CurrenciesProvider {
  constructor(
    private readonly tradeHttpService: PoE.TradeHttpService,
    private readonly cache: CacheService
  ) {}

  public provide(language: Language, groupId?: PoE.TradeStaticResultId): Observable<Currency[]> {
    const groupKey = groupId?.toLowerCase() || 'all'
    const key = `${groupKey}_${language}`
    return this.cache.proxy(key, () => this.fetch(language, groupId), CACHE_EXPIRY)
  }

  private fetch(language: Language, groupId?: PoE.TradeStaticResultId): Observable<Currency[]> {
    return this.tradeHttpService.getStatic(language).pipe(
      map((response) => {
        let result = response.result
        if (groupId) {
          result = result.filter((group) => group.id === groupId)
        }
        return [].concat(...result.map((group) => group.entries.map((entry) => {
          const currency: Currency = {
            id: entry.id,
            nameType: entry.text,
            image: entry.image,
          }
          return currency
        })))
      })
    )
  }
}
