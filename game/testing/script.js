// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game variables
const GRAVITY = 0.5;
const JUMP_FORCE = -12;
const MOVE_SPEED = 5;
const GROUND_Y = canvas.height - 100;

// Player object
const player = {
    x: 100,
    y: GROUND_Y,
    width: 64,
    height: 64,
    velocityX: 0,
    velocityY: 0,
    onGround: true,
    direction: 'right',
    
    // Animation properties
    currentAnimation: 'idle',
    currentFrame: 0,
    frameTimer: 0,
    frameDelay: 60, // Slower frame changes
    walkSidewaysFrameDelay: 15, // Faster frame changes for sideways walk
    
    // Side idle state tracking
    hasMoved: false,           // Has player moved horizontally
    idleStartTime: 0,          // When player became idle
    sideIdleTimeout: 200000,   // 200 seconds in milliseconds
    
    // Jump state tracking
    isJumpingSideways: false,  // Track if jumping sideways
    isJumpingFront: false,     // Track if jumping front
    
    // Sprite sheet properties
    spriteSheets: {
        main: null,           // Original sprite sheet
        sideIdle: null,       // Side idle sprite sheet
        jumpSideways: null,   // Sideways jump sprite sheet
        jumpFront: null,      // Front jump sprite sheet
        walkFront: null,      // Front walk sprite sheet
        walkSideways: null    // Sideways walk sprite sheet
    },
    frameWidth: 64,
    frameHeight: 64,
    spriteSheetsLoaded: {
        main: false,
        sideIdle: false,
        jumpSideways: false,
        jumpFront: false,
        walkFront: false,
        walkSideways: false
    },
    
    // Animation frames
    animations: {
        idle: { frames: 8, row: 0, loop: true, spriteSheet: 'main' },
        walk: { frames: 4, row: 0, loop: true, spriteSheet: 'walkSideways' },
        jump: { frames: 1, row: 0, frame: 0, loop: false, spriteSheet: 'main' },
        fall: { frames: 1, row: 0, frame: 1, loop: false, spriteSheet: 'main' },
        sideIdle: { frames: 10, row: 0, loop: true, spriteSheet: 'sideIdle' },
        jumpSideways: { frames: 1, row: 0, frame: 0, loop: false, spriteSheet: 'jumpSideways' },
        jumpFront: { frames: 1, row: 0, frame: 0, loop: false, spriteSheet: 'jumpFront' },
        walkFront: { frames: 4, row: 0, loop: true, spriteSheet: 'walkFront' }
    }
};

// Input handling
const keys = {};

// Event listeners for keyboard
document.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    keys[e.code] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
    keys[e.code] = false;
});

