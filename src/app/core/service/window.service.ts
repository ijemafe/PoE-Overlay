import { Injectable, NgZone } from '@angular/core'
import { ElectronProvider } from '@app/provider'
import { Rectangle } from '@app/type'
import { BrowserWindow, Point } from 'electron'
import { Observable, Subject, BehaviorSubject } from 'rxjs'

@Injectable({
  providedIn: 'root',
})
export class WindowService {
  public readonly gameBounds: BehaviorSubject<Rectangle>
  private readonly window: BrowserWindow

  constructor(private readonly ngZone: NgZone, electronProvider: ElectronProvider) {
    const electron = electronProvider.provideRemote()
    this.window = electron.getCurrentWindow()
    this.gameBounds = new BehaviorSubject<Rectangle>(this.window?.getBounds() ?? {x: 0, y: 0, width: 0, height: 0})

    electronProvider.provideIpcRenderer().on('game-bounds-change', (_, bounds: Rectangle) => {
      this.gameBounds.next(bounds)
    })
  }

  public on(event: any): Observable<void> {
    const callback = new Subject<void>()
    this.window.on(event, () => {
      this.ngZone.run(() => callback.next())
    })
    return callback
  }

  public removeAllListeners(): void {
    this.window.removeAllListeners()
  }

  public getWindowBounds(): Rectangle {
    const bounds = this.window.getBounds()
    return bounds
  }

  public getOffsettedGameBounds(): Rectangle {
    const bounds = this.window.getBounds()
    const poeBounds = this.gameBounds.value
    return { x: poeBounds.x - bounds.x, y: poeBounds.y - bounds.y, width: poeBounds.width, height: poeBounds.height }
  }

  public hide(): void {
    this.window.hide()
  }

  public show(): void {
    this.window.show()
  }

  public close(): void {
    this.window.close()
  }

  public getZoom(): number {
    return this.window.webContents.zoomFactor
  }

  public setZoom(zoom: number): void {
    this.window.webContents.zoomFactor = zoom
  }

  public setSize(width: number, height: number): void {
    this.window.setSize(width, height)
  }

  public disableInput(focusable: boolean): void {
    if (focusable) {
      this.window.blur()
    }
    this.window.setIgnoreMouseEvents(true)
    if (focusable) {
      this.window.setFocusable(false)
    }
  }

  public enableInput(focusable: boolean): void {
    if (focusable) {
      this.window.setFocusable(true)
      this.window.setSkipTaskbar(true)
    }
    this.window.setIgnoreMouseEvents(false)
    if (focusable) {
      this.window.focus()
    }
  }

  public convertToLocal(point: Point): Point {
    const winBounds = this.window.getBounds()
    const poeBounds = this.gameBounds.value
    const local = {
      ...point,
    }
    local.x -= (winBounds.x - poeBounds.x)
    local.x = Math.min(Math.max(local.x, 0), winBounds.width)
    local.y -= (winBounds.y - poeBounds.y)
    local.y = Math.min(Math.max(local.y, 0), winBounds.height)
    return local
  }

  public convertToLocalScaled(local: Point): Point {
    const point = {
      ...local,
    }

    const { zoomFactor } = this.window.webContents
    point.x *= 1 / zoomFactor
    point.y *= 1 / zoomFactor
    return point
  }
}
