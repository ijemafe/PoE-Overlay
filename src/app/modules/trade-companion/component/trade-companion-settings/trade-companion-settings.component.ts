import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { Color, ColorUtils, EnumValues } from '@app/class'
import { WindowService } from '@app/service'
import { UserSettingsComponent } from '@layout/type'
import { TradeCompanionStashGridService } from '@shared/module/poe/service/trade-companion/trade-companion-stash-grid.service'
import { TradeNotificationsService } from '@shared/module/poe/service/trade-companion/trade-notifications.service'
import {
  ExampleNotificationType,
  StashGridMode,
  StashGridType,
  TradeCompanionStashGridOptions,
  TradeCompanionUserSettings,
} from '@shared/module/poe/type/trade-companion.type'

@Component({
  selector: 'app-trade-companion-settings',
  templateUrl: './trade-companion-settings.component.html',
  styleUrls: ['./trade-companion-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TradeCompanionSettingsComponent implements UserSettingsComponent {
  public stashGridTypes = new EnumValues(StashGridType)

  public exampleNotificationTypes = new EnumValues(ExampleNotificationType)

  @Input()
  public settings: TradeCompanionUserSettings

  public ColorUtils = ColorUtils

  private isShowingStashGrid = false

  constructor(
    private readonly window: WindowService,
    private readonly stashGridDialogService: TradeCompanionStashGridService,
    private readonly tradeNotificationsService: TradeNotificationsService
  ) {
    this.window.on('show').subscribe(() => {
      if (this.isShowingStashGrid) {
        this.stashGridDialogService.editStashGrid(null)
      }
    })
  }

  public load(): void {}

  public displayWithOpacity = (value: number) => `${Math.round(value * 100)}%`

  public onResetTradeCompanionBoundsClick(): void {
    const bounds = this.window.getOffsettedGameBounds()
    bounds.width = bounds.height = 0
    this.settings.tradeCompanionBounds = bounds
  }

  public onEditStashGridClick(gridType: StashGridType): void {
    const options: TradeCompanionStashGridOptions = {
      gridMode: StashGridMode.Edit,
      gridType,
      gridBounds: this.settings.stashGridBounds[gridType],
      settings: this.settings,
    }
    this.isShowingStashGrid = true
    this.window.hide()
    this.stashGridDialogService.editStashGrid(options).subscribe((stashGridBounds) => {
      this.isShowingStashGrid = false
      if (stashGridBounds) {
        this.settings.stashGridBounds[gridType] = stashGridBounds
      }
      this.window.show()
    })
  }

  public onPreviewStashGridClick(gridType: StashGridType): void {
    const options: TradeCompanionStashGridOptions = {
      gridMode: StashGridMode.Preview,
      gridType,
      gridBounds: this.settings.stashGridBounds[gridType],
      highlightLocation: {
        tabName: '[Tab Name]',
        bounds: {
          x: 6,
          y: 3,
          width: 2,
          height: 3,
        },
      },
      settings: this.settings,
    }
    this.isShowingStashGrid = true
    this.window.hide()
    this.stashGridDialogService.showStashGrid(options).subscribe(() => {
      this.isShowingStashGrid = false
      this.window.show()
    })
  }

  public onAddExampleTradeNotificationClick(
    exampleNotificationType: ExampleNotificationType
  ): void {
    this.tradeNotificationsService.addExampleTradeNotification(exampleNotificationType)
  }

  public onAddIncomingTradeOptionClick(): void {
    this.settings.incomingTradeOptions.push({
      buttonLabel: '1 min',
      whisperMessage: '1 minute please',
      kickAfterWhisper: false,
      dismissNotification: false,
    })
  }

  public onRemoveIncomingTradeOptionClick(index: number): void {
    this.settings.incomingTradeOptions.splice(index, 1)
  }

  public onAddOutgoingTradeOptionClick(): void {
    this.settings.outgoingTradeOptions.push({
      buttonLabel: 'thx',
      whisperMessage: 'Thank you very much!',
      kickAfterWhisper: false,
      dismissNotification: false,
    })
  }

  public onRemoveOutgoingTradeOptionClick(index: number): void {
    this.settings.outgoingTradeOptions.splice(index, 1)
  }
}
