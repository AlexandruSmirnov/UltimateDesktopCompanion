/**
 * ResourceManager.js
 * 
 * Monitors and controls resource usage to maintain the <1% CPU and <50MB RAM footprint.
 */

const os = require('os');
const EventBus = require('./MinimalEventBus');

// Resource usage thresholds
const THRESHOLDS = {
  CPU_WARNING: 0.8,  // 80% of target (0.8% CPU)
  CPU_CRITICAL: 1.0, // 100% of target (1% CPU)
  MEMORY_WARNING: 40, // 40MB
  MEMORY_CRITICAL: 50 // 50MB
};

// Resource check interval in milliseconds
const CHECK_INTERVAL = 5000; // 5 seconds

/**
 * ResourceManager class for monitoring and controlling resource usage
 */
class ResourceManager {
  constructor() {
    this.eventBus = EventBus;
    this.checkInterval = null;
    this.resourceUsage = {
      cpu: 0,
      memory: 0,
      lastCpuInfo: null,
      lastCpuTime: 0
    };
    this.throttledComponents = new Map();
  }
  
  /**
   * Initialize the resource manager
   */
  async initialize() {
    console.log('Initializing ResourceManager...');
    
    // Initialize CPU usage tracking
    this.resourceUsage.lastCpuInfo = os.cpus();
    this.resourceUsage.lastCpuTime = Date.now();
    
    // Take initial measurements
    await this.measureResourceUsage();
    
    console.log('ResourceManager initialized');
  }
  
  /**
   * Start resource monitoring
   */
  async start() {
    console.log('Starting ResourceManager...');
    
    // Start periodic resource checks
    this.checkInterval = setInterval(() => {
      this.checkResources();
    }, CHECK_INTERVAL);
    
    console.log('ResourceManager started');
  }
  
  /**
   * Stop resource monitoring
   */
  async stop() {
    console.log('Stopping ResourceManager...');
    
    // Stop periodic resource checks
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    
    console.log('ResourceManager stopped');
  }
  
  /**
   * Check resource usage and take action if thresholds are exceeded
   * @private
/**
   * Measure current resource usage
   * @private
   */
  async measureResourceUsage() {
    // Measure CPU usage
    const currentCpuInfo = os.cpus();
    const currentTime = Date.now();
    
    if (this.resourceUsage.lastCpuInfo) {
      let totalUser = 0;
      let totalSystem = 0;
      let totalIdle = 0;
      
      for (let i = 0; i < currentCpuInfo.length; i++) {
        const oldCpu = this.resourceUsage.lastCpuInfo[i];
        const newCpu = currentCpuInfo[i];
        
        const userDiff = newCpu.times.user - oldCpu.times.user;
        const sysDiff = newCpu.times.sys - oldCpu.times.sys;
        const idleDiff = newCpu.times.idle - oldCpu.times.idle;
        
        totalUser += userDiff;
        totalSystem += sysDiff;
        totalIdle += idleDiff;
      }
      
      const totalTime = totalUser + totalSystem + totalIdle;
      const cpuUsage = (totalUser + totalSystem) / totalTime;
      
      // Convert to percentage of single CPU core
      this.resourceUsage.cpu = cpuUsage * 100 / currentCpuInfo.length;
    }
    
    this.resourceUsage.lastCpuInfo = currentCpuInfo;
    this.resourceUsage.lastCpuTime = currentTime;
    
    // Measure memory usage
    const memoryUsage = process.memoryUsage();
    this.resourceUsage.memory = Math.round(memoryUsage.rss / (1024 * 1024)); // Convert to MB
  }
  
  /**
   * Handle warning level CPU usage
   * @private
   */
  handleWarningCpuUsage() {
    console.warn(`Warning: CPU usage at ${this.resourceUsage.cpu.toFixed(2)}% (threshold: ${THRESHOLDS.CPU_WARNING}%)`);
    
    // Publish warning event
    this.eventBus.publish('resource.cpu.warning', {
      usage: this.resourceUsage.cpu,
      threshold: THRESHOLDS.CPU_WARNING
    });
    
    // Apply light throttling to non-critical components
    this.applyLightThrottling();
  }
  
