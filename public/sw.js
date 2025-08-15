// QuickBill Service Worker - Phase 3 PWA Implementation
// Provides offline functionality, caching, and background sync

const CACHE_NAME = 'quickbill-v1.0.0';
const RUNTIME_CACHE = 'quickbill-runtime';

// Assets to cache immediately when service worker installs
const PRECACHE_ASSETS = [
  '/',
  '/dashboard',
  '/create',
  '/history',
  '/settings',
  '/more',
  '/manifest.json',
  // Static assets will be added by Vite build process
];

// Network-first strategies for these routes
const NETWORK_FIRST_ROUTES = [
  '/api/',
  '/auth/',
  '/_firebase/',
];

// Cache-first strategies for these assets
const CACHE_FIRST_ROUTES = [
  '/icons/',
  '/images/',
  '/fonts/',
  '.js',
  '.css',
  '.png',
  '.jpg',
  '.jpeg',
  '.svg',
  '.woff',
  '.woff2',
];

// Install event - Cache essential assets
self.addEventListener('install', (event) => {
  console.log('QuickBill SW: Installing service worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('QuickBill SW: Precaching assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        console.log('QuickBill SW: Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('QuickBill SW: Installation failed', error);
      })
  );
});

// Activate event - Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('QuickBill SW: Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
              console.log('QuickBill SW: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('QuickBill SW: Activation complete');
        return self.clients.claim();
      })
  );
});

// Fetch event - Intelligent caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-HTTP requests
  if (!request.url.startsWith('http')) {
    return;
  }

  // Skip POST, PUT, DELETE requests (only cache GET requests)
  if (request.method !== 'GET') {
    return;
  }

  // Skip external domains (except Firebase/Google services)
  if (url.origin !== self.location.origin && 
      !url.hostname.includes('firebase') && 
      !url.hostname.includes('google') &&
      !url.hostname.includes('gstatic')) {
    return;
  }

  event.respondWith(handleRequest(request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  try {
    // Network-first strategy for API calls and auth
    if (NETWORK_FIRST_ROUTES.some(route => pathname.includes(route))) {
      return await networkFirst(request);
    }

    // Cache-first strategy for static assets
    if (CACHE_FIRST_ROUTES.some(route => pathname.includes(route) || pathname.endsWith(route))) {
      return await cacheFirst(request);
    }

    // Stale-while-revalidate for app pages
    return await staleWhileRevalidate(request);

  } catch (error) {
    console.error('QuickBill SW: Request failed', error);
    return await handleFallback(request);
  }
}

// Network-first strategy (for real-time data)
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Cache-first strategy (for static assets)
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    // Update cache in background
    fetch(request).then(response => {
      if (response.ok) {
        const cache = caches.open(CACHE_NAME);
        cache.then(c => c.put(request, response));
      }
    }).catch(() => {
      // Ignore network errors for background updates
    });
    
    return cachedResponse;
  }
  
  const response = await fetch(request);
  
  if (response.ok) {
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
  }
  
  return response;
}

// Stale-while-revalidate strategy (for app pages)
async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => {
    // Return cached version if network fails
    return cachedResponse;
  });
  
  return cachedResponse || await fetchPromise;
}

// Fallback handling for offline scenarios
async function handleFallback(request) {
  const url = new URL(request.url);
  
  // For navigation requests, return cached app shell
  if (request.mode === 'navigate') {
    const cachedApp = await caches.match('/');
    if (cachedApp) {
      return cachedApp;
    }
  }
  
  // For API requests, return offline message
  if (url.pathname.includes('/api/')) {
    return new Response(
      JSON.stringify({
        error: 'Offline',
        message: 'This feature requires an internet connection'
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
  
  // Default fallback
  return new Response('Offline', { status: 503 });
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('QuickBill SW: Background sync triggered', event.tag);
  
  if (event.tag === 'invoice-sync') {
    event.waitUntil(syncInvoices());
  }
});

// Sync pending invoices when back online
async function syncInvoices() {
  try {
    // Get pending invoices from IndexedDB
    const pendingInvoices = await getPendingInvoices();
    
    for (const invoice of pendingInvoices) {
      try {
        await syncInvoiceToServer(invoice);
        await removePendingInvoice(invoice.id);
      } catch (error) {
        console.error('Failed to sync invoice:', invoice.id, error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Placeholder functions for offline invoice management
async function getPendingInvoices() {
  // Implementation will integrate with IndexedDB
  return [];
}

async function syncInvoiceToServer(invoice) {
  // Implementation will sync to Firebase
  return fetch('/api/invoices', {
    method: 'POST',
    body: JSON.stringify(invoice),
    headers: { 'Content-Type': 'application/json' }
  });
}

async function removePendingInvoice(invoiceId) {
  // Implementation will remove from IndexedDB
  console.log('Remove pending invoice:', invoiceId);
}

// Push notifications for important updates
self.addEventListener('push', (event) => {
  console.log('QuickBill SW: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'QuickBill notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/icons/view.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/close.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('QuickBill', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('QuickBill SW: Notification clicked');
  
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

console.log('QuickBill Service Worker loaded successfully');