// Load sprite sheet images
function loadSpriteSheets() {
    // Load main sprite sheet
    const mainImg = new Image();
    mainImg.onload = function() {
        player.spriteSheets.main = mainImg;
        player.spriteSheetsLoaded.main = true;
        console.log('Main sprite sheet loaded successfully!');
    };
    mainImg.onerror = function() {
        console.log('Error loading main sprite image, using fallback...');
        player.spriteSheets.main = createFallbackSprite();
        player.spriteSheetsLoaded.main = true;
    };
    mainImg.src = 'images/fox/foxIdle.png';
    
    // Load side idle sprite sheet
    const sideIdleImg = new Image();
    sideIdleImg.onload = function() {
        player.spriteSheets.sideIdle = sideIdleImg;
        player.spriteSheetsLoaded.sideIdle = true;
        console.log('Side idle sprite sheet loaded successfully!');
    };
    sideIdleImg.onerror = function() {
        console.log('Error loading side idle sprite image, using fallback...');
        player.spriteSheets.sideIdle = createFallbackSideIdleSprite();
        player.spriteSheetsLoaded.sideIdle = true;
    };
    sideIdleImg.src = 'images/fox/fox-side-idle1.png';
    
    // Load sideways jump sprite sheet
    const jumpSidewaysImg = new Image();
    jumpSidewaysImg.onload = function() {
        player.spriteSheets.jumpSideways = jumpSidewaysImg;
        player.spriteSheetsLoaded.jumpSideways = true;
        console.log('Sideways jump sprite sheet loaded successfully!');
    };
    jumpSidewaysImg.onerror = function() {
        console.log('Error loading sideways jump sprite image, using fallback...');
        player.spriteSheets.jumpSideways = createFallbackJumpSidewaysSprite();
        player.spriteSheetsLoaded.jumpSideways = true;
    };
    jumpSidewaysImg.src = 'images/fox/fox-jump-sideways.png';
    
    // Load front jump sprite sheet
    const jumpFrontImg = new Image();
    jumpFrontImg.onload = function() {
        player.spriteSheets.jumpFront = jumpFrontImg;
        player.spriteSheetsLoaded.jumpFront = true;
        console.log('Front jump sprite sheet loaded successfully!');
    };
    jumpFrontImg.onerror = function() {
        console.log('Error loading front jump sprite image, using fallback...');
        player.spriteSheets.jumpFront = createFallbackJumpFrontSprite();
        player.spriteSheetsLoaded.jumpFront = true;
    };
    jumpFrontImg.src = 'images/fox/jump-front1.png';
    
    // Load front walk sprite sheet
    const walkFrontImg = new Image();
    walkFrontImg.onload = function() {
        player.spriteSheets.walkFront = walkFrontImg;
        player.spriteSheetsLoaded.walkFront = true;
        console.log('Front walk sprite sheet loaded successfully!');
    };
    walkFrontImg.onerror = function() {
        console.log('Error loading front walk sprite image, using fallback...');
        player.spriteSheets.walkFront = createFallbackWalkFrontSprite();
        player.spriteSheetsLoaded.walkFront = true;
    };
    walkFrontImg.src = 'images/fox/fox-walk-front.png';
    
    // Load sideways walk sprite sheet
    const walkSidewaysImg = new Image();
    walkSidewaysImg.onload = function() {
        player.spriteSheets.walkSideways = walkSidewaysImg;
        player.spriteSheetsLoaded.walkSideways = true;
        console.log('Sideways walk sprite sheet loaded successfully!');
    };
    walkSidewaysImg.onerror = function() {
        console.log('Error loading sideways walk sprite image, using fallback...');
        player.spriteSheets.walkSideways = createFallbackWalkSidewaysSprite();
        player.spriteSheetsLoaded.walkSideways = true;
    };
    walkSidewaysImg.src = 'images/fox/temp-walk-sideways.png';
}

// Fallback sprite if main image doesn't load
function createFallbackSprite() {
    const spriteCanvas = document.createElement('canvas');
    spriteCanvas.width = 512; // 8 frames x 64px 
    spriteCanvas.height = 64;  // 1 row x 64px
    const spriteCtx = spriteCanvas.getContext('2d');
    
    // Create basic sprites 
    for (let col = 0; col < 8; col++) {
        const x = col * 64;
        const y = 0;
        
        // Body
        spriteCtx.fillStyle = '#9966cc';
        spriteCtx.fillRect(x + 16, y + 20, 32, 32);
        
        // Head
        spriteCtx.fillStyle = '#cc99ff';
        spriteCtx.fillRect(x + 20, y + 8, 24, 20);
        
        // Eyes
        spriteCtx.fillStyle = '#000';
        spriteCtx.fillRect(x + 24, y + 12, 4, 4);
        spriteCtx.fillRect(x + 36, y + 12, 4, 4);
        
        // Legs
        spriteCtx.fillStyle = '#9966cc';
        spriteCtx.fillRect(x + 20, y + 48, 8, 12);
        spriteCtx.fillRect(x + 36, y + 48, 8, 12);
    }
    
    return spriteCanvas;
}

