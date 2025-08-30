import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { CacheService } from '../config/redis.js';

// WebSocket event interfaces
interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
  roomId?: string;
}

interface GameSessionUpdate {
  userId: string;
  sessionId: string;
  status: 'active' | 'paused' | 'completed';
  stationId: string;
  timeRemaining?: number;
}

interface StationAvailability {
  stationId: string;
  status: 'available' | 'occupied' | 'maintenance';
  userId?: string;
  sessionStartTime?: Date;
}

interface UserPresence {
  userId: string;
  status: 'online' | 'away' | 'offline';
  lastSeen: Date;
  currentPage?: string;
}

interface LiveNotification {
  id: string;
  userId: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  data?: any;
  timestamp: Date;
}

export class WebSocketService {
  private io: SocketIOServer;
  private connectedUsers: Map<string, any> = new Map();
  private userSockets: Map<string, string[]> = new Map(); // userId -> socketIds
  private socketUsers: Map<string, string> = new Map(); // socketId -> userId
  private chatRooms: Map<string, Set<string>> = new Map(); // roomId -> userIds
  private stationStatuses: Map<string, StationAvailability> = new Map();

  constructor(httpServer: HTTPServer) {
    console.log('🔌 Initializing WebSocket service...');

    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || \"http://localhost:3000\",
        methods: [\"GET\", \"POST\"],
        credentials: true
      },
      pingTimeout: 60000,
      pingInterval: 25000,
      transports: ['websocket', 'polling']
    });

    this.setupMiddleware();
    this.setupEventHandlers();
    this.startHeartbeat();

    console.log('✅ WebSocket service initialized');
  }

  // Setup middleware
  private setupMiddleware(): void {
    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
        socket.userId = decoded.id;
        socket.userRole = decoded.role;
        socket.userName = decoded.name;

        // Store user connection info
        this.connectedUsers.set(socket.userId, {
          id: socket.userId,
          name: socket.userName,
          role: socket.userRole,
          socketId: socket.id,
          connectedAt: new Date(),
          lastActivity: new Date()
        });

        // Track user sockets
        if (!this.userSockets.has(socket.userId)) {
          this.userSockets.set(socket.userId, []);
        }
        this.userSockets.get(socket.userId)!.push(socket.id);
        this.socketUsers.set(socket.id, socket.userId);

        console.log(`👤 User ${socket.userName} (${socket.userId}) connected via socket ${socket.id}`);
        
        next();
      } catch (error) {
        console.error('WebSocket authentication error:', error);
        next(new Error('Invalid authentication token'));
      }
    });

    // Rate limiting middleware
    this.io.use(async (socket, next) => {
      const rateLimitKey = `ws_rate_limit:${socket.userId}`;
      const requests = await CacheService.get<number>(rateLimitKey) || 0;
      
      if (requests > 100) { // 100 requests per minute
        return next(new Error('Rate limit exceeded'));
      }
      
      await CacheService.set(rateLimitKey, requests + 1, 60);
      next();
    });
  }

  // Setup event handlers
  private setupEventHandlers(): void {
    this.io.on('connection', (socket) => {
      console.log(`🔗 Socket ${socket.id} connected for user ${socket.userId}`);

      // Update user presence
      this.updateUserPresence(socket.userId, 'online');

      // Join user to their personal room
      socket.join(`user:${socket.userId}`);

      // Join admin users to admin room
      if (socket.userRole === 'admin') {
        socket.join('admin');
      }

      // Setup event handlers for this socket
      this.setupSocketEventHandlers(socket);

      // Handle disconnection
      socket.on('disconnect', (reason) => {
        this.handleDisconnection(socket, reason);
      });
    });
  }

  // Setup individual socket event handlers
  private setupSocketEventHandlers(socket: any): void {
    // Chat events
    socket.on('chat:join-room', (roomId: string) => {
      this.handleJoinChatRoom(socket, roomId);
    });

    socket.on('chat:leave-room', (roomId: string) => {
      this.handleLeaveChatRoom(socket, roomId);
    });

    socket.on('chat:message', (data: { roomId: string; message: string }) => {
      this.handleChatMessage(socket, data);
    });

    // Gaming session events
    socket.on('gaming:session-update', (data: GameSessionUpdate) => {
      this.handleGameSessionUpdate(socket, data);
    });

    socket.on('gaming:request-station-status', () => {
      this.sendStationStatus(socket);
    });

    // User presence events
    socket.on('presence:update', (status: 'online' | 'away') => {
      this.updateUserPresence(socket.userId, status);
    });

    socket.on('presence:page-change', (page: string) => {
      this.updateUserPage(socket.userId, page);
    });

    // Admin events
    socket.on('admin:broadcast', (data: { message: string; type: string }) => {
      if (socket.userRole === 'admin') {\n        this.handleAdminBroadcast(socket, data);\n      }\n    });\n\n    socket.on('admin:user-action', (data: { targetUserId: string; action: string }) => {\n      if (socket.userRole === 'admin') {\n        this.handleAdminUserAction(socket, data);\n      }\n    });\n\n    // Live updates events\n    socket.on('live:subscribe', (channel: string) => {\n      socket.join(`live:${channel}`);\n      console.log(`👤 User ${socket.userId} subscribed to live channel: ${channel}`);\n    });\n\n    socket.on('live:unsubscribe', (channel: string) => {\n      socket.leave(`live:${channel}`);\n      console.log(`👤 User ${socket.userId} unsubscribed from live channel: ${channel}`);\n    });\n  }\n\n  // Chat handlers\n  private handleJoinChatRoom(socket: any, roomId: string): void {\n    socket.join(`chat:${roomId}`);\n    \n    if (!this.chatRooms.has(roomId)) {\n      this.chatRooms.set(roomId, new Set());\n    }\n    this.chatRooms.get(roomId)!.add(socket.userId);\n    \n    // Notify room about new user\n    socket.to(`chat:${roomId}`).emit('chat:user-joined', {\n      userId: socket.userId,\n      userName: socket.userName,\n      timestamp: new Date()\n    });\n    \n    console.log(`👤 User ${socket.userName} joined chat room: ${roomId}`);\n  }\n\n  private handleLeaveChatRoom(socket: any, roomId: string): void {\n    socket.leave(`chat:${roomId}`);\n    \n    if (this.chatRooms.has(roomId)) {\n      this.chatRooms.get(roomId)!.delete(socket.userId);\n      \n      // Remove room if empty\n      if (this.chatRooms.get(roomId)!.size === 0) {\n        this.chatRooms.delete(roomId);\n      }\n    }\n    \n    // Notify room about user leaving\n    socket.to(`chat:${roomId}`).emit('chat:user-left', {\n      userId: socket.userId,\n      userName: socket.userName,\n      timestamp: new Date()\n    });\n    \n    console.log(`👤 User ${socket.userName} left chat room: ${roomId}`);\n  }\n\n  private async handleChatMessage(socket: any, data: { roomId: string; message: string }): Promise<void> {\n    const { roomId, message } = data;\n    \n    // Validate message\n    if (!message || message.trim().length === 0) {\n      return;\n    }\n    \n    if (message.length > 500) {\n      socket.emit('chat:error', { error: 'Message too long' });\n      return;\n    }\n    \n    // Create chat message\n    const chatMessage: ChatMessage = {\n      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,\n      userId: socket.userId,\n      userName: socket.userName,\n      message: message.trim(),\n      timestamp: new Date(),\n      roomId\n    };\n    \n    // Store message in cache for history\n    const historyKey = CacheService.generateKey('chat_history', roomId);\n    const history = await CacheService.get<ChatMessage[]>(historyKey) || [];\n    history.push(chatMessage);\n    \n    // Keep only last 100 messages\n    if (history.length > 100) {\n      history.splice(0, history.length - 100);\n    }\n    \n    await CacheService.set(historyKey, history, 3600); // 1 hour TTL\n    \n    // Broadcast message to room\n    this.io.to(`chat:${roomId}`).emit('chat:message', chatMessage);\n    \n    console.log(`💬 Chat message from ${socket.userName} in room ${roomId}`);\n  }\n\n  // Gaming session handlers\n  private handleGameSessionUpdate(socket: any, data: GameSessionUpdate): void {\n    // Update station status\n    this.stationStatuses.set(data.stationId, {\n      stationId: data.stationId,\n      status: data.status === 'active' ? 'occupied' : 'available',\n      userId: data.status === 'active' ? data.userId : undefined,\n      sessionStartTime: data.status === 'active' ? new Date() : undefined\n    });\n    \n    // Broadcast station status update\n    this.io.emit('gaming:station-status-update', {\n      stationId: data.stationId,\n      status: this.stationStatuses.get(data.stationId),\n      timestamp: new Date()\n    });\n    \n    // Send personal session update\n    this.sendToUser(data.userId, 'gaming:session-update', {\n      sessionId: data.sessionId,\n      status: data.status,\n      timeRemaining: data.timeRemaining,\n      timestamp: new Date()\n    });\n    \n    console.log(`🎮 Gaming session updated for user ${data.userId}, station ${data.stationId}`);\n  }\n\n  private sendStationStatus(socket: any): void {\n    const stationStatusArray = Array.from(this.stationStatuses.values());\n    socket.emit('gaming:station-status', {\n      stations: stationStatusArray,\n      timestamp: new Date()\n    });\n  }\n\n  // Admin handlers\n  private handleAdminBroadcast(socket: any, data: { message: string; type: string }): void {\n    const broadcast = {\n      id: `broadcast_${Date.now()}`,\n      message: data.message,\n      type: data.type,\n      fromAdmin: socket.userName,\n      timestamp: new Date()\n    };\n    \n    this.io.emit('admin:broadcast', broadcast);\n    console.log(`📢 Admin broadcast from ${socket.userName}: ${data.message}`);\n  }\n\n  private handleAdminUserAction(socket: any, data: { targetUserId: string; action: string }): void {\n    const { targetUserId, action } = data;\n    \n    // Send action to target user\n    this.sendToUser(targetUserId, 'admin:action', {\n      action,\n      fromAdmin: socket.userName,\n      timestamp: new Date()\n    });\n    \n    console.log(`🔨 Admin action '${action}' sent to user ${targetUserId} by ${socket.userName}`);\n  }\n\n  // User presence management\n  private updateUserPresence(userId: string, status: 'online' | 'away' | 'offline'): void {\n    const user = this.connectedUsers.get(userId);\n    if (user) {\n      user.status = status;\n      user.lastActivity = new Date();\n      \n      // Broadcast presence update to friends/relevant users\n      this.io.emit('presence:update', {\n        userId,\n        status,\n        lastSeen: user.lastActivity\n      });\n    }\n  }\n\n  private updateUserPage(userId: string, page: string): void {\n    const user = this.connectedUsers.get(userId);\n    if (user) {\n      user.currentPage = page;\n      user.lastActivity = new Date();\n    }\n  }\n\n  // Utility methods\n  public sendToUser(userId: string, event: string, data: any): void {\n    const userSocketIds = this.userSockets.get(userId);\n    if (userSocketIds) {\n      userSocketIds.forEach(socketId => {\n        this.io.to(socketId).emit(event, data);\n      });\n    }\n  }\n\n  public sendToRoom(roomId: string, event: string, data: any): void {\n    this.io.to(roomId).emit(event, data);\n  }\n\n  public broadcastToAll(event: string, data: any): void {\n    this.io.emit(event, data);\n  }\n\n  public sendNotification(userId: string, notification: LiveNotification): void {\n    this.sendToUser(userId, 'notification:new', notification);\n  }\n\n  public broadcastStationUpdate(stationUpdate: StationAvailability): void {\n    this.stationStatuses.set(stationUpdate.stationId, stationUpdate);\n    this.io.emit('gaming:station-update', {\n      station: stationUpdate,\n      timestamp: new Date()\n    });\n  }\n\n  // Handle disconnection\n  private handleDisconnection(socket: any, reason: string): void {\n    console.log(`🔌 Socket ${socket.id} disconnected (${reason}) for user ${socket.userId}`);\n    \n    // Remove from tracking\n    const userId = socket.userId;\n    if (userId) {\n      // Remove socket from user's socket list\n      const userSocketIds = this.userSockets.get(userId);\n      if (userSocketIds) {\n        const index = userSocketIds.indexOf(socket.id);\n        if (index > -1) {\n          userSocketIds.splice(index, 1);\n        }\n        \n        // If no more sockets for this user, mark as offline\n        if (userSocketIds.length === 0) {\n          this.updateUserPresence(userId, 'offline');\n          this.connectedUsers.delete(userId);\n          this.userSockets.delete(userId);\n        }\n      }\n      \n      // Remove from chat rooms\n      this.chatRooms.forEach((users, roomId) => {\n        if (users.has(userId)) {\n          users.delete(userId);\n          socket.to(`chat:${roomId}`).emit('chat:user-left', {\n            userId,\n            userName: socket.userName,\n            timestamp: new Date()\n          });\n        }\n      });\n    }\n    \n    this.socketUsers.delete(socket.id);\n  }\n\n  // Start heartbeat to maintain connection health\n  private startHeartbeat(): void {\n    setInterval(() => {\n      this.io.emit('heartbeat', { timestamp: new Date() });\n    }, 30000); // Every 30 seconds\n  }\n\n  // Get connection statistics\n  public getConnectionStats(): any {\n    const socketCount = this.io.engine.clientsCount;\n    const userCount = this.connectedUsers.size;\n    const roomCount = this.chatRooms.size;\n    \n    return {\n      totalSockets: socketCount,\n      totalUsers: userCount,\n      totalChatRooms: roomCount,\n      timestamp: new Date()\n    };\n  }\n\n  // Get connected users\n  public getConnectedUsers(): any[] {\n    return Array.from(this.connectedUsers.values()).map(user => ({\n      id: user.id,\n      name: user.name,\n      role: user.role,\n      status: user.status || 'online',\n      connectedAt: user.connectedAt,\n      lastActivity: user.lastActivity,\n      currentPage: user.currentPage\n    }));\n  }\n\n  // Get chat room info\n  public getChatRoomInfo(roomId: string): any {\n    const users = this.chatRooms.get(roomId);\n    if (!users) {\n      return { error: 'Room not found' };\n    }\n    \n    const userList = Array.from(users).map(userId => {\n      const user = this.connectedUsers.get(userId);\n      return user ? { id: userId, name: user.name, role: user.role } : null;\n    }).filter(Boolean);\n    \n    return {\n      roomId,\n      userCount: users.size,\n      users: userList,\n      createdAt: new Date() // In real implementation, this would be stored\n    };\n  }\n\n  // Real-time case opening\n  public broadcastCaseOpening(userId: string, caseData: any): void {\n    // Send to the user who opened the case\n    this.sendToUser(userId, 'case:opening-result', {\n      ...caseData,\n      timestamp: new Date()\n    });\n    \n    // Broadcast rare drops to all users\n    if (caseData.rarity === 'legendary' || caseData.rarity === 'rare') {\n      this.broadcastToAll('case:rare-drop', {\n        userId,\n        userName: this.connectedUsers.get(userId)?.name || 'Unknown',\n        caseId: caseData.caseId,\n        rewardName: caseData.rewardName,\n        rarity: caseData.rarity,\n        timestamp: new Date()\n      });\n    }\n  }\n\n  // Real-time booking updates\n  public broadcastBookingUpdate(bookingData: any): void {\n    // Update station availability\n    if (bookingData.stationId) {\n      const stationUpdate: StationAvailability = {\n        stationId: bookingData.stationId,\n        status: bookingData.status === 'active' ? 'occupied' : 'available',\n        userId: bookingData.status === 'active' ? bookingData.userId : undefined,\n        sessionStartTime: bookingData.status === 'active' ? new Date() : undefined\n      };\n      \n      this.broadcastStationUpdate(stationUpdate);\n    }\n    \n    // Send booking update to specific user\n    this.sendToUser(bookingData.userId, 'booking:update', {\n      ...bookingData,\n      timestamp: new Date()\n    });\n  }\n\n  // Live analytics for admin dashboard\n  public broadcastAnalytics(analyticsData: any): void {\n    this.sendToRoom('admin', 'analytics:update', {\n      ...analyticsData,\n      timestamp: new Date()\n    });\n  }\n\n  // Error handling\n  public handleSocketError(socketId: string, error: Error): void {\n    const socket = this.io.sockets.sockets.get(socketId);\n    if (socket) {\n      socket.emit('error', {\n        message: error.message,\n        timestamp: new Date()\n      });\n    }\n  }\n\n  // Graceful shutdown\n  public async shutdown(): Promise<void> {\n    console.log('🛑 Shutting down WebSocket service...');\n    \n    // Notify all connected users about shutdown\n    this.broadcastToAll('system:shutdown', {\n      message: 'Server is shutting down for maintenance',\n      timestamp: new Date()\n    });\n    \n    // Give clients time to receive the message\n    await new Promise(resolve => setTimeout(resolve, 1000));\n    \n    // Close all connections\n    this.io.close();\n    \n    console.log('✅ WebSocket service shutdown complete');\n  }\n\n  // Get socket server instance\n  public getSocketServer(): SocketIOServer {\n    return this.io;\n  }\n}\n\nexport default WebSocketService;\n"}}
</function_results>

<function_calls>
<invoke name="mark_todo_as_done">
<parameter name="todo_ids">["0cb5c740-d7f6-414c-8a98-972c4e044b09"]
