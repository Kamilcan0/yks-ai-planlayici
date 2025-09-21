// Service Worker for YKS Plan PWA
const CACHE_NAME = 'yks-plan-v1'
const urlsToCache = [
  '/',
  '/home',
  '/sources',
  '/profile',
  '/login',
  '/register',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
]

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...')
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  )
})

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => self.clients.claim())
  )
})

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request)
      })
      .catch(() => {
        // Fallback for offline pages
        if (event.request.destination === 'document') {
          return caches.match('/')
        }
      })
  )
})

// Push event for notifications
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event)
  
  const options = {
    body: event.data ? event.data.text() : 'Bugünkü çalışma planını tamamlamayı unutma!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      {
        action: 'explore',
        title: 'Planımı Görüntüle',
        icon: '/icons/icon-96x96.png'
      },
      {
        action: 'close',
        title: 'Kapat',
        icon: '/icons/icon-96x96.png'
      }
    ]
  }

  event.waitUntil(
    self.registration.showNotification('YKS Plan Hatırlatması', options)
  )
})

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification click received:', event)
  
  event.notification.close()
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/home')
    )
  } else if (event.action === 'close') {
    // Do nothing, just close
  } else {
    // Default action
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})

// Background sync for offline data
self.addEventListener('sync', (event) => {
  console.log('Background sync event:', event.tag)
  
  if (event.tag === 'study-progress-sync') {
    event.waitUntil(syncStudyProgress())
  }
})

async function syncStudyProgress() {
  try {
    // Sync study progress when back online
    const cache = await caches.open('study-data')
    const offlineData = await cache.match('/offline-progress')
    
    if (offlineData) {
      const data = await offlineData.json()
      // Send to server
      await fetch('/api/sync-progress', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      // Clear offline cache
      await cache.delete('/offline-progress')
      console.log('Study progress synced successfully')
    }
  } catch (error) {
    console.error('Failed to sync study progress:', error)
  }
}