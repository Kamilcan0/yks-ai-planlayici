/**
 * YKS Akıllı Asistanı - Service Worker
 * Offline çalışma, push notifications ve cache yönetimi
 */

const CACHE_NAME = 'yks-ai-assistant-v1.0.0';
const OFFLINE_URL = '/offline.html';

// Cache edilecek temel dosyalar
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Service Worker kurulum
self.addEventListener('install', (event) => {
  console.log('🚀 YKS AI Assistant Service Worker kuruldu');
  
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(STATIC_ASSETS);
      
      // Offline sayfasını cache'le
      await cache.add(new Request(OFFLINE_URL, { cache: 'reload' }));
    })()
  );
  
  // Yeni SW'yi hemen aktifleştir
  self.skipWaiting();
});

// Service Worker aktivasyon
self.addEventListener('activate', (event) => {
  console.log('✅ YKS AI Assistant Service Worker aktifleşti');
  
  event.waitUntil(
    (async () => {
      // Eski cache'leri temizle
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter(cacheName => cacheName !== CACHE_NAME)
          .map(cacheName => caches.delete(cacheName))
      );
      
      // Tüm tabları kontrol et
      if ('clients' in self) {
        self.clients.claim();
      }
    })()
  );
});

// Network istekleri yakalama
self.addEventListener('fetch', (event) => {
  // Sadece HTTP(S) istekleri için
  if (!event.request.url.startsWith('http')) return;
  
  event.respondWith(
    (async () => {
      try {
        // Önce network'ten dene
        const networkResponse = await fetch(event.request);
        
        // Başarılıysa cache'e ekle
        if (networkResponse.ok) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(event.request, networkResponse.clone());
        }
        
        return networkResponse;
      } catch (error) {
        console.log('🔄 Network başarısız, cache\'ten servis ediliyor:', event.request.url);
        
        // Cache'ten bul
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // HTML sayfası ise offline sayfasını göster
        if (event.request.destination === 'document') {
          return caches.match(OFFLINE_URL);
        }
        
        // Diğer durumlarda boş response
        return new Response(
          JSON.stringify({ 
            error: 'Offline mode', 
            message: 'Bu özellik offline modda kullanılamaz' 
          }),
          { 
            headers: { 'Content-Type': 'application/json' },
            status: 503
          }
        );
      }
    })()
  );
});

// Push notification listener
self.addEventListener('push', (event) => {
  console.log('📱 Push notification alındı:', event);
  
  const options = {
    body: 'YKS çalışma zamanın geldi! 📚',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      {
        action: 'explore',
        title: 'Planı Aç',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Daha Sonra',
        icon: '/icons/xmark.png'
      }
    ],
    requireInteraction: true,
    silent: false
  };
  
  if (event.data) {
    const data = event.data.json();
    options.body = data.body || options.body;
    options.data = { ...options.data, ...data };
  }
  
  event.waitUntil(
    self.registration.showNotification('YKS Akıllı Asistanı', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    // Ana uygulamayı aç
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        for (const client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  } else if (event.action === 'close') {
    // Hiçbir şey yapma, sadece kapat
    return;
  } else {
    // Varsayılan: uygulamayı aç
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Background sync (gelecekte AI planı senkronizasyonu için)
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync:', event.tag);
  
  if (event.tag === 'ai-plan-sync') {
    event.waitUntil(syncAIPlan());
  }
});

// AI plan senkronizasyonu
async function syncAIPlan() {
  try {
    // LocalStorage'dan bekleyen verileri al
    const pendingData = await getStorageData('pendingSync');
    
    if (pendingData && pendingData.length > 0) {
      // API'ye gönder
      const response = await fetch('/api/sync-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pendingData)
      });
      
      if (response.ok) {
        // Başarılıysa pending data'yı temizle
        await clearStorageData('pendingSync');
        console.log('✅ AI plan başarıyla senkronize edildi');
      }
    }
  } catch (error) {
    console.error('❌ AI plan senkronizasyon hatası:', error);
  }
}

// Storage helper functions
async function getStorageData(key) {
  return new Promise((resolve) => {
    // IndexedDB kullanımı simülasyonu
    resolve(null);
  });
}

async function clearStorageData(key) {
  return new Promise((resolve) => {
    // IndexedDB temizleme simülasyonu
    resolve();
  });
}

// Mesaj dinleyici (ana uygulama ile iletişim)
self.addEventListener('message', (event) => {
  console.log('💬 SW mesaj alındı:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
    scheduleNotification(event.data.payload);
  }
});

// Bildirim zamanlaması
function scheduleNotification(payload) {
  const { title, body, delay } = payload;
  
  setTimeout(() => {
    self.registration.showNotification(title, {
      body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      vibrate: [200, 100, 200],
      requireInteraction: false
    });
  }, delay);
}

// Error handling
self.addEventListener('error', (event) => {
  console.error('❌ Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('❌ Service Worker unhandled rejection:', event.reason);
});

console.log('🤖 YKS AI Assistant Service Worker yüklendi');
