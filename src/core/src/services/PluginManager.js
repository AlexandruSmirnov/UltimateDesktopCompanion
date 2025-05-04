/**
 * PluginManager.js
 * 
 * Loads, validates, and manages third-party plugins.
 */

const fs = require('fs');
const path = require('path');
const EventBus = require('./MinimalEventBus');

// Plugin states
const PluginState = {
  UNLOADED: 'unloaded',
  LOADED: 'loaded',
  ENABLED: 'enabled',
  DISABLED: 'disabled',
  ERROR: 'error'
};

/**
 * PluginManager class for managing third-party plugins
 */
class PluginManager {
  constructor(options = {}) {
    this.pluginsDir = options.pluginsDir || path.join(process.cwd(), 'plugins');
    this.plugins = new Map(); // Map of plugin ID to plugin info
    this.eventBus = EventBus;
    this.sandboxEnabled = options.sandboxEnabled !== false; // Enable sandbox by default
  }
  
  /**
   * Initialize the plugin manager
   */
  async initialize() {
    console.log('Initializing PluginManager...');
    
    // Create plugins directory if it doesn't exist
    if (!fs.existsSync(this.pluginsDir)) {
      fs.mkdirSync(this.pluginsDir, { recursive: true });
    }
    
    // Discover plugins
    await this.discoverPlugins();
    
    console.log('PluginManager initialized');
  }
  
  /**
   * Start the plugin manager
   */
  async start() {
    console.log('Starting PluginManager...');
    
    // Enable all loaded plugins
    for (const [id, plugin] of this.plugins.entries()) {
      if (plugin.state === PluginState.LOADED && plugin.autoEnable !== false) {
        await this.enablePlugin(id);
      }
    }
    
    console.log('PluginManager started');
  }
  
  /**
   * Stop the plugin manager
   */
  async stop() {
    console.log('Stopping PluginManager...');
    
    // Disable all enabled plugins
    for (const [id, plugin] of this.plugins.entries()) {
      if (plugin.state === PluginState.ENABLED) {
        await this.disablePlugin(id);
      }
    }
    
    console.log('PluginManager stopped');
  }
  
