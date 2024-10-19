const canvas = document.getElementById("gameCanvas");
const context = canvas.getContext("2d");

canvas.width = 320;
canvas.height = 480;

let gameStarted = false;
let gameOver = false;
let score = 0; // Score variable to track points
let pipeSpeed = 1.5; // Initial pipe speed
let difficultyIncrement = 0.05; // Rate at which difficulty increases

// Load images
const birdImage = new Image();
birdImage.src = 'https://i.postimg.cc/gkq2gFJj/BIRD.png'; // Updated bird image URL

const titleText = "The Boya Game";
const startText = "Start the Game!";
const gameOverText = "Game Over!";

const bird = {
    x: 50,
    y: 150,
    width: 40, // Set width and height based on image size
    height: 30,
    gravity: 0.2, // Reduced gravity for smoother fall
    velocity: 0,
    lift: -6, // Increased lift for smoother flaps
    update: function () {
        if (gameStarted) {
            this.velocity += this.gravity;
            this.y += this.velocity;

            // Check if bird hits the bottom or top boundaries
            if (this.y > canvas.height - this.height) {
                this.y = canvas.height - this.height;
                endGame(); // End game if bird hits the ground
            } else if (this.y < 0) {
                this.y = 0; // Stop bird from going beyond the top boundary
            }
        }
    },
    draw: function () {
        context.drawImage(birdImage, this.x, this.y, this.width, this.height);
    },
    flap: function () {
        if (!gameOver) {
            this.velocity = this.lift; // Apply lift when flapping
        }
    }
};

const pipes = [];
const pipeWidth = 40;
const pipeGap = 150; // Increased pipe gap for easier passing
let pipeTimer = 0;

function createPipe() {
    const pipeHeight = Math.floor(Math.random() * (canvas.height / 2));
    pipes.push({
        x: canvas.width,
        top: pipeHeight,
        bottom: canvas.height - pipeHeight - pipeGap,
        passed: false // Flag to check if the bird passed the pipe
    });
}

function updatePipes() {
    pipes.forEach(pipe => {
        pipe.x -= pipeSpeed; // Pipe speed increases after each pass

        // Remove pipes that go off-screen
        if (pipe.x + pipeWidth < 0) {
            pipes.shift();
        }

        // Check if bird hits the pipes
        if (
            bird.x < pipe.x + pipeWidth &&
            bird.x + bird.width > pipe.x &&
            (bird.y < pipe.top || bird.y + bird.height > canvas.height - pipe.bottom)
        ) {
            endGame(); // End game if bird hits a pipe
        }

        // Check if bird successfully passed the pipe
        if (!pipe.passed && bird.x > pipe.x + pipeWidth) {
            pipe.passed = true;
            score++; // Increase score when the bird passes a pipe
            pipeSpeed += difficultyIncrement; // Increase difficulty after passing each pipe
        }
    });

    if (gameStarted && pipeTimer % 100 === 0) {
        createPipe();
    }
}

function drawPipes() {
    pipes.forEach(pipe => {
        // Create a gradient for the pipe
        const gradient = context.createLinearGradient(pipe.x, 0, pipe.x, canvas.height);
        gradient.addColorStop(0, "#4CAF50"); // Light green color for the top
        gradient.addColorStop(1, "#388E3C"); // Darker green for the bottom

        context.fillStyle = gradient; // Use the gradient for the pipes
        // Draw top pipe
        context.fillRect(pipe.x, 0, pipeWidth, pipe.top);
        
        // Draw bottom pipe
        context.fillRect(pipe.x, canvas.height - pipe.bottom, pipeWidth, pipe.bottom);
    });
}

function resetGame() {
    bird.y = 150;
    bird.velocity = 0;
    pipes.length = 0;
    pipeTimer = 0;
    score = 0; // Reset score
    pipeSpeed = 1.5; // Reset pipe speed
    gameStarted = false;
    gameOver = false;
    document.getElementById("gameOverDialog").style.display = "none";
}

function endGame() {
    gameOver = true;
    document.getElementById("gameOverDialog").style.display = "block";
    document.getElementById("finalScore").innerText = `Final Score: ${score}`;
}

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    if (!gameStarted) {
        drawTitle();
    } else {
        bird.draw();
        drawPipes();
        drawScore(); // Draw score on the canvas
    }
}

function drawScore() {
    context.fillStyle = "black"; // Dark color for visibility
    context.font = "20px 'Press Start 2P'"; // Retro pixelated font
    context.fillText(`SCORE: ${score}`, canvas.width - 100, 30); // Display score at the top right corner
}

function drawTitle() {
    context.fillStyle = "blue"; // Set font color to blue
    context.font = "30px 'Press Start 2P'"; // Retro font
    context.textAlign = "center";
    context.fillText(titleText, canvas.width / 2, canvas.height / 2 - 20);
    
    context.fillStyle = "yellow"; // Change color for visibility
    context.font = "20px 'Press Start 2P'"; // Retro font
    context.fillText(startText, canvas.width / 2, canvas.height / 2 + 20);
}

function update() {
    bird.update();
    updatePipes();
}

function gameLoop() {
    if (!gameOver) {
        update();
        draw();
        pipeTimer++;
    }
    requestAnimationFrame(gameLoop);
}

canvas.addEventListener("click", () => {
    if (!gameStarted) {
        gameStarted = true;
    }
    bird.flap();
});

document.getElementById("retryButton").addEventListener("click", () => {
    resetGame();
    bird.y = 150; // Reset the bird's position
    context.clearRect(0, 0, canvas.width, canvas.height);
    draw(); // Redraw the initial screen
});

// Set the updated background image
canvas.style.background = "url('https://i.postimg.cc/MKZCJh5v/BACKGROUND.jpg')"; // Updated Canvas Background

// Wait for images to load before starting the game loop
birdImage.onload = () => {
    draw(); // Draw initial screen
    gameLoop(); // Start the game loop
};
