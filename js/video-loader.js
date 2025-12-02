/**
 * Smart Video Loader - Performance Optimized
 * Loads videos only when needed using Intersection Observer
 */

(function() {
    'use strict';

    // Check if Intersection Observer is supported
    if (!('IntersectionObserver' in window)) {
        // Fallback: Load all videos on page load (not ideal, but works)
        console.warn('Intersection Observer not supported. Videos will load normally.');
        return;
    }

    // Mobile detection
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || 
                     (window.innerWidth <= 768);

    /**
     * Initialize lazy loading for videos
     */
    function initLazyVideos() {
        const lazyVideos = document.querySelectorAll('video[data-lazy-video]');
        
        if (lazyVideos.length === 0) return;

        const videoObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const video = entry.target;
                    loadVideo(video);
                    observer.unobserve(video);
                }
            });
        }, {
            rootMargin: '50px' // Start loading 50px before video enters viewport
        });

        lazyVideos.forEach(video => {
            videoObserver.observe(video);
        });
    }

    /**
     * Load video source dynamically
     */
    function loadVideo(video) {
        const videoSrc = video.getAttribute('data-src');
        const videoSrcMobile = video.getAttribute('data-src-mobile');
        
        if (!videoSrc) return;

        // Use mobile version if on mobile device
        const source = isMobile && videoSrcMobile ? videoSrcMobile : videoSrc;

        // Create source element
        const sourceElement = document.createElement('source');
        sourceElement.src = source;
        sourceElement.type = 'video/mp4';

        // Add source to video
        video.appendChild(sourceElement);
        video.load();

        // Remove data attributes
        video.removeAttribute('data-src');
        video.removeAttribute('data-src-mobile');
        video.removeAttribute('data-lazy-video');

        // Handle autoplay for background videos
        if (video.hasAttribute('data-autoplay')) {
            video.setAttribute('autoplay', '');
            video.setAttribute('muted', '');
            video.setAttribute('loop', '');
            video.setAttribute('playsinline', '');
            
            // Try to play (may fail on some browsers)
            video.play().catch(err => {
                console.log('Autoplay prevented:', err);
            });
        }
    }

    /**
     * Initialize click-to-play videos
     */
    function initClickToPlay() {
        const clickToPlayVideos = document.querySelectorAll('video[data-click-to-play]');
        
        clickToPlayVideos.forEach(video => {
            const poster = video.querySelector('.video-poster');
            
            if (!poster) return;

            // Show poster, hide video initially
            video.style.display = 'none';
            poster.style.display = 'block';

            // On poster click, load and play video
            poster.addEventListener('click', function() {
                const videoSrc = video.getAttribute('data-src');
                const videoSrcMobile = video.getAttribute('data-src-mobile');
                const source = isMobile && videoSrcMobile ? videoSrcMobile : videoSrc;

                if (source) {
                    const sourceElement = document.createElement('source');
                    sourceElement.src = source;
                    sourceElement.type = 'video/mp4';
                    video.appendChild(sourceElement);
                    video.load();
                }

                // Hide poster, show video
                poster.style.display = 'none';
                video.style.display = 'block';
                
                // Play video
                video.play().catch(err => {
                    console.log('Play failed:', err);
                });

                // Remove data attributes
                video.removeAttribute('data-src');
                video.removeAttribute('data-src-mobile');
                video.removeAttribute('data-click-to-play');
            });
        });
    }

    /**
     * Pause background videos when out of viewport
     */
    function initBackgroundVideoPause() {
        const backgroundVideos = document.querySelectorAll('video[data-background-video]');
        
        if (backgroundVideos.length === 0) return;

        const pauseObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const video = entry.target;
                if (entry.isIntersecting) {
                    video.play().catch(err => {
                        // Autoplay may be blocked
                        console.log('Background video play prevented:', err);
                    });
                } else {
                    video.pause();
                }
            });
        }, {
            threshold: 0.5 // Pause when less than 50% visible
        });

        backgroundVideos.forEach(video => {
            pauseObserver.observe(video);
        });
    }

    /**
     * Initialize all video loading functionality
     */
    function init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }

        initLazyVideos();
        initClickToPlay();
        initBackgroundVideoPause();
    }

    // Start initialization
    init();

})();


