import { app, BrowserWindow, ipcMain, dialog, Menu } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import fs from "node:fs";
import { homedir } from 'node:os';
import { spawn } from 'node:child_process';

// Ensure ~/rubberducky folders exist
const rubberDuckDir = path.join(homedir(), 'rubberduck');
if (!fs.existsSync(rubberDuckDir)) {
  fs.mkdirSync(rubberDuckDir, { recursive: true });
}
const documentsDir = path.join(rubberDuckDir, 'documents');
if (!fs.existsSync(documentsDir)) {
  fs.mkdirSync(documentsDir, { recursive: true });
}
const notesDir = path.join(rubberDuckDir, 'notes');
if (!fs.existsSync(notesDir)) {
  fs.mkdirSync(notesDir, { recursive: true });
}

type RubberDuckResult = {
  query: string;
  results: Array<{
    path: string;
    score: number;
    snippet: string;
  }>;
};

function parseRubberDuckOutput(output: string): RubberDuckResult {
  const queryMatch = output.match(/Top \d+ match\(es\) for '([^']+)':/);
  const query = queryMatch ? queryMatch[1] : "";

  const lines = output.split('\n');
  const resultLineRegex = /^\d+\.\s+(.+)\s+\(score:\s+([\d.]+)\)\s*$/;

  const results: RubberDuckResult["results"] = [];
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(resultLineRegex);
    if (!match) continue;

    results.push({
      path: match[1].trim(),
      score: parseFloat(match[2]),
      snippet: (lines[i + 1] ?? "").trim(),
    });
  }

  return { query, results };
}

function findRubberDuckScriptPath() {
  const candidates = [
    path.resolve(app.getAppPath(), '..', 'rubber_duck.py'),
    path.resolve(app.getAppPath(), 'rubber_duck.py'),
    path.resolve(process.cwd(), '..', 'rubber_duck.py'),
    path.resolve(process.cwd(), 'rubber_duck.py'),
  ];

  for (const scriptPath of candidates) {
    if (fs.existsSync(scriptPath)) {
      return scriptPath;
    }
  }

  throw new Error('Could not find rubber_duck.py');
}

function runRubberDuckQuery(query: string, searchNotes: boolean): Promise<RubberDuckResult> {
  return new Promise((resolve, reject) => {
    const script = findRubberDuckScriptPath();
    const python = spawn('python', [
      script,
      '--data-dir',
      path.join(homedir(), 'rubberduck', searchNotes ? 'notes' : 'documents'),
      '--query',
      query,
    ]);

    let stdout = '';
    let stderr = '';

    python.stdout.on('data', (data: Buffer) => {
      stdout += data.toString();
    });

    python.stderr.on('data', (data: Buffer) => {
      stderr += data.toString();
    });

    python.on('error', (error) => {
      reject(error);
    });

    python.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`rubber_duck.py exited with code ${code}: ${stderr.trim()}`));
        return;
      }

      resolve(parseRubberDuckOutput(stdout));
    });
  });
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {
  
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      plugins: true,
    },
    // titleBarStyle: 'hidden'
  });

  mainWindow.removeMenu();

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
  Menu.setApplicationMenu(null);

  ipcMain.handle('rubber-duck-query', async (_, query: string, searchNotes: boolean) => {
    return runRubberDuckQuery(query, searchNotes);
  });

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

  // Handler for opening file picker dialog and copying selected files
  ipcMain.handle("open-and-add-files", async (_, isNote: boolean) => {
    const win = BrowserWindow.getFocusedWindow();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const result = await dialog.showOpenDialog(win!, {
      properties: ['openFile', 'multiSelections'],
    });
    if (result.canceled || result.filePaths.length === 0) return [];
    const destDir = isNote
      ? path.join(homedir(), 'rubberduck/notes')
      : path.join(homedir(), 'rubberduck/documents');
    for (const filePath of result.filePaths) {
      const fileName = path.basename(filePath);
      fs.copyFileSync(filePath, path.join(destDir, fileName));
    }
    return fs.readdirSync(destDir);
  });

  // Handler for saving a note to the notes folder
  ipcMain.handle("save-note", async (_, fileName: string, content: string) => {
    const safeName = path.basename(fileName);
    fs.writeFileSync(path.join(notesDir, safeName), content, "utf-8");
    return fs.readdirSync(notesDir);
  });

  // Handler for saving a file to either notes or documents
  ipcMain.handle("save-file", async (_, fileName: string, content: string, isNote: boolean) => {
    const safeName = path.basename(fileName);
    const dir = isNote ? notesDir : documentsDir;
    fs.writeFileSync(path.join(dir, safeName), content, "utf-8");
    return fs.readdirSync(dir);
  });

  // Handler for reading a file's content for preview
  ipcMain.handle("read-file-content", async (_, fileName: string, isNote: boolean) => {
    const dir = isNote ? notesDir : documentsDir;
    const buffer = fs.readFileSync(path.join(dir, fileName));
    return buffer.toString("base64");
  });

  // Handler for moving a file between the documents and notes folders
  ipcMain.handle("move-file", async (_, fileName: string, isNote: boolean) => {
    const fromDir = isNote ? notesDir : documentsDir;
    const toDir = isNote ? documentsDir : notesDir;
    fs.renameSync(path.join(fromDir, fileName), path.join(toDir, fileName));
    return {
      documents: fs.readdirSync(documentsDir),
      notes: fs.readdirSync(notesDir),
    };
  });

  // Handler for deleting a file from the documents or notes folder
  ipcMain.handle("delete-file", async (_, fileName: string, isNote: boolean) => {
    const dir = isNote ? notesDir : documentsDir;
    fs.unlinkSync(path.join(dir, fileName));
    return {
      documents: fs.readdirSync(documentsDir),
      notes: fs.readdirSync(notesDir),
    };
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

