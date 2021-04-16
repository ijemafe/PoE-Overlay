import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { EnumValues } from '@app/class';
import { ShortcutService } from '@app/service/input';
import { Rectangle, VisibleFlag } from '@app/type';
import { TradeCompanionStashGridService } from '@shared/module/poe/service/trade-companion/trade-companion-stash-grid.service';
import { StashGridType, STASH_TAB_CELL_COUNT_MAP, TradeCompanionStashGridOptions, TradeCompanionUserSettings } from '@shared/module/poe/type/trade-companion.type';
import { BehaviorSubject, Subscription } from 'rxjs';

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

  public readonly darkerShadow: boolean = false

  private stashGridServiceSubscription: Subscription
  private escapeSubscription: Subscription

  private stashGridTypes = new EnumValues(StashGridType)

  constructor(
    private readonly stashGridService: TradeCompanionStashGridService,
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

  public intersectsHighlightBounds(colIndex: number, rowIndex: number) {
    const highlightLocation = this.stashGridOptions$.value.highlightLocation
    if (highlightLocation) {
      const bounds = highlightLocation.bounds
      colIndex += 1
      rowIndex += 1
      return colIndex >= bounds.x && colIndex < (bounds.x + bounds.width) &&
        rowIndex >= bounds.y && rowIndex < (bounds.y + bounds.height)
    }
    return false
  }

  public saveChanges(): void {
    this.stashGridService.completeStashGridEdit(this.gridBounds)
  }

  public cancelChanges(): void {
    this.stashGridService.completeStashGridEdit(null)
  }

  public toggleStashGrid(): void {
    let stashGridOptions = this.stashGridOptions$.value
    stashGridOptions.gridType = ((stashGridOptions.gridType + 1) % this.stashGridTypes.keys.length)
    stashGridOptions.gridBounds = null
    this.stashGridService.stashGridOptions$.next(stashGridOptions)
  }

  private createArray(n: number): number[] {
    return [...Array(n).keys()]
  }
}
