/**
 * EventBus.js
 * 
 * Implements a central event bus for asynchronous communication between components
 * using a publish-subscribe pattern. The event bus supports event prioritization,
 * persistence for critical events, and typed event definitions.
 */

// Event priority levels
const EventPriority = {
  LOW: 0,
  NORMAL: 1,
  HIGH: 2,
  CRITICAL: 3
};

/**
 * EventBus class implementing the publish-subscribe pattern
 * for asynchronous communication between components.
 */
class EventBus {
  constructor() {
    if (EventBus.instance) {
      return EventBus.instance;
    }
    
    EventBus.instance = this;
    
    this.subscriptions = new Map();
    this.eventHistory = new Map();
    this.historyLimit = 100; // Default history limit per event type
    this.persistentEventTypes = new Set();
  }

  /**
   * Subscribe to an event type
   * @param {string} eventType - The type of event to subscribe to
   * @param {Function} handler - The handler function to call when the event is published
   * @param {boolean} once - Whether the handler should be called only once
   * @returns {string} A subscription ID that can be used to unsubscribe
   */
  subscribe(eventType, handler, once = false) {
    if (!this.subscriptions.has(eventType)) {
      this.subscriptions.set(eventType, []);
    }

    const subscriptionId = this.generateId();
    const subscription = {
      eventType,
/**
   * Subscribe to an event type and only handle it once
   * @param {string} eventType - The type of event to subscribe to
   * @param {Function} handler - The handler function to call when the event is published
   * @returns {string} A subscription ID that can be used to unsubscribe
   */
  subscribeOnce(eventType, handler) {
    return this.subscribe(eventType, handler, true);
  }

  /**
   * Unsubscribe from an event using the subscription ID
   * @param {string} subscriptionId - The ID returned from subscribe or subscribeOnce
   * @returns {boolean} True if the subscription was found and removed, false otherwise
   */
  unsubscribe(subscriptionId) {
    for (const [eventType, subscriptions] of this.subscriptions.entries()) {
      const index = subscriptions.findIndex(sub => sub.id === subscriptionId);
      if (index !== -1) {
        subscriptions.splice(index, 1);
        if (subscriptions.length === 0) {
          this.subscriptions.delete(eventType);
        }
        return true;
      }
    }
    return false;
  }

  /**
   * Publish an event to all subscribers
   * @param {string} eventType - The type of event to publish
   * @param {any} payload - The data to pass to the event handlers
   * @param {number} priority - The priority of the event
   * @returns {string} The ID of the published event
   */
  publish(eventType, payload, priority = EventPriority.NORMAL) {
    const event = {
      type: eventType,
      payload,
      timestamp: Date.now(),
      priority,
      id: this.generateId()
    };

    // Store event in history if needed
    this.storeEventInHistory(event);

    // No subscribers for this event type
    if (!this.subscriptions.has(eventType)) {
      return event.id;
    }

    const subscriptions = [...this.subscriptions.get(eventType)];
    
    // Process subscriptions
    for (const subscription of subscriptions) {
      try {
        subscription.handler(event);
        
        // Remove one-time subscriptions after handling
        if (subscription.once) {
          this.unsubscribe(subscription.id);
        }
      } catch (error) {
        console.error(`Error in event handler for ${eventType}:`, error);
      }
    }

    return event.id;
  }

  /**
   * Store an event in the history
   * @param {Object} event - The event to store
   * @private
   */
  storeEventInHistory(event) {
    // Only store events for persistent event types or if all events are being tracked
    if (!this.persistentEventTypes.has(event.type) && 
        !this.persistentEventTypes.has('*')) {
      return;
    }

    if (!this.eventHistory.has(event.type)) {
      this.eventHistory.set(event.type, []);
    }

    const history = this.eventHistory.get(event.type);
    history.push(event);

    // Trim history if it exceeds the limit
    if (history.length > this.historyLimit) {
      history.shift();
    }
  }

  /**
   * Get the event history for a specific event type
   * @param {string} eventType - The event type to get history for
   * @returns {Array} The event history
   */
  getEventHistory(eventType) {
    if (!this.eventHistory.has(eventType)) {
      return [];
    }
    return [...this.eventHistory.get(eventType)];
  }

  /**
   * Clear the event history for a specific event type
   * @param {string} eventType - The event type to clear history
      handler,
      once,
      id: subscriptionId
    };

    this.subscriptions.get(eventType).push(subscription);
    return subscriptionId;
  }
}

// Export the EventBus singleton
module.exports = new EventBus();