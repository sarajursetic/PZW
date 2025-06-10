const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

canvas.width = 960;   // Reduced width for better device compatibility
canvas.height = 540;  // Maintaining 16:9 aspect ratio

const gravity = 1;

// Učitavanje slika (Image loading)
const platformImg = new Image();
platformImg.src = 'images/scenery/tile3.png';

const playerSpriteSheet = new Image();
playerSpriteSheet.src = 'images/bibi/bibi.png';

const groundImg = new Image();
groundImg.src = 'images/scenery/tile.png';

const cloudImg = new Image();
cloudImg.src = 'images/scenery/cloud1.png';

const seedImg = new Image();
seedImg.src = 'images/potions/seeds.png';

// Added: Image for the end portal
const endPortalImg = new Image();
endPortalImg.src = 'images/scenery/portal.png'; 

/**
 * Represents the player character in the game.
 */
class Player {
    constructor() {
        this.position = {
            x: 75,
            y: 75
        };
        this.velocity = {
            x: 0,
            y: 0
        };
        this.width = 48;
        this.height = 48;
        
        // Sprite animation properties
        this.currentFrame = 0;
        this.frameCount = 10;
        this.frameTimer = 0;
        this.frameDelay = 40;
        this.spriteWidth = 64;
        this.spriteHeight = 64;
        this.facingRight = true;
    }

    /**
     * Draws the player character on the canvas.
     */
    draw() {
        ctx.save();
        
        // Flip the sprite if moving left
        if (!this.facingRight) {
            ctx.scale(-1, 1);
            ctx.translate(-this.position.x * 2 - this.width, 0);
        }

        if (playerSpriteSheet.complete) {
            // Update frame for animation
            this.frameTimer++;
            if (this.frameTimer >= this.frameDelay) {
                this.currentFrame = (this.currentFrame + 1) % this.frameCount;
                this.frameTimer = 0;
            }

            ctx.drawImage(
                playerSpriteSheet,
                this.currentFrame * this.spriteWidth, // source x
                0, // source y
                this.spriteWidth, // source width
                this.spriteHeight, // source height
                this.position.x, // destination x
                this.position.y, // destination y
                this.width, // destination width
                this.height // destination height
            );
        } else {
            // Fallback if image fails to load
            ctx.fillStyle = "blue";
            ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
        }
        
        ctx.restore();
    }

    /**
     * Updates the player's position and applies gravity.
     */
    update() {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        // Apply gravity if not on the ground
        if (this.position.y + this.height + this.velocity.y <= canvas.height) {
            this.velocity.y += gravity;
        } else {
            this.velocity.y = 0;
            this.position.y = canvas.height - this.height;
        }
        
        this.draw();
    }
}

/**
 * Represents a platform in the game.
 */
class Platform {
    constructor(x, y) {
        this.position = { x, y };
        this.width = 75;
        this.height = 75;
    }

    /**
     * Draws the platform on the canvas.
     */
    draw() {
        if (platformImg.complete) {
            ctx.drawImage(platformImg, this.position.x, this.position.y, this.width, this.height);
        } else {
            // Fallback if image fails to load
            ctx.fillStyle = "#8B4513"; // Brown
            ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
        }
    }
}

/**
 * Represents the ground in the game, which can have gaps.
 */
class Ground {
    constructor() {
        this.height = 75;
        this.tileWidth = 75;
        this.width = canvas.width * 2;
        this.position = { x: 0, y: canvas.height - this.height };
        
        // Defines where ground tiles exist (true = exists, false = no ground)
        this.tiles = [];
        
        // Create a pattern of ground tiles - this pattern can be customized
        for(let i = 0; i < 50; i++) {
            // Start with ground, then gaps, then ground again, etc.
            if(i < 5 || (i >= 8 && i < 12) || (i >= 15 && i < 20) || (i >= 25 && i < 30) || (i >= 35 && i < 40) || i >= 45) {
                this.tiles.push(true);
            } else {
                this.tiles.push(false); // Gap
            }
        }
    }

