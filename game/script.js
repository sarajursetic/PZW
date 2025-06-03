const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const gravity = 1;

// Učitavanje slika
const platformImg = new Image();
platformImg.src = 'images/scenery/tile3.png';

const playerSpriteSheet = new Image();
playerSpriteSheet.src = 'images/bibi/bibi.png';

const groundImg = new Image();
groundImg.src = 'images/scenery/tile.png';

const cloudImg = new Image();
cloudImg.src = 'images/scenery/cloud1.png';

const skullImg = new Image();
skullImg.src = 'images/skull/sprite-skull-normal.png';

const seedImg = new Image();
seedImg.src = 'images/potions/seeds.png';

const portalImg = new Image();
portalImg.src = 'images/scenery/Portal.png';

let points = 0;
let totalSeeds = 0;

class Player {
    constructor() {
        this.position = {
            x: 100,
            y: 100
        };
        this.velocity = {
            x: 0,
            y: 0
        };
        this.width = 64;
        this.height = 64;
        
        // Sprite animacija
        this.currentFrame = 0;
        this.frameCount = 10; // Broj frejmova u sprite sheet-u
        this.frameTimer = 0;
        this.frameDelay = 40; // Brzina animacije
        this.spriteWidth = 64; // Širina jednog frejma u sprite sheet-u
        this.spriteHeight = 64; // Visina jednog frejma
        this.facingRight = true;
    }

    draw() {
        ctx.save();
        
        // Okretanje sprite-a ako ide lijevo
        if (!this.facingRight) {
            ctx.scale(-1, 1);
            ctx.translate(-this.position.x * 2 - this.width, 0);
        }

        if (playerSpriteSheet.complete) {
            // Animacija se pokazuje cijelo vrijeme
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
            // Fallback ako se slika ne učita
            ctx.fillStyle = "blue";
            ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
        }
        
        ctx.restore();
    }

    update() {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        if (this.position.y + this.height + this.velocity.y <= canvas.height) {
            this.velocity.y += gravity;
        } else {
            this.velocity.y = 0;
            this.position.y = canvas.height - this.height;
        }
        
        this.draw();
    }
}

class Platform {
    constructor(x, y) {
        this.position = { x, y };
        this.width = 100;
        this.height = 100;
    }

    draw() {
        if (platformImg.complete) {
            ctx.drawImage(platformImg, this.position.x, this.position.y, this.width, this.height);
        } else {
            // Fallback ako se slika ne učita
            ctx.fillStyle = "#8B4513";
            ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
        }
    }
}

class Ground {
    constructor() {
        this.height = 100;
        this.tileWidth = 100; // Širina jednog tile-a
        this.width = canvas.width * 2; // Širi od ekrana za scrolling
        this.position = { x: 0, y: canvas.height - this.height };
        
        // Definiram gdje postoje ground tile-ovi (true = postoji, false = ne postoji)
        this.tiles = [];
        
        // Kreiram patern ground tile-ova - možete promijeniti ovaj patern
        for(let i = 0; i < 50; i++) {
            // Početak ima pod, zatim praznine, pa opet pod, itd.
            if(i < 5 || (i >= 8 && i < 12) || (i >= 15 && i < 20) || (i >= 25 && i < 30) || (i >= 35 && i < 40) || i >= 45) {
                this.tiles.push(true);
            } else {
                this.tiles.push(false); // Praznina
            }
        }
    }

    draw() {
        if (groundImg.complete) {
            // Crtamo samo tile-ove gdje postoji pod
            for(let i = 0; i < this.tiles.length; i++) {
                if(this.tiles[i]) {
                    const x = this.position.x + (i * this.tileWidth);
                    ctx.drawImage(groundImg, x, this.position.y, this.tileWidth, this.height);
                }
            }
        } else {
            // Fallback ako se slika ne učita
            for(let i = 0; i < this.tiles.length; i++) {
                if(this.tiles[i]) {
                    const x = this.position.x + (i * this.tileWidth);
                    ctx.fillStyle = "#228B22";
                    ctx.fillRect(x, this.position.y, this.tileWidth, this.height);
                }
            }
        }
    }

    update(scrollOffset) {
        // Pomičemo pod s ostatkom svijeta
        this.position.x = -scrollOffset;
    }
    
    // Nova metoda za provjeru da li postoji ground na određenoj poziciji
    hasGroundAt(x) {
        const tileIndex = Math.floor((x - this.position.x) / this.tileWidth);
        return tileIndex >= 0 && tileIndex < this.tiles.length && this.tiles[tileIndex];
    }
    
    // Metoda za dobijanje Y pozicije ground-a
    getGroundY() {
        return this.position.y;
    }
    
