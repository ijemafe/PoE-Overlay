import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatTooltipDefaultOptions, MAT_TOOLTIP_DEFAULT_OPTIONS } from '@angular/material/tooltip';
import { CommandService } from '@modules/command/service/command.service';
import { SnackBarService } from '@shared/module/material/service';
import { TradeCompanionStashGridService } from '@shared/module/poe/service/trade-companion/trade-companion-stash-grid.service';
import { StashGridType, TradeCompanionOption, TradeCompanionUserSettings, TradeNotification, TradeNotificationType } from '@shared/module/poe/type/trade-companion.type';
import moment from 'moment';
import { timer } from 'rxjs';
import { delay } from 'rxjs/operators';

const tooltipDefaultOptions: MatTooltipDefaultOptions = {
  showDelay: 1000,
  hideDelay: 500,
  touchendHideDelay: 1000,
};

@Component({
  selector: 'app-trade-notification',
  templateUrl: './trade-notification.component.html',
  styleUrls: ['./trade-notification.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: MAT_TOOLTIP_DEFAULT_OPTIONS, useValue: tooltipDefaultOptions }
  ],
})
export class TradeNotificationComponent implements OnInit, OnDestroy {
  @Input()
  public settings: TradeCompanionUserSettings

  @Input()
  public notification: TradeNotification

  @Output()
  public dismissNotification = new EventEmitter<TradeNotification>()

  // Make the enum available in the html
  public TradeNotificationType = TradeNotificationType

  public collapsed = false

  public elapsedTime = '0s'

  private showingStashGrid = false

  constructor(
    private readonly stashGridService: TradeCompanionStashGridService,
    private readonly snackbar: SnackBarService,
    private readonly commandService: CommandService,
    private readonly ref: ChangeDetectorRef,
  ) {
  }

  ngOnInit(): void {
    setInterval(() => {
      const diff = moment.duration(moment().diff(this.notification.time))
      const minutes = Math.floor(diff.asMinutes())
      if (minutes > 0) {
        const hours = Math.floor(diff.asHours())
        if (hours > 0) {
          this.elapsedTime = `${hours}h ${minutes}m`
        } else {
          this.elapsedTime = `${minutes}m`
        }
      } else {
        const seconds = Math.floor(diff.asSeconds())
        this.elapsedTime = `${seconds}s`
      }
      this.ref.markForCheck()
    }, 1000)
  }

  ngOnDestroy(): void {
  }

  public dismiss(): void {
    this.dismissNotification.emit(this.notification)
  }

  public toggleCollapsed(): void {
    this.collapsed = !this.collapsed
  }

  public visitPlayerHideout(): void {
    this.commandService.command(`/hideout ${this.notification.playerName}`)
  }

  public leaveParty(): void {
    // TODO: use `/kick [playerName]` where [playerName] is your own character name, which we should allow the user to input in their settings.
    this.snackbar.warning('[TraceCompanion] Missing Feature: Leave Party')
  }

  public inviteToParty(): void {
    this.commandService.command(`/invite ${this.notification.playerName}`)
  }

  public kickFromParty(): void {
    this.commandService.command(`/kick ${this.notification.playerName}`)
    this.dismiss()
  }

  public requestTrade(): void {
    this.commandService.command(`/tradewith ${this.notification.playerName}`)
  }

  public whois(): void {
    this.commandService.command(`/whois ${this.notification.playerName}`)
  }

  public whisperPlayer(): void {
    this.commandService.command(`@${this.notification.playerName} `, false)
  }

  public repeatTradeWhisper(): void {
    this.commandService.command(this.notification.text)
  }

  public askStillInterested(): void {
    // TODO: Translate?
    this.commandService.command(`@${this.notification.playerName} Hi, are you still interested in ${this.notification.itemName} for ${this.notification.price.amount} ${this.notification.price.currency.nameType}?`)
  }

  public highlightItem(): void {
    if (this.showingStashGrid) {
      this.showingStashGrid = false
      this.stashGridService.hideStashGrid()
    } else {
      this.showingStashGrid = true
      this.stashGridService.showStashGrid({
        editMode: false,
        gridType: StashGridType.Normal,
        gridBounds: this.settings.stashGridBounds[StashGridType.Normal],
        highlightBounds: this.notification.itemLocation.bounds
      });
    }
  }

  public executeTradeOption(tradeOption: TradeCompanionOption): void {
    this.commandService.command(`@${this.notification.playerName} ${tradeOption.whisperMessage}`)
    if (tradeOption.kickAfterWhisper) {
      timer(550).subscribe(() => {
        this.kickFromParty()
        if (tradeOption.dismissNotification) {
          this.dismiss()
        }
      })
    } else if (tradeOption.dismissNotification) {
      this.dismiss()
    }
  }
}
