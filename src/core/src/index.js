/**
 * Core System Components
 * 
 * This file exports all the core system components for the UltimateDesktopCompanion.
 */

// Import core services
const EventBus = require('./services/MinimalEventBus');
const ServiceOrchestrator = require('./services/ServiceOrchestrator');
const ResourceManager = require('./services/ResourceManager');
const WebSocketServer = require('./services/WebSocketServer');
const PluginManager = require('./services/PluginManager');

// Export core services
module.exports = {
  EventBus,
  ServiceOrchestrator,
  ResourceManager,
  WebSocketServer,
  PluginManager,
  
  /**
   * Initialize and start the core system
   * @param {Object} options - Configuration options
   * @returns {Object} The initialized core system
   */
  async initializeCore(options = {}) {
    console.log('Initializing UltimateDesktopCompanion core system...');
    
    // Create service orchestrator
    const orchestrator = new ServiceOrchestrator();
    
    // Create core services
    const resourceManager = new ResourceManager();
    const webSocketServer = new WebSocketServer(options.webSocket || {});
    const pluginManager = new PluginManager(options.plugins || {});
    
    // Register services with the orchestrator
    orchestrator.registerService('resourceManager', resourceManager);
    orchestrator.registerService('webSocketServer', webSocketServer, ['resourceManager']);
    orchestrator.registerService('pluginManager', pluginManager, ['resourceManager', 'webSocketServer']);
    
    // Initialize and start all services
    await orchestrator.initialize();
    await orchestrator.start();
    
    console.log('UltimateDesktopCompanion core system started successfully');
    
    return {
      orchestrator,
      resourceManager,
      webSocketServer,
      pluginManager,
      eventBus: EventBus
    };
  },
  
  /**
   * Shutdown the core system
   * @param {Object} core - The core system returned from initializeCore
   */
  async shutdownCore(core) {
    console.log('Shutting down UltimateDesktopCompanion core system...');
    
    if (core && core.orchestrator) {
      await core.orchestrator.stop();
    }
    
    console.log('UltimateDesktopCompanion core system shutdown complete');
  }
};