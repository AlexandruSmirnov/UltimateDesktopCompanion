/**
 * MinimalEventBus.js
 * 
 * A minimal event bus implementation for the core system.
 */

// Event priority levels
const EventPriority = {
  LOW: 0,
  NORMAL: 1,
  HIGH: 2,
  CRITICAL: 3
};

/**
 * EventBus class for asynchronous communication between components.
 */
class EventBus {
  constructor() {
    // Singleton pattern
    if (EventBus.instance) {
      return EventBus.instance;
    }
    
    EventBus.instance = this;
    
    this.subscriptions = new Map();
  }
  
  /**
   * Generate a unique ID
   */
  generateId() {
    return Math.random().toString(36).substring(2, 15);
  }
  
  /**
   * Subscribe to an event type
   */
  subscribe(eventType, handler, once = false) {
    const id = this.generateId();
    
    if (!this.subscriptions.has(eventType)) {
      this.subscriptions.set(eventType, []);
    }
    
    this.subscriptions.get(eventType).push({ handler, once, id });
    return id;
  }
  
  /**
   * Subscribe to an event type and only handle it once
   */
  subscribeOnce(eventType, handler) {
    return this.subscribe(eventType, handler, true);
  }
  
  /**
   * Unsubscribe from an event
   */
  unsubscribe(id) {
    for (const [eventType, handlers] of this.subscriptions.entries()) {
      const index = handlers.findIndex(sub => sub.id === id);
/**
   * Publish an event
   */
  publish(eventType, payload, priority = EventPriority.NORMAL) {
    const id = this.generateId();
    const event = {
      type: eventType,
      payload,
      timestamp: Date.now(),
      priority,
      id
    };
    
    if (!this.subscriptions.has(eventType)) {
      return id;
    }
    
    // Create a copy to handle removal of once subscriptions during iteration
    const handlers = [...this.subscriptions.get(eventType)];
    
    for (const { handler, once, id: handlerId } of handlers) {
      try {
        handler(event);
        if (once) {
          this.unsubscribe(handlerId);
        }
      } catch (error) {
        console.error(`Error in event handler for ${eventType}:`, error);
      }
    }
    
    return id;
  }
      if (index !== -1) {
        handlers.splice(index, 1);
        if (handlers.length === 0) {
          this.subscriptions.delete(eventType);
        }
        return true;
      }
    }
    return false;
  }
}

// Export the singleton instance
module.exports = new EventBus();