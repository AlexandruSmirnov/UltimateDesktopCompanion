/**
 * EventBus.ts
 * 
 * Implements a central event bus for asynchronous communication between components
 * using a publish-subscribe pattern. The event bus supports event prioritization,
 * persistence for critical events, and typed event definitions.
 */

// Event priority levels
export enum EventPriority {
  LOW = 0,
  NORMAL = 1,
  HIGH = 2,
  CRITICAL = 3
}

// Event interface
export interface Event<T = any> {
  type: string;
  payload: T;
  timestamp: number;
  priority: EventPriority;
  source?: string;
  id: string;
}

// Event handler type
export type EventHandler<T = any> = (event: Event<T>) => void | Promise<void>;

// Subscription interface
interface Subscription {
  eventType: string;
  handler: EventHandler;
  once: boolean;
  id: string;
}

/**
 * EventBus class implementing the publish-subscribe pattern
 * for asynchronous communication between components.
 */
export class EventBus {
  private static instance: EventBus;
  private subscriptions: Map<string, Subscription[]>;
  private eventHistory: Map<string, Event[]>;
  private readonly historyLimit: number;
  private readonly persistentEventTypes: Set<string>;

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
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
  public subscribe<T = any>(
    eventType: string,
    handler: EventHandler<T>,
    once = false
  ): string {
    if (!this.subscriptions.has(eventType)) {
      this.subscriptions.set(eventType, []);
    }

    const subscriptionId = this.generateId();
    const subscription: Subscription = {
      eventType,
      handler,
      once,
      id: subscriptionId
    };

    this.subscriptions.get(eventType)!.push(subscription);
    return subscriptionId;
  }

  /**
   * Subscribe to an event type and only handle it once
   * @param eventType The type of event to subscribe to
   * @param handler The handler function to call when the event is published
   * @returns A subscription ID that can be used to unsubscribe
   */
  public subscribeOnce<T = any>(
    eventType: string,
    handler: EventHandler<T>
  ): string {
    return this.subscribe(eventType, handler, true);
  }

  /**
   * Unsubscribe from an event using the subscription ID
   * @param subscriptionId The ID returned from subscribe or subscribeOnce
   * @returns True if the subscription was found and removed, false otherwise
   */
  public unsubscribe(subscriptionId: string): boolean {
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
  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
   */
  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }
}