// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

// Context Bridge for reading directory
import { contextBridge, ipcRenderer } from "electron";
contextBridge.exposeInMainWorld("api", {
  listFiles: (dir: string) => ipcRenderer.invoke("list-files", dir),
  getDocuments: () => ipcRenderer.invoke("get-documents"),
  getNotes: () => ipcRenderer.invoke("get-notes"),
  addFile: (filePath: string, isNote: boolean) => ipcRenderer.invoke("add-file", filePath, isNote),
});