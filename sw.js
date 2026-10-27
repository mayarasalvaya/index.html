// ── SERVICE WORKER — Calendário de Demandas ──
// Versão: 2.0
// Os alarmes são verificados pela página (aberta em alguma aba).
// Aqui só tratamos os cliques nas notificações do sistema.

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

async function getAppClient() {
  const list = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  const scope = self.registration.scope;
  return list.find(c => c.url.startsWith(scope)) || null;
}

self.addEventListener('notificationclick', e => {
  const n = e.notification;
  const data = n.data || {};
  n.close();

  e.waitUntil((async () => {
    let client = await getAppClient();

    if (e.action === 'done' || e.action === 'snooze') {
      if (client) {
        client.postMessage({ type: 'NOTIF_ACTION', action: e.action, taskId: data.taskId, title: data.title });
        return;
      }
    }

    if (client) {
      try { await client.focus(); } catch (err) {}
      return;
    }
    client = await self.clients.openWindow('./calendario-demandas.html');
  })());
});
