// Get both canvases
const messageCanvas = document.getElementById('messageCanvas');
const scratchCanvas = document.getElementById('scratchCanvas');
const messageCtx = messageCanvas.getContext('2d');
const scratchCtx = scratchCanvas.getContext('2d');

// Set canvas dimensions
messageCanvas.width = 380;
messageCanvas.height = 100;
scratchCanvas.width = 380;
scratchCanvas.height = 100;

// Preload love-themed background sound
const loveSound = new Audio('assets/love-theme.mp3');
loveSound.loop = false; // No looping, we control restarts manually
loveSound.volume = 1.0;

// Draw the message on the message canvas (bottom layer)
function drawMessage() {
    messageCtx.clearRect(0, 0, messageCanvas.width, messageCanvas.height);
    messageCtx.font = '28px Comic Sans MS';
    messageCtx.fillStyle = '#000';
    messageCtx.textAlign = 'center';
    messageCtx.textBaseline = 'middle';
    messageCtx.fillText('Wamboi, you’re the apple', messageCanvas.width / 2, messageCanvas.height / 2 - 16);
    messageCtx.fillText('of my eye, happy birthday!', messageCanvas.width / 2, messageCanvas.height / 2 + 16);
}

// Draw the scratch layer on the scratch canvas (top layer)
function drawScratchLayer() {
    const scratchLayer = new Image();
    scratchLayer.src = 'assets/silver_gradient.png';
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
    };
    scratchLayer.onerror = () => {
        console.log('Failed to load silver_gradient.png. Using fallback.');
        scratchCtx.fillStyle = '#C0C0C0';
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
    };
}

// Initialize both layers
drawMessage();
drawScratchLayer();

// Scratching logic on the scratch canvas
let isScratching = false;
let scratchedPixels = 0;
const brushRadius = 12;
const totalPixels = scratchCanvas.width * scratchCanvas.height;
const intervalThreshold = totalPixels * 0.05;
let lastBurstAt = 0;
let isSoundPlaying = false; // Flag to track if the sound is currently playing

// Function to play the sound
function playSound() {
    if (!isSoundPlaying) {
        isSoundPlaying = true;
        loveSound.volume = 1.0;
        loveSound.play().catch(err => console.log('Sound play error:', err));
    }
}

// Add an event listener to detect when the sound ends naturally
loveSound.addEventListener('ended', () => {
    isSoundPlaying = false;
    console.log('Sound finished playing naturally.');
    // If still scratching, play the sound again
    if (isScratching) {
        playSound();
    }
});

// Stop sound if the mouse leaves the canvas (no longer needed for sound, but keeping for clarity)
function stopSoundOnLeave() {
    if (isScratching) {
        isScratching = false;
        // Removed fadeOutSound() call to let the sound play fully
    }
}

scratchCanvas.addEventListener('mousedown', (e) => {
    e.preventDefault();
    isScratching = true;
    playSound();
});
scratchCanvas.addEventListener('mouseup', (e) => {
    e.preventDefault();
    isScratching = false;
    // Removed fadeOutSound() call to let the sound play fully
});
scratchCanvas.addEventListener('mouseleave', stopSoundOnLeave);
scratchCanvas.addEventListener('mousemove', scratch);
scratchCanvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    isScratching = true;
    playSound();
});
scratchCanvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    isScratching = false;
    // Removed fadeOutSound() call to let the sound play fully
});
scratchCanvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    scratch(e.touches[0]);
});

function scratch(event) {
    if (!isScratching) return;
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
}

// Fireworks logic with continuous bursts
function checkReveal() {
    const intervalsPassed = Math.floor(scratchedPixels / intervalThreshold);
    if (intervalsPassed > lastBurstAt) {
        lastBurstAt = intervalsPassed;
        console.log('Firing confetti at interval:', intervalsPassed);
        if (typeof confetti === 'function') {
            confetti({
                particleCount: 30,
                spread: 30,
                origin: { y: 0.6 },
                colors: ['#FF69B4', '#FF1493', '#C71585']
            });
        } else {
            console.log('Confetti library not loaded.');
        }
    }
}

// Check if confetti library loaded
window.addEventListener('load', () => {
    if (typeof confetti === 'undefined') {
        console.log('Confetti library failed to load.');
    } else {
        console.log('Confetti library loaded successfully.');
        confetti({
            particleCount: 30,
            spread: 30,
            origin: { y: 0.6 },
            colors: ['#FF69B4', '#FF1493', '#C71585']
        });
    }
});
