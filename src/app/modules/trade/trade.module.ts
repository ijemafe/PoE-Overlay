import { NgModule } from '@angular/core';
import { FEATURE_MODULES } from '@app/token';
import { Feature, FeatureModule } from '@app/type';
import { SharedModule } from '@shared/shared.module';
import { UserSettingsFeature } from 'src/app/layout/type';
import { TradeSettingsComponent, TradeUserSettings } from './component';
import { TradeChatService } from './service/trade-chat.service';

@NgModule({
    providers: [{ provide: FEATURE_MODULES, useClass: TradeModule, multi: true }],
    declarations: [TradeSettingsComponent],
    imports: [SharedModule]
})
export class TradeModule implements FeatureModule {

    constructor(private readonly chat: TradeChatService) { }

    public getSettings(): UserSettingsFeature {
        const defaultSettings: TradeUserSettings = {
            tradeChatClientFilePath: "C:\\Program Files (x86)\\Grinding Gear Games\\Path of Exile\\Logs\\Client.txt",
            tradeChatReadClientFile: false,
            chatInviteLastKeybinding: 'Alt + F1',
            chatReplyMessageKeybinding: 'ALT + F2',
            chatReplyMessage: 'Be right back, Im inside a map.',
        };
        return {
            name: 'trade.name',
            component: TradeSettingsComponent,
            defaultSettings
        };
    }

    public getFeatures(settings: TradeUserSettings): Feature[] {
        const features: Feature[] = [
            {
                name: 'chat-read-client-file',
                accelerator: settings.tradeChatReadClientFile ? '1' : '0',
            },
            {
                name: 'chat-client-file-path',
                accelerator: settings.tradeChatClientFilePath,
            },
        ];

        return features;
    }

    public run(feature: string, _: TradeUserSettings): void {
        switch (feature) {
            case 'chat-read-client-file':
                this.chat.open(feature === 'chat-read-client-file').subscribe();
                break;
            case 'chat-client-file-path':
                this.chat.open(feature === 'chat-client-file-path').subscribe();
                break;
            default:
                break;
        }
    }
}
