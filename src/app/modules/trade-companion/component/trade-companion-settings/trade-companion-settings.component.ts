import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { EnumValues } from '@app/class';
import { UserSettingsComponent } from 'src/app/layout/type';
import { WindowService } from '@app/service';
import { StashGridType, TradeCompanionUserSettings, TradeCompanionStashGridOptions, ExampleNotificationType } from '@shared/module/poe/type/trade-companion.type';
import { TradeCompanionStashGridService } from '@shared/module/poe/service/trade-companion/trade-companion-stash-grid.service';
import { TradeNotificationsService } from '../../../../shared/module/poe/service/trade-companion/trade-notifications.service';

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

  private isEditingStashGrid = false

  constructor(
    private readonly window: WindowService,
    private readonly stashGridDialogService: TradeCompanionStashGridService,
    private readonly tradeNotificationsService: TradeNotificationsService,
  ) {
    this.window.on('show').subscribe(() => {
      if (this.isEditingStashGrid) {
        this.stashGridDialogService.editStashGrid(null)
      }
    })
  }

  public load(): void {
  }

  public displayWithOpacity = (value: number) => `${Math.round(value * 100)}%`

  public onResetTradeCompanionBoundsClick(): void {
    let bounds = this.window.getOffsettedGameBounds()
    bounds.width = bounds.height = 0
    this.settings.tradeCompanionBounds = bounds
  }

  public onEditStashGridClick(gridType: StashGridType): void {
    const options: TradeCompanionStashGridOptions = {
      editMode: true,
      gridType: gridType,
      gridBounds: this.settings.stashGridBounds[gridType]
    }
    this.isEditingStashGrid = true
    this.window.hide()
    this.stashGridDialogService.editStashGrid(options).subscribe((stashGridBounds) => {
      this.isEditingStashGrid = false
      if (stashGridBounds) {
        this.settings.stashGridBounds[gridType] = stashGridBounds
      }
      this.window.show()
    });
  }

  public onAddExampleTradeNotificationClick(exampleNotificationType: ExampleNotificationType): void {
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
