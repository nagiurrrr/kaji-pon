self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()))
// Chrome の「インストールしますか？」の条件に fetch ハンドラが要るだけなので、中身は空（キャッシュしない）
self.addEventListener('fetch', () => {})
