"use strict";
/**
 * EventBusService.ts
 *
 * Implements a central event bus for asynchronous communication between components
 * using a publish-subscribe pattern. The event bus supports event prioritization,
 * persistence for critical events, and typed event definitions.
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
 * EventBus class implementing the publish-subscribe pattern
 * for asynchronous communication between components.
 */
class EventBus {
    /**
     * Private constructor to enforce singleton pattern
     */
    constructor() {
        this.subscriptions = new Map();
        this.eventHistory = new Map();
        this.historyLimit = 100; // Default history limit per event type
        this.persistentEventTypes = new Set();
    }
    /**
     * Get the singleton instance of EventBus
  /**
     * Subscribe to an event type
     * @param eventType The type of event to subscribe to
     * @param handler The handler function to call when the event is published
     * @param once Whether the handler should be called only once
     * @returns A subscription ID that can be used to unsubscribe
     */
    subscribe(eventType, handler, once = false) {
        if (!this.subscriptions.has(eventType)) {
            this.subscriptions.set(eventType, []);
        }
        const subscriptionId = this.generateId();
        const subscription = {
            eventType,
            handler,
            once,
            id: subscriptionId
        };
        this.subscriptions.get(eventType).push(subscription);
        return subscriptionId;
    }
    /**
     * Subscribe to an event type and only handle it once
     * @param eventType The type of event to subscribe to
     * @param handler The handler function to call when the event is published
     * @returns A subscription ID that can be used to unsubscribe
     */
    subscribeOnce(eventType, handler) {
        return this.subscribe(eventType, handler, true);
    }
    /**
     * Unsubscribe from an event using the subscription ID
     * @param subscriptionId The ID returned from subscribe or subscribeOnce
     * @returns True if the subscription was found and removed, false otherwise
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
     * Generate a unique ID for subscriptions and events
     * @returns A unique ID string
     */
    generateId() {
        return Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);
    }
    *() { }
}
exports.EventBus = EventBus;
/;
getInstance();
EventBus;
{
    if (!EventBus.instance) {
        EventBus.instance = new EventBus();
    }
    return EventBus.instance;
}
//# sourceMappingURL=EventBusService.js.map