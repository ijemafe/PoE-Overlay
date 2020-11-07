import { UserSettings, UserSettingsComponent } from 'src/app/layout/type'
import { Rectangle } from 'electron';
import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

export interface TradeCompanionUserSettings extends UserSettings {
  tradeCompanionEnabled: boolean
  incomingTradeOptions: TradeCompanionOption[]
  outgoingTradeOptions: TradeCompanionOption[]
  normalStashGrid: Rectangle
  quadStashGrid: Rectangle
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

@Component({
  selector: 'app-trade-companion-settings',
  templateUrl: './trade-companion-settings.component.html',
  styleUrls: ['./trade-companion-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TradeCompanionSettingsComponent implements UserSettingsComponent {
  @Input()
  public settings: TradeCompanionUserSettings

  public load(): void {
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
