import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { BrowserService, LoggerService } from '@app/service'
import { environment } from '@env/environment'
import { Observable, of, throwError } from 'rxjs'
import { delay, flatMap, retryWhen } from 'rxjs/operators'
import { ItemOverviewResponse } from '../schema/item-overview'

export enum ItemOverviewType {
  DeliriumOrb = 'DeliriumOrb',
  Watchstone = 'Watchstone',
  Oil = 'Oil',
  Incubator = 'Incubator',
  Fossil = 'Fossil',
  Scarab = 'Scarab',
  Resonator = 'Resonator',
  Essence = 'Essence',
  DivinationCard = 'DivinationCard',
  Prophecy = 'Prophecy',
  UniqueMap = 'UniqueMap',
  Map = 'Map',
  UniqueJewel = 'UniqueJewel',
  UniqueFlask = 'UniqueFlask',
  UniqueWeapon = 'UniqueWeapon',
  UniqueArmour = 'UniqueArmour',
  UniqueAccessory = 'UniqueAccessory',
  Beast = 'Beast',
  Vial = 'Vial',
}

const PATH_TYPE_MAP = {
  [ItemOverviewType.DeliriumOrb]: 'delirium-orbs',
  [ItemOverviewType.Watchstone]: 'watchstones',
  [ItemOverviewType.Oil]: 'oils',
  [ItemOverviewType.Incubator]: 'incubators',
  [ItemOverviewType.Fossil]: 'fossils',
  [ItemOverviewType.Scarab]: 'scarabs',
  [ItemOverviewType.Resonator]: 'resonators',
  [ItemOverviewType.Essence]: 'essences',
  [ItemOverviewType.DivinationCard]: 'divinationcards',
  [ItemOverviewType.Prophecy]: 'prophecies',
  [ItemOverviewType.UniqueMap]: 'unique-maps',
  [ItemOverviewType.Map]: 'maps',
  [ItemOverviewType.UniqueJewel]: 'unique-jewels',
  [ItemOverviewType.UniqueFlask]: 'unique-flaks',
  [ItemOverviewType.UniqueWeapon]: 'unique-weapons',
  [ItemOverviewType.UniqueArmour]: 'unique-armours',
  [ItemOverviewType.UniqueAccessory]: 'unique-accessories',
  [ItemOverviewType.Beast]: 'beats',
  [ItemOverviewType.Vial]: 'vials',
}

const RETRY_COUNT = 3
const RETRY_DELAY = 100

@Injectable({
  providedIn: 'root',
})
export class ItemOverviewHttpService {
  private readonly baseUrl: string

  constructor(
    private readonly httpClient: HttpClient,
    private readonly browser: BrowserService,
    private readonly logger: LoggerService
  ) {
    this.baseUrl = `${environment.poeNinja.baseUrl}/api/data/itemoverview`
  }

  public get(leagueId: string, type: ItemOverviewType): Observable<ItemOverviewResponse> {
    const url = this.getUrl(leagueId, type)
    return this.httpClient.get<ItemOverviewResponse>(url).pipe(
      retryWhen((errors) =>
        errors.pipe(flatMap((response, count) => this.handleError(url, response, count)))
      ),
      flatMap((response) => {
        if (!response?.lines) {
          if (leagueId !== 'Standard') {
            this.logger.info(
              `Got empty result from '${url}'. Using Standard league for now.`,
              response
            )
            return this.get('Standard', type)
          }
          this.logger.warn(`Got empty result from '${url}'.`, response)
          return throwError(`Got empty result from '${url}'.`)
        }

        const result: ItemOverviewResponse = {
          lines: response.lines,
          url: `${environment.poeNinja.baseUrl}/challenge/${PATH_TYPE_MAP[type]}`,
        }
        return of(result)
      })
    )
  }

  private handleError(url: string, response: HttpErrorResponse, count: number): Observable<void> {
    if (count >= RETRY_COUNT) {
      return throwError(response)
    }

    switch (response.status) {
      case 403:
        return this.browser.retrieve(url).pipe(delay(RETRY_DELAY))
      default:
        return of(null).pipe(delay(RETRY_DELAY))
    }
  }

  private getUrl(leagueId: string, type: ItemOverviewType): string {
    return `${this.baseUrl}?league=${encodeURIComponent(leagueId)}&type=${encodeURIComponent(
      type
    )}&language=en`
  }
}
