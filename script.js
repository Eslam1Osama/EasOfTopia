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

// === ENHANCED SERVICE WORKER REGISTRATION ===
// Handles different server contexts and cache management
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Enhanced service worker registration with server context awareness
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        // Handle service worker updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker available
            }
          });
        });
        
        // Enhanced cache management for different server contexts
        if (window.location.hostname === '127.0.0.1' && window.location.port === '5500') {
          // For live-server, clear cache on page load to ensure fresh content
          registration.active.postMessage({ type: 'CLEAR_CACHE' });
        }
      })
      .catch((error) => {
        // Service Worker registration failed - silent fail for production
      });
  });
}

// === CACHE BUSTING FOR CSS FILES ===
// Ensures fresh CSS is loaded in development environments
(function() {
  const cssLink = document.querySelector('link[href*="style.css"]');
  if (cssLink && (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost')) {
    // Add cache-busting parameter for development servers
    const originalHref = cssLink.href;
    const separator = originalHref.includes('?') ? '&' : '?';
    cssLink.href = originalHref + separator + 'v=' + Date.now();
    // Cache-busting applied for development server
  }
})();

document.addEventListener('DOMContentLoaded', () => {
    // --- Early Dropdown Initialization (run first) ---
    // Ensure dropdown is closed immediately on page load
    const earlyDropdown = document.getElementById('services-dropdown');
    const earlyDropdownToggle = document.getElementById('services-dropdown-toggle');
    
    if (earlyDropdown && earlyDropdownToggle) {
        earlyDropdown.classList.add('opacity-0', 'pointer-events-none');
        earlyDropdown.classList.remove('opacity-100', 'pointer-events-auto');
        earlyDropdownToggle.setAttribute('aria-expanded', 'false');
    }

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

    // --- Enhanced Theme Toggle Functionality with Seamless Animation Preservation ---
    const themeToggleBtns = document.querySelectorAll('#theme-toggle');
    const darkIcon = document.getElementById('theme-toggle-dark-icon');
    const lightIcon = document.getElementById('theme-toggle-light-icon');
    const mobileDarkIcon = document.getElementById('mobile-theme-toggle-dark-icon');
    const mobileLightIcon = document.getElementById('mobile-theme-toggle-light-icon');

    // Wave animation state tracking for seamless theme switching
    let waveAnimationState = {
        primaryStartTime: 0,
        secondaryStartTime: 0,
        isInitialized: false
    };

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

    // Initialize wave animation timing for seamless theme switching
    const initializeWaveAnimationTiming = () => {
        if (!waveAnimationState.isInitialized) {
            const currentTime = Date.now();
            waveAnimationState.primaryStartTime = currentTime;
            waveAnimationState.secondaryStartTime = currentTime;
            waveAnimationState.isInitialized = true;
            
            // Store timing in CSS custom properties for seamless theme switching
            document.documentElement.style.setProperty('--wave-primary-start', currentTime.toString());
            document.documentElement.style.setProperty('--wave-secondary-start', currentTime.toString());
        }
    };

    // Function to preserve wave animation state during theme switch
    const preserveWaveAnimationState = () => {
        // Initialize timing if not already done
        initializeWaveAnimationTiming();
        
        // The unified animation system automatically preserves state
        // since both light and dark modes use the same animation names
        // and the browser maintains the animation timeline continuity
    };

    // Function to restore wave animation state after theme switch
    const restoreWaveAnimationState = () => {
        // With unified animations, the browser automatically continues
        // the animation from its current position without restart
        // No additional restoration needed
    };

    // Set initial icon state based on current theme
    updateIcons(document.documentElement.classList.contains('dark'));
    
    // Initialize wave animation timing for seamless theme switching
    initializeWaveAnimationTiming();

    themeToggleBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Prevent event bubbling to avoid conflicts
            e.stopPropagation();
            
            // Preserve current wave animation state before theme switch
            preserveWaveAnimationState();
            
            const isDarkMode = document.documentElement.classList.toggle('dark');
            localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
            updateIcons(isDarkMode);
            
            // Restore wave animation state after theme switch
            restoreWaveAnimationState();
        });
    });

    // Specific handler for mobile theme toggle to prevent menu interference
    const mobileThemeToggle = document.getElementById('mobile-theme-toggle');
    if (mobileThemeToggle) {
        mobileThemeToggle.addEventListener('click', (e) => {
            // Prevent event bubbling and default behavior
            e.preventDefault();
            e.stopPropagation();
            
            const isDarkMode = document.documentElement.classList.toggle('dark');
            localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
            updateIcons(isDarkMode);
        });
    }

    // --- Sticky Header on Scroll ---
    const header = document.getElementById('main-header');
    
    // Function to update header state based on scroll position
    function updateHeaderState() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }
    
    // Check scroll position on page load
    updateHeaderState();
    
    // Also check after a small delay to handle any dynamic content loading
    setTimeout(updateHeaderState, 100);
    
    // Handle cases where page is loaded with hash fragments
    window.addEventListener('load', updateHeaderState);
    
    // Update header state on scroll
    window.addEventListener('scroll', updateHeaderState);
    
    // --- Mobile Menu - Enterprise Grade Implementation ---
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    let lastFocusedElement = null;
    const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');

    // Check if we're on mobile screen
    function isMobileScreen() {
        return window.innerWidth <= 1024;
    }
    
    function getScreenSize() {
        const width = window.innerWidth;
        if (width <= 320) return 'xs';
        if (width <= 375) return 'sm';
        if (width <= 480) return 'md';
        if (width <= 640) return 'lg';
        if (width <= 768) return 'xl';
        if (width <= 1024) return '2xl';
        return 'desktop';
    }

    function openMobileMenu() {
        // Only open mobile menu on mobile screens
        if (!isMobileScreen()) {
            return;
        }
        
        lastFocusedElement = document.activeElement;
        
        // Start sidebar animation first
        mobileMenu.classList.remove('translate-x-full');
        mobileMenu.classList.add('translate-x-0');
        mobileMenu.setAttribute('aria-hidden', 'false');
        mobileMenu.focus();
        document.body.style.overflow = 'hidden';
        
        // Add visual indicator that sidebar is open
        document.body.classList.add('mobile-menu-open');
        
        // Smooth overlay animation with slight delay for better UX
        if (mobileMenuOverlay) {
            setTimeout(() => {
                mobileMenuOverlay.classList.remove('opacity-0', 'pointer-events-none');
                mobileMenuOverlay.classList.add('opacity-100', 'pointer-events-auto');
            }, 50);
        }
        
        // Ensure mobile dropdown is populated when menu opens
        if (mobileServicesDropdownToggle && mobileServicesDropdown) {
            populateDropdown(mobileServicesDropdown, mobileServicesDropdownToggle);
        }
    }
    
    function closeMobileMenu() {
        // Start overlay fade out first for smoother transition
        if (mobileMenuOverlay) {
            mobileMenuOverlay.classList.remove('opacity-100', 'pointer-events-auto');
            mobileMenuOverlay.classList.add('opacity-0', 'pointer-events-none');
        }
        
        // Remove visual indicator that sidebar is open
        document.body.classList.remove('mobile-menu-open');
        
        // Slight delay before sidebar animation for coordinated effect
        setTimeout(() => {
            mobileMenu.classList.remove('translate-x-0');
            mobileMenu.classList.add('translate-x-full');
            mobileMenu.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            mobileMenu.scrollTop = 0;
            
            if (mobileMenuButton) mobileMenuButton.focus();
            if (lastFocusedElement) lastFocusedElement = null;
        }, 100);
        
        // Always collapse mobile Services dropdown and reset aria-expanded
        const mobileServicesDropdown = document.getElementById('mobile-services-dropdown');
        const mobileServicesDropdownToggle = document.getElementById('mobile-services-dropdown-toggle');
        if (mobileServicesDropdown && mobileServicesDropdownToggle) {
            mobileServicesDropdown.classList.remove('expanded');
            mobileServicesDropdownToggle.setAttribute('aria-expanded', 'false');
        }
    }
    
    // Mobile menu button event listener - always attach, let functions handle screen size
    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Check if menu is currently hidden (translate-x-full class)
            if (mobileMenu.classList.contains('translate-x-full')) {
                openMobileMenu();
            } else {
                closeMobileMenu();
            }
        });
    }
    
    // Handle window resize to ensure mobile menu behaves correctly
    let resizeTimeout;
    let lastScreenSize = null;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const currentScreenSize = getScreenSize();
            
            // Track screen size changes
            if (lastScreenSize !== currentScreenSize) {
                lastScreenSize = currentScreenSize;
            }
            
            // If screen is now desktop size, close mobile menu
            if (!isMobileScreen()) {
                closeMobileMenu();
            }
            
            // Let Tailwind handle button visibility - no need to manually set display
            // The md:hidden class will handle this automatically
            
            // Adjust mobile menu width for new screen size
            adjustMobileMenuForScreenSize();
        }, 150); // Increased debounce time for better performance
    });
    // Close mobile menu when a link is clicked (robust for nested elements)
    mobileMenu.addEventListener('click', (e) => {
        // Don't close menu if theme toggle is clicked
        if (e.target.closest('#mobile-theme-toggle') || e.target.closest('#theme-toggle')) {
            return;
        }
        
        const link = e.target.closest('a');
        if (link && mobileMenu.contains(link)) {
            closeMobileMenu();
        }
    });
    
    // === ENHANCED KEYBOARD NAVIGATION ===
    // ESC key to close mobile menu (works globally)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !mobileMenu.classList.contains('translate-x-full')) {
            closeMobileMenu();
        }
    });
    
    // === ENHANCED OVERLAY-BASED CLOSE FUNCTIONALITY ===
    // Close mobile menu when clicking on the overlay (primary method)
    if (mobileMenuOverlay) {
        mobileMenuOverlay.addEventListener('click', () => {
            closeMobileMenu();
        });
    }
    
    // === FALLBACK CLICK OUTSIDE FUNCTIONALITY ===
    // Close mobile menu when clicking anywhere outside the sidebar (fallback)
    document.addEventListener('click', (e) => {
        // Only handle if mobile menu is open
        if (!mobileMenu.classList.contains('translate-x-full')) {
            // Check if click is on the hamburger button (don't close if opening menu)
            const isClickOnHamburger = mobileMenuButton && mobileMenuButton.contains(e.target);
            const isClickInsideMenu = mobileMenu.contains(e.target);
            const isClickOnOverlay = mobileMenuOverlay && mobileMenuOverlay.contains(e.target);
            
            // Close if click is NOT on hamburger, NOT inside menu, and NOT on overlay
            if (!isClickOnHamburger && !isClickInsideMenu && !isClickOnOverlay) {
                closeMobileMenu();
            }
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
      { name: 'Paletteniffer', key: 'paletteniffer', url: 'https://paletteniffer.vercel.app/' },
      { name: 'Palettinum', key: 'palettinum', url: 'https://palettinum.vercel.app/' }
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

    // --- Desktop Services Dropdown Toggle Handler ---
    if (servicesDropdownToggle && servicesDropdown) {
        // Initialize dropdown state on page load
        servicesDropdown.classList.add('opacity-0', 'pointer-events-none');
        servicesDropdown.classList.remove('opacity-100', 'pointer-events-auto');
        servicesDropdownToggle.setAttribute('aria-expanded', 'false');
        
        servicesDropdownToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const isExpanded = servicesDropdownToggle.getAttribute('aria-expanded') === 'true';
            
            if (isExpanded) {
                // Close dropdown
                servicesDropdown.classList.remove('opacity-100', 'pointer-events-auto');
                servicesDropdown.classList.add('opacity-0', 'pointer-events-none');
                servicesDropdownToggle.setAttribute('aria-expanded', 'false');
            } else {
                // Open dropdown
                servicesDropdown.classList.remove('opacity-0', 'pointer-events-none');
                servicesDropdown.classList.add('opacity-100', 'pointer-events-auto');
                servicesDropdownToggle.setAttribute('aria-expanded', 'true');
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!servicesDropdownToggle.contains(e.target) && !servicesDropdown.contains(e.target)) {
                servicesDropdown.classList.remove('opacity-100', 'pointer-events-auto');
                servicesDropdown.classList.add('opacity-0', 'pointer-events-none');
                servicesDropdownToggle.setAttribute('aria-expanded', 'false');
            }
        });

        // Close dropdown on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && servicesDropdownToggle.getAttribute('aria-expanded') === 'true') {
                servicesDropdown.classList.remove('opacity-100', 'pointer-events-auto');
                servicesDropdown.classList.add('opacity-0', 'pointer-events-none');
                servicesDropdownToggle.setAttribute('aria-expanded', 'false');
                servicesDropdownToggle.focus();
            }
        });
    }

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
    
    function adjustMobileMenuForScreenSize() {
        const screenSize = getScreenSize();
        const mobileMenu = document.getElementById('mobile-menu');
        
        if (mobileMenu) {
            // Apply appropriate width based on screen size
            const widthMap = {
                'xs': '8rem',
                'sm': '10rem',
                'md': '12rem',
                'lg': '14rem',
                'xl': '16rem',
                '2xl': '18rem',
                'desktop': '16rem'
            };
            
            const newWidth = widthMap[screenSize] || '16rem';
            
            // Only update if width actually changed
            if (mobileMenu.style.width !== newWidth) {
                mobileMenu.style.width = newWidth;
            }
        }
    }
    window.addEventListener('resize', syncMobileMenuOverlay);
    syncMobileMenuOverlay();
    
    // Initialize mobile menu responsiveness and screen size tracking
    adjustMobileMenuForScreenSize();
    lastScreenSize = getScreenSize(); // Initialize screen size tracking
    
    // === BRAND NAME AND LOGO INTERACTIVITY ===
    // Enhanced brand name and logo functionality with page reload
    const brandName = document.querySelector('.brand-name');
    const headerLogo = document.querySelector('header img[alt="EasOfTopia Logo"]');
    const footerLogo = document.querySelector('footer img[alt="EasOfTopia Logo"]');
    
    // Brand name click handler
    if (brandName) {
        brandName.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.reload();
        });
        
        // Keyboard navigation support for brand name
        brandName.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                window.location.reload();
            }
        });
    }
    
    // Header logo click handler
    if (headerLogo) {
        headerLogo.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.reload();
        });
        
        // Keyboard navigation support for header logo
        headerLogo.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                window.location.reload();
            }
        });
    }
    
    // Footer logo click handler
    if (footerLogo) {
        footerLogo.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.reload();
        });
        
        // Keyboard navigation support for footer logo
        footerLogo.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                window.location.reload();
            }
        });
    }

    // Global error handling - silent for production
    window.addEventListener('error', (event) => {
      // Global error handling - silent fail for production
    });
    
    window.addEventListener('unhandledrejection', (event) => {
      // Unhandled promise rejection - silent fail for production
    });
});
