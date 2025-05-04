"use strict";
/**
 * CoreEventBus.ts
 *
 * A simple event bus implementation for the core system.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventBus = exports.EventPriority = void 0;
// Event priority levels
var EventPriority;
(function (EventPriority) {
    EventPriority[EventPriority["LOW"] = 0] = "LOW";
    EventPriority[EventPriority["NORMAL"] = 1] = "NORMAL";
    EventPriority[EventPriority["HIGH"] = 2] = "HIGH";
    EventPriority[EventPriority["CRITICAL"] = 3] = "CRITICAL";
})(EventPriority || (exports.EventPriority = EventPriority = {}));
/**
 * EventBus class for asynchronous communication between components.
 */
class EventBus {
    constructor() {
        this.id = this.generateId();
        this.subscriptions = new Map();
    }
    /**
     * Get the singleton instance of EventBus
     */
    static getInstance() {
        if (!EventBus.instance) {
            EventBus.instance = new EventBus();
        }
        return EventBus.instance;
    }
    /**
     * Generate a unique ID
     */
    generateId() {
        return Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);
    }
    /**
     * Subscribe to an event type
     */
    subscribe(eventType, handler, once = false) {
        /**
           * Subscribe to an event type and only handle it once
           */
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
            }
            catch (error) {
                console.error(`Error in event handler for ${eventType}:`, error);
            }
        }
        return id;
    }
}
exports.EventBus = EventBus;
(eventType);
{
    this.subscriptions.set(eventType, []);
}
this.subscriptions.get(eventType).push({ handler, once, id });
return id;
//# sourceMappingURL=CoreEventBus.js.map