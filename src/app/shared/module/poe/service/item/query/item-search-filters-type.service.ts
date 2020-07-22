import { Injectable } from '@angular/core'
import { Query } from '@data/poe'
import {
  Item,
  ItemCategory,
  ItemRarity,
  ItemSearchFiltersService,
  Language,
} from '@shared/module/poe/type'
import { ItemService } from '../item.service'

@Injectable({
  providedIn: 'root',
})
export class ItemSearchFiltersTypeService implements ItemSearchFiltersService {
  constructor(private readonly itemNameService: ItemService) {}

  public add(item: Item, language: Language, query: Query): void {
    query.filters.type_filters = {
      filters: {},
    }

    const name = this.itemNameService.getName(item.nameId, language)
    if (name) {
      query.name = {
        option: name,
      }
    }

    const type = this.itemNameService.getType(item.typeId, language)
    if (type) {
      query.type = {
        option: type,
      }
    }

    switch (item.category) {
      // weapon
      case ItemCategory.Weapon:
      case ItemCategory.WeaponOne:
      case ItemCategory.WeaponOneMelee:
      case ItemCategory.WeaponTwoMelee:
      case ItemCategory.WeaponBow:
      case ItemCategory.WeaponClaw:
      case ItemCategory.WeaponDagger:
      case ItemCategory.WeaponRunedagger:
      case ItemCategory.WeaponOneAxe:
      case ItemCategory.WeaponOneMace:
      case ItemCategory.WeaponOneSword:
      case ItemCategory.WeaponSceptre:
      case ItemCategory.WeaponStaff:
      case ItemCategory.WeaponWarstaff:
      case ItemCategory.WeaponTwoAxe:
      case ItemCategory.WeaponTwoMace:
      case ItemCategory.WeaponTwoSword:
      case ItemCategory.WeaponWand:
      case ItemCategory.WeaponRod:
      // armour
      case ItemCategory.Armour:
      case ItemCategory.ArmourChest:
      case ItemCategory.ArmourBoots:
      case ItemCategory.ArmourGloves:
      case ItemCategory.ArmourHelmet:
      case ItemCategory.ArmourShield:
      case ItemCategory.ArmourQuiver:
      // accessory
      case ItemCategory.Accessory:
      case ItemCategory.AccessoryAmulet:
      case ItemCategory.AccessoryBelt:
      case ItemCategory.AccessoryRing:
        if (item.rarity === ItemRarity.Unique) {
          query.filters.type_filters.filters.rarity = {
            option: ItemRarity.Unique,
          }
        } else {
          query.filters.type_filters.filters.rarity = {
            option: ItemRarity.NonUnique,
          }

          if (query.name) {
            query.term = `${query.name.option || ''} ${query.type.option || ''}`.trim()
            query.name = query.type = undefined
          }
        }
        query.filters.type_filters.filters.category = {
          option: item.category,
        }
        break
      // jewel
      case ItemCategory.Jewel:
      case ItemCategory.JewelAbyss:
      case ItemCategory.JewelCluster:
      // flasks
      case ItemCategory.Flask:
      // map
      case ItemCategory.Map:
      // monster
      case ItemCategory.MonsterBeast:
        query.filters.type_filters.filters.rarity = {
          option: item.rarity === ItemRarity.Unique ? ItemRarity.Unique : ItemRarity.NonUnique,
        }
        query.filters.type_filters.filters.category = {
          option: item.category,
        }
        break
      // gem
      case ItemCategory.Gem:
      case ItemCategory.GemActivegem:
      case ItemCategory.GemSupportGem:
      case ItemCategory.GemSupportGemplus:
      case ItemCategory.Watchstone:
      case ItemCategory.Leaguestone:
      // currency
      case ItemCategory.Currency:
      case ItemCategory.CurrencyPiece:
      case ItemCategory.CurrencyResonator:
      case ItemCategory.CurrencyFossil:
      case ItemCategory.CurrencyIncubator:
      // seed
      case ItemCategory.CurrencySeed:
      case ItemCategory.CurrencyWildSeed:
      case ItemCategory.CurrencyVividSeed:
      case ItemCategory.CurrencyPrimalSeed:
      case ItemCategory.CurrencySeedBooster:
      // map
      case ItemCategory.MapFragment:
      case ItemCategory.MapScarab:
      // divination card
      case ItemCategory.Card:
        query.filters.type_filters.filters.category = {
          option: item.category,
        }
        break
      // metamorph samples
      case ItemCategory.MonsterSample:
        query.filters.type_filters.filters.category = {
          option: item.category,
        }
        if (item.rarity === ItemRarity.Unique) {
          query.name = undefined
        }
        break
      // prophecy
      case ItemCategory.Prophecy:
        query.filters.type_filters.filters.category = {
          option: item.category,
        }
        if (query.type.option.endsWith(')')) {
          const discrimininatorStartIdx = query.type.option.lastIndexOf('(')
          query.name = {
            option: query.type.option.substr(0, discrimininatorStartIdx).trim(),
            discriminator: query.type.option.substr(
              discrimininatorStartIdx + 1,
              query.type.option.length - discrimininatorStartIdx - 2
            ),
          }
        } else {
          query.name = {
            option: query.type.option,
          }
        }
        query.type = undefined
        break
      default:
        break
    }
  }
}
