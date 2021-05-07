import { Injectable } from '@angular/core'
import { Query, StatsFilter } from '@data/poe'
import { Item, ItemSearchFiltersService, Language, StatType } from '@shared/module/poe/type'
import { ClientStringService } from '../../client-string/client-string.service'
import { StatsService } from '../../stats/stats.service'

@Injectable({
  providedIn: 'root',
})
export class ItemSearchFiltersIncursionService implements ItemSearchFiltersService {
  constructor(
    private readonly clientString: ClientStringService,
    private readonly statsService: StatsService,
  ) {
  }

  public add(item: Item, language: Language, query: Query): void {
    if (!item.properties || !item.properties.incursion) {
      return
    }

    const rooms: StatsFilter[] = []
    const incursion = item.properties.incursion

    rooms.push(...this.searchTradeStats(incursion.openRooms, '1'))
    rooms.push(...this.searchTradeStats(incursion.closedRooms, '2'))

    if (rooms.length > 0) {
      query.stats.push({
        type: 'and',
        filters: rooms,
      })
    }
  }

  private searchTradeStats(rooms: string[], roomOption: string): StatsFilter[] {
    const roomStats = this.statsService.searchExactInType(rooms.map((x) => `Has Room: ${this.clientString.translate(x, Language.English)}`), [StatType.Pseudo], Language.English)
    return roomStats.map((x) => {
      const statFilter: StatsFilter = {
        id: x.tradeId,
        value: {
          option: roomOption,
        },
      }
      return statFilter
    })
  }
}
