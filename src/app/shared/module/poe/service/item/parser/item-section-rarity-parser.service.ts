import { Injectable } from '@angular/core'
import {
  ExportedItem,
  Item,
  ItemCategory,
  ItemRarity,
  ItemSection,
  ItemSectionParserService,
  Section,
} from '../../../type'
import { BaseItemCategoriesService } from '../../base-item-categories/base-item-categories.service'
import { BaseItemTypesService } from '../../base-item-types/base-item-types.service'
import { ClientStringService } from '../../client-string/client-string.service'
import { WordService } from '../../word/word.service'

@Injectable({
  providedIn: 'root',
})
export class ItemSectionRarityParserService implements ItemSectionParserService {
  constructor(
    private readonly clientString: ClientStringService,
    private readonly baseItemTypesService: BaseItemTypesService,
    private readonly baseItemCategoriesService: BaseItemCategoriesService,
    private readonly wordService: WordService
  ) {}

  public optional = false
  public section = ItemSection.Rartiy

  public parse(item: ExportedItem, target: Item): Section {
    const phrase = `${this.clientString.translate('ItemDisplayStringRarity')}: `

    const raritySection = item.sections.find((x) => x.content.indexOf(phrase) === 0)
    if (!raritySection) {
      return null
    }

    const lines = raritySection.lines

    const rarities = this.getRarities()
    const rarityValue = lines[0].slice(phrase.length).trim()

    const rarity = rarities.find((x) => x.key === rarityValue)
    if (!rarity) {
      return null
    }

    target.rarity = rarity.value

    switch (lines.length) {
      case 2:
        target.type = lines[1].replace(/<<[^>>]*>>/g, '')
        target.typeId = this.baseItemTypesService.search(target.type)
        break
      case 3:
        target.name = lines[1].replace(/<<[^>>]*>>/g, '')
        target.nameId = this.wordService.search(target.name)
        target.type = lines[2].replace(/<<[^>>]*>>/g, '')
        target.typeId = this.baseItemTypesService.search(target.type)
        break
      default:
        return null
    }

    if (!target.typeId) {
      return null
    }

    const metamorphSamplePhrase = this.clientString.translate('MetamorphosisItemisedMapBoss')

    const metamorphSample = item.sections.find((x) => x.content.indexOf(metamorphSamplePhrase) === 0)
    if (!metamorphSample) {
      target.category = this.baseItemCategoriesService.get(target.typeId)
    } else {
      target.category = ItemCategory.MonsterSample

      // Determine the body part and update the item base type (typeId) accordingly.
      const metamorphItemNameDisplay = this.clientString.translate('MetamorphosisItemisedBossDisplayText').replace('%1%', this.baseItemTypesService.translate(target.typeId))
      const metamorphBodyParts = this.getMetamorphBodyParts();
      for (let i = 0; i < metamorphBodyParts.length; i++) {
        const metamorphBodyPart = metamorphBodyParts[i]
        if (metamorphItemNameDisplay.replace('%2%', metamorphBodyPart.key) === target.type) {
          target.name = target.type
          target.typeId = metamorphBodyPart.value
          break
        }
      }
    }

    console.log(`target.typeId=${target.typeId}`)

    if (!target.category) {
      return null
    }

    if (
      target.category === ItemCategory.Gem ||
      target.category.indexOf(`${ItemCategory.Gem}.`) === 0
    ) {
      for (const section of item.sections) {
        if (section.lines.length !== 1) {
          continue
        }

        if (section.lines[0].length <= target.type.length) {
          continue
        }

        const type = section.lines[0]
        const id = this.baseItemTypesService.search(type)
        if (id === undefined || id.indexOf('Vaal') === -1) {
          continue
        }

        target.typeId = id
        target.type = type
        break
      }
    }

    return raritySection
  }

  private getRarities(): {
    key: string
    value: ItemRarity
  }[] {
    return [
      {
        key: this.clientString.translate('ItemDisplayStringNormal'),
        value: ItemRarity.Normal,
      },
      {
        key: this.clientString.translate('ItemDisplayStringMagic'),
        value: ItemRarity.Magic,
      },
      {
        key: this.clientString.translate('ItemDisplayStringRare'),
        value: ItemRarity.Rare,
      },
      {
        key: this.clientString.translate('ItemDisplayStringUnique'),
        value: ItemRarity.Unique,
      },
      {
        key: this.clientString.translate('ItemDisplayStringCurrency'),
        value: ItemRarity.Currency,
      },
      {
        key: this.clientString.translate('ItemDisplayStringGem'),
        value: ItemRarity.Gem,
      },
      {
        key: this.clientString.translate('ItemDisplayStringDivinationCard'),
        value: ItemRarity.DivinationCard,
      },
    ]
  }

  private getMetamorphBodyParts(): {
    key: string
    value: string
  }[] {
    return [
      {
        key: this.clientString.translate('MetamorphBodyPart1'),
        value: 'MetamorphosisBrain'
      },
      {
        key: this.clientString.translate('MetamorphBodyPart2'),
        value: 'MetamorphosisEye'
      },
      {
        key: this.clientString.translate('MetamorphBodyPart3'),
        value: 'MetamorphosisLung'
      },
      {
        key: this.clientString.translate('MetamorphBodyPart4'),
        value: 'MetamorphosisHeart'
      },
      {
        key: this.clientString.translate('MetamorphBodyPart5'),
        value: 'MetamorphosisLiver'
      },
    ]
  }
}
