import { Injectable } from '@angular/core'
import { StatsLocalProvider } from '../../provider/stats-local.provider'
import { StatsIndistinguishableProvider } from '../../provider/stats-indistinguishable.provider'
import { StatsProvider } from '../../provider/stats.provider'
import { ItemStat, Language, Stat, StatType } from '../../type'
import { ContextService } from '../context.service'

export interface StatsSearchResult {
  stat: ItemStat
  match: StatsSectionText
}

export interface StatsSearchOptions {
  monsterSample?: boolean
  ultimatum?: boolean
  map?: boolean
  base_chance_to_poison_on_hit__?: boolean
  local_minimum_added_physical_damagelocal_maximum_added_physical_damage?: boolean
  local_minimum_added_fire_damagelocal_maximum_added_fire_damage?: boolean
  local_minimum_added_cold_damagelocal_maximum_added_cold_damage?: boolean
  local_minimum_added_lightning_damagelocal_maximum_added_lightning_damage?: boolean
  local_minimum_added_chaos_damagelocal_maximum_added_chaos_damage?: boolean
  local_attack_speed___?: boolean
  base_physical_damage_reduction_rating?: boolean
  local_physical_damage_reduction_rating___?: boolean
  base_evasion_rating?: boolean
  local_evasion_rating___?: boolean
  base_maximum_energy_shield?: boolean
  local_accuracy_rating?: boolean
}

interface StatsSectionText {
  index: number
  text: string
}

interface StatsSectionsSearch {
  types: StatType[]
  sections: StatsSectionText[]
}

const REVERSE_REGEX = /\\[.*+?^${}()|[\]\\]/g
const VALUE_PLACEHOLDER = '(\\S+)'
const TYPE_PLACEHOLDER_REGEX = / \(implicit\)| \(fractured\)| \(crafted\)| \(enchant\)/

@Injectable({
  providedIn: 'root',
})
export class StatsService {
  private readonly cache: {
    [key: string]: RegExp
  } = {}

  constructor(
    private readonly context: ContextService,
    private readonly statsProvider: StatsProvider,
    private readonly statsLocalProvider: StatsLocalProvider,
    private readonly statsIndistinguishableProvider: StatsIndistinguishableProvider
  ) {}

  public translate(stat: Stat, statDescIndex: number, language?: Language): string {
    language = language || this.context.get().language

    if (!stat.text[language] || statDescIndex < 0 || statDescIndex >= stat.text[language].length) {
      return `untranslated: '${stat.id}' for language: '${Language[language]}'`
    }

    const statDesc = stat.text[language][statDescIndex]
    const regex = statDesc[Object.getOwnPropertyNames(statDesc)[0]]
    return regex
      .slice(1, regex.length - 1)
      .split(VALUE_PLACEHOLDER)
      .map((part) =>
        part
          .replace(REVERSE_REGEX, (value) => value.replace('\\', ''))
          .replace(TYPE_PLACEHOLDER_REGEX, '')
      )
      .join('#')
  }

  public transform(stat: ItemStat, language?: Language): string[] {
    language = language || this.context.get().language

    const stats = this.statsProvider.provide(stat.type)
    const tradeStat = stats[stat.tradeId]
    const localStat = tradeStat?.text[language]
    if (
      !tradeStat ||
      !localStat ||
      stat.predicateIndex < 0 ||
      stat.predicateIndex >= localStat.length
    ) {
      return [`untranslated: '${stat.type}.${stat.tradeId}' for language: '${Language[language]}'`]
    }

    const statDesc = localStat[stat.predicateIndex]
    if (!statDesc) {
      return [
        `untranslated: '${stat.type}.${stat.tradeId}' (predicate '${stat.predicate}') for language: '${Language[language]}'`,
      ]
    }

    const result = statDesc[Object.getOwnPropertyNames(statDesc)[0]]
    return result
      .slice(1, result.length - 1)
      .split(VALUE_PLACEHOLDER)
      .map((part) =>
        part
          .replace(REVERSE_REGEX, (value) => value.replace('\\', ''))
          .replace(TYPE_PLACEHOLDER_REGEX, '')
      )
  }

