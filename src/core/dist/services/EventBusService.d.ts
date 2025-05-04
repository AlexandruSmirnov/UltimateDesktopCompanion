/**
 * EventBusService.ts
 *
 * Implements a central event bus for asynchronous communication between components
 * using a publish-subscribe pattern. The event bus supports event prioritization,
 * persistence for critical events, and typed event definitions.
 */
export declare enum EventPriority {
    LOW = 0,
    NORMAL = 1,
    HIGH = 2,
    CRITICAL = 3
}
export interface Event<T = any> {
    type: string;
    payload: T;
    timestamp: number;
    priority: EventPriority;
    source?: string;
    id: string;
}
export type EventHandler<T = any> = (event: Event<T>) => void | Promise<void>;
/**
 * EventBus class implementing the publish-subscribe pattern
 * for asynchronous communication between components.
 */
export declare class EventBus {
    private static instance;
    private subscriptions;
    private eventHistory;
    private readonly historyLimit;
    private readonly persistentEventTypes;
    /**
     * Private constructor to enforce singleton pattern
     */
    private constructor();
    /**
     * Get the singleton instance of EventBus
  /**
     * Subscribe to an event type
     * @param eventType The type of event to subscribe to
     * @param handler The handler function to call when the event is published
     * @param once Whether the handler should be called only once
     * @returns A subscription ID that can be used to unsubscribe
     */
    subscribe<T = any>(eventType: string, handler: EventHandler<T>, once?: boolean): string;
    /**
     * Subscribe to an event type and only handle it once
     * @param eventType The type of event to subscribe to
     * @param handler The handler function to call when the event is published
     * @returns A subscription ID that can be used to unsubscribe
     */
    subscribeOnce<T = any>(eventType: string, handler: EventHandler<T>): string;
    /**
     * Unsubscribe from an event using the subscription ID
     * @param subscriptionId The ID returned from subscribe or subscribeOnce
     * @returns True if the subscription was found and removed, false otherwise
     */
    unsubscribe(subscriptionId: string): boolean;
    /**
     * Generate a unique ID for subscriptions and events
     * @returns A unique ID string
     */
    private generateId;
    (): any;
}
