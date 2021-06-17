import { Injectable } from '@angular/core'
import { CacheService } from '@app/service'
import { PoEHttpService } from '@data/poe'
import { CacheExpirationType, Language, PoEAccount } from '@shared/module/poe/type'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

@Injectable({
  providedIn: 'root',
})
export class PoEAccountProvider {
  constructor(
    private readonly poeHttpService: PoEHttpService,
    private readonly cache: CacheService
  ) { }

  public provide(language: Language, cacheExpiration: CacheExpirationType = CacheExpirationType.Normal): Observable<PoEAccount> {
    const key = `accountinfo_${language}`
    return this.cache.proxy(key, () => this.fetch(language), cacheExpiration)
  }

  public update(account: PoEAccount, language: Language): Observable<PoEAccount> {
    const key = `accountinfo_${language}`
    return this.cache.store(key, account, CacheExpirationType.Normal)
  }

  private fetch(language: Language): Observable<PoEAccount> {
    return this.poeHttpService.getAccountInfo(language).pipe(map((response) => {
      if (!response.error) {
        const poeAccount: PoEAccount = {
          loggedIn: true,
          name: response.name
        }
        return poeAccount
      } else {
        const poeAccount: PoEAccount = {
          loggedIn: false
        }
        return poeAccount
      }
    }))
  }
}
