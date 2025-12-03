# -------------------------------------------------------------
# VIBEAI – PWA & OFFLINE MODE GENERATOR
# -------------------------------------------------------------
import os
from typing import Dict, Any, Optional, List


class PWAGenerator:
    """
    Generiert Progressive Web App (PWA) Konfigurationen:
    - Web App Manifest
    - Service Worker (Offline-Strategien)
    - App Icons (verschiedene Größen)
    - Installierbarkeit
    - Push Notifications
    """

    def __init__(self):
        self.cache_strategies = [
            "cache_first",
            "network_first",
            "stale_while_revalidate",
            "network_only",
            "cache_only"
        ]
        
        self.icon_sizes = [72, 96, 128, 144, 152, 192, 384, 512]

    def generate_pwa(
        self,
        base_path: str,
        app_name: str,
        options: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Generiert komplette PWA-Konfiguration
        
        Args:
            base_path: Projekt-Pfad
            app_name: App-Name
            options: Cache-Strategie, Theme, Icons, etc.
        
        Returns:
            Dict mit success, files, features
        """
        options = options or {}
        files = []
        
        # 1. Generate Manifest
        manifest_file = self._generate_manifest(base_path, app_name, options)
        files.append(manifest_file)
        
        # 2. Generate Service Worker
        sw_file = self._generate_service_worker(
            base_path,
            options.get("cache_strategy", "network_first"),
            options.get("cache_urls", [])
        )
        files.append(sw_file)
        
        # 3. Generate Service Worker Registration
        register_file = self._generate_sw_register(base_path)
        files.append(register_file)
        
        # 4. Generate Offline Page
        offline_file = self._generate_offline_page(base_path, app_name)
        files.append(offline_file)
        
        # 5. Generate Icons Config
        icons_config = self._generate_icons_config(base_path, options)
        files.append(icons_config)
        
        # 6. Generate Install Prompt
        install_file = self._generate_install_prompt(base_path, app_name)
        files.append(install_file)
        
        return {
            "success": True,
            "files": files,
            "features": [
                "Offline Support",
                "Installable",
                "App Manifest",
                "Service Worker",
                "Cache Strategy",
                "Push Notifications Ready"
            ],
            "cache_strategy": options.get("cache_strategy", "network_first"),
            "icon_sizes": self.icon_sizes
        }

    def _generate_manifest(
        self,
        base_path: str,
        app_name: str,
        options: Dict[str, Any]
    ) -> str:
        """Generiert Web App Manifest (manifest.json)"""
        import json
        
        manifest = {
            "name": options.get("full_name", f"{app_name} App"),
            "short_name": options.get("short_name", app_name),
            "description": options.get(
                "description",
                f"{app_name} - Progressive Web Application"
            ),
            "start_url": options.get("start_url", "/"),
            "display": options.get("display", "standalone"),
            "background_color": options.get("background_color", "#ffffff"),
            "theme_color": options.get("theme_color", "#000000"),
            "orientation": options.get("orientation", "portrait-primary"),
            "scope": "/",
            "icons": [
                {
                    "src": f"/icons/icon-{size}x{size}.png",
                    "sizes": f"{size}x{size}",
                    "type": "image/png",
                    "purpose": "any maskable" if size >= 192 else "any"
                }
                for size in self.icon_sizes
            ],
            "categories": options.get("categories", ["utilities", "productivity"]),
            "screenshots": options.get("screenshots", []),
            "shortcuts": options.get("shortcuts", [
                {
                    "name": "Home",
                    "short_name": "Home",
                    "description": "Open home page",
                    "url": "/",
                    "icons": [{"src": "/icons/icon-96x96.png", "sizes": "96x96"}]
                }
            ])
        }
        
        # Add optional features
        if options.get("share_target"):
            manifest["share_target"] = {
                "action": "/share",
                "method": "POST",
                "enctype": "multipart/form-data",
                "params": {
                    "title": "title",
                    "text": "text",
                    "url": "url"
                }
            }
        
        manifest_path = f"{base_path}/public/manifest.json"
        os.makedirs(os.path.dirname(manifest_path), exist_ok=True)
        with open(manifest_path, "w") as f:
            json.dump(manifest, f, indent=2)
        
        return manifest_path

    def _generate_service_worker(
        self,
        base_path: str,
        cache_strategy: str,
        cache_urls: List[str]
    ) -> str:
        """Generiert Service Worker mit Cache-Strategie"""
        
        cache_name = "vibeai-cache-v1"
        default_cache_urls = [
            "/",
            "/index.html",
            "/offline.html",
            "/manifest.json",
            "/styles.css",
            "/app.js"
        ]
        
        all_cache_urls = list(set(default_cache_urls + cache_urls))
        
        sw_content = f"""// VibeAI Service Worker - Auto-generated
const CACHE_NAME = '{cache_name}';
const OFFLINE_URL = '/offline.html';

// URLs to cache on install
const urlsToCache = {all_cache_urls};

// Install event - cache resources
self.addEventListener('install', (event) => {{
  console.log('[SW] Installing Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {{
        console.log('[SW] Caching app shell');
        return cache.addAll(urlsToCache);
      }})
      .then(() => self.skipWaiting())
  );
}});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {{
  console.log('[SW] Activating Service Worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {{
      return Promise.all(
        cacheNames.map((cacheName) => {{
          if (cacheName !== CACHE_NAME) {{
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }}
        }})
      );
    }})
    .then(() => self.clients.claim())
  );
}});

