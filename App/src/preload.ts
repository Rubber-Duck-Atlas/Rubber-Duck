// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

// Context Bridge for reading directory
import { contextBridge, ipcRenderer } from "electron";
contextBridge.exposeInMainWorld("api", {
  runRubberDuckQuery: (query: string, searchNotes: boolean) => ipcRenderer.invoke("rubber-duck-query", query, searchNotes),
  listFiles: (dir: string) => ipcRenderer.invoke("list-files", dir),
  getDocuments: () => ipcRenderer.invoke("get-documents"),
  getNotes: () => ipcRenderer.invoke("get-notes"),
  openAndAddFiles: (isNote: boolean) => ipcRenderer.invoke("open-and-add-files", isNote),
  moveFile: (fileName: string, isNote: boolean) => ipcRenderer.invoke("move-file", fileName, isNote),
  deleteFile: (fileName: string, isNote: boolean) => ipcRenderer.invoke("delete-file", fileName, isNote),
  readFileContent: (fileName: string, isNote: boolean) => ipcRenderer.invoke("read-file-content", fileName, isNote),
});