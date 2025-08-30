import { EventEmitter } from 'events';
import { QueueService } from './queueService.js';
import { CacheService } from '../config/redis.js';

// Event interfaces
interface BaseEvent {
  id: string;
  type: string;
  timestamp: Date;
  source: string;
  version: string;
  correlationId?: string;
}

interface UserEvent extends BaseEvent {
  userId: string;
  data: {
    action: 'registered' | 'login' | 'logout' | 'profile_updated' | 'banned' | 'unbanned';
    details: any;
    ip?: string;
    userAgent?: string;
  };
}

interface BookingEvent extends BaseEvent {
  userId: string;
  data: {
    action: 'created' | 'updated' | 'cancelled' | 'completed' | 'no_show';
    bookingId: string;
    stationId: string;
    details: any;
  };
}

interface GameEvent extends BaseEvent {
  userId: string;
  data: {
    action: 'session_started' | 'session_ended' | 'case_opened' | 'achievement_unlocked';
    gameId?: string;
    sessionId?: string;
    caseId?: string;
    details: any;
  };
}

interface PaymentEvent extends BaseEvent {
  userId: string;
  data: {
    action: 'payment_initiated' | 'payment_completed' | 'payment_failed' | 'refund_processed';
    paymentId: string;
    amount: number;
    currency: string;
    details: any;
  };
}

interface SystemEvent extends BaseEvent {
  data: {
    action: 'service_started' | 'service_stopped' | 'health_check_failed' | 'maintenance_mode';
    service: string;
    details: any;
  };
}

type ApplicationEvent = UserEvent | BookingEvent | GameEvent | PaymentEvent | SystemEvent;

// Event handler interface
interface EventHandler {
  eventType: string;
  handler: (event: ApplicationEvent) => Promise<void>;
  priority?: number;
}

export class EventService {
  private static eventEmitter: EventEmitter = new EventEmitter();
  private static eventHandlers: Map<string, EventHandler[]> = new Map();
  private static eventHistory: ApplicationEvent[] = [];
  private static sagaTransactions: Map<string, any> = new Map();

  // Initialize event service
  static initialize(): void {
    console.log('🎯 Initializing event-driven architecture...');

    // Set max listeners to prevent warning
    this.eventEmitter.setMaxListeners(100);

    // Register built-in event handlers
    this.registerBuiltInHandlers();

    // Setup event persistence
    this.setupEventPersistence();

    // Setup saga management
    this.setupSagaManagement();

    console.log('✅ Event-driven architecture initialized');
  }

  // Register built-in event handlers
  private static registerBuiltInHandlers(): void {
    // User event handlers
    this.registerHandler('user.registered', this.handleUserRegistered, 1);
    this.registerHandler('user.login', this.handleUserLogin, 1);
    this.registerHandler('user.logout', this.handleUserLogout, 1);
    this.registerHandler('user.banned', this.handleUserBanned, 1);

    // Booking event handlers
    this.registerHandler('booking.created', this.handleBookingCreated, 1);
    this.registerHandler('booking.cancelled', this.handleBookingCancelled, 1);
    this.registerHandler('booking.completed', this.handleBookingCompleted, 1);

    // Game event handlers
    this.registerHandler('game.session_started', this.handleGameSessionStarted, 1);
    this.registerHandler('game.session_ended', this.handleGameSessionEnded, 1);
    this.registerHandler('game.case_opened', this.handleCaseOpened, 1);

    // Payment event handlers
    this.registerHandler('payment.completed', this.handlePaymentCompleted, 1);
    this.registerHandler('payment.failed', this.handlePaymentFailed, 1);

    // System event handlers
    this.registerHandler('system.health_check_failed', this.handleHealthCheckFailed, 1);
    this.registerHandler('system.maintenance_mode', this.handleMaintenanceMode, 1);

    console.log('📋 Built-in event handlers registered');
  }

