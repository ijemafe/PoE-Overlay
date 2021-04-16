import { Injectable } from '@angular/core';
import { ElectronProvider } from '@app/provider/electron.provider';
import { Rectangle } from '@app/type';
import { IpcMain, IpcRenderer, IpcMainEvent } from 'electron';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { TradeCompanionStashGridOptions } from '@shared/module/poe/type/trade-companion.type';
import { WindowService, GameService } from '@app/service';

const StashGridOptionsKey = 'stash-grid-options'
const StashGridOptionsReplyKey = 'stash-grid-options-reply'
const ClosedKey = 'closed'

@Injectable({
  providedIn: 'root',
})
export class TradeCompanionStashGridService {
  public stashGridOptions$: BehaviorSubject<TradeCompanionStashGridOptions> = new BehaviorSubject<TradeCompanionStashGridOptions>(undefined);

  private ipcMain: IpcMain
  private ipcRenderer: IpcRenderer
  private ipcMainEvent: IpcMainEvent

  private scopedStashGridOptionsEvent

  constructor(
    electronProvider: ElectronProvider,
    private readonly window: WindowService,
    private readonly game: GameService,
  ) {
    this.ipcMain = electronProvider.provideIpcMain()
    this.ipcRenderer = electronProvider.provideIpcRenderer()
  }

  /**
   * Call this method only from the main window
   */
  public registerEvents() {
    if (!this.scopedStashGridOptionsEvent) {
      this.scopedStashGridOptionsEvent = (event, stashGridOptions) => this.onStashGridOptions(event, stashGridOptions)
      this.ipcMain.on(StashGridOptionsKey, this.scopedStashGridOptionsEvent)
    }
  }

  /**
   * Call this method only from the main window
   */
  public unregisterEvents() {
    this.ipcMain.removeListener(StashGridOptionsKey, this.scopedStashGridOptionsEvent)
  }

  public showStashGrid(stashGridOptions: TradeCompanionStashGridOptions): Observable<void> {
    const promise = new Promise<void>((resolve, reject) => {
      this.ipcRenderer.send(StashGridOptionsKey, stashGridOptions)
      const scopedReplyEvent = (_, stashGridBounds: Rectangle) => {
        this.ipcRenderer.removeListener(ClosedKey, scopedClosedEvent)
        resolve()
      }
      const scopedClosedEvent = () => {
        this.ipcRenderer.removeListener(StashGridOptionsReplyKey, scopedReplyEvent)
        resolve()
      }
      this.ipcRenderer.once(StashGridOptionsReplyKey, scopedReplyEvent)
      this.ipcRenderer.once(ClosedKey, scopedClosedEvent)
    })
    return from(promise)
  }

  public hideStashGrid(): void {
    this.ipcRenderer.send(StashGridOptionsKey, null)
  }

  /**
   * Call this method only from the settings window
   */
  public editStashGrid(stashGridOptions: TradeCompanionStashGridOptions): Observable<Rectangle> {
    const promise = new Promise<Rectangle>((resolve, reject) => {
      this.ipcRenderer.send(StashGridOptionsKey, stashGridOptions)
      const scopedReplyEvent = (_, stashGridBounds: Rectangle) => {
        this.ipcRenderer.removeListener(ClosedKey, scopedClosedEvent)
        resolve(stashGridBounds)
      }
      const scopedClosedEvent = () => {
        this.ipcRenderer.removeListener(StashGridOptionsReplyKey, scopedReplyEvent)
        resolve(null)
      }
      this.ipcRenderer.once(StashGridOptionsReplyKey, scopedReplyEvent)
      this.ipcRenderer.once(ClosedKey, scopedClosedEvent)
    })
    return from(promise)
  }

  /**
   * Call this method only from the main window
   */
  public completeStashGridEdit(stashGridBounds: Rectangle) {
    if (this.ipcMainEvent) {
      this.stashGridOptions$.next(null)
      this.ipcMainEvent.reply(StashGridOptionsReplyKey, stashGridBounds)
      this.ipcMainEvent = null;
    }
  }

  private onStashGridOptions(event: IpcMainEvent, stashGridOptions: TradeCompanionStashGridOptions) {
    this.completeStashGridEdit(null)
    this.ipcMainEvent = event
    this.stashGridOptions$.next(stashGridOptions)
    this.game.focus()
    this.window.focus()
  }
}
