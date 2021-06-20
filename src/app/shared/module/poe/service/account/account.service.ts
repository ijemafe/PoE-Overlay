import { Injectable } from '@angular/core'
import { PoEHttpService } from '@data/poe'
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs'
import { flatMap, map, tap } from 'rxjs/operators'
import { BrowserService } from '@app/service'
import { PoEAccountProvider } from '../../provider/account.provider'
import { CacheExpirationType, Language, PoEAccount, PoECharacter } from '../../type'
import { ContextService } from '../context.service'
import { PoECharacterProvider } from '../../provider/character.provider'

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
    private readonly characterProvider: PoECharacterProvider,
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

  public getAsync(language?: Language): Observable<PoEAccount> {
    language = language || this.context.get().language
    return this.accountProvider.provide(language).pipe(flatMap((account) => {
      return this.getCharacters(account, language).pipe(map(() => {
        this.accountSubject.next(account)
        return account
      }))
    }))
  }

  public update(language?: Language): void {
    this.getAsync(language)
  }

  public updateCharacters(language?: Language, forceRefresh: boolean = false): void {
    language = language || this.context.get().language
    this.getCharacters(this.get(), language, forceRefresh)
  }

  public login(language?: Language): Observable<PoEAccount> {
    language = language || this.context.get().language
    return this.browser.openAndWait(this.poeHttpService.getLoginUrl(language)).pipe(flatMap(() => {
      return this.accountProvider.provide(language, CacheExpirationType.Instant).pipe(flatMap((account) => {
        if (account.loggedIn) {
          return this.characterProvider.provide(account.name, language, CacheExpirationType.Instant).pipe(map((characters) => {
            account.characters = characters
            this.accountSubject.next(account)
            return account
          }))
        } else {
          return of(account)
        }
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

  private getCharacters(account: PoEAccount, language?: Language, forceRefresh: boolean = false): Observable<PoECharacter[]> {
    if (account.loggedIn) {
      language = language || this.context.get().language
      return this.characterProvider.provide(account.name, language, forceRefresh ? CacheExpirationType.VeryShort : undefined).pipe(tap((characters) => {
        account.characters = characters
      }))
    }
    return of([])
  }
}
