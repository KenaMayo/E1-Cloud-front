import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export type ChatRole = 'USER' | 'ADMIN';
export type ChatMessageType = 'TEXT' | 'QUOTE_REQUEST' | 'QUOTE_RESPONSE';

export interface ChatMessage {
  messageId: string;
  conversationId: string;
  senderRole: ChatRole;
  type: ChatMessageType;
  content: string | null;
  orderId: number | null;
  price: number | null;
  comment: string | null;
  createdAt: string;
  status: 'QUEUED' | 'PERSISTED';
}

export interface ChatMessageRequest {
  type: ChatMessageType;
  content?: string | null;
  orderId?: number | null;
  price?: number | null;
  comment?: string | null;
}

export interface ChatConversation {
  userId: string;
  lastMessage: string;
  lastActivity: string;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly api = `${environment.chatApiUrl}/chat`;
  private client?: Client;
  private readonly desiredDestinations = new Set<string>();
  private readonly subscriptions = new Map<string, StompSubscription>();
  private readonly incomingSubject = new Subject<ChatMessage>();
  private readonly adminIncomingSubject = new Subject<ChatMessage>();

  readonly incoming$ = this.incomingSubject.asObservable();
  readonly adminIncoming$ = this.adminIncomingSubject.asObservable();

  constructor(private http: HttpClient, private auth: AuthService) {}

  historialPropio(): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${this.api}/me/messages`);
  }

  publicarMensaje(request: ChatMessageRequest): Observable<ChatMessage> {
    return this.http.post<ChatMessage>(`${this.api}/messages`, request);
  }

  conversaciones(): Observable<ChatConversation[]> {
    return this.http.get<ChatConversation[]>(`${this.api}/conversations`);
  }

  historialDe(userId: string): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(
      `${this.api}/conversations/${encodeURIComponent(userId)}/messages`,
    );
  }

  responder(userId: string, request: ChatMessageRequest): Observable<ChatMessage> {
    return this.http.post<ChatMessage>(
      `${this.api}/conversations/${encodeURIComponent(userId)}/messages`,
      request,
    );
  }

  conectar(): void {
    if (this.client?.active) {
      return;
    }
    const token = this.auth.token;
    if (!token) {
      throw new Error('No hay una sesión autenticada para conectar el chat');
    }

    const client = new Client({
      brokerURL: this.websocketUrl(),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => this.suscribirDestinosPendientes(),
      onStompError: (frame) => console.error('[ERROR] STOMP:', frame.headers['message']),
      onWebSocketError: (event) => console.error('[ERROR] WebSocket del chat:', event),
    });
    this.client = client;
    client.activate();
  }

  suscribirConversacion(userId: string): void {
    this.agregarSuscripcion(`/topic/chat.${userId}`);
  }

  suscribirPanelAdmin(): void {
    this.agregarSuscripcion('/topic/chat.admin');
  }

  desconectar(): void {
    const activeClient = this.client;
    this.client = undefined;
    this.desiredDestinations.clear();
    this.subscriptions.clear();
    if (activeClient) {
      void activeClient.deactivate().catch((error: unknown) => {
        console.error('[ERROR] Al cerrar el WebSocket del chat:', error);
      });
    }
  }

  private agregarSuscripcion(destination: string): void {
    this.desiredDestinations.add(destination);
    if (this.client?.connected && !this.subscriptions.has(destination)) {
      this.suscribir(destination);
    }
  }

  private suscribirDestinosPendientes(): void {
    this.desiredDestinations.forEach((destination) => this.suscribir(destination));
  }

  private suscribir(destination: string): void {
    if (!this.client?.connected || this.subscriptions.has(destination)) {
      return;
    }
    const subscription = this.client.subscribe(destination, (message) => this.recibir(destination, message));
    this.subscriptions.set(destination, subscription);
  }

  private recibir(destination: string, frame: IMessage): void {
    try {
      const message = JSON.parse(frame.body) as ChatMessage;
      if (destination === '/topic/chat.admin') {
        this.adminIncomingSubject.next(message);
      } else {
        this.incomingSubject.next(message);
      }
    } catch (error) {
      console.error('[ERROR] No se pudo interpretar un mensaje STOMP del chat:', error);
    }
  }

  private websocketUrl(): string {
    if (environment.chatWsUrl.startsWith('/')) {
      const scheme = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      return `${scheme}//${window.location.host}${environment.chatWsUrl}`;
    }
    return environment.chatWsUrl;
  }
}
