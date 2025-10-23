import type { Server as NetServer } from 'node:http';
import { Server as SocketIOServer } from 'socket.io';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getUser } from '@/lib/db/queries';
import { cookies } from 'next/headers';

export interface SocketServer extends NetServer {
    io?: SocketIOServer;
}

export type SocketWithIO = NextApiRequest & {
    socket: {
        server: SocketServer;
    };
}

export type NextApiResponseWithSocket = NextApiResponse & {
    socket: {
        server: SocketServer;
    };
}

export const config = {
    api: {
        bodyParser: false,
    },
};

export const initSocket = (req: SocketWithIO, res: NextApiResponseWithSocket) => {
    console.log('Socket.IO initSocket called');
    console.log('Request method:', req.method);
    console.log('Request headers:', req.headers);

    if (!res.socket.server.io) {
        console.log('Initializing Socket.IO server...');

        const io = new SocketIOServer(res.socket.server, {
            path: '/api/socketio',
            addTrailingSlash: false,
            cors: {
                origin: [
                    process.env.NEXTAUTH_URL || 'http://localhost:3000',
                    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
                    // Allow any origin in development
                    ...(process.env.NODE_ENV === 'development' ? ['*'] : [])
                ],
                methods: ['GET', 'POST'],
                credentials: true,
            },
            transports: ['websocket', 'polling'],
        });

        console.log('Socket.IO server created successfully');

        // Store user sessions
        const userSessions = new Map<string, string>(); // socketId -> userId

        io.on('connection', async (socket) => {
            console.log('Client connected:', socket.id);
            console.log('Socket transport:', socket.conn.transport.name);

            // Authenticate user and join their room
            socket.on('authenticate', async (data: { userEmail: string }) => {
                try {
                    console.log('Authenticating user:', data.userEmail);
                    const [user] = await getUser(data.userEmail);
                    if (user) {
                        userSessions.set(socket.id, user.id);
                        socket.join(`user_${user.id}`);
                        console.log(`User ${user.email} authenticated and joined room user_${user.id}`);

                        // Emit online status to connected users
                        socket.broadcast.emit('user_online', { userId: user.id });
                    } else {
                        console.log('User not found for email:', data.userEmail);
                    }
                } catch (error) {
                    console.error('Authentication error:', error);
                }
            });

            // Handle new message
            socket.on('send_message', async (data: {
                senderId: string;
                receiverId: string;
                message: string;
                messageId: string;
            }) => {
                try {
                    // Emit to receiver
                    socket.to(`user_${data.receiverId}`).emit('new_message', {
                        messageId: data.messageId,
                        senderId: data.senderId,
                        message: data.message,
                        timestamp: new Date().toISOString(),
                    });

                    // Emit back to sender for confirmation
                    socket.emit('message_sent', {
                        messageId: data.messageId,
                        status: 'sent',
                    });

                    console.log(`Message sent from ${data.senderId} to ${data.receiverId}`);
                } catch (error) {
                    console.error('Error sending message:', error);
                    socket.emit('message_error', { error: 'Failed to send message' });
                }
            });

            // Handle typing indicators
            socket.on('typing_start', (data: { senderId: string; receiverId: string }) => {
                socket.to(`user_${data.receiverId}`).emit('user_typing', {
                    userId: data.senderId,
                    isTyping: true,
                });
            });

            socket.on('typing_stop', (data: { senderId: string; receiverId: string }) => {
                socket.to(`user_${data.receiverId}`).emit('user_typing', {
                    userId: data.senderId,
                    isTyping: false,
                });
            });

            // Handle message read receipts
            socket.on('mark_read', (data: { senderId: string; receiverId: string; messageIds: string[] }) => {
                socket.to(`user_${data.senderId}`).emit('messages_read', {
                    readerId: data.receiverId,
                    messageIds: data.messageIds,
                });
            });

            // Handle disconnect
            socket.on('disconnect', () => {
                const userId = userSessions.get(socket.id);
                if (userId) {
                    socket.broadcast.emit('user_offline', { userId });
                    userSessions.delete(socket.id);
                    console.log(`User ${userId} disconnected`);
                }
                console.log('Client disconnected:', socket.id);
            });
        });

        res.socket.server.io = io;
    }

    res.end();
};

export default initSocket; 