// Fallback sprite for sideways walk
function createFallbackWalkSidewaysSprite() {
    const spriteCanvas = document.createElement('canvas');
    spriteCanvas.width = 256; // 4 frames x 64px 
    spriteCanvas.height = 64;  // 1 row x 64px
    const spriteCtx = spriteCanvas.getContext('2d');
    
    // Create basic sideways walk sprites with leg movement
    for (let col = 0; col < 4; col++) {
        const x = col * 64;
        const y = 0;
        
        // Body (side view)
        spriteCtx.fillStyle = '#cc6699';
        spriteCtx.fillRect(x + 20, y + 20, 28, 32);
        
        // Head (side view)
        spriteCtx.fillStyle = '#ff99cc';
        spriteCtx.fillRect(x + 16, y + 8, 32, 20);
        
        // Eye
        spriteCtx.fillStyle = '#000';
        spriteCtx.fillRect(x + 38, y + 12, 4, 4);
        
        // Legs (alternating for walk cycle)
        spriteCtx.fillStyle = '#cc6699';
        if (col % 2 === 0) {
            // Frame 0, 2: legs in different positions
            spriteCtx.fillRect(x + 24, y + 48, 6, 14);
            spriteCtx.fillRect(x + 38, y + 50, 6, 12);
        } else {
            // Frame 1, 3: legs in different positions
            spriteCtx.fillRect(x + 24, y + 50, 6, 12);
            spriteCtx.fillRect(x + 38, y + 48, 6, 14);
        }
        
        // Tail (slight movement for walking)
        spriteCtx.fillStyle = '#cc6699';
        const tailOffset = (col % 2) * 2;
        spriteCtx.fillRect(x + 8 - tailOffset, y + 25, 12, 8);
    }
    
    return spriteCanvas;
}

// Fallback sprite for side idle
function createFallbackSideIdleSprite() {
    const spriteCanvas = document.createElement('canvas');
    spriteCanvas.width = 640; // 10 frames x 64px 
    spriteCanvas.height = 64;  // 1 row x 64px
    const spriteCtx = spriteCanvas.getContext('2d');
    
    // Create basic side-view sprites 
    for (let col = 0; col < 10; col++) {
        const x = col * 64;
        const y = 0;
        
        // Body (side view)
        spriteCtx.fillStyle = '#cc6699';
        spriteCtx.fillRect(x + 20, y + 20, 28, 32);
        
        // Head (side view)
        spriteCtx.fillStyle = '#ff99cc';
        spriteCtx.fillRect(x + 16, y + 8, 32, 20);
        
        // Eye
        spriteCtx.fillStyle = '#000';
        spriteCtx.fillRect(x + 38, y + 12, 4, 4);
        
        // Legs (side view)
        spriteCtx.fillStyle = '#cc6699';
        spriteCtx.fillRect(x + 24, y + 48, 6, 12);
        spriteCtx.fillRect(x + 38, y + 48, 6, 12);
        
        // Tail
        spriteCtx.fillStyle = '#cc6699';
        spriteCtx.fillRect(x + 8, y + 25, 12, 8);
    }
    
    return spriteCanvas;
}

// Fallback sprite for sideways jump
function createFallbackJumpSidewaysSprite() {
    const spriteCanvas = document.createElement('canvas');
    spriteCanvas.width = 64; // 1 frame x 64px 
    spriteCanvas.height = 64; // 1 row x 64px
    const spriteCtx = spriteCanvas.getContext('2d');
    
    const x = 0;
    const y = 0;
    
    // Body (jumping sideways)
    spriteCtx.fillStyle = '#cc6699';
    spriteCtx.fillRect(x + 18, y + 22, 28, 28);
    
    // Head (side view)
    spriteCtx.fillStyle = '#ff99cc';
    spriteCtx.fillRect(x + 14, y + 10, 32, 18);
    
    // Eye
    spriteCtx.fillStyle = '#000';
    spriteCtx.fillRect(x + 36, y + 14, 4, 4);
    
    // Legs (jumping position)
    spriteCtx.fillStyle = '#cc6699';
    spriteCtx.fillRect(x + 22, y + 46, 6, 14);
    spriteCtx.fillRect(x + 36, y + 46, 6, 14);
    
    // Tail
    spriteCtx.fillStyle = '#cc6699';
    spriteCtx.fillRect(x + 6, y + 27, 12, 8);
    
    return spriteCanvas;
}