  public search(
    text: string,
    options?: StatsSearchOptions,
    language?: Language
  ): StatsSearchResult {
    return this.searchMultiple([text], options, language)[0]
  }

  public searchMultiple(
    texts: string[],
    options?: StatsSearchOptions,
    language?: Language
  ): StatsSearchResult[] {
    language = language || this.context.get().language
    options = options || {}

    const { implicitsSearch, explicitsSearch } = this.buildSearch(texts, options)

    const results: StatsSearchResult[] = []
    if (implicitsSearch.sections.length > 0) {
      this.executeSearch(implicitsSearch, options, language, results)
    }

    if (explicitsSearch.sections.length > 0) {
      this.executeSearch(explicitsSearch, options, language, results)
    }

    return results
  }

  public searchExactInType(text: string, statTypesToSearch: StatType[], language?: Language): ItemStat {
    language = language || this.context.get().language

    let result: ItemStat

    for (const type of statTypesToSearch) {
      const stats = this.statsProvider.provide(type)
      for (const tradeId in stats) {
        if (!stats.hasOwnProperty(tradeId)) {
          continue
        }

        const stat = stats[tradeId]
        const statDescs = stat.text[language]
        statDescs.forEach((statDesc, statDescIndex) => {
          if (result) {
            return
          }
          const predicate = Object.getOwnPropertyNames(statDesc)[0]
          const regex = statDesc[predicate]
          if (regex.length <= 0) {
            return
          }

          const key = `${type}_${tradeId}_${statDescIndex}`
          const expr = this.cache[key] || (this.cache[key] = new RegExp(regex, 'm'))
          const test = expr.exec(text)

          if (!test) {
            return
          }

          result = {
            id: stat.id,
            mod: stat.mod,
            option: stat.option,
            negated: stat.negated,
            predicateIndex: statDescIndex,
            predicate: predicate,
            type,
            tradeId,
            values: test.slice(1).map((x) => ({ text: x })),
            indistinguishable: undefined,
          }
        })
      }
    }

    return result
  }