    /**
     * Draws the ground tiles on the canvas.
     */
    draw() {
        if (groundImg.complete) {
            // Draw only tiles where ground exists
            for(let i = 0; i < this.tiles.length; i++) {
                if(this.tiles[i]) {
                    const x = this.position.x + (i * this.tileWidth);
                    ctx.drawImage(groundImg, x, this.position.y, this.tileWidth, this.height);
                }
            }
        } else {
            // Fallback if image fails to load
            for(let i = 0; i < this.tiles.length; i++) {
                if(this.tiles[i]) {
                    const x = this.position.x + (i * this.tileWidth);
                    ctx.fillStyle = "#228B22"; // Forest Green
                    ctx.fillRect(x, this.position.y, this.tileWidth, this.height);
                }
            }
        }
    }

    /**
     * Updates the ground's position based on scroll offset.
     * @param {number} scrollOffset - The current scroll offset of the game world.
     */
    update(scrollOffset) {
        // Move the ground with the rest of the world
        this.position.x = -scrollOffset;
    }
    
    /**
     * Checks if there is ground at a specific X position.
     * @param {number} x - The X coordinate to check.
     * @returns {boolean} True if ground exists at the position, false otherwise.
     */
    hasGroundAt(x) {
        const tileIndex = Math.floor((x - this.position.x) / this.tileWidth);
        return tileIndex >= 0 && tileIndex < this.tiles.length && this.tiles[tileIndex];
    }
    
    /**
     * Gets the Y position of the ground.
     * @returns {number} The Y coordinate of the top of the ground.
     */
    getGroundY() {
        return this.position.y;
    }
}

/**
 * Represents a cloud in the game (decorative element).
 */
class Cloud {
    constructor(x, y) {
        this.position = { x, y };
        this.width = 120;
        this.height = 120;
    }

    /**
     * Draws the cloud on the canvas.
     */
    draw() {
        if (cloudImg.complete) {
            ctx.drawImage(cloudImg, this.position.x, this.position.y, this.width, this.height);
        } else {
            // Fallback if image fails to load
            ctx.fillStyle = "white";
            ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
        }
    }
}

/**
 * Represents a collectible seed in the game.
 */
class Seed {
    constructor(x, y) {
        this.position = { x, y };
        this.width = 64;
        this.height = 64;
        this.collected = false; // True if the seed has been collected
        
        // Sprite animation properties
        this.currentFrame = 0;
        this.frameCount = 5; // Number of frames in the sprite sheet (adjust based on your image)
        this.frameTimer = 0;
        this.frameDelay = 40; // Animation speed
        this.spriteWidth = 64; // Width of a single frame in the sprite sheet
        this.spriteHeight = 64; // Height of a single frame
    }

    /**
     * Draws the seed on the canvas if it hasn't been collected.
     */
    draw() {
        if (!this.collected && seedImg.complete) {
            // Update frame for animation
            this.frameTimer++;
            if (this.frameTimer >= this.frameDelay) {
                this.currentFrame = (this.currentFrame + 1) % this.frameCount;
                this.frameTimer = 0;
            }

            ctx.drawImage(
                seedImg,
                this.currentFrame * this.spriteWidth, // source x
                0, // source y
                this.spriteWidth, // source width
                this.spriteHeight, // source height
                this.position.x, // destination x
                this.position.y, // destination y
                this.width, // destination width
                this.height // destination height
            );
        }
    }
}

/**
 * Represents the end portal that appears when all seeds are collected.
 */
class EndPortal {
    constructor(x, y) {
        this.position = { x, y };
        this.width = 64;
        this.height = 64;
        this.active = false; // Activates only when all seeds are collected
        
        // Glow animation properties
        this.glowTimer = 0;
        this.glowIntensity = 0;

        // Sprite animation properties for the portal itself
        this.currentFrame = 0;
        this.frameCount = 6; // **IMPORTANT**: Adjust this based on your portal sprite sheet
        this.frameTimer = 0;
        this.frameDelay = 10; // Adjust animation speed for the portal
        this.spriteWidth = 32; // **IMPORTANT**: Adjust this based on your portal sprite sheet
        this.spriteHeight = 32; // **IMPORTANT**: Adjust this based on your portal sprite sheet
    }

