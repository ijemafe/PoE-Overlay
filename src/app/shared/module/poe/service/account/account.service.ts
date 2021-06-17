import { Injectable } from '@angular/core'
import { PoEHttpService } from '@data/poe'
import { BehaviorSubject, Observable, Subscription } from 'rxjs'
import { flatMap, tap } from 'rxjs/operators'
import { BrowserService } from '@app/service'
import { PoEAccountProvider } from '../../provider/account.provider'
import { CacheExpirationType, Language, PoEAccount } from '../../type'
import { ContextService } from '../context.service'

@Injectable({
  providedIn: 'root',
})
export class PoEAccountService {
  private readonly accountSubject = new BehaviorSubject<PoEAccount>(undefined)

  constructor(
    private readonly context: ContextService,
    private readonly accountProvider: PoEAccountProvider,
    private readonly browser: BrowserService,
    private readonly poeHttpService: PoEHttpService,
  ) { }

  public init(): Observable<PoEAccount> {
    return this.getAsync()
  }

  public subscribe(next: (value: PoEAccount) => void): Subscription {
    return this.accountSubject.subscribe(next)
  }

  public get(): PoEAccount {
    return this.accountSubject.getValue()
  }

  public getAsync(language?: Language, forceRefresh: boolean = false): Observable<PoEAccount> {
    language = language || this.context.get().language
    return this.accountProvider.provide(language, forceRefresh ? CacheExpirationType.VeryShort : CacheExpirationType.Normal).pipe(tap((account) => {
      this.accountSubject.next(account)
    }))
  }

  public update(language?: Language): void {
    language = language || this.context.get().language
    this.accountProvider.provide(language).subscribe((account) => {
      this.accountSubject.next(account)
    })
  }

  public login(language?: Language): Observable<PoEAccount> {
    language = language || this.context.get().language
    return this.browser.openAndWait(this.poeHttpService.getLoginUrl(language)).pipe(flatMap(() => {
      return this.accountProvider.provide(language, CacheExpirationType.Instant).pipe(tap((account) => {
        this.accountSubject.next({ ...account })
      }))
    }))
  }

  public logout(language?: Language): Observable<PoEAccount> {
    language = language || this.context.get().language
    return this.browser.retrieve(this.poeHttpService.getLogoutUrl(language)).pipe(flatMap(() =>
      this.accountProvider.update({
        loggedIn: false,
      }, language)
    ))
  }
}
