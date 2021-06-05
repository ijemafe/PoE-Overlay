import { ItemValue } from '../../../type'

export abstract class ItemParserUtils {
  public static parseNumber(text: string, numDecimals: number): number {
    return +text.split(/[\+%,\. ]+/).join('') / Math.pow(10, numDecimals)
  }

  public static parseItemValue(text: string, numDecimals: number): ItemValue {
    let itemValue: ItemValue
    if (text.indexOf('/') !== -1) {
      const splitted = text.split('/')
      itemValue = {
        text,
        value: ItemParserUtils.parseNumber(splitted[0], numDecimals),
        min: ItemParserUtils.parseNumber(splitted[0], numDecimals),
        max: ItemParserUtils.parseNumber(splitted[1], numDecimals),
      }
    } else {
      itemValue = {
        text,
        value: ItemParserUtils.parseNumber(text, numDecimals),
      }
    }
    return itemValue
  }
}