// Fallback sprite for front jump
function createFallbackJumpFrontSprite() {
    const spriteCanvas = document.createElement('canvas');
    spriteCanvas.width = 64; // 1 frame x 64px 
    spriteCanvas.height = 64; // 1 row x 64px
    const spriteCtx = spriteCanvas.getContext('2d');
    
    const x = 0;
    const y = 0;
    
    // Body (jumping front view)
    spriteCtx.fillStyle = '#9966cc';
    spriteCtx.fillRect(x + 16, y + 18, 32, 32);
    
    // Head (front view)
    spriteCtx.fillStyle = '#cc99ff';
    spriteCtx.fillRect(x + 20, y + 6, 24, 20);
    
    // Eyes
    spriteCtx.fillStyle = '#000';
    spriteCtx.fillRect(x + 24, y + 10, 4, 4);
    spriteCtx.fillRect(x + 36, y + 10, 4, 4);
    
    // Legs (spread for jumping)
    spriteCtx.fillStyle = '#9966cc';
    spriteCtx.fillRect(x + 18, y + 46, 8, 14);
    spriteCtx.fillRect(x + 38, y + 46, 8, 14);
    
    // Ears
    spriteCtx.fillStyle = '#cc99ff';
    spriteCtx.fillRect(x + 22, y + 4, 4, 8);
    spriteCtx.fillRect(x + 38, y + 4, 4, 8);
    
    return spriteCanvas;
}

// Fallback sprite for front walk
function createFallbackWalkFrontSprite() {
    const spriteCanvas = document.createElement('canvas');
    spriteCanvas.width = 256; // 4 frames x 64px 
    spriteCanvas.height = 64;  // 1 row x 64px
    const spriteCtx = spriteCanvas.getContext('2d');
    
    // Create basic front walk sprites with leg movement
    for (let col = 0; col < 4; col++) {
        const x = col * 64;
        const y = 0;
        
        // Body (front view)
        spriteCtx.fillStyle = '#9966cc';
        spriteCtx.fillRect(x + 16, y + 20, 32, 32);
        
        // Head (front view)
        spriteCtx.fillStyle = '#cc99ff';
        spriteCtx.fillRect(x + 20, y + 8, 24, 20);
        
        // Eyes
        spriteCtx.fillStyle = '#000';
        spriteCtx.fillRect(x + 24, y + 12, 4, 4);
        spriteCtx.fillRect(x + 36, y + 12, 4, 4);
        
        // Legs (alternating for walk cycle)
        spriteCtx.fillStyle = '#9966cc';
        if (col % 2 === 0) {
            // Frame 0, 2: left leg forward
            spriteCtx.fillRect(x + 20, y + 48, 8, 12);
            spriteCtx.fillRect(x + 36, y + 50, 8, 10);
        } else {
            // Frame 1, 3: right leg forward
            spriteCtx.fillRect(x + 20, y + 50, 8, 10);
            spriteCtx.fillRect(x + 36, y + 48, 8, 12);
        }
        
        // Ears
        spriteCtx.fillStyle = '#cc99ff';
        spriteCtx.fillRect(x + 22, y + 6, 4, 8);
        spriteCtx.fillRect(x + 38, y + 6, 4, 8);
    }
    
    return spriteCanvas;
}

// Initialize sprite sheets
loadSpriteSheets();

