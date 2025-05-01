// Get both canvases
const messageCanvas = document.getElementById('messageCanvas');
const scratchCanvas = document.getElementById('scratchCanvas');
const messageCtx = messageCanvas.getContext('2d');
const scratchCtx = scratchCanvas.getContext('2d');

// Set canvas dimensions
messageCanvas.width = 500;
messageCanvas.height = 150;
scratchCanvas.width = 500;
scratchCanvas.height = 150;

// Preload sound
let sound = null;
let isAudioInitialized = false;

// Initialize audio on first user interaction
function initializeAudio() {
    if (!isAudioInitialized) {
        sound = new Audio('assets/sound5.mp3');
        sound.loop = false;
        sound.volume = 1.0;
        // Play a silent sound to unlock audio context on mobile
        sound.src = 'data:audio/mpeg;base64,/+MYxAAAAANIAAAAAExBTUUzLjEwMAAAAAA';
        sound.play().catch(err => console.log('Silent sound play error:', err));
        sound.src = 'assets/sound5.mp3';
        isAudioInitialized = true;
        console.log('Audio initialized');
        // Attach ended event listener to reset sound state
        sound.addEventListener('ended', () => {
            isSoundPlaying = false;
            sound.currentTime = 0;
            console.log('Sound ended, ready to replay');
            if (isScratching) {
                playSound();
            }
        });
    }
}

// Draw the message on the message canvas (bottom layer)
function drawMessage() {
    try {
        messageCtx.clearRect(0, 0, messageCanvas.width, messageCanvas.height);
        messageCtx.font = '30px Comic Sans MS';
        messageCtx.fillStyle = '#fff';
        messageCtx.textAlign = 'center';
        messageCtx.textBaseline = 'middle';
        const message = "My Love, I don’t need gifts — your love is all I need. Your words lift me, your touch sets my soul free. You are my always and forever. I love you💓";
        const maxWidth = messageCanvas.width - 20;
        const lineHeight = 20;
        const words = message.split(' ');
        let line = '';
        let lines = [];

        for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + ' ';
            const metrics = messageCtx.measureText(testLine);
            if (metrics.width > maxWidth && line !== '') {
                lines.push(line);
                line = words[i] + ' ';
            } else {
                line = testLine;
            }
        }
        lines.push(line);

        // Center the text block vertically
        const totalHeight = lines.length * lineHeight;
        let y = (messageCanvas.height - totalHeight) / 2 + lineHeight / 2;

        lines.forEach((line, index) => {
            messageCtx.fillText(line, messageCanvas.width / 2, y + (index * lineHeight));
        });
        console.log('Message drawn successfully with', lines.length, 'lines');
    } catch (err) {
        console.error('Error drawing message:', err);
    }
}

// Draw the scratch layer on the scratch canvas (top layer)
function drawScratchLayer() {
    try {
        const scratchLayer = new Image();
        scratchLayer.src = 'assets/scratch-section.jpg';
        scratchLayer.onload = () => {
            scratchCtx.drawImage(scratchLayer, 0, 0, scratchCanvas.width, scratchCanvas.height);
            scratchCtx.strokeStyle = '#000';
            scratchCtx.lineWidth = 2;
            scratchCtx.setLineDash([5, 5]);
            scratchCtx.strokeRect(0, 0, scratchCanvas.width, scratchCanvas.height);
            scratchCtx.setLineDash([]);
            scratchCtx.font = '40px Comic Sans MS';
            scratchCtx.fillStyle = '#000';
            scratchCtx.textAlign = 'center';
            scratchCtx.textBaseline = 'middle';
            scratchCtx.fillText('Scratch Me', scratchCanvas.width / 2, scratchCanvas.height / 2);
            console.log('Scratch layer drawn successfully');
        };
        scratchLayer.onerror = () => {
            console.error('Failed to load scratch-section.jpg. Using gold fallback.');
            scratchCtx.fillStyle = '#FFD700';
            scratchCtx.fillRect(0, 0, scratchCanvas.width, scratchCanvas.height);
            scratchCtx.strokeStyle = '#000';
            scratchCtx.lineWidth = 2;
            scratchCtx.setLineDash([5, 5]);
            scratchCtx.strokeRect(0, 0, scratchCanvas.width, scratchCanvas.height);
            scratchCtx.setLineDash([]);
            scratchCtx.font = '40px Comic Sans MS';
            scratchCtx.fillStyle = '#000';
            scratchCtx.textAlign = 'center';
            scratchCtx.textBaseline = 'middle';
            scratchCtx.fillText('Scratch Me', scratchCanvas.width / 2, scratchCanvas.height / 2);
            console.log('Scratch layer drawn with fallback');
        };
    } catch (err) {
        console.error('Error drawing scratch layer:', err);
    }
}

