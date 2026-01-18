/**
 * ABSOLUTE FANSUB - SERVICE WORKER
 * Gerencia cache offline e atualizações do PWA
 * Versão: 2.0.0
 */

const CACHE_VERSION = 'absolute-v2.0.0';
const RUNTIME_CACHE = 'absolute-runtime-v2';

// Arquivos essenciais para funcionamento offline
const CORE_FILES = [
    '/',
    '/index.html',
    '/anime.html',
    '/projetos.html',
    '/style.css',
    '/styledn.css',
    '/css/improvements.css',
    '/data.js',
    '/postDate1.js',
    '/js/utils.js',
    '/js/loading.js',
    '/js/header.js',
    '/js/footer.js',
    '/js/search.js',
    '/js/menuHam.js',
    '/js/favorites.js',
    '/js/theme-toggle.js',
    '/img/assets/loadinglogo.png',
    '/img/assets/favicon.ico',
    '/img/assets/absolute-logo-small.png'
];

// Arquivos para cache de imagens
const IMAGE_CACHE = 'absolute-images-v2';
const MAX_IMAGE_CACHE_SIZE = 50; // Máximo de imagens em cache

// ==================== INSTALAÇÃO ====================

self.addEventListener('install', event => {
    console.log('[SW] Instalando Service Worker versão', CACHE_VERSION);
    
    event.waitUntil(
        caches.open(CACHE_VERSION)
            .then(cache => {
                console.log('[SW] Cache aberto');
                return cache.addAll(CORE_FILES);
            })
            .then(() => {
                console.log('[SW] Arquivos essenciais em cache');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('[SW] Erro ao cachear arquivos:', error);
            })
    );
});

// ==================== ATIVAÇÃO ====================

self.addEventListener('activate', event => {
    console.log('[SW] Ativando Service Worker versão', CACHE_VERSION);
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(name => name !== CACHE_VERSION && name !== RUNTIME_CACHE && name !== IMAGE_CACHE)
                        .map(name => {
                            console.log('[SW] Removendo cache antigo:', name);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => self.clients.claim())
    );
});

// ==================== FETCH (ESTRATÉGIAS DE CACHE) ====================

self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Ignora requisições de analytics e cross-origin
    if (url.origin !== location.origin || url.pathname.includes('google-analytics')) {
        return;
    }

    // Estratégia para diferentes tipos de arquivos
    if (request.destination === 'image') {
        event.respondWith(handleImageRequest(request));
    } else if (request.destination === 'document') {
        event.respondWith(handleDocumentRequest(request));
    } else if (request.destination === 'script' || request.destination === 'style') {
        event.respondWith(handleAssetRequest(request));
    } else {
        event.respondWith(handleGenericRequest(request));
    }
});

/**
 * Estratégia Cache First para imagens
 */
async function handleImageRequest(request) {
    try {
        // Busca no cache primeiro
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        // Se não está em cache, busca da rede
        const networkResponse = await fetch(request);
        
        // Cacheia a resposta
        if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(IMAGE_CACHE);
            
            // Limita o tamanho do cache de imagens
            const keys = await cache.keys();
            if (keys.length >= MAX_IMAGE_CACHE_SIZE) {
                await cache.delete(keys[0]);
            }
            
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.error('[SW] Erro ao buscar imagem:', error);
        // Retorna placeholder se houver erro
        return new Response('<svg>...</svg>', {
            headers: { 'Content-Type': 'image/svg+xml' }
        });
    }
}

/**
 * Estratégia Network First para documentos HTML
 */
async function handleDocumentRequest(request) {
    try {
        // Tenta buscar da rede primeiro
        const networkResponse = await fetch(request);
        
        // Atualiza cache com nova versão
        const cache = await caches.open(RUNTIME_CACHE);
        cache.put(request, networkResponse.clone());
        
        return networkResponse;
    } catch (error) {
        // Se falhar, tenta buscar do cache
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Se não houver cache, retorna página offline
        return caches.match('/index.html');
    }
}

/**
 * Estratégia Cache First para JS/CSS
 */
async function handleAssetRequest(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            // Atualiza em background
            fetch(request).then(networkResponse => {
                if (networkResponse && networkResponse.status === 200) {
                    caches.open(CACHE_VERSION).then(cache => {
                        cache.put(request, networkResponse);
                    });
                }
            });
            
            return cachedResponse;
        }

        const networkResponse = await fetch(request);
        
        if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(CACHE_VERSION);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.error('[SW] Erro ao buscar asset:', error);
        return caches.match(request);
    }
}

/**
 * Estratégia genérica
 */
async function handleGenericRequest(request) {
    try {
        const networkResponse = await fetch(request);
        return networkResponse;
    } catch (error) {
        const cachedResponse = await caches.match(request);
        return cachedResponse || new Response('Offline');
    }
}

// ==================== MENSAGENS ====================

self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'CACHE_URLS') {
        const urls = event.data.urls;
        
        caches.open(RUNTIME_CACHE).then(cache => {
            urls.forEach(url => {
                fetch(url).then(response => {
                    if (response && response.status === 200) {
                        cache.put(url, response);
                    }
                });
            });
        });
    }
});

// ==================== BACKGROUND SYNC ====================

self.addEventListener('sync', event => {
    if (event.tag === 'sync-data') {
        event.waitUntil(syncData());
    }
});

async function syncData() {
    console.log('[SW] Sincronizando dados...');
    // Aqui você pode implementar lógica de sincronização
    // Por exemplo, enviar comentários salvos offline
}

// ==================== PUSH NOTIFICATIONS ====================

self.addEventListener('push', event => {
    const options = {
        body: event.data ? event.data.text() : 'Novo conteúdo disponível!',
        icon: '/img/assets/loadinglogo.png',
        badge: '/img/assets/favicon.ico',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Ver agora',
                icon: '/img/assets/favicon.ico'
            },
            {
                action: 'close',
                title: 'Fechar',
                icon: '/img/assets/favicon.ico'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('Absolute Fansub', options)
    );
});

self.addEventListener('notificationclick', event => {
    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// ==================== UTILIDADES ====================

/**
 * Limpa caches antigos
 */
async function clearOldCaches() {
    const cacheNames = await caches.keys();
    const cachesToDelete = cacheNames.filter(name => 
        !name.includes(CACHE_VERSION) && 
        !name.includes(RUNTIME_CACHE) && 
        !name.includes(IMAGE_CACHE)
    );
    
    await Promise.all(cachesToDelete.map(name => caches.delete(name)));
}

// Log de status
console.log('[SW] Service Worker registrado - Versão', CACHE_VERSION);