  /**
   * Handle critical level CPU usage
   * @private
   */
  handleCriticalCpuUsage() {
    console.error(`Critical: CPU usage at ${this.resourceUsage.cpu.toFixed(2)}% (threshold: ${THRESHOLDS.CPU_CRITICAL}%)`);
    
    // Publish critical event
    this.eventBus.publish('resource.cpu.critical', {
      usage: this.resourceUsage.cpu,
      threshold: THRESHOLDS.CPU_CRITICAL
    });
    
    // Apply aggressive throttling
    this.applyAggressiveThrottling();
  }
  
  /**
   * Handle warning level memory usage
   * @private
   */
  handleWarningMemoryUsage() {
    console.warn(`Warning: Memory usage at ${this.resourceUsage.memory}MB (threshold: ${THRESHOLDS.MEMORY_WARNING}MB)`);
    
    // Publish warning event
    this.eventBus.publish('resource.memory.warning', {
      usage: this.resourceUsage.memory,
      threshold: THRESHOLDS.MEMORY_WARNING
    });
    
    // Suggest garbage collection
    if (global.gc) {
      console.log('Suggesting garbage collection');
      global.gc();
    }
  }
memory usage
   * @private
   */
  handleCriticalMemoryUsage() {
    console.error(`Critical: Memory usage at ${this.resourceUsage.memory}MB (threshold: ${THRESHOLDS.MEMORY_CRITICAL}MB)`);
    
    // Publish critical event
    this.eventBus.publish('resource.memory.critical', {
      usage: this.resourceUsage.memory,
      threshold: THRESHOLDS.MEMORY_CRITICAL
    });
    
    // Force garbage collection
    if (global.gc) {
      console.log('Forcing garbage collection');
      global.gc();
    }
    
    // Clear caches and non-essential data
    this.clearCaches();
  }
  
  /**
   * Apply light throttling to non-critical components
   * @private
   */
  applyLightThrottling() {
    // Reduce polling frequency for non-critical metrics
    this.eventBus.publish('resource.throttle.light', {
      cpu: this.resourceUsage.cpu,
      memory: this.resourceUsage.memory
    });
  }
  
  /**
   * Apply aggressive throttling to all components
   * @private
   */
  applyAggressiveThrottling() {
    // Significantly reduce all background activities
    this.eventBus.publish('resource.throttle.aggressive', {
      cpu: this.resourceUsage.cpu,
      memory: this.resourceUsage.memory
    });
  }
  
  /**
   * Clear caches and non-essential data
   * @private
   */
  clearCaches() {
    // Signal components to clear their caches
    this.eventBus.publish('resource.memory.clearCaches', {
      memory: this.resourceUsage.memory
    });
  }
  
  /**
   * Publish resource metrics to the event bus
   * @private
   */
  publishResourceMetrics() {
    this.eventBus.publish('resource.metrics', {
      cpu: this.resourceUsage.cpu,
      memory: this.resourceUsage.memory,
      timestamp: Date.now()
    });
  }
  
  /**
   * Register a component for throttling
   * @param {string} componentId - Unique identifier for the component
   * @param {Object} throttleHandlers - Handlers for different throttle levels
   */
  registerThrottleableComponent(componentId, throttleHandlers) {
    this.throttledComponents.set(componentId, throttleHandlers);
    
    // Subscribe to throttle events
    this.eventBus.subscribe('resource.throttle.light', () => {
      const handler = this.throttledComponents.get(componentId);
      if (handler && typeof handler.light === 'function') {
        handler.light();
      }
    });
    
    this.eventBus.subscribe('resource.throttle.aggressive', () => {
      const handler = this.throttledComponents.get(componentId);
      if (handler && typeof handler.aggressive === 'function') {
        handler.aggressive();
      }
    });
  }
  
  /**
   * Handle critical level
   */
  async checkResources() {
    await this.measureResourceUsage();
    
    // Check CPU usage
    if (this.resourceUsage.cpu >= THRESHOLDS.CPU_CRITICAL) {
      this.handleCriticalCpuUsage();
    } else if (this.resourceUsage.cpu >= THRESHOLDS.CPU_WARNING) {
      this.handleWarningCpuUsage();
    }
    
    // Check memory usage
    if (this.resourceUsage.memory >= THRESHOLDS.MEMORY_CRITICAL) {
      this.handleCriticalMemoryUsage();
    } else if (this.resourceUsage.memory >= THRESHOLDS.MEMORY_WARNING) {
      this.handleWarningMemoryUsage();
    }
    
    // Publish resource usage metrics
    this.publishResourceMetrics();
  }
}

module.exports = ResourceManager;