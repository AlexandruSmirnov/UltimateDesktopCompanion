/**
 * WebSocketServer.js
 * 
 * Provides real-time communication with the UI through WebSockets.
 */

const WebSocket = require('ws');
const EventBus = require('./MinimalEventBus');
const crypto = require('crypto');

// Default WebSocket server port
const DEFAULT_PORT = 8080;

/**
 * WebSocketServer class for real-time communication with the UI
 */
class WebSocketServer {
  constructor(options = {}) {
    this.port = options.port || DEFAULT_PORT;
    this.server = null;
    this.clients = new Map(); // Map of client ID to WebSocket connection
    this.eventBus = EventBus;
    this.eventSubscriptions = [];
    this.isSecure = options.secure || false;
    this.authEnabled = options.authEnabled || false;
    this.authTokens = new Map(); // Map of token to client ID
  }
  
  /**
   * Initialize the WebSocket server
   */
  async initialize() {
    console.log('Initializing WebSocketServer...');
    
    // Subscribe to events that should be sent to clients
    this.subscribeToEvents();
    
    console.log('WebSocketServer initialized');
  }
  
  /**
   * Start the WebSocket server
   */
  async start() {
    console.log(`Starting WebSocketServer on port ${this.port}...`);
    
    // Create WebSocket server
    this.server = new WebSocket.Server({ port: this.port });
    
    // Set up connection handler
    this.server.on('connection', this.handleConnection.bind(this));
    
    console.log('WebSocketServer started');
  }
  
