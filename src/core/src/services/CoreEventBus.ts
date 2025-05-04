/**
 * CoreEventBus.ts
 * 
 * A simple event bus implementation for the core system.
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

/**
 * EventBus class for asynchronous communication between components.
 */
export class EventBus {
  private static instance: EventBus;
  private subscriptions: Map<string, Array<{ handler: EventHandler; once: boolean; id: string }>>;
  
  private constructor() {
    this.subscriptions = new Map();
  }
  
  /**
   * Get the singleton instance of EventBus
   */
  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }
  
  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
  
  /**
   * Subscribe to an event type
   */
  public subscribe<T = any>(eventType: string, handler: EventHandler<T>, once = false): string {
/**
   * Subscribe to an event type and only handle it once
   */
  public subscribeOnce<T = any>(eventType: string, handler: EventHandler<T>): string {
    return this.subscribe(eventType, handler, true);
  }
  
  /**
   * Unsubscribe from an event
   */
  public unsubscribe(id: string): boolean {
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
  public publish<T = any>(eventType: string, payload: T, priority = EventPriority.NORMAL): string {
    const id = this.generateId();
    const event: Event<T> = {
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
    const handlers = [...this.subscriptions.get(eventType)!];
    
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
    const id = this.generateId();
    
    if (!this.subscriptions.has(eventType)) {
      this.subscriptions.set(eventType, []);
    }
    
    this.subscriptions.get(eventType)!.push({ handler, once, id });
    return id;
  }
}