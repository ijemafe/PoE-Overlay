import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core'
import { ColorUtils, EnumValues } from '@app/class'
import { ShortcutService } from '@app/service/input'
import { Rectangle, VisibleFlag } from '@app/type'
import { TradeCompanionStashGridService } from '@shared/module/poe/service/trade-companion/trade-companion-stash-grid.service'
import {
  StashGridMode,
  StashGridType,
  STASH_TAB_CELL_COUNT_MAP,
  TradeCompanionStashGridOptions,
  TradeCompanionUserSettings,
} from '@shared/module/poe/type/trade-companion.type'
import { BehaviorSubject, Subscription } from 'rxjs'

const stashGridCompRef = 'stash-grid'

@Component({
  selector: 'app-trade-companion-stash-grid',
  templateUrl: './trade-companion-stash-grid.component.html',
  styleUrls: ['./trade-companion-stash-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TradeCompanionStashGridComponent implements OnInit, OnDestroy, OnChanges {
  // tslint:disable-next-line:no-input-rename
  @Input('settings')
  public globalSettings: TradeCompanionUserSettings

  public readonly ColorUtils = ColorUtils
  public readonly StashGridMode = StashGridMode

  private readonly _stashGridOptions$ = new BehaviorSubject<TradeCompanionStashGridOptions>(
    undefined
  )
  public get stashGridOptions$(): BehaviorSubject<TradeCompanionStashGridOptions> {
    return this._stashGridOptions$
  }
  public visible: boolean
  public gridBounds: Rectangle
  public cellArray: number[]

  public get settings(): TradeCompanionUserSettings {
    return this.stashGridOptions$.value?.settings || this.globalSettings
  }

  private stashGridServiceSubscription: Subscription
  private escapeSubscription: Subscription

  private stashGridTypes = new EnumValues(StashGridType)

  constructor(
    private readonly stashGridService: TradeCompanionStashGridService,
    private readonly shortcutService: ShortcutService
  ) {}

  public ngOnInit(): void {
    this.stashGridServiceSubscription = this.stashGridService.stashGridOptions$.subscribe(
      (stashGridOptions) => {
        if (stashGridOptions) {
          this.visible = true
          const cellCount = STASH_TAB_CELL_COUNT_MAP[stashGridOptions.gridType]
          this.cellArray = this.createArray(cellCount)
          this.gridBounds = stashGridOptions.gridBounds ??
            (stashGridOptions.settings || this.globalSettings).stashGridBounds[
              stashGridOptions.gridType
            ] ?? {
              x: 16,
              y: 134,
              width: 624,
              height: 624,
            }
          this.enableShortcuts()
        } else {
          this.visible = false
          this.disableShortcuts()
        }
        this.stashGridOptions$.next(stashGridOptions)
      }
    )
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (this.visible) {
      this.enableShortcuts()
    } else {
      this.disableShortcuts()
    }
  }

  public ngOnDestroy(): void {
    if (this.stashGridServiceSubscription) {
      this.stashGridServiceSubscription.unsubscribe()
    }
    if (this.escapeSubscription) {
      this.shortcutService.removeAllByRef(stashGridCompRef)
      this.escapeSubscription.unsubscribe()
    }
  }

  public onResizeDrag(bounds: Rectangle): void {
    // Here as a dummy to enforce bound updates
  }

  public getGridBackgroundColor(highlight: boolean): string {
    const stashGridColors = this.settings.stashGridColors
    const color = highlight ? stashGridColors.highlightBackground : stashGridColors.gridBackground
    return ColorUtils.toRGBA(color)
  }

  public getGridLineColor(highlight: boolean): string {
    const stashGridColors = this.settings.stashGridColors
    const color = highlight ? stashGridColors.highlightLine : stashGridColors.gridLine
    return ColorUtils.toRGBA(color)
  }

  public intersectsHighlightBounds(colIndex: number, rowIndex: number): boolean {
    const highlightLocation = this.stashGridOptions$.value.highlightLocation
    if (highlightLocation) {
      const bounds = highlightLocation.bounds
      colIndex += 1
      rowIndex += 1
      return (
        colIndex >= bounds.x &&
        colIndex < bounds.x + bounds.width &&
        rowIndex >= bounds.y &&
        rowIndex < bounds.y + bounds.height
      )
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
    const stashGridOptions = this.stashGridOptions$.value
    stashGridOptions.gridType = (stashGridOptions.gridType + 1) % this.stashGridTypes.keys.length
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
        .add('escape', stashGridCompRef, false, VisibleFlag.Game, VisibleFlag.Overlay)
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
