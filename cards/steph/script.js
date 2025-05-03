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
let lastSoundPlayTime = 0;
const soundDebounceMs = 100;

// Initialize audio on first user interaction
function initializeAudio() {
    if (!isAudioInitialized) {
        sound = new Audio('assets/sound7.mp3');
        sound.loop = false;
        sound.volume = 1.0;
        // Play a silent sound to unlock audio context on mobile
        sound.src = 'data:audio/mpeg;base64,/+MYxAAAAANIAAAAAExBTUUzLjEwMAAAAAA';
        sound.play().catch(err => console.log('Silent sound play error:', err));
        sound.src = 'assets/sound7.mp3';
        isAudioInitialized = true;
        console.log('Audio initialized');
        // Reset sound state on end
        sound.addEventListener('ended', () => {
            isSoundPlaying = false;
            console.log('Sound ended');
            if (isScratching) {
                setTimeout(playSound, soundDebounceMs);
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
        const message = "Cheers to the memories we've made and the ones yet to come, you're my confidant, my advocate, my best friend, my everything. I feel safest and happiest when I'm in your arms. Thank you for being you. I love you🤩!!";
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
        scratchLayer.src = 'assets/scratch-section7.jpg';
        scratchLayer.onload = () => {
            scratchCtx.drawImage(scratchLayer, 0, 0, scratchCanvas.width, scratchCanvas.height);
            scratchCtx.strokeStyle = '#000';
            scratchCtx.lineWidth = 2;
            scratchCtx.strokeRect(0, 0, scratchCanvas.width, scratchCanvas.height);
            scratchCtx.font = '40px Comic Sans MS';
            scratchCtx.fillStyle = '#000';
            scratchCtx.textAlign = 'center';
            scratchCtx.textBaseline = 'middle';
            scratchCtx.fillText('Scratch Me', scratchCanvas.width / 2, scratchCanvas.height / 2);
            console.log('Scratch layer drawn successfully');
        };
        scratchLayer.onerror = () => {
            console.error('Failed to load scratch-section7.jpg. Using gold fallback.');
            scratchCtx.fillStyle = '#FFD700';
            scratchCtx.fillRect(0, 0, scratchCanvas.width, scratchCanvas.height);
            scratchCtx.strokeStyle = '#000';
            scratchCtx.lineWidth = 2;
            scratchCtx.strokeRect(0, 0, scratchCanvas.width, scratchCanvas.height);
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
const brushRadius = 15;
const totalPixels = scratchCanvas.width * scratchCanvas.height;
const intervalThreshold = totalPixels * 0.05;
let lastBurstAt = 0;
let isSoundPlaying = false;
let lastX = null;
let lastY = null;

// Function to play the sound
function playSound() {
    if (isAudioInitialized && sound && !isSoundPlaying) {
        const now = Date.now();
        if (now - lastSoundPlayTime < soundDebounceMs) {
            console.log('Sound play debounced');
            return;
        }
        isSoundPlaying = true;
        lastSoundPlayTime = now;
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
        lastX = null;
        lastY = null;
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
    lastX = null;
    lastY = null;
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
    lastX = null;
    lastY = null;
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
        // Draw circle at current point
        scratchCtx.arc(x, y, brushRadius, 0, Math.PI * 2);
        scratchCtx.fill();
        // Connect with previous point if exists
        if (lastX !== null && lastY !== null) {
            scratchCtx.beginPath();
            scratchCtx.moveTo(lastX, lastY);
            scratchCtx.lineTo(x, y);
            scratchCtx.lineWidth = brushRadius * 2;
            scratchCtx.strokeStyle = 'rgba(0, 0, 0, 1)';
            scratchCtx.stroke();
        }
        lastX = x;
        lastY = y;

        const scratchedArea = Math.PI * brushRadius * brushRadius;
        scratchedPixels += scratchedArea;
        console.log(`Scratch at x: ${x.toFixed(2)}, y: ${y.toFixed(2)}, lastX: ${lastX?.toFixed(2) || 'null'}, lastY: ${lastY?.toFixed(2) || 'null'}, scratchedPixels: ${scratchedPixels.toFixed(2)}, threshold: ${intervalThreshold}`);
        checkReveal();
    } catch (err) {
        console.error('Error in scratch function:', err);
    }
}

// Function to spawn heart emojis
function spawnHearts(count, canvasRect) {
    try {
        const hearts = ['❤️'];
        const card = document.querySelector('.card');
        if (!card) {
            console.error('Card element not found');
            return;
        }
        const cardRect = card.getBoundingClientRect();
        const canvasTopRelativeToCard = canvasRect.top - cardRect.top;
        const spawnY = canvasTopRelativeToCard + canvasRect.height; // Canvas bottom (~300px)
        const spawnX = 300; // Card center
        console.log(`Canvas rect: top=${canvasRect.top}, height=${canvasRect.height}, card top=${cardRect.top}, spawnX=${spawnX}, spawnY=${spawnY}`);
        for (let i = 0; i < count; i++) {
            const heart = document.createElement('span');
            heart.className = 'heart-emoji';
            heart.textContent = hearts[0];
            // Random rise duration: 0.6-1.2s
            const riseDuration = 0.6 + Math.random() * 0.6;
            // Total duration: rise + 2-2.5s fall
            const fallDuration = 2 + Math.random() * 0.5;
            const totalDuration = riseDuration + fallDuration;
            // Random peak: x: -200 to 200px, y: -400 to -150px (50-200px from top)
            const xSpreadPeak = (Math.random() - 0.5) * 400; // -200 to 200px
            const yPeak = -400 + Math.random() * 250; // -400 to -150px
            // Heart-shaped fall: left or right lobe
            const isLeftLobe = Math.random() < 0.5;
            const xSpreadFall = isLeftLobe ? 20 : -20; // Narrow at bottom
            // Random fall y: 300-400px (canvas bottom or beyond)
            const yFall = 300 + Math.random() * 100; // 300-400px
            heart.style.setProperty('--duration', `${totalDuration}s`);
            heart.style.setProperty('--x-spread-peak', `${xSpreadPeak}px`);
            heart.style.setProperty('--y-peak', `${yPeak}px`);
            heart.style.setProperty('--x-spread-fall', `${xSpreadFall}px`);
            heart.style.setProperty('--y-fall', `${yFall}px`);
            // Position at card center
            heart.style.left = `${spawnX}px`;
            heart.style.top = `${spawnY}px`;
            card.appendChild(heart);
            // Remove after animation
            setTimeout(() => {
                heart.remove();
            }, totalDuration * 1000);
            console.log(`Spawned heart ${i + 1}/${count}: x=${spawnX}, y=${spawnY}, rise=${riseDuration}s, fall=${fallDuration}s, peak=(${xSpreadPeak}, ${yPeak}), fall=(${xSpreadFall}, ${yFall}), lobe=${isLeftLobe ? 'left' : 'right'}`);
        }
    } catch (err) {
        console.error('Error in spawnHearts:', err);
    }
}

// Heart animation logic
function checkReveal() {
    try {
        console.log(`Checking reveal: scratchedPixels=${scratchedPixels}, intervalThreshold=${intervalThreshold}, lastBurstAt=${lastBurstAt}`);
        const intervalsPassed = Math.floor(scratchedPixels / intervalThreshold);
        if (intervalsPassed > lastBurstAt) {
            lastBurstAt = intervalsPassed;
            console.log(`Triggering heart burst at interval: ${intervalsPassed}`);
            // Get canvas rectangle
            const rect = scratchCanvas.getBoundingClientRect();
            // First burst: 40 hearts
            spawnHearts(40, rect);
            // Second burst: 30 hearts after 100ms
            setTimeout(() => {
                spawnHearts(30, rect);
            }, 100);
        }
    } catch (err) {
        console.error('Error in checkReveal:', err);
    }
}

// Test heart spawn on load to debug rendering
window.addEventListener('load', () => {
    console.log('Page loaded, testing heart spawn');
    try {
        const rect = scratchCanvas.getBoundingClientRect();
        spawnHearts(1, rect); // Spawn one test heart
    } catch (err) {
        console.error('Error in test heart spawn:', err);
    }
});
