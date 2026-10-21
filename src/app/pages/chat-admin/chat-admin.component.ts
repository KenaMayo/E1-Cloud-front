import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ChatConversation, ChatMessage, ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-chat-admin',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="admin-chat">
      <h2>Conversaciones del chat</h2>
      <p *ngIf="error" class="error" role="alert">{{ error }}</p>
      <div class="layout">
        <aside>
          <p *ngIf="conversaciones.length === 0" class="empty">Todavía no hay conversaciones.</p>
          <button *ngFor="let conversation of conversaciones"
                  [class.selected]="conversation.userId === usuarioSeleccionado"
                  (click)="seleccionar(conversation.userId)">
            <strong>{{ conversation.userId }}</strong>
            <span>{{ conversation.lastMessage }}</span>
            <small>{{ conversation.lastActivity | date:'short' }}</small>
          </button>
        </aside>
        <section class="conversation">
          <h3 *ngIf="usuarioSeleccionado">Conversación: {{ usuarioSeleccionado }}</h3>
          <p *ngIf="!usuarioSeleccionado" class="empty">Selecciona una conversación para responder.</p>
          <div class="messages" *ngIf="usuarioSeleccionado">
            <article *ngFor="let message of mensajes; trackBy: trackById"
                     [class.from-user]="message.senderRole === 'USER'"
                     [class.quote]="message.type !== 'TEXT'">
              <small>{{ message.senderRole }} · {{ message.createdAt | date:'short' }}</small>
              <ng-container [ngSwitch]="message.type">
                <p *ngSwitchCase="'QUOTE_REQUEST'">
                  <strong>Solicitud de cotización para pedido #{{ message.orderId }}</strong>
                  <span *ngIf="message.content">{{ message.content }}</span>
                </p>
                <p *ngSwitchCase="'QUOTE_RESPONSE'">
                  <strong>Cotización: {{ message.price | currency }}</strong>
                  <span *ngIf="message.comment">{{ message.comment }}</span>
                </p>
                <p *ngSwitchDefault>{{ message.content }}</p>
              </ng-container>
            </article>
          </div>
          <form *ngIf="usuarioSeleccionado" (ngSubmit)="enviar()">
            <label><input type="checkbox" [(ngModel)]="cotizacion" name="cotizacion"> Responder con cotización</label>
            <input *ngIf="cotizacion" type="number" min="0.01" step="0.01" [(ngModel)]="precio"
                   name="precio" placeholder="Precio" aria-label="Precio">
            <textarea [(ngModel)]="texto" name="texto" maxlength="2000"
                      [placeholder]="cotizacion ? 'Comentario de la cotización (opcional)' : 'Escribe una respuesta'"
                      aria-label="Respuesta"></textarea>
            <button type="submit" [disabled]="enviando">
              {{ enviando ? 'Enviando...' : (cotizacion ? 'Enviar cotización' : 'Responder') }}
            </button>
          </form>
        </section>
      </div>
    </section>
  `,
  styles: [`
    .admin-chat { color: #263238; }
    .layout { display: grid; grid-template-columns: minmax(220px, 310px) 1fr; min-height: 520px;
      border: 1px solid #ddd; border-radius: 10px; overflow: hidden; }
    aside { overflow-y: auto; background: #f6f4fa; border-right: 1px solid #ddd; }
    aside button { display: grid; gap: 5px; width: 100%; padding: 13px; text-align: left; cursor: pointer;
      background: transparent; border: 0; border-bottom: 1px solid #ddd; }
    aside button.selected, aside button:hover { background: #ebe5f5; }
    aside span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #555; }
    aside small { color: #777; }
    .conversation { min-width: 0; display: flex; flex-direction: column; padding: 14px; }
    .conversation h3 { margin: 0 0 12px; }
    .messages { flex: 1; max-height: 430px; overflow-y: auto; }
    article { max-width: 80%; width: fit-content; padding: 9px 12px; margin: 8px 0 8px auto;
      border-radius: 10px; background: #eee8f7; overflow-wrap: anywhere; }
    article.from-user { margin-left: 0; margin-right: auto; background: #f2f2f2; }
    article.quote { border-left: 4px solid #e6a23c; }
    article small { font-size: 11px; color: #666; }
    article p { margin: 4px 0 0; white-space: pre-wrap; }
    article span { display: block; margin-top: 4px; }
    form { display: grid; gap: 8px; border-top: 1px solid #ddd; padding-top: 12px; }
    textarea, input[type=number] { padding: 9px; font: inherit; border: 1px solid #bbb; border-radius: 6px; }
    textarea { min-height: 70px; resize: vertical; }
    form button { justify-self: end; padding: 9px 16px; border: 0; border-radius: 6px;
      color: white; background: #6a51a3; cursor: pointer; }
    .empty { padding: 14px; color: #666; }
    .error { color: #b00020; }
    @media (max-width: 700px) { .layout { grid-template-columns: 1fr; }
      aside { max-height: 180px; border-right: 0; border-bottom: 1px solid #ddd; } }
  `],
})
export class ChatAdminComponent implements OnInit, OnDestroy {
  conversaciones: ChatConversation[] = [];
  mensajes: ChatMessage[] = [];
  usuarioSeleccionado = '';
  texto = '';
  precio: number | null = null;
  cotizacion = false;
  enviando = false;
  error = '';
  private subscriptions = new Subscription();

  constructor(private chat: ChatService) {}

  ngOnInit(): void {
    this.chat.conectar();
    this.chat.suscribirPanelAdmin();
    this.subscriptions.add(this.chat.incoming$.subscribe((message) => {
      if (message.conversationId === this.usuarioSeleccionado) {
        this.agregar(message);
      }
    }));
    this.subscriptions.add(this.chat.adminIncoming$.subscribe((message) => this.actualizarResumen(message)));
    this.cargarConversaciones();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.chat.desconectar();
  }

  seleccionar(userId: string): void {
    this.usuarioSeleccionado = userId;
    this.mensajes = [];
    this.chat.suscribirConversacion(userId);
    this.subscriptions.add(this.chat.historialDe(userId).subscribe({
      next: (history) => history.forEach((message) => this.agregar(message)),
      error: () => this.error = 'No se pudo cargar el historial de esta conversación.',
    }));
  }

  enviar(): void {
    if (!this.usuarioSeleccionado || this.enviando) {
      return;
    }
    this.error = '';
    if (this.cotizacion && (!this.precio || this.precio <= 0)) {
      this.error = 'Indica un precio mayor que cero para cotizar.';
      return;
    }
    if (!this.cotizacion && !this.texto.trim()) {
      this.error = 'Escribe una respuesta antes de enviarla.';
      return;
    }
    const request = this.cotizacion
      ? { type: 'QUOTE_RESPONSE' as const, price: this.precio, comment: this.texto.trim() || null }
      : { type: 'TEXT' as const, content: this.texto.trim() };
    this.enviando = true;
    this.chat.responder(this.usuarioSeleccionado, request).subscribe({
      next: (message) => {
        this.agregar(message);
        this.texto = '';
        this.precio = null;
        this.cotizacion = false;
        this.enviando = false;
      },
      error: () => {
        this.error = 'No se pudo enviar la respuesta. Revisa la conexión e inténtalo de nuevo.';
        this.enviando = false;
      },
    });
  }

  trackById(_index: number, message: ChatMessage): string {
    return message.messageId;
  }

  private cargarConversaciones(): void {
    this.subscriptions.add(this.chat.conversaciones().subscribe({
      next: (conversations) => this.conversaciones = conversations,
      error: () => this.error = 'No se pudo cargar la lista de conversaciones.',
    }));
  }

  private agregar(message: ChatMessage): void {
    if (!this.mensajes.some((existing) => existing.messageId === message.messageId)) {
      this.mensajes = [...this.mensajes, message].sort(
        (left, right) => left.createdAt.localeCompare(right.createdAt),
      );
    }
  }

  private actualizarResumen(message: ChatMessage): void {
    const summary: ChatConversation = {
      userId: message.conversationId,
      lastActivity: message.createdAt,
      lastMessage: message.type === 'QUOTE_REQUEST'
        ? `Solicitud de cotización #${message.orderId}`
        : message.content ?? message.comment ?? 'Cotización',
    };
    this.conversaciones = [
      summary,
      ...this.conversaciones.filter((conversation) => conversation.userId !== summary.userId),
    ];
  }
}