// Initialize both layers
console.log('Initializing canvases');
drawMessage();
drawScratchLayer();

// Scratching logic on the scratch canvas
let isScratching = false;
let scratchedPixels = 0;
const brushRadius = 12;
const totalPixels = scratchCanvas.width * scratchCanvas.height;
const intervalThreshold = totalPixels * 0.05;
let lastBurstAt = 0;
let isSoundPlaying = false;

// Function to play the sound
function playSound() {
    if (isAudioInitialized && sound && !isSoundPlaying) {
        isSoundPlaying = true;
        sound.currentTime = 0;
        sound.play().then(() => {
            console.log('Sound playing, duration:', sound.duration);
        }).catch(err => {
            console.error('Sound play error:', err.message, err.name);
            isSoundPlaying = false;
        });
    }
}

// Stop sound if the mouse leaves the canvas
function stopSoundOnLeave() {
    if (isScratching) {
        isScratching = false;
        isSoundPlaying = false;
    }
}

// Event listeners for scratching
scratchCanvas.addEventListener('mousedown', (e) => {
    console.log('Mousedown event');
    initializeAudio();
    isScratching = true;
    playSound();
});
scratchCanvas.addEventListener('mouseup', () => {
    isScratching = false;
});
scratchCanvas.addEventListener('mouseleave', stopSoundOnLeave);
scratchCanvas.addEventListener('mousemove', scratch);
scratchCanvas.addEventListener('touchstart', (e) => {
    console.log('Touchstart event');
    initializeAudio();
    isScratching = true;
    playSound();
});
scratchCanvas.addEventListener('touchend', () => {
    isScratching = false;
});
scratchCanvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    scratch(e.touches[0]);
});

function scratch(event) {
    if (!isScratching) return;
    try {
        const rect = scratchCanvas.getBoundingClientRect();
        const scaleX = scratchCanvas.width / rect.width;
        const scaleY = scratchCanvas.height / rect.height;
        const x = (event.clientX - rect.left) * scaleX;
        const y = (event.clientY - rect.top) * scaleY;
        scratchCtx.globalCompositeOperation = 'destination-out';
        scratchCtx.beginPath();
        scratchCtx.arc(x, y, brushRadius, 0, Math.PI * 2);
        scratchCtx.fillStyle = 'rgba(0, 0, 0, 1)';
        scratchCtx.fill();

        const scratchedArea = Math.PI * brushRadius * brushRadius;
        scratchedPixels += scratchedArea;
        console.log('Scratched pixels:', scratchedPixels, 'Interval threshold:', intervalThreshold);
        checkReveal();

        // Replay sound if it has ended
        if (isScratching && (sound.ended || !isSoundPlaying)) {
            playSound();
        }
    } catch (err) {
        console.error('Error in scratch function:', err);
    }
}

// Function to spawn heart emojis
function spawnHearts(count, canvasRect) {
    const hearts = ['❤️', '💖', '💕'];
    const card = document.querySelector('.card');
    const canvasTopRelativeToCard = canvasRect.top - card.getBoundingClientRect().top;
    const spawnY = canvasTopRelativeToCard + canvasRect.height; // Bottom of canvas
    for (let i = 0; i < count; i++) {
        const heart = document.createElement('span');
        heart.className = 'heart-emoji';
        heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
        // Random x-position across canvas width (100px to 500px relative to card)
        const spawnX = 50 + Math.random() * 400; // Canvas is 50px from card left
        // Animation spread: ±50px
        const spread = (Math.random() * 100 - 50);
        heart.style.setProperty('--spread', `${spread}px`);
        // Position relative to card
        heart.style.left = `${spawnX}px`;
        heart.style.top = `${spawnY}px`;
        card.appendChild(heart);
        // Remove after animation
        setTimeout(() => {
            heart.remove();
        }, 2000);
        console.log(`Spawned heart at x: ${spawnX}, y: ${spawnY}, spread: ${spread}`);
    }
}

// Heart animation logic
function checkReveal() {
    try {
        const intervalsPassed = Math.floor(scratchedPixels / intervalThreshold);
        if (intervalsPassed > lastBurstAt) {
            lastBurstAt = intervalsPassed;
            console.log('Spawning heart emojis at interval:', intervalsPassed);
            // Get canvas rectangle
            const rect = scratchCanvas.getBoundingClientRect();
            // First burst: 30 hearts
            spawnHearts(30, rect);
            // Second burst: 20 hearts after 100ms
            setTimeout(() => {
                spawnHearts(20, rect);
            }, 100);
        }
    } catch (err) {
        console.error('Error in checkReveal:', err);
    }
}
