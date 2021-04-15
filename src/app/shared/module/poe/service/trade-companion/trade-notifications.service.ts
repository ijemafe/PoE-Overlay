import { EventEmitter, Injectable } from '@angular/core';
import moment from 'moment';
import { GameLogService } from '../../../../../core/service/game-log.service';
import { TradeNotification, TradeNotificationType } from '../../type/trade-companion.type';
import { CurrencyService } from '../currency/currency.service';

const regTradeOffer = /^(.+) (.+) (.+) (.+) (.+) (.+) (@(From|To) ((<(.*)> )?(.+))\: Hi, I would like to buy your (.+) listed for ([0-9\.]+) (.+) in (.+) \(stash tab "(.+)"; position: left ([0-9]+), top ([0-9]+)\)(.*)){1}/i;
const regPlayerJoinedArea = /(.+) (.+) has joined the area./i;
const regPlayerLeftArea = /(.+) (.+) has left the area./i;

@Injectable({
  providedIn: 'root',
})
export class TradeNotificationsService {
  public readonly notificationAddedOrChanged = new EventEmitter<TradeNotification>()

  private notifications: TradeNotification[] = []

  constructor(
    private readonly gameLogService: GameLogService,
    private readonly currencyService: CurrencyService,
  ) {
    this.gameLogService.logLineAdded.subscribe((logLine: string) => this.onLogLineAdded(logLine))
  }

  public dismissNotification(notification: TradeNotification): void {
    this.notifications = this.notifications.filter((tn) => tn !== notification)
  }

  private onLogLineAdded(logLine: string): void {
    const tradeOfferMatch = logLine.match(regTradeOffer)
    if (tradeOfferMatch) {
      this.parseTradeWhisper(tradeOfferMatch)
      return
    }

    const playerJoinedAreaMatch = logLine.match(regPlayerJoinedArea)
    if (playerJoinedAreaMatch) {
      this.parsePlayerJoinedArea(playerJoinedAreaMatch)
      return
    }

    const playerLeftAreaMatch = logLine.match(regPlayerLeftArea)
    if (playerLeftAreaMatch) {
      this.parsePlayerLeftArea(playerLeftAreaMatch)
      return
    }
  }

  private parsePlayerJoinedArea(whisperMatch: RegExpMatchArray): void {
    const playerName = whisperMatch[2]
    const notification = this.notifications.find((notification) =>
      notification.type === TradeNotificationType.Incoming &&
      notification.playerName === playerName &&
      !notification.playerInHideout &&
      !notification.playerLeftHideout
    )
    if (notification) {
      notification.playerInHideout = true
      this.notificationAddedOrChanged.emit(notification)
    }
  }

  private parsePlayerLeftArea(whisperMatch: RegExpMatchArray): void {
    const playerName = whisperMatch[2]
    const notification = this.notifications.find((notification) =>
      notification.type === TradeNotificationType.Incoming &&
      notification.playerName === playerName &&
      notification.playerInHideout &&
      !notification.playerLeftHideout
    )
    if (notification) {
      notification.playerInHideout = false
      notification.playerLeftHideout = true
      this.notificationAddedOrChanged.emit(notification)
    }
  }

  private parseTradeWhisper(whisperMatch: RegExpMatchArray): void {
    const currencyID = whisperMatch[15]
    this.currencyService.searchById(currencyID).subscribe((currency) => {
      const notification: TradeNotification = {
        text: whisperMatch[7],
        type: whisperMatch[8] === 'From' ? TradeNotificationType.Incoming : TradeNotificationType.Outgoing,
        time: moment(whisperMatch[1], 'YYYY/MM/DD HH:mm:ss'),
        playerName: whisperMatch[12],
        itemName: whisperMatch[13],
        price: {
          amount: +whisperMatch[14],
          currency: currency || {
            id: currencyID,
            nameType: currencyID,
            image: null,
          },
        },
        itemLocation: {
          tabName: whisperMatch[17],
          bounds: {
            x: +whisperMatch[18],
            y: +whisperMatch[19],
            width: 1,
            height: 1,
          }
        },
        offer: whisperMatch[20],
      }
      this.notifications.push(notification)
      this.notificationAddedOrChanged.emit(notification)
    })
  }
}
