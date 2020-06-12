import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { UserSettings, UserSettingsComponent } from 'src/app/layout/type';
import { EnumValues } from '@app/class';

export interface TradeUserSettings extends UserSettings {
  tradeChatReadClientFile: boolean;
  tradeChatClientFilePath: string;
  chatReplyMessage: string;
  chatReplyMessageKeybinding: string;
  chatInviteLastKeybinding: string;
}

@Component({
  selector: 'app-trade-settings',
  templateUrl: './trade-settings.component.html',
  styleUrls: ['./trade-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TradeSettingsComponent implements UserSettingsComponent {
  @Input()
  public settings: TradeUserSettings;

  public load(): void {
    // stub
  }
}
