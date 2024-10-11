let scene, camera, renderer;
let dino, cactusArray = [];
let velocityY = 0;
let gravity = 0.6;
let dinoOnGround = true;
let score = 0;
let gameOver = false;
let cactusTimer = 0;
let isCrouching = false; // New variable to track crouching state

// Dino settings
let dinoHeight = 1.4;
let dinoWidth = 1.4;
let dinoDepth = 1.2;

// Cactus settings
let cactusHeight = 1.0;
let cactusWidth = 0.3;
let cactusDepth = 1.5;

// Velocity and physics
let velocityX = -0.10; // Cactus speed

// DOM Elements
let scoreElement, restartButton;

// Initialization of Three.js scene
function init() {
    //! change background
    // Create the scene
    scene = new THREE.Scene();

    scene.background = new THREE.Color(0x87CEEB);
    
    // Create a camera with a wider field of view
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 8;
    camera.position.y = 1; // Position the camera slightly above the ground
    
    // Renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    
    // Ground (invisible ground plane)
    let ground = new THREE.Mesh(
        new THREE.PlaneGeometry(100, 100),
        new THREE.MeshBasicMaterial({color: 0x555555})
    );
    ground.rotation.x = -Math.PI / 2; // Rotate to make it horizontal
    ground.position.y = -2;
    scene.add(ground);
    
    // Create dino
    let dinoGeometry = new THREE.BoxGeometry(dinoWidth, dinoHeight, dinoDepth);
    let dinoMaterial = new THREE.MeshBasicMaterial({color: 0x00ff00});
    dino = new THREE.Mesh(dinoGeometry, dinoMaterial);
    dino.position.y = dinoHeight / 2 - 2; // Adjust dino to sit on the ground
    scene.add(dino);

    // Lights
    let ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Score element
    scoreElement = document.getElementById('score');

    // Restart button
    restartButton = document.getElementById('restart');
    restartButton.style.display = 'none'; // Hide the button initially
    restartButton.addEventListener('click', resetGame);

    // Start game loop
    requestAnimationFrame(animate);
}

// Game loop
function animate() {
    if (!gameOver) {
        requestAnimationFrame(animate);
        updateGame();
        renderer.render(scene, camera);
    }
}

// Update the game logic
function updateGame() {
    // Gravity effect
    if (!dinoOnGround) {
        velocityY -= gravity * 0.01; // Simulate gravity
        dino.position.y += velocityY;
        if (dino.position.y <= -2 + dinoHeight / 2) {
            dino.position.y = -2 + dinoHeight / 2; // Ground level
            velocityY = 0;
            dinoOnGround = true;
        }
    }

    // Move cacti
    cactusArray.forEach(cactus => {
        cactus.position.x += velocityX;
        
        // Collision detection
        if (detectCollision(dino, cactus)) {
            gameOver = true;
            // alert("Game Over! Score: " + score);
            restartButton.style.display = 'flex'; // Show restart button on game over
        }
    });

    // Remove off-screen cacti
    cactusArray = cactusArray.filter(cactus => cactus.position.x > -10);
    
    // Place new cactus every second
    cactusTimer += 1;
    if (cactusTimer > 60) {
        placeCactus();
        cactusTimer = 0;
    }

    // Update score
    score++;
    scoreElement.innerHTML = "Score: " + score;
}

// Dino jump
document.addEventListener("keydown", function(e) {
    if ((e.code === "Space" || e.code === "ArrowUp") && dinoOnGround && !isCrouching) { 
        // Prevent jumping if crouching
        velocityY = 0.2; // Increase jump height by making velocity higher
        dinoOnGround = false;
    } else if (e.code === "ArrowDown" || e.code === "KeyS") {
        crouchDino(); // Crouch when ArrowDown or 'S' is pressed
    }
});

document.addEventListener("keyup", function(e) {
    if (e.code === "ArrowDown" || e.code === "KeyS") {
        standDownDino()
        standUpDino(); // Stand back up when key is released
    }

});

// Crouch the dino
function crouchDino() {
    if (!isCrouching && dinoOnGround) { // Crouch only if on the ground
        dino.scale.y = 0.6; // Scale down the dino
        dino.position.y = -2 + dinoHeight * 0.3; // Adjust the position to stay on the ground
        isCrouching = true;
    }
}

// Stand the dino back up
function standUpDino() {
    if (isCrouching) {
        dino.scale.y = 1; // Reset height
        dino.position.y = -2 + dinoHeight / 2; // Adjust position back
        isCrouching = false;
    }
    console.log(isCrouching);
    
}

function standDownDino() {
    if (!isCrouching) {
        dino.scale.y = 1; // Reset height
        dino.position.y = -2 + dinoHeight / 2; // Adjust position back
        isCrouching = true;
    }
    
}



// Place cactus
// change cactus 
//! change me 
function placeCactus() {
    if (gameOver) return;
    
    // Use ConeGeometry to create a spike-shaped cactus
    let cactusGeometry = new THREE.ConeGeometry(cactusWidth, cactusHeight, 8); // Spike shape with 8 segments
    let cactusMaterial = new THREE.MeshBasicMaterial({color: 0xff0000});
    let cactus = new THREE.Mesh(cactusGeometry, cactusMaterial);

    cactus.position.x = 7; // Start position off screen to the right
    cactus.position.y = cactusHeight / 2 - 2; // Ground level

    scene.add(cactus);
    cactusArray.push(cactus);
}


// Detect collision
function detectCollision(dino, cactus) {
    let dinoBox = new THREE.Box3().setFromObject(dino);
    let cactusBox = new THREE.Box3().setFromObject(cactus);
    return dinoBox.intersectsBox(cactusBox);
}

// Reset game function
function resetGame() {
    // Reset game state
    gameOver = false;
    score = 0;
    dino.position.set(0, dinoHeight / 2 - 2, 0);
    cactusArray.forEach(cactus => scene.remove(cactus));
    cactusArray = [];

    restartButton.style.display = 'none'; // Hide restart button
    scoreElement.innerHTML = "Score: 0";
    
    // Restart the game loop
    requestAnimationFrame(animate);
}

// Initialize game
init();
