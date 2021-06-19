import { Injectable } from '@angular/core'
import { CacheService } from '@app/service'
import { ApiStashType, PoEHttpService } from '@data/poe'
import { CacheExpiration, CacheExpirationType, Language } from '@shared/module/poe/type'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { isNullOrUndefined } from 'util'
import { PoEStashTab } from '../type/stash.type'
import { StashGridType } from '../type/trade-companion.type'

const STASH_TYPE_MAPPING = {
  [ApiStashType.PremiumStash]: StashGridType.Normal,
  [ApiStashType.QuadStash]: StashGridType.Quad,
}

@Injectable({
  providedIn: 'root',
})
export class StashProvider {
  constructor(
    private readonly poeHttpService: PoEHttpService,
    private readonly cache: CacheService
  ) {
  }

  public provide(accountName: string, leagueId: string, language: Language, cacheExpiration?: CacheExpirationType): Observable<PoEStashTab[]> {
    const key = `stashinfo_${language}_${leagueId}_${accountName}`
    return this.cache.proxy(key, () => this.fetch(accountName, leagueId, language), CacheExpiration.getExpiration(cacheExpiration, CacheExpirationType.Short))
  }

  private fetch(accountName: string, leagueId: string, language: Language): Observable<PoEStashTab[]> {
    return this.poeHttpService.getStashTabInfo(accountName, leagueId, language).pipe(map((response) => {
      if (!response.error) {
        return response.tabs.map((tab) => {
          const stashGridType = STASH_TYPE_MAPPING[tab.type]
          if (stashGridType === undefined) {
            return undefined
          }
          const poeStashTab: PoEStashTab = {
            name: tab.n,
            stashGridType
          }
          return poeStashTab
        }).filter((x) => !isNullOrUndefined(x))
      } else {
        return []
      }
    }))
  }
}