    // Metoda za dobijanje početka zadnjeg tla
    getLastGroundStart() {
        for(let i = this.tiles.length - 1; i >= 0; i--) {
            if(this.tiles[i]) {
                // Pronađi prvi tile zadnjeg segmenta
                let startIndex = i;
                while(startIndex > 0 && this.tiles[startIndex - 1]) {
                    startIndex--;
                }
                return this.position.x + (startIndex * this.tileWidth);
            }
        }
        return 0;
    }
    
    // Metoda za dobijanje kraja zadnjeg tla
    getLastGroundEnd() {
        for(let i = this.tiles.length - 1; i >= 0; i--) {
            if(this.tiles[i]) {
                return this.position.x + ((i + 1) * this.tileWidth);
            }
        }
        return 0;
    }
}

class Cloud {
    constructor(x, y) {
        this.position = { x, y };
        this.width = 120;
        this.height = 120;
    }

    draw() {
        if (cloudImg.complete) {
            ctx.drawImage(cloudImg, this.position.x, this.position.y, this.width, this.height);
        } else {
            // Fallback ako se slika ne učita
            ctx.fillStyle = "white";
            ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
        }
    }
}

class Skull {
    constructor(x, y) {
        this.position = { x, y };
        this.initialX = x;
        this.width = 64;
        this.height = 64;
        this.isDead = false;
        
        // Sprite animation properties
        this.currentFrame = 0;
        this.frameCount = 4;
        this.frameTimer = 0;
        this.frameDelay = 60;
        this.spriteWidth = 64;
        this.spriteHeight = 64;
        
        // Movement properties
        this.velocity = { x: 2, y: 0 };
        this.movementRange = 100;
        this.direction = 1;
        this.baseX = x; // Pamtimo početnu X poziciju za patrolu
    }

    draw() {
        if (this.isDead) return;
        
        if (skullImg.complete) {
            this.frameTimer++;
            if (this.frameTimer >= this.frameDelay) {
                this.currentFrame = (this.currentFrame + 1) % this.frameCount;
                this.frameTimer = 0;
            }

            // Save context for flipping
            ctx.save();
            
            // Flip the skull based on direction
            if (this.direction === -1) {
                ctx.scale(-1, 1);
                ctx.translate(-this.position.x * 2 - this.width, 0);
            }

            ctx.drawImage(
                skullImg,
                this.currentFrame * this.spriteWidth,
                0,
                this.spriteWidth,
                this.spriteHeight,
                this.direction === -1 ? this.position.x : this.position.x,
                this.position.y,
                this.width,
                this.height
            );

            ctx.restore();
        }
    }

    update(ground, scrollOffset) {
        if (this.isDead) return;

        // Update position relative to portal
        const patrolLeftLimit = this.baseX - this.movementRange/2;
        const patrolRightLimit = this.baseX + this.movementRange/2;
        
        // Update position
        this.position.x += this.velocity.x * this.direction;
        
        // Keep skull near its base position
        if (this.position.x < patrolLeftLimit) {
            this.direction = 1;
            this.position.x = patrolLeftLimit;
        } else if (this.position.x > patrolRightLimit) {
            this.direction = -1;
            this.position.x = patrolRightLimit;
        }
        
        // Keep skull on ground
        if (ground.hasGroundAt(this.position.x)) {
            this.position.y = ground.getGroundY() - this.height;
        }
    }

    checkCollision(player) {
        if (this.isDead) return false;
        
        const isColliding = 
            player.position.x < this.position.x + this.width &&
            player.position.x + player.width > this.position.x &&
            player.position.y < this.position.y + this.height &&
            player.position.y + player.height > this.position.y;

        if (isColliding) {
            if (player.velocity.y > 0 && player.position.y + player.height < this.position.y + this.height / 2) {
                this.isDead = true;
                points += 100;
                return 'killed';
            }
            return 'died';
        }
        return false;
    }
}

class Collectible {
    constructor(x, y) {
        this.position = { x, y };
        this.width = 64;
        this.height = 64;
        this.isCollected = false;
        
        // Sprite animation properties
        this.currentFrame = 0;
        this.frameCount = 4; // Number of frames in the sprite sheet
        this.frameTimer = 0;
        this.frameDelay = 60; // Animation speed
        this.spriteWidth = 64; // Width of one frame in sprite sheet
        this.spriteHeight = 64; // Height of one frame
    }

