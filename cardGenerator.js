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
            deliveryAnimation,
            scratchTexture,
            soundEffect,
            aiVoice,
            // Advanced features
            backgroundImageBase64,
            symbolBase64,
            scratchTextureBase64,
            soundEffectBase64,
            aiVoiceBase64,
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

        <!-- AI Voice element -->
        <audio id="aiVoice" preload="auto">
            ${this.generateAIVoiceSources(cardData)}
        </audio>
        
        <!-- Animation Containers -->
        <div id="animationContainer" class="animation-container"></div>
        <div id="particleContainer"></div>
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
    /**
 * Generate CSS with MINIMAL scratch area styles (no blur conflicts)
 * FIXED: Now matches HTML preview dimensions exactly
 */
/**
 * Generate CSS with MINIMAL scratch area styles (no blur conflicts)
 * FIXED: Now matches HTML preview dimensions exactly
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
        max-width: 600px;
        max-height: 400px;
        padding: 40px;
        width: 100%;
        background: rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(20px);
        border-radius: 20px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .card-preview {
        width: 100%;
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
    }

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
        
        .card-container {
            max-width: 100%;
            padding: 20px;
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
     * Generate AI voice sources with proper asset handling
     */
    generateAIVoiceSources(cardData) {
        const { aiVoice, aiVoiceBase64 } = cardData;
        
        if (aiVoiceBase64) {
            return `<source src="${aiVoiceBase64}" type="audio/mpeg">`;
        } else if (aiVoice && aiVoice !== '#beep') {
            let voiceUrl;
            if (this.isWebAppAsset(aiVoice)) {
                const filename = this.extractFilename(aiVoice);
                voiceUrl = `${this.baseUrl}/assets/aiVoices/${filename}`;
            } else {
                voiceUrl = aiVoice;
            }
            return `<source src="${voiceUrl}" type="audio/mpeg">`;
        }
        
        return '<!-- No AI voice selected -->';
    }

    /**
     * HYBRID SCRATCH SYSTEM - Joe's simple logic + Your dynamic assets
     */
    /**
     * HYBRID SCRATCH SYSTEM - Joe's simple logic + Your dynamic assets
     */
    /**
     * HYBRID SCRATCH SYSTEM - Joe's simple logic + Your dynamic assets
     */
     /**
     * HYBRID SCRATCH SYSTEM - Joe's simple logic + Your dynamic assets
     */
    generateWebAppJavaScript(cardData) {
    const { 
        hiddenMessage = 'Surprise!', 
        animation = 'heart-fireworks',
        glowColor = '#667eea',
        smokeEffect = false,
        elements = [],
        soundEffect,
        soundEffectBase64
    } = cardData;

    // Generate the audio URL logic inline
    let audioUrlFunction;
    if (soundEffectBase64) {
        audioUrlFunction = `return '${soundEffectBase64}';`;
    } else if (soundEffect && soundEffect !== '#beep') {
        if (this.isWebAppAsset(soundEffect)) {
            const filename = this.extractFilename(soundEffect);
            audioUrlFunction = `return '${this.baseUrl}/assets/audio/${filename}';`;
        } else {
            audioUrlFunction = `return '${soundEffect}';`;
        }
    } else {
        audioUrlFunction = 'return null; // No audio selected';
    }

    return `
    // HYBRID SCRATCH SYSTEM WITH AUDIO INTEGRATION - Complete Version
    console.log('🎯 Initializing Hybrid Scratch System with Audio...');
    
    let isScratching = false;
    let scratchedPixels = 0;
    const brushRadius = 20;
    
    // Scratch audio integration variables
    let scratchAudio = null;
    let isScratchSoundPlaying = false;

    // Get audio URL for scratch integration
    function getScratchAudioUrl() {
        ${audioUrlFunction}
    }

    // Initialize scratch audio system
    function initializeScratchAudio() {
        const audioUrl = getScratchAudioUrl();
        if (!audioUrl) return null;
        
        if (scratchAudio) {
            scratchAudio.pause();
            scratchAudio = null;
        }
        
        scratchAudio = new Audio(audioUrl);
        scratchAudio.loop = false;
        scratchAudio.volume = 1.0;
        
        // Key logic: Auto-restart if still scratching when audio ends
        scratchAudio.addEventListener('ended', () => {
            isScratchSoundPlaying = false;
            console.log('Scratch audio finished playing naturally.');
            if (isScratching && audioUrl) {
                playScratchSound(); // Auto-restart if still scratching
            }
        });
        
        return scratchAudio;
    }

    // Play scratch sound
    function playScratchSound() {
    const audioUrl = getScratchAudioUrl();
    if (!audioUrl) return;
    
    // ✅ ONLY start if audio is completely stopped/finished
    if (!isScratchSoundPlaying && (!scratchAudio || scratchAudio.paused || scratchAudio.ended)) {
        if (!scratchAudio) {
            initializeScratchAudio();
        }
        
        isScratchSoundPlaying = true;
        scratchAudio.currentTime = 0;  // Only reset if we're starting fresh
        scratchAudio.play().catch(err => console.log('Scratch sound play error:', err));
        console.log('🎵 Scratch audio started');
    } else {
        console.log('🎵 Audio already playing - ignoring trigger');
    }
}

    // Stop scratch sound
    function stopScratchSound() {
    isScratching = false;
    isScratchSoundPlaying = false;  // Just set the flag
    console.log('🎵 Scratch audio will finish naturally');
    // DON'T pause or reset - let it play to completion
}

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
                
                // Setup events with audio
                setupScratchEvents(scratchCanvas, scratchCtx);
            }
        });
    }

    // Draw message with text wrapping
    function drawMessage(messageCtx, messageCanvas, message) {
        messageCtx.clearRect(0, 0, messageCanvas.width, messageCanvas.height);
        
        const baseFontSize = Math.min(messageCanvas.width / 20, messageCanvas.height / 8);
        const minFontSize = 14;
        const maxFontSize = 32;
        const dynamicFontSize = Math.max(minFontSize, Math.min(maxFontSize, baseFontSize));
        
        const senderElement = document.getElementById('senderName') || document.querySelector('.sender-name');
        let fontFamily = 'Inter, sans-serif';
        let fontWeight = '600';
        let textColor = '#ffffff';
        let useStroke = true;
        
        if (senderElement) {
            const computedStyle = window.getComputedStyle(senderElement);
            fontFamily = computedStyle.fontFamily || fontFamily;
            fontWeight = computedStyle.fontWeight || fontWeight;
            textColor = computedStyle.color || textColor;
            
            const textShadow = computedStyle.textShadow;
            useStroke = textShadow && textShadow !== 'none';
        }
        
        const finalFontSize = dynamicFontSize;
        messageCtx.font = fontWeight + ' ' + finalFontSize + 'px ' + fontFamily;
        messageCtx.fillStyle = textColor;
        messageCtx.textAlign = 'center';
        messageCtx.textBaseline = 'middle';
        
        if (useStroke) {
            messageCtx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
            messageCtx.lineWidth = Math.max(1, finalFontSize / 12);
        }
        
        const lineHeight = finalFontSize * 1.3;
        const horizontalPadding = messageCanvas.width * 0.08;
        const verticalPadding = messageCanvas.height * 0.1;
        const maxWidth = messageCanvas.width - (horizontalPadding * 2);
        const maxHeight = messageCanvas.height - (verticalPadding * 2);
        
        const words = message.split(' ');
        const lines = [];
        let currentLine = words[0] || '';
        
        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const testLine = currentLine + ' ' + word;
            const metrics = messageCtx.measureText(testLine);
            
            if (metrics.width > maxWidth && currentLine.length > 0) {
                lines.push(currentLine);
                currentLine = word;
            } else if (messageCtx.measureText(word).width > maxWidth) {
                lines.push(currentLine);
                const brokenWords = breakLongWord(messageCtx, word, maxWidth);
                lines.push(...brokenWords.slice(0, -1));
                currentLine = brokenWords[brokenWords.length - 1];
            } else {
                currentLine = testLine;
            }
        }
        
        if (currentLine.length > 0) {
            lines.push(currentLine);
        }
        
        let scaledFontSize = finalFontSize;
        let scaledLineHeight = lineHeight;
        const totalTextHeight = lines.length * scaledLineHeight;
        
        if (totalTextHeight > maxHeight && lines.length > 1) {
            const scaleFactor = maxHeight / totalTextHeight;
            scaledFontSize = Math.max(minFontSize, finalFontSize * scaleFactor * 0.9);
            scaledLineHeight = scaledFontSize * 1.3;
            
            messageCtx.font = fontWeight + ' ' + scaledFontSize + 'px ' + fontFamily;
            if (useStroke) {
                messageCtx.lineWidth = Math.max(1, scaledFontSize / 12);
            }
        }
        
        const finalTextHeight = lines.length * scaledLineHeight;
        const startY = (messageCanvas.height - finalTextHeight) / 2 + scaledLineHeight / 2;
        const centerX = messageCanvas.width / 2;
        
        lines.forEach((line, index) => {
            const yPos = startY + (index * scaledLineHeight);
            
            if (useStroke && messageCtx.lineWidth > 0) {
                messageCtx.strokeText(line, centerX, yPos);
            }
            
            messageCtx.fillText(line, centerX, yPos);
        });
        
        console.log('✅ Dynamic Text Wrapper Applied:');
        console.log('- Canvas: ' + messageCanvas.width + 'x' + messageCanvas.height);
        console.log('- Font Size: ' + scaledFontSize + 'px (scaled from ' + finalFontSize + 'px)');
        console.log('- Lines: ' + lines.length);
        console.log('- Text Height: ' + finalTextHeight + 'px (max: ' + maxHeight + 'px)');
        console.log('- Max Width: ' + maxWidth + 'px');
    }

    function breakLongWord(ctx, word, maxWidth) {
        const parts = [];
        let currentPart = '';
        
        for (let i = 0; i < word.length; i++) {
            const testPart = currentPart + word[i];
            if (ctx.measureText(testPart).width > maxWidth && currentPart.length > 0) {
                parts.push(currentPart);
                currentPart = word[i];
            } else {
                currentPart = testPart;
            }
        }
        
        if (currentPart.length > 0) {
            parts.push(currentPart);
        }
        
        return parts.length > 0 ? parts : [word];
    }

    // Draw scratch layer function
    function drawScratchLayer(scratchCtx, scratchCanvas, textureUrl) {
        if (textureUrl && textureUrl !== '' && !textureUrl.includes('data:image/svg+xml')) {
            const scratchTexture = new Image();
            scratchTexture.crossOrigin = 'anonymous';
            
            scratchTexture.onload = () => {
                scratchCtx.clearRect(0, 0, scratchCanvas.width, scratchCanvas.height);
                
                const canvasRatio = scratchCanvas.width / scratchCanvas.height;
                const imageRatio = scratchTexture.naturalWidth / scratchTexture.naturalHeight;
                
                let scale;
                if (imageRatio > canvasRatio) {
                    scale = scratchCanvas.height / scratchTexture.naturalHeight;
                } else {
                    scale = scratchCanvas.width / scratchTexture.naturalWidth;
                }
                
                const scaledWidth = scratchTexture.naturalWidth * scale;
                const scaledHeight = scratchTexture.naturalHeight * scale;
                const offsetX = (scratchCanvas.width - scaledWidth) / 2;
                const offsetY = (scratchCanvas.height - scaledHeight) / 2;
                
                scratchCtx.drawImage(scratchTexture, offsetX, offsetY, scaledWidth, scaledHeight);
                
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

    // Fallback scratch surface
    function drawFallbackScratchSurface(scratchCtx, scratchCanvas) {
        scratchCtx.clearRect(0, 0, scratchCanvas.width, scratchCanvas.height);
        
        scratchCtx.fillStyle = '#c0c0c0';
        scratchCtx.fillRect(0, 0, scratchCanvas.width, scratchCanvas.height);
        
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
        
        scratchCtx.strokeStyle = '#000';
        scratchCtx.lineWidth = 2;
        scratchCtx.setLineDash([5, 5]);
        scratchCtx.strokeRect(0, 0, scratchCanvas.width, scratchCanvas.height);
        scratchCtx.setLineDash([]);
        
        scratchCtx.font = 'bold 18px Arial, sans-serif';
        scratchCtx.fillStyle = '#000';
        scratchCtx.textAlign = 'center';
        scratchCtx.textBaseline = 'middle';
        scratchCtx.fillText('Scratch Me!', scratchCanvas.width / 2, scratchCanvas.height / 2);
        
        console.log('⚠️ Fallback scratch surface drawn');
    }

    // Event setup with audio integration and delivery animation start
    function setupScratchEvents(scratchCanvas, scratchCtx) {
        // Mouse events
        scratchCanvas.addEventListener('mousedown', (e) => {
            e.preventDefault();
            isScratching = true;
            playScratchSound();
            startDeliveryAnimation();
            scratch(e, scratchCtx, scratchCanvas);
        });
        
        scratchCanvas.addEventListener('mouseup', (e) => {
            e.preventDefault();
            stopScratchSound();
        });
        
        scratchCanvas.addEventListener('mouseleave', () => {
            stopScratchSound();
        });
        
        scratchCanvas.addEventListener('mousemove', (e) => {
            scratch(e, scratchCtx, scratchCanvas);
        });
        
        // Touch events
        scratchCanvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            isScratching = true;
            playScratchSound();
            startDeliveryAnimation();
            const touch = e.touches[0];
            scratch(touch, scratchCtx, scratchCanvas);
        });
        
        scratchCanvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            stopScratchSound();
        });
        
        scratchCanvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            scratch(touch, scratchCtx, scratchCanvas);
        });
    }

    // Scratch function
    function scratch(event, scratchCtx, scratchCanvas) {
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
    }

    // Delivery animation classes
    class HeartFireworksSystem {
        constructor() {
            this.canvas = null;
            this.ctx = null;
            this.particles = [];
            this.emojiParticles = [];
            this.isRunning = false;
            this.animationId = null;
            this.launchInterval = null;
        }
        initialize() {
            if (this.canvas) return;
            this.canvas = document.createElement('canvas');
            this.ctx = this.canvas.getContext('2d');
            this.canvas.style.cssText = \`position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; pointer-events: none; z-index: 999; background: transparent;\`;
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            document.body.appendChild(this.canvas);
            window.addEventListener('resize', () => {
                if (this.canvas) {
                    this.canvas.width = window.innerWidth;
                    this.canvas.height = window.innerHeight;
                }
            });
        }
        launchFirework() {
            const launchX = Math.random() * this.canvas.width;
            const targetY = Math.random() * (this.canvas.height / 3) + 50;
            const trailParticle = new HeartFireworksParticle(launchX, this.canvas.height, launchX, targetY, '#ff69b4');
            this.particles.push(trailParticle);
        }
        update() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.particles = this.particles.filter(p => !p.exploded);
            this.emojiParticles = this.emojiParticles.filter(p => p.lifespan > 0);
            this.particles.forEach(p => p.update(this));
            this.emojiParticles.forEach(p => p.update());
            if (this.particles.length === 0 && this.emojiParticles.length === 0) {
                if (isScratching) {
                    this.launchFirework();
                } else {
                    this.stop();
                    return;
                }
            }
            this.animationId = requestAnimationFrame(() => this.update());
        }
        start() {
            this.initialize();
            this.isRunning = true;
            this.launchInterval = setInterval(() => this.launchFirework(), 300);
            this.update();
            console.log('🎆 Heart fireworks started');
        }
        stop() {
            this.isRunning = false;
            if (this.animationId) cancelAnimationFrame(this.animationId);
            if (this.launchInterval) clearInterval(this.launchInterval);
            if (this.canvas) this.canvas.remove();
            this.emojiParticles.forEach(p => p.destroy());
            this.canvas = null;
            this.particles = [];
            this.emojiParticles = [];
            console.log('⛔ Heart fireworks stopped');
        }
    }

    class HeartFireworksParticle {
        constructor(startX, startY, targetX, targetY, color) {
            this.x = startX;
            this.y = startY;
            this.targetX = targetX;
            this.targetY = targetY;
            this.color = color;
            this.speed = 5 + Math.random() * 3;
            this.angle = Math.atan2(targetY - startY, targetX - startX);
            this.vx = Math.cos(this.angle) * this.speed;
            this.vy = Math.sin(this.angle) * this.speed;
            this.gravity = 0.05;
            this.friction = 0.99;
            this.exploded = false;
            this.trail = [];
        }
        update(system) {
            this.trail.push({ x: this.x, y: this.y });
            if (this.trail.length > 10) this.trail.shift();
            this.vx *= this.friction;
            this.vy *= this.friction;
            this.vy += this.gravity;
            this.x += this.vx;
            this.y += this.vy;
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;
            if (Math.sqrt(dx * dx + dy * dy) < 5) {
                this.explode(system);
            }
            system.ctx.beginPath();
            system.ctx.moveTo(this.trail[0]?.x || this.x, this.trail[0]?.y || this.y);
            this.trail.forEach(point => system.ctx.lineTo(point.x, point.y));
            system.ctx.lineTo(this.x, this.y);
            system.ctx.strokeStyle = this.color;
            system.ctx.lineWidth = 2;
            system.ctx.stroke();
        }
        explode(system) {
            this.exploded = true;
            const heartPoints = system.createHeartShape(this.x, this.y, 1 + Math.random() * 1.5);
            heartPoints.forEach(point => {
                const emoji = new HeartFireworksEmojiParticle(point.x, point.y, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4 - 2, '❤️', 100 + Math.random() * 50);
                system.emojiParticles.push(emoji);
            });
        }
    }

    class HeartFireworksEmojiParticle {
        constructor(x, y, vx, vy, emoji, lifespan) {
            this.x = x;
            this.y = y;
            this.vx = vx;
            this.vy = vy;
            this.emoji = emoji;
            this.lifespan = lifespan;
            this.gravity = 0.1;
            this.friction = 0.98;
            this.rotation = 0;
            this.rotationSpeed = (Math.random() - 0.5) * 0.1;
            this.scale = 1 + Math.random() * 0.5;
            this.element = null;
            this.createElement();
        }
        createElement() {
            this.element = document.createElement('div');
            this.element.textContent = this.emoji;
            this.element.style.position = 'fixed';
            this.element.style.pointerEvents = 'none';
            this.element.style.zIndex = '9999';
            this.element.style.fontSize = '20px';
            document.body.appendChild(this.element);
        }
        update() {
            this.vx *= this.friction;
            this.vy *= this.friction;
            this.vy += this.gravity;
            this.x += this.vx;
            this.y += this.vy;
            this.rotation += this.rotationSpeed;
            this.lifespan--;
            if (this.element) {
                this.element.style.left = \`\${this.x}px\`;
                this.element.style.top = \`\${this.y}px\`;
                this.element.style.transform = \`rotate(\${this.rotation}rad) scale(\${this.scale})\`;
                this.element.style.opacity = this.lifespan / 150;
            }
        }
        destroy() {
            if (this.element) this.element.remove();
        }
    }

    class CorporateConfettiSystem {
        constructor() {
            this.canvas = null;
            this.ctx = null;
            this.particles = [];
            this.isRunning = false;
            this.animationId = null;
        }
        initialize() {
            if (this.canvas) return;
            this.canvas = document.createElement('canvas');
            this.ctx = this.canvas.getContext('2d');
            this.canvas.style.cssText = \`position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; pointer-events: none; z-index: 999; background: transparent;\`;
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            document.body.appendChild(this.canvas);
            window.addEventListener('resize', () => {
                if (this.canvas) {
                    this.canvas.width = window.innerWidth;
                    this.canvas.height = window.innerHeight;
                }
            });
        }
        createParticles() {
            const colors = ['#4a90e2', '#50c878', '#f5a623', '#d0021b', '#bd10e0'];
            const shapes = ['square', 'circle', 'triangle'];
            for (let i = 0; i < 200; i++) {
                const p = {
                    x: Math.random() * this.canvas.width,
                    y: Math.random() * this.canvas.height - this.canvas.height,
                    size: Math.random() * 8 + 4,
                    speedX: (Math.random() - 0.5) * 4,
                    speedY: Math.random() * 3 + 2,
                    rotation: Math.random() * Math.PI * 2,
                    rotationSpeed: (Math.random() - 0.5) * 0.1,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    shape: shapes[Math.floor(Math.random() * shapes.length)],
                    gravity: 0.05,
                    friction: 0.99,
                    alpha: 1
                };
                this.particles.push(p);
            }
        }
        update() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.particles.forEach((p, index) => {
                p.speedX *= p.friction;
                p.speedY += p.gravity;
                p.speedY *= p.friction;
                p.x += p.speedX;
                p.y += p.speedY;
                p.rotation += p.rotationSpeed;
                p.alpha -= 0.002;
                if (p.alpha <= 0 || p.y > this.canvas.height) {
                    this.particles.splice(index, 1);
                    return;
                }
                this.ctx.save();
                this.ctx.translate(p.x, p.y);
                this.ctx.rotate(p.rotation);
                this.ctx.globalAlpha = p.alpha;
                this.ctx.fillStyle = p.color;
                const halfSize = p.size / 2;
                if (p.shape === 'square') {
                    this.ctx.fillRect(-halfSize, -halfSize, p.size, p.size);
                } else if (p.shape === 'circle') {
                    this.ctx.beginPath();
                    this.ctx.arc(0, 0, halfSize, 0, Math.PI * 2);
                    this.ctx.fill();
                } else if (p.shape === 'triangle') {
                    this.ctx.beginPath();
                    this.ctx.moveTo(0, -halfSize);
                    this.ctx.lineTo(-halfSize, halfSize);
                    this.ctx.lineTo(halfSize, halfSize);
                    this.ctx.closePath();
                    this.ctx.fill();
                }
                this.ctx.restore();
            });
            if (this.particles.length === 0) {
                if (isScratching) {
                    this.createParticles();
                } else {
                    this.stop();
                    return;
                }
            }
            this.animationId = requestAnimationFrame(() => this.update());
        }
        start() {
            this.initialize();
            this.isRunning = true;
            this.createParticles();
            this.update();
            console.log('🎆 Corporate confetti started');
        }
        stop() {
            this.isRunning = false;
            if (this.animationId) cancelAnimationFrame(this.animationId);
            if (this.canvas) this.canvas.remove();
            this.canvas = null;
            this.particles = [];
            console.log('⛔ Corporate confetti stopped');
        }
    }

    class CanvasEmojiSystem {
        constructor() {
            this.canvas = null;
            this.ctx = null;
            this.emojis = [];
            this.maxEmojis = 20;
            this.isRunning = false;
            this.animationId = null;
            this.mouse = { x: null, y: null, down: false, particle: null };
        }
        initialize() {
            if (this.canvas) return;
            this.canvas = document.createElement('canvas');
            this.ctx = this.canvas.getContext('2d');
            this.canvas.style.cssText = \`position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; pointer-events: auto; z-index: 999; background: transparent;\`;
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            document.body.appendChild(this.canvas);
            window.addEventListener('resize', () => {
                if (this.canvas) {
                    this.canvas.width = window.innerWidth;
                    this.canvas.height = window.innerHeight;
                }
            });
            this.canvas.addEventListener('mousemove', (e) => {
                this.mouse.x = e.clientX;
                this.mouse.y = e.clientY;
            });
            this.canvas.addEventListener('mousedown', (e) => {
                this.mouse.down = true;
                this.checkGrab(e.clientX, e.clientY);
            });
            this.canvas.addEventListener('mouseup', () => {
                this.mouse.down = false;
                this.mouse.particle = null;
            });
        }
        checkGrab(mouseX, mouseY) {
            for (let i = this.emojis.length - 1; i >= 0; i--) {
                const p = this.emojis[i];
                const dx = mouseX - p.x;
                const dy = mouseY - p.y;
                if (Math.sqrt(dx * dx + dy * dy) < p.size / 2) {
                    this.mouse.particle = p;
                    p.offsetX = dx;
                    p.offsetY = dy;
                    return;
                }
            }
        }
        createParticle() {
            if (this.emojis.length >= this.maxEmojis) return;
            const emojiList = ['🎉', '🥳', '🎂', '🎈', '❤️'];
            const emoji = emojiList[Math.floor(Math.random() * emojiList.length)];
            const p = {
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.05,
                size: 30 + Math.random() * 20,
                emoji: emoji,
                gravity: 0.002,
                bounceDamping: 0.7,
                friction: 0.99,
                birthTime: Date.now(),
                lifespan: 8000 + Math.random() * 10000,
                alpha: 1
            };
            this.emojis.push(p);
        }
        update() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.emojis = this.emojis.filter(p => {
                const age = Date.now() - p.birthTime;
                if (age > p.lifespan) return false;
                p.alpha = Math.max(0, 1 - (age / p.lifespan));
                if (this.mouse.down && this.mouse.particle === p) {
                    p.x = this.mouse.x - p.offsetX;
                    p.y = this.mouse.y - p.offsetY;
                    p.vx = 0;
                    p.vy = 0;
                } else {
                    p.vx *= p.friction;
                    p.vy += p.gravity;
                    p.vy *= p.friction;
                    p.x += p.vx;
                    p.y += p.vy;
                    if (p.x < 0 || p.x > this.canvas.width) p.vx *= -p.bounceDamping;
                    if (p.y < 0 || p.y > this.canvas.height) p.vy *= -p.bounceDamping;
                    p.x = Math.max(0, Math.min(this.canvas.width, p.x));
                    p.y = Math.max(0, Math.min(this.canvas.height, p.y));
                }
                p.rotation += p.rotationSpeed;
                this.ctx.save();
                this.ctx.translate(p.x, p.y);
                this.ctx.rotate(p.rotation);
                this.ctx.globalAlpha = p.alpha;
                this.ctx.font = \`\${p.size}px Arial\`;
                this.ctx.fillText(p.emoji, -p.size / 4, p.size / 4);
                this.ctx.restore();
                return true;
            });
            if (this.emojis.length === 0) {
                if (isScratching) {
                    this.createParticle();
                } else {
                    this.stop();
                    return;
                }
            }
            if (this.emojis.length < this.maxEmojis && Math.random() < 0.1) {
                this.createParticle();
            }
            this.animationId = requestAnimationFrame(() => this.update());
        }
        start() {
            this.initialize();
            this.isRunning = true;
            this.update();
            console.log('🎆 Canvas emoji started');
        }
        stop() {
            this.isRunning = false;
            if (this.animationId) cancelAnimationFrame(this.animationId);
            if (this.canvas) this.canvas.remove();
            this.canvas = null;
            this.emojis = [];
            console.log('⛔ Canvas emoji stopped');
        }
    }

    class BirthdayFireworksSystem {
        constructor() {
            this.canvas = null;
            this.ctx = null;
            this.particles = [];
            this.emojiParticles = [];
            this.isRunning = false;
            this.animationId = null;
            this.launchInterval = null;
        }
        initialize() {
            if (this.canvas) return;
            this.canvas = document.createElement('canvas');
            this.ctx = this.canvas.getContext('2d');
            this.canvas.style.cssText = \`position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; pointer-events: none; z-index: 999; background: transparent;\`;
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            document.body.appendChild(this.canvas);
            window.addEventListener('resize', () => {
                if (this.canvas) {
                    this.canvas.width = window.innerWidth;
                    this.canvas.height = window.innerHeight;
                }
            });
        }
        launchFirework() {
            const launchX = Math.random() * this.canvas.width;
            const targetY = Math.random() * (this.canvas.height / 3) + 50;
            const trailParticle = new BirthdayFireworksParticle(launchX, this.canvas.height, launchX, targetY, '#ffd700');
            this.particles.push(trailParticle);
        }
        update() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.particles = this.particles.filter(p => !p.exploded);
            this.emojiParticles = this.emojiParticles.filter(p => p.lifespan > 0);
            this.particles.forEach(p => p.update(this));
            this.emojiParticles.forEach(p => p.update(this.ctx));
            if (this.particles.length === 0 && this.emojiParticles.length === 0) {
                if (isScratching) {
                    this.launchFirework();
                } else {
                    this.stop();
                    return;
                }
            }
            this.animationId = requestAnimationFrame(() => this.update());
        }
        start() {
            this.initialize();
            this.isRunning = true;
            this.launchInterval = setInterval(() => this.launchFirework(), 300);
            this.update();
            console.log('🎆 Birthday fireworks started');
        }
        stop() {
            this.isRunning = false;
            if (this.animationId) cancelAnimationFrame(this.animationId);
            if (this.launchInterval) clearInterval(this.launchInterval);
            if (this.canvas) this.canvas.remove();
            this.canvas = null;
            this.particles = [];
            this.emojiParticles = [];
            console.log('⛔ Birthday fireworks stopped');
        }
    }

    class BirthdayFireworksParticle {
        constructor(startX, startY, targetX, targetY, color) {
            this.x = startX;
            this.y = startY;
            this.targetX = targetX;
            this.targetY = targetY;
            this.color = color;
            this.speed = 5 + Math.random() * 3;
            this.angle = Math.atan2(targetY - startY, targetX - startX);
            this.vx = Math.cos(this.angle) * this.speed;
            this.vy = Math.sin(this.angle) * this.speed;
            this.gravity = 0.05;
            this.friction = 0.99;
            this.exploded = false;
            this.trail = [];
        }
        update(system) {
            this.trail.push({ x: this.x, y: this.y });
            if (this.trail.length > 10) this.trail.shift();
            this.vx *= this.friction;
            this.vy *= this.friction;
            this.vy += this.gravity;
            this.x += this.vx;
            this.y += this.vy;
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;
            if (Math.sqrt(dx * dx + dy * dy) < 5) {
                this.explode(system);
            }
            system.ctx.beginPath();
            system.ctx.moveTo(this.trail[0]?.x || this.x, this.trail[0]?.y || this.y);
            this.trail.forEach(point => system.ctx.lineTo(point.x, point.y));
            system.ctx.lineTo(this.x, this.y);
            system.ctx.strokeStyle = this.color;
            system.ctx.lineWidth = 2;
            system.ctx.stroke();
        }
        explode(system) {
            this.exploded = true;
            for (let i = 0; i < 20; i++) {
                const cakeParticle = new BirthdayCakeParticle(this.x, this.y, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6 - 3, '🎂', 80 + Math.random() * 40);
                system.emojiParticles.push(cakeParticle);
            }
        }
    }

    class BirthdayCakeParticle {
        constructor(x, y, vx, vy, emoji, lifespan) {
            this.x = x;
            this.y = y;
            this.vx = vx;
            this.vy = vy;
            this.emoji = emoji;
            this.lifespan = lifespan;
            this.gravity = 0.15;
            this.friction = 0.98;
            this.rotation = 0;
            this.rotationSpeed = (Math.random() - 0.5) * 0.15;
            this.scale = 1 + Math.random() * 0.5;
        }
        update(ctx) {
            this.vx *= this.friction;
            this.vy *= this.friction;
            this.vy += this.gravity;
            this.x += this.vx;
            this.y += this.vy;
            this.rotation += this.rotationSpeed;
            this.lifespan--;
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.scale(this.scale, this.scale);
            ctx.globalAlpha = this.lifespan / 120;
            ctx.font = '24px Arial';
            ctx.fillText(this.emoji, 0, 0);
            ctx.restore();
        }
    }

    // Delivery animation control
    let currentDeliverySystem = null;

    function startDeliveryAnimation() {
        if (currentDeliverySystem) {
            currentDeliverySystem.stop();
        }
        const selectedAnimation = '${animation}';
        console.log('Selected animation from cardData:', selectedAnimation);
        if (selectedAnimation === 'heart-fireworks') {
            currentDeliverySystem = new HeartFireworksSystem();
        } else if (selectedAnimation === 'corporate-confetti') {
            currentDeliverySystem = new CorporateConfettiSystem();
        } else if (selectedAnimation === 'emoji-3d') {
            currentDeliverySystem = new CanvasEmojiSystem();
        } else if (selectedAnimation === 'birthday-fireworks') {
            currentDeliverySystem = new BirthdayFireworksSystem();
        }
        if (currentDeliverySystem) {
            currentDeliverySystem.start();
        } else {
            console.warn('Unknown animation type:', selectedAnimation);
        }
    }

    // Initialize when DOM loads
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🎯 Starting Hybrid Scratch System with Audio...');
        setTimeout(() => {
            initializeScratchAreas();
            console.log('✅ Hybrid Scratch System with Audio initialized!');
        }, 100);
    });

    console.log('✅ Hybrid Scratch System with Audio Script Loaded!');
    `;
}
    /**
     * Helper function to convert hex to rgba
     */
    hexToRgba(hex, alpha) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
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
