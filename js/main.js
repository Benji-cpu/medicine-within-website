/**
 * Medicine Within - Main JavaScript
 * Handles navigation, smooth scrolling, and UI interactions
 */

// ==========================================================================
// Calendly Script Loading State Management (defined early for immediate access)
// ==========================================================================

// Track Calendly script loading state to prevent race conditions
const CalendlyLoader = (function() {
    let scriptState = 'unknown'; // 'unknown', 'loading', 'loaded', 'ready', 'failed'
    let scriptPromise = null;
    let readyCallbacks = [];
    
    /**
     * Check if Calendly is fully ready (not just loaded, but initialized)
     */
    function isCalendlyReady() {
        return typeof Calendly !== 'undefined' && 
               typeof Calendly.initPopupWidget === 'function' &&
               Calendly.initPopupWidget.length === 1; // Ensure it's the correct function signature
    }
    
    /**
     * Load Calendly script dynamically with proper ready detection
     */
    function loadCalendlyScript() {
        if (scriptPromise) {
            return scriptPromise;
        }
        
        scriptState = 'loading';
        scriptPromise = new Promise(function(resolve, reject) {
            // Check if script is already in the DOM
            const existingScript = document.querySelector('script[src*="assets.calendly.com/assets/external/widget.js"]');
            
            if (existingScript) {
                // Script tag exists, wait for it to load
                if (existingScript.hasAttribute('data-calendly-loaded')) {
                    // Already loaded
                    scriptState = 'loaded';
                    waitForCalendlyReady(resolve, reject);
                } else {
                    // Still loading, wait for load event
                    existingScript.addEventListener('load', function() {
                        existingScript.setAttribute('data-calendly-loaded', 'true');
                        scriptState = 'loaded';
                        waitForCalendlyReady(resolve, reject);
                    });
                    
                    existingScript.addEventListener('error', function() {
                        scriptState = 'failed';
                        reject(new Error('Failed to load Calendly script'));
                    });
                    
                    // If script is already loaded but event didn't fire
                    if (existingScript.complete || existingScript.readyState === 'complete') {
                        existingScript.setAttribute('data-calendly-loaded', 'true');
                        scriptState = 'loaded';
                        waitForCalendlyReady(resolve, reject);
                    }
                }
            } else {
                // Script not in DOM, need to load it
                const script = document.createElement('script');
                script.src = 'https://assets.calendly.com/assets/external/widget.js';
                script.async = true;
                script.type = 'text/javascript';
                
                script.onload = function() {
                    script.setAttribute('data-calendly-loaded', 'true');
                    scriptState = 'loaded';
                    waitForCalendlyReady(resolve, reject);
                };
                
                script.onerror = function() {
                    scriptState = 'failed';
                    reject(new Error('Failed to load Calendly script'));
                };
                
                document.head.appendChild(script);
            }
        });
        
        return scriptPromise;
    }
    
    /**
     * Wait for Calendly to be fully ready after script loads
     */
    function waitForCalendlyReady(resolve, reject) {
        let attempts = 0;
        const maxAttempts = 100; // 10 seconds max (100 * 100ms)
        
        const checkReady = setInterval(function() {
            attempts++;
            
            if (isCalendlyReady()) {
                clearInterval(checkReady);
                scriptState = 'ready';
                resolve();
                // Execute any queued callbacks
                readyCallbacks.forEach(function(callback) {
                    try {
                        callback();
                    } catch (e) {
                        console.error('Error executing Calendly ready callback:', e);
                    }
                });
                readyCallbacks = [];
            } else if (attempts >= maxAttempts) {
                clearInterval(checkReady);
                scriptState = 'failed';
                reject(new Error('Calendly widget did not initialize within 10 seconds'));
            }
        }, 100);
    }
    
    /**
     * Get Calendly ready state - ensures script is loaded and ready
     */
    function ensureCalendlyReady() {
        return new Promise(function(resolve, reject) {
            // If already ready, resolve immediately
            if (scriptState === 'ready' && isCalendlyReady()) {
                resolve();
                return;
            }
            
            // If failed, reject immediately
            if (scriptState === 'failed') {
                reject(new Error('Calendly script failed to load'));
                return;
            }
            
            // If loading or unknown, wait for script to load
            loadCalendlyScript().then(resolve).catch(reject);
        });
    }
    
    return {
        ensureReady: ensureCalendlyReady,
        isReady: isCalendlyReady,
        getState: function() { return scriptState; }
    };
})();

