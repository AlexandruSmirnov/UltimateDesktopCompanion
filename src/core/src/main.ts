import { app, BrowserWindow } from 'electron';
import path from 'path';
import { initializeCore, shutdownCore } from './index';

// Keep a global reference of the window object to prevent garbage collection
let mainWindow: BrowserWindow | null = null;
let coreSystem: any = null;

async function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 900,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // Load the index.html file
  mainWindow.loadFile(path.join(__dirname, '../ui/index.html'));

  // Open DevTools in development mode
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // Initialize and start all core services
  try {
    coreSystem = await initializeCore({
      webSocket: {
        port: 8080,
        secure: false,
        authEnabled: false
      },
      plugins: {
        pluginsDir: path.join(app.getPath('userData'), 'plugins'),
        sandboxEnabled: true
      }
    });
    console.log('All core services started successfully');
  } catch (error) {
    console.error('Failed to start core services:', error);
  }

  // Handle window close
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Create window when Electron has finished initialization
app.whenReady().then(createWindow);

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (coreSystem) {
      shutdownCore(coreSystem).then(() => {
        console.log('All core services stopped successfully');
        app.quit();
      }).catch((error) => {
        console.error('Error stopping services:', error);
        app.quit();
      });
    } else {
      app.quit();
    }
  }
});

// On macOS, recreate the window when the dock icon is clicked
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Handle app before quit to ensure proper cleanup
app.on('before-quit', async (event) => {
  if (coreSystem) {
    event.preventDefault();
    try {
      await shutdownCore(coreSystem);
      coreSystem = null;
      console.log('All core services stopped successfully');
      app.quit();
    } catch (error) {
      console.error('Error stopping services:', error);
      app.quit();
    }
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  
  // Attempt to gracefully shutdown services
  if (coreSystem) {
    shutdownCore(coreSystem).finally(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});