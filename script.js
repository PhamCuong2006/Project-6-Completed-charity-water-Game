const gameContainer = document.getElementById('gameContainer');
const bucket = document.getElementById('bucket');
const scoreEl = document.getElementById('score');
const timerEl = document.getElementById('timer');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const celebration = document.getElementById('celebration');
const gameOverEl = document.getElementById('gameOver');
const difficultySelect = document.getElementById('difficultySelect');

let difficulty = 'easy'; 

const difficulties = {
    easy: {
        time: 40,
        goal: 50,
        dropInterval: 800,  
        dropDurationMin: 3.0,
        dropDurationMax: 4.0,
        dirtyChance: 0.2
    },
    medium: {
        time: 30,
        goal: 40,
        dropInterval: 600,  
        dropDurationMin: 2.0,
        dropDurationMax: 3.0,
        dirtyChance: 0.3
    },
    hard: {
        time: 20,
        goal: 30,
        dropInterval: 500,  
        dropDurationMin: 1.5,
        dropDurationMax: 2.5,
        dirtyChance: 0.4
    }
};

let score = 0;
let timeLeft = difficulties[difficulty].time;
let gameActive = false;
let dropInterval;
let timerInterval;
let bucketPosition = 50;
const winScore = difficulties[difficulty].goal;

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
    
    const isClean = Math.random() > difficulties[difficulty].dirtyChance;
    drop.classList.add(isClean ? 'clean' : 'dirty');
    
    const containerWidth = gameContainer.offsetWidth;
    const containerHeight = gameContainer.offsetHeight;
    const randomX = Math.random() * (containerWidth - 30);
    drop.style.left = `${randomX}px`;
    drop.style.top = '0px';
    drop.style.animationTimingFunction = 'linear';
    
    const duration = difficulties[difficulty].dropDurationMin + Math.random() * (difficulties[difficulty].dropDurationMax - difficulties[difficulty].dropDurationMin);
    const speed = containerHeight / (duration * 60);
    let currentTop = 0;
    
    gameContainer.appendChild(drop);

    let collisionDetected = false;

    // Animation function using requestAnimationFrame
    function animateDrop() {
        if (!gameActive || !drop.parentElement || collisionDetected) {
            return;
        }

        currentTop += speed;
        drop.style.top = `${currentTop}px`;

        // Check if drop has reached the bottom
        if (currentTop >= containerHeight) {
            if (drop.parentElement) {
                drop.remove();
            }
            return;
        }

        requestAnimationFrame(animateDrop);
    }

    // Start the animation
    requestAnimationFrame(animateDrop);

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
    }, 50);
}



function startGame() {
    if (gameActive) return;
    
    gameActive = true;
    gameOverEl.classList.remove('active');
    startBtn.textContent = 'Game Running...';
    startBtn.disabled = true;
    
    updateBucketPosition();
    
    dropInterval = setInterval(createDrop, difficulties[difficulty].dropInterval);
    
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
    
    setTimeout(() => {
        resetGame();
    }, 3000);
}

function loseGame() {
    gameOverEl.classList.add('active');
    gameOverEl.querySelector('h3').textContent = 'Time\'s Up!';
    gameOverEl.querySelector('p').textContent = `You scored ${score} points. Goal was ${difficulties[difficulty].goal}. Try again!`;
}

function winGame() {
    stopGame();
    celebration.classList.add('active');
    celebration.querySelector('h2').textContent = '🎉 You Win! 🎉';
    celebration.querySelector('p').textContent = `You scored ${score} points and reached the goal!`;
    
    for (let i = 0; i < 100; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.classList.add('confetti');
            confetti.style.left = `${Math.random() * 100}%`;
            confetti.style.background = ['#fdd33d', '#4fb6e7', '#0c4da2', '#ff6b6b', '#4ecdc4'][Math.floor(Math.random() * 5)];
            confetti.style.width = `${5 + Math.random() * 10}px`;
            confetti.style.height = confetti.style.width;
            confetti.style.top = '0px';
            confetti.style.position = 'fixed';
            confetti.style.zIndex = '9999';  // Above celebration
            document.body.appendChild(confetti);
            
            const duration = 2 + Math.random() * 3;  // Fall duration 2-5 seconds
            const speed = window.innerHeight / (duration * 60);  // Pixels per frame
            let currentTop = 0;
            
            function animateConfetti() {
                currentTop += speed;
                confetti.style.top = `${currentTop}px`;
                
                if (currentTop >= window.innerHeight) {
                    confetti.remove();
                    return;
                }
                
                requestAnimationFrame(animateConfetti);
            }
            
            requestAnimationFrame(animateConfetti);
            
            // Remove after max duration as safety
            setTimeout(() => confetti.remove(), duration * 1000 + 1000);
        }, i * 20);
    }
}

function resetGame() {
    stopGame();
    score = 0;
    timeLeft = difficulties[difficulty].time;
    scoreEl.textContent = score;
    timerEl.textContent = timeLeft;
    document.querySelectorAll('.score-value')[2].textContent = difficulties[difficulty].goal;
    celebration.classList.remove('active');
    gameOverEl.classList.remove('active');
    bucketPosition = gameContainer.offsetWidth / 2 - bucket.offsetWidth / 2;
    updateBucketPosition();
}

startBtn.addEventListener('click', startGame);
resetBtn.addEventListener('click', resetGame);

difficultySelect.addEventListener('change', (e) => {
    difficulty = e.target.value;
    resetGame();
});

celebration.addEventListener('click', () => {
    celebration.classList.remove('active');
});

window.addEventListener('resize', updateBucketPosition);

updateBucketPosition();