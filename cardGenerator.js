/**
 * COMPLETE FIXED Advanced Card Generator Module
 * Combines your dynamic asset handling with Joe's clean scratch system
 * - No more blur/transparency issues
 * - Clean two-canvas system
 * - Dynamic web app asset loading
 * - Minimal CSS conflicts
 */

class AdvancedCardGenerator {
    constructor() {
        this.baseUrl = process.env.BASE_URL || '';
    }

    /**
     * Generate a complete HTML scratch card that EXACTLY matches the web app interface
     */
    async generateCard(cardData) {
        const {
            id: cardId,
            senderName,
            hiddenMessage,
            backgroundImage,
            symbol,
            animation,
            scratchTexture,
            soundEffect,
            // Advanced features
            backgroundImageBase64,
            symbolBase64,
            scratchTextureBase64,
            soundEffectBase64,
            elements = [],
            cardStyle = {},
            glowEffect = 30,
            glowColor = '#667eea',
            smokeEffect = false,
            template = 'classic'
        } = cardData;

        // Generate the complete HTML document with EXACT web app styling
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🎯 Scratch Card from ${senderName} - Masterm Cards</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        ${this.generateWebAppCSS(cardData)}
    </style>
</head>
<body>
    <div class="app-container">
        <div class="header">
            <div class="logo-section">
                <div class="logo-icon">🎯</div>
                <div class="logo-text">Masterm Cards</div>
            </div>
            <div class="header-info">
                <span>Interactive Scratch Card</span>
            </div>
        </div>
        
        <div class="main-content">
            <div class="card-container">
                <div class="card-preview floating ${this.getCardClasses(cardData)}" id="cardPreview" ${this.generateCardInlineStyles(cardData)}>
                    ${this.generateDynamicCardElements(cardData)}
                </div>
            </div>
        </div>
        
        <!-- Audio elements -->
        <audio id="scratchSound" preload="auto">
            ${this.generateAudioSources(cardData)}
        </audio>
        
        <!-- Particle system container -->
        <div id="particleContainer"></div>
        
        <!-- Smoke effect container -->
        <div id="smokeContainer"></div>
    </div>

    <script>
        ${this.generateWebAppJavaScript(cardData)}
    </script>
</body>
</html>`;

        return html;
    }

    /**
     * Extract filename from full URL or return as-is if already a filename
     */
    extractFilename(assetPath) {
        if (!assetPath) return null;
        
        // If it's already just a filename (no slashes), return it
        if (!assetPath.includes('/')) {
            return assetPath;
        }
        
        // Extract filename from full URL
        const parts = assetPath.split('/');
        return parts[parts.length - 1];
    }

    /**
     * Check if an asset is from the web app's asset collection
     */
    isWebAppAsset(assetPath) {
        // If it's a full URL, it's NOT a web app asset needing path prepending
        if (assetPath.startsWith('http://') || assetPath.startsWith('https://')) {
            return false;
        }
        
        // If it starts with a slash, it's an absolute path - don't prepend
        if (assetPath.startsWith('/')) {
            return false;
        }
        
        // Web app assets are just filenames like "12345.jpeg", "symbol123.png", etc.
        const fileNamePattern = /^[0-9a-zA-Z]+\.(jpeg|jpg|png|gif|mp3)$/;
        
        // If it's just a filename without path, it's a web app asset
        if (fileNamePattern.test(assetPath)) {
            return true;
        }
        
        // If it contains the assets path structure but not a full URL, it's also a web app asset
        if (assetPath.includes('/assets/backgrounds/') || 
            assetPath.includes('/assets/symbols/') || 
            assetPath.includes('/assets/scratchTextures/') ||
            assetPath.includes('/assets/audio/')) {
            return true;
        }
        
        return false;
    }

    /**
     * Get CSS classes for the card element - RESPECTS web app selections
     */
    getCardClasses(cardData) {
        const { backgroundImage, cardStyle = {} } = cardData;
        
        // Only use gradient classes if NO image background is selected
        if (backgroundImage && backgroundImage.startsWith('bg-obsidian-')) {
            return backgroundImage;
        }
        
        // If cardStyle has className with gradient AND no image background
        if (cardStyle.className && !backgroundImage) {
            const classes = cardStyle.className.split(' ');
            const bgClass = classes.find(cls => cls.startsWith('bg-obsidian-'));
            return bgClass || '';
        }
        
        // No gradient class if image background exists
        return '';
    }

    /**
     * Generate inline styles - PRIORITIZES web app selections
     */
    generateCardInlineStyles(cardData) {
        const { cardStyle = {}, backgroundImage, backgroundImageBase64 } = cardData;
        let styles = [];

        console.log('🎨 Processing background:', { backgroundImage, backgroundImageBase64, cardStyle });

        // PRIORITY ORDER: 
        // 1. backgroundImageBase64 (uploaded files)
        // 2. backgroundImage (if not gradient)
        // 3. cardStyle.backgroundImage
        // 4. No background (let gradient class handle it)

        if (backgroundImageBase64) {
            // Priority 1: Base64 uploaded image
            styles.push(`background-image: url('${backgroundImageBase64}')`);
            styles.push('background-size: cover');
            styles.push('background-position: center');
            console.log('✅ Using base64 background');
        } else if (backgroundImage && !backgroundImage.startsWith('bg-obsidian-')) {
            // Priority 2: Selected image asset (not gradient)
            let imageUrl;
            
            if (this.isWebAppAsset(backgroundImage)) {
                // Web app asset - reconstruct proper URL
                const filename = this.extractFilename(backgroundImage);
                imageUrl = `${this.baseUrl}/assets/backgrounds/${filename}`;
                console.log(`🔄 Converted web app asset: ${backgroundImage} → ${imageUrl}`);
            } else {
                // External URL or absolute path
                imageUrl = backgroundImage;
                console.log(`🌐 Using external URL: ${imageUrl}`);
            }
            
            styles.push(`background-image: url('${imageUrl}')`);
            styles.push('background-size: cover');
            styles.push('background-position: center');
            console.log('✅ Using image background:', imageUrl);
        } else if (cardStyle.backgroundImage && cardStyle.backgroundImage !== '') {
            // Priority 3: cardStyle background
            styles.push(`background-image: ${cardStyle.backgroundImage}`);
            if (!cardStyle.backgroundSize) styles.push('background-size: cover');
            if (!cardStyle.backgroundPosition) styles.push('background-position: center');
            console.log('✅ Using cardStyle background');
        } else {
            // Priority 4: No background (gradient class will handle)
            console.log('✅ No background image - using gradient class');
        }

        // Apply other cardStyle properties
        if (cardStyle.backgroundSize && !styles.some(s => s.includes('background-size'))) {
            styles.push(`background-size: ${cardStyle.backgroundSize}`);
        }
        if (cardStyle.backgroundPosition && !styles.some(s => s.includes('background-position'))) {
            styles.push(`background-position: ${cardStyle.backgroundPosition}`);
        }
        if (cardStyle.backgroundRepeat) styles.push(`background-repeat: ${cardStyle.backgroundRepeat}`);
        if (cardStyle.aspectRatio) styles.push(`aspect-ratio: ${cardStyle.aspectRatio}`);
        if (cardStyle.border) styles.push(`border: ${cardStyle.border}`);
        if (cardStyle.borderRadius) styles.push(`border-radius: ${cardStyle.borderRadius}`);

        const result = styles.length > 0 ? `style="${styles.join('; ')}"` : '';
        console.log('🎨 Generated styles:', result);
        return result;
    }

    /**
     * Generate card elements dynamically from cardData.elements array
     */
    generateDynamicCardElements(cardData) {
        const { 
            elements = [],
            template = 'classic',
            hiddenMessage = 'Surprise!'
        } = cardData;

        // If no elements provided, create basic template elements
        if (elements.length === 0) {
            return this.generateFallbackElements(cardData);
        }

        // Generate elements from the elements array
        let elementsHtml = '';
        
        elements.forEach((element, index) => {
            const elementHtml = this.generateSingleElement(element, index, cardData);
            if (elementHtml) {
                elementsHtml += elementHtml + '\n';
            }
        });

        return elementsHtml;
    }

    /**
     * Generate a single element with FIXED two-canvas scratch system
     */
    generateSingleElement(element, index, cardData) {
        const {
            id = `element-${index}`,
            type = 'text',
            content = '',
            innerHTML = '',
            position = {},
            style = {}
        } = element;

        // Build inline styles from position and style objects
        let inlineStyles = [];

        // Position styles
        if (position.left) inlineStyles.push(`left: ${position.left}`);
        if (position.top) inlineStyles.push(`top: ${position.top}`);
        if (position.width) inlineStyles.push(`width: ${position.width}`);
        if (position.height) inlineStyles.push(`height: ${position.height}`);

        // Element styles
        Object.keys(style).forEach(prop => {
            if (style[prop] && style[prop] !== 'initial' && style[prop] !== '') {
                const cssProp = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
                inlineStyles.push(`${cssProp}: ${style[prop]}`);
            }
        });

        // Ensure position absolute for all elements
        if (!inlineStyles.some(s => s.startsWith('position:'))) {
            inlineStyles.push('position: absolute');
        }

        const styleAttr = inlineStyles.length > 0 ? `style="${inlineStyles.join('; ')}"` : '';

        // Generate element based on type
        switch (type) {
            case 'sender':
            case 'sender-name':
                return `<div class="card-element sender-name" id="${id}" ${styleAttr}>
                    ${innerHTML || content || 'From Anonymous'}
                </div>`;

            case 'scratch':
            case 'scratch-area':
                const hiddenMsg = cardData.hiddenMessage || 'Surprise!';
                const scratchTextureUrl = this.getScratchTextureUrl(cardData);
                const canvasWidth = parseFloat(position.width) || 350;
                const canvasHeight = parseFloat(position.height) || 150;
                
                // ✅ FIXED TWO-CANVAS SYSTEM - Clean like Joe's version
                return `<div class="card-element scratch-area" id="${id}" ${styleAttr}>
                    <!-- Bottom canvas: Hidden message (transparent background) -->
                    <canvas class="message-canvas" width="${canvasWidth}" height="${canvasHeight}" 
                            style="position: absolute; top: 0; left: 0; z-index: 1;"></canvas>
                    
                    <!-- Top canvas: Scratch texture (JPEG drawn directly) -->
                    <canvas class="scratch-canvas" width="${canvasWidth}" height="${canvasHeight}"
                            style="position: absolute; top: 0; left: 0; z-index: 2; cursor: crosshair;"
                            data-texture-url="${scratchTextureUrl}"
                            data-hidden-message="${hiddenMsg}"></canvas>
                </div>`;

            case 'symbol':
            case 'card-symbol':
                let symbolContent = innerHTML || content;
                
                if (symbolContent.includes('<img')) {
                    // Already has image tag, keep as is
                } else if (symbolContent && (symbolContent.includes('data:image') || this.isWebAppAsset(symbolContent))) {
                    const imageSrc = this.isWebAppAsset(symbolContent) && !symbolContent.startsWith('data:') 
                        ? `${this.baseUrl}/assets/symbols/${symbolContent}`
                        : symbolContent;
                    symbolContent = `<img src="${imageSrc}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;" alt="Symbol">`;
                } else {
                    symbolContent = symbolContent || '❤️';
                }
                
                return `<div class="card-element card-symbol" id="${id}" ${styleAttr}>
                    ${symbolContent}
                </div>`;

            case 'text':
            case 'custom-text':
            default:
                return `<div class="card-element custom-element" id="${id}" ${styleAttr}>
                    ${innerHTML || content || 'Custom Element'}
                </div>`;
        }
    }

    /**
     * Get scratch texture URL - No CSS background nonsense
     */
    getScratchTextureUrl(cardData) {
        const { scratchTextureBase64, scratchTexture } = cardData;
        
        if (scratchTextureBase64) {
            return scratchTextureBase64;
        } else if (scratchTexture && !scratchTexture.includes('data:image/svg+xml')) {
            return this.isWebAppAsset(scratchTexture)
                ? `${this.baseUrl}/assets/scratchTextures/${scratchTexture}`
                : scratchTexture;
        }
        
        // Fallback to empty - will use gray fallback in JS
        return '';
    }

    /**
     * Fallback elements with proper asset handling
     */
    generateFallbackElements(cardData) {
        const { 
            senderName, 
            hiddenMessage, 
            symbol, 
            symbolBase64,
            scratchTexture,
            scratchTextureBase64,
            template = 'classic' 
        } = cardData;

        if (template === 'blank') {
            return '<!-- Blank template - no fallback elements -->';
        }

        // Classic template fallback
        let symbolContent = '';
        if (symbolBase64) {
            symbolContent = `<img src="${symbolBase64}" alt="Symbol" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">`;
        } else if (symbol && (symbol.includes('data:image') || this.isWebAppAsset(symbol))) {
            const symbolUrl = this.isWebAppAsset(symbol) && !symbol.startsWith('data:')
                ? `${this.baseUrl}/assets/symbols/${symbol}`
                : symbol;
            symbolContent = `<img src="${symbolUrl}" alt="Symbol" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">`;
        } else {
            symbolContent = symbol || '❤️';
        }

