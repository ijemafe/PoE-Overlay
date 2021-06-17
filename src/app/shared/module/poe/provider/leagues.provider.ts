import { Injectable } from '@angular/core'
import { CacheService } from '@app/service'
import { PoEHttpService } from '@data/poe'
import { CacheExpirationType, Language, League } from '@shared/module/poe/type'
import { forkJoin, Observable } from 'rxjs'
import { map } from 'rxjs/operators'

@Injectable({
  providedIn: 'root',
})
export class LeaguesProvider {
  constructor(
    private readonly poeHttpService: PoEHttpService,
    private readonly cache: CacheService
  ) {}

  public provide(language: Language, cacheExpiration: CacheExpirationType = CacheExpirationType.Normal): Observable<League[]> {
    const key = `leagues_${language}`
    return this.cache.proxy(key, () => this.fetch(language), cacheExpiration)
  }

  private fetch(language: Language): Observable<League[]> {
    return forkJoin([
      this.poeHttpService.getLeagues(language),
      this.poeHttpService.getTradePageLeagues(language)
    ]).pipe(map((responses) => {
      const leagues = responses[0].result
      const tradePageLeagues = responses[1].result
      return tradePageLeagues.map((league) => {
        const result: League = {
          id: league.id,
          text: league.text,
          privateLeague: leagues.findIndex((l) => l.id === league.id) === -1
        }
        return result
      })
    }))
  }
}
