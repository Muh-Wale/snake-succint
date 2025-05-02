const canvas = document.getElementById("snake");
const ctx = canvas.getContext("2d");

const box = 32;
const rows = Math.floor(canvas.height / box);
const cols = Math.floor(canvas.width / box);

let snake, food, direction, score, game, isPaused = false;

// AUDIO
let dead = new Audio("audio/dead.mp3");
let eat = new Audio("audio/eat.mp3");
let up = new Audio("audio/up.mp3");
let right = new Audio("audio/right.mp3");
let left = new Audio("audio/left.mp3");
let down = new Audio("audio/down.mp3");

let foodImg = new Image();
foodImg.src = "img/food.png";

foodImg.onerror = function() {
    console.error("Could not load food image");
};

let bodyImg = new Image();
bodyImg.src = "img/body.png";

bodyImg.onerror = function() {
    console.error("Could not load body image");
};

function initGame() {
    snake = [{ x: 9 * box, y: 10 * box }];
    food = {
        x: Math.floor(Math.random() * cols) * box,
        y: Math.floor(Math.random() * rows) * box,
    };
    direction = "";
    score = 0;
    isPaused = false;
    document.getElementById("gameOverModal").style.display = "none";
    clearInterval(game);
    game = setInterval(draw, 100);
}

function draw() {
    if (isPaused) return;

    ctx.fillStyle = "#2a0025";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < snake.length; i++) {
        const s = snake[i];
        if (bodyImg.complete) {
            ctx.save();
            ctx.translate(s.x + box/2, s.y + box/2);
            
            let angle = 0;
            if (direction === "UP") angle = 0;
            else if (direction === "RIGHT") angle = Math.PI/2;
            else if (direction === "DOWN") angle = Math.PI;
            else if (direction === "LEFT") angle = -Math.PI/2;

            ctx.rotate(angle);
            ctx.drawImage(bodyImg, -box/2, -box/2, box, box);
            ctx.restore();
        } else {
            ctx.fillStyle = "#d10cab";
            ctx.fillRect(s.x, s.y, box, box);
        }
    }

    if (foodImg.complete) {
        const foodSize = box * 1.5;
        const foodOffset = (box - foodSize)/2;
        ctx.drawImage(foodImg, food.x + foodOffset, food.y + foodOffset, foodSize, foodSize);
    } else {
        ctx.fillStyle = "#ff5edd";
        ctx.fillRect(food.x, food.y, box, box);
    }

    let headX = snake[0].x;
    let headY = snake[0].y;

    if (direction === "LEFT") headX -= box;
    if (direction === "UP") headY -= box;
    if (direction === "RIGHT") headX += box;
    if (direction === "DOWN") headY += box;

    if (headX === food.x && headY === food.y) {
        score++;
        eat.play();
        food = {
            x: Math.floor(Math.random() * cols) * box,
            y: Math.floor(Math.random() * rows) * box,
        };
    } else {
        snake.pop();
    }

    let newHead = { x: headX, y: headY };

    if (headX < 0 || headX >= cols * box ||
        headY < 0 || headY >= rows * box ||
        collision(newHead, snake)) {
        dead.play();
        gameOver();
        return;
    }

    snake.unshift(newHead);

    ctx.fillStyle = "#ffffff";
    ctx.font = "40px Arial";
    ctx.fillText(score, box, box * 1.5);
}

function collision(head, body) {
    return body.some(segment => segment.x === head.x && segment.y === head.y);
}

function gameOver() {
    clearInterval(game);
    document.getElementById("finalScore").textContent = score;
    document.getElementById("gameOverModal").style.display = "flex";
}

document.addEventListener("keydown", e => {
    const key = e.keyCode;
    if (key === 37 && direction !== "RIGHT") { direction = "LEFT"; left.play(); }
    else if (key === 38 && direction !== "DOWN") { direction = "UP"; up.play(); }
    else if (key === 39 && direction !== "LEFT") { direction = "RIGHT"; right.play(); }
    else if (key === 40 && direction !== "UP") { direction = "DOWN"; down.play(); }
    else if (key === 32) isPaused = !isPaused;
});

document.querySelectorAll("#mobileControls button").forEach(button => {
    button.addEventListener("click", () => {
        const dir = button.getAttribute("data-dir");

        if (dir === "PAUSE") {
            isPaused = !isPaused;
            return;
        }

        if (dir === "LEFT" && direction !== "RIGHT") {
            direction = "LEFT"; left.play();
        } else if (dir === "UP" && direction !== "DOWN") {
            direction = "UP"; up.play();
        } else if (dir === "RIGHT" && direction !== "LEFT") {
            direction = "RIGHT"; right.play();
        } else if (dir === "DOWN" && direction !== "UP") {
            direction = "DOWN"; down.play();
        }
    });
});

document.getElementById("restartBtn").addEventListener("click", initGame);

initGame();