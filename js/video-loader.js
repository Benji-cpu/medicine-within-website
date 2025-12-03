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
            rootMargin: '200px' // Start loading 200px before video enters viewport
        });

        lazyVideos.forEach(video => {
            videoObserver.observe(video);
            
            // Also check if video is already in viewport
            const rect = video.getBoundingClientRect();
            const isInViewport = rect.top < window.innerHeight + 200 && rect.bottom > -200;
            if (isInViewport && video.hasAttribute('data-src')) {
                loadVideo(video);
            }
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
        // Use appropriate MIME type based on file extension
        const ext = source.split('.').pop().toLowerCase();
        sourceElement.type = ext === 'mov' ? 'video/quicktime' : 'video/mp4';

        // Add source to video
        video.appendChild(sourceElement);
        video.load();

        // Remove data attributes
        video.removeAttribute('data-src');
        video.removeAttribute('data-src-mobile');
        video.removeAttribute('data-lazy-video');

        // Hide the fallback image when video is ready
        const hideImage = () => {
            const parent = video.parentElement;
            if (parent) {
                // Hide hero/spoke card fallback images
                const fallbackImg = parent.querySelector('img.hero-bg:not(.video-background), img.spoke-card-bg:not(.video-background)');
                if (fallbackImg) {
                    fallbackImg.style.opacity = '0';
                    fallbackImg.style.transition = 'opacity 0.5s ease';
                }
                // Hide video container fallback images
                const videoPosterFallback = parent.querySelector('.video-poster-fallback');
                if (videoPosterFallback) {
                    videoPosterFallback.style.opacity = '0';
                    videoPosterFallback.style.transition = 'opacity 0.5s ease';
                }
            }
        };

        // Handle autoplay for background videos
        if (video.hasAttribute('data-autoplay') || video.hasAttribute('data-background-video')) {
            video.setAttribute('autoplay', '');
            video.setAttribute('muted', '');
            video.setAttribute('loop', '');
            video.setAttribute('playsinline', '');
            
            // Hide image when video can play
            video.addEventListener('canplay', hideImage, { once: true });
            video.addEventListener('loadeddata', hideImage, { once: true });
            
            // Try to play (may fail on some browsers)
            video.play().then(() => {
                hideImage();
            }).catch(err => {
                console.log('Autoplay prevented:', err);
            });
        } else {
            // For non-autoplay videos, hide image when ready
            video.addEventListener('canplay', hideImage, { once: true });
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



