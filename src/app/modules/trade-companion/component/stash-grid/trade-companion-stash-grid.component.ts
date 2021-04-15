import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { WindowService } from '@app/service';
import { ShortcutService } from '@app/service/input';
import { Rectangle, VisibleFlag } from '@app/type';
import { TradeCompanionStashGridService } from '@shared/module/poe/service/trade-companion/trade-companion-stash-grid.service';
import { STASH_TAB_CELL_COUNT_MAP, TradeCompanionStashGridOptions, TradeCompanionUserSettings } from '@shared/module/poe/type/trade-companion.type';
import { BehaviorSubject, Subscription } from 'rxjs';

export enum ResizeSide {
  Left,
  Right,
  Top,
  Bottom,
}

@Component({
  selector: 'app-trade-companion-stash-grid',
  templateUrl: './trade-companion-stash-grid.component.html',
  styleUrls: ['./trade-companion-stash-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TradeCompanionStashGridComponent implements OnInit, OnDestroy {
  @Input()
  public settings: TradeCompanionUserSettings

  public readonly stashGridOptions$ = new BehaviorSubject<TradeCompanionStashGridOptions>(undefined)
  public visible: boolean
  public gridBounds: Rectangle
  public cellArray: number[]

  // Make the enum available in the html
  public ResizeSide = ResizeSide

  public readonly darkerShadow: boolean = false

  private stashGridServiceSubscription: Subscription
  private escapeSubscription: Subscription

  constructor(
    private readonly stashGridService: TradeCompanionStashGridService,
    private readonly window: WindowService,
    private readonly shortcutService: ShortcutService,
  ) {
  }

  ngOnInit(): void {
    this.stashGridServiceSubscription = this.stashGridService.stashGridOptions$.subscribe((stashGridOptions) => {
      if (stashGridOptions) {
        this.visible = true
        const cellCount = STASH_TAB_CELL_COUNT_MAP[stashGridOptions.gridType]
        this.cellArray = this.createArray(cellCount)
        this.gridBounds = stashGridOptions.gridBounds ?? this.settings.stashGridBounds[stashGridOptions.gridType] ?? { x: 16, y: 134, width: 624, height: 624 }
        if (this.escapeSubscription) {
          this.escapeSubscription.unsubscribe()
        }
        // This'll override the ESC option for the settings menu. Probably settings should re-bind theirs after control is returned to it.
        this.escapeSubscription = this.shortcutService
          .add(
            'escape',
            false,
            VisibleFlag.Game, VisibleFlag.Overlay, VisibleFlag.Browser
          )
          .subscribe(() => this.cancelChanges())
      } else {
        this.visible = false
        if (this.escapeSubscription) {
          this.escapeSubscription.unsubscribe()
          this.escapeSubscription = null
        }
      }
      this.stashGridOptions$.next(stashGridOptions)
    });
  }

  ngOnDestroy(): void {
    if (this.stashGridServiceSubscription) {
      this.stashGridServiceSubscription.unsubscribe()
    }
    if (this.escapeSubscription) {
      this.escapeSubscription.unsubscribe()
    }
  }

  public saveChanges(): void {
    this.stashGridService.completeStashGridEdit(this.gridBounds)
  }

  public cancelChanges(): void {
    this.stashGridService.completeStashGridEdit(null)
  }

  private createArray(n: number): number[] {
    return [...Array(n).keys()]
  }
}
