import { Injectable } from '@angular/core'
import { IpcRenderer, Remote, IpcMain } from 'electron'

type Electron = typeof Electron

@Injectable({
  providedIn: 'root',
})
export class ElectronProvider {
  private readonly electron: Electron

  constructor() {
    if (window?.require) {
      this.electron = window.require('electron') as Electron
    } else {
      console.warn('window.require not defined.')
    }
  }

  public provideRemote(): Remote {
    return this.electron?.remote
  }

  public provideIpcRenderer(): IpcRenderer {
    return this.electron?.ipcRenderer
  }

  public provideIpcMain(): IpcMain {
    return this.provideRemote().ipcMain
  }
}
