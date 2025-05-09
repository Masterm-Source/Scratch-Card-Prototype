const messageCanvas = document.getElementById('messageCanvas');
const scratchCanvas = document.getElementById('scratchCanvas');
const messageCtx = messageCanvas.getContext('2d');
const scratchCtx = scratchCanvas.getContext('2d');

messageCanvas.width = 500;
messageCanvas.height = 150;
scratchCanvas.width = 500;
scratchCanvas.height = 150;

let sound = null;
let isAudioInitialized = false;
let lastSoundPlayTime = 0;
const soundDebounceMs = 100;

function initializeAudio() {
    if (!isAudioInitialized) {
        sound = new Audio('assets/sound7.mp3');
        sound.loop = false;
        sound.volume = 1.0;
        sound.src = 'data:audio/mpeg;base64,/+MYxAAAAANIAAAAAExBTUUzLjEwMAAAAAA';
        sound.play().catch(err => console.log('Silent sound play error:', err));
        sound.src = 'assets/sound7.mp3';
        isAudioInitialized = true;
        console.log('Audio initialized');
        sound.addEventListener('ended', () => {
            isSoundPlaying = false;
            console.log('Sound ended');
            if (isScratching) {
                setTimeout(playSound, soundDebounceMs);
            }
        });
    }
}

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

function initializeCardSparkles() {
    const sparkleContainer = document.querySelector('.card-sparkle-container');
    const sparkleCount = 30;
    for (let i = 0; i < sparkleCount; i++) {
        const sparkle = document.createElement('span');
        sparkle.className = 'card-sparkle';
        sparkle.textContent = '✦';
        sparkle.style.left = `${Math.random() * 100}%`;
        sparkle.style.top = `${Math.random() * 100}%`;
        sparkle.style.setProperty('--delay', Math.random());
        if (Math.random() < 0.2) {
            sparkle.style.setProperty('--color', 'rgba(200,200,255,0.9)'); // Prismatic
        }
        sparkleContainer.appendChild(sparkle);
    }
    console.log('Initialized', sparkleCount, 'card sparkles');
}

console.log('Initializing canvases');
drawMessage();
drawScratchLayer();
initializeCardSparkles();

let isScratching = false;
let scratchedPixels = 0;
const brushRadius = 15;
const totalPixels = scratchCanvas.width * scratchCanvas.height;
const intervalThreshold = totalPixels * 0.05;
let lastBurstAt = 0;
let isSoundPlaying = false;
let lastX = null;
let lastY = null;

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

function stopSoundOnLeave() {
    if (isScratching) {
        isScratching = false;
        isSoundPlaying = false;
        lastX = null;
        lastY = null;
    }
}

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
        scratchCtx.arc(x, y, brushRadius, 0, Math.PI * 2);
        scratchCtx.fill();
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
        const spawnY = canvasTopRelativeToCard + canvasRect.height;
        const spawnX = 300;
        console.log(`Canvas rect: top=${canvasRect.top}, height=${canvasRect.height}, card top=${cardRect.top}, spawnX=${spawnX}, spawnY=${spawnY}`);
        for (let i = 0; i < count; i++) {
            const heart = document.createElement('span');
            heart.className = 'heart-emoji';
            heart.textContent = hearts[0];
            const riseDuration = 0.6 + Math.random() * 0.8;
            const fallDuration = 2 + Math.random() * 1;
            const totalDuration = riseDuration + fallDuration;
            const xSpreadPeak = (Math.random() - 0.5) * 500;
            const yPeak = -400 + Math.random() * 300;
            const isLeftLobe = Math.random() < 0.5;
            const xSpreadFall = isLeftLobe ? 20 : -20;
            const yFall = 300 + Math.random() * 150;
            heart.style.setProperty('--duration', `${totalDuration}s`);
            heart.style.setProperty('--x-spread-peak', `${xSpreadPeak}px`);
            heart.style.setProperty('--y-peak', `${yPeak}px`);
            heart.style.setProperty('--x-spread-fall', `${xSpreadFall}px`);
            heart.style.setProperty('--y-fall', `${yFall}px`);
            heart.style.left = `${spawnX}px`;
            heart.style.top = `${spawnY}px`;
            card.appendChild(heart);
            setTimeout(() => {
                heart.remove();
            }, totalDuration * 1000);
            console.log(`Spawned heart ${i + 1}/${count}: x=${spawnX}, y=${spawnY}, rise=${riseDuration}s, fall=${fallDuration}s, peak=(${xSpreadPeak}, ${yPeak}), fall=(${xSpreadFall}, ${yFall}), lobe=${isLeftLobe ? 'left' : 'right'}`);
        }
    } catch (err) {
        console.error('Error in spawnHearts:', err);
    }
}

function updateShimmerOpacity() {
    const opacity = Math.max(0, 1 - (scratchedPixels / totalPixels));
    const chevrons = document.querySelectorAll('.chevron');
    chevrons.forEach(chevron => {
        chevron.style.opacity = opacity;
    });
    if (scratchedPixels > totalPixels * 0.95) {
        chevrons.forEach(chevron => chevron.remove());
        console.log('Removed chevrons');
    }
}

function checkReveal() {
    try {
        console.log(`Checking reveal: scratchedPixels=${scratchedPixels}, intervalThreshold=${intervalThreshold}, lastBurstAt=${lastBurstAt}`);
        updateShimmerOpacity();
        const intervalsPassed = Math.floor(scratchedPixels / intervalThreshold);
        if (intervalsPassed > lastBurstAt) {
            lastBurstAt = intervalsPassed;
            console.log(`Triggering heart burst at interval: ${intervalsPassed}`);
            const rect = scratchCanvas.getBoundingClientRect();
            spawnHearts(50, rect);
            setTimeout(() => {
                spawnHearts(40, rect);
            }, 100);
        }
    } catch (err) {
        console.error('Error in checkReveal:', err);
    }
}

window.addEventListener('load', () => {
    console.log('Page loaded, testing heart spawn');
    try {
        const rect = scratchCanvas.getBoundingClientRect();
        spawnHearts(1, rect);
    } catch (err) {
        console.error('Error in test heart spawn:', err);
    }
});
