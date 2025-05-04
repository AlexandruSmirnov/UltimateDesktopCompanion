/**
 * SimpleEventBus.ts
 *
 * A simple event bus implementation for the core system.
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
    id: string;
}
export type EventHandler<T = any> = (event: Event<T>) => void | Promise<void>;
/**
 * A simple event bus implementation
 */
export declare class SimpleEventBus {
    private static instance;
    private subscriptions;
    private constructor();
    /**
     * Get the singleton instance
     */
    static getInstance(): SimpleEventBus;
    /**
     * Generate a unique ID
     */
    private generateId;
    /**
     * Subscribe to an event type
     */
    subscribe<T = any>(eventType: string, handler: EventHandler<T>, once?: boolean): string;
    /**
       * Subscribe to an event type and only handle it once
       */
    subscribeOnce<T = any>(eventType: string, handler: EventHandler<T>): string;
    /**
     * Unsubscribe from an event
     */
    unsubscribe(id: string): boolean;
    /**
     * Publish an event
     */
    publish<T = any>(eventType: string, payload: T, priority?: EventPriority): string;
    if(: any, this: any, subscriptions: any, has: any): any;
}
