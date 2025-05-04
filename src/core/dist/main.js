"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const index_1 = require("./index");
// Keep a global reference of the window object to prevent garbage collection
let mainWindow = null;
let coreSystem = null;
async function createWindow() {
    // Create the browser window
    mainWindow = new electron_1.BrowserWindow({
        width: 900,
        height: 600,
        webPreferences: {
            preload: path_1.default.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });
    // Load the index.html file
    mainWindow.loadFile(path_1.default.join(__dirname, '../ui/index.html'));
    // Open DevTools in development mode
    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools();
    }
    // Initialize and start all core services
    try {
        coreSystem = await (0, index_1.initializeCore)({
            webSocket: {
                port: 8080,
                secure: false,
                authEnabled: false
            },
            plugins: {
                pluginsDir: path_1.default.join(electron_1.app.getPath('userData'), 'plugins'),
                sandboxEnabled: true
            }
        });
        console.log('All core services started successfully');
    }
    catch (error) {
        console.error('Failed to start core services:', error);
    }
    // Handle window close
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}
// Create window when Electron has finished initialization
electron_1.app.whenReady().then(createWindow);
// Quit when all windows are closed, except on macOS
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        if (coreSystem) {
            (0, index_1.shutdownCore)(coreSystem).then(() => {
                console.log('All core services stopped successfully');
                electron_1.app.quit();
            }).catch((error) => {
                console.error('Error stopping services:', error);
                electron_1.app.quit();
            });
        }
        else {
            electron_1.app.quit();
        }
    }
});
// On macOS, recreate the window when the dock icon is clicked
electron_1.app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});
// Handle app before quit to ensure proper cleanup
electron_1.app.on('before-quit', async (event) => {
    if (coreSystem) {
        event.preventDefault();
        try {
            await (0, index_1.shutdownCore)(coreSystem);
            coreSystem = null;
            console.log('All core services stopped successfully');
            electron_1.app.quit();
        }
        catch (error) {
            console.error('Error stopping services:', error);
            electron_1.app.quit();
        }
    }
});
// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    // Attempt to gracefully shutdown services
    if (coreSystem) {
        (0, index_1.shutdownCore)(coreSystem).finally(() => {
            process.exit(1);
        });
    }
    else {
        process.exit(1);
    }
});
//# sourceMappingURL=main.js.map