import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { TradeCompanionUserSettings, TradeNotification, TradeNotificationType } from '@shared/module/poe/type/trade-companion.type';
import { CurrencyService } from '@shared/module/poe/service/currency/currency.service';
import moment from 'moment';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-trade-notifications-panel',
  templateUrl: './trade-notifications-panel.component.html',
  styleUrls: ['./trade-notifications-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TradeNotificationPanelComponent implements OnInit, OnDestroy {
  @Input()
  public settings: TradeCompanionUserSettings

  public notifications: TradeNotification[]

  constructor(
    private readonly currencyService: CurrencyService,
    private readonly ref: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    forkJoin([this.currencyService.searchById('chaos', this.settings.language), this.currencyService.searchById('exalted', this.settings.language)]).subscribe(
      (currencies) => {
        const dummyNotification1: TradeNotification = {
          text: 'The actual whisper text',
          type: TradeNotificationType.Incoming,
          //time: moment('2021/04/10 16:38:00', 'YYYY/MM/DD HH:mm:ss'),
          time: moment(),
          playerName: 'Wratho',
          itemName: 'Tabula',
          itemLocation: {
            tabName: '~price 10 chaos',
            bounds: {
              x: 0,
              y: 0,
              width: 1,
              height: 1,
            }
          },
          offer: 'offer',
          price: {
            amount: 10,
            currency: currencies[0],
          },
          partyInviteSent: false,
          partyInviteAccepted: false,
          playerInHideout: false,
          playerLeftHideout: false,
          tradeRequestSent: false,
        };
        const dummyNotification2: TradeNotification = {
          text: 'The actual whisper text',
          type: TradeNotificationType.Outgoing,
          //time: moment('2021/04/10 16:38:00', 'YYYY/MM/DD HH:mm:ss'),
          time: moment(),
          playerName: 'Versedii',
          itemName: 'Bottled Faith',
          itemLocation: {
            tabName: 'Sell Tab 3',
            bounds: {
              x: 5,
              y: 7,
              width: 1,
              height: 2,
            }
          },
          price: {
            amount: 100,
            currency: currencies[1],
          },
          partyInviteSent: false,
          partyInviteAccepted: false,
          playerInHideout: false,
          playerLeftHideout: false,
          tradeRequestSent: false,
        };
        this.notifications = [
          dummyNotification1,
          dummyNotification2,
        ];
        this.ref.markForCheck()
    });
  }

  ngOnDestroy(): void {
  }

  public toggleGrid(): void {
    
  }

  public onDismissNotification(tradeNotification: TradeNotification): void {
    this.notifications = this.notifications.filter((tn) => tn !== tradeNotification)
  }
}
