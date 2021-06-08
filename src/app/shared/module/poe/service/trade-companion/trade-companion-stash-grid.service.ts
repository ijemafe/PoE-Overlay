import { Injectable } from '@angular/core'
import { ElectronProvider } from '@app/provider/electron.provider'
import { Rectangle } from '@app/type'
import { IpcMain, IpcRenderer, IpcMainEvent } from 'electron'
import { BehaviorSubject, Observable, from } from 'rxjs'
import { TradeCompanionStashGridOptions } from '@shared/module/poe/type/trade-companion.type'
import { WindowService, GameService } from '@app/service'

const STASH_GRID_OPTIONS_KEY = 'stash-grid-options'
const STASH_GRID_OPTIONS_REPLY_KEY = 'stash-grid-options-reply'
const CLOSED_KEY = 'closed'

@Injectable({
  providedIn: 'root',
})
export class TradeCompanionStashGridService {
  public stashGridOptions$: BehaviorSubject<TradeCompanionStashGridOptions> = new BehaviorSubject<
    TradeCompanionStashGridOptions
  >(undefined)

  private ipcMain: IpcMain
  private ipcRenderer: IpcRenderer
  private ipcMainEvent: IpcMainEvent

  private scopedStashGridOptionsEvent

  constructor(
    electronProvider: ElectronProvider,
    private readonly window: WindowService,
    private readonly game: GameService
  ) {
    this.ipcMain = electronProvider.provideIpcMain()
    this.ipcRenderer = electronProvider.provideIpcRenderer()
  }

  /**
   * Call this method only from the main window
   */
  public registerEvents(): void {
    if (!this.scopedStashGridOptionsEvent) {
      this.scopedStashGridOptionsEvent = (event, stashGridOptions) =>
        this.onStashGridOptions(event, stashGridOptions)
      this.ipcMain.on(STASH_GRID_OPTIONS_KEY, this.scopedStashGridOptionsEvent)
    }
  }

  /**
   * Call this method only from the main window
   */
  public unregisterEvents(): void {
    this.ipcMain.removeListener(STASH_GRID_OPTIONS_KEY, this.scopedStashGridOptionsEvent)
  }

  public showStashGrid(stashGridOptions: TradeCompanionStashGridOptions): Observable<void> {
    const promise = new Promise<void>((resolve, reject) => {
      this.ipcRenderer.send(STASH_GRID_OPTIONS_KEY, stashGridOptions)
      const scopedReplyEvent = (_, stashGridBounds: Rectangle) => {
        this.ipcRenderer.removeListener(CLOSED_KEY, scopedClosedEvent)
        resolve()
      }
      const scopedClosedEvent = () => {
        this.ipcRenderer.removeListener(STASH_GRID_OPTIONS_REPLY_KEY, scopedReplyEvent)
        resolve()
      }
      this.ipcRenderer.once(STASH_GRID_OPTIONS_REPLY_KEY, scopedReplyEvent)
      this.ipcRenderer.once(CLOSED_KEY, scopedClosedEvent)
    })
    return from(promise)
  }

  public hideStashGrid(): void {
    this.ipcRenderer.send(STASH_GRID_OPTIONS_KEY, null)
  }

  /**
   * Call this method only from the settings window
   */
  public editStashGrid(stashGridOptions: TradeCompanionStashGridOptions): Observable<Rectangle> {
    const promise = new Promise<Rectangle>((resolve, reject) => {
      this.ipcRenderer.send(STASH_GRID_OPTIONS_KEY, stashGridOptions)
      const scopedReplyEvent = (_, stashGridBounds: Rectangle) => {
        this.ipcRenderer.removeListener(CLOSED_KEY, scopedClosedEvent)
        resolve(stashGridBounds)
      }
      const scopedClosedEvent = () => {
        this.ipcRenderer.removeListener(STASH_GRID_OPTIONS_REPLY_KEY, scopedReplyEvent)
        resolve(null)
      }
      this.ipcRenderer.once(STASH_GRID_OPTIONS_REPLY_KEY, scopedReplyEvent)
      this.ipcRenderer.once(CLOSED_KEY, scopedClosedEvent)
    })
    return from(promise)
  }

  /**
   * Call this method only from the main window
   */
  public completeStashGridEdit(stashGridBounds: Rectangle): void {
    if (this.ipcMainEvent) {
      this.stashGridOptions$.next(null)
      this.ipcMainEvent.reply(STASH_GRID_OPTIONS_REPLY_KEY, stashGridBounds)
      this.ipcMainEvent = null
    }
  }

  private onStashGridOptions(
    event: IpcMainEvent,
    stashGridOptions: TradeCompanionStashGridOptions
  ): void {
    this.completeStashGridEdit(null)
    this.ipcMainEvent = event
    this.stashGridOptions$.next(stashGridOptions)
    this.game.focus()
    this.window.focus()
  }
}