document.addEventListener('DOMContentLoaded', function() {
    
    // ==========================================================================
    // Mobile Navigation Toggle
    // ==========================================================================
    
    const navToggle = document.querySelector('.nav-toggle');
    const nav = document.querySelector('.nav');
    const navLinks = document.querySelectorAll('.nav a');
    
    if (navToggle && nav) {
        navToggle.addEventListener('click', function() {
            nav.classList.toggle('open');
            navToggle.classList.toggle('active');
            
            // Toggle body scroll when menu is open
            document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';
        });
        
        // Close menu when clicking a link
        navLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                nav.classList.remove('open');
                navToggle.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!nav.contains(e.target) && !navToggle.contains(e.target)) {
                nav.classList.remove('open');
                navToggle.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
    
    // ==========================================================================
    // Header Scroll Effect
    // ==========================================================================
    
    const header = document.querySelector('.header');
    
    if (header) {
        let lastScroll = 0;
        
        window.addEventListener('scroll', function() {
            const currentScroll = window.pageYOffset;
            
            // Add/remove scrolled class based on scroll position
            if (currentScroll > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
            
            lastScroll = currentScroll;
        });
    }
    
    // ==========================================================================
    // Smooth Scroll for Anchor Links
    // ==========================================================================
    
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Skip if just "#" or empty
            if (href === '#' || href === '') return;
            
            const target = document.querySelector(href);
            
            if (target) {
                e.preventDefault();
                
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // ==========================================================================
    // Intersection Observer for Animations
    // ==========================================================================
    
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    if (animatedElements.length > 0) {
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fadeInUp');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        animatedElements.forEach(function(el) {
            el.style.opacity = '0';
            observer.observe(el);
        });
    }
    
    // ==========================================================================
    // Active Navigation Link
    // ==========================================================================
    
    function setActiveNavLink() {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.nav a');
        
        navLinks.forEach(function(link) {
            const href = link.getAttribute('href');
            
            // Check if current page matches link
            if (currentPath.endsWith(href) || 
                (href === 'index.html' && (currentPath === '/' || currentPath.endsWith('/')))) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
    
    setActiveNavLink();
    
    // ==========================================================================
    // Form Validation (Basic - Only for non-CK forms)
    // ==========================================================================
    
    const forms = document.querySelectorAll('form:not([data-ck-form-id])');
    
    forms.forEach(function(form) {
        form.addEventListener('submit', function(e) {
            const emailInput = form.querySelector('input[type="email"]');
            
            if (emailInput && emailInput.value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                
                if (!emailRegex.test(emailInput.value)) {
                    e.preventDefault();
                    emailInput.style.borderColor = '#e74c3c';
                    
                    // Reset after 2 seconds
                    setTimeout(function() {
                        emailInput.style.borderColor = '';
                    }, 2000);
                }
            }
        });
    });
    
    // ==========================================================================
    // Lazy Loading Enhancement
    // ==========================================================================
    
    // Add loading class while images load
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    
    lazyImages.forEach(function(img) {
        img.addEventListener('load', function() {
            this.classList.add('loaded');
        });
    });
    
    // ==========================================================================
    // Escape Key Handler
    // ==========================================================================
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            // Close mobile nav
            if (nav && nav.classList.contains('open')) {
                nav.classList.remove('open');
                navToggle.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    });
    
    // ==========================================================================
    // Floating Discovery Call Button
    // ==========================================================================
    
    // Create floating button
    const floatingBtn = document.createElement('button');
    floatingBtn.className = 'floating-discovery-btn';
    floatingBtn.innerHTML = 'Book Discovery Call';
    floatingBtn.setAttribute('aria-label', 'Book a Discovery Call');
    
    // Open Calendly on click
    floatingBtn.addEventListener('click', function(e) {
        e.preventDefault();
        openCalendlyPopup();
    });
    
    // Function to safely open Calendly popup
    // Enhanced implementation with proper script loading detection
    function openCalendlyPopup() {
        const config = window.MEDICINE_WITHIN_CONFIG?.calendly;
        const url = config?.discovery || 'https://calendly.com/joulfayansandy/discovery-call-30-minutes';
        
        // Validate URL format
        if (!url || typeof url !== 'string' || !url.startsWith('http')) {
            console.error('Invalid Calendly URL configured:', url);
            return;
        }
        
        // Ensure Calendly is fully ready before opening popup
        CalendlyLoader.ensureReady().then(function() {
            try {
                if (typeof Calendly !== 'undefined' && typeof Calendly.initPopupWidget === 'function') {
                    Calendly.initPopupWidget({ url: url });
                } else {
                    throw new Error('Calendly.initPopupWidget is not available');
                }
            } catch (e) {
                console.error('Error opening Calendly popup:', e);
                openCalendlyFallback(url);
            }
        }).catch(function(error) {
            console.warn('Calendly not ready, using fallback:', error.message);
            openCalendlyFallback(url);
        });
    }
    
    // Fallback function to open Calendly URL in new window
    function openCalendlyFallback(url) {
        if (!url || typeof url !== 'string') {
            console.error('No valid Calendly URL provided for fallback');
            return;
        }
        
        if (typeof window.open === 'function') {
            try {
                const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
                if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
                    // Pop-up was blocked
                    console.warn('Pop-up blocked. Please allow pop-ups for this site or visit the booking link directly:', url);
                }
            } catch (e) {
                console.error('Error opening Calendly link in new window:', e);
            }
        } else {
            console.error('Unable to open Calendly link. window.open is not available.');
        }
    }
    
    // Make function globally available for onclick handlers
    window.openCalendlyPopup = openCalendlyPopup;
    
    // Pre-load Calendly script early (after DOM is ready) for faster first click
    // This ensures the script is loading in the background even if user hasn't clicked yet
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            // Start loading Calendly script in background
            CalendlyLoader.ensureReady().catch(function() {
                // Silently fail - script will load on demand if this fails
            });
        });
    } else {
        // DOM already ready, start loading immediately
        CalendlyLoader.ensureReady().catch(function() {
            // Silently fail - script will load on demand if this fails
        });
    }
    
    document.body.appendChild(floatingBtn);
    
    // Show button after scrolling down
    let hasScrolled = false;
    const scrollThreshold = 300; // Show after 300px scroll
    
    function handleScroll() {
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollY > scrollThreshold && !hasScrolled) {
            hasScrolled = true;
            floatingBtn.classList.add('visible');
        } else if (scrollY <= scrollThreshold && hasScrolled) {
            hasScrolled = false;
            floatingBtn.classList.remove('visible');
        }
    }
    
    // Throttle scroll events
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        if (scrollTimeout) {
            window.cancelAnimationFrame(scrollTimeout);
        }
        scrollTimeout = window.requestAnimationFrame(handleScroll);
    });
    
    // Also check on page load in case user is already scrolled
    if (window.pageYOffset > scrollThreshold) {
        setTimeout(function() {
            floatingBtn.classList.add('visible');
            hasScrolled = true;
        }, 500);
    }
    
    // ==========================================================================
    // Calendly Inline Widget Initialization
    // ==========================================================================
    
    // Wait for Calendly script to load before initializing inline widgets
    function initCalendlyWidgets() {
        const inlineWidgets = document.querySelectorAll('.calendly-inline-widget');
        
        if (inlineWidgets.length === 0) return;
        
        // Check if Calendly is loaded
        if (typeof Calendly !== 'undefined' && Calendly.initInlineWidget) {
            inlineWidgets.forEach(function(widget) {
                if (!widget.hasAttribute('data-initialized')) {
                    try {
                        Calendly.initInlineWidget(widget);
                        widget.setAttribute('data-initialized', 'true');
                    } catch (e) {
                        console.error('Error initializing Calendly widget:', e);
                    }
                }
            });
        } else {
            // Wait for Calendly to load
            const checkInterval = setInterval(function() {
                if (typeof Calendly !== 'undefined' && Calendly.initInlineWidget) {
                    clearInterval(checkInterval);
                    inlineWidgets.forEach(function(widget) {
                        if (!widget.hasAttribute('data-initialized')) {
                            try {
                                Calendly.initInlineWidget(widget);
                                widget.setAttribute('data-initialized', 'true');
                            } catch (e) {
                                console.error('Error initializing Calendly widget:', e);
                            }
                        }
                    });
                }
            }, 100);
            
            // Timeout after 10 seconds
            setTimeout(function() {
                clearInterval(checkInterval);
                if (typeof Calendly === 'undefined') {
                    console.warn('Calendly script failed to load. Widgets may not display correctly.');
                }
            }, 10000);
        }
    }
    
    // Initialize when DOM is ready and after a short delay to ensure scripts are loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(initCalendlyWidgets, 500);
        });
    } else {
        setTimeout(initCalendlyWidgets, 500);
    }
    
    // Also try after window load
    window.addEventListener('load', function() {
        setTimeout(initCalendlyWidgets, 1000);
    });
    
    // ==========================================================================
    // FAQ Accordion
    // ==========================================================================
    
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(function(question) {
        question.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            const answer = this.nextElementSibling;
            const faqItem = this.closest('.faq-item');
            
            if (!answer || !faqItem) return;
            
            // Close all other FAQ items
            faqQuestions.forEach(function(q) {
                if (q !== question) {
                    q.setAttribute('aria-expanded', 'false');
                    const otherAnswer = q.nextElementSibling;
                    const otherItem = q.closest('.faq-item');
                    if (otherAnswer) {
                        // Remove any inline styles to let CSS handle it
                        otherAnswer.style.maxHeight = '';
                        otherAnswer.style.padding = '';
                    }
                    if (otherItem) {
                        otherItem.classList.remove('expanded');
                    }
                }
            });
            
            // Toggle current item - let CSS handle the transition
            if (isExpanded) {
                this.setAttribute('aria-expanded', 'false');
                faqItem.classList.remove('expanded');
                answer.style.maxHeight = '';
                answer.style.padding = '';
            } else {
                this.setAttribute('aria-expanded', 'true');
                faqItem.classList.add('expanded');
                // Remove inline styles to let CSS transition work
                answer.style.maxHeight = '';
                answer.style.padding = '';
            }
        });
    });
    
});

