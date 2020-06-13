import { Injectable } from '@angular/core'
import {
  ExportedItem,
  Item,
  ItemSection,
  ItemSectionParserService,
  Section,
} from '@shared/module/poe/type'
import { ClientStringService } from '../../client-string/client-string.service'

@Injectable({
  providedIn: 'root',
})
export class ItemSectionFlaskParserService implements ItemSectionParserService {
  constructor(private readonly clientString: ClientStringService) {}

  public optional = true
  public section = ItemSection.Flask

  public parse(item: ExportedItem, target: Item): Section {
    const phrase = `${this.clientString.translate('ItemDisplayChargesNCharges').replace('%0', '0')}`

    const flaskSection = item.sections.find((x) => x.content.indexOf(phrase) !== -1)
    if (!flaskSection) {
      return null
    }

    // Nothing actually has to be done, It's just a matter of identifing this section of the item to prevent the content from being parsed for stats.

    return flaskSection
  }
}