    draw() {
        if (this.isCollected) return;
        
        if (seedImg.complete) {
            // Update animation frame
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

    checkCollision(player) {
        if (this.isCollected) return false;

        if (
            player.position.x < this.position.x + this.width &&
            player.position.x + player.width > this.position.x &&
            player.position.y < this.position.y + this.height &&
            player.position.y + player.height > this.position.y
        ) {
            this.isCollected = true;
            points += 20; // Promjena sa 10 na 20
            return true;
        }
        return false;
    }
}

class Portal {
    constructor(x, y) {
        this.position = { x, y };
        this.width = 96;  // Povećano na 96
        this.height = 96; // Povećano na 96
        this.isActive = false;
        
        // Sprite animation properties
        this.currentFrame = 0;
        this.frameCount = 6;
        this.frameTimer = 0;
        this.frameDelay = 8;
        this.spriteWidth = 32;
        this.spriteHeight = 32;
        this.row = 0;
        this.column = 0;
    }
    
    draw() {
        if (!this.isActive) return;
        
        if (portalImg.complete) {
            this.frameTimer++;
            if (this.frameTimer >= this.frameDelay) {
                // Update frame position
                this.column = (this.column + 1) % 3; // 3 columns
                if (this.column === 0) {
                    this.row = (this.row + 1) % 2; // 2 rows
                }
                this.frameTimer = 0;
            }

            ctx.drawImage(
                portalImg,
                this.column * this.spriteWidth, // source x
                this.row * this.spriteHeight,   // source y
                this.spriteWidth,
                this.spriteHeight,
                this.position.x,
                this.position.y,
                this.width,
                this.height
            );
        }
    }
    
    activate() {
        this.isActive = true;
    }
    
    checkCollision(player) {
        if (!this.isActive) return false;
        
        return (
            player.position.x < this.position.x + this.width &&
            player.position.x + player.width > this.position.x &&
            player.position.y < this.position.y + this.height &&
            player.position.y + player.height > this.position.y
        );
    }
}

const player = new Player();
const ground = new Ground();
const platforms = [
    new Platform(600, 600),
    new Platform(1300, 500),
    new Platform(2100, 600),
    new Platform(2300, 500),
    new Platform(3100, 500),
    new Platform(3300, 600),
];

const clouds = [
    new Cloud(150, 100),
    new Cloud(650, 150),
    new Cloud(1250, 80),
    new Cloud(1850, 120),
    new Cloud(2450, 100),
    new Cloud(3050, 140),
    new Cloud(3550, 240),
];

// Position portal and skull after the last platform
const lastPlatform = platforms[platforms.length - 1];
const portalPosition = lastPlatform.position.x + 500;
const portal = new Portal(portalPosition, canvas.height - 196);
const skull = new Skull(portalPosition - 30, canvas.height - 164);

const collectibles = [
    new Collectible(500, 400),
    new Collectible(1000, 300),
    new Collectible(1500, 400),
    new Collectible(2000, 300),
    new Collectible(2500, 400),
    new Collectible(3000, 300),
    new Collectible(3500, 400)
];

totalSeeds = collectibles.length;

const keys = {
    right: {
        pressed: false
    },
    left: {
        pressed: false
    },
}

let scrollOffset = 0

function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update and draw ground
    ground.update(scrollOffset);
    ground.draw();
    
    // Draw clouds
    clouds.forEach(cloud => {
        cloud.draw();
    });
    
    // Draw platforms
    platforms.forEach(platform => {
        platform.draw();    
    });

    // Draw collectibles
    collectibles.forEach(collectible => {
        collectible.draw();
    });

    // Update and draw skull
    skull.update(ground, scrollOffset);
    skull.draw();
    
    // Check if all seeds are collected and update portal
    const allSeedsCollected = collectibles.every(c => c.isCollected);
    if (allSeedsCollected && !portal.isActive) {
        portal.activate();
    }
    
    // Draw portal
    portal.draw();
    
    // Update and draw player
    player.update();

    // Display UI
    ctx.font = '24px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText(`Points: ${points}`, 20, 40);
    ctx.fillText(`Seeds: ${collectibles.filter(c => c.isCollected).length}/${totalSeeds}`, 20, 70);
    
    // Check collisions
    collectibles.forEach(collectible => {
        collectible.checkCollision(player);
    });

    // Check skull collision
    const skullCollision = skull.checkCollision(player);
    if (skullCollision === 'died') {
        points = 0; // Reset points on death
        resetGame();
    }
    
    // Check portal collision
    if (portal.checkCollision(player)) {
        alert(`Congratulations! You completed the level with ${points} points!`);
        resetGame();
    }

    // Handle movement
    if(keys.right.pressed && player.position.x < 400){
        const nextX = player.position.x + 5;
        const hasGroundAhead = ground.hasGroundAt(nextX + player.width) || ground.hasGroundAt(nextX);
        const onPlatform = platforms.some(platform => 
            nextX + player.width > platform.position.x && 
            nextX < platform.position.x + platform.width &&
            Math.abs((player.position.y + player.height) - platform.position.y) < 10
        );
        
        if(hasGroundAhead || onPlatform) {
            player.velocity.x = 5;
            player.facingRight = true;
        } else {
            player.velocity.x = 0;
        }
    } else if(keys.left.pressed && player.position.x > 100 && scrollOffset === 0){
        const nextX = player.position.x - 5;
        const hasGroundBehind = ground.hasGroundAt(nextX) || ground.hasGroundAt(nextX + player.width);
        const onPlatform = platforms.some(platform => 
            nextX + player.width > platform.position.x && 
            nextX < platform.position.x + platform.width &&
            Math.abs((player.position.y + player.height) - platform.position.y) < 10
        );
        
        if(hasGroundBehind || onPlatform) {
            player.velocity.x = -5;
            player.facingRight = false;
        } else {
            player.velocity.x = 0;
        }
    } else {
        player.velocity.x = 0;

        if(keys.right.pressed){
            scrollOffset += 5
            platforms.forEach(platform => {platform.position.x -= 5});
            clouds.forEach(cloud => {cloud.position.x -= 5});
            collectibles.forEach(collectible => {collectible.position.x -= 5});
            skull.position.x -= 5;
            skull.baseX -= 5;
            portal.position.x -= 5;
        } else if(keys.left.pressed && scrollOffset > 0){
            scrollOffset -= 5
            platforms.forEach(platform => {platform.position.x += 5});
            clouds.forEach(cloud => {cloud.position.x += 5});
            collectibles.forEach(collectible => {collectible.position.x += 5});
            skull.position.x += 5;
            skull.baseX += 5;
            portal.position.x += 5;
        }
    }

    // Platform collisions
    platforms.forEach(platform => {
        if (
            player.position.y + player.height <= platform.position.y &&
            player.position.y + player.height + player.velocity.y >= platform.position.y &&
            player.position.x + player.width > platform.position.x &&
            player.position.x < platform.position.x + platform.width
        ) {
            player.velocity.y = 0;
            player.position.y = platform.position.y - player.height;
        }
    });

    // Ground collisions
    const playerLeftEdge = player.position.x;
    const playerRightEdge = player.position.x + player.width;
    const hasGroundBelow = ground.hasGroundAt(playerLeftEdge) || ground.hasGroundAt(playerRightEdge);
    
    if(hasGroundBelow && player.position.y + player.height >= ground.getGroundY()) {
        player.velocity.y = 0;
        player.position.y = ground.getGroundY() - player.height;
    } else if(!hasGroundBelow && player.position.y + player.height >= canvas.height) {
        resetGame();
    }

    // Level completion check
    if(scrollOffset >= 4000){
        if (allSeedsCollected) {
            if (!portal.isActive) {
                portal.activate();
            }
        } else {
            alert('You need to collect all seeds to activate the portal!');
            player.position.x -= 100;
        }
    }
}

function resetGame() {
    scrollOffset = 0;
    points = 0;
    player.position.x = 100;
    player.position.y = 100;
    player.velocity.x = 0;
    player.velocity.y = 0;
    
    // Reset portal
    portal.isActive = false;
    portal.position.x = portalPosition;
    portal.row = 0;
    portal.column = 0;
    
    // Reset skull position to its base position
    skull.isDead = false;
    skull.position.x = skull.baseX;
    
    // Reset collectibles
    collectibles.forEach((collectible, index) => {
        collectible.isCollected = false;
        collectible.position.x = initialCollectiblePositions[index].x;
        collectible.position.y = initialCollectiblePositions[index].y;
    });
    
    // Reset platforms
    platforms.forEach((platform, index) => {
        const initialPositions = [
            {x: 600, y: 600},
            {x: 1300, y: 500},
            {x: 2100, y: 600},
            {x: 2300, y: 500},
            {x: 3100, y: 500},
            {x: 3300, y: 600}
        ];
        platform.position.x = initialPositions[index].x;
        platform.position.y = initialPositions[index].y;
    });
    
    // Reset clouds
    clouds.forEach((cloud, index) => {
        const initialCloudPositions = [
            {x: 150, y: 100},
            {x: 650, y: 150},
            {x: 1250, y: 80},
            {x: 1850, y: 120},
            {x: 2450, y: 100},
            {x: 3050, y: 140},
            {x: 3550, y: 240}
        ];
        cloud.position.x = initialCloudPositions[index].x;
        cloud.position.y = initialCloudPositions[index].y;
    });
}

animate();

/* kontrole */
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
            if (player.velocity.y === 0) {
                player.velocity.y -= 25;
            }
            break;
    }
});

window.addEventListener('keyup', ({ keyCode }) => {
    switch (keyCode) {
        case 65: // A
            keys.left.pressed = false
            break;
        case 68: // D
            keys.right.pressed = false
            break;
        case 83: // S
            console.log('down released');
            break;
        case 87: // W
            console.log('up released');
            break;
    }
});