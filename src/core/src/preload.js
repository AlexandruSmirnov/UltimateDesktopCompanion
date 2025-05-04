/**
 * Preload script for the Electron renderer process.
 * 
 * This script runs in the context of the renderer process but has access to Node.js APIs.
 * It exposes a limited set of functionality to the renderer process through the
 * contextBridge API.
 */

const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'api', {
    // System metrics
    getSystemMetrics: () => ipcRenderer.invoke('system:getMetrics'),
    subscribeToMetrics: (callback) => {
      const subscription = (event, data) => callback(data);
      ipcRenderer.on('system:metrics', subscription);
      return () => ipcRenderer.removeListener('system:metrics', subscription);
    },
    
    // Media control
    getMediaSources: () => ipcRenderer.invoke('media:getSources'),
    getMediaStatus: (sourceId) => ipcRenderer.invoke('media:getStatus', sourceId),
    controlMedia: (sourceId, command, params) => 
      ipcRenderer.invoke('media:control', sourceId, command, params),
    subscribeToMediaEvents: (callback) => {
      const subscription = (event, data) => callback(data);
      ipcRenderer.on('media:event', subscription);
      return () => ipcRenderer.removeListener('media:event', subscription);
    },
    
    // Plugin management
    getPlugins: () => ipcRenderer.invoke('plugins:getAll'),
    enablePlugin: (pluginId) => ipcRenderer.invoke('plugins:enable', pluginId),
    disablePlugin: (pluginId) => ipcRenderer.invoke('plugins:disable', pluginId),
    
    // Settings
    getSettings: () => ipcRenderer.invoke('settings:getAll'),
    setSetting: (key, value) => ipcRenderer.invoke('settings:set', key, value),
    
    // App info
    getAppInfo: () => ipcRenderer.invoke('app:getInfo'),
    
    // WebSocket connection info
    getWebSocketInfo: () => ipcRenderer.invoke('websocket:getInfo')
  }
);

// Notify main process that preload script has finished
ipcRenderer.send('preload:ready');