// Check if all required sprites are loaded
function areSpritesLoaded() {
    return player.spriteSheetsLoaded.main && player.spriteSheetsLoaded.sideIdle && 
           player.spriteSheetsLoaded.jumpSideways && player.spriteSheetsLoaded.jumpFront &&
           player.spriteSheetsLoaded.walkFront && player.spriteSheetsLoaded.walkSideways;
}

// Update player physics
function updatePlayer() {
    // Handle input
    let isMovingHorizontally = false;
    let isWalkingForward = false;
    
    // Check for S key (front walk)
    if (keys['s']) {
        isWalkingForward = true;
        player.hasMoved = true; // Mark that player has moved
    }
    
    // Check for 'w' or 'space' key press for front jump
    if ((keys['w'] || keys[' '] || keys['space']) && player.onGround) {
        // Reset to default idle state
        player.hasMoved = false;
        player.idleStartTime = 0;
        player.isJumpingSideways = false;
        player.isJumpingFront = true; // Set front jump flag
        
        // Jump
        player.velocityY = JUMP_FORCE;
        player.onGround = false;
    }

    // Arrow Keys Input Handling Section

// Check for ArrowDown key (front walk)
if (keys['arrowdown']) {
    isWalkingForward = true;
    player.hasMoved = true; // Mark that player has moved
}

// Horizontal movement with arrow keys
if (keys['arrowleft']) {
    player.velocityX = -MOVE_SPEED;
    player.direction = 'left';
    isMovingHorizontally = true;
    player.hasMoved = true; // Mark that player has moved
} else if (keys['arrowright']) {
    player.velocityX = MOVE_SPEED;
    player.direction = 'right';
    isMovingHorizontally = true;
    player.hasMoved = true; // Mark that player has moved
}

// Jumping with ArrowUp key (for sideways jump)
if (keys['arrowup'] &&  player.onGround) {
    player.velocityY = JUMP_FORCE;
    player.onGround = false;
    isMovingHorizontally = true;
     // it is a sideways jump
     player.isJumpingSideways = true;
    // Check if jumping sideways (moving horizontally while jumping)
    if (isMovingHorizontally=false) {
       player.isJumpingFront = false;
    }
}
    
    // Horizontal movement
    if (keys['a'] || keys['arrowleft']) {
        player.velocityX = -MOVE_SPEED;
        player.direction = 'left';
        isMovingHorizontally = true;
        player.hasMoved = true; // Mark that player has moved
    } else if (keys['d'] || keys['arrowright']) {
        player.velocityX = MOVE_SPEED;
        player.direction = 'right';
        isMovingHorizontally = true;
        player.hasMoved = true; // Mark that player has moved
    } else {
        player.velocityX *= 0.8; // Friction
    }
    

    // Apply gravity
    if (!player.onGround) {
        player.velocityY += GRAVITY;
    }
    
    // Update position
    player.x += player.velocityX;
    player.y += player.velocityY;
    
    // Ground collision
    if (player.y >= GROUND_Y) {
        player.y = GROUND_Y;
        player.velocityY = 0;
        player.onGround = true;
        player.isJumpingSideways = false; // Reset sideways jump when landing
        player.isJumpingFront = false; // Reset front jump when landing
    }
    
    // Screen boundaries
    if (player.x < 0) player.x = 0;
    if (player.x > canvas.width - player.width) player.x = canvas.width - player.width;
    
    // Update animation state
    const previousAnimation = player.currentAnimation;
    
    if (!player.onGround) {
        if (player.isJumpingFront) {
            // Use front jump animation for W/Space jumps
            player.currentAnimation = 'jumpFront';
        } else if (player.isJumpingSideways) {
            // Use sideways jump animation
            player.currentAnimation = 'jumpSideways';
        } else {
            // Default to sideways jump for arrow up
            player.currentAnimation = 'jumpSideways';
        }
        // Reset idle timer when not on ground
        player.idleStartTime = 0;
    } else if (isWalkingForward) {
        // S key is held - use front walk animation
        player.currentAnimation = 'walkFront';
        // Reset idle timer when walking
        player.idleStartTime = 0;
    } else if (isMovingHorizontally && Math.abs(player.velocityX) > 0.5) {
        player.currentAnimation = 'walk';
        // Reset idle timer when moving
        player.idleStartTime = 0;
    } else {
        // Player is idle on ground
        const currentTime = Date.now();
        
        // If we just became idle, record the time
        if (player.idleStartTime === 0 || previousAnimation !== player.currentAnimation) {
            player.idleStartTime = currentTime;
        }
        
        // Check if player has moved before and if enough time has passed
        if (player.hasMoved) {
            const timeSinceIdle = currentTime - player.idleStartTime;
            
            if (timeSinceIdle < player.sideIdleTimeout) {
                // Use side idle for first 200 seconds
                player.currentAnimation = 'sideIdle';
            } else {
                // Switch back to front idle after 200 seconds
                player.currentAnimation = 'idle';
            }
        } else {
            // Player hasn't moved yet, use front idle
            player.currentAnimation = 'idle';
        }
    }
    
    // Reset frame if animation changed
    if (previousAnimation !== player.currentAnimation) {
        player.currentFrame = 0;
        player.frameTimer = 0;
    }
    
    // Update animation frame
    player.frameTimer++;
    
    // Use faster frame delay for sideways walk animation
    const currentFrameDelay = (player.currentAnimation === 'walk') ? 
        player.walkSidewaysFrameDelay : player.frameDelay;
    
    if (player.frameTimer >= currentFrameDelay) {
        player.frameTimer = 0;
        
        const animation = player.animations[player.currentAnimation];
        
        if (animation.loop) {
            // Looping animations (idle, walk, sideIdle, walkFront)
            player.currentFrame++;
            if (player.currentFrame >= animation.frames) {
                player.currentFrame = 0; // Loop back to beginning
            }
        } else {
            // Non-looping animations (jump, fall, jumpSideways, jumpFront) - use specific frame
            if (animation.frame !== undefined) {
                player.currentFrame = animation.frame;
            }
        }
    }
}