    /**
     * Draws the end portal with a glowing effect if active.
     */
    draw() {
        if (this.active) {
            // Draw the portal image from sprite sheet if loaded
            if (endPortalImg.complete) {
                // Update frame for animation
                this.frameTimer++;
                if (this.frameTimer >= this.frameDelay) {
                    this.currentFrame = (this.currentFrame + 1) % this.frameCount;
                    this.frameTimer = 0;
                }

                ctx.save();
                ctx.drawImage(
                    endPortalImg,
                    this.currentFrame * this.spriteWidth, // source x
                    0, // source y (assuming horizontal sprite sheet)
                    this.spriteWidth, // source width
                    this.spriteHeight, // source height
                    this.position.x, // destination x
                    this.position.y, // destination y
                    this.width, // destination width
                    this.height // destination height
                );
                ctx.restore();
            }
        }
    }
}

/**
 * Represents a monster that chases the player.
 */
class Monster {
    constructor(x, y) {
        this.position = { x, y };
        this.width = 64;
        this.height = 64;
        this.velocity = {
            x: 2,
            y: 0
        };
        this.isDead = false;
        
        // Sprite animation properties
        this.currentFrame = 0;
        this.frameCount = 4;
        this.frameTimer = 0;
        this.frameDelay = 10;
        this.spriteWidth = 64;  // Updated to match actual sprite size
        this.spriteHeight = 64; // Updated to match actual sprite size
        this.facingRight = true;

        // Load monster sprite
        this.sprite = new Image();
        this.sprite.src = 'images/skull/sprite-skull-normal.png';
    }

    draw() {
        if (this.isDead) return;
        
        if (this.sprite.complete) {
            ctx.save();
            
            if (!this.facingRight) {
                ctx.scale(-1, 1);
                ctx.translate(-this.position.x * 2 - this.width, 0);
            }

            this.frameTimer++;
            if (this.frameTimer >= this.frameDelay) {
                this.currentFrame = (this.currentFrame + 1) % this.frameCount;
                this.frameTimer = 0;
            }

            ctx.drawImage(
                this.sprite,
                this.currentFrame * this.spriteWidth,
                0,
                this.spriteWidth,
                this.spriteHeight,
                this.position.x,
                this.position.y,
                this.width,
                this.height
            );

            ctx.restore();
        }
    }

    update() {
        if (this.isDead) return;

        // Move along ground
        this.position.y = ground.getGroundY() - this.height;

        // Basic AI to move left and right
        if (this.facingRight) {
            this.velocity.x = 2;
            if (!ground.hasGroundAt(this.position.x + this.width + this.velocity.x)) {
                this.facingRight = false;
            }
        } else {
            this.velocity.x = -2;
            if (!ground.hasGroundAt(this.position.x + this.velocity.x)) {
                this.facingRight = true;
            }
        }

        // Update position
        this.position.x += this.velocity.x;

        // Check collision with player
        if (this.checkCollision()) {
            // Check if player is above monster (jumping on it)
            const playerBottom = player.position.y + player.height;
            const monsterTop = this.position.y;
            
            if (playerBottom <= monsterTop + 20 && player.velocity.y > 0) {
                // Player jumped on monster
                this.isDead = true;
                player.velocity.y = -5; // Bounce player up
                score += 100; // Bonus points for killing monster
            } else {
                // Monster touched player - reset everything
                player.position.x = 100;
                player.position.y = 100;
                player.velocity.x = 0;
                player.velocity.y = 0;
                score = 0;
                scrollOffset = 0;

                // Reset platforms to initial positions
                platforms.forEach((platform, index) => {
                    const initialPositions = [
                        {x: 450, y: 450},
                        {x: 975, y: 375},
                        {x: 1575, y: 450},
                        {x: 1725, y: 375},
                        {x: 2325, y: 375},
                        {x: 2475, y: 450}
                    ];
                    platform.position.x = initialPositions[index].x;
                    platform.position.y = initialPositions[index].y;
                });

                // Reset clouds to initial positions
                clouds.forEach((cloud, index) => {
                    const initialCloudPositions = [
                        {x: 112, y: 75},
                        {x: 487, y: 112},
                        {x: 937, y: 60},
                        {x: 1387, y: 90},
                        {x: 1837, y: 75},
                        {x: 2287, y: 105},
                        {x: 2662, y: 180}
                    ];
                    cloud.position.x = initialCloudPositions[index].x;
                    cloud.position.y = initialCloudPositions[index].y;
                });

                // Reset seeds
                seeds.forEach((seed, index) => {
                    const initialSeedPositions = [
                        {x: 450, y: 400},
                        {x: 975, y: 325},
                        {x: 1575, y: 400},
                        {x: 1725, y: 325},
                        {x: 2325, y: 325},
                        {x: 2475, y: 400}
                    ];
                    seed.position.x = initialSeedPositions[index].x;
                    seed.position.y = initialSeedPositions[index].y;
                    seed.collected = false;
                });

                // Reset portal
                endPortal.position.x = 2850;
                endPortal.position.y = ground.getGroundY() - 64;
                endPortal.active = false;

                // Reset monster itself
                this.reset();
            }
        }

        this.draw();
    }

