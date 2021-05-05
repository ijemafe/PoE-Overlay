import { Injectable } from '@angular/core'
import {
    ExportedItem,
    Item,
    ItemSection,
    ItemSectionParserService,
    Section
} from '@shared/module/poe/type'
import { ClientStringService } from '../../client-string/client-string.service'

@Injectable({
  providedIn: 'root',
})
export class ItemSectionIncursionParserService implements ItemSectionParserService {
  constructor(private readonly clientString: ClientStringService) { }

  public optional = true
  public section = ItemSection.Incursion

  public parse(item: ExportedItem, target: Item): Section {
    const openRoomsPhrase = this.clientString.translate('ItemDescriptionIncursionAccessibleRooms')

    const incursionSection = item.sections.find((x) => x.lines[0] === openRoomsPhrase)
    if (!incursionSection) {
      return null
    }

    if (!target.properties) {
      target.properties = {}
    }
    if (!target.properties.incursion) {
      target.properties.incursion = {
        openRooms: [],
        closedRooms: [],
      }
    }

    const incursion = target.properties.incursion

    const phrases = this.clientString.translateMultiple(new RegExp('^IncursionRoom'))
    const closedRoomPhrase = this.clientString.translate('ItemDescriptionIncursionInaccessibleRooms')

    let rooms = incursion.openRooms
    for (const line in incursionSection.lines) {
      if (line === closedRoomPhrase) {
        rooms = incursion.closedRooms
      }
      const matchedPhrase = phrases.find((x) => line.indexOf(x.translation) !== -1)
      if (matchedPhrase) {
        rooms.push(matchedPhrase.id)
      }
    }

    return incursionSection
  }
}
