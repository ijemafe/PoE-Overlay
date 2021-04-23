import { ChangeDetectionStrategy, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { EnumValues } from '@app/class';
import { ShortcutService } from '@app/service/input';
import { Rectangle, VisibleFlag } from '@app/type';
import { TradeCompanionStashGridService } from '@shared/module/poe/service/trade-companion/trade-companion-stash-grid.service';
import { StashGridType, STASH_TAB_CELL_COUNT_MAP, TradeCompanionStashGridOptions, TradeCompanionUserSettings } from '@shared/module/poe/type/trade-companion.type';
import { BehaviorSubject, Subscription } from 'rxjs';

const stashGridCompRef = 'stash-grid'

@Component({
  selector: 'app-trade-companion-stash-grid',
  templateUrl: './trade-companion-stash-grid.component.html',
  styleUrls: ['./trade-companion-stash-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TradeCompanionStashGridComponent implements OnInit, OnDestroy, OnChanges {
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
        this.enableShortcuts()
      } else {
        this.visible = false
        this.disableShortcuts()
      }
      this.stashGridOptions$.next(stashGridOptions)
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.visible) {
      this.enableShortcuts()
    } else {
      this.disableShortcuts()
    }
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

  private enableShortcuts(): void {
    if (!this.escapeSubscription) {
      const clearShortcut = () => {
        this.escapeSubscription?.unsubscribe()
        this.escapeSubscription = null
      }

      this.escapeSubscription = this.shortcutService
        .add(
          'escape',
          stashGridCompRef,
          false,
          VisibleFlag.Game, VisibleFlag.Overlay
        )
        .subscribe(() => this.cancelChanges(), clearShortcut, clearShortcut)
    }

    this.shortcutService.enableAllByRef(stashGridCompRef)
  }

  private disableShortcuts(): void {
    this.shortcutService.disableAllByRef(stashGridCompRef)
  }

  private createArray(n: number): number[] {
    return [...Array(n).keys()]
  }
}
