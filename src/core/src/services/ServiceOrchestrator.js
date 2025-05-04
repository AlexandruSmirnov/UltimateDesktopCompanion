/**
 * ServiceOrchestrator.js
 * 
 * Coordinates the startup, shutdown, and operation of all core components.
 */

const EventBus = require('./MinimalEventBus');

/**
 * Service states
 */
const ServiceState = {
  UNINITIALIZED: 'uninitialized',
  INITIALIZING: 'initializing',
  INITIALIZED: 'initialized',
  STARTING: 'starting',
  RUNNING: 'running',
  STOPPING: 'stopping',
  STOPPED: 'stopped',
  ERROR: 'error'
};

/**
 * ServiceOrchestrator class for managing the lifecycle of all core services
 */
class ServiceOrchestrator {
  constructor() {
    this.services = new Map();
    this.state = ServiceState.UNINITIALIZED;
    this.eventBus = EventBus;
    
    // Register for shutdown events
    process.on('SIGINT', this.handleShutdown.bind(this));
    process.on('SIGTERM', this.handleShutdown.bind(this));
  }
  
  /**
   * Register a service with the orchestrator
   * @param {string} name - The name of the service
   * @param {Object} service - The service instance
   * @param {Array<string>} dependencies - Names of services this service depends on
   */
  registerService(name, service, dependencies = []) {
    if (this.services.has(name)) {
      throw new Error(`Service ${name} is already registered`);
    }
    
    this.services.set(name, {
      instance: service,
/**
   * Get services ordered by dependencies
   * @returns {Array} Array of [name, service] pairs in dependency order
   * @private
   */
  getOrderedServices() {
    const visited = new Set();
    const result = [];
    
    const visit = (name) => {
      if (visited.has(name)) return;
      
      visited.add(name);
      
      const service = this.services.get(name);
      if (!service) {
        throw new Error(`Service ${name} is not registered`);
      }
      
      for (const dependency of service.dependencies) {
        visit(dependency);
      }
      
      result.push([name, service]);
    };
    
    for (const name of this.services.keys()) {
      visit(name);
    }
    
    return result;
  }
  
  /**
   * Initialize all registered services
   * @returns {Promise} Promise that resolves when all services are initialized
   */
  async initialize() {
    if (this.state !== ServiceState.UNINITIALIZED) {
      throw new Error(`Cannot initialize services in state: ${this.state}`);
    }
    
    this.state = ServiceState.INITIALIZING;
    console.log('Initializing services...');
    
    // Get services in dependency order
    const orderedServices = this.getOrderedServices();
    
    // Initialize each service
    for (const [name, service] of orderedServices) {
      try {
        console.log(`Initializing service: ${name}`);
        
        if (typeof service.instance.initialize === 'function') {
          await service.instance.initialize();
        }
        
        service.state = ServiceState.INITIALIZED;
        console.log(`Service ${name} initialized successfully`);
      } catch (error) {
        service.state = ServiceState.ERROR;
        console.error(`Failed to initialize service ${name}:`, error);
        throw error;
      }
    }
    
    this.state = ServiceState.INITIALIZED;
    console.log('All services initialized successfully');
  }
  
  /**
   * Start all registered services
   * @returns {Promise} Promise that resolves when all services are started
   */
  async start() {
    if (this.state !== ServiceState.INITIALIZED) {
      throw new Error(`Cannot start services in state: ${this.state}`);
    }
    
    this.state = ServiceState.STARTING;
    console.log('Starting services...');
    
    // Get services in dependency order
    const orderedServices = this.getOrderedServices();
    
    // Start each service
    for (const [name, service] of orderedServices) {
      try {
        console.log(`Starting service: ${name}`);
        
        if (typeof service.instance.start === 'function') {
          await service.instance.start();
        }
        
        service.state = ServiceState.RUNNING;
        console.log(`Service ${name} started successfully`);
      } catch (error) {
        service.state = ServiceState.ERROR;
        console.error(`Failed to start service ${name}:`, error);
        throw error;
/**
   * Stop all registered services
   * @returns {Promise} Promise that resolves when all services are stopped
   */
  async stop() {
    if (this.state !== ServiceState.RUNNING) {
      throw new Error(`Cannot stop services in state: ${this.state}`);
    }
    
    this.state = ServiceState.STOPPING;
    console.log('Stopping services...');
    
    // Get services in reverse dependency order
    const orderedServices = this.getOrderedServices().reverse();
    
    // Stop each service
    for (const [name, service] of orderedServices) {
      try {
        console.log(`Stopping service: ${name}`);
        
        if (typeof service.instance.stop === 'function') {
          await service.instance.stop();
        }
        
        service.state = ServiceState.STOPPED;
        console.log(`Service ${name} stopped successfully`);
      } catch (error) {
        service.state = ServiceState.ERROR;
        console.error(`Failed to stop service ${name}:`, error);
        // Continue stopping other services even if one fails
      }
    }
    
    this.state = ServiceState.STOPPED;
    console.log('All services stopped successfully');
  }
  
  /**
   * Handle shutdown signals
   * @private
   */
  async handleShutdown() {
    console.log('Shutdown signal received, stopping services...');
    
    try {
      if (this.state === ServiceState.RUNNING) {
        await this.stop();
      }
      
      console.log('Shutdown complete');
      process.exit(0);
    } catch (error) {
      console.error('Error during shutdown:', error);
      process.exit(1);
    }
  }
  
  /**
   * Check if the orchestrator is running
   * @returns {boolean} True if the orchestrator is in the RUNNING state
   */
  isRunning() {
    return this.state === ServiceState.RUNNING;
  }
      }
    }
    
    this.state = ServiceState.RUNNING;
    console.log('All services started successfully');
  }
      dependencies,
      state: ServiceState.UNINITIALIZED
    });
    
    console.log(`Service ${name} registered with dependencies: ${dependencies.join(', ') || 'none'}`);
  }
}

module.exports = ServiceOrchestrator;