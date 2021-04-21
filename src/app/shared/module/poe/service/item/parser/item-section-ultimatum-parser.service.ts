import { Injectable } from '@angular/core'
import {
  ExportedItem,
  Item,
  ItemSection,
  ItemSectionParserService,
  Section,
  UltimatumChallengeType,
  UltimatumRewardType,
} from '@shared/module/poe/type'
import { BaseItemTypesService } from '../../base-item-types/base-item-types.service'
import { ClientStringService } from '../../client-string/client-string.service'

@Injectable({
  providedIn: 'root',
})
export class ItemSectionUltimatumParserService implements ItemSectionParserService {
  constructor(
    private readonly clientString: ClientStringService,
    private readonly baseItemTypesService: BaseItemTypesService,
  ) { }

  public optional = true
  public section = ItemSection.Ultimatum

  public parse(item: ExportedItem, target: Item): Section {
    const challengeTypePhrase = `${this.clientString.translate('UltimatumItemisedTrialEncounter')}: `

    const ultimatumSection = item.sections.find((x) => x.content.indexOf(challengeTypePhrase) !== -1)
    if (!ultimatumSection) {
      return null
    }

    if (!target.properties) {
      target.properties = {}
    }
    if (!target.properties.ultimatum) {
      target.properties.ultimatum = {}
    }

    const ultimatum = target.properties.ultimatum

    const lines = ultimatumSection.lines

    // Challange Type
    const challengeTypes = this.getChallengeTypes()
    const challengeTypeValue = lines[0].slice(challengeTypePhrase.length).trim()

    const challengeType = challengeTypes.find((x) => x.key === challengeTypeValue)
    if (!challengeType) {
      return null
    }

    // Reward Type
    const rewardTypePhrase = this.clientString.translate('UltimatumItemisedTrialReward').replace('{0}', '')
    const rewardLine = lines[3]
    const rewardTypes = this.getRewardTypes()
    const rewardTypeValue = rewardLine.slice(rewardTypePhrase.length).trim()

    const rewardType = rewardTypes.find((x) => x.key === rewardTypeValue)
    if (!rewardType) {
      ultimatum.rewardUnique = this.baseItemTypesService.search(rewardLine.replace(/<<[^>>]*>>/g, ''))
      if (!ultimatum.rewardUnique) {
        return null
      }
      ultimatum.rewardType = UltimatumRewardType.UniqueItem
    } else {
      ultimatum.rewardType = rewardType.value
    }

    // Required Sacrifice
    const sacrificeQuantityPhrase = this.clientString.translate('UltimatumItemisedTrialItemRequirementQuantity')
    const sacrificeQuantitySuffix = sacrificeQuantityPhrase.slice(sacrificeQuantityPhrase.indexOf('{1}') + 3)
    const sacrificeLine = lines[2].replace(sacrificeQuantitySuffix, '').trim()
    const sacrificePhrase = this.clientString.translate('UltimatumItemisedTrialItemRequirement').replace('{0}', '')
    const sacrificeValue = sacrificeLine.slice(sacrificePhrase.length).trim()
    const sacrificeQuantityRegex = new RegExp(`(.*)${this.clientString.translate('UltimatumItemisedTrialQuantityFormat').replace('{0}', '(\\S+)')}$`)
    const sacrificeQuantityMatches = sacrificeQuantityRegex.exec(sacrificeValue)
    if (sacrificeQuantityMatches) {
      ultimatum.requiredItem = this.baseItemTypesService.search(sacrificeQuantityMatches[1].trim())
      const sacrificeAmount = sacrificeQuantityMatches[2]
      ultimatum.requiredItemAmount = {
        text: sacrificeAmount,
        value: +sacrificeAmount,
        min: +sacrificeAmount,
        max: +sacrificeAmount,
      }
    } else {
      ultimatum.requiredItem = sacrificeValue
    }

    return ultimatumSection
  }

  private getChallengeTypes(): {
    key: string
    value: UltimatumChallengeType
  }[] {
    return [
      {
        key: this.clientString.translate('BasicWavesVaal'),
        value: UltimatumChallengeType.Exterminate,
      },
      {
        key: this.clientString.translate('TimedSurvivalWavesVaal').substring(0, this.clientString.translate('TimedSurvivalWavesVaal').indexOf("\r\n")),
        value: UltimatumChallengeType.Survive,
      },
      {
        key: this.clientString.translate('DefenseVaal'),
        value: UltimatumChallengeType.ProtectAltar,
      },
      {
        key: this.clientString.translate('CaptureVaal'),
        value: UltimatumChallengeType.StandStoneCircles,
      },
    ]
  }

  private getRewardTypes(): {
    key: string
    value: UltimatumRewardType
  }[] {
    return [
      {
        key: this.clientString.translate('CurrencyChaos5'),
        value: UltimatumRewardType.Currency,
      },
      {
        key: this.clientString.translate('DoubleDivinationCards1'),
        value: UltimatumRewardType.DivCards,
      },
      {
        key: this.clientString.translate('MirrorRare1'),
        value: UltimatumRewardType.MirroredRare,
      },
    ]
  }
}