  /**
   * Discover plugins in the plugins directory
   * @private
   */
  async discoverPlugins() {
/**
   * Load a plugin from a directory
   * @param {string} pluginDir - The plugin directory
   * @private
   */
  async loadPlugin(pluginDir) {
    const manifestPath = path.join(pluginDir, 'manifest.json');
    
    if (!fs.existsSync(manifestPath)) {
      console.warn(`No manifest.json found in ${pluginDir}`);
      return;
    }
    
    try {
      // Read and parse manifest
      const manifestContent = fs.readFileSync(manifestPath, 'utf8');
      const manifest = JSON.parse(manifestContent);
      
      // Validate manifest
      if (!this.validateManifest(manifest)) {
        console.error(`Invalid manifest for plugin in ${pluginDir}`);
        return;
      }
      
      const id = manifest.id;
      
      // Check if plugin is already loaded
      if (this.plugins.has(id)) {
        console.warn(`Plugin with ID ${id} is already loaded`);
        return;
      }
      
      // Load plugin module
      const mainPath = path.join(pluginDir, manifest.main || 'index.js');
      
      if (!fs.existsSync(mainPath)) {
        console.error(`Main file not found for plugin ${id}: ${mainPath}`);
        return;
      }
      
      // Store plugin info
      this.plugins.set(id, {
        id,
        name: manifest.name,
        version: manifest.version,
        description: manifest.description,
        author: manifest.author,
        main: mainPath,
        dir: pluginDir,
        manifest,
        instance: null,
        state: PluginState.LOADED,
        autoEnable: manifest.autoEnable !== false
      });
      
      console.log(`Loaded plugin: ${manifest.name} (${id}) v${manifest.version}`);
      
      // Publish plugin loaded event
      this.eventBus.publish('plugin.loaded', {
        id,
        name: manifest.name,
        version: manifest.version
      });
    } catch (error) {
      console.error(`Error loading plugin from ${pluginDir}:`, error);
    }
  }
  
  /**
   * Validate a plugin manifest
   * @param {Object} manifest - The plugin manifest
   * @returns {boolean} True if the manifest is valid
   * @private
   */
  validateManifest(manifest) {
    // Check required fields
    if (!manifest.id || !manifest.name || !manifest.version) {
      return false;
    }
    
    // Validate ID format (alphanumeric with dashes)
    if (!/^[a-z0-9-]+$/.test(manifest.id)) {
      return false;
    }
    
    // Validate version format (semver-like)
    if (!/^\d+\.\d+\.\d+$/.test(manifest.version)) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Enable a plugin
   * @param {string} id - The plugin ID
   * @returns {boolean} True if the plugin was enabled successfully
   */
  async enablePlugin(id) {
    const plugin = this.plugins.get(id);
    
    if (!plugin) {
      console.error(`Plugin not found: ${id}`);
      return false;
    }
    
    if (plugin.state === PluginState.ENABLED) {
      console.warn(`Plugin ${id} is already enabled`);
      return true;
    }
    
    if (plugin.state !== PluginState.LOADED && plugin.state !== PluginState.DISABLED) {
      console.error(`Cannot enable plugin ${id} in state: ${plugin.state}`);
    console.log(`Discovering plugins in ${this.pluginsDir}...`);
    
return false;
    }
    
    try {
      console.log(`Enabling plugin: ${plugin.name} (${id})`);
      
      // Load the plugin module
      const PluginModule = require(plugin.main);
      
      // Create plugin instance
      if (this.sandboxEnabled) {
        // In a real implementation, create a sandbox environment
        plugin.instance = new PluginModule(this.createPluginAPI(id));
      } else {
        plugin.instance = new PluginModule(this.createPluginAPI(id));
      }
      
      // Initialize the plugin
      if (typeof plugin.instance.initialize === 'function') {
        await plugin.instance.initialize();
      }
      
      plugin.state = PluginState.ENABLED;
      
      // Publish plugin enabled event
      this.eventBus.publish('plugin.enabled', {
        id,
        name: plugin.name,
        version: plugin.version
      });
      
      console.log(`Plugin ${id} enabled successfully`);
      return true;
    } catch (error) {
      console.error(`Error enabling plugin ${id}:`, error);
      plugin.state = PluginState.ERROR;
      return false;
    }
  }
  
  /**
   * Disable a plugin
   * @param {string} id - The plugin ID
   * @returns {boolean} True if the plugin was disabled successfully
   */
  async disablePlugin(id) {
    const plugin = this.plugins.get(id);
    
    if (!plugin) {
      console.error(`Plugin not found: ${id}`);
      return false;
    }
    
    if (plugin.state !== PluginState.ENABLED) {
      console.warn(`Plugin ${id} is not enabled`);
      return true;
    }
    
    try {
      console.log(`Disabling plugin: ${plugin.name} (${id})`);
      
      // Shutdown the plugin
      if (plugin.instance && typeof plugin.instance.shutdown === 'function') {
        await plugin.instance.shutdown();
      }
      
      plugin.state = PluginState.DISABLED;
      
      // Publish plugin disabled event
      this.eventBus.publish('plugin.disabled', {
        id,
        name: plugin.name,
        version: plugin.version
      });
      
      console.log(`Plugin ${id} disabled successfully`);
      return true;
    } catch (error) {
      console.error(`Error disabling plugin ${id}:`, error);
      plugin.state = PluginState.ERROR;
      return false;
    }
  }
  
  /**
   * Create a plugin API for a specific plugin
   * @param {string} pluginId - The plugin ID
   * @returns {Object} The plugin API
   * @private
   */
  createPluginAPI(pluginId) {
    // Create a limited API for the plugin to use
    return {
      // Event methods
      on: (eventType, handler) => {
        const subscriptionId = this.eventBus.subscribe(eventType, handler);
        return subscriptionId;
      },
      off: (subscriptionId) => {
        return this.eventBus.unsubscribe(subscriptionId);
      },
      emit: (eventType, data) => {
        // Prefix plugin events with plugin ID for isolation
        const prefixedType = `plugin.${pluginId}.${eventType}`;
        return this.eventBus.publish(prefixedType, data);
      },
      
      // Plugin info
      id: pluginId,
      plugin: this.plugins.get(pluginId)
    };
  }
    try {
      const entries = fs.readdirSync(this.pluginsDir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const pluginDir = path.join(this.pluginsDir, entry.name);
          await this.loadPlugin(pluginDir);
        }
      }
      
      console.log(`Discovered ${this.plugins.size} plugins`);
    } catch (error) {
      console.error('Error discovering plugins:', error);
    }
  }
}

module.exports = PluginManager;