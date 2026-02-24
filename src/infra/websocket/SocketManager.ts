import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';

export class SocketManager {
    private static instance: SocketManager;
    private io: SocketIOServer | null = null;

    private constructor() { }

    public static getInstance(): SocketManager {
        if (!SocketManager.instance) {
            SocketManager.instance = new SocketManager();
        }
        return SocketManager.instance;
    }

    public initialize(server: HttpServer): void {
        this.io = new SocketIOServer(server, {
            cors: {
                origin: '*',
                methods: ['GET', 'POST']
            }
        });

        this.io.on('connection', (socket) => {
            const { tenantId } = socket.handshake.query;

            if (tenantId) {
                const room = `tenant:${tenantId}`;
                socket.join(room);
                console.log(`[WebSocket] Client connected and joined room: ${room}`);
            }

            socket.on('disconnect', () => {
                console.log('[WebSocket] Client disconnected');
            });
        });
    }

    public emitToTenant(tenantId: string, event: string, data: any): void {
        if (this.io) {
            const room = `tenant:${tenantId}`;
            this.io.to(room).emit(event, data);
            console.log(`[WebSocket] Emitted ${event} to ${room}`);
        }
    }
}

export const socketManager = SocketManager.getInstance();
