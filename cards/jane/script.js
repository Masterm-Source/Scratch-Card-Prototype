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
        messageCtx.font = '18px Comic Sans MS';
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

// Fireworks logic with love-themed pink bursts from bottom of scratch section
function checkReveal() {
    try {
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
    } catch (err) {
        console.error('Error in checkReveal:', err);
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