  /**
   * Stop the WebSocket server
   */
  async stop() {
    console.log('Stopping WebSocketServer...');
    
    // Unsubscribe from events
    this.unsubscribeFromEvents();
    
/**
   * Handle a new WebSocket connection
   * @param {WebSocket} ws - The WebSocket connection
   * @param {Object} request - The HTTP request
   * @private
   */
  handleConnection(ws, request) {
    const clientId = this.generateClientId();
    
    console.log(`New WebSocket connection: ${clientId}`);
    
    // Store the client
    this.clients.set(clientId, {
      ws,
      id: clientId,
      authenticated: !this.authEnabled, // Auto-authenticate if auth is disabled
      subscriptions: new Set()
    });
    
    // Set up message handler
    ws.on('message', (message) => {
      this.handleMessage(clientId, message);
    });
    
    // Set up close handler
    ws.on('close', () => {
      this.handleClose(clientId);
    });
    
    // Send welcome message
    this.sendToClient(clientId, {
      type: 'connection',
      clientId,
      authRequired: this.authEnabled,
      timestamp: Date.now()
    });
  }
  
  /**
   * Handle a message from a client
   * @param {string} clientId - The client ID
   * @param {string} message - The message data
   * @private
   */
  handleMessage(clientId, message) {
    const client = this.clients.get(clientId);
    
    if (!client) {
      console.error(`Received message from unknown client: ${clientId}`);
      return;
    }
    
    try {
      const data = JSON.parse(message);
      
      // Handle different message types
      switch (data.type) {
        case 'auth':
          this.handleAuthMessage(clientId, data);
          break;
        case 'subscribe':
          this.handleSubscribeMessage(clientId, data);
          break;
        case 'unsubscribe':
          this.handleUnsubscribeMessage(clientId, data);
          break;
        case 'command':
          this.handleCommandMessage(clientId, data);
          break;
        default:
          console.warn(`Unknown message type: ${data.type}`);
      }
    } catch (error) {
      console.error(`Error handling message from client ${clientId}:`, error);
    }
  }
  
  /**
   * Handle a client disconnection
   * @param {string} clientId - The client ID
   * @private
   */
  handleClose(clientId) {
    console.log(`WebSocket connection closed: ${clientId}`);
    
    // Remove client
    this.clients.delete(clientId);
    
    // Remove any auth tokens for this client
    for (const [token, id] of this.authTokens.entries()) {
      if (id === clientId) {
        this.authTokens.delete(token);
      }
    }
  }
  
  /**
   * Generate a unique client ID
   * @returns {string} A unique client ID
   * @private
   */
  generateClientId() {
    return crypto.randomBytes(16).toString('hex');
  }
    // Close all client connections
/**
   * Subscribe to events that should be sent to clients
   * @private
   */
  subscribeToEvents() {
    // Subscribe to resource metrics
    this.eventSubscriptions.push(
      this.eventBus.subscribe('resource.metrics', (event) => {
        this.broadcastToSubscribers('resource.metrics', event.payload);
      })
    );
    
    // Subscribe to system status events
    this.eventSubscriptions.push(
      this.eventBus.subscribe('system.status', (event) => {
        this.broadcastToAll('system.status', event.payload);
      })
    );
    
    // Add more event subscriptions as needed
  }
  
  /**
   * Unsubscribe from all events
   * @private
   */
  unsubscribeFromEvents() {
    for (const subscriptionId of this.eventSubscriptions) {
      this.eventBus.unsubscribe(subscriptionId);
    }
    this.eventSubscriptions = [];
  }
  
  /**
   * Handle an authentication message
   * @param {string} clientId - The client ID
   * @param {Object} data - The message data
   * @private
   */
  handleAuthMessage(clientId, data) {
    const client = this.clients.get(clientId);
    
    if (!client) {
      return;
    }
    
    // In a real implementation, validate credentials
    // For now, just accept any auth attempt
    const token = crypto.randomBytes(32).toString('hex');
    this.authTokens.set(token, clientId);
    client.authenticated = true;
    
    // Send auth success response
    this.sendToClient(clientId, {
      type: 'auth',
      success: true,
      token,
      timestamp: Date.now()
    });
    
    console.log(`Client ${clientId} authenticated`);
  }
  
  /**
   * Handle a subscribe message
   * @param {string} clientId - The client ID
   * @param {Object} data - The message data
   * @private
   */
  handleSubscribeMessage(clientId, data) {
    const client = this.clients.get(clientId);
    
    if (!client || (this.authEnabled && !client.authenticated)) {
      return;
    }
    
    const topic = data.topic;
    
    if (!topic) {
      return;
    }
    
    client.subscriptions.add(topic);
    
    // Send subscription confirmation
    this.sendToClient(clientId, {
      type: 'subscribe',
      topic,
      success: true,
      timestamp: Date.now()
    });
    
    console.log(`Client ${clientId} subscribed to ${topic}`);
  }
  
  /**
   * Handle an unsubscribe message
   * @param {string} clientId - The client ID
   * @param {Object} data - The message data
   * @private
   */
  handleUnsubscribeMessage(clientId, data) {
    const client = this.clients.get(clientId);
    
    if (!client) {
      return;
    }
    
    const topic = data.topic;
    
    if (!topic) {
      return;
    }
    
    client.subscriptions.delete(topic);
    
    // Send unsubscription confirmation
    this.sendToClient(clientId, {
      type: 'unsubscribe',
      topic,
      success: true,
      timestamp: Date.now()
    });
    
    console.log(`Client ${clientId} unsubscribed from ${topic}`);
  }
    for (const client of this.clients.values()) {
      client.ws.close();
    }
    
/**
   * Handle a command message
   * @param {string} clientId - The client ID
   * @param {Object} data - The message data
   * @private
   */
  handleCommandMessage(clientId, data) {
    const client = this.clients.get(clientId);
    
    if (!client || (this.authEnabled && !client.authenticated)) {
      return;
    }
    
    const command = data.command;
    const params = data.params || {};
    
    if (!command) {
      return;
    }
    
    console.log(`Client ${clientId} sent command: ${command}`);
    
    // Publish command to event bus
    this.eventBus.publish('command', {
      command,
      params,
      clientId,
      timestamp: Date.now()
    });
    
    // Send command acknowledgement
    this.sendToClient(clientId, {
      type: 'command',
      command,
      received: true,
      timestamp: Date.now()
    });
  }
  
  /**
   * Send a message to a specific client
   * @param {string} clientId - The client ID
   * @param {Object} message - The message to send
   * @private
   */
  sendToClient(clientId, message) {
    const client = this.clients.get(clientId);
    
    if (!client) {
      console.warn(`Attempted to send message to unknown client: ${clientId}`);
      return;
    }
    
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  }
  
  /**
   * Broadcast a message to all connected clients
   * @param {string} type - The message type
   * @param {Object} data - The message data
   * @private
   */
  broadcastToAll(type, data) {
    const message = {
      type,
      data,
      timestamp: Date.now()
    };
    
    const messageStr = JSON.stringify(message);
    
    for (const client of this.clients.values()) {
      if (client.ws.readyState === WebSocket.OPEN && 
          (!this.authEnabled || client.authenticated)) {
        client.ws.send(messageStr);
      }
    }
  }
  
  /**
   * Broadcast a message to clients subscribed to a topic
   * @param {string} topic - The topic to broadcast to
   * @param {Object} data - The message data
   * @private
   */
  broadcastToSubscribers(topic, data) {
    const message = {
      type: 'event',
      topic,
      data,
      timestamp: Date.now()
    };
    
    const messageStr = JSON.stringify(message);
    
    for (const client of this.clients.values()) {
      if (client.ws.readyState === WebSocket.OPEN && 
          (!this.authEnabled || client.authenticated) &&
          client.subscriptions.has(topic)) {
        client.ws.send(messageStr);
      }
    }
  }
    // Close the server
    if (this.server) {
      this.server.close();
      this.server = null;
    }
    
    console.log('WebSocketServer stopped');
  }
}

module.exports = WebSocketServer;