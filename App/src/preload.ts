// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

// Context Bridge for reading directory
import { contextBridge, ipcRenderer } from "electron";
contextBridge.exposeInMainWorld("api", {
  listFiles: (dir: string) => ipcRenderer.invoke("list-files", dir),
  getDocuments: (dir: string) => ipcRenderer.invoke("get-documents", dir),
  getNotes: (dir: string) => ipcRenderer.invoke("get-notes", dir),
  addFile: (dir: string) => ipcRenderer.invoke("add-file", dir),
});