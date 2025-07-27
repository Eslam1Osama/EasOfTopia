// script.js

// Error handling for React DevTools and chrome-extension URLs
(function() {
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  
  console.error = function(...args) {
    const message = args.join(' ');
    if (message.includes('chrome-extension://') || 
        message.includes('React DevTools') ||
        message.includes('Warning: ReactDOM.render')) {
      return;
    }
    originalConsoleError.apply(console, args);
  };
  
  console.warn = function(...args) {
    const message = args.join(' ');
    if (message.includes('chrome-extension://') || 
        message.includes('React DevTools')) {
      return;
    }
    originalConsoleWarn.apply(console, args);
  };
})();

// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('[SW] Service Worker registered successfully:', registration.scope);
        
        // Handle service worker updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker available
              console.log('[SW] New service worker available');
            }
          });
        });
      })
      .catch((error) => {
        console.error('[SW] Service Worker registration failed:', error);
      });
  });
}

document.addEventListener('DOMContentLoaded', () => {

    // --- Theme initialization (run first) ---
    (function initializeTheme() {
      // First, check localStorage for existing theme preference
      const storedTheme = localStorage.getItem('theme');
      
      // Then check URL parameter (takes priority if present)
      const params = new URLSearchParams(window.location.search);
      const urlTheme = params.get('theme');
      
      // Determine which theme to apply
      let themeToApply = null;
      if (urlTheme === 'dark' || urlTheme === 'light') {
        // URL parameter takes priority
        themeToApply = urlTheme;
        localStorage.setItem('theme', urlTheme);
        
        // Remove the theme parameter from URL to prevent it from overriding localStorage on next load
        params.delete('theme');
        const newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '') + window.location.hash;
        window.history.replaceState({}, '', newUrl);
      } else if (storedTheme === 'dark' || storedTheme === 'light') {
        // Use stored preference
        themeToApply = storedTheme;
      } else {
        // Fallback to system preference
        themeToApply = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        localStorage.setItem('theme', themeToApply);
      }
      
      // Apply the theme
      document.documentElement.classList.toggle('dark', themeToApply === 'dark');
    })();

    // --- Theme Toggle Functionality ---
    const themeToggleBtns = document.querySelectorAll('#theme-toggle, #mobile-theme-toggle');
    const darkIcon = document.getElementById('theme-toggle-dark-icon');
    const lightIcon = document.getElementById('theme-toggle-light-icon');
    const mobileDarkIcon = document.getElementById('mobile-theme-toggle-dark-icon');
    const mobileLightIcon = document.getElementById('mobile-theme-toggle-light-icon');

    const updateIcons = (isDarkMode) => {
        if (isDarkMode) {
            darkIcon.classList.remove('hidden');
            lightIcon.classList.add('hidden');
            mobileDarkIcon.classList.remove('hidden');
            mobileLightIcon.classList.add('hidden');
        } else {
            darkIcon.classList.add('hidden');
            lightIcon.classList.remove('hidden');
            mobileDarkIcon.classList.add('hidden');
            mobileLightIcon.classList.remove('hidden');
        }
    };

    // Set initial icon state based on current theme
    updateIcons(document.documentElement.classList.contains('dark'));

    themeToggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const isDarkMode = document.documentElement.classList.toggle('dark');
            localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
            updateIcons(isDarkMode);
        });
    });

    // --- Sticky Header on Scroll ---
    const header = document.getElementById('main-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // --- Mobile Menu ---
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    let lastFocusedElement = null;
    const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');

    function openMobileMenu() {
        lastFocusedElement = document.activeElement;
        mobileMenu.classList.remove('translate-x-full');
        mobileMenu.classList.add('translate-x-0');
        mobileMenu.setAttribute('aria-hidden', 'false');
        mobileMenu.focus();
        document.body.style.overflow = 'hidden';
        if (mobileMenuOverlay) {
            mobileMenuOverlay.classList.remove('opacity-0', 'pointer-events-none');
            mobileMenuOverlay.classList.add('opacity-100', 'pointer-events-auto');
        }
        // Ensure mobile dropdown is populated when menu opens
        if (mobileServicesDropdownToggle && mobileServicesDropdown) {
            populateDropdown(mobileServicesDropdown, mobileServicesDropdownToggle);
        }
    }
    function closeMobileMenu() {
        mobileMenu.classList.remove('translate-x-0');
        mobileMenu.classList.add('translate-x-full');
        mobileMenu.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        mobileMenu.scrollTop = 0;
        if (mobileMenuButton) mobileMenuButton.focus();
        if (lastFocusedElement) lastFocusedElement = null;
        if (mobileMenuOverlay) {
            mobileMenuOverlay.classList.remove('opacity-100', 'pointer-events-auto');
            mobileMenuOverlay.classList.add('opacity-0', 'pointer-events-none');
        }
        // Always collapse mobile Services dropdown and reset aria-expanded
        const mobileServicesDropdown = document.getElementById('mobile-services-dropdown');
        const mobileServicesDropdownToggle = document.getElementById('mobile-services-dropdown-toggle');
        if (mobileServicesDropdown && mobileServicesDropdownToggle) {
            mobileServicesDropdown.classList.remove('expanded');
            mobileServicesDropdownToggle.setAttribute('aria-expanded', 'false');
        }
    }
    mobileMenuButton.addEventListener('click', () => {
        if (mobileMenu.classList.contains('translate-x-full')) {
            openMobileMenu();
        } else {
            closeMobileMenu();
        }
    });
    // Close mobile menu when a link is clicked (robust for nested elements)
    mobileMenu.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (link && mobileMenu.contains(link)) {
            closeMobileMenu();
        }
    });
    // Trap focus inside mobile menu when open
    mobileMenu.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            const focusableEls = mobileMenu.querySelectorAll('a, button');
            const firstEl = focusableEls[0];
            const lastEl = focusableEls[focusableEls.length - 1];
            if (e.shiftKey) {
                if (document.activeElement === firstEl) {
                    e.preventDefault();
                    lastEl.focus();
                }
            } else {
                if (document.activeElement === lastEl) {
                    e.preventDefault();
                    firstEl.focus();
                }
            }
        } else if (e.key === 'Escape') {
            closeMobileMenu();
        }
    });

    const mobileMenuClose = document.getElementById('mobile-menu-close');
    if (mobileMenuClose) {
        mobileMenuClose.addEventListener('click', closeMobileMenu);
    }
    if (mobileMenuOverlay) {
        mobileMenuOverlay.addEventListener('click', closeMobileMenu);
    }


    // --- Platform Apps Config (for navigation) ---
    const platformApps = [
      { name: 'TopiaStyler', key: 'visualEditor', url: 'https://topia-styler.vercel.app/' },
      { name: 'Paletteniffer', key: 'paletteniffer', url: 'https://paletteniffer.vercel.app/' }
    ];
    // Mark the current app
    platformApps.forEach(app => {
      if (window.location.origin === new URL(app.url).origin) {
        app.isCurrent = true;
      }
    });

    // --- Services Dropdown (Header & Mobile) ---
    const servicesDropdownToggle = document.getElementById('services-dropdown-toggle');
    const servicesDropdown = document.getElementById('services-dropdown');
    const mobileServicesDropdownToggle = document.getElementById('mobile-services-dropdown-toggle');
    const mobileServicesDropdown = document.getElementById('mobile-services-dropdown');

    // --- Cross-domain theme persistence (URL param) ---
    function getCurrentTheme() {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    }
    function appendThemeToUrl(url) {
      const theme = getCurrentTheme();
      if (!theme) return url;
      const u = new URL(url, window.location.origin);
      u.searchParams.set('theme', theme);
      return u.toString();
    }

    function populateDropdown(dropdown, toggle) {
      dropdown.innerHTML = '';
      platformApps.forEach(app => {
        if (!app.isCurrent) {
          const btn = document.createElement('button');
          btn.className = dropdown === servicesDropdown
            ? 'block w-full text-left px-4 py-3 nav-link nav-animated'
            : 'block w-full text-left px-4 py-3 mobile-nav-link nav-animated';
          btn.setAttribute('data-service', app.key);
          btn.setAttribute('role', 'menuitem');
          btn.textContent = app.name;
          btn.addEventListener('click', () => {
            window.location.href = appendThemeToUrl(app.url);
            dropdown.classList.remove('opacity-100', 'pointer-events-auto', 'expanded');
            dropdown.classList.add('opacity-0', 'pointer-events-none');
            if (toggle) toggle.setAttribute('aria-expanded', 'false');
          });
          btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              window.location.href = appendThemeToUrl(app.url);
              dropdown.classList.remove('opacity-100', 'pointer-events-auto', 'expanded');
              dropdown.classList.add('opacity-0', 'pointer-events-none');
              if (toggle) toggle.setAttribute('aria-expanded', 'false');
            }
          });
          dropdown.appendChild(btn);
        }
      });
    }
    if (servicesDropdownToggle && servicesDropdown) {
      populateDropdown(servicesDropdown, servicesDropdownToggle);
    }
    if (mobileServicesDropdownToggle && mobileServicesDropdown) {
      populateDropdown(mobileServicesDropdown, mobileServicesDropdownToggle);

      // Add toggle event listeners for mobile dropdown
      mobileServicesDropdownToggle.addEventListener('click', (e) => {
          e.preventDefault();
          const expanded = mobileServicesDropdownToggle.getAttribute('aria-expanded') === 'true';
          mobileServicesDropdownToggle.setAttribute('aria-expanded', !expanded);
          if (!expanded) {
              mobileServicesDropdown.classList.add('expanded');
          } else {
              mobileServicesDropdown.classList.remove('expanded');
          }
      });

      // Keyboard navigation for mobile dropdown
      mobileServicesDropdownToggle.addEventListener('keydown', (e) => {
          if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              mobileServicesDropdown.classList.add('expanded');
              mobileServicesDropdownToggle.setAttribute('aria-expanded', 'true');
              const firstBtn = mobileServicesDropdown.querySelector('button');
              if (firstBtn) firstBtn.focus();
          }
      });

      // Close mobile dropdown on outside click or Escape
      document.addEventListener('mousedown', (e) => {
          if (!mobileServicesDropdown.contains(e.target) && !mobileServicesDropdownToggle.contains(e.target)) {
              mobileServicesDropdown.classList.remove('expanded');
              mobileServicesDropdownToggle.setAttribute('aria-expanded', 'false');
          }
      });

      mobileServicesDropdown.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') {
              mobileServicesDropdown.classList.remove('expanded');
              mobileServicesDropdownToggle.setAttribute('aria-expanded', 'false');
              mobileServicesDropdownToggle.focus();
          }
      });
    }

    // --- Service Card Buttons (Dynamic) ---
    document.querySelectorAll('.service-card').forEach(card => {
      const service = card.dataset.service;
      const app = platformApps.find(a => a.key === service);
      if (app) {
        const launchBtn = card.querySelector('.launch-btn');
        if (launchBtn) {
          launchBtn.addEventListener('click', () => {
            window.location.href = appendThemeToUrl(app.url);
          });
          launchBtn.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              window.location.href = appendThemeToUrl(app.url);
            }
          });
        }
      }
    });

    // --- Intersection Observer for Scroll Animations ---
    const animatedElements = document.querySelectorAll('.section-title, .feature, .service-card');
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animatedElements.forEach(el => {
        observer.observe(el);
    });

    // Ensure overlay is correct on resize (fixes bug after clicking Contact in header then shrinking screen)
    function syncMobileMenuOverlay() {
        if (!mobileMenu || !mobileMenuOverlay) return;
        if (mobileMenu.classList.contains('translate-x-0')) {
            mobileMenuOverlay.classList.remove('opacity-0', 'pointer-events-none');
            mobileMenuOverlay.classList.add('opacity-100', 'pointer-events-auto');
        } else {
            mobileMenuOverlay.classList.remove('opacity-100', 'pointer-events-auto');
            mobileMenuOverlay.classList.add('opacity-0', 'pointer-events-none');
        }
    }
    window.addEventListener('resize', syncMobileMenuOverlay);
    syncMobileMenuOverlay();
    
    // Global error handling
    window.addEventListener('error', (event) => {
      console.error('[Global Error]', event.error);
    });
    
    window.addEventListener('unhandledrejection', (event) => {
      console.error('[Unhandled Promise Rejection]', event.reason);
    });
});
