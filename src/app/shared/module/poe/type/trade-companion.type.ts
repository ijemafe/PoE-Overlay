import { UserSettings } from 'src/app/layout/type';
import { Rectangle } from '@app/type';
import { Currency } from './currency.type';
import { Point } from 'electron';

export type EnumDictionary<T extends string | symbol | number, U> = {
  [K in T]: U;
};

export interface TradeCompanionUserSettings extends UserSettings {
  tradeCompanionEnabled: boolean
  tradeCompanionOpacity: number
  tradeCompanionBounds?: Rectangle
  maxVisibileTradeNotifications: number
  incomingTradeOptions: TradeCompanionOption[]
  outgoingTradeOptions: TradeCompanionOption[]
  stashGridBounds: Rectangle[]
  stashGrids: Map<string, StashGridType>
  showStashGridOnTrade: boolean
}

export interface TradeCompanionOption {
  buttonLabel: string
  whisperMessage: string
  kickAfterWhisper: boolean
  dismissNotification: boolean
}

export enum StashGridType {
  Normal = 0,
  Quad = 1,
}

export interface TradeCompanionStashGridOptions {
  gridType: StashGridType
  editMode: boolean
  gridBounds?: Rectangle
  highlightLocation?: TradeItemLocation
}

export const STASH_TAB_CELL_COUNT_MAP = {
  [StashGridType.Normal]: 12,
  [StashGridType.Quad]: 24,
}

export enum ExampleNotificationType {
  Item = 0,
  Currency = 1,
}

export enum TradeNotificationType {
  Incoming = 0,
  Outgoing = 1,
}

export interface TradeNotification {
  text: string,
  type: TradeNotificationType
  time: moment.Moment,
  playerName: string,
  item: string | CurrencyAmount,
  itemLocation?: TradeItemLocation,
  price: CurrencyAmount,
  offer?: string,
  playerInHideout?: boolean,
  playerLeftHideout?: boolean,
}

export interface CurrencyAmount {
  amount: number,
  currency: Currency,
}

export interface TradeItemLocation {
  tabName: string,
  bounds: Rectangle,
}