    checkCollision() {
        return (
            !this.isDead &&
            player.position.x < this.position.x + this.width &&
            player.position.x + player.width > this.position.x &&
            player.position.y < this.position.y + this.height &&
            player.position.y + player.height > this.position.y
        );
    }

    reset() {
        this.isDead = false;
        this.position.x = 2625; // Place after platforms
        this.position.y = ground.getGroundY() - this.height;
        this.facingRight = true;
    }
}

// Game objects initialization
const player = new Player();
const ground = new Ground();
const monster = new Monster(2625, 0); // Scaled from 3500 for new canvas width
const platforms = [
    new Platform(450, 450),    // Scaled from 600, 600
    new Platform(975, 375),    // Scaled from 1300, 500
    new Platform(1575, 450),   // Scaled from 2100, 600
    new Platform(1725, 375),   // Scaled from 2300, 500
    new Platform(2325, 375),   // Scaled from 3100, 500
    new Platform(2475, 450),   // Scaled from 3300, 600
];

const clouds = [
    new Cloud(112, 75),     // Scaled from 150, 100
    new Cloud(487, 112),    // Scaled from 650, 150
    new Cloud(937, 60),     // Scaled from 1250, 80
    new Cloud(1387, 90),    // Scaled from 1850, 120
    new Cloud(1837, 75),    // Scaled from 2450, 100
    new Cloud(2287, 105),   // Scaled from 3050, 140
    new Cloud(2662, 180),   // Scaled from 3550, 240
];

let score = 0;

const seeds = [
    new Seed(450, 400),     // Scaled from 600, 550
    new Seed(975, 325),     // Scaled from 1300, 450
    new Seed(1575, 400),    // Scaled from 2100, 550
    new Seed(1725, 325),    // Scaled from 2300, 450
    new Seed(2325, 325),    // Scaled from 3100, 450
    new Seed(2475, 400),    // Scaled from 3300, 550
];

// Added: End portal instance, positioned at the end of the level
const endPortal = new EndPortal(2850, ground.getGroundY() - 64); // Scaled from 3800

const keys = {
    right: {
        pressed: false
    },
    left: {
        pressed: false
    },
}

let scrollOffset = 0; // Tracks how much the world has scrolled

/**
 * Displays the current score on the canvas.
 */
function drawScore() {
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.font = '24px Arial';
    ctx.strokeText('Score: ' + score, 20, 40);
    ctx.fillText('Score: ' + score, 20, 40);
}

/**
 * Shows a custom modal message instead of `alert()`.
 * @param {string} message - The message to display.
 */
function showModal(message) {
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '50%';
    modal.style.left = '50%';
    modal.style.transform = 'translate(-50%, -50%)';
    modal.style.backgroundColor = 'rgba(255, 136, 167, 0.7)';
    modal.style.color = 'rgb(127, 28, 54)';
    modal.style.padding = '20px';
    modal.style.borderRadius = '10px';
    modal.style.zIndex = '1000';
    modal.style.textAlign = 'center';
    modal.style.fontFamily = 'Arial, sans-serif';
    modal.style.fontSize = '24px';
    modal.style.border = '2px solid white';
    modal.textContent = message;

    const closeButton = document.createElement('button');
    closeButton.textContent = 'OK';
    closeButton.style.margin = '25px';
    closeButton.style.marginTop = '15px';
    closeButton.style.padding = '10px 20px';
    closeButton.style.color = 'rgb(127, 28, 54)';
     closeButton.style.backgroundColor = 'rgba(252, 252, 252, 0.7)';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '5px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.fontSize = '18px';
    closeButton.onclick = () => {
        document.body.removeChild(modal);
    };
    modal.appendChild(closeButton);

    document.body.appendChild(modal);
}