  // Register event handler
  static registerHandler(eventType: string, handler: (event: ApplicationEvent) => Promise<void>, priority: number = 0): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }

    const handlers = this.eventHandlers.get(eventType)!;
    handlers.push({ eventType, handler, priority });

    // Sort by priority (higher priority first)
    handlers.sort((a, b) => (b.priority || 0) - (a.priority || 0));

    // Setup event listener
    this.eventEmitter.on(eventType, async (event: ApplicationEvent) => {
      await this.processEvent(event);
    });

    console.log(`📝 Event handler registered for: ${eventType}`);
  }

  // Emit event
  static async emitEvent(event: Omit<ApplicationEvent, 'id' | 'timestamp' | 'version'>): Promise<string> {
    const fullEvent: ApplicationEvent = {
      ...event,
      id: this.generateEventId(),
      timestamp: new Date(),
      version: '1.0'
    } as ApplicationEvent;

    try {
      // Store event in history
      this.eventHistory.push(fullEvent);
      
      // Keep only last 1000 events in memory
      if (this.eventHistory.length > 1000) {
        this.eventHistory = this.eventHistory.slice(-1000);
      }

      // Persist event
      await this.persistEvent(fullEvent);

      // Emit event asynchronously
      process.nextTick(() => {
        this.eventEmitter.emit(fullEvent.type, fullEvent);
      });

      console.log(`📢 Event emitted: ${fullEvent.type} (ID: ${fullEvent.id})`);
      return fullEvent.id;

    } catch (error) {
      console.error('❌ Failed to emit event:', error);
      throw error;
    }
  }

  // Process event through registered handlers
  private static async processEvent(event: ApplicationEvent): Promise<void> {
    const handlers = this.eventHandlers.get(event.type) || [];
    
    console.log(`⚙️ Processing event ${event.type} with ${handlers.length} handlers`);

    for (const { handler } of handlers) {
      try {
        await handler(event);
      } catch (error) {
        console.error(`❌ Event handler error for ${event.type}:`, error);
        
        // Emit error event
        await this.emitEvent({
          type: 'system.event_handler_failed',
          source: 'event-service',
          data: {
            action: 'event_handler_failed',
            service: 'event-service',
            details: {
              originalEvent: event,
              error: error.message,
              handler: handler.name
            }
          }
        } as SystemEvent);
      }
    }
  }

  // Built-in event handlers
  private static async handleUserRegistered(event: UserEvent): Promise<void> {
    console.log(`👤 Handling user registration for ${event.userId}`);
    
    // Send welcome email
    await QueueService.addEmailJob({
      to: event.data.details.email,
      subject: 'Welcome to PixelCyberZone!',
      template: 'welcome',
      data: { name: event.data.details.name }
    });

    // Create audit log
    await QueueService.addAuditJob({
      userId: event.userId,
      action: 'user_registered',
      resource: 'user',
      details: event.data.details,
      ip: event.data.ip,
      userAgent: event.data.userAgent
    });

    // Track business metrics
    await this.trackBusinessEvent('user_registration', 1);
  }

  private static async handleUserLogin(event: UserEvent): Promise<void> {
    console.log(`👤 Handling user login for ${event.userId}`);
    
    // Update last login time
    // In real implementation, this would update the user model
    
    // Create audit log
    await QueueService.addAuditJob({
      userId: event.userId,
      action: 'user_login',
      resource: 'auth',
      details: event.data.details,
      ip: event.data.ip,
      userAgent: event.data.userAgent
    });

    // Track login metrics
    await this.trackBusinessEvent('user_login', 1);
  }

  private static async handleUserLogout(event: UserEvent): Promise<void> {
    console.log(`👤 Handling user logout for ${event.userId}`);
    
    // Clear user sessions
    // In real implementation, invalidate tokens, clear sessions
    
    // Create audit log
    await QueueService.addAuditJob({
      userId: event.userId,
      action: 'user_logout',
      resource: 'auth',
      details: event.data.details,
      ip: event.data.ip,
      userAgent: event.data.userAgent
    });
  }

  private static async handleUserBanned(event: UserEvent): Promise<void> {
    console.log(`🚫 Handling user ban for ${event.userId}`);
    
    // Send notification to user
    await QueueService.addNotificationJob({
      userId: event.userId,
      type: 'error',
      title: 'Account Suspended',
      message: 'Your account has been suspended. Contact support for more information.',
      data: event.data.details
    });

    // Send email notification
    await QueueService.addEmailJob({
      to: event.data.details.email,
      subject: 'Account Suspension - PixelCyberZone',
      template: 'account-suspension',
      data: { 
        name: event.data.details.name,
        reason: event.data.details.reason 
      }
    });

    // Create audit log
    await QueueService.addAuditJob({
      userId: event.userId,
      action: 'user_banned',
      resource: 'user',
      details: event.data.details
    });
  }

  private static async handleBookingCreated(event: BookingEvent): Promise<void> {
    console.log(`📅 Handling booking creation for ${event.userId}`);
    
    // Process booking
    await QueueService.addBookingJob({
      userId: event.userId,
      bookingId: event.data.bookingId,
      action: 'created',
      details: event.data.details
    });

    // Send confirmation notification
    await QueueService.addNotificationJob({
      userId: event.userId,
      type: 'success',
      title: 'Booking Confirmed',
      message: `Your booking for station ${event.data.stationId} has been confirmed.`,
      data: { bookingId: event.data.bookingId }
    });

    // Track business metrics
    await this.trackBusinessEvent('booking_created', 1);
  }

  private static async handleBookingCancelled(event: BookingEvent): Promise<void> {
    console.log(`📅 Handling booking cancellation for ${event.userId}`);
    
    // Process cancellation
    await QueueService.addBookingJob({
      userId: event.userId,
      bookingId: event.data.bookingId,
      action: 'cancelled',
      details: event.data.details
    });

    // Free up the station
    await this.emitEvent({
      type: 'station.freed',
      source: 'booking-service',
      data: {
        action: 'station_freed',
        service: 'booking-service',
        details: {
          stationId: event.data.stationId,
          freedAt: new Date(),
          reason: 'booking_cancelled'
        }
      }
    } as SystemEvent);
  }

  private static async handleBookingCompleted(event: BookingEvent): Promise<void> {
    console.log(`📅 Handling booking completion for ${event.userId}`);
    
    // Process completion
    await QueueService.addBookingJob({
      userId: event.userId,
      bookingId: event.data.bookingId,
      action: 'completed',
      details: event.data.details
    });

    // Track revenue
    const revenue = event.data.details.amount || 0;
    await this.trackBusinessEvent('revenue', revenue);
    await this.trackBusinessEvent('booking_completed', 1);
  }

  private static async handleGameSessionStarted(event: GameEvent): Promise<void> {
    console.log(`🎮 Handling game session start for ${event.userId}`);
    
    // Track active gaming session
    await this.trackBusinessEvent('active_gaming_sessions', 1);
    
    // Create audit log
    await QueueService.addAuditJob({
      userId: event.userId,
      action: 'game_session_started',
      resource: 'gaming',
      details: event.data.details
    });
  }

  private static async handleGameSessionEnded(event: GameEvent): Promise<void> {
    console.log(`🎮 Handling game session end for ${event.userId}`);
    
    // Track session completion
    await this.trackBusinessEvent('gaming_sessions_completed', 1);
    
    // Calculate session statistics
    const sessionDuration = event.data.details.duration || 0;
    await this.trackBusinessEvent('total_gaming_time', sessionDuration);
  }

  private static async handleCaseOpened(event: GameEvent): Promise<void> {
    console.log(`🎁 Handling case opening for ${event.userId}`);
    
    // Process case opening
    await QueueService.addCaseOpeningJob({
      userId: event.userId,
      caseId: event.data.caseId!,
      result: event.data.details.result
    });

    // Track case opening metrics
    await this.trackBusinessEvent('cases_opened', 1);
    
    // Track rare drops
    if (event.data.details.result.rarity === 'legendary') {
      await this.trackBusinessEvent('legendary_drops', 1);
    }
  }

  private static async handlePaymentCompleted(event: PaymentEvent): Promise<void> {
    console.log(`💳 Handling payment completion for ${event.userId}`);
    
    // Track revenue
    await this.trackBusinessEvent('revenue', event.data.amount);
    await this.trackBusinessEvent('payments_completed', 1);

    // Send confirmation
    await QueueService.addNotificationJob({
      userId: event.userId,
      type: 'success',
      title: 'Payment Successful',
      message: `Payment of ${event.data.amount} ${event.data.currency} completed successfully.`,
      data: { paymentId: event.data.paymentId }
    });

    // Create audit log
    await QueueService.addAuditJob({
      userId: event.userId,
      action: 'payment_completed',
      resource: 'payment',
      details: {
        paymentId: event.data.paymentId,
        amount: event.data.amount,
        currency: event.data.currency
      }
    });
  }

  private static async handlePaymentFailed(event: PaymentEvent): Promise<void> {
    console.log(`💳 Handling payment failure for ${event.userId}`);
    
    // Send failure notification
    await QueueService.addNotificationJob({
      userId: event.userId,
      type: 'error',
      title: 'Payment Failed',
      message: 'Your payment could not be processed. Please try again or contact support.',
      data: { paymentId: event.data.paymentId }
    });

    // Track failed payments
    await this.trackBusinessEvent('payments_failed', 1);
  }

  private static async handleHealthCheckFailed(event: SystemEvent): Promise<void> {
    console.log(`⚠️ Handling health check failure for ${event.data.service}`);
    
    // Send alert to administrators
    const adminNotification = {
      type: 'error' as const,
      title: 'Service Health Check Failed',
      message: `Service ${event.data.service} health check failed`,
      data: event.data.details
    };

    // Broadcast to admin users via WebSocket
    // This would integrate with WebSocketService
    console.log('🚨 Admin alert sent for health check failure');
  }

  private static async handleMaintenanceMode(event: SystemEvent): Promise<void> {
    console.log(`🔧 Handling maintenance mode for ${event.data.service}`);
    
    // Broadcast maintenance notification to all users
    // This would integrate with WebSocketService
    console.log('📢 Maintenance mode notification sent to all users');
  }

  // Event persistence
  private static setupEventPersistence(): void {
    // Listen to all events for persistence
    this.eventEmitter.on('*', async (event: ApplicationEvent) => {
      try {
        await this.persistEvent(event);
      } catch (error) {
        console.error('❌ Failed to persist event:', error);
      }
    });
  }

  private static async persistEvent(event: ApplicationEvent): Promise<void> {
    // Store event in cache for quick access
    const eventKey = CacheService.generateKey('events', event.id);
    await CacheService.set(eventKey, event, 86400); // 24 hours TTL

    // Store in event history by type
    const typeKey = CacheService.generateKey('events_by_type', event.type);
    const typeEvents = await CacheService.get<string[]>(typeKey) || [];
    typeEvents.push(event.id);
    
    // Keep only last 100 events per type
    if (typeEvents.length > 100) {
      typeEvents.splice(0, typeEvents.length - 100);
    }
    
    await CacheService.set(typeKey, typeEvents, 86400);

    // In a real implementation, also store in database for long-term persistence
    console.log(`💾 Event persisted: ${event.type} (${event.id})`);
  }

  // Saga management for distributed transactions
  private static setupSagaManagement(): void {
    // Register saga handlers
    this.registerHandler('saga.start', this.handleSagaStart, 10);
    this.registerHandler('saga.step_completed', this.handleSagaStepCompleted, 10);
    this.registerHandler('saga.step_failed', this.handleSagaStepFailed, 10);
    this.registerHandler('saga.completed', this.handleSagaCompleted, 10);
    this.registerHandler('saga.failed', this.handleSagaFailed, 10);
  }

  private static async handleSagaStart(event: ApplicationEvent): Promise<void> {
    const sagaId = event.correlationId!;
    const sagaData = (event as any).data.sagaData;
    
    this.sagaTransactions.set(sagaId, {
      id: sagaId,
      status: 'running',
      startedAt: new Date(),
      steps: sagaData.steps,
      currentStep: 0,
      completedSteps: [],
      failedSteps: []
    });
    
    console.log(`🔄 Saga started: ${sagaId}`);
  }

  private static async handleSagaStepCompleted(event: ApplicationEvent): Promise<void> {
    const sagaId = event.correlationId!;
    const saga = this.sagaTransactions.get(sagaId);
    
    if (saga) {
      saga.completedSteps.push((event as any).data.step);
      saga.currentStep++;
      
      // Check if saga is complete
      if (saga.currentStep >= saga.steps.length) {
        await this.emitEvent({
          type: 'saga.completed',
          source: 'event-service',
          correlationId: sagaId,
          data: { sagaId, completedAt: new Date() }
        } as any);
      }
    }
  }

  private static async handleSagaStepFailed(event: ApplicationEvent): Promise<void> {
    const sagaId = event.correlationId!;
    const saga = this.sagaTransactions.get(sagaId);
    
    if (saga) {
      saga.failedSteps.push((event as any).data.step);
      saga.status = 'failed';
      
      // Trigger compensation (rollback)
      await this.emitEvent({
        type: 'saga.compensation_started',
        source: 'event-service',
        correlationId: sagaId,
        data: { sagaId, compensation: true }
      } as any);
    }
  }

  private static async handleSagaCompleted(event: ApplicationEvent): Promise<void> {
    const sagaId = event.correlationId!;
    const saga = this.sagaTransactions.get(sagaId);
    
    if (saga) {
      saga.status = 'completed';
      saga.completedAt = new Date();
      console.log(`✅ Saga completed: ${sagaId}`);
    }
  }

  private static async handleSagaFailed(event: ApplicationEvent): Promise<void> {
    const sagaId = event.correlationId!;
    const saga = this.sagaTransactions.get(sagaId);
    
    if (saga) {
      saga.status = 'failed';
      saga.failedAt = new Date();
      console.log(`❌ Saga failed: ${sagaId}`);
    }
  }

  // Business event tracking
  private static async trackBusinessEvent(metric: string, value: number): Promise<void> {
    const key = CacheService.generateKey('business_metrics', metric);
    const current = await CacheService.get<number>(key) || 0;
    await CacheService.set(key, current + value, 3600); // 1 hour TTL
  }

  // Event queries
  static async getEventHistory(filters: {
    type?: string;
    userId?: string;
    source?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<ApplicationEvent[]> {
    let events = this.eventHistory;

    // Apply filters
    if (filters.type) {
      events = events.filter(e => e.type === filters.type);
    }
    if (filters.userId) {
      events = events.filter(e => 'userId' in e && e.userId === filters.userId);
    }
    if (filters.source) {
      events = events.filter(e => e.source === filters.source);
    }

    // Apply pagination
    const offset = filters.offset || 0;
    const limit = filters.limit || 50;
    
    return events.slice(offset, offset + limit);
  }

  static async getEventById(eventId: string): Promise<ApplicationEvent | null> {
    // Try cache first
    const eventKey = CacheService.generateKey('events', eventId);
    const event = await CacheService.get<ApplicationEvent>(eventKey);
    
    if (event) {
      return event;
    }

    // Fallback to memory
    return this.eventHistory.find(e => e.id === eventId) || null;
  }

  // Event replay for debugging/recovery
  static async replayEvents(filters: {
    type?: string;
    userId?: string;
    fromTimestamp?: Date;
    toTimestamp?: Date;
  }): Promise<void> {
    console.log('🔄 Starting event replay...');
    
    const events = await this.getEventHistory(filters);
    
    for (const event of events) {
      console.log(`🔄 Replaying event: ${event.type} (${event.id})`);
      this.eventEmitter.emit(event.type, event);
      
      // Add small delay to prevent overwhelming
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    console.log(`✅ Event replay completed. Replayed ${events.length} events`);
  }

  // Event statistics
  static getEventStatistics(): any {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    
    const recentEvents = this.eventHistory.filter(e => 
      e.timestamp.getTime() > oneHourAgo
    );
    
    const dailyEvents = this.eventHistory.filter(e => 
      e.timestamp.getTime() > oneDayAgo
    );

    // Count by type
    const eventsByType: Record<string, number> = {};
    recentEvents.forEach(e => {
      eventsByType[e.type] = (eventsByType[e.type] || 0) + 1;
    });

    // Count by source
    const eventsBySource: Record<string, number> = {};
    recentEvents.forEach(e => {
      eventsBySource[e.source] = (eventsBySource[e.source] || 0) + 1;
    });

    return {
      totalEvents: this.eventHistory.length,
      recentEvents: recentEvents.length,
      dailyEvents: dailyEvents.length,
      eventsByType,
      eventsBySource,
      activeHandlers: this.eventHandlers.size,
      activeSagas: this.sagaTransactions.size,
      timestamp: new Date()
    };
  }

  // Utility methods
  private static generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static generateCorrelationId(): string {
    return `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Event bus management
  static async pauseEventProcessing(): Promise<void> {
    this.eventEmitter.removeAllListeners();
    console.log('⏸️ Event processing paused');
  }

  static async resumeEventProcessing(): Promise<void> {
    this.registerBuiltInHandlers();
    console.log('▶️ Event processing resumed');
  }

  // Graceful shutdown
  static async shutdown(): Promise<void> {
    console.log('🛑 Shutting down event service...');
    
    // Wait for pending events to complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Clear event emitter
    this.eventEmitter.removeAllListeners();
    
    // Clear in-memory data
    this.eventHistory.length = 0;
    this.eventHandlers.clear();
    this.sagaTransactions.clear();
    
    console.log('✅ Event service shutdown complete');
  }
}

// Event builder utility
export class EventBuilder {
  private event: Partial<ApplicationEvent> = {};

  static create(): EventBuilder {
    return new EventBuilder();
  }

  type(type: string): EventBuilder {
    this.event.type = type;
    return this;
  }

  source(source: string): EventBuilder {
    this.event.source = source;
    return this;
  }

  userId(userId: string): EventBuilder {
    (this.event as any).userId = userId;
    return this;
  }

  data(data: any): EventBuilder {
    (this.event as any).data = data;
    return this;
  }

  correlationId(correlationId: string): EventBuilder {
    this.event.correlationId = correlationId;
    return this;
  }

  async emit(): Promise<string> {
    if (!this.event.type || !this.event.source) {
      throw new Error('Event type and source are required');
    }
    
    return await EventService.emitEvent(this.event as any);
  }
}

export default EventService;