// Fetch event - cache strategy
self.addEventListener('fetch', (event) => {{
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {{
    return;
  }}

  event.respondWith(
    {self._get_cache_strategy_code(cache_strategy)}
  );
}});

// Background Sync (optional)
self.addEventListener('sync', (event) => {{
  if (event.tag === 'sync-data') {{
    event.waitUntil(syncData());
  }}
}});

async function syncData() {{
  // Implement your sync logic here
  console.log('[SW] Background sync triggered');
}}

// Push Notifications (optional)
self.addEventListener('push', (event) => {{
  const data = event.data ? event.data.json() : {{}};
  const title = data.title || 'VibeAI Notification';
  const options = {{
    body: data.body || 'You have a new notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: data.data || {{}}
  }};

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
}});

// Notification click
self.addEventListener('notificationclick', (event) => {{
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
}});
"""
        
        sw_path = f"{base_path}/public/service-worker.js"
        os.makedirs(os.path.dirname(sw_path), exist_ok=True)
        with open(sw_path, "w") as f:
            f.write(sw_content)
        
        return sw_path

    def _get_cache_strategy_code(self, strategy: str) -> str:
        """Gibt Code für spezifische Cache-Strategie zurück"""
        
        if strategy == "cache_first":
            return """caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        // Not in cache - fetch from network
        return fetch(event.request).then((response) => {
          // Cache the new response
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        });
      })
      .catch(() => caches.match(OFFLINE_URL))"""
        
        elif strategy == "network_first":
            return """fetch(event.request)
      .then((response) => {
        // Network success - cache and return
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      })
      .catch(() => {
        // Network failed - return from cache
        return caches.match(event.request)
          .then((response) => response || caches.match(OFFLINE_URL));
      })"""
        
        elif strategy == "stale_while_revalidate":
            return """caches.match(event.request)
      .then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          // Update cache with new response
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
          });
          return networkResponse;
        });
        // Return cached response immediately, update in background
        return cachedResponse || fetchPromise;
      })
      .catch(() => caches.match(OFFLINE_URL))"""
        
        elif strategy == "network_only":
            return """fetch(event.request)
      .catch(() => caches.match(OFFLINE_URL))"""
        
        else:  # cache_only
            return """caches.match(event.request)
      .then((response) => response || caches.match(OFFLINE_URL))"""

    def _generate_sw_register(self, base_path: str) -> str:
        """Generiert Service Worker Registration Script"""
        
        register_content = """// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.log('SW registered:', registration.scope);
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker available
              if (confirm('New version available! Reload to update?')) {
                window.location.reload();
              }
            }
          });
        });
      })
      .catch((err) => {
        console.error('SW registration failed:', err);
      });
  });
}

