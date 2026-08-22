import { Injectable, signal, computed, effect } from '@angular/core';

export interface NotificationMessage {
  id: string;
  tabId: string;
  message: string;
  timestamp: Date;
  type: 'local' | 'broadcast' | 'webhook';
}

export interface WebhookPayload {
  tabId: string;
  message: string;
  timestamp: string;
  notificationCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly CHANNEL_NAME = 'tab-notifications';
  private readonly ORIGINAL_TITLE = 'Notification Demo - Angular 18';
  private readonly FAVICON_SELECTOR = 'link[rel="icon"]#app-favicon';

  private broadcastChannel: BroadcastChannel | null = null;
  private titleBlinkInterval: ReturnType<typeof setInterval> | null = null;
  private audioContext: AudioContext | null = null;
  private originalFaviconHref: string = '';
  private isTabVisible = true;
  private wasHiddenWhenNotified = false;

  tabId = signal<string>(this.generateTabId());
  notificationCount = signal<number>(0);
  messages = signal<NotificationMessage[]>([]);
  showReturnBanner = signal<boolean>(false);
  returnBannerMessage = signal<string>('');

  isBlinking = computed(() => this.titleBlinkInterval !== null);
  hasNotifications = computed(() => this.notificationCount() > 0);

  constructor() {
    this.initBroadcastChannel();
    this.initPageVisibility();
    this.saveOriginalFavicon();
    this.initAudioContext();
  }

