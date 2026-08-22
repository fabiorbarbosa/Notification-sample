import { Component, OnDestroy, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, NotificationMessage } from './notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (notificationService.showReturnBanner()) {
      <div class="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 animate-slide-down">
        <div class="bg-amber-100 dark:bg-amber-900 border border-amber-300 dark:border-amber-700 rounded-xl shadow-xl p-4 flex items-start gap-3">
          <div class="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-sm">
            ⚠
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-amber-900 dark:text-amber-100 font-medium text-sm">{{ notificationService.returnBannerMessage() }}</p>
            <p class="text-amber-800 dark:text-amber-200 text-xs mt-1">As notificações foram limpas automaticamente.</p>
          </div>
          <button
            (click)="notificationService.dismissReturnBanner()"
            class="flex-shrink-0 text-amber-600 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-200 transition-colors p-1"
            aria-label="Fechar banner"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    }

    <main class="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
      <div class="max-w-3xl mx-auto">
        <header class="text-center mb-10">
          <h1 class="text-3xl font-bold text-slate-900 dark:text-white mb-2">Notification Demo</h1>
          <p class="text-slate-600 dark:text-slate-400">Angular 18 • Signals • Broadcast Channel • Web Audio API</p>
        </header>

        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 space-y-6">
          <section class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-slate-50 dark:bg-slate-700 rounded-xl p-4 border border-slate-200 dark:border-slate-600">
              <h3 class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">ID da Aba</h3>
              <code class="font-mono text-sm text-slate-900 dark:text-slate-100 break-all bg-slate-100 dark:bg-slate-600 px-3 py-2 rounded-lg block">
                {{ notificationService.tabId() }}
              </code>
            </div>
            <div class="bg-slate-50 dark:bg-slate-700 rounded-xl p-4 border border-slate-200 dark:border-slate-600">
              <h3 class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Notificações na Fila</h3>
              <div class="flex items-center gap-3">
                <div class="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                  {{ notificationService.notificationCount() }}
                </div>
                <div>
                  <p class="text-2xl font-bold text-slate-900 dark:text-white">
                    {{ notificationService.notificationCount() }}
                  </p>
                  <p class="text-xs text-slate-500 dark:text-slate-400">
                    @if (notificationService.notificationCount() > 0) {
                      <span class="inline-flex items-center px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-medium">
                        Ativo
                      </span>
                    } @else {
                      <span class="inline-flex items-center px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium">
                        Limpo
                      </span>
                    }
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section class="space-y-3">
            <h3 class="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Ações
            </h3>
            <div class="flex flex-col sm:flex-row gap-3">
              <button
                (click)="simulateLocalProcess()"
                [disabled]="isProcessing()"
                class="bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Simular Processo Local</span>
                @if (isProcessing()) {
                  <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                }
              </button>
              <button
                (click)="broadcastToOthers()"
                [disabled]="isBroadcasting()"
                class="bg-purple-600 hover:bg-purple-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                </svg>
                <span>Disparar para Outras Abas</span>
                @if (isBroadcasting()) {
                  <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                }
              </button>
              <button
                (click)="sendWebhook()"
                [disabled]="isSendingWebhook()"
                class="bg-green-600 hover:bg-green-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Enviar Webhook</span>
                @if (isSendingWebhook()) {
                  <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                }
              </button>
            </div>
          </section>

          <section class="space-y-3">
            <h3 class="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <svg class="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              Testes Individuais por Recurso
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <button
                (click)="testBroadcastChannel()"
                [disabled]="isTestingBroadcast()"
                class="bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 text-sm shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                </svg>
                <span>1. Broadcast Channel</span>
                @if (isTestingBroadcast()) { <span class="animate-spin">⏳</span> }
              </button>

              <button
                (click)="testFaviconBadge()"
                [disabled]="isTestingFavicon()"
                class="bg-pink-600 hover:bg-pink-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 text-sm shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
                <span>2. Favicon Badge</span>
                @if (isTestingFavicon()) { <span class="animate-spin">⏳</span> }
              </button>

              <button
                (click)="testTitleBlink()"
                [disabled]="isTestingTitle()"
                class="bg-orange-600 hover:bg-orange-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 text-sm shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span>3. Título Piscando</span>
                @if (isTestingTitle()) { <span class="animate-spin">⏳</span> }
              </button>

              <button
                (click)="testAudioBeep()"
                [disabled]="isTestingAudio()"
                class="bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 text-sm shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
                <span>4. Áudio Bip</span>
                @if (isTestingAudio()) { <span class="animate-spin">⏳</span> }
              </button>

              <button
                (click)="testPageVisibilityBanner()"
                [disabled]="isTestingVisibility()"
                class="bg-amber-600 hover:bg-amber-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 text-sm shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7z" />
                </svg>
                <span>5. Banner Retorno</span>
                @if (isTestingVisibility()) { <span class="animate-spin">⏳</span> }
              </button>

              <button
                (click)="testWebhook()"
                [disabled]="isTestingWebhook()"
                class="bg-cyan-600 hover:bg-cyan-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 text-sm shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>6. Webhook</span>
                @if (isTestingWebhook()) { <span class="animate-spin">⏳</span> }
              </button>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Cada botão testa apenas o recurso correspondente. Abra múltiplas abas para testar o Broadcast Channel.
            </p>
          </section>

          <section class="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Histórico de Mensagens
              </h3>
              <button
                (click)="notificationService.clearHistory()"
                class="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors px-2 py-1 rounded"
              >
                Limpar
              </button>
            </div>
            <div class="max-h-96 overflow-y-auto scrollbar-thin bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600">
              @if (notificationService.messages().length === 0) {
                <div class="p-8 text-center text-slate-500 dark:text-slate-400">
                  <svg class="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p class="text-sm">Nenhuma mensagem recebida ainda</p>
                  <p class="text-xs mt-1">Clique nos botões acima para testar</p>
                </div>
              } @else {
                <ul class="divide-y divide-slate-200 dark:divide-slate-600">
                  @for (msg of notificationService.messages(); track msg.id) {
                    <li class="p-4 hover:bg-slate-100 dark:hover:bg-slate-600/50 transition-colors">
                      <div class="flex items-start gap-3">
                        <div class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                          [ngClass]="{
                            'bg-blue-500': msg.type === 'local',
                            'bg-purple-500': msg.type === 'broadcast',
                            'bg-green-500': msg.type === 'webhook'
                          }">
                          @if (msg.type === 'local') { 📍 }
                          @if (msg.type === 'broadcast') { 📡 }
                          @if (msg.type === 'webhook') { 🔗 }
                        </div>
                        <div class="flex-1 min-w-0">
                          <div class="flex items-center gap-2 mb-1">
                            <span class="font-medium text-slate-900 dark:text-white text-sm">{{ msg.message }}</span>
                            <span class="text-xs px-2 py-0.5 rounded-full font-medium"
                              [ngClass]="{
                                'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300': msg.type === 'local',
                                'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300': msg.type === 'broadcast',
                                'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300': msg.type === 'webhook'
                              }">
                              {{ msg.type }}
                            </span>
                          </div>
                          <div class="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                            <span class="font-mono">{{ msg.tabId }}</span>
                            <span>{{ formatTime(msg.timestamp) }}</span>
                          </div>
                        </div>
                      </div>
                    </li>
                  }
                </ul>
              }
            </div>
          </section>

          <section class="pt-4 border-t border-slate-200 dark:border-slate-700">
            <h3 class="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <svg class="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.734-.988-2.386l-.548-.547z" />
              </svg>
              Recursos Implementados
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div class="bg-slate-50 dark:bg-slate-700 rounded-lg p-3 border border-slate-200 dark:border-slate-600">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-green-500"></span>
                  <span class="text-slate-700 dark:text-slate-300">Broadcast Channel API</span>
                </div>
              </div>
              <div class="bg-slate-50 dark:bg-slate-700 rounded-lg p-3 border border-slate-200 dark:border-slate-600">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-green-500"></span>
                  <span class="text-slate-700 dark:text-slate-300">Favicon Badge (Canvas)</span>
                </div>
              </div>
              <div class="bg-slate-50 dark:bg-slate-700 rounded-lg p-3 border border-slate-200 dark:border-slate-600">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-green-500"></span>
                  <span class="text-slate-700 dark:text-slate-300">Título Piscando (setInterval)</span>
                </div>
              </div>
              <div class="bg-slate-50 dark:bg-slate-700 rounded-lg p-3 border border-slate-200 dark:border-slate-600">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-green-500"></span>
                  <span class="text-slate-700 dark:text-slate-300">Áudio Bip (Web Audio API)</span>
                </div>
              </div>
              <div class="bg-slate-50 dark:bg-slate-700 rounded-lg p-3 border border-slate-200 dark:border-slate-600">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-green-500"></span>
                  <span class="text-slate-700 dark:text-slate-300">Page Visibility API</span>
                </div>
              </div>
              <div class="bg-slate-50 dark:bg-slate-700 rounded-lg p-3 border border-slate-200 dark:border-slate-600">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-green-500"></span>
                  <span class="text-slate-700 dark:text-slate-300">Webhook (fetch API)</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        <footer class="text-center mt-8 text-sm text-slate-500 dark:text-slate-400">
          <p>Abra esta página em várias abas para testar a comunicação entre abas via Broadcast Channel</p>
        </footer>
      </div>
    </main>

    <style>
      @keyframes slide-down {
        from {
          opacity: 0;
          transform: translateX(-50%) translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
      }
      .animate-slide-down {
        animation: slide-down 0.3s ease-out;
      }
    </style>
  `,
  styles: []
})
export class AppComponent implements OnDestroy {
  notificationService = inject(NotificationService);

  isProcessing = signal(false);
  isBroadcasting = signal(false);
  isSendingWebhook = signal(false);
  isTestingBroadcast = signal(false);
  isTestingFavicon = signal(false);
  isTestingTitle = signal(false);
  isTestingAudio = signal(false);
  isTestingVisibility = signal(false);
  isTestingWebhook = signal(false);

  constructor() {
    effect(() => {
      if (this.notificationService.hasNotifications()) {
        console.log(`[${this.notificationService.tabId()}] Notificações ativas: ${this.notificationService.notificationCount()}`);
      }
    });
  }

  ngOnDestroy(): void {
    this.notificationService.destroy();
  }

  async simulateLocalProcess(): Promise<void> {
    this.isProcessing.set(true);
    try {
      this.notificationService.simulateLocalProcess();
      await new Promise(resolve => setTimeout(resolve, 300));
    } finally {
      this.isProcessing.set(false);
    }
  }

  async broadcastToOthers(): Promise<void> {
    this.isBroadcasting.set(true);
    try {
      this.notificationService.broadcastToOtherTabs();
      await new Promise(resolve => setTimeout(resolve, 300));
    } finally {
      this.isBroadcasting.set(false);
    }
  }

  async sendWebhook(): Promise<void> {
    this.isSendingWebhook.set(true);
    try {
      await this.notificationService.sendWebhook();
    } finally {
      this.isSendingWebhook.set(false);
    }
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  testBroadcastChannel(): void {
    this.isTestingBroadcast.set(true);
    this.notificationService.broadcastToOtherTabs();
    setTimeout(() => this.isTestingBroadcast.set(false), 300);
  }

  testFaviconBadge(): void {
    this.isTestingFavicon.set(true);
    const count = this.notificationService.notificationCount() + 1;
    this.notificationService.testFaviconBadge(count);
    setTimeout(() => {
      this.notificationService.testFaviconBadge(this.notificationService.notificationCount());
      this.isTestingFavicon.set(false);
    }, 1500);
  }

  testTitleBlink(): void {
    this.isTestingTitle.set(true);
    this.notificationService.testTitleBlink('Teste de título piscando!');
    setTimeout(() => {
      this.notificationService.testStopTitleBlink();
      this.isTestingTitle.set(false);
    }, 3000);
  }

  testAudioBeep(): void {
    this.isTestingAudio.set(true);
    this.notificationService.testPlayBeep();
    setTimeout(() => this.isTestingAudio.set(false), 500);
  }

  testPageVisibilityBanner(): void {
    this.isTestingVisibility.set(true);
    this.notificationService.testShowBanner('Teste manual: Simulando retorno à aba após notificações!');
    setTimeout(() => this.isTestingVisibility.set(false), 300);
  }

  testWebhook(): void {
    this.isTestingWebhook.set(true);
    this.notificationService.sendWebhook().finally(() => this.isTestingWebhook.set(false));
  }
}