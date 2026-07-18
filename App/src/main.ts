import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import fs from "node:fs";
import { homedir } from 'node:os';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  // Handler for reading directory
  ipcMain.handle("list-files", async (_, dir: string) => {
    return fs.readdirSync(dir);
  });

  // Handler for reading documents
  ipcMain.handle("get-documents", async () => {
    return fs.readdirSync(path.join(homedir(), 'rubberduck/documents'));
  });

  // Handler for reading notes
  ipcMain.handle("get-notes", async () => {
    return fs.readdirSync(path.join(homedir(), 'rubberduck/notes'));
  });

  // Handler for adding files
  ipcMain.handle("add-file", async (_, filePath: string, isNote: boolean) => {
    const destDir = isNote ? path.join(homedir(), 'rubberduck/notes')
                          : path.join(homedir(), 'rubberduck/documents');
    const fileName = path.basename(filePath);
    const destPath = path.join(destDir, fileName);
    fs.copyFileSync(filePath, destPath);
    return destPath;
  });

  createWindow()
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