// Request Notification Permission
if ('Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission().then((permission) => {
    console.log('Notification permission:', permission);
  });
}
"""
        
        register_path = f"{base_path}/public/sw-register.js"
        os.makedirs(os.path.dirname(register_path), exist_ok=True)
        with open(register_path, "w") as f:
            f.write(register_content)
        
        return register_path

    def _generate_offline_page(self, base_path: str, app_name: str) -> str:
        """Generiert Offline-Fallback-Seite"""
        
        offline_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{app_name} - Offline</title>
  <style>
    * {{
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }}
    body {{
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-align: center;
      padding: 2rem;
    }}
    .container {{
      max-width: 500px;
    }}
    .icon {{
      font-size: 5rem;
      margin-bottom: 1.5rem;
      animation: pulse 2s infinite;
    }}
    @keyframes pulse {{
      0%, 100% {{ opacity: 1; }}
      50% {{ opacity: 0.5; }}
    }}
    h1 {{
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }}
    p {{
      font-size: 1.2rem;
      opacity: 0.9;
      margin-bottom: 2rem;
    }}
    button {{
      background: white;
      color: #667eea;
      border: none;
      padding: 1rem 2rem;
      font-size: 1.1rem;
      font-weight: 600;
      border-radius: 50px;
      cursor: pointer;
      transition: transform 0.3s ease;
    }}
    button:hover {{
      transform: scale(1.05);
    }}
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">📡</div>
    <h1>You're Offline</h1>
    <p>It looks like you've lost your internet connection. Don't worry, you can still browse cached content!</p>
    <button onclick="window.location.reload()">Try Again</button>
  </div>
</body>
</html>
"""
        
        offline_path = f"{base_path}/public/offline.html"
        os.makedirs(os.path.dirname(offline_path), exist_ok=True)
        with open(offline_path, "w") as f:
            f.write(offline_html)
        
        return offline_path

    def _generate_icons_config(
        self,
        base_path: str,
        options: Dict[str, Any]
    ) -> str:
        """Generiert Icon-Generator-Config"""
        
        config_content = f"""# Icon Generation Config
# Generate PWA icons from a source image

Source Image: {options.get('source_icon', 'icon-source.png')}

Required Sizes: {', '.join([f'{s}x{s}' for s in self.icon_sizes])}

To generate icons, use a tool like:
- https://realfavicongenerator.net/
- https://www.pwabuilder.com/imageGenerator
- Or use ImageMagick:

```bash
# Install ImageMagick
brew install imagemagick  # macOS
apt-get install imagemagick  # Linux

# Generate icons
"""
        
        for size in self.icon_sizes:
            config_content += f"convert icon-source.png -resize {size}x{size} public/icons/icon-{size}x{size}.png\n"
        
        config_content += "```\n"
        
        config_path = f"{base_path}/ICONS_README.md"
        with open(config_path, "w") as f:
            f.write(config_content)
        
        return config_path

    def _generate_install_prompt(self, base_path: str, app_name: str) -> str:
        """Generiert Install-Prompt-Komponente"""
        
        install_content = f"""// PWA Install Prompt Component
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {{
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();
  // Stash the event so it can be triggered later
  deferredPrompt = e;
  // Show install button
  showInstallPromotion();
}});

function showInstallPromotion() {{
  const installButton = document.getElementById('install-button');
  if (!installButton) {{
    // Create install button if it doesn't exist
    const btn = document.createElement('button');
    btn.id = 'install-button';
    btn.textContent = '📲 Install {app_name}';
    btn.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #667eea;
      color: white;
      border: none;
      padding: 1rem 1.5rem;
      border-radius: 50px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 1000;
      transition: transform 0.3s ease;
    `;
    btn.addEventListener('mouseover', () => btn.style.transform = 'scale(1.05)');
    btn.addEventListener('mouseout', () => btn.style.transform = 'scale(1)');
    btn.addEventListener('click', installApp);
    document.body.appendChild(btn);
  }} else {{
    installButton.style.display = 'block';
  }}
}}

async function installApp() {{
  if (!deferredPrompt) {{
    return;
  }}
  // Show the install prompt
  deferredPrompt.prompt();
  // Wait for the user to respond to the prompt
  const {{ outcome }} = await deferredPrompt.userChoice;
  console.log(`User response to the install prompt: ${{outcome}}`);
  // Clear the deferredPrompt
  deferredPrompt = null;
  // Hide install button
  const installButton = document.getElementById('install-button');
  if (installButton) {{
    installButton.style.display = 'none';
  }}
}}

// Track installation
window.addEventListener('appinstalled', () => {{
  console.log('{app_name} was installed');
  // Hide install button
  const installButton = document.getElementById('install-button');
  if (installButton) {{
    installButton.style.display = 'none';
  }}
  // Track analytics
  if (typeof gtag !== 'undefined') {{
    gtag('event', 'app_installed');
  }}
}});

// Check if already installed
if (window.matchMedia('(display-mode: standalone)').matches) {{
  console.log('{app_name} is running in standalone mode');
}}
"""
        
        install_path = f"{base_path}/public/install-prompt.js"
        os.makedirs(os.path.dirname(install_path), exist_ok=True)
        with open(install_path, "w") as f:
            f.write(install_content)
        
        return install_path


# Singleton instance
pwa_generator = PWAGenerator()
