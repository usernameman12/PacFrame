/**
 * PacFrame.js - A custom iframe implementation with Pacman theming
 * Allows embedding websites with a stylish frame and loading animation
 */

const pacframe = (function() {
  // Private variables
  let frameCounter = 0;
  const instances = {};
  
  /**
   * Default options for the PacFrame
   */
  const defaultOptions = {
    width: '100%',
    height: '500px',
    showAnimation: true,
    loadingText: 'Loading content...',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    errorText: 'Failed to load content. Please check the URL and try again.',
    animationOptions: {
      pacmanSize: 30,
      ghostSize: 30,
      speed: 2,
      includeGhosts: true,
      backgroundColor: 'transparent'
    }
  };
  
  /**
   * Creates a unique ID for a frame instance
   */
  function generateFrameId() {
    return `pacframe-${++frameCounter}`;
  }
  
  /**
   * Creates the frame container element
   */
  function createFrameContainer(options) {
    const container = document.createElement('div');
    container.className = 'pacframe-container';
    container.style.width = options.width;
    container.style.height = options.height;
    container.style.backgroundColor = options.backgroundColor;
    container.style.borderRadius = options.borderRadius;
    container.style.boxShadow = options.boxShadow;
    
    return container;
  }
  
  /**
   * Creates the iframe element
   */
  function createIframe(url, frameId) {
    const iframe = document.createElement('iframe');
    iframe.className = 'pacframe-iframe';
    iframe.id = `${frameId}-frame`;
    iframe.src = url;
    iframe.setAttribute('loading', 'lazy');
    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
    iframe.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
    
    return iframe;
  }
  
  /**
   * Creates the loader element with Pacman animation
   */
  function createLoader(options, frameId) {
    const loader = document.createElement('div');
    loader.className = 'pacframe-loader';
    loader.id = `${frameId}-loader`;
    
    // Create canvas for Pacman animation
    if (options.showAnimation) {
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 100;
      canvas.id = `${frameId}-canvas`;
      loader.appendChild(canvas);
      
      // Initialize animation but don't start it yet
      const animation = pacman.createAnimation(canvas, options.animationOptions);
      
      // Store animation reference for later use
      instances[frameId].animation = animation;
    }
    
    // Add loading text
    const loadingText = document.createElement('div');
    loadingText.className = 'pacframe-loading-text';
    loadingText.textContent = options.loadingText;
    loader.appendChild(loadingText);
    
    return loader;
  }
  
  /**
   * Creates an error message element
   */
  function createErrorElement(options, frameId) {
    const errorEl = document.createElement('div');
    errorEl.className = 'pacframe-error';
    errorEl.id = `${frameId}-error`;
    errorEl.textContent = options.errorText;
    errorEl.style.display = 'none';
    
    return errorEl;
  }
  
  /**
   * Handles iframe load event
   */
  function handleIframeLoad(frameId) {
    const instance = instances[frameId];
    if (!instance) return;
    
    const iframe = document.getElementById(`${frameId}-frame`);
    const loader = document.getElementById(`${frameId}-loader`);
    
    // Show iframe
    iframe.classList.add('loaded');
    
    // Hide loader with a slight delay
    setTimeout(() => {
      loader.classList.add('hidden');
      
      // Stop animation
      if (instance.animation) {
        instance.animation.stop();
      }
      
      // Callback
      if (typeof instance.options.onLoad === 'function') {
        instance.options.onLoad();
      }
    }, 500);
  }
  
  function handleIframeError(frameId) {
    const instance = instances[frameId];
    if (!instance) return;
    
    const iframe = document.getElementById(`${frameId}-frame`);
    const loader = document.getElementById(`${frameId}-loader`);
    const error = document.getElementById(`${frameId}-error`);
    
    loader.classList.add('hidden');
    
    if (error) {
      error.style.display = 'block';
    }
    
    if (instance.animation) {
      instance.animation.stop();
    }
    
    if (typeof instance.options.onError === 'function') {
      instance.options.onError();
    }
  }
  
  /**
   * @param {string} url - The URL to embed
   * @param {string} targetId - The ID of the elment to embed the fraame in
   * @param {object} options - Config options
   */
  function embed(url, targetId, options = {}) {

    const frameOptions = { ...defaultOptions, ...options };
    
    const target = typeof targetId === 'string' 
      ? document.getElementById(targetId) 
      : targetId;
    
    if (!target) {
      console.error(`PacFrame: Target element with ID '${targetId}' not found`);
      return null;
    }
    
    const frameId = generateFrameId();
    
    instances[frameId] = {
      options: frameOptions,
      animation: null,
      target
    };
    
    const container = createFrameContainer(frameOptions);
    
    const iframe = createIframe(url, frameId);
    
    const loader = createLoader(frameOptions, frameId);
    
    const errorElement = createErrorElement(frameOptions, frameId);
    
    container.appendChild(iframe);
    container.appendChild(loader);
    container.appendChild(errorElement);
    
    target.innerHTML = '';
    target.appendChild(container);
    
    iframe.addEventListener('load', () => handleIframeLoad(frameId));
    iframe.addEventListener('error', () => handleIframeError(frameId));
    
    if (frameOptions.showAnimation && instances[frameId].animation) {
      instances[frameId].animation.start();
    }
    
    return frameId;
  }
  
  /**
   * @param {string} frameId - The ID of the frame to remove
   */
  function remove(frameId) {
    const instance = instances[frameId];
    if (!instance) {
      console.error(`PacFrame: No frame found with ID '${frameId}'`);
      return;
    }
    
    if (instance.animation && instance.animation.isRunning()) {
      instance.animation.stop();
    }
    
    const container = instance.target.querySelector('.pacframe-container');
    if (container) {
      instance.target.removeChild(container);
    }
    
    delete instances[frameId];
  }
  
  /**
   * @param {string} frameId - The ID of the frame to update
   * @param {object} options - New optons to apply
   */
  function update(frameId, options = {}) {
    const instance = instances[frameId];
    if (!instance) {
      console.error(`PacFrame: No frame found with ID '${frameId}'`);
      return;
    }
    
    instance.options = { ...instance.options, ...options };
    
    const container = instance.target.querySelector('.pacframe-container');
    if (container) {
      if (options.width) container.style.width = options.width;
      if (options.height) container.style.height = options.height;
      if (options.backgroundColor) container.style.backgroundColor = options.backgroundColor;
      if (options.borderRadius) container.style.borderRadius = options.borderRadius;
      if (options.boxShadow) container.style.boxShadow = options.boxShadow;
    }
    
    if (options.loadingText) {
      const loadingText = instance.target.querySelector('.pacframe-loading-text');
      if (loadingText) {
        loadingText.textContent = options.loadingText;
      }
    }
  }
  
  return {
    embed,
    remove,
    update
  };
})();

window.pacframe = pacframe;