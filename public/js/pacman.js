const pacman = (function() {
  const COLORS = {
    pacman: '#FFCC00',
    ghost1: '#FF0000', // Red
    ghost2: '#FFB8FF', // Pink
    ghost3: '#00FFFF', // Cyan
    ghost4: '#FFB852'  // Orange
  };
  
  const DEFAULT_SIZE = 30; 
  
  const DEFAULT_SPEED = 2; 
  
  function createPacman(size = DEFAULT_SIZE) {
    return {
      type: 'pacman',
      size,
      mouthAngle: 0,
      mouthDirection: 1, 
      x: 0,
      y: 0,
      direction: 'right',
      speed: DEFAULT_SPEED,
      color: COLORS.pacman
    };
  }
  
  function createGhost(color, size = DEFAULT_SIZE) {
    return {
      type: 'ghost',
      size,
      x: 0,
      y: 0,
      direction: 'right',
      speed: DEFAULT_SPEED,
      color,
      waveOffset: Math.random() * Math.PI * 2, 
      eyeDirection: { x: 1, y: 0 }
    };
  }
  
  function drawPacman(ctx, pacman) {
    const { x, y, size, mouthAngle, direction, color } = pacman;

    const startAngle = (direction === 'right' ? 0.25 : direction === 'down' ? 0.75 : 
                        direction === 'left' ? 1.25 : 1.75) * Math.PI - mouthAngle / 2;
    const endAngle = (direction === 'right' ? 0.25 : direction === 'down' ? 0.75 : 
                     direction === 'left' ? 1.25 : 1.75) * Math.PI + mouthAngle / 2;
    
    ctx.beginPath();
    ctx.arc(x, y, size / 2, startAngle, endAngle);
    ctx.lineTo(x, y);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }
  
  function drawGhost(ctx, ghost) {
    const { x, y, size, color, eyeDirection } = ghost;
    
    ctx.beginPath();
    
    ctx.arc(x, y - size / 6, size / 2, Math.PI, 0, false);
    
    ctx.lineTo(x + size / 2, y + size / 3);
    
    for (let i = 0; i < 3; i++) {
      const waveX = x + size / 2 - (i + 1) * (size / 3);
      ctx.arc(waveX, y + size / 3, size / 6, 0, Math.PI, true);
    }
    
    ctx.lineTo(x - size / 2, y - size / 6);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    
    const eyeRadius = size / 10;
    const eyeOffset = size / 6;

    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(x - eyeOffset, y - size / 6, eyeRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + eyeOffset, y - size / 6, eyeRadius, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'black';
    const pupilSize = eyeRadius / 2;
    ctx.beginPath();
    ctx.arc(
      x - eyeOffset + eyeDirection.x * pupilSize,
      y - size / 6 + eyeDirection.y * pupilSize, 
      pupilSize, 0, Math.PI * 2
    );
    ctx.fill();
    ctx.beginPath();
    ctx.arc(
      x + eyeOffset + eyeDirection.x * pupilSize,
      y - size / 6 + eyeDirection.y * pupilSize, 
      pupilSize, 0, Math.PI * 2
    );
    ctx.fill();
  }
  
  function updatePacman(pacman, canvasWidth, canvasHeight) {
    pacman.mouthAngle += 0.1 * pacman.mouthDirection;
    if (pacman.mouthAngle > Math.PI / 4) {
      pacman.mouthDirection = -1;
    } else if (pacman.mouthAngle < 0.05) {
      pacman.mouthDirection = 1;
    }
    
    switch (pacman.direction) {
      case 'right':
        pacman.x += pacman.speed;
        if (pacman.x > canvasWidth + pacman.size) {
          pacman.x = -pacman.size;
        }
        break;
      case 'left':
        pacman.x -= pacman.speed;
        if (pacman.x < -pacman.size) {
          pacman.x = canvasWidth + pacman.size;
        }
        break;
      case 'down':
        pacman.y += pacman.speed;
        if (pacman.y > canvasHeight + pacman.size) {
          pacman.y = -pacman.size;
        }
        break;
      case 'up':
        pacman.y -= pacman.speed;
        if (pacman.y < -pacman.size) {
          pacman.y = canvasHeight + pacman.size;
        }
        break;
    }
  }
  
  function updateGhost(ghost, canvasWidth, canvasHeight, targetX, targetY) {
    // Update ghost position
    switch (ghost.direction) {
      case 'right':
        ghost.x += ghost.speed;
        if (ghost.x > canvasWidth + ghost.size) {
          ghost.x = -ghost.size;
        }
        break;
      case 'left':
        ghost.x -= ghost.speed;
        if (ghost.x < -ghost.size) {
          ghost.x = canvasWidth + ghost.size;
        }
        break;
      case 'down':
        ghost.y += ghost.speed;
        if (ghost.y > canvasHeight + ghost.size) {
          ghost.y = -ghost.size;
        }
        break;
      case 'up':
        ghost.y -= ghost.speed;
        if (ghost.y < -ghost.size) {
          ghost.y = canvasHeight + ghost.size;
        }
        break;
    }
    
    if (targetX !== undefined && targetY !== undefined) {
      const dx = targetX - ghost.x;
      const dy = targetY - ghost.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 0) {
        ghost.eyeDirection.x = dx / dist * 0.5; 
        ghost.eyeDirection.y = dy / dist * 0.5;
      }
    }
  }
  
  function createPacmanAnimation(canvas, options = {}) {
    const ctx = canvas.getContext('2d');
    const characters = [];
    const defaultOptions = {
      pacmanSize: DEFAULT_SIZE,
      ghostSize: DEFAULT_SIZE,
      speed: DEFAULT_SPEED,
      includeGhosts: true,
      backgroundColor: 'transparent'
    };
    
    const config = { ...defaultOptions, ...options };
    
    const pacman = createPacman(config.pacmanSize);
    pacman.x = canvas.width / 4;
    pacman.y = canvas.height / 2;
    pacman.speed = config.speed;
    characters.push(pacman);
    
    if (config.includeGhosts) {
      const ghostColors = [COLORS.ghost1, COLORS.ghost2, COLORS.ghost3, COLORS.ghost4];
      const spacing = canvas.width / 5;
      
      for (let i = 0; i < 4; i++) {
        const ghost = createGhost(ghostColors[i], config.ghostSize);
        ghost.x = pacman.x + (i + 1) * spacing;
        ghost.y = canvas.height / 2;
        ghost.speed = config.speed;
        ghost.direction = 'right';
        characters.push(ghost);
      }
    }
    
    let animationId;
    let running = false;
    
    function animate() {
      if (!running) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (config.backgroundColor !== 'transparent') {
        ctx.fillStyle = config.backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      characters.forEach(character => {
        if (character.type === 'pacman') {
          updatePacman(character, canvas.width, canvas.height);
          drawPacman(ctx, character);
        } else if (character.type === 'ghost') {
          updateGhost(character, canvas.width, canvas.height, pacman.x, pacman.y);
          drawGhost(ctx, character);
        }
      });
      
      animationId = requestAnimationFrame(animate);
    }
    
    return {
      start() {
        running = true;
        animate();
      },
      stop() {
        running = false;
        if (animationId) {
          cancelAnimationFrame(animationId);
        }
      },
      isRunning() {
        return running;
      }
    };
  }
  
  return {
    createAnimation: createPacmanAnimation,
    COLORS
  };
})();

window.pacman = pacman;