/**
 * The main game animation loop.
 */
function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw ground first (background)
    ground.update(scrollOffset);
    ground.draw();
    
    // Draw clouds (decorative elements)
    clouds.forEach(cloud => {
        cloud.draw();
    });
    
    // Draw and update seeds
    seeds.forEach(seed => {
        seed.draw();
    });

    // Added: Draw the end portal
    endPortal.draw();
    
    // Draw platforms
    platforms.forEach(platform => {
        platform.draw();    
    });
    
    // Update and draw player last (foreground)
    player.update();
    
    // Update and draw monster
    monster.update();

    // Player movement logic with ground/platform checks
    if(keys.right.pressed && player.position.x < 400){
        player.velocity.x = 5;  // Original speed
    } else if(keys.left.pressed && player.position.x > 100 && scrollOffset === 0){
        player.velocity.x = -5; // Original speed
    } else {
        player.velocity.x = 0;

        // Handle scrolling of the world
        if(keys.right.pressed){
            scrollOffset += 5;      // Original speed
            platforms.forEach(platform => {platform.position.x -= 5});
            clouds.forEach(cloud => {cloud.position.x -= 5});
            seeds.forEach(seed => {seed.position.x -= 5});
            endPortal.position.x -= 5;
            monster.position.x -= 5;
        } else if(keys.left.pressed && scrollOffset > 0){
            scrollOffset -= 5;      // Original speed
            platforms.forEach(platform => {platform.position.x += 5});
            clouds.forEach(cloud => {cloud.position.x += 5});
            seeds.forEach(seed => {seed.position.x += 5});
            endPortal.position.x += 5;
            monster.position.x += 5;
        }
    }

    // New game completion logic using the EndPortal
    const allSeedsCollected = seeds.every(seed => seed.collected);
    
    // Activate portal when all seeds are collected
    if (allSeedsCollected) {
        endPortal.active = true;
    }
    
    // Check collision with the portal only if it's active
    if (endPortal.active && 
        player.position.x < endPortal.position.x + endPortal.width &&
        player.position.x + player.width > endPortal.position.x &&
        player.position.y < endPortal.position.y + endPortal.height &&
        player.position.y + player.height > endPortal.position.y) {
        
        showModal('Čestitamo! Završili ste igru! Vaš rezultat: ' + score + ' bodova'); // Replaced alert
        // Reset game state
        score = 0;
        scrollOffset = 0;
        endPortal.active = false; // Deactivate portal for next round
        player.position.x = 100;
        player.position.y = 100;
        player.velocity.x = 0;
        player.velocity.y = 0;
        scrollOffset = 0; // Reset scroll
        score = 0; // Reset score when player dies
        
        // Reset platforms to initial positions
        platforms.forEach((platform, index) => {
            const initialPositions = [
                {x: 450, y: 450},
                {x: 975, y: 375},
                {x: 1575, y: 450},
                {x: 1725, y: 375},
                {x: 2325, y: 375},
                {x: 2475, y: 450}
            ];
            platform.position.x = initialPositions[index].x;
            platform.position.y = initialPositions[index].y;
        });
        clouds.forEach((cloud, index) => {
            const initialCloudPositions = [
                {x: 112, y: 75},
                {x: 487, y: 112},
                {x: 937, y: 60},
                {x: 1387, y: 90},
                {x: 1837, y: 75},
                {x: 2287, y: 105},
                {x: 2662, y: 180}
            ];
            cloud.position.x = initialCloudPositions[index].x;
            cloud.position.y = initialCloudPositions[index].y;
        });
        seeds.forEach((seed, index) => {
            const initialSeedPositions = [
                {x: 450, y: 400},
                {x: 975, y: 325},
                {x: 1575, y: 400},
                {x: 1725, y: 325},
                {x: 2325, y: 325},
                {x: 2475, y: 400}
            ];
            seed.position.x = initialSeedPositions[index].x;
            seed.position.y = initialSeedPositions[index].y;
            seed.collected = false; // Reset collected status
        });
        
        // Reset portal position
        endPortal.position.x = 2850;
        endPortal.position.y = ground.getGroundY() - 64;

        // Reset monster
        monster.reset();
    }


    // Collision with platforms
    platforms.forEach(platform => {
        if (
            player.position.y + player.height <= platform.position.y &&
            player.position.y + player.height + player.velocity.y >= platform.position.y &&
            player.position.x + player.width > platform.position.x &&
            player.position.x < platform.position.x + platform.width
        ) {
            player.velocity.y = 0;
            player.position.y = platform.position.y - player.height; // Snap to top of platform
        }
    });

    // Collision with seeds
    seeds.forEach(seed => {
        if (!seed.collected &&
            player.position.x < seed.position.x + seed.width &&
            player.position.x + player.width > seed.position.x &&
            player.position.y < seed.position.y + seed.height &&
            player.position.y + player.height > seed.position.y
        ) {
            seed.collected = true;
            score += 50;
        }
    });

    // Modified ground collision - only if a ground tile exists
    const playerLeftEdge = player.position.x;
    const playerRightEdge = player.position.x + player.width;
    const hasGroundBelow = ground.hasGroundAt(playerLeftEdge) || ground.hasGroundAt(playerRightEdge);
    
    if(hasGroundBelow && player.position.y + player.height >= ground.getGroundY()) {
        player.velocity.y = 0;
        player.position.y = ground.getGroundY() - player.height;
    } else if(!hasGroundBelow) {
        // If no ground tile below the player, they fall
        if (player.position.y + player.height >= canvas.height) {
            // Respawn player at the start
            player.position.x = 100;
            player.position.y = 100;
            player.velocity.x = 0;
            player.velocity.y = 0;
            scrollOffset = 0; // Reset scroll
            score = 0; // Reset score when player dies

            // Reset platforms to initial positions
            platforms.forEach((platform, index) => {
                const initialPositions = [
                    {x: 450, y: 450},
                    {x: 975, y: 375},
                    {x: 1575, y: 450},
                    {x: 1725, y: 375},
                    {x: 2325, y: 375},
                    {x: 2475, y: 450}
                ];
                platform.position.x = initialPositions[index].x;
                platform.position.y = initialPositions[index].y;
            });
            
            // Reset clouds to initial positions
            clouds.forEach((cloud, index) => {
                const initialCloudPositions = [
                    {x: 112, y: 75},
                    {x: 487, y: 112},
                    {x: 937, y: 60},
                    {x: 1387, y: 90},
                    {x: 1837, y: 75},
                    {x: 2287, y: 105},
                    {x: 2662, y: 180}
                ];
                cloud.position.x = initialCloudPositions[index].x;
                cloud.position.y = initialCloudPositions[index].y;
            });

            // Reset seeds to initial positions
            seeds.forEach((seed, index) => {
                const initialSeedPositions = [
                    {x: 450, y: 400},
                    {x: 975, y: 325},
                    {x: 1575, y: 400},
                    {x: 1725, y: 325},
                    {x: 2325, y: 325},
                    {x: 2475, y: 400}
                ];
                seed.position.x = initialSeedPositions[index].x;
                seed.position.y = initialSeedPositions[index].y;
                seed.collected = false;
            });

            // Added: Reset portal when player falls
            endPortal.position.x = 2850;
            endPortal.position.y = ground.getGroundY() - 64;
            endPortal.active = false;

            // Reset monster
            monster.reset();
        }
    }

    drawScore();
}

animate();

/* kontrole (controls) */
window.addEventListener('keydown', ({ keyCode }) => {
    switch (keyCode) {
        case 65: // A
            console.log('left');
            keys.left.pressed = true;
            break;
        case 83: // S
            console.log('down');
            break;
        case 68: // D
            console.log('right');
            keys.right.pressed = true;
            break;
        case 87: // W
        case 32: // Space
            console.log('jump');
            // Allow jumping only if player is on ground or platform (velocity.y is 0)
            if (player.velocity.y === 0) {
                player.velocity.y -= 15;
            }
            break;
    }
});

window.addEventListener('keyup', ({ keyCode }) => {
    switch (keyCode) {
        case 65: // A
            keys.left.pressed = false;
            break;
        case 68: // D
            keys.right.pressed = false;
            break;
        case 83: // S
            console.log('down released');
            break;
        case 87: // W
            console.log('up released');
            break;
    }
});
