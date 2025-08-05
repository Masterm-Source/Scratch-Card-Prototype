/**
 * FIXED Advanced Card Generator Module
 * SOLVED: Asset path resolution issues for backgrounds and scratch textures
 * - Fixed URL parsing and asset detection
 * - Prioritizes web app selections over generator logic
 * - Handles both full URLs and filenames correctly
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
     * FIXED: Extract filename from full URL or return as-is if already a filename
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
     * ENHANCED: Check if an asset is from the web app's asset collection
     * Now properly identifies full URLs vs filenames
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
     * FIXED: Get CSS classes for the card element - RESPECTS web app selections
     */
    getCardClasses(cardData) {
        const { backgroundImage, cardStyle = {} } = cardData;
        
        // FIXED: Only use gradient classes if NO image background is selected
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
     * COMPLETELY FIXED: Generate inline styles - PRIORITIZES web app selections
     */
    generateCardInlineStyles(cardData) {
        const { cardStyle = {}, backgroundImage, backgroundImageBase64 } = cardData;
        let styles = [];

        console.log('🎨 Processing background:', { backgroundImage, backgroundImageBase64, cardStyle });

        // FIXED PRIORITY ORDER: 
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
     * FIXED: Generate card elements dynamically from cardData.elements array
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
 * FIXED: Generate a single scratch element with TWO-CANVAS system
 * Based on the working logic from cards/joe/script.js
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
            // ✅ Quick fix:
        const canvasWidth = parseFloat(position.width) || 350;
        const canvasHeight = parseFloat(position.height) || 150;
            
            // ✅ TWO-CANVAS SYSTEM - Just like the working example
            return `<div class="card-element scratch-area" id="${id}" ${styleAttr}>
                <!-- Bottom canvas: Hidden message (transparent background) -->
                <canvas class="message-canvas" width="${canvasWidth}" height="${canvasHeight}" 
                        style="position: absolute; top: 0; left: 0; z-index: 1;"></canvas>
                
                <!-- Top canvas: Scratch texture (JPEG drawn directly) -->
                <canvas class="scratch-canvas" width="${canvasWidth}" height="${canvasHeight}"
                        style="position: absolute; top: 0; left: 0; z-index: 2; cursor: crosshair;"
                        data-texture-url="${scratchTextureUrl}"
                        data-hidden-message="${hiddenMsg}"></canvas>
                
                <!-- Optional overlay text -->
                <p style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 3; pointer-events: none; color: rgba(0,0,0,0.8); font-weight: bold;">
                    ${content || 'Scratch here to reveal your message!'}
                </p>
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
 * FIXED: Get scratch texture URL - No CSS background nonsense
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
    
    // Fallback to a simple texture
    return 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><defs><pattern id="scratch1" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="%23c0c0c0"/><circle cx="10" cy="10" r="2" fill="%23a0a0a0"/></pattern></defs><rect width="100" height="100" fill="url(%23scratch1)"/></svg>';
}
    /**
     * COMPLETELY FIXED: Generate CSS that EXACTLY matches the web app styling with all gradient backgrounds
     */
    /**
 * COMPLETE generateWebAppCSS function with Two-Canvas Scratch System fixes
 * Replace the existing generateWebAppCSS function in cardGenerator.js with this
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

    /* CARD PREVIEW BASE STYLES */
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
        
        /* Enhanced glow effect with custom color */
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

    /* GRADIENT BACKGROUND CLASSES - EXACTLY FROM WEB APP */
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

    /* DYNAMIC CARD ELEMENTS - Support all element types */
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

    /* ✅ FIXED SCRATCH AREA STYLES - Two-Canvas System */
    .scratch-area {
        position: relative;
        display: inline-block;
        border-radius: 12px;
        overflow: hidden;
        cursor: crosshair;
        transition: all 0.3s ease;
        /* NO background - let card background show through */
    }

    .scratch-area:hover {
        transform: scale(1.02);
    }

    .scratch-area.scratching {
        border-color: #667eea;
    }

    /* ✅ TWO-CANVAS SYSTEM STYLES */
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
        background: transparent; /* Completely transparent - card background shows through */
    }

    .scratch-canvas {
        z-index: 2;
        cursor: crosshair;
        /* JPEG texture will be drawn directly on this canvas */
    }

    .scratch-area p {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 3;
        pointer-events: none;
        color: rgba(0, 0, 0, 0.8);
        font-weight: bold;
        text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.8);
        margin: 0;
        padding: 4px 8px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
        backdrop-filter: blur(2px);
    }

    /* ❌ REMOVE BROKEN HIDDEN MESSAGE DIV STYLES */
    .hidden-message {
        display: none !important; /* We don't use this purple gradient div anymore */
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

    /* PARTICLE EFFECTS */
    .particle {
        position: absolute;
        pointer-events: none;
        z-index: 1000;
    }

    .heart-particle {
        font-size: 20px;
        color: #e53e3e;
        animation: heartFloat 3s ease-out forwards;
    }

    @keyframes heartFloat {
        0% {
            opacity: 1;
            transform: translateY(0) scale(0.5);
        }
        50% {
            opacity: 0.8;
            transform: translateY(-100px) scale(1);
        }
        100% {
            opacity: 0;
            transform: translateY(-200px) scale(0.3);
        }
    }

    .sparkle-particle {
        font-size: 16px;
        color: gold;
        animation: sparkleFloat 2s ease-out forwards;
    }

    @keyframes sparkleFloat {
        0% {
            opacity: 1;
            transform: translateY(0) rotate(0deg) scale(0.5);
        }
        50% {
            opacity: 0.9;
            transform: translateY(-80px) rotate(180deg) scale(1.2);
        }
        100% {
            opacity: 0;
            transform: translateY(-150px) rotate(360deg) scale(0.2);
        }
    }

    /* SMOKE EFFECT */
    .smoke-canvas {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 3;
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

        .scratch-area p {
            font-size: 14px;
        }
    }

    /* ✅ DEBUGGING STYLES - Remove after testing */
    .scratch-area {
        border: 2px dashed rgba(255, 255, 255, 0.2); /* Temporary - shows scratch area bounds */
    }

    .message-canvas {
        /* Temporary debugging - shows message canvas area */
        /* border: 1px solid rgba(0, 255, 0, 0.3); */
    }

    .scratch-canvas {
        /* Temporary debugging - shows scratch canvas area */
        /* border: 1px solid rgba(255, 0, 0, 0.3); */
    }
    `;
}
    /**
     * FIXED: Generate audio sources with proper asset handling
     */
    generateAudioSources(cardData) {
        const { soundEffect, soundEffectBase64 } = cardData;
        
        if (soundEffectBase64) {
            return `<source src="${soundEffectBase64}" type="audio/mpeg">`;
        } else if (soundEffect && soundEffect !== '#beep') {
            // FIXED: Check if it's a web app asset
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
 * COMPLETELY REWRITTEN: Initialize scratch areas with TWO-CANVAS system
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
        // FIXED SCRATCH SYSTEM - Two-Canvas Implementation
        const scratchAreas = [];
        let isScratching = false;
        let currentScratchArea = null;

        // Initialize all scratch areas when DOM is ready
        function initializeScratchAreas() {
            console.log('🎯 Initializing Two-Canvas Scratch Areas...');
            
            const scratchElements = document.querySelectorAll('.scratch-area');
            scratchElements.forEach((scratchArea, index) => {
                const messageCanvas = scratchArea.querySelector('.message-canvas');
                const scratchCanvas = scratchArea.querySelector('.scratch-canvas');
                
                if (messageCanvas && scratchCanvas) {
                    const messageCtx = messageCanvas.getContext('2d');
                    const scratchCtx = scratchCanvas.getContext('2d');
                    
                    const scratchData = {
                        area: scratchArea,
                        messageCanvas,
                        scratchCanvas,
                        messageCtx,
                        scratchCtx,
                        textureUrl: scratchCanvas.dataset.textureUrl,
                        hiddenMessage: scratchCanvas.dataset.hiddenMessage || 'Surprise!',
                        scratchedPixels: 0,
                        brushRadius: 20
                    };
                    
                    scratchAreas.push(scratchData);
                    
                    // Initialize both canvases
                    drawMessageCanvas(scratchData);
                    drawScratchCanvas(scratchData);
                    
                    // Setup scratch events
                    setupScratchEvents(scratchData);
                    
                    console.log(\`✅ Scratch area \${index + 1} initialized\`);
                }
            });
            
            console.log(\`🎯 Total scratch areas initialized: \${scratchAreas.length}\`);
        }

        // Draw the hidden message on the bottom canvas (transparent background)
        function drawMessageCanvas(scratchData) {
            const { messageCtx, messageCanvas, hiddenMessage } = scratchData;
            
            // Clear canvas
            messageCtx.clearRect(0, 0, messageCanvas.width, messageCanvas.height);
            
            // Set text properties
            messageCtx.font = 'bold 24px Arial, sans-serif';
            messageCtx.fillStyle = '#ffffff';
            messageCtx.strokeStyle = '#000000';
            messageCtx.lineWidth = 2;
            messageCtx.textAlign = 'center';
            messageCtx.textBaseline = 'middle';
            
            // Draw text with stroke for visibility
            const centerX = messageCanvas.width / 2;
            const centerY = messageCanvas.height / 2;
            
            messageCtx.strokeText(hiddenMessage, centerX, centerY);
            messageCtx.fillText(hiddenMessage, centerX, centerY);
            
            console.log('✅ Message canvas drawn:', hiddenMessage);
        }

        // Draw the scratch texture on the top canvas (JPEG loaded directly)
        function drawScratchCanvas(scratchData) {
            const { scratchCtx, scratchCanvas, textureUrl } = scratchData;
            
            if (textureUrl && textureUrl !== '' && !textureUrl.includes('data:image/svg+xml')) {
                // Load and draw JPEG texture
                const scratchTexture = new Image();
                scratchTexture.crossOrigin = 'anonymous';
                
                scratchTexture.onload = () => {
                    // Clear canvas
                    scratchCtx.clearRect(0, 0, scratchCanvas.width, scratchCanvas.height);
                    
                    // Draw the JPEG texture to fill entire canvas
                    scratchCtx.drawImage(scratchTexture, 0, 0, scratchCanvas.width, scratchCanvas.height);
                    
                    console.log('✅ JPEG scratch texture loaded and drawn:', textureUrl);
                };
                
                scratchTexture.onerror = () => {
                    console.log('❌ Failed to load scratch texture, using fallback');
                    drawFallbackScratchSurface(scratchData);
                };
                
                scratchTexture.src = textureUrl;
            } else {
                // Use fallback surface
                drawFallbackScratchSurface(scratchData);
            }
        }

        // Fallback scratch surface (only when JPEG fails)
        function drawFallbackScratchSurface(scratchData) {
            const { scratchCtx, scratchCanvas } = scratchData;
            
            // Simple metallic fallback
            scratchCtx.fillStyle = '#c0c0c0';
            scratchCtx.fillRect(0, 0, scratchCanvas.width, scratchCanvas.height);
            
            // Add some texture
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
            
            console.log('⚠️ Fallback scratch surface drawn');
        }

        // Setup scratch event listeners
        function setupScratchEvents(scratchData) {
            const { scratchCanvas } = scratchData;
            
            // Mouse events
            scratchCanvas.addEventListener('mousedown', (e) => startScratching(e, scratchData));
            scratchCanvas.addEventListener('mousemove', (e) => scratch(e, scratchData));
            scratchCanvas.addEventListener('mouseup', () => stopScratching());
            scratchCanvas.addEventListener('mouseleave', () => stopScratching());
            
            // Touch events
            scratchCanvas.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const touch = e.touches[0];
                startScratching(touch, scratchData);
            });
            
            scratchCanvas.addEventListener('touchmove', (e) => {
                e.preventDefault();
                const touch = e.touches[0];
                scratch(touch, scratchData);
            });
            
            scratchCanvas.addEventListener('touchend', (e) => {
                e.preventDefault();
                stopScratching();
            });
        }

        // Start scratching
        function startScratching(event, scratchData) {
            isScratching = true;
            currentScratchArea = scratchData;
            scratch(event, scratchData);
        }

        // Perform scratch action
        function scratch(event, scratchData) {
            if (!isScratching || currentScratchArea !== scratchData) return;
            
            const { scratchCtx, scratchCanvas, brushRadius } = scratchData;
            const rect = scratchCanvas.getBoundingClientRect();
            
            const scaleX = scratchCanvas.width / rect.width;
            const scaleY = scratchCanvas.height / rect.height;
            const x = (event.clientX - rect.left) * scaleX;
            const y = (event.clientY - rect.top) * scaleY;
            
            // Use destination-out to create transparency
            scratchCtx.globalCompositeOperation = 'destination-out';
            scratchCtx.beginPath();
            scratchCtx.arc(x, y, brushRadius, 0, Math.PI * 2);
            scratchCtx.fillStyle = 'rgba(0, 0, 0, 1)';
            scratchCtx.fill();
            
            // Track scratched area
            const scratchedArea = Math.PI * brushRadius * brushRadius;
            scratchData.scratchedPixels += scratchedArea;
            
            // Check if enough is scratched
            checkScratchProgress(scratchData);
        }

        // Stop scratching
        function stopScratching() {
            isScratching = false;
            currentScratchArea = null;
        }

        // Check scratch progress
        function checkScratchProgress(scratchData) {
            const { scratchCanvas, scratchedPixels } = scratchData;
            const totalPixels = scratchCanvas.width * scratchCanvas.height;
            const scratchPercentage = (scratchedPixels / totalPixels) * 100;
            
            if (scratchPercentage > 60) {
                // Reveal completely
                revealComplete(scratchData);
            }
        }

        // Complete reveal
        function revealComplete(scratchData) {
            const { scratchCtx, scratchCanvas } = scratchData;
            
            // Clear the entire scratch canvas
            scratchCtx.clearRect(0, 0, scratchCanvas.width, scratchCanvas.height);
            
            console.log('🎉 Scratch area completely revealed!');
        }

        // Initialize when DOM is ready
        document.addEventListener('DOMContentLoaded', () => {
            console.log('🎯 Initializing Fixed Scratch Card System...');
            setTimeout(() => {
                initializeScratchAreas();
            }, 100);
        });

        console.log('✅ Fixed Two-Canvas Scratch System Loaded!');
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
