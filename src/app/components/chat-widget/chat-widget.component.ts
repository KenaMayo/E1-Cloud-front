import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ChatMessage, ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="chat-widget" aria-label="Chat con la tienda">
      <button class="chat-toggle" type="button" (click)="abierto = !abierto"
              [attr.aria-expanded]="abierto" aria-controls="chat-panel">
        {{ abierto ? 'Cerrar chat' : '💬 Consultar a la tienda' }}
      </button>

      <div id="chat-panel" class="chat-panel" *ngIf="abierto">
        <header>
          <div><strong>Atención al cliente</strong><small>Estamos para ayudarte</small></div>
          <button type="button" class="close" aria-label="Cerrar chat" (click)="abierto = false">×</button>
        </header>
        <div class="messages" role="log" aria-live="polite">
          <p class="empty" *ngIf="mensajes.length === 0">¡Hola! Escribe tu consulta y te responderemos aquí.</p>
          <article *ngFor="let message of mensajes; trackBy: trackById"
                   [class.mine]="message.senderRole === 'USER'"
                   [class.quote]="message.type !== 'TEXT'">
            <small>{{ message.senderRole === 'USER' ? 'Tú' : 'Tienda' }} · {{ message.createdAt | date:'shortTime' }}</small>
            <ng-container [ngSwitch]="message.type">
              <p *ngSwitchCase="'QUOTE_REQUEST'">
                <strong>Solicitud de cotización #{{ message.orderId }}</strong>
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
        <form (ngSubmit)="enviar()">
          <label class="quote-toggle"><input type="checkbox" [(ngModel)]="cotizar" name="cotizar"> Cotizar un pedido</label>
          <input *ngIf="cotizar" type="number" min="1" [(ngModel)]="orderId" name="orderId"
                 placeholder="Número de pedido" aria-label="Número de pedido">
          <textarea *ngIf="!cotizar" [(ngModel)]="texto" name="texto" maxlength="2000"
                    placeholder="Escribe tu mensaje..." aria-label="Escribe tu mensaje"></textarea>
          <textarea *ngIf="cotizar" [(ngModel)]="texto" name="detalle" maxlength="2000"
                    placeholder="Detalle de la cotización (opcional)" aria-label="Detalle de la cotización"></textarea>
          <p *ngIf="error" class="error" role="alert">{{ error }}</p>
          <button class="send" type="submit" [disabled]="enviando">
            {{ enviando ? 'Enviando...' : (cotizar ? 'Solicitar cotización' : 'Enviar') }}
          </button>
        </form>
      </div>
    </section>
  `,
  styles: [`
    :host { position: fixed; z-index: 900; right: 22px; bottom: 18px; font-family: Arial, sans-serif; }
    .chat-toggle { border: 0; border-radius: 24px; padding: 13px 19px; color: white; background: #6a51a3;
      box-shadow: 0 4px 14px #0003; cursor: pointer; font-size: 15px; }
    .chat-panel { position: absolute; right: 0; bottom: 58px; width: min(360px, calc(100vw - 28px));
      height: min(520px, calc(100dvh - 100px)); display: flex; flex-direction: column;
      background: white; border: 1px solid #ddd; border-radius: 14px; box-shadow: 0 8px 28px #0003; overflow: hidden; }
    header { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px;
      background: #6a51a3; color: white; }
    header small { display: block; opacity: .85; margin-top: 3px; }
    .close { border: 0; color: white; background: transparent; font-size: 25px; cursor: pointer; }
    .messages { flex: 1; overflow-y: auto; padding: 12px; background: #faf9fc; }
    article { max-width: 86%; width: fit-content; margin: 8px 0; padding: 9px 11px; background: white;
      border: 1px solid #eee; border-radius: 12px; overflow-wrap: anywhere; }
    article.mine { margin-left: auto; color: #fff; background: #6a51a3; }
    article.quote { border-left: 4px solid #e6a23c; }
    article small { display: block; opacity: .75; font-size: 11px; }
    article p { margin: 5px 0 0; white-space: pre-wrap; }
    article span { display: block; margin-top: 4px; }
    .empty { color: #666; text-align: center; margin-top: 30px; }
    form { display: grid; gap: 8px; padding: 10px; border-top: 1px solid #eee; }
    textarea, input[type=number] { box-sizing: border-box; width: 100%; padding: 9px; resize: vertical;
      border: 1px solid #ccc; border-radius: 8px; font: inherit; }
    textarea { min-height: 54px; max-height: 100px; }
    .quote-toggle { font-size: 13px; }
    .send { border: 0; border-radius: 8px; padding: 10px; color: white; background: #6a51a3; cursor: pointer; }
    .send:disabled { opacity: .6; cursor: wait; }
    .error { margin: 0; color: #b00020; font-size: 13px; }
    @media (max-width: 480px) {
      :host { right: 12px; bottom: 12px; }
      .chat-panel { position: fixed; inset: auto 8px 66px; width: auto; height: min(72dvh, 560px); }
    }
  `],
})
export class ChatWidgetComponent implements OnInit, OnDestroy {
  abierto = false;
  mensajes: ChatMessage[] = [];
  texto = '';
  orderId: number | null = null;
  cotizar = false;
  enviando = false;
  error = '';
  private subscriptions = new Subscription();

  constructor(private auth: AuthService, private chat: ChatService) {}

  ngOnInit(): void {
    const userId = this.auth.sesion?.username;
    if (!userId) {
      throw new Error('El widget de chat requiere una sesión de usuario validada');
    }
    this.subscriptions.add(this.chat.incoming$.subscribe((message) => this.agregar(message)));
    this.chat.conectar();
    this.chat.suscribirConversacion(userId);
    this.subscriptions.add(this.chat.historialPropio().subscribe({
      next: (history) => history.forEach((message) => this.agregar(message)),
      error: () => this.error = 'No se pudo cargar el historial. Intenta nuevamente.',
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.chat.desconectar();
  }

  enviar(): void {
    this.error = '';
    if (this.cotizar && (!this.orderId || this.orderId < 1)) {
      this.error = 'Ingresa un número de pedido válido.';
      return;
    }
    if (!this.cotizar && !this.texto.trim()) {
      this.error = 'Escribe un mensaje antes de enviarlo.';
      return;
    }
    const request = this.cotizar
      ? { type: 'QUOTE_REQUEST' as const, orderId: this.orderId, content: this.texto.trim() || null }
      : { type: 'TEXT' as const, content: this.texto.trim() };
    this.enviando = true;
    this.chat.publicarMensaje(request).subscribe({
      next: (message) => {
        this.agregar(message);
        this.texto = '';
        this.orderId = null;
        this.cotizar = false;
        this.enviando = false;
      },
      error: () => {
        this.error = 'No se pudo enviar el mensaje. Revisa la conexión e inténtalo de nuevo.';
        this.enviando = false;
      },
    });
  }

  trackById(_index: number, message: ChatMessage): string {
    return message.messageId;
  }

  private agregar(message: ChatMessage): void {
    if (!this.mensajes.some((existing) => existing.messageId === message.messageId)) {
      this.mensajes = [...this.mensajes, message].sort(
        (left, right) => left.createdAt.localeCompare(right.createdAt),
      );
    }
  }
}
