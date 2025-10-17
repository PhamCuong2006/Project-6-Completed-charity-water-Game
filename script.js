const gameContainer = document.getElementById('gameContainer');
const bucket = document.getElementById('bucket');
const scoreEl = document.getElementById('score');
const timerEl = document.getElementById('timer');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const celebration = document.getElementById('celebration');
const gameOverEl = document.getElementById('gameOver');

let score = 0;
let timeLeft = 30;
let gameActive = false;
let dropInterval;
let timerInterval;
let bucketPosition = 50;
const winScore = 20;

function updateBucketPosition() {
    const containerWidth = gameContainer.offsetWidth;
    const bucketWidth = bucket.offsetWidth;
    const maxPosition = containerWidth - bucketWidth;
    bucket.style.left = `${Math.min(Math.max(0, bucketPosition), maxPosition)}px`;
}

gameContainer.addEventListener('mousemove', (e) => {
    if (!gameActive) return;
    const rect = gameContainer.getBoundingClientRect();
    bucketPosition = e.clientX - rect.left - bucket.offsetWidth / 2;
    updateBucketPosition();
});

gameContainer.addEventListener('touchmove', (e) => {
    if (!gameActive) return;
    e.preventDefault();
    const touch = e.touches[0];
    const rect = gameContainer.getBoundingClientRect();
    bucketPosition = touch.clientX - rect.left - bucket.offsetWidth / 2;
    updateBucketPosition();
});

function createDrop() {
    if (!gameActive) return;

    const drop = document.createElement('div');
    drop.classList.add('drop');
    
    const isClean = Math.random() > 0.3;
    drop.classList.add(isClean ? 'clean' : 'dirty');
    
    const containerWidth = gameContainer.offsetWidth;
    const randomX = Math.random() * (containerWidth - 30);
    drop.style.left = `${randomX}px`;
    
    const duration = 2.5 + Math.random() * 1;
    drop.style.animationDuration = `${duration}s`;
    
    gameContainer.appendChild(drop);

    let collisionDetected = false;

    const checkCollision = setInterval(() => {
        if (!gameActive || !drop.parentElement || collisionDetected) {
            clearInterval(checkCollision);
            return;
        }

        const dropRect = drop.getBoundingClientRect();
        const bucketRect = bucket.getBoundingClientRect();
        const containerRect = gameContainer.getBoundingClientRect();

        // Check if drop has reached bucket level
        const dropBottomRelative = dropRect.bottom - containerRect.top;
        const bucketTopRelative = bucketRect.top - containerRect.top;

        if (
            dropBottomRelative >= bucketTopRelative &&
            dropBottomRelative <= bucketTopRelative + 40 &&
            dropRect.left + dropRect.width / 2 >= bucketRect.left &&
            dropRect.left + dropRect.width / 2 <= bucketRect.right
        ) {
            collisionDetected = true;
            clearInterval(checkCollision);
            if (drop.parentElement) {
                drop.remove();
            }
            
            if (isClean) {
                score += 2;
                scoreEl.textContent = score;
            } else {
                score -= 1;
                scoreEl.textContent = score;
            }
            return;
        }

        // Remove drop if it falls past the bottom
        if (dropRect.top - containerRect.top > gameContainer.offsetHeight) {
            clearInterval(checkCollision);
            if (drop.parentElement) {
                drop.remove();
            }
        }
    }, 50);

    // Safety timeout to remove drop after animation should be complete
    setTimeout(() => {
        if (drop.parentElement) {
            drop.remove();
        }
    }, (duration + 0.5) * 1000);
}

function startGame() {
    if (gameActive) return;
    
    gameActive = true;
    gameOverEl.classList.remove('active');
    startBtn.textContent = 'Game Running...';
    startBtn.disabled = true;
    
    updateBucketPosition();
    
    dropInterval = setInterval(createDrop, 1500);
    
    timerInterval = setInterval(() => {
        timeLeft--;
        timerEl.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

function stopGame() {
    gameActive = false;
    clearInterval(dropInterval);
    clearInterval(timerInterval);
    
    const drops = gameContainer.querySelectorAll('.drop');
    drops.forEach(drop => drop.remove());
    
    startBtn.textContent = 'Start Game';
    startBtn.disabled = false;
}

function endGame() {
    stopGame();
    
    if (score >= winScore) {
        winGame();
    } else {
        loseGame();
    }
}

function loseGame() {
    gameOverEl.classList.add('active');
    gameOverEl.querySelector('h3').textContent = 'Time\'s Up!';
    gameOverEl.querySelector('p').textContent = `You scored ${score} points. Goal was ${winScore}. Try again!`;
}

function winGame() {
    stopGame();
    celebration.classList.add('active');
    celebration.querySelector('h2').textContent = '🎉 You Win! 🎉';
    celebration.querySelector('p').textContent = `You scored ${score} points and reached the goal!`;
    
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.classList.add('confetti');
            confetti.style.left = `${Math.random() * 100}%`;
            confetti.style.background = ['#fdd33d', '#4fb6e7', '#0c4da2'][Math.floor(Math.random() * 3)];
            confetti.style.animationDelay = `${Math.random() * 2}s`;
            celebration.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 3000);
        }, i * 50);
    }
}

function resetGame() {
    stopGame();
    score = 0;
    timeLeft = 30;
    scoreEl.textContent = score;
    timerEl.textContent = timeLeft;
    celebration.classList.remove('active');
    gameOverEl.classList.remove('active');
    bucketPosition = gameContainer.offsetWidth / 2 - bucket.offsetWidth / 2;
    updateBucketPosition();
}

startBtn.addEventListener('click', startGame);
resetBtn.addEventListener('click', resetGame);

celebration.addEventListener('click', () => {
    celebration.classList.remove('active');
});

window.addEventListener('resize', updateBucketPosition);

updateBucketPosition();