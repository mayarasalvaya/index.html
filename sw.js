// ── SERVICE WORKER — Calendário de Demandas ──
// Versão: 1.0

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(self.clients.claim());
});

// Recebe mensagem da página para agendar uma notificação
self.addEventListener('message', e => {
  if (e.data?.type === 'SCHEDULE_NOTIF') {
    const { title, body, timestamp, tag } = e.data;
    const delay = timestamp - Date.now();
    if (delay <= 0) return;
    setTimeout(() => {
      self.registration.showNotification(title, {
        body,
        tag,
        icon: 'https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/1f33f.png',
        badge: 'https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/1f33f.png',
        vibrate: [200, 100, 200],
        requireInteraction: true,
        actions: [
          { action: 'done', title: '✓ Marcar feita' },
          { action: 'snooze', title: '⏰ +15 min' }
        ]
      });
    }, delay);
  }

  if (e.data?.type === 'CANCEL_NOTIF') {
    // não há API nativa pra cancelar setTimeout no SW,
    // mas podemos ignorar via tag no próximo showNotification
  }
});

// Clique na notificação — abre o app
self.addEventListener('notificationclick', e => {
  e.notification.close();
  if (e.action === 'snooze') {
    // reagenda +15min
    const { title, body, tag } = e.notification;
    setTimeout(() => {
      self.registration.showNotification('⏰ ' + title, {
        body: 'Lembrete adiado: ' + body,
        tag: tag + '_snooze',
        requireInteraction: true
      });
    }, 15 * 60 * 1000);
    return;
  }
  // abre ou foca a aba do app
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      const app = clients.find(c => c.url.includes('index.html') || c.url.endsWith('/'));
      if (app) return app.focus();
      return self.clients.openWindow('./');
    })
  );
});