        const scratchTextureUrl = this.getScratchTextureUrl(cardData);

        return `
            <div class="card-element sender-name" id="senderName" 
                 style="position: absolute; top: 20px; left: 20px;">
                From ${senderName || 'Anonymous'}
            </div>
            
            <div class="card-element scratch-area" id="scratchArea" 
                 style="position: absolute; top: 45%; left: 16%; width: 350px; height: 150px;">
                <canvas class="message-canvas" width="350" height="150" 
                        style="position: absolute; top: 0; left: 0; z-index: 1;"></canvas>
                <canvas class="scratch-canvas" width="350" height="150"
                        style="position: absolute; top: 0; left: 0; z-index: 2; cursor: crosshair;"
                        data-texture-url="${scratchTextureUrl}"
                        data-hidden-message="${hiddenMessage || 'Surprise!'}"></canvas>
            </div>
            
            <div class="card-element card-symbol" id="cardSymbol" 
                 style="position: absolute; top: 20px; right: 20px; width: 80px; height: 80px;">
                ${symbolContent}
            </div>
        `;
    }

    /**
     * Generate CSS with MINIMAL scratch area styles (no blur conflicts)
     */
    generateWebAppCSS(cardData) {
        const { 
            backgroundImage, 
            backgroundImageBase64, 
            glowColor = '#667eea', 
            glowEffect = 30,
            cardStyle = {}
        } = cardData;
        
        return `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', sans-serif;
            background: linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%);
            min-height: 100vh;
            color: white;
            overflow-x: hidden;
        }

        .app-container {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }

        .header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 60px;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(20px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 24px;
            z-index: 1000;
            box-shadow: 0 2px 20px rgba(0, 0, 0, 0.5);
        }

        .logo-section {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .logo-icon {
            width: 36px;
            height: 36px;
            background: linear-gradient(45deg, #667eea, #764ba2);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 18px;
            box-shadow: 0 0 20px rgba(102, 126, 234, 0.5);
        }

        .logo-text {
            font-size: 24px;
            font-weight: 700;
            background: linear-gradient(45deg, #667eea, #764ba2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .header-info {
            color: rgba(255, 255, 255, 0.8);
            font-size: 14px;
            font-weight: 500;
        }

        .main-content {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 80px 20px 20px;
            position: relative;
        }

        .card-container {
            position: relative;
            max-width: 800px;
            width: 100%;
        }

        .card-preview {
            width: 100%;
            max-width: 600px;
            aspect-ratio: 1.6;
            margin: 0 auto;
            border-radius: 16px;
            position: relative;
            overflow: hidden;
            cursor: pointer;
            transition: all 0.5s ease;
            transform-style: preserve-3d;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            
            box-shadow: 
                0 0 ${glowEffect}px ${this.hexToRgba(glowColor, 0.9)},
                0 0 ${glowEffect * 2}px ${this.hexToRgba(glowColor, 0.6)},
                0 0 ${glowEffect * 3}px ${this.hexToRgba(glowColor, 0.3)},
                inset 0 0 ${glowEffect / 2}px rgba(255, 255, 255, 0.3),
                0 10px 30px rgba(0, 0, 0, 0.5);
            filter: drop-shadow(0 0 ${glowEffect}px ${this.hexToRgba(glowColor, 0.8)});
            position: relative;
            z-index: 10;
        }

        .card-preview:hover {
            transform: rotateY(5deg) rotateX(5deg);
            box-shadow: 
                0 0 ${glowEffect * 1.5}px ${this.hexToRgba(glowColor, 1)},
                0 0 ${glowEffect * 3}px ${this.hexToRgba(glowColor, 0.8)},
                0 0 ${glowEffect * 4}px ${this.hexToRgba(glowColor, 0.4)},
                0 20px 50px rgba(0, 0, 0, 0.7);
        }

        /* GRADIENT BACKGROUNDS */
        .bg-obsidian-rose {
            background: linear-gradient(45deg, rgba(255, 154, 158, 0.3) 0%, rgba(254, 207, 239, 0.3) 50%, rgba(0, 0, 0, 0.8) 100%) !important;
        }

        .bg-obsidian-ocean {
            background: linear-gradient(45deg, rgba(168, 237, 234, 0.3) 0%, rgba(254, 214, 227, 0.3) 50%, rgba(0, 0, 0, 0.8) 100%) !important;
        }

        .bg-obsidian-galaxy {
            background: linear-gradient(45deg, rgba(210, 153, 194, 0.3) 0%, rgba(254, 249, 215, 0.3) 50%, rgba(0, 0, 0, 0.8) 100%) !important;
        }

        .bg-obsidian-gold {
            background: linear-gradient(45deg, rgba(246, 211, 101, 0.3) 0%, rgba(253, 160, 133, 0.3) 50%, rgba(0, 0, 0, 0.8) 100%) !important;
        }

        .bg-obsidian-sunset {
            background: linear-gradient(45deg, rgba(255, 138, 128, 0.3) 0%, rgba(255, 128, 171, 0.3) 50%, rgba(0, 0, 0, 0.8) 100%) !important;
        }

        .bg-obsidian-emerald {
            background: linear-gradient(45deg, rgba(132, 250, 176, 0.3) 0%, rgba(143, 211, 244, 0.3) 50%, rgba(0, 0, 0, 0.8) 100%) !important;
        }

        /* CARD ELEMENTS */
        .card-element {
            position: absolute;
            cursor: move;
            user-select: none;
            transition: all 0.3s ease;
        }

        .card-element:hover {
    transform: scale(1.05);
    filter: brightness(1.2);
}

/* Override hover effects for scratch areas */
.scratch-area:hover {
    transform: none;
    filter: none;
}
        }

        .sender-name {
            color: white;
            font-weight: 600;
            font-size: 18px;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
            padding: 12px 16px;
            background: rgba(0, 0, 0, 0.4);
            border-radius: 12px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        /* ✅ FIXED SCRATCH AREA STYLES - Minimal like Joe's version */
        .scratch-area {
            position: relative;
            display: inline-block;
            border-radius: 12px;
            overflow: hidden;
            cursor: crosshair;
            /* ❌ NO background, NO backdrop-filter, NO blur */
       
        /* ✅ CANVAS STYLES - Simple and clean */
        .message-canvas,
        .scratch-canvas {
            position: absolute;
            top: 0;
            left: 0;
            border-radius: 8px;
            display: block;
        }

        .message-canvas {
            z-index: 1;
        }

        .scratch-canvas {
            z-index: 2;
            cursor: crosshair;
        }

        /* ❌ HIDE HTML overlay text - text is now drawn on canvas */
        .scratch-area p {
            display: none !important;
        }

        /* ❌ HIDE broken hidden-message div */
        .hidden-message {
            display: none !important;
        }

        .card-symbol {
            font-size: 48px;
            opacity: 0.9;
            color: white;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 12px;
            backdrop-filter: blur(5px);
        }

        .card-symbol:hover {
            opacity: 1;
            transform: scale(1.1) rotate(5deg);
        }

        .card-symbol img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 8px;
            filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
        }

        .custom-element {
            color: white;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
            background: rgba(0, 0, 0, 0.3);
            border-radius: 8px;
            padding: 8px 12px;
            backdrop-filter: blur(5px);
        }

        /* FLOATING ANIMATION */
        @keyframes floating {
            0%, 100% {
                transform: translateY(0px);
            }
            50% {
                transform: translateY(-10px);
            }
        }

        .floating {
            animation: floating 3s ease-in-out infinite;
        }

        /* RESPONSIVE DESIGN */
        @media (max-width: 768px) {
            .main-content {
                padding: 80px 10px 20px;
            }
            
            .card-preview {
                max-width: 100%;
            }
            
            .sender-name {
                font-size: 16px;
                padding: 10px 14px;
            }
            
            .card-symbol {
                font-size: 36px;
            }
        }
        `;
    }

    /**
     * Generate audio sources with proper asset handling
     */
    generateAudioSources(cardData) {
        const { soundEffect, soundEffectBase64 } = cardData;
        
        if (soundEffectBase64) {
            return `<source src="${soundEffectBase64}" type="audio/mpeg">`;
        } else if (soundEffect && soundEffect !== '#beep') {
            let audioUrl;
            if (this.isWebAppAsset(soundEffect)) {
                const filename = this.extractFilename(soundEffect);
                audioUrl = `${this.baseUrl}/assets/audio/${filename}`;
            } else {
                audioUrl = soundEffect;
            }
            return `<source src="${audioUrl}" type="audio/mpeg">`;
        }
        
        return '<!-- No custom audio - will use Web Audio API beep -->';
    }

    /**
     * HYBRID SCRATCH SYSTEM - Joe's simple logic + Your dynamic assets
     */
    generateWebAppJavaScript(cardData) {
        const { 
            hiddenMessage = 'Surprise!', 
            animation = 'hearts',
            glowColor = '#667eea',
            smokeEffect = false,
            elements = []
        } = cardData;

        return `
        // HYBRID SCRATCH SYSTEM - Simple Logic + Dynamic Assets
        console.log('🎯 Initializing Hybrid Scratch System...');
        
        let isScratching = false;
        let scratchedPixels = 0;
        const brushRadius = 20;

        // Initialize scratch areas when DOM is ready
        function initializeScratchAreas() {
            const scratchAreas = document.querySelectorAll('.scratch-area');
            
            scratchAreas.forEach((scratchArea, index) => {
                const messageCanvas = scratchArea.querySelector('.message-canvas');
                const scratchCanvas = scratchArea.querySelector('.scratch-canvas');
                
                if (messageCanvas && scratchCanvas) {
                    const messageCtx = messageCanvas.getContext('2d');
                    const scratchCtx = scratchCanvas.getContext('2d');
                    
                    // Get dynamic data from HTML attributes
                    const textureUrl = scratchCanvas.dataset.textureUrl || '';
                    const hiddenMsg = scratchCanvas.dataset.hiddenMessage || 'Surprise!';
                    
                    console.log(\`✅ Processing scratch area \${index + 1}:\`);
                    console.log('- Texture URL:', textureUrl);
                    console.log('- Hidden message:', hiddenMsg);
                    
                    // Draw message canvas (bottom layer) - SIMPLE VERSION
                    drawMessage(messageCtx, messageCanvas, hiddenMsg);
                    
                    // Draw scratch canvas (top layer) - DYNAMIC VERSION  
                    drawScratchLayer(scratchCtx, scratchCanvas, textureUrl);
                    
                    // Setup events - SIMPLE VERSION
                    setupScratchEvents(scratchCanvas, scratchCtx);
                }
            });
        }

        // ✅ SIMPLE: Draw hidden message on bottom canvas
        function drawMessage(messageCtx, messageCanvas, message) {
            messageCtx.clearRect(0, 0, messageCanvas.width, messageCanvas.height);
            messageCtx.font = 'bold 24px Arial, sans-serif';
            messageCtx.fillStyle = '#ffffff';
            messageCtx.strokeStyle = '#000000';
            messageCtx.lineWidth = 2;
            messageCtx.textAlign = 'center';
            messageCtx.textBaseline = 'middle';
            
            const centerX = messageCanvas.width / 2;
            const centerY = messageCanvas.height / 2;
            
            // Draw with stroke for better visibility
            messageCtx.strokeText(message, centerX, centerY);
            messageCtx.fillText(message, centerX, centerY);
            
            console.log('✅ Message drawn:', message);
        }

        // ✅ DYNAMIC: Draw scratch layer with web app assets
        // ✅ REPLACE the drawScratchLayer function with this exact code:
function drawScratchLayer(scratchCtx, scratchCanvas, textureUrl) {
    if (textureUrl && textureUrl !== '' && !textureUrl.includes('data:image/svg+xml')) {
        const scratchTexture = new Image();
        scratchTexture.crossOrigin = 'anonymous';
        
        scratchTexture.onload = () => {
            // Clear canvas
            scratchCtx.clearRect(0, 0, scratchCanvas.width, scratchCanvas.height);
            
            // Calculate cover scaling (like CSS background-size: cover)
            const canvasRatio = scratchCanvas.width / scratchCanvas.height;
            const imageRatio = scratchTexture.naturalWidth / scratchTexture.naturalHeight;
            
            let scale;
            if (imageRatio > canvasRatio) {
                // Image is wider - scale to fit height
                scale = scratchCanvas.height / scratchTexture.naturalHeight;
            } else {
                // Image is taller - scale to fit width
                scale = scratchCanvas.width / scratchTexture.naturalWidth;
            }
            
            const scaledWidth = scratchTexture.naturalWidth * scale;
            const scaledHeight = scratchTexture.naturalHeight * scale;
            const offsetX = (scratchCanvas.width - scaledWidth) / 2;
            const offsetY = (scratchCanvas.height - scaledHeight) / 2;
            
            // Draw image with cover behavior
            scratchCtx.drawImage(scratchTexture, offsetX, offsetY, scaledWidth, scaledHeight);
            
            // Add text overlay
            scratchCtx.font = 'bold 18px Arial, sans-serif';
            scratchCtx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            scratchCtx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            scratchCtx.lineWidth = 2;
            scratchCtx.textAlign = 'center';
            scratchCtx.textBaseline = 'middle';
            scratchCtx.strokeText('Scratch here!', scratchCanvas.width / 2, scratchCanvas.height / 2);
            scratchCtx.fillText('Scratch here!', scratchCanvas.width / 2, scratchCanvas.height / 2);
        };
        
        scratchTexture.onerror = () => {
            drawFallbackScratchSurface(scratchCtx, scratchCanvas);
        };
        
        scratchTexture.src = textureUrl;
    } else {
        drawFallbackScratchSurface(scratchCtx, scratchCanvas);
    }
}

        // ✅ FALLBACK: Simple metallic surface (like Joe's error handler)
        function drawFallbackScratchSurface(scratchCtx, scratchCanvas) {
            // Clear canvas
            scratchCtx.clearRect(0, 0, scratchCanvas.width, scratchCanvas.height);
            
            // Simple gray background
            scratchCtx.fillStyle = '#c0c0c0';
            scratchCtx.fillRect(0, 0, scratchCanvas.width, scratchCanvas.height);
            
            // Add texture dots
            scratchCtx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            for (let i = 0; i < 50; i++) {
                scratchCtx.beginPath();
                scratchCtx.arc(
                    Math.random() * scratchCanvas.width,
                    Math.random() * scratchCanvas.height,
                    Math.random() * 3 + 1,
                    0,
                    Math.PI * 2
                );
                scratchCtx.fill();
            }
            
            // Add dashed border (like Joe's version)
            scratchCtx.strokeStyle = '#000';
            scratchCtx.lineWidth = 2;
            scratchCtx.setLineDash([5, 5]);
            scratchCtx.strokeRect(0, 0, scratchCanvas.width, scratchCanvas.height);
            scratchCtx.setLineDash([]);
            
            // Add text
            scratchCtx.font = 'bold 18px Arial, sans-serif';
            scratchCtx.fillStyle = '#000';
            scratchCtx.textAlign = 'center';
            scratchCtx.textBaseline = 'middle';
            scratchCtx.fillText('Scratch Me!', scratchCanvas.width / 2, scratchCanvas.height / 2);
            
            console.log('⚠️ Fallback scratch surface drawn');
        }

        // ✅ SIMPLE: Event setup (exactly like Joe's version)
        function setupScratchEvents(scratchCanvas, scratchCtx) {
            // Mouse events
            scratchCanvas.addEventListener('mousedown', (e) => {
                e.preventDefault();
                isScratching = true;
                scratch(e, scratchCtx, scratchCanvas);
            });
            
            scratchCanvas.addEventListener('mouseup', (e) => {
                e.preventDefault();
                isScratching = false;
            });
            
            scratchCanvas.addEventListener('mouseleave', () => {
                isScratching = false;
            });
            
            scratchCanvas.addEventListener('mousemove', (e) => {
                scratch(e, scratchCtx, scratchCanvas);
            });
            
            // Touch events
            scratchCanvas.addEventListener('touchstart', (e) => {
                e.preventDefault();
                isScratching = true;
                const touch = e.touches[0];
                scratch(touch, scratchCtx, scratchCanvas);
            });
            
            scratchCanvas.addEventListener('touchend', (e) => {
                e.preventDefault();
                isScratching = false;
            });
            
            scratchCanvas.addEventListener('touchmove', (e) => {
                e.preventDefault();
                const touch = e.touches[0];
                scratch(touch, scratchCtx, scratchCanvas);
            });
        }

        // ✅ SIMPLE: Scratch function (exactly like Joe's version)
        function scratch(event, scratchCtx, scratchCanvas) {
            if (!isScratching) return;
            
            // Convert mouse/touch position to canvas coordinates
            const rect = scratchCanvas.getBoundingClientRect();
            const scaleX = scratchCanvas.width / rect.width;
            const scaleY = scratchCanvas.height / rect.height;
            const x = (event.clientX - rect.left) * scaleX;
            const y = (event.clientY - rect.top) * scaleY;
            
            // Use destination-out to create transparency (Joe's method)
            scratchCtx.globalCompositeOperation = 'destination-out';
            scratchCtx.beginPath();
            scratchCtx.arc(x, y, brushRadius, 0, Math.PI * 2);
            scratchCtx.fillStyle = 'rgba(0, 0, 0, 1)';
            scratchCtx.fill();
            
            // Track scratched area for reveal threshold
            const scratchedArea = Math.PI * brushRadius * brushRadius;
            scratchedPixels += scratchedArea;
            
            // Check if we should reveal completely
            const totalPixels = scratchCanvas.width * scratchCanvas.height;
            const scratchPercentage = (scratchedPixels / totalPixels) * 100;
            
            if (scratchPercentage > 60) {
                // Complete reveal - clear entire scratch canvas
                scratchCtx.clearRect(0, 0, scratchCanvas.width, scratchCanvas.height);
                console.log('🎉 Scratch area completely revealed!');
                
                // Reset for potential multiple scratch areas
                scratchedPixels = 0;
            }
        }

        // Initialize when DOM loads
        document.addEventListener('DOMContentLoaded', () => {
            console.log('🎯 Starting Hybrid Scratch System...');
            setTimeout(() => {
                initializeScratchAreas();
                console.log('✅ Hybrid Scratch System initialized!');
            }, 100);
        });

        console.log('✅ Hybrid Scratch System Script Loaded!');
        `;
    }

    /**
     * Helper function to convert hex to rgba
     */
    hexToRgba(hex, alpha) {
        const result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex);
        if (result) {
            const r = parseInt(result[1], 16);
            const g = parseInt(result[2], 16);
            const b = parseInt(result[3], 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }
        return `rgba(102, 126, 234, ${alpha})`;
    }
}

// Export the advanced generator
module.exports = new AdvancedCardGenerator();