// Draw player sprite
function drawPlayer() {
    // Don't draw if sprites aren't loaded
    if (!areSpritesLoaded()) {
        // Draw simple rectangle as fallback
        ctx.fillStyle = '#9966cc';
        ctx.fillRect(player.x, player.y, player.width, player.height);
        return;
    }
    
    const animation = player.animations[player.currentAnimation];
    const spriteSheet = player.spriteSheets[animation.spriteSheet];
    
    if (!spriteSheet) {
        // Fallback if specific sprite sheet isn't available
        ctx.fillStyle = '#9966cc';
        ctx.fillRect(player.x, player.y, player.width, player.height);
        return;
    }
    
    const sourceX = player.currentFrame * player.frameWidth;
    const sourceY = animation.row * player.frameHeight;
    
    ctx.save();
    
    // For front animations (walkFront, jumpFront), don't flip the sprite
    if (player.currentAnimation === 'walkFront' || player.currentAnimation === 'jumpFront') {
        ctx.drawImage(
            spriteSheet,
            sourceX, sourceY, player.frameWidth, player.frameHeight,
            player.x, player.y, player.width, player.height
        );
    } else if (player.direction === 'left') {
        // Flip sprite if moving left (for side animations)
        ctx.scale(-1, 1);
        ctx.drawImage(
            spriteSheet,
            sourceX, sourceY, player.frameWidth, player.frameHeight,
            -player.x - player.width, player.y, player.width, player.height
        );
    } else {
        ctx.drawImage(
            spriteSheet,
            sourceX, sourceY, player.frameWidth, player.frameHeight,
            player.x, player.y, player.width, player.height
        );
    }
    
    ctx.restore();
}

// Draw simple background (just clear canvas)
function drawBackground() {
    // Clear with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Main game loop
function gameLoop() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    drawBackground();
    
    // Update and draw player
    updatePlayer();
    drawPlayer();
    
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();