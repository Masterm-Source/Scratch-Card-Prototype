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
     * FIXED: Check if an asset is from the web app (more reliable detection)
     */
    isWebAppAsset(assetPath) {
        if (!assetPath) return false;
        
        // Check if it contains our asset paths
        if (assetPath.includes('/assets/backgrounds/') || 
            assetPath.includes('/assets/symbols/') || 
            assetPath.includes('/assets/scratchTextures/') ||
            assetPath.includes('/assets/audio/')) {
            return true;
        }
        
        // Check if it's just a filename with web app extensions
        const filename = this.extractFilename(assetPath);
        if (filename) {
            const webAppPattern = /^[0-9a-zA-Z]+\.(jpeg|jpg|png|gif|mp3)$/;
            return webAppPattern.test(filename);
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
     * COMPLETELY FIXED: Generate a single element with proper asset handling
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
                // Convert camelCase to kebab-case for CSS
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
                const scratchTextureStyle = this.getScratchTextureStyleInline(cardData);
                
                // FIXED: Better structure for scratch area with texture
                let scratchAreaStyles = inlineStyles.slice(); // Copy existing styles
                
                // Add scratch texture styles if they exist
                if (scratchTextureStyle) {
                    const textureStyles = scratchTextureStyle.split('; ');
                    scratchAreaStyles = scratchAreaStyles.concat(textureStyles);
                }
                
                const fullStyle = scratchAreaStyles.length > 0 
                    ? `style="${scratchAreaStyles.join('; ')}"`
                    : '';
                
                return `<div class="card-element scratch-area" id="${id}" ${fullStyle}
                         data-hidden-message="${hiddenMsg}">
                    <div class="hidden-message">${hiddenMsg}</div>
                    <canvas class="scratch-canvas" width="${this.parsePixels(position.width) || 350}" height="${this.parsePixels(position.height) || 150}"></canvas>
                    <div class="scratch-overlay">
                        <p style="position: relative; z-index: 3; color: #666; font-weight: 500;">${content || 'Scratch here to reveal your message!'}</p>
                    </div>
                </div>`;

            case 'symbol':
            case 'card-symbol':
                let symbolContent = innerHTML || content;
                
                // FIXED: Properly handle symbol assets from web app
                if (symbolContent.includes('<img')) {
                    // Already has image tag, keep as is
                } else if (symbolContent && (symbolContent.includes('data:image') || this.isWebAppAsset(symbolContent))) {
                    // Handle base64 or web app asset
                    let imageSrc;
                    if (this.isWebAppAsset(symbolContent) && !symbolContent.startsWith('data:')) {
                        const filename = this.extractFilename(symbolContent);
                        imageSrc = `${this.baseUrl}/assets/symbols/${filename}`;
                    } else {
                        imageSrc = symbolContent;
                    }
                    symbolContent = `<img src="${imageSrc}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;" alt="Symbol">`;
                } else {
                    // It's text/emoji content
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
     * COMPLETELY FIXED: Get scratch texture styling with proper asset handling
     */
    getScratchTextureStyleInline(cardData) {
        const { scratchTextureBase64, scratchTexture } = cardData;
        
        console.log('🎨 Processing scratch texture:', { scratchTexture, scratchTextureBase64 });
        
        if (scratchTextureBase64) {
            console.log('✅ Using base64 scratch texture');
            return `background-image: url('${scratchTextureBase64}'); background-size: cover; background-position: center`;
        } else if (scratchTexture && !scratchTexture.includes('data:image/svg+xml')) {
            // FIXED: Proper URL handling for scratch textures
            let textureUrl;
            
            if (this.isWebAppAsset(scratchTexture)) {
                const filename = this.extractFilename(scratchTexture);
                textureUrl = `${this.baseUrl}/assets/scratchTextures/${filename}`;
                console.log(`🔄 Converted scratch texture: ${scratchTexture} → ${textureUrl}`);
            } else {
                textureUrl = scratchTexture;
                console.log(`🌐 Using external scratch texture: ${textureUrl}`);
            }
            
            console.log('✅ Using image scratch texture:', textureUrl);
            return `background-image: url('${textureUrl}'); background-size: cover; background-position: center`;
        }
        
        console.log('⚠️ No scratch texture found, using default');
        return '';
    }

    /**
     * Parse pixel values from CSS strings
     */
    parsePixels(value) {
        if (typeof value === 'number') return value;
        if (typeof value === 'string') {
            const num = parseFloat(value);
            return isNaN(num) ? null : num;
        }
        return null;
    }

    /**
     * FIXED: Fallback elements with proper asset handling
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
            let symbolUrl;
            if (this.isWebAppAsset(symbol) && !symbol.startsWith('data:')) {
                const filename = this.extractFilename(symbol);
                symbolUrl = `${this.baseUrl}/assets/symbols/${filename}`;
            } else {
                symbolUrl = symbol;
            }
            symbolContent = `<img src="${symbolUrl}" alt="Symbol" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">`;
        } else {
            symbolContent = symbol || '❤️';
        }

        const scratchTextureStyle = this.getScratchTextureStyleInline(cardData);

        return `
            <div class="card-element sender-name" id="senderName" 
                 style="position: absolute; top: 20px; left: 20px;">
                From ${senderName || 'Anonymous'}
            </div>
            
            <div class="card-element scratch-area" id="scratchArea" 
                 style="position: absolute; top: 45%; left: 16%; width: 350px; height: 150px; ${scratchTextureStyle}"
                 data-hidden-message="${hiddenMessage || 'Surprise!'}">
                <div class="hidden-message">${hiddenMessage || 'Surprise!'}</div>
                <canvas class="scratch-canvas" width="350" height="150"></canvas>
                <p style="position: relative; z-index: 3;">Scratch here to reveal your message!</p>
            </div>
            
            <div class="card-element card-symbol" id="cardSymbol" 
                 style="position: absolute; top: 20px; right: 20px; width: 80px; height: 80px;">
                ${symbolContent}
            </div>
        `;
    }

    /**
     * COMPLETELY FIXED: Generate CSS that EXACTLY matches the web app styling with all gradient backgrounds
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

        .scratch-area {
            background: rgba(192, 192, 192, 0.9);
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            color: #666;
            font-weight: 500;
            border: 2px dashed rgba(255, 255, 255, 0.5);
            backdrop-filter: blur(5px);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: crosshair;
            transition: all 0.3s ease;
            position: relative;
            /* Ensure background texture shows through */
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
        }

        .scratch-area:hover {
            transform: scale(1.02);
        }

        .scratch-area.scratching {
            border-color: #667eea;
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

        /* SCRATCH CANVAS */
        .scratch-canvas {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 2;
        }

        .hidden-message {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(45deg, #667eea, #764ba2);
            color: white;
            font-weight: bold;
            font-size: 18px;
            text-align: center;
            padding: 20px;
            border-radius: 12px;
            z-index: 1;
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
     * FIXED: Generate JavaScript with smoke effect support and dynamic element handling
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
        // ADVANCED CARD CONFIGURATION - EXACTLY like web app
        const cardConfig = {
            hiddenMessage: ${JSON.stringify(hiddenMessage)},
            animation: ${JSON.stringify(animation)},
            glowColor: ${JSON.stringify(glowColor)},
            smokeEffect: ${smokeEffect},
            elements: ${JSON.stringify(elements)},
            brushRadius: 20,
            scratchThreshold: 60,
            particleSystem: null,
            smokeSystem: null,
            audioInitialized: false
        };

        // CANVAS AND AUDIO ELEMENTS
        let scratchCanvases = [];
        let scratchSound = document.getElementById('scratchSound');
        let isScratching = false;
        let hasRevealed = false;

        // PARTICLE SYSTEM - EXACTLY like web app
        class ParticleSystem {
            constructor() {
                this.particles = [];
                this.container = document.getElementById('particleContainer');
                this.isRunning = false;
            }

            createParticle(x, y, type) {
                const particle = document.createElement('div');
                particle.className = \`particle \${type}-particle\`;
                
                switch(type) {
                    case 'heart':
                        particle.textContent = '❤️';
                        break;
                    case 'sparkle':
                        particle.textContent = '✨';
                        break;
                    default:
                        particle.textContent = '⭐';
                }
                
                particle.style.left = x + 'px';
                particle.style.top = y + 'px';
                
                this.container.appendChild(particle);
                this.particles.push(particle);
                
                // Remove after animation
                setTimeout(() => {
                    if (particle.parentNode) {
                        particle.parentNode.removeChild(particle);
                    }
                    const index = this.particles.indexOf(particle);
                    if (index > -1) {
                        this.particles.splice(index, 1);
                    }
                }, 3000);
            }

            triggerEffect(x, y) {
                if (Math.random() > 0.7) return; // Don't create too many
                
                const rect = document.getElementById('cardPreview').getBoundingClientRect();
                const globalX = rect.left + x;
                const globalY = rect.top + y;
                
                this.createParticle(globalX, globalY, cardConfig.animation);
            }

            celebrate() {
                for (let i = 0; i < 20; i++) {
                    setTimeout(() => {
                        const rect = document.getElementById('cardPreview').getBoundingClientRect();
                        const x = rect.left + Math.random() * rect.width;
                        const y = rect.top + Math.random() * rect.height;
                        this.createParticle(x, y, cardConfig.animation);
                    }, i * 100);
                }
            }
        }

        // SMOKE EFFECT SYSTEM - Canvas-based like web app
        class SmokeSystem {
            constructor() {
                this.canvas = null;
                this.ctx = null;
                this.particles = [];
                this.isRunning = false;
                this.animationId = null;
            }

            init() {
                if (!cardConfig.smokeEffect) return;

                const container = document.getElementById('smokeContainer') || document.querySelector('.card-container');
                if (!container) return;

                this.canvas = document.createElement('canvas');
                this.canvas.className = 'smoke-canvas';
                this.canvas.style.cssText = \`
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    z-index: 3;
                \`;

                const rect = container.getBoundingClientRect();
                this.canvas.width = rect.width;
                this.canvas.height = rect.height;
                this.ctx = this.canvas.getContext('2d');

                container.appendChild(this.canvas);
                this.start();
            }

            createParticle() {
                const particle = {
                    x: Math.random() * this.canvas.width,
                    y: this.canvas.height + 50,
                    vx: (Math.random() - 0.5) * 2,
                    vy: -(Math.random() * 3 + 2),
                    life: 1.0,
                    maxLife: Math.random() * 300 + 200,
                    age: 0,
                    size: Math.random() * 20 + 10,
                    color: this.hexToRgb(cardConfig.glowColor)
                };
                this.particles.push(particle);
            }

            hexToRgb(hex) {
                const result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex);
                return result ? {
                    r: parseInt(result[1], 16),
                    g: parseInt(result[2], 16),
                    b: parseInt(result[3], 16)
                } : { r: 102, g: 126, b: 234 };
            }

            updateParticles() {
                this.particles = this.particles.filter(particle => {
                    particle.age++;
                    particle.x += particle.vx;
                    particle.y += particle.vy;
                    particle.vy -= 0.05; // Gravity
                    particle.life = Math.max(0, 1 - (particle.age / particle.maxLife));
                    return particle.life > 0;
                });
            }

            render() {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                
                this.particles.forEach(particle => {
                    const alpha = particle.life * 0.6;
                    this.ctx.fillStyle = \`rgba(\${particle.color.r}, \${particle.color.g}, \${particle.color.b}, \${alpha})\`;
                    this.ctx.beginPath();
                    this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                    this.ctx.fill();
                });
            }

            start() {
                if (this.isRunning) return;
                this.isRunning = true;
                this.animate();
            }

            animate() {
                if (!this.isRunning) return;

                // Create new particles
                if (Math.random() < 0.3) {
                    this.createParticle();
                }

                this.updateParticles();
                this.render();

                this.animationId = requestAnimationFrame(() => this.animate());
            }

            stop() {
                this.isRunning = false;
                if (this.animationId) {
                    cancelAnimationFrame(this.animationId);
                }
            }
        }

        // INITIALIZE SYSTEMS
        const particleSystem = new ParticleSystem();
        const smokeSystem = new SmokeSystem();

        // SCRATCH FUNCTIONALITY - Support multiple scratch areas
        function initializeScratchAreas() {
            const scratchAreas = document.querySelectorAll('.scratch-area');
            scratchAreas.forEach(scratchArea => {
                const canvas = scratchArea.querySelector('.scratch-canvas');
                if (canvas) {
                    const ctx = canvas.getContext('2d');
                    scratchCanvases.push({ canvas, ctx, area: scratchArea });
                    
                    drawScratchSurface(ctx, canvas);
                    setupScratchEvents(canvas, ctx, scratchArea);
                }
            });
        }

        function drawScratchSurface(ctx, canvas) {
            if (!ctx) return;
            
            // Get the scratch area element to check for background texture
            const scratchArea = canvas.closest('.scratch-area');
            const hasBackgroundTexture = scratchArea && 
                scratchArea.style.backgroundImage && 
                scratchArea.style.backgroundImage !== 'none' && 
                scratchArea.style.backgroundImage !== '';
            
            console.log('🎨 Drawing scratch surface. Has texture:', hasBackgroundTexture);
            
            if (hasBackgroundTexture) {
                // Extract the URL from background-image style
                const bgImage = scratchArea.style.backgroundImage;
                const imageUrl = bgImage.match(/url\\(["\']?([^"\'\\)]+)["\']?\\)/);
                
                if (imageUrl && imageUrl[1]) {
                    console.log('🖼️ Loading texture image:', imageUrl[1]);
                    const img = new Image();
                    img.crossOrigin = 'anonymous';
                    
                    img.onload = function() {
                        console.log('✅ Texture image loaded, creating scratch surface');
                        
                        // Create pattern from the texture image
                        try {
                            const pattern = ctx.createPattern(img, 'repeat');
                            if (pattern) {
                                ctx.fillStyle = pattern;
                                ctx.fillRect(0, 0, canvas.width, canvas.height);
                            } else {
                                // Fallback: draw the image directly
                                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                            }
                            
                            // Add semi-transparent overlay to make it look scratchable
                            ctx.fillStyle = 'rgba(200, 200, 200, 0.7)';
                            ctx.fillRect(0, 0, canvas.width, canvas.height);
                            
                            // Add texture dots
                            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                            for (let i = 0; i < 50; i++) {
                                ctx.beginPath();
                                ctx.arc(
                                    Math.random() * canvas.width,
                                    Math.random() * canvas.height,
                                    Math.random() * 2 + 1,
                                    0,
                                    Math.PI * 2
                                );
                                ctx.fill();
                            }
                            
                            console.log('✅ Textured scratch surface created');
                        } catch (e) {
                            console.error('❌ Error creating pattern:', e);
                            drawDefaultScratchSurface(ctx, canvas);
                        }
                    };
                    
                    img.onerror = function() {
                        console.error('❌ Failed to load texture image, using default');
                        drawDefaultScratchSurface(ctx, canvas);
                    };
                    
                    img.src = imageUrl[1];
                    return; // Exit early, image will load async
                }
            }
            
            console.log('🎨 Using default scratch surface');
            drawDefaultScratchSurface(ctx, canvas);
        }
        
        function drawDefaultScratchSurface(ctx, canvas) {
            // Default silver scratch surface
            ctx.fillStyle = '#c0c0c0';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Add metallic texture
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            for (let i = 0; i < 100; i++) {
                ctx.beginPath();
                ctx.arc(
                    Math.random() * canvas.width,
                    Math.random() * canvas.height,
                    Math.random() * 3 + 1,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            }
            
            // Add darker spots for depth
            ctx.fillStyle = 'rgba(150, 150, 150, 0.2)';
            for (let i = 0; i < 30; i++) {
                ctx.beginPath();
                ctx.arc(
                    Math.random() * canvas.width,
                    Math.random() * canvas.height,
                    Math.random() * 4 + 2,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            }
        }

        function setupScratchEvents(canvas, ctx, scratchArea) {
            if (!canvas) return;
            
            // Mouse events
            canvas.addEventListener('mousedown', (e) => startScratching(e, ctx, scratchArea));
            canvas.addEventListener('mousemove', (e) => scratch(e, ctx, canvas, scratchArea));
            canvas.addEventListener('mouseup', () => stopScratching(scratchArea));
            canvas.addEventListener('mouseleave', () => stopScratching(scratchArea));
            
            // Touch events
            canvas.addEventListener('touchstart', (e) => handleTouchStart(e, ctx, scratchArea));
            canvas.addEventListener('touchmove', (e) => handleTouchMove(e, ctx, canvas, scratchArea));
            canvas.addEventListener('touchend', () => stopScratching(scratchArea));
            
            // Audio initialization
            document.addEventListener('click', initializeAudio, { once: true });
            document.addEventListener('touchstart', initializeAudio, { once: true });
        }

        function startScratching(event, ctx, scratchArea) {
            isScratching = true;
            scratchArea.classList.add('scratching');
            scratch(event, ctx, event.target, scratchArea);
        }

        function scratch(event, ctx, canvas, scratchArea) {
            if (!isScratching || !ctx) return;
            
            const rect = canvas.getBoundingClientRect();
            const x = (event.clientX - rect.left) * (canvas.width / rect.width);
            const y = (event.clientY - rect.top) * (canvas.height / rect.height);
            
            scratchAt(x, y, ctx, canvas, scratchArea);
            playScatchSound();
            particleSystem.triggerEffect(x, y);
        }

        function handleTouchStart(event, ctx, scratchArea) {
            event.preventDefault();
            isScratching = true;
            const touch = event.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            startScratching(mouseEvent, ctx, scratchArea);
        }

        function handleTouchMove(event, ctx, canvas, scratchArea) {
            event.preventDefault();
            if (!isScratching) return;
            
            const touch = event.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            scratch(mouseEvent, ctx, canvas, scratchArea);
        }

        function stopScratching(scratchArea) {
            isScratching = false;
            scratchArea.classList.remove('scratching');
            stopScratchSound();
        }

        function scratchAt(x, y, ctx, canvas, scratchArea) {
            if (!ctx) return;
            
            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath();
            ctx.arc(x, y, cardConfig.brushRadius, 0, Math.PI * 2);
            ctx.fill();
            
            updateScratchProgress(ctx, canvas, scratchArea);
        }

        function updateScratchProgress(ctx, canvas, scratchArea) {
            if (!ctx) return;
            
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            let transparentPixels = 0;
            const totalPixels = canvas.width * canvas.height;
            
            for (let i = 3; i < imageData.data.length; i += 4) {
                if (imageData.data[i] === 0) {
                    transparentPixels++;
                }
            }
            
            const scratchPercentage = (transparentPixels / totalPixels) * 100;
            
            if (scratchPercentage > cardConfig.scratchThreshold && !hasRevealed) {
                hasRevealed = true;
                revealComplete(ctx, canvas, scratchArea);
            }
        }

        function revealComplete(ctx, canvas, scratchArea) {
            if (!ctx) return;
            
            // Clear scratch surface completely
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Trigger celebration
            particleSystem.celebrate();
            
            // Play success sound
            playSuccessSound();
        }

        // AUDIO FUNCTIONS - EXACTLY like web app
        function initializeAudio() {
            if (!cardConfig.audioInitialized && scratchSound) {
                scratchSound.load();
                cardConfig.audioInitialized = true;
            }
        }

        function playScatchSound() {
            if (!cardConfig.audioInitialized) return;
            
            if (scratchSound && scratchSound.paused) {
                scratchSound.play().catch(() => {
                    // Fallback to Web Audio API beep
                    playBeepSound();
                });
            }
        }

        function stopScratchSound() {
            if (scratchSound) {
                scratchSound.pause();
                scratchSound.currentTime = 0;
            }
        }

        function playSuccessSound() {
            // Play a success sound or enhanced beep
            playBeepSound(800, 0.5); // Higher pitch for success
        }

        function playBeepSound(frequency = 600, duration = 0.3) {
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.value = frequency;
                oscillator.type = 'sine';
                
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
                
                oscillator.start();
                oscillator.stop(audioContext.currentTime + duration);
            } catch (error) {
                console.log('Web Audio API not supported:', error);
            }
        }

        // INITIALIZATION - EXACTLY like web app
        function initializeCard() {
            console.log('🎯 Initializing Advanced Masterm Card...');
            console.log('📊 Elements found:', cardConfig.elements.length);
            console.log('💨 Smoke effect:', cardConfig.smokeEffect ? 'enabled' : 'disabled');
            
            // Initialize scratch areas
            initializeScratchAreas();
            
            // Initialize particle system
            cardConfig.particleSystem = particleSystem;
            
            // Initialize smoke system if enabled
            if (cardConfig.smokeEffect) {
                cardConfig.smokeSystem = smokeSystem;
                smokeSystem.init();
                console.log('💨 Smoke effect initialized');
            }
            
            console.log('✅ Advanced Masterm Card initialized successfully!');
            console.log('🎨 Features: Dynamic Elements, Scratch, Particles, Glow, Smoke');
        }

        // START THE CARD
        document.addEventListener('DOMContentLoaded', initializeCard);
        
        // Export for debugging
        window.cardConfig = cardConfig;
        window.particleSystem = particleSystem;
        window.smokeSystem = smokeSystem;
        
        console.log('🎯 Advanced Masterm Card Script Loaded!');
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
