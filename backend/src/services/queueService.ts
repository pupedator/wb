import { Queue, Worker, Job, QueueOptions, WorkerOptions } from 'bullmq';
import { redisClient } from '../config/redis.js';
import nodemailer from 'nodemailer';

// Queue job interfaces
interface EmailJob {
  to: string;
  subject: string;
  html: string;
  template?: string;
  data?: any;
}

interface NotificationJob {
  userId: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  data?: any;
}

interface AuditLogJob {
  userId: string;
  action: string;
  resource: string;
  details: any;
  ip?: string;
  userAgent?: string;
}

interface CaseOpeningJob {
  userId: string;
  caseId: string;
  result: any;
}

interface BookingJob {
  userId: string;
  bookingId: string;
  action: 'created' | 'cancelled' | 'completed';
  details: any;
}

export class QueueService {
  // Queue instances
  private static emailQueue: Queue;
  private static notificationQueue: Queue;
  private static auditQueue: Queue;
  private static caseOpeningQueue: Queue;
  private static bookingQueue: Queue;

  // Worker instances
  private static emailWorker: Worker;
  private static notificationWorker: Worker;
  private static auditWorker: Worker;
  private static caseOpeningWorker: Worker;
  private static bookingWorker: Worker;

  // Email transporter
  private static emailTransporter: nodemailer.Transporter;

  // Initialize queue service
  static async initialize(): Promise<void> {
    console.log('🚀 Initializing message queue service...');

    try {
      // Initialize email transporter
      await this.initializeEmailTransporter();

      // Setup queues
      await this.setupQueues();

      // Setup workers
      await this.setupWorkers();

      console.log('✅ Message queue service initialized successfully');
    } catch (error) {
      console.error('❌ Queue service initialization failed:', error);
      throw error;
    }
  }

  // Initialize email transporter
  private static async initializeEmailTransporter(): Promise<void> {
    this.emailTransporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    // Verify connection
    try {
      await this.emailTransporter.verify();
      console.log('📧 Email transporter verified successfully');
    } catch (error) {
      console.warn('⚠️ Email transporter verification failed:', error.message);
    }
  }

