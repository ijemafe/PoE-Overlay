import { Injectable } from '@angular/core';
import { ElectronProvider } from '@app/provider/electron.provider';
import { Rectangle } from '@app/type';
import { IpcMain, IpcRenderer, IpcMainEvent } from 'electron';
import { BehaviorSubject, Observable, Observer, from } from 'rxjs';
import { TradeCompanionStashGridOptions } from '../../../type/trade-companion.type';
import { WindowService, GameService } from '../../../../../../core/service';

const StashGridOptionsKey = 'stash-grid-options'
const EditStashGridOptionsKey = 'stash-grid-options-edit'

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

  public showStashGrid(stashGridOptions: TradeCompanionStashGridOptions) {
    this.ipcRenderer.send(StashGridOptionsKey, stashGridOptions)
  }

  public hideStashGrid() {
    this.ipcRenderer.send(StashGridOptionsKey, null)
  }

  /**
   * Call this method only from the settings window
   */
  public editStashGrid(stashGridOptions: TradeCompanionStashGridOptions): Observable<Rectangle> {
    const promise = new Promise<Rectangle>((resolve, reject) => {
      this.ipcRenderer.send(StashGridOptionsKey, stashGridOptions)
      this.ipcRenderer.once(EditStashGridOptionsKey, (_, stashGridBounds: Rectangle) => {
        resolve(stashGridBounds)
      })
      this.ipcRenderer.once('closed', () => {
        resolve(null)
      })
    })
    return from(promise)
  }

  /**
   * Call this method only from the main window
   */
  public completeStashGridEdit(stashGridBounds: Rectangle) {
    if (this.ipcMainEvent) {
      this.stashGridOptions$.next(null)
      this.ipcMainEvent.reply(EditStashGridOptionsKey, stashGridBounds)
      this.ipcMainEvent = null;
    }
  }

  private onStashGridOptions(event: IpcMainEvent, stashGridOptions: TradeCompanionStashGridOptions) {
    if (!this.ipcMainEvent) {
      this.ipcMainEvent = event
      this.stashGridOptions$.next(stashGridOptions)
      this.game.focus()
      this.window.focus()
    } else if (!stashGridOptions) {
      this.completeStashGridEdit(null)
    }
  }
}
