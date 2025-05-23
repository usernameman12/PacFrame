document.addEventListener('DOMContentLoaded', () => {
  const urlInput = document.getElementById('url-input');
  const loadButton = document.getElementById('load-btn');
  const animationToggle = document.getElementById('animation-toggle');
  const frameWidthSlider = document.getElementById('frame-width');
  const frameHeightSlider = document.getElementById('frame-height');
  const widthValue = document.getElementById('width-value');
  const heightValue = document.getElementById('height-value');
  const demoContainer = document.getElementById('demo-container');
  
  let currentFrameId = null;
  
  let frameWidth = '100%';
  let frameHeight = '500px';
  let showAnimation = true;
  
  loadButton.addEventListener('click', () => {
    loadWebsite();
  });
  
  urlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      loadWebsite();
    }
  });
  
  animationToggle.addEventListener('change', () => {
    showAnimation = animationToggle.checked;
    if (currentFrameId) {
      pacframe.update(currentFrameId, { showAnimation });
    }
  });
  
  frameWidthSlider.addEventListener('input', () => {
    frameWidth = `${frameWidthSlider.value}%`;
    widthValue.textContent = frameWidth;
    if (currentFrameId) {
      pacframe.update(currentFrameId, { width: frameWidth });
    }
  });
  
  frameHeightSlider.addEventListener('input', () => {
    frameHeight = `${frameHeightSlider.value}px`;
    heightValue.textContent = frameHeight;
    if (currentFrameId) {
      pacframe.update(currentFrameId, { height: frameHeight });
    }
  });
  
  function loadWebsite() {
    let url = urlInput.value.trim();
    
    if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
      urlInput.value = url;
    }
    
    if (currentFrameId) {
      pacframe.remove(currentFrameId);
      currentFrameId = null;
    }
    
    if (url) {
      loadButton.textContent = 'Loading...';
      loadButton.disabled = true;
      
      // Create frame with default settings
      currentFrameId = pacframe.embed(url, 'demo-container', {
        width: frameWidth,
        height: frameHeight,
        showAnimation,
        loadingText: 'Chomping through bytes...',
        onLoad: () => {

          loadButton.textContent = 'Load Website';
          loadButton.disabled = false;
        },
        onError: () => {

          loadButton.textContent = 'Load Website';
          loadButton.disabled = false;
        }
      });
    }
  }
  
  urlInput.value = 'https://www.wikipedia.org';
  
  setTimeout(() => {
    loadWebsite();
  }, 500);
});