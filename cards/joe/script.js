// Get both canvases
const messageCanvas = document.getElementById('messageCanvas');
const scratchCanvas = document.getElementById('scratchCanvas');
const messageCtx = messageCanvas.getContext('2d');
const scratchCtx = scratchCanvas.getContext('2d');
const scratchSound = document.getElementById('scratchSound');

// Set canvas dimensions
messageCanvas.width = 380;
messageCanvas.height = 100;
scratchCanvas.width = 380;
scratchCanvas.height = 100;

// Preload sound
const sound = new Audio('assets/sound4.mp3');
sound.loop = false;
sound.volume = 1.0;

// Draw the message on the message canvas (bottom layer)
function drawMessage() {
    messageCtx.clearRect(0, 0, messageCanvas.width, messageCanvas.height);
    messageCtx.font = '30px Comic Sans MS';
    messageCtx.fillStyle = '#fff';
    messageCtx.textAlign = 'center';
    messageCtx.textBaseline = 'middle';
    const message = "💖Hello babygal💖";
    messageCtx.fillText(message, messageCanvas.width / 2, messageCanvas.height / 2);
}

// Draw the scratch layer on the scratch canvas (top layer)
function drawScratchLayer() {
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
    };
    scratchLayer.onerror = () => {
        console.log('Failed to load scratch-section.jpg. Using transparent fallback.');
        scratchCtx.fillStyle = 'rgba(0, 0, 0, 0)';
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
let isSoundPlaying = false;

// Function to play the sound
function playSound() {
    if (!isSoundPlaying) {
        isSoundPlaying = true;
        sound.volume = 1.0;
        sound.play().catch(err => console.log('Sound play error:', err));
    }
}

// Add an event listener to detect when the sound ends naturally
sound.addEventListener('ended', () => {
    isSoundPlaying = false;
    console.log('Sound finished playing naturally.');
    if (isScratching) {
        playSound();
    }
});

// Stop sound if the mouse leaves the canvas
function stopSoundOnLeave() {
    if (isScratching) {
        isScratching = false;
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

// Fireworks logic with love-themed pink bursts from bottom of scratch section
function checkReveal() {
    const intervalsPassed = Math.floor(scratchedPixels / intervalThreshold);
    if (intervalsPassed > lastBurstAt) {
        lastBurstAt = intervalsPassed;
        console.log('Firing love-themed fireworks at interval:', intervalsPassed);
        if (typeof confetti === 'function') {
            // Calculate the bottom of the scratch canvas in viewport coordinates
            const rect = scratchCanvas.getBoundingClientRect();
            const canvasBottomY = (rect.bottom / window.innerHeight);
            const canvasCenterX = (rect.left + rect.width / 2) / window.innerWidth;

            // First burst: Pink sparkles
            confetti({
                particleCount: 30,
                spread: 40,
                origin: { x: canvasCenterX, y: canvasBottomY },
                colors: ['#FF69B4', '#FF1493'],
                scalar: 1.2,
                gravity: 0.8,
                ticks: 100,
                angle: 90,
                startVelocity: 20
            });
            // Second burst: Lighter pink accents
            setTimeout(() => {
                confetti({
                    particleCount: 20,
                    spread: 60,
                    origin: { x: canvasCenterX, y: canvasBottomY },
                    colors: ['#C71585', '#FF69B4'],
                    scalar: 0.8,
                    gravity: 1.0,
                    ticks: 80,
                    angle: 90,
                    startVelocity: 25
                });
            }, 100);
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
    }
});