  private executeSearch(
    search: StatsSectionsSearch,
    options: StatsSearchOptions,
    language: Language,
    results: StatsSearchResult[]
  ): void {
    for (const type of search.types) {
      const stats = this.statsProvider.provide(type)
      const locals = this.statsLocalProvider.provide(type)
      const indistinguishables = this.statsIndistinguishableProvider.provide(type)
      for (const tradeId in stats) {
        if (!stats.hasOwnProperty(tradeId)) {
          continue
        }

        const stat = stats[tradeId]

        const statDescs = stat.text[language]
        statDescs.forEach((statDesc, statDescIndex) => {
          const predicate = Object.getOwnPropertyNames(statDesc)[0]
          const regex = statDesc[predicate]
          if (regex.length <= 0) {
            return
          }

          const key = `${type}_${tradeId}_${statDescIndex}`
          const expr = this.cache[key] || (this.cache[key] = new RegExp(regex, 'm'))
          for (let index = search.sections.length - 1; index >= 0; --index) {
            const section = search.sections[index]

            const test = expr.exec(section.text)

            if (!test) {
              continue
            }

            // Check if we're explicitly dealing with maps and map mods
            if (stat.mod === 'maps' && !options.map) {
              continue
            }

            const getKey = (id: string) => {
              return id.split(' ').join('').split('%').join('_').split('+').join('_')
            }

            const indistinguishable = indistinguishables[tradeId]

            const localKey = getKey(stat.id || '')
            if (locals[localKey] && !indistinguishable) {
              let optId = locals[localKey]
              if (stat.mod === 'local') {
                // global to local optId
                optId = locals[optId]
              }

              // item has local stat
              if (
                (options[optId] && stat.mod !== 'local') ||
                (!options[optId] && stat.mod === 'local')
              ) {
                continue
              }
            }

            const sectionText = test[0]
            let matchedText = sectionText
            let matchedIndex = statDescIndex
            let matchedPredicate = predicate
            let matchedValues = test.slice(1).map((x) => ({ text: x }))

            // Check if your predicate uses a single number
            // (e.g. '1 Added Passive Skill is a Jewel Socket' or 'Bow Attacks fire an additional Arrow')
            if (predicate === '1' && stat.option !== true) {
              // Check if the 'next' predicate is an 'any' ('#') number predicate, if it is, then use it accordingly
              const nextIndex = statDescIndex + 1
              const nextStatDesc = statDescs[nextIndex]
              if (nextStatDesc) {
                const nextStatPredicate = Object.getOwnPropertyNames(nextStatDesc)[0]
                if (nextStatPredicate.indexOf('#') !== -1) {
                  matchedIndex = nextIndex
                  matchedPredicate = nextStatPredicate
                  matchedText = nextStatDesc[nextStatPredicate]
                  matchedValues = [{ text: '1' }]
                }
              }
            }

            const itemStat: ItemStat = {
              id: stat.id,
              mod: stat.mod,
              option: stat.option,
              negated: stat.negated,
              predicateIndex: matchedIndex,
              predicate: matchedPredicate,
              type,
              tradeId,
              values: matchedValues,
              indistinguishable,
            }
            results.push({
              stat: itemStat,
              match: { index: section.index, text: matchedText },
            })

            const length = section.text.length
            if (section.text[expr.lastIndex] === '\n') {
              section.text = section.text.replace(`${sectionText}\n`, '')
            }
            if (section.text.length === length) {
              section.text = section.text.replace(`${sectionText}`, '')
            }
            if (section.text.trim().length === 0) {
              search.sections.splice(index, 1)
            }
          }
        })

        if (search.sections.length === 0) {
          return
        }
      }
    }
  }

  private buildSearch(
    texts: string[],
    options?: StatsSearchOptions
  ): {
    implicitsSearch: StatsSectionsSearch
    explicitsSearch: StatsSectionsSearch
  } {
    const implicitPhrase = ` (${StatType.Implicit})`
    const implicitsSearch: StatsSectionsSearch = {
      types: [StatType.Implicit],
      sections: [],
    }
    const enchantPhrase = ` (${StatType.Enchant})`
    const craftedPhrase = ` (${StatType.Crafted})`
    const fracturedPhrase = ` (${StatType.Fractured})`
    const explicitsSearch: StatsSectionsSearch = {
      types: [StatType.Explicit],
      sections: [],
    }
    if (options.monsterSample) {
      explicitsSearch.types.push(StatType.Monster)
    }
    if (options.ultimatum) {
      explicitsSearch.types.push(StatType.Ultimatum)
    }
    texts.forEach((text, index) => {
      const section: StatsSectionText = {
        index,
        text,
      }
      if (text.indexOf(implicitPhrase) !== -1) {
        // implicits have there own section
        implicitsSearch.sections.push(section)
      } else {
        const hasEnchants = text.indexOf(enchantPhrase) !== -1
        if (hasEnchants) {
          if (explicitsSearch.types.indexOf(StatType.Enchant) === -1) {
            explicitsSearch.types.push(StatType.Enchant)
          }
        }

        const hasCrafteds = text.indexOf(craftedPhrase) !== -1
        if (hasCrafteds) {
          if (explicitsSearch.types.indexOf(StatType.Crafted) === -1) {
            explicitsSearch.types.push(StatType.Crafted)
          }
        }

        const hasFractureds = text.indexOf(fracturedPhrase) !== -1
        if (hasFractureds) {
          if (explicitsSearch.types.indexOf(StatType.Fractured) === -1) {
            explicitsSearch.types.push(StatType.Fractured)
          }
        }
        explicitsSearch.sections.push(section)
      }
    })
    return { implicitsSearch, explicitsSearch }
  }
}