  // Setup queues
  private static async setupQueues(): Promise<void> {
    const queueOptions: QueueOptions = {
      connection: redisClient || undefined,
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000
        }
      }
    };

    // Create queues
    this.emailQueue = new Queue('email', queueOptions);
    this.notificationQueue = new Queue('notification', queueOptions);
    this.auditQueue = new Queue('audit', queueOptions);
    this.caseOpeningQueue = new Queue('caseOpening', queueOptions);
    this.bookingQueue = new Queue('booking', queueOptions);

    // Queue event listeners
    this.setupQueueEventListeners();
  }

  // Setup workers
  private static async setupWorkers(): Promise<void> {
    const workerOptions: WorkerOptions = {
      connection: redisClient || undefined,
      concurrency: 5
    };

    // Email worker
    this.emailWorker = new Worker('email', async (job: Job<EmailJob>) => {
      await this.processEmailJob(job);
    }, workerOptions);

    // Notification worker
    this.notificationWorker = new Worker('notification', async (job: Job<NotificationJob>) => {
      await this.processNotificationJob(job);
    }, workerOptions);

    // Audit worker
    this.auditWorker = new Worker('audit', async (job: Job<AuditLogJob>) => {
      await this.processAuditJob(job);
    }, workerOptions);

    // Case opening worker
    this.caseOpeningWorker = new Worker('caseOpening', async (job: Job<CaseOpeningJob>) => {
      await this.processCaseOpeningJob(job);
    }, workerOptions);

    // Booking worker
    this.bookingWorker = new Worker('booking', async (job: Job<BookingJob>) => {
      await this.processBookingJob(job);
    }, workerOptions);

    // Worker event listeners
    this.setupWorkerEventListeners();
  }

  // Setup queue event listeners
  private static setupQueueEventListeners(): void {
    const queues = [
      { name: 'email', queue: this.emailQueue },
      { name: 'notification', queue: this.notificationQueue },
      { name: 'audit', queue: this.auditQueue },
      { name: 'caseOpening', queue: this.caseOpeningQueue },
      { name: 'booking', queue: this.bookingQueue }
    ];

    queues.forEach(({ name, queue }) => {
      queue.on('waiting', (job) => {
        console.log(`📥 Job ${job.id} is waiting in ${name} queue`);
      });

      queue.on('active', (job) => {
        console.log(`⚙️ Job ${job.id} is active in ${name} queue`);
      });

      queue.on('completed', (job) => {
        console.log(`✅ Job ${job.id} completed in ${name} queue`);
      });

      queue.on('failed', (job, err) => {
        console.error(`❌ Job ${job?.id} failed in ${name} queue:`, err.message);
      });
    });
  }

  // Setup worker event listeners
  private static setupWorkerEventListeners(): void {
    const workers = [
      { name: 'email', worker: this.emailWorker },
      { name: 'notification', worker: this.notificationWorker },
      { name: 'audit', worker: this.auditWorker },
      { name: 'caseOpening', worker: this.caseOpeningWorker },
      { name: 'booking', worker: this.bookingWorker }
    ];

    workers.forEach(({ name, worker }) => {
      worker.on('completed', (job) => {
        console.log(`✅ ${name} worker completed job ${job.id}`);
      });

      worker.on('failed', (job, err) => {
        console.error(`❌ ${name} worker failed job ${job?.id}:`, err.message);
      });

      worker.on('error', (err) => {
        console.error(`❌ ${name} worker error:`, err.message);
      });
    });
  }

  // Job processors
  private static async processEmailJob(job: Job<EmailJob>): Promise<void> {
    const { to, subject, html, template, data } = job.data;
    
    try {
      console.log(`📧 Processing email job for ${to}`);
      
      let emailHtml = html;
      
      // If template is specified, render it with data
      if (template && data) {
        emailHtml = await this.renderEmailTemplate(template, data);
      }
      
      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@pixelcyberzone.com',
        to,
        subject,
        html: emailHtml
      };
      
      const result = await this.emailTransporter.sendMail(mailOptions);
      console.log(`✅ Email sent successfully:`, result.messageId);
      
    } catch (error) {
      console.error('❌ Email sending failed:', error);
      throw error;
    }
  }

  private static async processNotificationJob(job: Job<NotificationJob>): Promise<void> {
    const { userId, type, title, message, data } = job.data;
    
    try {
      console.log(`🔔 Processing notification for user ${userId}`);
      
      // Store notification in database
      // In a real implementation, this would save to a notifications collection
      const notification = {
        userId,
        type,
        title,
        message,
        data,
        read: false,
        createdAt: new Date()
      };
      
      // Save to database (mock implementation)
      console.log('💾 Notification saved:', notification);
      
      // Send real-time notification via WebSocket
      // This would integrate with the WebSocket service
      console.log(`🔴 Real-time notification sent to user ${userId}`);
      
    } catch (error) {
      console.error('❌ Notification processing failed:', error);
      throw error;
    }
  }

  private static async processAuditJob(job: Job<AuditLogJob>): Promise<void> {
    const { userId, action, resource, details, ip, userAgent } = job.data;
    
    try {
      console.log(`📝 Processing audit log for user ${userId}, action: ${action}`);
      
      // Store audit log in database
      const auditLog = {
        userId,
        action,
        resource,
        details,
        ip,
        userAgent,
        timestamp: new Date()
      };
      
      // Save to database (mock implementation)
      console.log('📋 Audit log saved:', auditLog);
      
    } catch (error) {
      console.error('❌ Audit log processing failed:', error);
      throw error;
    }
  }

  private static async processCaseOpeningJob(job: Job<CaseOpeningJob>): Promise<void> {
    const { userId, caseId, result } = job.data;
    
    try {
      console.log(`🎁 Processing case opening for user ${userId}, case: ${caseId}`);
      
      // Process case opening result
      // Update user inventory, statistics, etc.
      
      // Send notification about the result
      await this.addNotificationJob({
        userId,
        type: 'success',
        title: 'Case Opened!',
        message: `You received: ${result.rewardName}`,
        data: { caseId, result }
      });
      
      // Update analytics
      // This would trigger analytics updates
      
      console.log(`✅ Case opening processed for user ${userId}`);
      
    } catch (error) {
      console.error('❌ Case opening processing failed:', error);
      throw error;
    }
  }

  private static async processBookingJob(job: Job<BookingJob>): Promise<void> {
    const { userId, bookingId, action, details } = job.data;
    
    try {
      console.log(`📅 Processing booking ${action} for user ${userId}`);
      
      switch (action) {
        case 'created':
          // Send confirmation email
          await this.addEmailJob({
            to: details.userEmail,
            subject: 'Booking Confirmation - PixelCyberZone',
            template: 'booking-confirmation',
            data: { booking: details }
          });
          break;
          
        case 'cancelled':
          // Send cancellation email
          await this.addEmailJob({
            to: details.userEmail,
            subject: 'Booking Cancelled - PixelCyberZone',
            template: 'booking-cancellation',
            data: { booking: details }
          });
          break;
          
        case 'completed':
          // Send completion notification
          await this.addNotificationJob({
            userId,
            type: 'success',
            title: 'Session Completed',
            message: 'Your gaming session has been completed successfully!',
            data: { bookingId, details }
          });
          break;
      }
      
      console.log(`✅ Booking ${action} processed for user ${userId}`);
      
    } catch (error) {
      console.error('❌ Booking processing failed:', error);
      throw error;
    }
  }

  // Add jobs to queues
  static async addEmailJob(emailData: EmailJob, options: any = {}): Promise<string> {
    try {
      const job = await this.emailQueue.add('sendEmail', emailData, {
        priority: options.priority || 0,
        delay: options.delay || 0,
        ...options
      });
      
      console.log(`📧 Email job added with ID: ${job.id}`);
      return job.id!.toString();
    } catch (error) {
      console.error('❌ Failed to add email job:', error);
      throw error;
    }
  }

  static async addNotificationJob(notificationData: NotificationJob, options: any = {}): Promise<string> {
    try {
      const job = await this.notificationQueue.add('sendNotification', notificationData, {
        priority: options.priority || 0,
        delay: options.delay || 0,
        ...options
      });
      
      console.log(`🔔 Notification job added with ID: ${job.id}`);
      return job.id!.toString();
    } catch (error) {
      console.error('❌ Failed to add notification job:', error);
      throw error;
    }
  }

  static async addAuditJob(auditData: AuditLogJob, options: any = {}): Promise<string> {
    try {
      const job = await this.auditQueue.add('logAudit', auditData, {
        priority: options.priority || 0,
        delay: options.delay || 0,
        ...options
      });
      
      return job.id!.toString();
    } catch (error) {
      console.error('❌ Failed to add audit job:', error);
      throw error;
    }
  }

  static async addCaseOpeningJob(caseData: CaseOpeningJob, options: any = {}): Promise<string> {
    try {
      const job = await this.caseOpeningQueue.add('processCaseOpening', caseData, {
        priority: options.priority || 0,
        delay: options.delay || 0,
        ...options
      });
      
      console.log(`🎁 Case opening job added with ID: ${job.id}`);
      return job.id!.toString();
    } catch (error) {
      console.error('❌ Failed to add case opening job:', error);
      throw error;
    }
  }

  static async addBookingJob(bookingData: BookingJob, options: any = {}): Promise<string> {
    try {
      const job = await this.bookingQueue.add('processBooking', bookingData, {
        priority: options.priority || 0,
        delay: options.delay || 0,
        ...options
      });
      
      console.log(`📅 Booking job added with ID: ${job.id}`);
      return job.id!.toString();
    } catch (error) {
      console.error('❌ Failed to add booking job:', error);
      throw error;
    }
  }

  // Email template rendering
  private static async renderEmailTemplate(template: string, data: any): Promise<string> {
    // Simple template engine - in production, use handlebars, mustache, etc.
    const templates: Record<string, string> = {
      'welcome': `
        <h1>Welcome to PixelCyberZone, {{name}}!</h1>
        <p>Thank you for joining our gaming community.</p>
        <p>Your account has been created successfully.</p>
      `,
      'booking-confirmation': `
        <h1>Booking Confirmation</h1>
        <p>Hello {{booking.userName}},</p>
        <p>Your booking has been confirmed for {{booking.date}} at {{booking.time}}.</p>
        <p>Station: {{booking.station}}</p>
        <p>Duration: {{booking.duration}} hours</p>
        <p>Total Cost: ${{booking.cost}}</p>
      `,
      'booking-cancellation': `
        <h1>Booking Cancelled</h1>
        <p>Hello {{booking.userName}},</p>
        <p>Your booking for {{booking.date}} at {{booking.time}} has been cancelled.</p>
        <p>If this was unexpected, please contact support.</p>
      `,
      'password-reset': `
        <h1>Password Reset Request</h1>
        <p>Hello {{name}},</p>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="{{resetLink}}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
      `,
      'otp-verification': `
        <h1>Email Verification</h1>
        <p>Hello {{name}},</p>
        <p>Your verification code is: <strong>{{otp}}</strong></p>
        <p>This code will expire in 15 minutes.</p>
      `
    };

    const templateHtml = templates[template] || '<p>Template not found</p>';
    
    // Simple template replacement
    return templateHtml.replace(/{{([^}]+)}}/g, (match, key) => {
      const keys = key.split('.');
      let value = data;
      
      for (const k of keys) {
        value = value?.[k];
      }
      
      return value || match;
    });
  }

  // Queue management methods
  static async getQueueStats(): Promise<any> {
    const queues = [
      { name: 'email', queue: this.emailQueue },
      { name: 'notification', queue: this.notificationQueue },
      { name: 'audit', queue: this.auditQueue },
      { name: 'caseOpening', queue: this.caseOpeningQueue },
      { name: 'booking', queue: this.bookingQueue }
    ];

    const stats: any = {};

    for (const { name, queue } of queues) {
      try {
        const [waiting, active, completed, failed] = await Promise.all([
          queue.getWaiting(),
          queue.getActive(),
          queue.getCompleted(),
          queue.getFailed()
        ]);

        stats[name] = {
          waiting: waiting.length,
          active: active.length,
          completed: completed.length,
          failed: failed.length,
          total: waiting.length + active.length + completed.length + failed.length
        };
      } catch (error) {
        stats[name] = { error: error.message };
      }
    }

    return stats;
  }

  // Retry failed jobs
  static async retryFailedJobs(queueName: string): Promise<number> {
    try {
      const queueMap: Record<string, Queue> = {
        email: this.emailQueue,
        notification: this.notificationQueue,
        audit: this.auditQueue,
        caseOpening: this.caseOpeningQueue,
        booking: this.bookingQueue
      };

      const queue = queueMap[queueName];
      if (!queue) {
        throw new Error(`Queue ${queueName} not found`);
      }

      const failedJobs = await queue.getFailed();
      let retriedCount = 0;

      for (const job of failedJobs) {
        await job.retry();
        retriedCount++;
      }

      console.log(`🔄 Retried ${retriedCount} failed jobs in ${queueName} queue`);
      return retriedCount;
    } catch (error) {
      console.error('❌ Failed to retry jobs:', error);
      throw error;
    }
  }

  // Clear queue
  static async clearQueue(queueName: string): Promise<void> {
    try {
      const queueMap: Record<string, Queue> = {
        email: this.emailQueue,
        notification: this.notificationQueue,
        audit: this.auditQueue,
        caseOpening: this.caseOpeningQueue,
        booking: this.bookingQueue
      };

      const queue = queueMap[queueName];
      if (!queue) {
        throw new Error(`Queue ${queueName} not found`);
      }

      await queue.obliterate({ force: true });
      console.log(`🗑️ Queue ${queueName} cleared successfully`);
    } catch (error) {
      console.error('❌ Failed to clear queue:', error);
      throw error;
    }
  }

  // Pause/Resume queues
  static async pauseQueue(queueName: string): Promise<void> {
    const queueMap: Record<string, Queue> = {
      email: this.emailQueue,
      notification: this.notificationQueue,
      audit: this.auditQueue,
      caseOpening: this.caseOpeningQueue,
      booking: this.bookingQueue
    };

    const queue = queueMap[queueName];
    if (queue) {
      await queue.pause();
      console.log(`⏸️ Queue ${queueName} paused`);
    }
  }

  static async resumeQueue(queueName: string): Promise<void> {
    const queueMap: Record<string, Queue> = {
      email: this.emailQueue,
      notification: this.notificationQueue,
      audit: this.auditQueue,
      caseOpening: this.caseOpeningQueue,
      booking: this.bookingQueue
    };

    const queue = queueMap[queueName];
    if (queue) {
      await queue.resume();
      console.log(`▶️ Queue ${queueName} resumed`);
    }
  }

  // Scheduled jobs
  static async scheduleRecurringJobs(): Promise<void> {
    // Example: Send daily stats email
    await this.emailQueue.add(
      'dailyStats',
      {
        to: process.env.ADMIN_EMAIL || 'admin@pixelcyberzone.com',
        subject: 'Daily Stats Report',
        template: 'daily-stats',
        data: { date: new Date().toISOString() }
      },
      {
        repeat: { cron: '0 9 * * *' }, // Daily at 9 AM
        removeOnComplete: 10,
        removeOnFail: 3
      }
    );

    // Example: Clean up old audit logs
    await this.auditQueue.add(
      'cleanupOldLogs',
      { action: 'cleanup', days: 30 },
      {
        repeat: { cron: '0 2 * * 0' }, // Weekly on Sunday at 2 AM
        removeOnComplete: 5,
        removeOnFail: 2
      }
    );

    console.log('⏰ Recurring jobs scheduled');
  }

  // Graceful shutdown
  static async shutdown(): Promise<void> {
    console.log('🛑 Shutting down queue service...');

    try {
      // Close workers
      const workers = [
        this.emailWorker,
        this.notificationWorker,
        this.auditWorker,
        this.caseOpeningWorker,
        this.bookingWorker
      ];

      await Promise.all(workers.map(worker => worker?.close()));

      // Close queues
      const queues = [
        this.emailQueue,
        this.notificationQueue,
        this.auditQueue,
        this.caseOpeningQueue,
        this.bookingQueue
      ];

      await Promise.all(queues.map(queue => queue?.close()));

      console.log('✅ Queue service shutdown complete');
    } catch (error) {
      console.error('❌ Queue service shutdown error:', error);
      throw error;
    }
  }
}

export default QueueService;
