import { EventEmitter, Injectable } from '@angular/core';
import { ElectronProvider } from '@app/provider/electron.provider';
import { IpcMain, IpcMainEvent, IpcRenderer } from 'electron';
import moment from 'moment';
import { forkJoin } from 'rxjs';
import { GameLogService } from '../../../../../core/service/game-log.service';
import { ExampleNotificationType, TradeNotification, TradeNotificationType } from '../../type/trade-companion.type';
import { CurrencyService } from '../currency/currency.service';

const regItemTradeOffer = /^(.+) (.+) (.+) (.+) (.+) (.+) @(From|To) ((<(.*)> )?(.+))\: (Hi, I would like to buy your (.+) listed for ([0-9\.]+) (.+) in (.+) \(stash tab "(.+)"; position: left ([0-9]+), top ([0-9]+)\)(.*)){1}/i;
const regCurrencyTradeOffer = /^(.+) (.+) (.+) (.+) (.+) (.+) @(From|To) ((<(.*)> )?(.+))\: (Hi, I'd like to buy your ([0-9\.]+) (.+) for my ([0-9\.]+) (.+) in (.+)\.(.*)){1}/i;
const regPlayerJoinedArea = /(.+) (.+) has joined the area./i;
const regPlayerLeftArea = /(.+) (.+) has left the area./i;

const logLineDateFormat = 'YYYY/MM/DD HH:mm:ss'
const fromToPlaceholder = '{fromto}'

const AddExampleTradeNotificationKey = 'trade-notification-add-example'

@Injectable({
  providedIn: 'root',
})
export class TradeNotificationsService {
  public readonly notificationAddedOrChanged = new EventEmitter<TradeNotification>()

  private ipcMain: IpcMain
  private ipcRenderer: IpcRenderer

  private notifications: TradeNotification[] = []

  private scopedAddExampleNotificationEvent

  constructor(
    electronProvider: ElectronProvider,
    private readonly gameLogService: GameLogService,
    private readonly currencyService: CurrencyService,
  ) {
    this.ipcMain = electronProvider.provideIpcMain()
    this.ipcRenderer = electronProvider.provideIpcRenderer()
    this.gameLogService.logLineAdded.subscribe((logLine: string) => this.onLogLineAdded(logLine))
  }

  /**
   * Call this method only from the main window
   */
  public registerEvents() {
    if (!this.scopedAddExampleNotificationEvent) {
      this.scopedAddExampleNotificationEvent = (event, exampleNotificationType) => this.onAddExampleNotification(event, exampleNotificationType)
      this.ipcMain.on(AddExampleTradeNotificationKey, this.scopedAddExampleNotificationEvent)
    }
  }

  /**
   * Call this method only from the main window
   */
  public unregisterEvents() {
    this.ipcMain.removeListener(AddExampleTradeNotificationKey, this.scopedAddExampleNotificationEvent)
  }

  /**
   * Call this method only from the settings window
   */
  public addExampleTradeNotification(exampleNotificationType: ExampleNotificationType): void {
    this.ipcRenderer.send(AddExampleTradeNotificationKey, exampleNotificationType)
  }

  public dismissNotification(notification: TradeNotification): void {
    this.notifications = this.notifications.filter((tn) => tn !== notification)
  }

  private addNotification(notification: TradeNotification) {
    this.notifications.push(notification)
    this.notificationAddedOrChanged.emit(notification)
  }

  private onLogLineAdded(logLine: string): void {
    const itemTradeOfferMatch = logLine.match(regItemTradeOffer)
    if (itemTradeOfferMatch) {
      this.parseItemTradeWhisper(itemTradeOfferMatch)
      return
    }

    const currencyTradeOfferMatch = logLine.match(regCurrencyTradeOffer)
    if (currencyTradeOfferMatch) {
      this.parseCurrencyTradeWhisper(currencyTradeOfferMatch)
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

  private parseCurrencyTradeWhisper(whisperMatch: RegExpMatchArray): void {
    const playerName = whisperMatch[11]
    const currencyID = whisperMatch[14]
    const offerItemID = whisperMatch[16]
    forkJoin([this.currencyService.searchByNameType(currencyID), this.currencyService.searchByNameType(offerItemID)]).subscribe((currencies) => {
      const notification: TradeNotification = {
        text: `@${playerName} ${whisperMatch[12]}`,
        type: whisperMatch[7] === 'From' ? TradeNotificationType.Incoming : TradeNotificationType.Outgoing,
        time: moment(whisperMatch[1], logLineDateFormat),
        playerName: playerName,
        item: {
          amount: +whisperMatch[13],
          currency: currencies[0] || {
            id: currencyID,
            nameType: currencyID,
            image: null,
          }
        },
        price: {
          amount: +whisperMatch[15],
          currency: currencies[1] || {
            id: offerItemID,
            nameType: offerItemID,
            image: null,
          },
        },
        offer: whisperMatch[18],
      }
      this.addNotification(notification)
    })
  }

  private parseItemTradeWhisper(whisperMatch: RegExpMatchArray): void {
    const currencyID = whisperMatch[15]
    const playerName = whisperMatch[11]
    this.currencyService.searchById(currencyID).subscribe((currency) => {
      const notification: TradeNotification = {
        text: `@${playerName} ${whisperMatch[12]}`,
        type: whisperMatch[7] === 'From' ? TradeNotificationType.Incoming : TradeNotificationType.Outgoing,
        time: moment(whisperMatch[1], logLineDateFormat),
        playerName: playerName,
        item: whisperMatch[13],
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
      this.addNotification(notification)
    })
  }

  private onAddExampleNotification(event: IpcMainEvent, exampleNotificationType: ExampleNotificationType) {
    let logLine: string
    switch (exampleNotificationType) {
      case ExampleNotificationType.Item:
        //2021/04/16 17:04:56 26257593 bb3 [INFO Client 24612] @From FakePlayerName: Hi, I would like to buy your level 14 0% Steelskin listed for 1 alch in Standard (stash tab "~price 1 alch #2"; position: left 3, top 9) -- Offer 1c?
        logLine = `${moment().format(logLineDateFormat)}  12345678 bb3 [INFO Client 12345] @${fromToPlaceholder} FakePlayerName: Hi, I would like to buy your level 14 0% Steelskin listed for 1 alch in Standard (stash tab "~price 1 alch #2"; position: left 3, top 9) -- Offer 1c?`
        break

      case ExampleNotificationType.Currency:
        //2021/04/16 15:48:55 12345678 bb3 [INFO Client 12345] @From FakePlayerName: Hi, I'd like to buy your 1 Exalted Orb for my 100 Chaos Orb in Standard. -- Offer 95c?
        logLine = `${moment().format(logLineDateFormat)}  12345678 bb3 [INFO Client 12345] @${fromToPlaceholder} FakePlayerName: Hi, I'd like to buy your 1 Exalted Orb for my 100 Chaos Orb in Standard. -- Offer 95c?`
        break

      default:
        return
    }
    this.onLogLineAdded(logLine.replace(fromToPlaceholder, 'To'));
    this.onLogLineAdded(logLine.replace(fromToPlaceholder, 'From'));
  }
}
