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
        // Attach ended event listener to sound object
        sound.addEventListener('ended', () => {
            isSoundPlaying = false;
            console.log('Sound finished playing naturally.');
            if (isScratching) {
                playSound();
            }
        });
    }
}

// Draw the message on the message canvas (bottom layer)
function drawMessage() {
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
    if (isAudioInitialized && sound && !isSoundPlaying) {
        isSoundPlaying = true;
        sound.play().then(() => {
            console.log('Sound playing');
        }).catch(err => {
            console.log('Sound play error:', err);
            isSoundPlaying = false;
        });
    }
}

// Stop sound if the mouse leaves the canvas
function stopSoundOnLeave() {
    if (isScratching) {
        isScratching = false;
    }
}

// Event listeners for scratching
scratchCanvas.addEventListener('mousedown', (e) => {
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
    const rect = scratchCanvas.getBoundingClientRect();
    const scaleX = scratchCanvas.width / rect.width;
    const scaleY = scratchCanvas.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
    scratchCtx.globalCompositeOperation = 'destination-out';
    scratchCtx.beginPath();
    scratchCtx.arc(x, y, brushRadius, 0, Math.PI * 2);
    scratchCtx.fillStyle = 'rgba(0, 0, 0, 1)';
    scratch
