import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { TradeNotificationsService } from '@shared/module/poe/service/trade-companion/trade-notifications.service';
import { TradeCompanionUserSettings, TradeNotification } from '@shared/module/poe/type/trade-companion.type';
import { Rectangle } from 'electron';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';
import { UserSettingsService } from '../../../../layout/service';

@Component({
  selector: 'app-trade-notifications-panel',
  templateUrl: './trade-notifications-panel.component.html',
  styleUrls: ['./trade-notifications-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TradeNotificationPanelComponent implements OnInit, OnDestroy {
  @Input()
  public settings: TradeCompanionUserSettings

  @Input()
  public gameBounds: Rectangle

  @Output()
  public openSettings = new EventEmitter<void>()

  public locked = true

  public notifications: TradeNotification[] = []

  private logLineAddedSub: Subscription

  private boundsUpdate$ = new Subject<Rectangle>()
  private closeClick$ = new Subject()

  constructor(
    private readonly ref: ChangeDetectorRef,
    private readonly tradeNotificationsService: TradeNotificationsService,
    private readonly userSettingsService: UserSettingsService,
  ) {
  }

  ngOnInit(): void {
    this.logLineAddedSub = this.tradeNotificationsService.notificationAddedOrChanged.subscribe((notification) => {
      if (this.notifications.indexOf(notification) === -1) {
        this.notifications.push(notification)
      }
      this.ref.markForCheck()
    })
    this.boundsUpdate$.pipe(
      debounceTime(350),
      map((bounds) => {
        this.userSettingsService.update<TradeCompanionUserSettings>((settings) => {
          settings.tradeCompanionBounds = bounds
          return settings
        })
      })
    )
    this.closeClick$.pipe(
      debounceTime(350),
      map(() => {
        this.userSettingsService.update<TradeCompanionUserSettings>((settings) => {
          settings.tradeCompanionEnabled = false
          return settings
        })
      })
    )
  }

  ngOnDestroy(): void {
    this.logLineAddedSub.unsubscribe()
  }

  public onResizeDragEnd(bounds: Rectangle): void {
    this.boundsUpdate$.next(bounds)
  }

  public toggleGrid(): void {
  }

  public close(): void {
    this.closeClick$.next()
  }

  public onDismissNotification(notification: TradeNotification): void {
    this.notifications = this.notifications.filter((tn) => tn !== notification)
    this.tradeNotificationsService.dismissNotification(notification)
  }
}