// ==========================================================================
// Utility Functions
// ==========================================================================

/**
 * Debounce function for scroll/resize events
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = function() {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Check if element is in viewport
 */
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// ==========================================================================
// Events Section - Temple Page
// ==========================================================================

/**
 * Events Manager
 * Handles fetching, displaying, and switching views for upcoming events
 * 
 * Integration Strategy:
 * 1. First attempts to fetch events via Hipsy API (if API key is configured)
 * 2. Falls back to iframe embed if API fails (CORS, network errors, or no API key)
 * 3. Users can manually switch between custom views (list/grid/calendar) and iframe view
 * 
 * The iframe embed shows the full Hipsy organizer page with all events,
 * automatically updated when new events are added on Hipsy.
 */
const EventsManager = (function() {
    
    // Configuration - Hipsy API Integration
    // Use config from config.js if available, otherwise fallback
    const getConfig = () => {
        if (window.MEDICINE_WITHIN_CONFIG?.hipsy) {
            return {
                hipsyProfileUrl: window.MEDICINE_WITHIN_CONFIG.hipsy.profileUrl || 'https://hipsy.nl/medicine-within',
                apiEndpoint: window.MEDICINE_WITHIN_CONFIG.hipsy.apiEndpoint || 'https://api.hipsy.nl/v1/events',
                apiKey: window.MEDICINE_WITHIN_CONFIG.hipsy.apiKey || '',
                organizerId: 'medicine-within'
            };
        }
        // Fallback configuration
        return {
            hipsyProfileUrl: 'https://hipsy.nl/medicine-within',
            apiEndpoint: 'https://api.hipsy.nl/v1/events',
            apiKey: '',
            organizerId: 'medicine-within'
        };
    };
    
    const CONFIG = getConfig();
    
    // State
    let events = [];
    let currentView = 'list';
    let currentMonth = new Date();
    let tooltip = null;
    let useIframe = false; // Flag to use iframe instead of custom views
    
    // DOM Elements
    const elements = {};
    
    // ==========================================================================
    // Demo Events Data (Replace with actual API call when available)
    // ==========================================================================
    
    function getDemoEvents() {
        const today = new Date();
        const events = [
            {
                id: 1,
                title: "Temple Night: Surrender to Sensation",
                type: "temple-night",
                typeLabel: "Temple Night",
                date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 12),
                time: "19:00 - 23:00",
                location: "Amsterdam",
                price: "€111",
                spots: 8,
                totalSpots: 20,
                url: CONFIG.hipsyProfileUrl,
                description: "An evening of breathwork, ecstatic dance, and deep connection."
            },
            {
                id: 2,
                title: "Full Moon Women's Circle",
                type: "womens-circle",
                typeLabel: "Women's Circle",
                date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 18),
                time: "19:30 - 22:00",
                location: "Amsterdam",
                price: "€44",
                spots: 5,
                totalSpots: 12,
                url: CONFIG.hipsyProfileUrl,
                description: "Gather under the full moon for ritual, sharing, and sisterhood."
            },
            {
                id: 3,
                title: "The Art of Self-Pleasure",
                type: "immersion",
                typeLabel: "Day Immersion",
                date: new Date(today.getFullYear(), today.getMonth() + 1, 8),
                time: "10:00 - 18:00",
                location: "Amsterdam",
                price: "€166",
                spots: 12,
                totalSpots: 16,
                url: CONFIG.hipsyProfileUrl,
                description: "A full day dedicated to reconnecting with your sensual self."
            },
            {
                id: 4,
                title: "New Moon Intention Setting",
                type: "womens-circle",
                typeLabel: "Women's Circle",
                date: new Date(today.getFullYear(), today.getMonth() + 1, 15),
                time: "19:30 - 22:00",
                location: "Amsterdam",
                price: "€33",
                spots: 10,
                totalSpots: 12,
                url: CONFIG.hipsyProfileUrl,
                description: "Set powerful intentions under the new moon's energy."
            },
            {
                id: 5,
                title: "Temple Night: The Erotic Body",
                type: "temple-night",
                typeLabel: "Temple Night",
                date: new Date(today.getFullYear(), today.getMonth() + 1, 22),
                time: "19:00 - 23:00",
                location: "Amsterdam",
                price: "€130",
                spots: 3,
                totalSpots: 20,
                url: CONFIG.hipsyProfileUrl,
                description: "Awaken your erotic energy through movement and breath."
            },
            {
                id: 6,
                title: "Boundaries & Desire Workshop",
                type: "immersion",
                typeLabel: "Day Immersion",
                date: new Date(today.getFullYear(), today.getMonth() + 2, 5),
                time: "10:00 - 18:00",
                location: "Amsterdam",
                price: "€188",
                spots: 14,
                totalSpots: 16,
                url: CONFIG.hipsyProfileUrl,
                description: "Learn to honor your boundaries while embracing your desires."
            }
        ];
        
        return events.filter(e => e.date >= today).sort((a, b) => a.date - b.date);
    }
    
    // ==========================================================================
    // API Integration
    // ==========================================================================
    
    async function fetchEvents() {
        showLoading(true);
        
        // If no API key, use iframe directly
        if (!CONFIG.apiKey || CONFIG.apiKey.trim() === '') {
            console.log('No API key configured - using iframe embed');
            showLoading(false);
            useIframe = true;
            renderIframeView();
            return;
        }
        
        try {
            // Fetch from Hipsy API
            console.log('Fetching events from Hipsy API...');
            
            const response = await fetch(CONFIG.apiEndpoint, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${CONFIG.apiKey}`,
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Hipsy API Error:', response.status, errorText);
                
                // If unauthorized or forbidden, fall back to iframe
                if (response.status === 401 || response.status === 403) {
                    throw new Error('API authentication failed - using iframe');
                }
                throw new Error(`API Error: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Hipsy API Response:', data);
            
            // Handle different response formats
            const rawEvents = data.data || data.events || data;
            
            if (Array.isArray(rawEvents) && rawEvents.length > 0) {
                events = transformApiEvents(rawEvents);
                console.log('Transformed events:', events);
                useIframe = false; // Successfully got API data
                showLoading(false);
                renderCurrentView();
            } else {
                console.log('No events returned from API, using iframe embed');
                showLoading(false);
                useIframe = true;
                renderIframeView();
            }
            
        } catch (error) {
            console.error('Error fetching events:', error);
            
            // Check if it's a CORS, network, or auth error
            const isNetworkError = error.message.includes('CORS') || 
                                  error.message.includes('Failed to fetch') ||
                                  error.message.includes('NetworkError') ||
                                  error.message.includes('authentication failed');
            
            if (isNetworkError) {
                console.log('Network/auth error detected - falling back to iframe embed');
                showLoading(false);
                useIframe = true;
                renderIframeView();
            } else {
                console.log('API error - falling back to demo data');
                showLoading(false);
                events = getDemoEvents();
                useIframe = false;
                renderCurrentView();
            }
        }
    }
    
    function transformApiEvents(apiEvents) {
        // Transform Hipsy API response to our format
        // Hipsy API typically returns: id, title, start_date, end_date, start_time, end_time, 
        // location, price, capacity, available_tickets, url, description, category, etc.
        return apiEvents.map(event => {
            // Handle various date formats from API
            let eventDate;
            if (event.start_date) {
                eventDate = new Date(event.start_date);
            } else if (event.date) {
                eventDate = new Date(event.date);
            } else if (event.starts_at) {
                eventDate = new Date(event.starts_at);
            } else {
                eventDate = new Date();
            }
            
            // Build event URL - prefer direct event link
            let eventUrl = CONFIG.hipsyProfileUrl;
            if (event.url) {
                eventUrl = event.url;
            } else if (event.slug && event.id) {
                eventUrl = `https://www.hipsy.nl/events/${event.slug || event.id}`;
            } else if (event.ticket_url) {
                eventUrl = event.ticket_url;
            }
            
            return {
                id: event.id,
                title: event.title || event.name || 'Untitled Event',
                type: categorizeEvent(event.title || event.name || event.category || ''),
                typeLabel: event.category || categorizeEventLabel(event.title || event.name || ''),
                date: eventDate,
                time: formatTimeRange(event.start_time || event.time, event.end_time),
                location: event.location?.city || event.location?.name || event.venue || event.city || 'Amsterdam',
                price: formatPrice(event.price || event.ticket_price || event.min_price),
                spots: event.available_tickets ?? event.available_spots ?? event.spots_left ?? null,
                totalSpots: event.capacity || event.total_spots || null,
                url: eventUrl,
                description: event.description || event.short_description || event.excerpt || ''
            };
        }).filter(event => event.date >= new Date(new Date().setHours(0,0,0,0))) // Only future events
          .sort((a, b) => a.date - b.date);
    }
    
    function categorizeEventLabel(title) {
        const titleLower = (title || '').toLowerCase();
        if (titleLower.includes('temple night') || titleLower.includes('temple:')) return 'Temple Night';
        if (titleLower.includes('circle') || titleLower.includes('moon')) return "Women's Circle";
        if (titleLower.includes('immersion') || titleLower.includes('workshop') || titleLower.includes('day')) return 'Day Immersion';
        if (titleLower.includes('kambo')) return 'Kambo Ceremony';
        if (titleLower.includes('retreat')) return 'Retreat';
        return 'Event';
    }
    
    function categorizeEvent(title) {
        const titleLower = title.toLowerCase();
        if (titleLower.includes('temple night') || titleLower.includes('temple:')) return 'temple-night';
        if (titleLower.includes('circle') || titleLower.includes('moon')) return 'womens-circle';
        if (titleLower.includes('immersion') || titleLower.includes('workshop') || titleLower.includes('day')) return 'immersion';
        return 'temple-night';
    }
    
    function formatTimeRange(start, end) {
        if (!start) return 'Time TBA';
        return end ? `${start} - ${end}` : start;
    }
    
    function formatPrice(price) {
        if (!price) return 'Free';
        if (typeof price === 'string') return price.startsWith('€') ? price : `€${price}`;
        return `€${price}`;
    }
    
    function simulateNetworkDelay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // ==========================================================================
    // UI Helpers
    // ==========================================================================
    
    function showLoading(show) {
        const loading = elements.loading;
        const views = document.querySelectorAll('.events-view');
        
        if (show) {
            loading?.classList.add('active');
            views.forEach(v => v.classList.remove('active'));
        } else {
            loading?.classList.remove('active');
        }
    }
    
    function showEmpty(show) {
        const empty = elements.empty;
        if (empty) {
            empty.style.display = show ? 'block' : 'none';
        }
    }
    
    function formatDate(date) {
        return {
            day: date.getDate(),
            month: date.toLocaleDateString('en-US', { month: 'short' }),
            year: date.getFullYear(),
            weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
            full: date.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric',
                year: 'numeric'
            })
        };
    }
    
    // ==========================================================================
    // View Rendering
    // ==========================================================================
    
    function renderCurrentView() {
        if (events.length === 0) {
            showEmpty(true);
            return;
        }
        
        showEmpty(false);
        
        switch (currentView) {
            case 'list':
                renderListView();
                break;
            case 'grid':
                renderGridView();
                break;
            case 'calendar':
                renderCalendarView();
                break;
        }
    }
    
    function switchView(view) {
        currentView = view;
        
        // Update button states
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });
        
        // Update view visibility
        document.querySelectorAll('.events-view').forEach(v => {
            v.classList.remove('active');
        });
        
        // Handle iframe view
        if (view === 'iframe') {
            useIframe = true;
            renderIframeView();
            return;
        }
        
        // For custom views, check if we have events data
        if (events.length === 0 && !useIframe) {
            // If no events and not in iframe mode, try to fetch again
            fetchEvents();
            return;
        }
        
        useIframe = false;
        const targetView = document.getElementById(`${view}View`);
        if (targetView) {
            targetView.classList.add('active');
            renderCurrentView();
        }
    }
    
    // ==========================================================================
    // Iframe View
    // ==========================================================================
    
    function renderIframeView() {
        // Hide all custom views
        document.querySelectorAll('.events-view').forEach(v => {
            v.classList.remove('active');
        });
        
        // Update iframe button state
        const iframeBtn = document.querySelector('.view-btn[data-view="iframe"]');
        if (iframeBtn) {
            document.querySelectorAll('.view-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            iframeBtn.classList.add('active');
        }
        
        // Get or create iframe container
        let iframeContainer = document.getElementById('iframeView');
        if (!iframeContainer) {
            // Create iframe container
            const container = document.querySelector('.events-container');
            iframeContainer = document.createElement('div');
            iframeContainer.id = 'iframeView';
            iframeContainer.className = 'events-view events-iframe-view';
            container.appendChild(iframeContainer);
        }
        
        // Clear any existing content
        iframeContainer.innerHTML = '';
        
        // Create iframe
        const iframe = document.createElement('iframe');
        iframe.src = CONFIG.hipsyProfileUrl;
        iframe.setAttribute('loading', 'lazy');
        iframe.setAttribute('title', 'Medicine Within Events on Hipsy');
        iframe.setAttribute('allowtransparency', 'true');
        iframe.setAttribute('scrolling', 'yes');
        iframe.className = 'hipsy-iframe';
        iframe.style.width = '100%';
        iframe.style.height = '1500px';
        iframe.style.border = 'none';
        iframe.style.borderRadius = '4px';
        iframe.style.background = 'transparent';
        
        // Check for 404 errors after iframe loads
        iframe.onload = function() {
            setTimeout(function() {
                try {
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                    if (iframeDoc && iframeDoc.body) {
                        const bodyText = iframeDoc.body.innerText || '';
                        const title = iframeDoc.title || '';
                        // Check for 404 indicators
                        if (bodyText.includes('404') || 
                            bodyText.includes('niet gevonden') || 
                            bodyText.includes('not found') ||
                            title.includes('404') ||
                            title.includes('niet gevonden')) {
                            showIframeError(iframeContainer);
                        }
                    }
                } catch (e) {
                    // CORS - can't check iframe content, assume it's working
                    console.log('Cannot check iframe content (CORS), assuming it loaded correctly');
                }
            }, 2000);
        };
        
        iframe.onerror = function() {
            showIframeError(iframeContainer);
        };
        
        iframeContainer.appendChild(iframe);
        
        // Listen for messages from iframe (if Hipsy supports it)
        window.addEventListener('message', function(e) {
            if (e.origin !== 'https://www.hipsy.nl' && e.origin !== 'https://hipsy.nl') return;
            if (e.data && typeof e.data.height === 'number') {
                iframe.style.height = Math.max(e.data.height, 600) + 'px';
            }
        });
        
        iframeContainer.classList.add('active');
        showEmpty(false);
    }
    
    function showIframeError(container) {
        container.innerHTML = `
            <div class="iframe-error-message">
                <div class="ornament"><span>✦</span></div>
                <h3>Hipsy Organizer Page Not Found</h3>
                <p>The Hipsy organizer URL is not configured correctly or the page doesn't exist yet.</p>
                <p class="text-muted" style="margin-top: 1rem; font-size: 0.9rem;">
                    <strong>To fix this:</strong><br>
                    1. Log into your Hipsy dashboard<br>
                    2. Go to your organizer/organization settings<br>
                    3. Find your public organizer page URL<br>
                    4. Update the URL in <code>js/config.js</code> under <code>hipsy.profileUrl</code>
                </p>
                <p class="text-muted" style="margin-top: 1rem; font-size: 0.9rem;">
                    The URL should look like: <code>https://www.hipsy.nl/organisator/your-organizer-slug</code>
                </p>
                <div style="margin-top: 2rem;">
                    <a href="${CONFIG.hipsyProfileUrl}" target="_blank" rel="noopener" class="btn">
                        Try Opening Hipsy Page
                    </a>
                    <button onclick="window.location.reload()" class="btn" style="margin-left: 1rem; background: transparent; border: 1px solid var(--color-gold);">
                        Reload Page
                    </button>
                </div>
            </div>
        `;
    }
    
    // ==========================================================================
    // List View
    // ==========================================================================
    
    function renderListView() {
        const container = elements.listView;
        if (!container) return;
        
        container.innerHTML = events.map(event => {
            const date = formatDate(event.date);
            const spotsClass = event.spots <= 5 ? 'limited' : '';
            const spotsText = event.spots <= 5 ? `Only ${event.spots} spots left!` : `${event.spots} spots available`;
            
            return `
                <article class="event-list-item">
                    <div class="event-date-block">
                        <div class="event-date-day">${date.day}</div>
                        <div class="event-date-month">${date.month}</div>
                        <div class="event-date-year">${date.year}</div>
                    </div>
                    <div class="event-info">
                        <span class="event-type">${event.typeLabel}</span>
                        <h4>${event.title}</h4>
                        <div class="event-meta">
                            <span>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polyline points="12 6 12 12 16 14"></polyline>
                                </svg>
                                ${event.time}
                            </span>
                            <span>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                    <circle cx="12" cy="10" r="3"></circle>
                                </svg>
                                ${event.location}
                            </span>
                        </div>
                    </div>
                    <div class="event-actions">
                        <span class="event-price">${event.price}</span>
                        <span class="event-spots ${spotsClass}">${spotsText}</span>
                        <a href="${event.url}" target="_blank" rel="noopener" class="btn btn-book">Book Now</a>
                    </div>
                </article>
            `;
        }).join('');
    }
    
    // ==========================================================================
    // Grid View
    // ==========================================================================
    
    function renderGridView() {
        const container = elements.gridView;
        if (!container) return;
        
        container.innerHTML = events.map(event => {
            const date = formatDate(event.date);
            
            return `
                <article class="event-card">
                    <div class="event-card-header ${event.type}">
                        <div class="event-card-date">
                            <span class="day">${date.day}</span>
                            <span class="month-year">${date.month} ${date.year}</span>
                        </div>
                        <span class="event-card-type">${event.typeLabel}</span>
                    </div>
                    <div class="event-card-body">
                        <h4>${event.title}</h4>
                        <div class="event-card-meta">
                            <span>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polyline points="12 6 12 12 16 14"></polyline>
                                </svg>
                                ${date.weekday}, ${event.time}
                            </span>
                            <span>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                    <circle cx="12" cy="10" r="3"></circle>
                                </svg>
                                ${event.location}
                            </span>
                        </div>
                        <div class="event-card-footer">
                            <span class="event-card-price">${event.price}</span>
                            <a href="${event.url}" target="_blank" rel="noopener" class="btn btn-book">Book</a>
                        </div>
                    </div>
                </article>
            `;
        }).join('');
    }
    
    // ==========================================================================
    // Calendar View
    // ==========================================================================
    
    function renderCalendarView() {
        updateCalendarMonth();
        renderCalendarGrid();
    }
    
    function updateCalendarMonth() {
        const monthLabel = elements.calendarMonth;
        if (monthLabel) {
            monthLabel.textContent = currentMonth.toLocaleDateString('en-US', { 
                month: 'long', 
                year: 'numeric' 
            });
        }
    }
    
    function renderCalendarGrid() {
        const grid = elements.calendarGrid;
        if (!grid) return;
        
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        
        // Get first day of month and adjust for Monday start
        const firstDay = new Date(year, month, 1);
        let startDay = firstDay.getDay() - 1;
        if (startDay < 0) startDay = 6;
        
        // Get number of days in month
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        // Get days from previous month to fill
        const prevMonthDays = new Date(year, month, 0).getDate();
        
        // Get today for comparison
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Build calendar days
        let html = '';
        
        // Previous month days
        for (let i = startDay - 1; i >= 0; i--) {
            const day = prevMonthDays - i;
            html += `<div class="calendar-day other-month"><span class="day-number">${day}</span></div>`;
        }
        
        // Current month days
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dayEvents = events.filter(e => {
                const eventDate = new Date(e.date);
                return eventDate.getDate() === day && 
                       eventDate.getMonth() === month && 
                       eventDate.getFullYear() === year;
            });
            
            const isToday = date.getTime() === today.getTime();
            const hasEvents = dayEvents.length > 0;
            
            let classes = 'calendar-day';
            if (isToday) classes += ' today';
            if (hasEvents) classes += ' has-event';
            
            let eventsHtml = '';
            if (hasEvents) {
                eventsHtml = '<div class="day-events">';
                dayEvents.forEach(e => {
                    eventsHtml += `<span class="event-dot ${e.type}"></span>`;
                });
                eventsHtml += '</div>';
            }
            
            const dataAttr = hasEvents ? `data-events='${JSON.stringify(dayEvents.map(e => ({
                title: e.title,
                type: e.typeLabel,
                time: e.time,
                url: e.url
            })))}'` : '';
            
            html += `<div class="${classes}" ${dataAttr}><span class="day-number">${day}</span>${eventsHtml}</div>`;
        }
        
        // Next month days to fill remaining
        const totalCells = Math.ceil((startDay + daysInMonth) / 7) * 7;
        const remainingDays = totalCells - (startDay + daysInMonth);
        
        for (let day = 1; day <= remainingDays; day++) {
            html += `<div class="calendar-day other-month"><span class="day-number">${day}</span></div>`;
        }
        
        grid.innerHTML = html;
        
        // Add event listeners for days with events
        grid.querySelectorAll('.calendar-day.has-event').forEach(day => {
            day.addEventListener('mouseenter', showTooltip);
            day.addEventListener('mouseleave', hideTooltip);
            day.addEventListener('click', handleDayClick);
        });
    }
    
    function navigateMonth(direction) {
        currentMonth.setMonth(currentMonth.getMonth() + direction);
        renderCalendarView();
    }
    
    // ==========================================================================
    // Calendar Tooltip
    // ==========================================================================
    
    function createTooltip() {
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.className = 'calendar-tooltip';
            document.body.appendChild(tooltip);
        }
        return tooltip;
    }
    
    function showTooltip(e) {
        const day = e.currentTarget;
        const eventsData = day.dataset.events;
        
        if (!eventsData) return;
        
        const dayEvents = JSON.parse(eventsData);
        const tip = createTooltip();
        
        tip.innerHTML = dayEvents.map(event => `
            <div style="margin-bottom: ${dayEvents.length > 1 ? '0.75rem' : '0'};">
                <h5>${event.title}</h5>
                <p class="tooltip-type">${event.type}</p>
                <p class="tooltip-meta">${event.time}</p>
            </div>
        `).join('');
        
        // Position tooltip
        const rect = day.getBoundingClientRect();
        const tipRect = tip.getBoundingClientRect();
        
        let left = rect.left + (rect.width / 2) - (tipRect.width / 2);
        let top = rect.bottom + 10;
        
        // Keep within viewport
        if (left < 10) left = 10;
        if (left + 280 > window.innerWidth) left = window.innerWidth - 290;
        if (top + 150 > window.innerHeight) top = rect.top - tipRect.height - 10;
        
        tip.style.left = `${left}px`;
        tip.style.top = `${top}px`;
        tip.classList.add('visible');
    }
    
    function hideTooltip() {
        if (tooltip) {
            tooltip.classList.remove('visible');
        }
    }
    
    function handleDayClick(e) {
        const day = e.currentTarget;
        const eventsData = day.dataset.events;
        
        if (!eventsData) return;
        
        const dayEvents = JSON.parse(eventsData);
        if (dayEvents.length === 1) {
            window.open(dayEvents[0].url, '_blank', 'noopener');
        }
    }
    
    // ==========================================================================
    // Initialization
    // ==========================================================================
    
    function init() {
        // Check if we're on a page with events section
        const eventsSection = document.getElementById('events');
        if (!eventsSection) return;
        
        // If there's a static iframe (no view toggle buttons), don't initialize the events manager
        const staticIframe = eventsSection.querySelector('iframe.hipsy-iframe');
        if (staticIframe) {
            // Static iframe is already in HTML, no need to initialize JavaScript
            return;
        }
        
        // Cache DOM elements
        elements.loading = document.getElementById('eventsLoading');
        elements.empty = document.getElementById('eventsEmpty');
        elements.listView = document.getElementById('listView');
        elements.gridView = document.getElementById('gridView');
        elements.calendarView = document.getElementById('calendarView');
        elements.calendarMonth = document.getElementById('calendarMonth');
        elements.calendarGrid = document.getElementById('calendarGrid');
        
        // View toggle buttons
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', () => switchView(btn.dataset.view));
        });
        
        // Add iframe view button if it doesn't exist
        const viewToggle = document.querySelector('.events-view-toggle');
        if (viewToggle && !document.querySelector('.view-btn[data-view="iframe"]')) {
            const iframeBtn = document.createElement('button');
            iframeBtn.className = 'view-btn';
            iframeBtn.dataset.view = 'iframe';
            iframeBtn.setAttribute('aria-label', 'Hipsy embed view');
            iframeBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                    <line x1="8" y1="21" x2="16" y2="21"></line>
                    <line x1="12" y1="17" x2="12" y2="21"></line>
                </svg>
                Hipsy
            `;
            viewToggle.appendChild(iframeBtn);
        }
        
        // Calendar navigation
        document.getElementById('calendarPrev')?.addEventListener('click', () => navigateMonth(-1));
        document.getElementById('calendarNext')?.addEventListener('click', () => navigateMonth(1));
        
        // Fetch and display events
        fetchEvents();
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Public API
    return {
        refresh: fetchEvents,
        switchView: switchView
    };
    
})();

// ==========================================================================
// ConvertKit Integration
// ==========================================================================

/**
 * ConvertKit Manager
 * Handles API submissions for custom forms
 * Supports both form-based (data-ck-form-id) and tag-based (data-ck-tags) subscription
 */
const ConvertKitManager = (function() {
    
    // Use config from config.js if available, otherwise fallback
    const getConfig = () => {
        if (window.MEDICINE_WITHIN_CONFIG?.convertKit) {
            return window.MEDICINE_WITHIN_CONFIG.convertKit;
        }
        // Fallback (for development/testing)
        return {
            apiKey: 'eludDXTW2eHbUSOm5ORwEQ',
            apiBase: 'https://api.convertkit.com/v3'
        };
    };
    
    const CONFIG = getConfig();
    
    function init() {
        // Find all forms with ConvertKit attributes
        const formForms = document.querySelectorAll('form[data-ck-form-id]');
        const tagForms = document.querySelectorAll('form[data-ck-tags]');
        
        formForms.forEach(form => setupForm(form, 'form'));
        tagForms.forEach(form => setupForm(form, 'tags'));
    }
    
    function setupForm(form, type) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const emailInput = form.querySelector('input[type="email"]');
            const email = emailInput.value.trim();
            
            if (!validateEmail(email)) {
                showError(form, 'Please enter a valid email address.');
                return;
            }
            
            // Set loading state
            setLoading(form, true);
            
            try {
                if (type === 'form') {
                    const formId = form.dataset.ckFormId;
                    await subscribeViaForm(formId, email);
                } else {
                    const tagIds = form.dataset.ckTags.split(',').map(id => id.trim());
                    await subscribeViaTags(tagIds, email);
                }
                showSuccess(form);
                emailInput.value = ''; // Clear input
            } catch (error) {
                console.error('ConvertKit Error:', error);
                showError(form, 'Something went wrong. Please try again.');
            } finally {
                setLoading(form, false);
            }
        });
    }
    
    async function subscribeViaForm(formId, email) {
        const url = `${CONFIG.apiBase}/forms/${formId}/subscribe`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            },
            body: JSON.stringify({
                api_key: CONFIG.apiKey,
                email: email
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Subscription failed');
        }
        
        return data;
    }
    
    async function subscribeViaTags(tagIds, email) {
        // Subscribe to each tag (ConvertKit will create subscriber if needed)
        const promises = tagIds.map(tagId => {
            const url = `${CONFIG.apiBase}/tags/${tagId}/subscribe`;
            return fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                },
                body: JSON.stringify({
                    api_key: CONFIG.apiKey,
                    email: email
                })
            });
        });
        
        const responses = await Promise.all(promises);
        
        // Check if all succeeded
        for (const response of responses) {
            if (!response.ok) {
                throw new Error('Tag subscription failed');
            }
        }
        
        return true;
    }
    
    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    
    function setLoading(form, isLoading) {
        const btn = form.querySelector('button[type="submit"]');
        if (isLoading) {
            btn.dataset.originalText = btn.innerText;
            btn.innerText = 'Joining...';
            btn.disabled = true;
            form.classList.add('loading');
        } else {
            btn.innerText = btn.dataset.originalText;
            btn.disabled = false;
            form.classList.remove('loading');
        }
    }
    
    function showSuccess(form) {
        // Remove any existing messages
        removeMessages(form);
        
        // Create success message
        const msg = document.createElement('div');
        msg.className = 'form-message success';
        msg.innerHTML = `
            <p><strong>Welcome to the circle! <img src="assets/img/methodology/sparkles.jpg" alt="" class="icon-inline"></strong></p>
            <p>Please check your email to confirm your subscription.</p>
        `;
        
        // Add styles if not in CSS
        msg.style.marginTop = '1rem';
        msg.style.color = '#27ae60';
        msg.style.fontSize = '0.9rem';
        msg.style.textAlign = 'center';
        
        form.appendChild(msg);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            msg.style.opacity = '0';
            msg.style.transition = 'opacity 0.5s ease';
            setTimeout(() => msg.remove(), 500);
        }, 5000);
    }
    
    function showError(form, message) {
        removeMessages(form);
        
        const msg = document.createElement('div');
        msg.className = 'form-message error';
        msg.innerText = message;
        
        msg.style.marginTop = '1rem';
        msg.style.color = '#e74c3c';
        msg.style.fontSize = '0.9rem';
        msg.style.textAlign = 'center';
        
        form.appendChild(msg);
    }
    
    function removeMessages(form) {
        const existing = form.querySelectorAll('.form-message');
        existing.forEach(el => el.remove());
    }
    
    // Init on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();

// ==========================================================================
// ConvertKit Form Styling Override
// ==========================================================================
// Inject custom styles AFTER ConvertKit loads to override their inline styles
(function() {
    // Inject a style tag with maximum specificity
    const styleId = 'convertkit-custom-override';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            /* Maximum specificity override for ConvertKit forms */
            form[data-sv-form] input[type="email"],
            form.formkit-form input[type="email"],
            .seva-form input[type="email"],
            input.formkit-input[name="email_address"] {
                background: #242424 !important;
                border: 1px solid rgba(255, 255, 255, 0.1) !important;
                border-radius: 4px !important;
                color: #F5F0E8 !important;
                padding: 0.75rem 1rem !important;
            }
            
            form[data-sv-form] input[type="email"]:focus,
            form.formkit-form input[type="email"]:focus,
            .seva-form input[type="email"]:focus {
                border-color: #D4AF37 !important;
                outline: none !important;
            }
            
            form[data-sv-form] input[type="email"]::placeholder,
            form.formkit-form input[type="email"]::placeholder,
            .seva-form input[type="email"]::placeholder {
                color: #a8a8a8 !important;
                opacity: 1 !important;
            }
            
            form[data-sv-form] button[type="submit"],
            form.formkit-form button[type="submit"],
            .seva-form button[type="submit"],
            form[data-sv-form] [data-element="submit"],
            form.formkit-form [data-element="submit"],
            button.formkit-submit {
                background: #D4AF37 !important;
                color: #1a1a1a !important;
                border: none !important;
                border-radius: 4px !important;
                padding: 0.75rem 2rem !important;
                font-weight: 600 !important;
                font-family: 'Libre Franklin', sans-serif !important;
            }
            
            form[data-sv-form] button[type="submit"]:hover,
            form.formkit-form button[type="submit"]:hover,
            .seva-form button[type="submit"]:hover,
            button.formkit-submit:hover {
                background: #E8C547 !important;
            }
            
            /* Fix form fields alignment */
            form[data-sv-form] .formkit-fields,
            form.formkit-form .formkit-fields,
            .seva-form .formkit-fields,
            form[data-sv-form] [data-element="fields"],
            form.formkit-form [data-element="fields"] {
                display: flex !important;
                flex-direction: row !important;
                align-items: stretch !important;
                gap: 12px !important;
                flex-wrap: nowrap !important;
                width: 100% !important;
            }
            
            form[data-sv-form] .formkit-field,
            form.formkit-form .formkit-field,
            .seva-form .formkit-field {
                flex: 1 1 0 !important;
                min-width: 0 !important;
                margin: 0 !important;
            }
            
            form[data-sv-form] [data-element="submit"],
            form.formkit-form [data-element="submit"],
            .seva-form button[type="submit"],
            button.formkit-submit {
                flex: 0 0 auto !important;
                white-space: nowrap !important;
                align-self: stretch !important;
            }
            
            .formkit-powered-by-convertkit-container,
            .formkit-powered-by,
            a[data-element="powered-by"],
            a.formkit-powered-by {
                display: none !important;
                visibility: hidden !important;
                height: 0 !important;
                width: 0 !important;
                overflow: hidden !important;
            }
            
            @media (max-width: 576px) {
                form[data-sv-form] .formkit-fields,
                form.formkit-form .formkit-fields,
                .seva-form .formkit-fields {
                    flex-direction: column !important;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Also apply direct style overrides as backup
    function applyDirectStyles() {
        document.querySelectorAll('input[type="email"]').forEach(input => {
            if (input.closest('form[data-sv-form], form.formkit-form, .seva-form')) {
                input.style.cssText += 'background: #242424 !important; border: 1px solid rgba(255, 255, 255, 0.1) !important; color: #F5F0E8 !important;';
            }
        });
        
        document.querySelectorAll('button[type="submit"], [data-element="submit"]').forEach(button => {
            if (button.closest('form[data-sv-form], form.formkit-form, .seva-form')) {
                button.style.cssText += 'background: #D4AF37 !important; color: #1a1a1a !important; border: none !important;';
            }
        });
    }
    
    // Apply styles multiple times as ConvertKit loads
    applyDirectStyles();
    setTimeout(applyDirectStyles, 500);
    setTimeout(applyDirectStyles, 1500);
    setTimeout(applyDirectStyles, 3000);
    
    // Watch for DOM changes
    const observer = new MutationObserver(() => {
        applyDirectStyles();
    });
    observer.observe(document.body, { childList: true, subtree: true });
})();