  private generateTabId(): string {
    return `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private initBroadcastChannel(): void {
    if (typeof BroadcastChannel !== 'undefined') {
      this.broadcastChannel = new BroadcastChannel(this.CHANNEL_NAME);
      this.broadcastChannel.onmessage = (event) => this.handleBroadcastMessage(event.data);
    }
  }

  private initPageVisibility(): void {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
    }
  }

  private saveOriginalFavicon(): void {
    if (typeof document !== 'undefined') {
      const favicon = document.querySelector<HTMLLinkElement>(this.FAVICON_SELECTOR);
      if (favicon) {
        this.originalFaviconHref = favicon.href;
      }
    }
  }

  private initAudioContext(): void {
    if (typeof AudioContext !== 'undefined' || typeof (window as any).webkitAudioContext !== 'undefined') {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AC();
    }
  }

  private handleBroadcastMessage(data: NotificationMessage): void {
    if (data.tabId === this.tabId()) return;

    this.addMessage(data);
    this.incrementNotification();
    this.playBeep();
    this.startTitleBlink(data.message);
    this.updateFaviconBadge(this.notificationCount());

    if (!this.isTabVisible) {
      this.wasHiddenWhenNotified = true;
    }
  }

  private handleVisibilityChange(): void {
    this.isTabVisible = !document.hidden;

    if (this.isTabVisible && this.wasHiddenWhenNotified) {
      this.showReturnBanner.set(true);
      this.returnBannerMessage.set(
        `Você perdeu ${this.notificationCount()} notificação(ões) enquanto estava ausente!`
      );
      this.wasHiddenWhenNotified = false;
      this.clearAllNotifications();
    }
  }

  private addMessage(message: NotificationMessage): void {
    this.messages.update(msgs => [message, ...msgs].slice(0, 50));
  }

  private incrementNotification(): void {
    this.notificationCount.update(count => count + 1);
  }

  private playBeep(): void {
    if (!this.audioContext) return;

    const ctx = this.audioContext;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.15);

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.2);
  }

  private startTitleBlink(alertMessage: string): void {
    if (this.titleBlinkInterval) return;

    let toggle = false;
    this.titleBlinkInterval = setInterval(() => {
      document.title = toggle ? `🔴 (${this.notificationCount()}) ${alertMessage}` : this.ORIGINAL_TITLE;
      toggle = !toggle;
    }, 800);
  }

  private stopTitleBlink(): void {
    if (this.titleBlinkInterval) {
      clearInterval(this.titleBlinkInterval);
      this.titleBlinkInterval = null;
      document.title = this.ORIGINAL_TITLE;
    }
  }

  private updateFaviconBadge(count: number): void {
    if (typeof document === 'undefined' || count <= 0) {
      this.resetFavicon();
      return;
    }

    const favicon = document.querySelector<HTMLLinkElement>(this.FAVICON_SELECTOR);
    if (!favicon) return;

    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = this.originalFaviconHref || favicon.href;

    img.onload = () => {
      ctx.drawImage(img, 0, 0, 32, 32);

      ctx.beginPath();
      ctx.arc(24, 8, 10, 0, Math.PI * 2);
      ctx.fillStyle = '#ef4444';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.font = 'bold 11px Arial';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const text = count > 9 ? '9+' : count.toString();
      ctx.fillText(text, 24, 8);

      favicon.href = canvas.toDataURL('image/png');
    };

    img.onerror = () => {
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(0, 0, 32, 32);
      ctx.beginPath();
      ctx.arc(24, 8, 10, 0, Math.PI * 2);
      ctx.fillStyle = '#ef4444';
      ctx.fill();
      ctx.font = 'bold 11px Arial';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(count > 9 ? '9+' : count.toString(), 24, 8);
      favicon.href = canvas.toDataURL('image/png');
    };
  }

  private resetFavicon(): void {
    const favicon = document.querySelector<HTMLLinkElement>(this.FAVICON_SELECTOR);
    if (favicon && this.originalFaviconHref) {
      favicon.href = this.originalFaviconHref;
    }
  }

  private clearAllNotifications(): void {
    this.notificationCount.set(0);
    this.stopTitleBlink();
    this.resetFavicon();
  }

  dismissReturnBanner(): void {
    this.showReturnBanner.set(false);
    this.returnBannerMessage.set('');
  }

  simulateLocalProcess(): void {
    const message: NotificationMessage = {
      id: `msg-${Date.now()}`,
      tabId: this.tabId(),
      message: 'Processo local concluído com sucesso!',
      timestamp: new Date(),
      type: 'local'
    };

    this.addMessage(message);
    this.incrementNotification();
    this.playBeep();
    this.startTitleBlink(message.message);
    this.updateFaviconBadge(this.notificationCount());

    if (!this.isTabVisible) {
      this.wasHiddenWhenNotified = true;
    }
  }

  broadcastToOtherTabs(): void {
    if (!this.broadcastChannel) return;

    const message: NotificationMessage = {
      id: `msg-${Date.now()}`,
      tabId: this.tabId(),
      message: 'Novo processo disparado via Broadcast!',
      timestamp: new Date(),
      type: 'broadcast'
    };

    this.broadcastChannel.postMessage(message);
    this.addMessage({
      ...message,
      message: `[Enviado] ${message.message}`
    });
  }

  async sendWebhook(webhookUrl: string = 'https://httpbin.org/post'): Promise<boolean> {
    const payload: WebhookPayload = {
      tabId: this.tabId(),
      message: 'Processo concluído - Notificação via Webhook',
      timestamp: new Date().toISOString(),
      notificationCount: this.notificationCount()
    };

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        this.addMessage({
          id: `webhook-${Date.now()}`,
          tabId: this.tabId(),
          message: '✅ Webhook enviado com sucesso!',
          timestamp: new Date(),
          type: 'webhook'
        });
        return true;
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      this.addMessage({
        id: `webhook-error-${Date.now()}`,
        tabId: this.tabId(),
        message: `❌ Erro ao enviar webhook: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        timestamp: new Date(),
        type: 'webhook'
      });
      return false;
    }
  }

  clearHistory(): void {
    this.messages.set([]);
  }

  // Métodos públicos para testes individuais
  testFaviconBadge(count: number): void {
    this.updateFaviconBadge(count);
  }

  testTitleBlink(message: string): void {
    this.startTitleBlink(message);
  }

  testStopTitleBlink(): void {
    this.stopTitleBlink();
  }

  testPlayBeep(): void {
    this.playBeep();
  }

  testShowBanner(message: string): void {
    this.showReturnBanner.set(true);
    this.returnBannerMessage.set(message);
  }

  destroy(): void {
    this.stopTitleBlink();
    this.resetFavicon();
    this.broadcastChannel?.close();
    this.audioContext?.close();
  }
}