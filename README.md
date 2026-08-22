# Notification Demo - Angular 18

Aplicação completa demonstrando recursos de notificação entre abas usando Angular 18 (Standalone Components) e Signals.

## Recursos Implementados

1. **Broadcast Channel API** - Comunicação entre abas abertas no mesmo navegador
2. **Favicon Badge** - Badge animado no favicon usando Canvas API
3. **Título Piscando** - Alternância do `document.title` com `setInterval`
4. **Áudio Bip** - Som gerado nativamente com Web Audio Context API (oscilador senoidal)
5. **Page Visibility API** - Banner de retorno quando usuário volta à aba
6. **Webhook Integration** - Envio de payload JSON via `fetch` API

## Tecnologias

- Angular 18 (Standalone Components)
- Angular Signals para gerenciamento de estado
- Tailwind CSS com Dark Mode nativo
- TypeScript strict mode
- Native Web APIs (BroadcastChannel, AudioContext, Canvas, Page Visibility)

## Instalação

```bash
npm install
```

## Execução

```bash
npm start
```

A aplicação estará disponível em `http://localhost:4200`

## Como Testar

1. Abra `http://localhost:4200` em uma aba
2. Abra a mesma URL em uma segunda aba (ou mais)
3. Em uma aba, clique em **"Simular Processo Local"** - verá notificação local
4. Em uma aba, clique em **"Disparar para Outras Abas"** - as outras abas receberão a notificação
5. Teste o **Webhook** enviando para `https://httpbin.org/post` (endpoint de teste)
6. Para testar o **Banner de Retorno**:
   - Clique em "Disparar para Outras Abas" em uma aba
   - Mude para outra aba (torne a primeira oculta)
   - Volte para a primeira aba - o banner aparecerá

## Estrutura do Projeto

```
src/
├── app/
│   ├── notification.service.ts  # Serviço global com toda a lógica
│   └── app.component.ts         # Componente principal com UI
├── index.html
├── main.ts
├── styles.css
└── favicon.svg
```

## APIs Utilizadas

| API | Uso |
|-----|-----|
| `BroadcastChannel` | Comunicação cross-tab |
| `HTMLCanvasElement` | Desenho do badge no favicon |
| `document.title` + `setInterval` | Título piscando |
| `AudioContext` + `OscillatorNode` | Geração de áudio nativa |
| `document.visibilitychange` | Detecção de foco da aba |
| `fetch` | Envio de webhook |

## Dark Mode

O suporte a Dark Mode é nativo via Tailwind CSS (`dark:` classes). O tema segue a preferência do sistema (`prefers-color-scheme`).

## Build de Produção

```bash
npm run build
```

Os arquivos serão gerados em `dist/notification-sample/`