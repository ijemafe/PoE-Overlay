import { UserSettings } from 'src/app/layout/type';
import { Rectangle } from '@app/type';
import { Currency } from './currency.type';
import { Point } from 'electron';

export type EnumDictionary<T extends string | symbol | number, U> = {
  [K in T]: U;
};

export interface TradeCompanionUserSettings extends UserSettings {
  tradeCompanionEnabled: boolean
  incomingTradeOptions: TradeCompanionOption[]
  outgoingTradeOptions: TradeCompanionOption[]
  stashGridBounds: Rectangle[]
  stashGrids: Map<string, StashGridType>
  showStashGridOnTrade: boolean
  highlightItemOnTrade: boolean
  showStashGridDropShadow: boolean
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
  highlightBounds?: Rectangle
}

export const STASH_TAB_CELL_COUNT_MAP = {
  [StashGridType.Normal]: 12,
  [StashGridType.Quad]: 24,
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
  itemName: string,
  itemLocation: TradeItemLocation,
  price: TradePrice,
  offer?: string,
  partyInviteSent: boolean,
  partyInviteAccepted: boolean,
  playerInHideout: boolean,
  playerLeftHideout: boolean,
  tradeRequestSent: boolean,
}

export interface TradePrice {
  amount: number,
  currency: Currency,
}

export interface TradeItemLocation {
  tabName: string,
  bounds: Rectangle,
}
