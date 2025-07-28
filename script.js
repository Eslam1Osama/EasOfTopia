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
    
    // Enterprise-grade header state management with zero flicker
    function updateHeaderState() {
        if (!header) return;
        
        const scrollY = window.scrollY;
        const isScrolled = scrollY > 50;
        const currentState = header.getAttribute('data-header-state');
        const newState = isScrolled ? 'scrolled' : 'initial';
        
        // Only update if state actually changed (performance optimization)
        if (currentState !== newState) {
            header.setAttribute('data-header-state', newState);
            
            if (isScrolled) {
                header.classList.add('scrolled');
                document.documentElement.classList.add('header-scrolled');
            } else {
                header.classList.remove('scrolled');
                document.documentElement.classList.remove('header-scrolled');
            }
            
            // Performance monitoring
            if (typeof gtag !== 'undefined') {
                gtag('event', 'header_state_change', {
                    event_category: 'performance',
                    event_label: newState,
                    value: scrollY
                });
            }
        }
    }
    
    // Critical: Check scroll position immediately on script load
    // This prevents any visual flicker by applying state before DOM is ready
    if (typeof window !== 'undefined') {
        // Immediate check without waiting for DOM
        if (window.scrollY > 50) {
            document.documentElement.classList.add('header-scrolled');
        }
    }
    
    // Enhanced initialization with multiple fallbacks
    function initializeHeaderState() {
        // Primary check
        updateHeaderState();
        
        // Secondary check after a minimal delay for edge cases
        requestAnimationFrame(updateHeaderState);
        
        // Tertiary check for dynamic content loading
        setTimeout(updateHeaderState, 50);
        
        // Final check after all resources are loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', updateHeaderState);
        }
        
        // Handle cases where page is loaded with hash fragments
        window.addEventListener('load', updateHeaderState);
    }
    
    // Initialize header state with enterprise-grade error handling
    try {
        initializeHeaderState();
    } catch (error) {
        console.warn('[Header] Initialization error:', error);
        // Fallback: ensure header state is correct after a delay
        setTimeout(updateHeaderState, 100);
    }
    
    // Optimized scroll event handler with throttling
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        scrollTimeout = setTimeout(updateHeaderState, 10); // 10ms throttle for 60fps
    }, { passive: true });
    
    // Handle resize events that might affect scroll position
    window.addEventListener('resize', () => {
        requestAnimationFrame(updateHeaderState);
    }, { passive: true });
    
    // Ensure mobile menu background is properly applied
    function ensureMobileMenuBackground() {
        const mobileMenu = document.getElementById('mobile-menu');
        if (mobileMenu) {
            const isDarkMode = document.documentElement.classList.contains('dark');
            mobileMenu.style.backgroundColor = isDarkMode ? '#232946' : '#ffffff';
            mobileMenu.style.backdropFilter = 'blur(10px)';
        }
    }
    
    // Apply mobile menu background on theme change
    const mobileThemeBtns = document.querySelectorAll('#theme-toggle, #mobile-theme-toggle');
    mobileThemeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            setTimeout(ensureMobileMenuBackground, 100);
        });
    });
    
    // Apply mobile menu background on page load
    ensureMobileMenuBackground();


    
    // --- Enhanced Loading States ---
    function addLoadingStates() {
        const serviceCards = document.querySelectorAll('.service-card');
        serviceCards.forEach(card => {
            const img = card.querySelector('img');
            if (img) {
                card.classList.add('loading');
                
                // Add skeleton elements
                const skeletonImg = document.createElement('div');
                skeletonImg.className = 'skeleton skeleton-img';
                img.parentNode.insertBefore(skeletonImg, img);
                
                const title = card.querySelector('h3');
                if (title) {
                    const skeletonTitle = document.createElement('div');
                    skeletonTitle.className = 'skeleton skeleton-title';
                    title.parentNode.insertBefore(skeletonTitle, title);
                }
                
                const textElements = card.querySelectorAll('p, .text-xs');
                textElements.forEach((text, index) => {
                    const skeletonText = document.createElement('div');
                    skeletonText.className = 'skeleton skeleton-text';
                    text.parentNode.insertBefore(skeletonText, text);
                });
                
                img.addEventListener('load', () => {
                    card.classList.remove('loading');
                    // Remove skeleton elements
                    card.querySelectorAll('.skeleton').forEach(el => el.remove());
                });
                
                img.addEventListener('error', () => {
                    card.classList.remove('loading');
                    card.querySelectorAll('.skeleton').forEach(el => el.remove());
                });
            }
        });
    }
    
    // Initialize loading states
    addLoadingStates();

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
        // Ensure mobile menu background is applied when opened
        ensureMobileMenuBackground();
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
    const animatedElements = document.querySelectorAll('.section-title, .feature, .service-card, .capability-item, .use-case-card');
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
    
    // --- Performance Monitoring ---
    function initPerformanceMonitoring() {
        // Core Web Vitals monitoring
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    console.log(`[Performance] ${entry.name}: ${entry.value.toFixed(2)}ms`);
                    
                    // Track LCP (Largest Contentful Paint)
                    if (entry.name === 'largest-contentful-paint') {
                        if (entry.value > 2500) {
                            console.warn('[Performance] LCP is slow:', entry.value.toFixed(2), 'ms');
                        }
                    }
                    
                    // Track FID (First Input Delay)
                    if (entry.name === 'first-input') {
                        if (entry.value > 100) {
                            console.warn('[Performance] FID is slow:', entry.value.toFixed(2), 'ms');
                        }
                    }
                    
                    // Track CLS (Cumulative Layout Shift)
                    if (entry.name === 'layout-shift') {
                        if (entry.value > 0.1) {
                            console.warn('[Performance] CLS is poor:', entry.value.toFixed(3));
                        }
                    }
                }
            });
            
            try {
                observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
            } catch (e) {
                console.warn('[Performance] Observer not supported:', e);
            }
        }
        
        // Track page load time
        window.addEventListener('load', () => {
            const loadTime = performance.now();
            console.log(`[Performance] Page loaded in ${loadTime.toFixed(2)}ms`);
        });
    }
    
    // Initialize performance monitoring
    initPerformanceMonitoring();
    
    // --- Enhanced Error Handling ---
    window.addEventListener('error', (event) => {
        console.error('[Global Error]', {
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            error: event.error
        });
    });
    
    window.addEventListener('unhandledrejection', (event) => {
        console.error('[Unhandled Promise Rejection]', {
            reason: event.reason,
            promise: event.promise
        });
    });
    
    // --- Enhanced Analytics Tracking ---
    function trackEvent(category, action, label = null) {
        // Google Analytics 4 tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                event_category: category,
                event_label: label
            });
        }
        
        // Console tracking for development
        console.log(`[Analytics] ${category}: ${action}${label ? ` - ${label}` : ''}`);
    }
    
    // Track important user interactions
    document.addEventListener('click', (e) => {
        const target = e.target.closest('a, button');
        if (target) {
            if (target.classList.contains('launch-btn')) {
                trackEvent('engagement', 'launch_app', target.textContent.trim());
            } else if (target.classList.contains('footer-link')) {
                trackEvent('navigation', 'footer_link', target.textContent.trim());
            } else if (target.id === 'theme-toggle' || target.id === 'mobile-theme-toggle') {
                trackEvent('preferences', 'theme_toggle', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
            }
        }
    });
    
    // --- Mobile Touch Enhancements ---
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diffX = touchStartX - touchEndX;
        const diffY = touchStartY - touchEndY;
        
        // Horizontal swipe
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > swipeThreshold) {
            if (diffX > 0) {
                // Swipe left - could open mobile menu
                console.log('[Touch] Swipe left detected');
            } else {
                // Swipe right - could close mobile menu
                console.log('[Touch] Swipe right detected');
                const mobileMenu = document.getElementById('mobile-menu');
                if (mobileMenu && !mobileMenu.classList.contains('translate-x-full')) {
                    closeMobileMenu();
                }
            }
        }
        
        // Vertical swipe
        if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > swipeThreshold) {
            if (diffY > 0) {
                // Swipe up
                console.log('[Touch] Swipe up detected');
            } else {
                // Swipe down
                console.log('[Touch] Swipe down detected');
            }
        }
    }
    
    // Touch event listeners
    document.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    });
    
    document.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    });
    
    // Haptic feedback (on supported devices)
    function triggerHapticFeedback() {
        if ('vibrate' in navigator) {
            navigator.vibrate(10);
        }
    }
    
    // Add haptic feedback to important interactions
    document.querySelectorAll('.launch-btn, .cta-button, #theme-toggle, #mobile-theme-toggle').forEach(btn => {
        btn.addEventListener('click', triggerHapticFeedback);
    });
});
