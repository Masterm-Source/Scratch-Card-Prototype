// DOM Elements
const cardForm = document.getElementById('cardForm');
const cardPreview = document.getElementById('cardPreview');
const createButton = document.querySelector('.fab');
const senderNameInput = document.getElementById('senderName');
const hiddenMessageInput = document.getElementById('hiddenMessage');
const backgroundGrid = document.getElementById('backgroundGrid');
const symbolGrid = document.getElementById('symbolGrid');
const scratchTextureGrid = document.getElementById('scratchTextureGrid');
const audioGrid = document.getElementById('audioGrid');
const backgroundUpload = document.getElementById('backgroundUpload');
const symbolUpload = document.getElementById('symbolUpload');
const scratchTextureUpload = document.getElementById('scratchTextureUpload');
const audioUpload = document.getElementById('audioUpload');
const loadMoreBackgrounds = document.getElementById('loadMoreBackgrounds');
const loadMoreSymbols = document.getElementById('loadMoreSymbols');
const loadMoreScratchTextures = document.getElementById('loadMoreScratchTextures');
const loadMoreAudio = document.getElementById('loadMoreAudio');

// New variables for additional functionality
let selectedElement = null;
let isDragging = false;
let isResizing = false;
let dragOffset = { x: 0, y: 0 };
let currentTemplate = 'classic';

// Smoke effect control variables
let isSmokeEnabled = false;

// Project management
let currentProject = null;
let projectHistory = [];
let historyIndex = -1;
let isAutoSaveEnabled = true; // Enable history saving
let hasUnsavedChanges = false;

// Base URL for assets - check if running locally or on server
const BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
  ? `http://localhost:3000` 
  : window.location.origin;

// Fallback placeholder assets (these will always work)
const placeholderAssets = {
  backgrounds: [
    'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="125" viewBox="0 0 200 125"><defs><linearGradient id="a" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%23ff9a9e"/><stop offset="100%" style="stop-color:%23fecfef"/></linearGradient></defs><rect width="200" height="125" fill="url(%23a)"/><text x="100" y="70" text-anchor="middle" fill="white" font-family="Arial" font-size="14">Rose Gradient</text></svg>'
  ],
  symbols: [
    'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><text x="40" y="50" text-anchor="middle" font-size="40">❤️</text></svg>'
  ],
  scratchTextures: [
    'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><defs><pattern id="scratch1" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="%23c0c0c0"/><circle cx="10" cy="10" r="2" fill="%23a0a0a0"/></pattern></defs><rect width="100" height="100" fill="url(%23scratch1)"/></svg>'
  ],
  audio: []
};

// All assets from your assets folder - we'll try to load these but fall back to placeholders
const allAssets = {
  backgrounds: [
    '10032.jpeg', '11123.jpeg', '11233.jpeg', '11393.jpeg', '11937.jpeg', '12343.jpeg', '12435.jpeg', '12545.jpeg',
    '13200.jpeg', '13230.jpeg', '13454.jpeg', '13485.jpeg', '13546.jpeg', '13748.jpeg', '13828.jpeg', '13833.jpeg',
    '14334.jpeg', '14533.jpeg', '15667.jpeg', '16236.jpeg', '17623.jpeg', '18319.jpeg', '18872.jpeg', '18923.jpeg',
    '20330.jpg', '22340.jpeg', '22344.jpeg', '22356.jpeg', '23494.jpeg', '23563.jpeg', '23723.jpeg', '23763.jpeg',
    '23891.jpeg', '23894.jpeg', '24334.jpeg', '25789.jpeg', '26262.jpeg', '27623.jpeg', '31384.jpeg', '32343.jpeg',
    '32372.jpeg', '33423.jpeg', '33533.jpeg', '34256.jpeg', '34333.jpeg', '34347.jpeg', '34465.jpeg', '34546.jpeg',
    '34577.jpeg', '34784.jpeg', '34822.jpeg', '35236.jpeg', '35323.jpeg', '35633.jpeg', '36356.jpeg', '36376.jpeg',
    '36383.jpeg', '36536.jpeg', '37627.jpeg', '37632.jpeg', '38473.jpeg', '38923.jpeg', '40024.jpeg', '43234.jpeg',
    '43345.jpeg', '43435.jpeg', '43455.jpeg', '43578.jpeg', '44284.jpeg', '44321.jpeg', '44783.jpeg', '44784.jpeg',
    '45223.jpeg', '45353.jpeg', '45355.jpeg', '46666.jpeg', '47843.jpeg', '52376.jpeg', '53632.jpeg', '54355.jpeg',
    '55330.jpeg', '55445.jpeg', '56351.jpeg', '56353.jpeg', '56356.jpeg', '56363.jpeg', '56378.jpeg', '56435.jpeg',
    '56764.jpeg', '58583.jpeg', '58955.jpeg', '63333.jpeg', '63343.jpeg', '63564.jpeg', '63632.jpeg', '63763.jpeg',
    '64344.jpeg', '64356.jpeg', '64444.jpeg', '64556.jpeg', '64723.jpeg', '64744.jpeg', '64748.jpeg', '65646.jpeg',
    '65677.jpeg', '66755.jpeg', '67823.jpeg', '68113.jpeg', '68445.jpeg', '73532.jpeg', '73747.jpeg', '74785.jpeg',
    '75785.jpeg', '76463.jpeg', '76476.gif', '76478.jpeg', '76678.jpeg', '77865.jpeg', '78237.jpeg', '78378.jpeg',
    '78463.jpeg', '78571.jpeg', '78575.jpeg', '78578.jpeg', '78589.jpeg', '80980.jpeg', '82376.jpeg', '83783.jpeg',
    '84123.jpeg', '84262.jpeg', '84578.jpeg', '85736.jpeg', '87365.jpeg', '87564.jpeg', '87653.jpeg', '87654.jpeg',
    '87876.jpeg', '87888.jpeg', '88756.jpeg', '88778.jpeg', '88933.jpeg', '89123.jpeg', '89245.jpeg', '89333.jpeg',
    '89435.png', '89523.jpeg', '89534.jpeg', '89578.jpeg', '89589.jpeg', '89745.jpeg', '89781.jpeg', '89784.jpeg',
    '89785.jpeg', '89893.jpeg', '89894.jpeg', '90888.jpeg', '94333.jpeg', '95763.jpeg', '95784.jpeg', '96243.jpeg',
    '96857.jpeg', '97412.jpeg', '97853.jpeg', '98363.jpeg', '98372.jpeg', '98524.jpeg', '98934.jpeg', '99811.jpeg',
    '99892.jpeg', '99939.jpeg'
  ],
  symbols: [
    '030855.png', '031033.png', '031120.png', '031218.png', '031513.png', '031556.png', '031656.png', '031835.png',
    '031949.png', '032112.png', '032221.png', '032314.png', '032428.png', '032617.png', '032742.png', '032846.png',
    '033007.png', '033054.png', '033155.png', '033331.png', '136450.png', '206970.png', '210862.png', '212452.png',
    '234566.png', '567554.png', '673038.png'
  ],
  scratchTextures: [
    '12456.jpg', '23435.jpeg', '23455.jpeg', '24567.jpeg', '32413.jpeg', '32456.jpeg', '34456.jpeg', '34522.jpeg',
    '34636.jpeg', '35605.jpeg', '36744.jpeg', '36764.jpeg', '43565.jpeg', '43566.jpeg', '45678.jpeg', '74355.jpeg',
    '76523.jpeg', '76533.jpeg', '76543.jpeg', '76577.jpeg', '84633.jpeg', '87433.jpeg', '87634.jpeg', '89765.jpeg',
    '98760.jpeg', '98765.jpeg'
  ],
  audio: [
    '25633.mp3', '45434.mp3', '45637.mp3', '53343.mp3', '55236.mp3', '56356.mp3', '56535.mp3', '78764.mp3',
    '89723.mp3', '97822.mp3'
  ]
};

// Pagination for assets
const itemsPerPage = 12; // Load 12 items at a time for backgrounds, symbols, textures
const audioItemsPerPage = 8; // Load 8 items at a time for audio

const loadedAssets = {
  backgrounds: { items: [], page: 0 },
  symbols: { items: [], page: 0 },
  scratchTextures: { items: [], page: 0 },
  audio: { items: [], page: 0 }
};

// Store base64 data for uploaded files
const uploadedFiles = {
  backgroundImage: null,
  symbol: null,
  soundEffect: null,
  scratchTexture: null
};

// Store selected assets - FIXED: Better structure
let selectedAssets = {
  background: null,
  symbol: null,
  scratchTexture: null,
  soundEffect: null
};

// Audio playback control
let currentlyPlayingAudio = null;
let currentlyPlayingElement = null;

// Project naming system
function generateProjectId() {
  const existingProjects = JSON.parse(localStorage.getItem('mastermProjects') || '[]');
  const existingIds = existingProjects.map(p => p.autoId || p.id).filter(id => typeof id === 'string' && id.match(/^\d+[a-z]\d{3}$/));
  
  let maxPrefix = 0;
  let maxSuffix = 0;
  let currentLetter = 'a';
  
  existingIds.forEach(id => {
    const match = id.match(/^(\d+)([a-z])(\d{3})$/);
    if (match) {
      const prefix = parseInt(match[1]);
      const letter = match[2];
      const suffix = parseInt(match[3]);
      
      if (prefix > maxPrefix || (prefix === maxPrefix && letter >= currentLetter)) {
        if (prefix > maxPrefix) {
          maxPrefix = prefix;
          currentLetter = 'a';
          maxSuffix = 0;
        } else if (letter > currentLetter) {
          currentLetter = letter;
          maxSuffix = 0;
        } else if (letter === currentLetter && suffix >= maxSuffix) {
          maxSuffix = suffix;
        }
      }
    }
  });
  
  // Generate next ID
  maxSuffix++;
  if (maxSuffix > 999) {
    maxSuffix = 1;
    if (currentLetter === 'z') {
      maxPrefix++;
      currentLetter = 'a';
    } else {
      currentLetter = String.fromCharCode(currentLetter.charCodeAt(0) + 1);
    }
  }
  
  if (maxPrefix === 0) maxPrefix = 1;
  
  return `${maxPrefix}${currentLetter}${maxSuffix.toString().padStart(3, '0')}`;
}

function showProjectNameDialog(callback) {
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    backdrop-filter: blur(5px);
  `;

  const autoId = generateProjectId();
  
  modal.innerHTML = `
    <div style="background: white; padding: 2rem; border-radius: 20px; max-width: 500px; width: 90%; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);">
      <h2 style="color: #4a5568; margin-bottom: 1rem; font-size: 1.8rem;">📝 Name Your Project</h2>
      <p style="color: #718096; margin-bottom: 1.5rem;">Give your project a custom name or use the auto-generated ID.</p>
      
      <div style="margin-bottom: 1.5rem;">
        <label style="display: block; color: #4a5568; font-weight: bold; margin-bottom: 0.5rem;">Custom Name (optional):</label>
        <input type="text" id="customProjectName" placeholder="My Amazing Card Project" 
               style="width: 100%; padding: 0.75rem; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 1rem;">
      </div>
      
      <div style="background: #f7fafc; padding: 1rem; border-radius: 10px; margin-bottom: 1.5rem;">
        <p style="color: #718096; font-size: 0.9rem; margin-bottom: 0.5rem;">Auto-generated ID:</p>
        <code style="background: #e2e8f0; padding: 0.25rem 0.5rem; border-radius: 4px; font-family: monospace; color: #4a5568;">${autoId}</code>
        <p style="color: #a0aec0; font-size: 0.8rem; margin-top: 0.5rem;">This ID will be used if no custom name is provided</p>
      </div>
      
      <div style="display: flex; gap: 1rem; justify-content: center;">
        <button id="cancelProjectName" 
                style="background: #e2e8f0; color: #4a5568; border: none; padding: 0.75rem 1.5rem; border-radius: 10px; cursor: pointer; font-weight: bold;">
          Cancel
        </button>
        <button id="saveProjectName" 
                style="background: #667eea; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 10px; cursor: pointer; font-weight: bold;">
          Save Project
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  const customNameInput = modal.querySelector('#customProjectName');
  const saveBtn = modal.querySelector('#saveProjectName');
  const cancelBtn = modal.querySelector('#cancelProjectName');
  
  // Focus on input
  customNameInput.focus();
  
  // Handle enter key
  customNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      saveBtn.click();
    }
  });
  
  saveBtn.addEventListener('click', () => {
    const customName = customNameInput.value.trim();
    const finalName = customName || autoId;
    document.body.removeChild(modal);
    callback(finalName, autoId);
  });
  
  cancelBtn.addEventListener('click', () => {
    document.body.removeChild(modal);
    callback(null);
  });
  
  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
      callback(null);
    }
  });
}

// Enhanced Project Management Functions
function saveCurrentProject(projectName = null, autoId = null) {
  if (!currentProject) {
    currentProject = {
      id: Date.now(),
      name: projectName || generateProjectId(),
      autoId: autoId || generateProjectId(),
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };
  } else {
    if (projectName) {
      currentProject.name = projectName;
    }
    if (autoId) {
      currentProject.autoId = autoId;
    }
  }
  
  currentProject.lastModified = new Date().toISOString();
  currentProject.data = {
    template: currentTemplate,
    selectedAssets: {...selectedAssets},
    uploadedFiles: {...uploadedFiles},
    senderName: senderNameInput?.textContent?.replace('From ', '').trim() || '',
    hiddenMessage: hiddenMessageInput?.value?.trim() || '',
    elements: Array.from(document.querySelectorAll('.card-element')).map(el => ({
      type: el.classList.contains('sender-name') ? 'sender' : 
            el.classList.contains('scratch-area') ? 'scratch' : 'symbol',
      content: el.textContent.trim(),
      style: {
        left: el.style.left,
        top: el.style.top,
        width: el.style.width,
        height: el.style.height,
        fontSize: el.style.fontSize,
        opacity: el.style.opacity
      }
    })),
    cardStyle: {
      backgroundImage: cardPreview?.style.backgroundImage || '',
      className: cardPreview?.className || ''
    }
  };
  
  // Save to localStorage
  let savedProjects = JSON.parse(localStorage.getItem('mastermProjects') || '[]');
  const existingIndex = savedProjects.findIndex(p => p.id === currentProject.id);
  
  if (existingIndex >= 0) {
    savedProjects[existingIndex] = currentProject;
  } else {
    savedProjects.push(currentProject);
  }
  
  localStorage.setItem('mastermProjects', JSON.stringify(savedProjects));
  hasUnsavedChanges = false;
  console.log('✅ Project saved:', currentProject.name);
}

function loadProject(projectId) {
  const savedProjects = JSON.parse(localStorage.getItem('mastermProjects') || '[]');
  const project = savedProjects.find(p => p.id === projectId);
  
  if (!project || !project.data) {
    console.error('Project not found or invalid');
    return;
  }
  
  currentProject = project;
  const data = project.data;
  
  // Clear history when loading a new project
  projectHistory = [];
  historyIndex = -1;
  
  // Restore template
  currentTemplate = data.template || 'classic';
  selectTemplate(currentTemplate);
  
  // Restore selected assets
  selectedAssets = {...data.selectedAssets};
  uploadedFiles.backgroundImage = data.uploadedFiles?.backgroundImage || null;
  uploadedFiles.symbol = data.uploadedFiles?.symbol || null;
  uploadedFiles.scratchTexture = data.uploadedFiles?.scratchTexture || null;
  uploadedFiles.soundEffect = data.uploadedFiles?.soundEffect || null;
  
  // Restore form inputs
  if (senderNameInput && data.senderName) {
    senderNameInput.textContent = `From ${data.senderName}`;
  }
  if (hiddenMessageInput && data.hiddenMessage) {
    hiddenMessageInput.value = data.hiddenMessage;
  }
  
  // Restore card styling
  if (data.cardStyle?.backgroundImage) {
    cardPreview.style.backgroundImage = data.cardStyle.backgroundImage;
    cardPreview.style.backgroundSize = 'cover';
    cardPreview.style.backgroundPosition = 'center';
  }
  if (data.cardStyle?.className) {
    cardPreview.className = data.cardStyle.className;
  }
  
  // Apply all selected assets to the preview
  updatePreview();
  
  // Save initial state to history
  saveToHistory();
  hasUnsavedChanges = false;
  
  console.log('✅ Project loaded:', project.name);
}

function showMyProjects() {
  const savedProjects = JSON.parse(localStorage.getItem('mastermProjects') || '[]');
  
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    backdrop-filter: blur(5px);
  `;

  modal.innerHTML = `
    <div style="background: white; padding: 2rem; border-radius: 20px; max-width: 700px; width: 90%; max-height: 80vh; overflow-y: auto; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <h2 style="color: #4a5568; font-size: 1.8rem;">📁 My Projects</h2>
        <button onclick="document.body.removeChild(this.closest('.projects-modal'))" 
                style="background: none; border: none; font-size: 1.8rem; cursor: pointer; color: #718096;">×</button>
      </div>
      <div id="projectsList">
        ${savedProjects.length === 0 ? 
          '<p style="text-align: center; color: #718096; padding: 2rem;">No projects yet. Start creating!</p>' :
          savedProjects.map(project => `
            <div style="border: 2px solid #e2e8f0; border-radius: 12px; padding: 1rem; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center; transition: all 0.3s ease;" 
                 onmouseover="this.style.borderColor='#667eea'" onmouseout="this.style.borderColor='#e2e8f0'">
              <div style="cursor: pointer; flex-grow: 1;" onclick="loadProjectAndClose(${project.id})">
                <h3 style="color: #4a5568; margin-bottom: 0.5rem;">${project.name}</h3>
                ${project.autoId ? `<p style="color: #a0aec0; font-size: 0.8rem; font-family: monospace;">ID: ${project.autoId}</p>` : ''}
                <p style="color: #718096; font-size: 0.9rem;">Last modified: ${new Date(project.lastModified).toLocaleString()}</p>
              </div>
              <button onclick="deleteProject(${project.id})" 
                      style="background: #ff6b6b; color: white; border: none; padding: 0.5rem; border-radius: 8px; cursor: pointer; margin-left: 1rem;"
                      title="Delete Project">🗑️</button>
            </div>
          `).join('')
        }
      </div>
      <div style="margin-top: 1.5rem; text-align: center;">
        <button onclick="document.body.removeChild(this.closest('.projects-modal'))" 
                style="background: #667eea; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 10px; cursor: pointer; font-weight: bold;">
          Close
        </button>
      </div>
    </div>
  `;
  
  modal.className = 'projects-modal';
  document.body.appendChild(modal);
  
  // Add global functions for the modal
  window.loadProjectAndClose = function(projectId) {
    loadProject(projectId);
    document.body.removeChild(modal);
  };
  
  window.deleteProject = function(projectId) {
    if (confirm('Are you sure you want to delete this project?')) {
      let savedProjects = JSON.parse(localStorage.getItem('mastermProjects') || '[]');
      savedProjects = savedProjects.filter(p => p.id !== projectId);
      localStorage.setItem('mastermProjects', JSON.stringify(savedProjects));
      
      // Refresh the modal
      document.body.removeChild(modal);
      showMyProjects();
    }
  };
}

// Modified auto-save - only on page unload
function setupAutoSave() {
  // Auto-save on page unload/exit
  window.addEventListener('beforeunload', (e) => {
    if (hasUnsavedChanges && (currentProject || senderNameInput?.textContent || hiddenMessageInput?.value)) {
      // Save without dialog if project exists
      if (currentProject) {
        saveCurrentProject();
      } else {
        // For new projects, save with auto-generated name
        const autoId = generateProjectId();
        saveCurrentProject(autoId, autoId);
      }
    }
  });
  
  // Also save on page hide (mobile/tab switching)
  window.addEventListener('pagehide', () => {
    if (hasUnsavedChanges && (currentProject || senderNameInput?.textContent || hiddenMessageInput?.value)) {
      if (currentProject) {
        saveCurrentProject();
      } else {
        const autoId = generateProjectId();
        saveCurrentProject(autoId, autoId);
      }
    }
  });
}

// Enhanced History management for undo/redo
function saveToHistory() {
  // Don't save during restoration
  if (isAutoSaveEnabled === false) return;
  
  const state = {
    selectedAssets: {...selectedAssets},
    uploadedFiles: {...uploadedFiles},
    senderName: senderNameInput?.textContent || '',
    hiddenMessage: hiddenMessageInput?.value || '',
    template: currentTemplate,
    // Store element states instead of HTML
    elements: Array.from(document.querySelectorAll('.card-element')).map(el => ({
      id: el.id,
      className: el.className,
      textContent: el.textContent.trim(),
      innerHTML: el.innerHTML,
      style: {
        left: el.style.left,
        top: el.style.top,
        width: el.style.width,
        height: el.style.height,
        fontSize: el.style.fontSize,
        opacity: el.style.opacity,
        backgroundImage: el.style.backgroundImage,
        backgroundSize: el.style.backgroundSize,
        backgroundPosition: el.style.backgroundPosition
      }
    })),
    cardStyle: {
      backgroundImage: cardPreview?.style.backgroundImage || '',
      className: cardPreview?.className || ''
    }
  };
  
  // Remove future history if we're not at the end
  if (historyIndex < projectHistory.length - 1) {
    projectHistory = projectHistory.slice(0, historyIndex + 1);
  }
  
  projectHistory.push(state);
  historyIndex = projectHistory.length - 1;
  
  // Limit history to 50 steps
  if (projectHistory.length > 50) {
    projectHistory.shift();
    historyIndex--;
  }
  
  hasUnsavedChanges = true;
  updateUndoRedoButtons();
  console.log('📝 State saved to history. Index:', historyIndex, 'Total:', projectHistory.length);
}
// Enhanced undo function with better error handling
function undo() {
  console.log('🔙 Undo called, current index:', historyIndex, 'history length:', projectHistory.length);
  
  if (historyIndex > 0) {
    historyIndex--;
    console.log('📍 Moving to history index:', historyIndex);
    
    const stateToRestore = projectHistory[historyIndex];
    if (stateToRestore) {
      console.log('📝 State found, attempting restore...');
      restoreState(stateToRestore);
      updateUndoRedoButtons();
      console.log('↶ Undo executed successfully. New index:', historyIndex);
    } else {
      console.error('❌ No state found at index:', historyIndex);
    }
  } else {
    console.log('⚠️ Cannot undo - at beginning of history');
  }
}

// Enhanced redo function with better error handling
function redo() {
  console.log('🔜 Redo called, current index:', historyIndex, 'history length:', projectHistory.length);
  
  if (historyIndex < projectHistory.length - 1) {
    historyIndex++;
    console.log('📍 Moving to history index:', historyIndex);
    
    const stateToRestore = projectHistory[historyIndex];
    if (stateToRestore) {
      console.log('📝 State found, attempting restore...');
      restoreState(stateToRestore);
      updateUndoRedoButtons();
      console.log('↷ Redo executed successfully. New index:', historyIndex);
    } else {
      console.error('❌ No state found at index:', historyIndex);
    }
  } else {
    console.log('⚠️ Cannot redo - at end of history');
  }
}

// First, let's add some debugging to find the exact issue
function debugState() {
  console.log('=== STATE DEBUG ===');
  console.log('selectedAssets type:', typeof selectedAssets);
  console.log('selectedAssets:', selectedAssets);
  console.log('uploadedFiles type:', typeof uploadedFiles);
  console.log('uploadedFiles:', uploadedFiles);
  console.log('currentTemplate type:', typeof currentTemplate);
  console.log('currentTemplate:', currentTemplate);
  console.log('historyIndex:', historyIndex);
  console.log('projectHistory length:', projectHistory.length);
  console.log('==================');
}

// Safe version of restoreState that handles potential const conflicts
function restoreState(stateToRestore) {
  console.log('🔄 Starting state restoration...');
  
  // Add debug info
  debugState();
  
  // Temporarily disable saving to history during restoration
  isAutoSaveEnabled = false;
  
  try {
    console.log('State to restore:', stateToRestore);
    
    // Use try-catch for each assignment to isolate the problem
    try {
      // Method 1: Direct property assignment (safest)
      if (stateToRestore.selectedAssets) {
        Object.keys(stateToRestore.selectedAssets).forEach(key => {
          selectedAssets[key] = stateToRestore.selectedAssets[key];
        });
        console.log('✅ selectedAssets restored');
      }
    } catch (e) {
      console.error('❌ Error restoring selectedAssets:', e);
    }
    
    try {
      if (stateToRestore.uploadedFiles) {
        Object.keys(stateToRestore.uploadedFiles).forEach(key => {
          uploadedFiles[key] = stateToRestore.uploadedFiles[key];
        });
        console.log('✅ uploadedFiles restored');
      }
    } catch (e) {
      console.error('❌ Error restoring uploadedFiles:', e);
    }
    
    try {
      if (stateToRestore.template) {
        currentTemplate = stateToRestore.template;
        console.log('✅ currentTemplate restored');
      }
    } catch (e) {
      console.error('❌ Error restoring currentTemplate:', e);
    }
    
    // Restore form inputs
    try {
      if (senderNameInput && stateToRestore.senderName) {
        senderNameInput.textContent = stateToRestore.senderName;
        console.log('✅ senderName restored');
      }
    } catch (e) {
      console.error('❌ Error restoring senderName:', e);
    }
    
    try {
      if (hiddenMessageInput && stateToRestore.hiddenMessage) {
        hiddenMessageInput.value = stateToRestore.hiddenMessage;
        console.log('✅ hiddenMessage restored');
      }
    } catch (e) {
      console.error('❌ Error restoring hiddenMessage:', e);
    }
    
    // Restore card preview background and class
    try {
      if (cardPreview && stateToRestore.cardStyle) {
        cardPreview.style.backgroundImage = stateToRestore.cardStyle.backgroundImage || '';
        cardPreview.className = stateToRestore.cardStyle.className || 'card-preview floating';
        console.log('✅ cardStyle restored');
      }
    } catch (e) {
      console.error('❌ Error restoring cardStyle:', e);
    }
    
    // Clear existing elements
    try {
      document.querySelectorAll('.card-element').forEach(el => el.remove());
      console.log('✅ Existing elements cleared');
    } catch (e) {
      console.error('❌ Error clearing elements:', e);
    }
    
    // Restore elements from stored state
    try {
      if (stateToRestore.elements && Array.isArray(stateToRestore.elements)) {
        stateToRestore.elements.forEach((elementData, index) => {
          try {
            const element = document.createElement('div');
            element.id = elementData.id || `element-${index}`;
            element.className = elementData.className || 'card-element';
            element.innerHTML = elementData.innerHTML || elementData.textContent || '';
            
            // Restore styles safely
            if (elementData.style && typeof elementData.style === 'object') {
              Object.keys(elementData.style).forEach(prop => {
                if (elementData.style[prop]) {
                  element.style[prop] = elementData.style[prop];
                }
              });
            }
            
            if (cardPreview) {
              cardPreview.appendChild(element);
            }
          } catch (elemError) {
            console.error(`❌ Error restoring element ${index}:`, elemError);
          }
        });
        console.log('✅ Elements restored');
      }
    } catch (e) {
      console.error('❌ Error restoring elements:', e);
    }
    
    // Re-initialize interactivity
    try {
      if (typeof initializeCardElements === 'function') {
        initializeCardElements();
        console.log('✅ Card elements initialized');
      }
    } catch (e) {
      console.error('❌ Error initializing card elements:', e);
    }
    
    try {
      if (typeof updateActiveAssets === 'function') {
        updateActiveAssets();
        console.log('✅ Active assets updated');
      }
    } catch (e) {
      console.error('❌ Error updating active assets:', e);
    }
    
    try {
      if (typeof updatePreview === 'function') {
        updatePreview();
        console.log('✅ Preview updated');
      }
    } catch (e) {
      console.error('❌ Error updating preview:', e);
    }
    
    console.log('🔄 State restoration completed successfully');
    
  } catch (error) {
    console.error('❌ Critical error in restoreState:', error);
    console.error('Error stack:', error.stack);
  } finally {
    // Always re-enable auto-save
    isAutoSaveEnabled = true;
    console.log('🔄 Auto-save re-enabled');
  }
}
function updateUndoRedoButtons() {
  const undoBtn = document.querySelector('.undo-btn');
  const redoBtn = document.querySelector('.redo-btn');
  
  if (undoBtn) {
    undoBtn.disabled = historyIndex <= 0;
    undoBtn.style.opacity = historyIndex <= 0 ? '0.5' : '1';
    undoBtn.style.cursor = historyIndex <= 0 ? 'not-allowed' : 'pointer';
  }
  if (redoBtn) {
    redoBtn.disabled = historyIndex >= projectHistory.length - 1;
    redoBtn.style.opacity = historyIndex >= projectHistory.length - 1 ? '0.5' : '1';
    redoBtn.style.cursor = historyIndex >= projectHistory.length - 1 ? 'not-allowed' : 'pointer';
  }
}

// Add undo/redo button functionality
function initializeUndoRedo() {
  const undoBtn = document.querySelector('.undo-btn');
  const redoBtn = document.querySelector('.redo-btn');
  
  if (undoBtn) {
    undoBtn.addEventListener('click', undo);
    undoBtn.title = 'Undo (Ctrl+Z)';
  }
  
  if (redoBtn) {
    redoBtn.addEventListener('click', redo);
    redoBtn.title = 'Redo (Ctrl+Y)';
  }
  
 // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    console.log('Key pressed:', e.key, 'Ctrl:', e.ctrlKey, 'Meta:', e.metaKey);
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'z' && !e.shiftKey) {
        console.log('Undo shortcut triggered');
        e.preventDefault();
        undo();
      } else if ((e.key === 'y') || (e.key === 'z' && e.shiftKey)) {
        console.log('Redo shortcut triggered');
        e.preventDefault();
        redo();
      }
    }
  });
}

function updateActiveAssets() {
  // Update active states in grids based on selected assets
  ['backgrounds', 'symbols', 'scratchTextures', 'audio'].forEach(type => {
    const grid = document.getElementById(`${type}Grid`);
    if (grid) {
      grid.querySelectorAll('.active').forEach(item => item.classList.remove('active'));
      
      const assetKey = type === 'scratchTextures' ? 'scratchTexture' : 
                      type === 'audio' ? 'soundEffect' : 
                      type.slice(0, -1);
      
      if (selectedAssets[assetKey]) {
        const items = grid.querySelectorAll(`[data-${assetKey}="${selectedAssets[assetKey]}"], [data-${type.slice(0, -1)}="${selectedAssets[assetKey]}"]`);
        items.forEach(item => item.classList.add('active'));
      }
    }
  });
}

// Template switching functionality
function initializeTemplates() {
  const templateGrid = document.querySelector('.template-grid');
  if (templateGrid) {
    templateGrid.innerHTML = `
      <div class="template-card active" data-template="classic">Classic Template</div>
      <div class="template-card" data-template="blank">Blank Template</div>
    `;
    
    templateGrid.querySelectorAll('.template-card').forEach(card => {
      card.addEventListener('click', function() {
        selectTemplate(this.dataset.template);
        // Initialize first history state after a delay to ensure DOM is ready
        setTimeout(() => {
          console.log('Saving initial history state');
          saveToHistory();
          console.log('Initial history saved. Index:', historyIndex, 'Total:', projectHistory.length);
        }, 100);
            });
          });
        }
      }
// Clean updateSenderNameOnCard function without ANY styling
function updateSenderNameOnCard(senderName) {
  const cardPreview = document.getElementById('cardPreview');
  let senderElement = document.getElementById('senderName');
  
  if (senderName && senderName.trim() !== '') {
    if (!senderElement) {
      senderElement = document.createElement('div');
      senderElement.className = 'card-element sender-name';
      senderElement.id = 'senderName';
      senderElement.textContent = `From ${senderName}`;
      
      ['nw', 'ne', 'sw', 'se'].forEach(pos => {
        const handle = document.createElement('div');
        handle.className = `resize-handle ${pos}`;
        senderElement.appendChild(handle);
      });
      
      cardPreview.appendChild(senderElement);
      makeElementInteractive(senderElement);
    } else {
      const handles = senderElement.querySelectorAll('.resize-handle');
      senderElement.innerHTML = `From ${senderName}`;
      handles.forEach(handle => senderElement.appendChild(handle));
    }
  } else {
    if (senderElement) {
      senderElement.remove();
    }
  }
}

// FIXED: selectTemplate function - TRANSPARENT ELEMENTS IN CLASSIC TEMPLATE
function selectTemplate(templateType) {
  document.querySelectorAll('.template-card').forEach(card => {
    card.classList.remove('active');
  });
  document.querySelector(`[data-template="${templateType}"]`)?.classList.add('active');
  
  currentTemplate = templateType;
  const cardPreview = document.getElementById('cardPreview');
  
  if (templateType === 'blank') {
    // Blank template: completely empty but ready for dynamic element creation
    cardPreview.innerHTML = '';
    cardPreview.dataset.template = 'blank';
  } else {
    // ✅ CLASSIC TEMPLATE WITH ABSOLUTELY TRANSPARENT ELEMENTS
    cardPreview.innerHTML = `
      <div class="card-element sender-name" id="senderName" style="background: transparent; background-color: transparent;">
        From Sarah
        <div class="resize-handle nw"></div>
        <div class="resize-handle ne"></div>
        <div class="resize-handle sw"></div>
        <div class="resize-handle se"></div>
      </div>
      <div class="card-element scratch-area" id="scratchArea" style="background: transparent; background-color: transparent;">
        <p>Scratch here to reveal your message!</p>
        <div class="resize-handle nw"></div>
        <div class="resize-handle ne"></div>
        <div class="resize-handle sw"></div>
        <div class="resize-handle se"></div>
      </div>
      <div class="card-element card-symbol" id="cardSymbol" style="background: transparent; background-color: transparent;">
        ❤️
        <div class="resize-handle nw"></div>
        <div class="resize-handle ne"></div>
        <div class="resize-handle sw"></div>
        <div class="resize-handle se"></div>
      </div>
    `;
    cardPreview.dataset.template = 'classic';
  }
  initializeCardElements();
}
// Make card elements interactive
function initializeCardElements() {
  document.querySelectorAll('.card-element').forEach(element => {
    makeElementInteractive(element);
  });
}

function makeElementInteractive(element) {
  // Click to select
  element.addEventListener('click', function(e) {
    e.stopPropagation();
    selectCardElement(this);
  });

  // Double-click to show delete
  element.addEventListener('dblclick', function(e) {
    e.stopPropagation();
    showDeleteX(this);
  });

  // DRAG functionality - ONLY on the element itself, NOT on handles
  element.addEventListener('mousedown', function(e) {
    // CRITICAL: Completely block if clicking on resize handle or delete button
    if (e.target.classList.contains('resize-handle') || 
        e.target.classList.contains('delete-x') ||
        e.target.closest('.resize-handle') ||
        e.target.closest('.delete-x')) {
      return; // Do absolutely nothing - let resize handle it
    }
    
    console.log('🎯 Starting DRAG operation');
    isDragging = true;
    selectedElement = this;
    selectCardElement(this);
    
    // Tutorial-style drag logic
    let startX = e.clientX;
    let startY = e.clientY;
    
    function handleMouseMove(e) {
      if (!isDragging || !selectedElement) return;
      
      // Calculate distance moved (tutorial logic)
      let newX = startX - e.clientX;
      let newY = startY - e.clientY;
      
      // Reset start position for next move
      startX = e.clientX;
      startY = e.clientY;
      
      // Get current position
      const currentLeft = parseInt(selectedElement.style.left) || 0;
      const currentTop = parseInt(selectedElement.style.top) || 0;
      
      // Apply movement
      let finalX = currentLeft - newX;
      let finalY = currentTop - newY;
      
      // Boundary constraints
      const cardRect = document.getElementById('cardPreview').getBoundingClientRect();
      const elementWidth = selectedElement.offsetWidth;
      const elementHeight = selectedElement.offsetHeight;
      
      finalX = Math.max(0, Math.min(finalX, cardRect.width - elementWidth));
      finalY = Math.max(0, Math.min(finalY, cardRect.height - elementHeight));
      
      // Apply position
      selectedElement.style.position = 'absolute';
      selectedElement.style.left = finalX + 'px';
      selectedElement.style.top = finalY + 'px';
    }
    
    function handleMouseUp() {
      console.log('🎯 Ending DRAG operation');
      isDragging = false;
      selectedElement.style.cursor = 'move';
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      setTimeout(() => saveToHistory(), 50);
    }
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    this.style.cursor = 'grabbing';
    e.preventDefault();
  });

  // RESIZE functionality - ONLY on handles, completely separate from drag
  const handles = element.querySelectorAll('.resize-handle');
  handles.forEach(handle => {
    handle.addEventListener('mousedown', function(e) {
      e.stopPropagation(); // Prevent drag handler from firing
      e.preventDefault();
      
      console.log('📏 Starting RESIZE operation on handle:', this.className);
      isResizing = true;
      selectedElement = element;
      
      const handleType = this.className.split(' ')[1]; // nw, ne, sw, se
      const startMouseX = e.clientX;
      const startMouseY = e.clientY;
      
      // Get initial element state
      const cardRect = document.getElementById('cardPreview').getBoundingClientRect();
      const initialRect = element.getBoundingClientRect();
      const initialX = initialRect.left - cardRect.left;
      const initialY = initialRect.top - cardRect.top;
      const initialWidth = initialRect.width;
      const initialHeight = initialRect.height;
      
      function handleResizeMove(e) {
        if (!isResizing) return;
        
        const deltaX = e.clientX - startMouseX;
        const deltaY = e.clientY - startMouseY;
        
        let newX = initialX;
        let newY = initialY;
        let newWidth = initialWidth;
        let newHeight = initialHeight;
        
        switch(handleType) {
          case 'se': // Bottom-right: grow/shrink from top-left anchor
            newWidth = Math.max(30, initialWidth + deltaX);
            newHeight = Math.max(20, initialHeight + deltaY);
            break;
            
          case 'sw': // Bottom-left: adjust width and height, move X
            newWidth = Math.max(30, initialWidth - deltaX);
            newHeight = Math.max(20, initialHeight + deltaY);
            if (newWidth >= 30) newX = initialX + deltaX;
            break;
            
          case 'ne': // Top-right: adjust width and height, move Y
            newWidth = Math.max(30, initialWidth + deltaX);
            newHeight = Math.max(20, initialHeight - deltaY);
            if (newHeight >= 20) newY = initialY + deltaY;
            break;
            
          case 'nw': // Top-left: adjust both dimensions and position
            newWidth = Math.max(30, initialWidth - deltaX);
            newHeight = Math.max(20, initialHeight - deltaY);
            if (newWidth >= 30) newX = initialX + deltaX;
            if (newHeight >= 20) newY = initialY + deltaY;
            break;
        }
        
        // Apply the changes
        element.style.position = 'absolute';
        element.style.left = newX + 'px';
        element.style.top = newY + 'px';
        element.style.width = newWidth + 'px';
        element.style.height = newHeight + 'px';
      }
      
      function handleResizeUp() {
        console.log('📏 Ending RESIZE operation');
        isResizing = false;
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeUp);
        setTimeout(() => saveToHistory(), 50);
      }
      
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeUp);
    });
  });
}
function showDeleteX(element) {
  // Remove existing delete buttons
  document.querySelectorAll('.delete-x').forEach(x => x.remove());
  
  const deleteX = document.createElement('div');
  deleteX.className = 'delete-x';
  deleteX.textContent = '×';
  deleteX.style.cssText = `
    position: absolute;
    top: -12px;
    right: -12px;
    width: 24px;
    height: 24px;
    background: #ff4757;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 16px;
    font-weight: bold;
    z-index: 9999;
    border: 2px solid white;
  `;
  
  deleteX.onclick = function(e) {
    e.stopPropagation();
    
    // Clear selected assets based on element type
    if (element.classList.contains('scratch-area')) selectedAssets.scratchTexture = null;
    if (element.classList.contains('card-symbol')) selectedAssets.symbol = null;
    if (element.classList.contains('sender-name')) selectedAssets.senderName = null;
    
    element.remove();
    saveToHistory();
  };
  
  element.style.position = 'relative';
  element.appendChild(deleteX);
  
  // Remove after 4 seconds or on outside click
  setTimeout(() => deleteX.remove(), 4000);
  document.addEventListener('click', () => deleteX.remove(), { once: true });
}

function handleDrag(e) {
  if (!isDragging || !selectedElement) return;
  
  const cardRect = document.getElementById('cardPreview').getBoundingClientRect();
  
  let newX = e.clientX - dragOffset.x - cardRect.left;
  let newY = e.clientY - dragOffset.y - cardRect.top;
  
  const elementWidth = selectedElement.offsetWidth;
  const elementHeight = selectedElement.offsetHeight;
  
  newX = Math.max(0, Math.min(newX, cardRect.width - elementWidth));
  newY = Math.max(0, Math.min(newY, cardRect.height - elementHeight));
  
  selectedElement.style.position = 'absolute';
  selectedElement.style.left = newX + 'px';
  selectedElement.style.top = newY + 'px';
}

function stopDrag() {
  isDragging = false;
  if (selectedElement) {
    selectedElement.style.cursor = 'move';
  }
  document.removeEventListener('mousemove', handleDrag);
  document.removeEventListener('mouseup', stopDrag);
  
  // Save to history after drag is complete
  setTimeout(() => saveToHistory(), 50);
}

function selectCardElement(element) {
  document.querySelectorAll('.card-element').forEach(el => {
    el.classList.remove('selected');
  });
  
  element.classList.add('selected');
  selectedElement = element;
  updatePropertyPanel(element);
}

function updatePropertyPanel(element) {
  const textInput = document.getElementById('elementText');
  const sizeSlider = document.getElementById('elementSize');
  const fontSelect = document.getElementById('elementFont');
  const colorPicker = document.getElementById('elementColor');
  const opacitySlider = document.getElementById('elementOpacity');
  const sizeValue = document.getElementById('sizeValue');
  const opacityValue = document.getElementById('opacityValue');
  
  if (textInput) {
    if (element.querySelector('p')) {
      textInput.value = element.querySelector('p').textContent.trim();
    } else {
      textInput.value = element.textContent.replace(/From\s/, '').trim();
    }
  }
  
  if (sizeSlider && sizeValue) {
    const fontSize = parseInt(window.getComputedStyle(element).fontSize) || 16;
    sizeSlider.value = fontSize;
    sizeValue.textContent = fontSize + 'px';
  }
  
  if (fontSelect) {
    const fontFamily = window.getComputedStyle(element).fontFamily;
    fontSelect.value = fontFamily;
  }
  
  if (colorPicker) {
    const color = window.getComputedStyle(element).color;
    // Convert RGB to hex if needed
    colorPicker.value = rgbToHex(color) || '#4a5568';
  }
  
  if (opacitySlider && opacityValue) {
    const opacity = Math.round(parseFloat(window.getComputedStyle(element).opacity) * 100);
    opacitySlider.value = opacity;
    opacityValue.textContent = opacity + '%';
  }
}

// Helper function to convert RGB to Hex
function rgbToHex(rgb) {
  if (rgb.startsWith('#')) return rgb;
  
  const result = rgb.match(/\d+/g);
  if (result && result.length >= 3) {
    return "#" + ((1 << 24) + (parseInt(result[0]) << 16) + (parseInt(result[1]) << 8) + parseInt(result[2])).toString(16).slice(1);
  }
  return '#4a5568';
}

// Property controls
function initializePropertyControls() {
  const textTypeDropdown = document.getElementById('textTypeDropdown');
  const textContentInput = document.getElementById('textContentInput');
  const elementSize = document.getElementById('elementSize');
  const elementFont = document.getElementById('elementFont');
  const elementColor = document.getElementById('elementColor');
  const elementOpacity = document.getElementById('elementOpacity');
  const cardOrientation = document.getElementById('cardOrientation');
  const animationType = document.getElementById('animationType');
  const senderNameInput = document.getElementById('senderNameInput');
  const sizeValue = document.getElementById('sizeValue');
  const opacityValue = document.getElementById('opacityValue');

  // Text Type Dropdown - NEW FUNCTIONALITY
  // Text Type Dropdown - ENHANCED WITH VISIBILITY CONTROL
textTypeDropdown?.addEventListener('change', function() {
  const selectedType = this.value;
  const currentElement = getCurrentElementByType(selectedType);
  
  // Handle visibility based on selection
  if (selectedType === 'hiddenMessage') {
    showHiddenMessageForEditing();
  } else {
    hideHiddenMessageFromEditing();
  }
  
  if (currentElement) {
    selectCardElement(currentElement);
    updatePropertyPanelForElement(currentElement);
  } else {
    // Clear the property panel if element doesn't exist
    if (textContentInput) textContentInput.value = '';
  }
});

  // Text Content Input - ENHANCED FOR BOTH TYPES
  textContentInput?.addEventListener('input', function() {
    const selectedType = textTypeDropdown?.value;
    
    if (selectedType === 'senderInfo') {
      updateSenderText(this.value);
    } else if (selectedType === 'hiddenMessage') {
      updateHiddenMessageText(this.value);
    }
    
    hasUnsavedChanges = true;
    clearTimeout(this.historyTimeout);
    this.historyTimeout = setTimeout(() => saveToHistory(), 500);
  });

  // Font Size - APPLIES TO SELECTED TEXT TYPE
  elementSize?.addEventListener('input', function() {
    const selectedType = textTypeDropdown?.value;
    const targetElement = getCurrentElementByType(selectedType);
    
    if (targetElement) {
      targetElement.style.fontSize = this.value + 'px';
      if (sizeValue) sizeValue.textContent = this.value + 'px';
      clearTimeout(this.historyTimeout);
      this.historyTimeout = setTimeout(() => saveToHistory(), 300);
    }
  });

  // Font Family - APPLIES TO SELECTED TEXT TYPE
  elementFont?.addEventListener('change', function() {
    const selectedType = textTypeDropdown?.value;
    const targetElement = getCurrentElementByType(selectedType);
    
    if (targetElement) {
      targetElement.style.fontFamily = this.value;
      clearTimeout(this.historyTimeout);
      this.historyTimeout = setTimeout(() => saveToHistory(), 100);
    }
  });

  // Text Color - APPLIES TO SELECTED TEXT TYPE
  elementColor?.addEventListener('input', function() {
    const selectedType = textTypeDropdown?.value;
    const targetElement = getCurrentElementByType(selectedType);
    
    if (targetElement) {
      targetElement.style.color = this.value;
      clearTimeout(this.historyTimeout);
      this.historyTimeout = setTimeout(() => saveToHistory(), 300);
    }
  });

  // Opacity - APPLIES TO SELECTED TEXT TYPE
  elementOpacity?.addEventListener('input', function() {
    const selectedType = textTypeDropdown?.value;
    const targetElement = getCurrentElementByType(selectedType);
    
    if (targetElement) {
      targetElement.style.opacity = this.value / 100;
      if (opacityValue) opacityValue.textContent = this.value + '%';
      clearTimeout(this.historyTimeout);
      this.historyTimeout = setTimeout(() => saveToHistory(), 300);
    }
  });

  // Sender Name Input (keep existing functionality)
  senderNameInput?.addEventListener('input', function() {
    const senderName = this.value.trim();
    updateSenderNameOnCard(senderName);
    hasUnsavedChanges = true;
    clearTimeout(this.historyTimeout);
    this.historyTimeout = setTimeout(() => saveToHistory(), 500);
  });

  // Color Presets - APPLIES TO SELECTED TEXT TYPE
  document.querySelectorAll('.color-preset').forEach(preset => {
    preset.addEventListener('click', function() {
      const color = this.dataset.color;
      const selectedType = textTypeDropdown?.value;
      const targetElement = getCurrentElementByType(selectedType);
      
      if (targetElement && elementColor) {
        targetElement.style.color = color;
        elementColor.value = color;
        saveToHistory();
      }
    });
  });

  // Card Orientation (keep existing)
  cardOrientation?.addEventListener('change', function() {
    const cardPreview = document.getElementById('cardPreview');
    switch(this.value) {
      case 'portrait':
        cardPreview.style.aspectRatio = '0.625';
        break;
      case 'square':
        cardPreview.style.aspectRatio = '1';
        break;
      default:
        cardPreview.style.aspectRatio = '1.6';
    }
    saveToHistory();
  });

  // Animation Type (keep existing)
  animationType?.addEventListener('change', function() {
    const cardPreview = document.getElementById('cardPreview');
    cardPreview.classList.remove('floating', 'pulsing');
    
    switch(this.value) {
      case 'hearts':
        cardPreview.classList.add('pulsing');
        break;
      case 'sparkles':
        cardPreview.classList.add('floating');
        break;
    }
    saveToHistory();
  });
  // Enhanced Glow Effect Control with Color Selection and Smoke
const glowEffect = document.getElementById('glowEffect') || document.querySelector('#elementGlow') || document.querySelector('input[type="range"][id*="glow"]');
const glowValue = document.getElementById('glowValue') || document.querySelector('#glowDisplay');
const glowColorPicker = document.getElementById('glowColor');
let currentGlowColor = '#667eea'; // Default blue glow

// NEW: Get current element by text type
function getCurrentElementByType(type) {
  if (type === 'senderInfo') {
    return document.getElementById('senderName');
  } else if (type === 'hiddenMessage') {
    // Find hidden message element (could be in scratch area or separate element)
    const scratchArea = document.getElementById('scratchArea');
    if (scratchArea) {
      // Check if there's a hidden message element inside scratch area
      let hiddenMsg = scratchArea.querySelector('.hidden-message');
      if (!hiddenMsg) {
        // Create hidden message element if it doesn't exist
        hiddenMsg = document.createElement('div');
        hiddenMsg.className = 'hidden-message';
        hiddenMsg.style.cssText = 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #333; font-weight: bold; z-index: 10; opacity: 0; transition: opacity 0.3s ease;';
        hiddenMsg.textContent = 'Your hidden message';
        scratchArea.appendChild(hiddenMsg);
      }
      return hiddenMsg;
    }
  }
  return null;
}

// NEW: Update sender text
function updateSenderText(text) {
  let senderElement = document.getElementById('senderName');
  
  if (text && text.trim() !== '') {
    if (!senderElement) {
      const cardPreview = document.getElementById('cardPreview');
      senderElement = document.createElement('div');
      senderElement.className = 'card-element sender-name';
      senderElement.id = 'senderName';
      senderElement.style.cssText = 'position: absolute; top: 20px; left: 20px; color: white; font-weight: 600; font-size: 16px; background: transparent;';
      
      ['nw', 'ne', 'sw', 'se'].forEach(pos => {
        const handle = document.createElement('div');
        handle.className = `resize-handle ${pos}`;
        senderElement.appendChild(handle);
      });
      
      cardPreview.appendChild(senderElement);
      makeElementInteractive(senderElement);
    }
    
    const handles = senderElement.querySelectorAll('.resize-handle');
    senderElement.innerHTML = `From ${text}`;
    handles.forEach(handle => senderElement.appendChild(handle));
  } else {
    if (senderElement) {
      senderElement.remove();
    }
  }
}

// NEW: Update hidden message text
// ENHANCED: Update hidden message text with visibility control
function updateHiddenMessageText(text) {
  const scratchArea = document.getElementById('scratchArea');
  if (!scratchArea) return;
  
  let hiddenMsg = scratchArea.querySelector('.hidden-message');
  if (!hiddenMsg) {
    hiddenMsg = document.createElement('div');
    hiddenMsg.className = 'hidden-message';
    hiddenMsg.style.cssText = `
      position: absolute; 
      top: 50%; 
      left: 50%; 
      transform: translate(-50%, -50%); 
      color: #333; 
      font-weight: bold; 
      z-index: 15; 
      padding: 10px;
      text-align: center;
      word-wrap: break-word;
      max-width: 90%;
      background: rgba(255, 255, 255, 0.9);
      border-radius: 8px;
      opacity: 1;
      transition: all 0.3s ease;
    `;
    scratchArea.appendChild(hiddenMsg);
  }
  
  hiddenMsg.textContent = text || 'Your hidden message';
  
  // Show scratch area background temporarily when editing
  if (text && text.trim() !== '') {
    showHiddenMessageForEditing();
  } else {
    hideHiddenMessageFromEditing();
  }
}

// NEW: Show hidden message for editing (hide scratch texture temporarily)
function showHiddenMessageForEditing() {
  const scratchArea = document.getElementById('scratchArea');
  const hiddenMsg = scratchArea?.querySelector('.hidden-message');
  const textTypeDropdown = document.getElementById('textTypeDropdown');
  
  if (scratchArea && hiddenMsg && textTypeDropdown?.value === 'hiddenMessage') {
    // Store original background for restoration
    if (!scratchArea.dataset.originalBackground) {
      scratchArea.dataset.originalBackground = scratchArea.style.backgroundImage || '';
    }
    
    // Temporarily remove background and show editing state
    scratchArea.style.backgroundImage = '';
    scratchArea.style.background = 'rgba(200, 200, 200, 0.3)';
    scratchArea.style.border = '2px dashed #667eea';
    
    // Make hidden message fully visible
    hiddenMsg.style.opacity = '1';
    hiddenMsg.style.background = 'rgba(255, 255, 255, 0.95)';
    hiddenMsg.style.color = '#333';
    hiddenMsg.style.zIndex = '20';
    
    // Add editing indicator
    if (!scratchArea.querySelector('.editing-indicator')) {
      const indicator = document.createElement('div');
      indicator.className = 'editing-indicator';
      indicator.style.cssText = `
        position: absolute;
        top: -5px;
        right: -5px;
        background: #667eea;
        color: white;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 10px;
        font-weight: bold;
        z-index: 25;
      `;
      indicator.textContent = 'EDITING';
      scratchArea.appendChild(indicator);
    }
  }
}

// NEW: Hide hidden message from editing (restore scratch texture)
function hideHiddenMessageFromEditing() {
  const scratchArea = document.getElementById('scratchArea');
  const hiddenMsg = scratchArea?.querySelector('.hidden-message');
  const indicator = scratchArea?.querySelector('.editing-indicator');
  
  if (scratchArea && hiddenMsg) {
    // Restore original background
    if (scratchArea.dataset.originalBackground) {
      scratchArea.style.backgroundImage = scratchArea.dataset.originalBackground;
    }
    scratchArea.style.background = '';
    scratchArea.style.border = '';
    
    // Hide message behind scratch area (but keep it in DOM)
    hiddenMsg.style.opacity = '0';
    hiddenMsg.style.background = 'transparent';
    hiddenMsg.style.zIndex = '10';
    
    // Remove editing indicator
    if (indicator) {
      indicator.remove();
    }
  }
}

// NEW: Get actual hidden message content for card generation
function getHiddenMessageContent() {
  const scratchArea = document.getElementById('scratchArea');
  const hiddenMsg = scratchArea?.querySelector('.hidden-message');
  
  if (hiddenMsg && hiddenMsg.textContent.trim() !== 'Your hidden message') {
    return hiddenMsg.textContent.trim();
  }
  
  // Fallback: check if there's a hidden message input
  const hiddenMessageInput = document.getElementById('hiddenMessage');
  if (hiddenMessageInput && hiddenMessageInput.value.trim()) {
    return hiddenMessageInput.value.trim();
  }
  
  return 'Surprise! You found the hidden message!';
}

// NEW: Initialize hidden message editing behavior
function initializeHiddenMessageEditing() {
  const textTypeDropdown = document.getElementById('textTypeDropdown');
  const textContentInput = document.getElementById('textContentInput');
  
  // Auto-show when user focuses on text input with hidden message selected
  textContentInput?.addEventListener('focus', function() {
    if (textTypeDropdown?.value === 'hiddenMessage') {
      showHiddenMessageForEditing();
    }
  });
  
  // Auto-hide when user clicks elsewhere (with delay to allow styling)
  document.addEventListener('click', function(e) {
    const scratchArea = document.getElementById('scratchArea');
    const rightSidebar = document.querySelector('.right-sidebar');
    
    // Don't hide if clicking on scratch area or right sidebar (styling controls)
    if (!scratchArea?.contains(e.target) && !rightSidebar?.contains(e.target)) {
      setTimeout(() => {
        if (textTypeDropdown?.value !== 'hiddenMessage') {
          hideHiddenMessageFromEditing();
        }
      }, 200);
    }
  });
  
  // Show when dropdown changes to hidden message
  textTypeDropdown?.addEventListener('change', function() {
    if (this.value === 'hiddenMessage') {
      setTimeout(showHiddenMessageForEditing, 100);
    } else {
      hideHiddenMessageFromEditing();
    }
  });
}

// NEW: Update property panel for specific element
function updatePropertyPanelForElement(element) {
  const textContentInput = document.getElementById('textContentInput');
  const elementSize = document.getElementById('elementSize');
  const elementFont = document.getElementById('elementFont');
  const elementColor = document.getElementById('elementColor');
  const elementOpacity = document.getElementById('elementOpacity');
  
  if (textContentInput) {
    if (element.classList.contains('sender-name')) {
      textContentInput.value = element.textContent.replace('From ', '').trim();
    } else if (element.classList.contains('hidden-message')) {
      textContentInput.value = element.textContent.trim();
    }
  }
  
  if (elementSize) {
    const fontSize = parseInt(window.getComputedStyle(element).fontSize) || 16;
    elementSize.value = fontSize;
  }
  
  if (elementFont) {
    const fontFamily = window.getComputedStyle(element).fontFamily;
    elementFont.value = fontFamily.replace(/['"]/g, '');
  }
  
  if (elementColor) {
    const color = window.getComputedStyle(element).color;
    elementColor.value = rgbToHex(color) || '#ffffff';
  }
  
  if (elementOpacity) {
    const opacity = Math.round(parseFloat(window.getComputedStyle(element).opacity || '1') * 100);
    elementOpacity.value = opacity;
  }
}

// Initialize glow color presets
function initializeGlowColorPresets() {
  document.querySelectorAll('.glow-preset').forEach(preset => {
    preset.addEventListener('click', function() {
      const color = this.dataset.color;
      currentGlowColor = color;
      if (glowColorPicker) glowColorPicker.value = color;
      
      // Update active preset
      document.querySelectorAll('.glow-preset').forEach(p => p.style.border = '2px solid transparent');
      this.style.border = '2px solid #333';
      
      // Reapply current glow with new color
      if (glowEffect && glowEffect.value > 0) {
        const intensity = parseInt(glowEffect.value);
        applyGlowWithColor(intensity, color);
      }
    });
  });
  
  // Set default active preset
  document.querySelector('.glow-preset[data-color="#667eea"]').style.border = '2px solid #333';
}

// Color picker change
if (glowColorPicker) {
  glowColorPicker.addEventListener('input', function() {
    currentGlowColor = this.value;
    
    // Clear preset selection
    document.querySelectorAll('.glow-preset').forEach(p => p.style.border = '2px solid transparent');
    
    // Reapply current glow with new color
    if (glowEffect && glowEffect.value > 0) {
      const intensity = parseInt(glowEffect.value);
      applyGlowWithColor(intensity, currentGlowColor);
    }
  });
}

if (glowEffect) {
  glowEffect.addEventListener('input', function() {
    const minimumGlow = 15; // Permanent base glow - increased minimum
    const glowIntensity = minimumGlow + parseInt(this.value);
    
    if (selectedElement) {
      // Apply glow effect to selected element with custom color (NO SMOKE HERE)
      applyGlowWithColor(glowIntensity, currentGlowColor, selectedElement);
      applyEnvironmentDarkening(glowIntensity);
      
      // Update display value
      if (glowValue) {
        glowValue.textContent = glowIntensity + 'px';
      }
      
      // Save to history
      clearTimeout(this.historyTimeout);
      this.historyTimeout = setTimeout(() => saveToHistory(), 300);
      
      console.log(`✨ Colored glow effect applied: ${glowIntensity}px, color: ${currentGlowColor}`);
    } else {
      // Apply glow to entire card with custom color (NO SMOKE HERE)
      applyCardGlowWithColor(glowIntensity, currentGlowColor);
      console.log(`✨ Colored glow effect applied to card: ${glowIntensity}px, color: ${currentGlowColor}`);
    }
  });
  
  console.log('✅ Enhanced colored glow effect control initialized');
} else {
  console.warn('⚠️ Glow effect input not found in HTML');
}

// Initialize color presets
initializeGlowColorPresets();

// NEW: Independent Smoke Effect Control
const smokeToggle = document.getElementById('smokeToggle') || document.querySelector('#smokeEffect') || document.querySelector('input[type="checkbox"][id*="smoke"]');

if (smokeToggle) {
  smokeToggle.addEventListener('change', function() {
    isSmokeEnabled = this.checked;
    
    if (isSmokeEnabled) {
      // Create smoke effect using current glow color and intensity
      const currentGlowIntensity = glowEffect ? (15 + parseInt(glowEffect.value)) : 25;
      createSmokeEffect(currentGlowIntensity, currentGlowColor);
      console.log(`💨 Smoke effect enabled with color: ${currentGlowColor}`);
    } else {
      // Remove smoke effect
      removeSmokeEffect();
      console.log('💨 Smoke effect disabled');
    }
    
    // Save to history
    setTimeout(() => saveToHistory(), 100);
  });
  
  console.log('✅ Independent smoke effect control initialized');
} else {
  console.warn('⚠️ Smoke toggle not found in HTML');
}

// Apply glow with custom color (NO AUTOMATIC SMOKE)
function applyGlowWithColor(intensity, color, element = null) {
  const targetElement = element || document.getElementById('cardPreview');
  
  if (targetElement && intensity > 0) {
    // Convert hex color to RGB for transparency effects
    const rgb = hexToRgb(color);
    const rgbaMain = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.9)`;
    const rgbaMid = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6)`;
    const rgbaLight = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`;
    const rgbaInner = `rgba(255, 255, 255, 0.3)`;
    
    // Apply multi-layer colored glow
    targetElement.style.filter = `
      drop-shadow(0 0 ${intensity}px ${rgbaMain})
      drop-shadow(0 0 ${intensity * 2}px ${rgbaMid})
    `;
    targetElement.style.boxShadow = `
      0 0 ${intensity}px ${rgbaMain},
      0 0 ${intensity * 2}px ${rgbaMid},
      0 0 ${intensity * 3}px ${rgbaLight},
      inset 0 0 ${intensity / 2}px ${rgbaInner},
      0 10px 30px rgba(0, 0, 0, 0.5)
    `;
    
    // Only create smoke if smoke is enabled
    if (isSmokeEnabled) {
      createSmokeEffect(intensity, color);
    }
  }
}

// Apply card glow with color (NO AUTOMATIC SMOKE)
function applyCardGlowWithColor(intensity, color) {
  const cardPreview = document.getElementById('cardPreview');
  if (cardPreview && intensity > 0) {
    applyGlowWithColor(intensity, color, cardPreview);
    cardPreview.style.position = 'relative';
    cardPreview.style.zIndex = '10';
    
    // Darken platform
    applyEnvironmentDarkening(intensity);
  }
}

// Remove card glow (KEEP SMOKE IF ENABLED)
function removeCardGlow() {
  const cardPreview = document.getElementById('cardPreview');
  if (cardPreview) {
    // Apply minimum glow instead of removing completely
    const minimumGlow = 15;
    const rgb = hexToRgb(currentGlowColor);
    const rgbaMain = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6)`;
    
    cardPreview.style.boxShadow = `
      0 0 ${minimumGlow}px ${rgbaMain},
      0 10px 30px rgba(0, 0, 0, 0.3)
    `;
    cardPreview.style.filter = `drop-shadow(0 0 ${minimumGlow}px ${rgbaMain})`;
    cardPreview.style.zIndex = '10';
  }
  
  // Don't automatically remove smoke - let user control it
  // Only remove environment darkening
  removeEnvironmentDarkening();
}

// Enhanced smoke effect with CANVAS-BASED particle physics
let smokeSystem = null;
let animationId = null;

class SmokeParticle {
    constructor(x, y, color) {
        // Position
        this.x = x;
        this.y = y;
        
        // Realistic smoke physics - gentle and steady
        this.vx = (Math.random() - 0.5) * 0.5; // Reduced horizontal movement
        this.vy = -(Math.random() * 2 + 1); // Gentle upward movement (-1 to -3)
        
        // Physics properties
        this.life = 1.0;
        this.maxLife = Math.random() * 300 + 200; // Particle lifespan
        this.age = 0;
        this.size = Math.random() * 30 + 15; // Starting size
        this.maxSize = this.size * (2 + Math.random() * 2); // Growth potential
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;
        
        // Color properties based on input color
        this.baseColor = this.parseColor(color);
    }
    
    parseColor(color) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
        if (result) {
            return {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            };
        }
        return { r: 102, g: 126, b: 234 }; // Default blue
    }
    
    update(windForce = 1, turbulence = 0.8) {
        this.age++;
        
        // Apply gentle wind force
        this.vx += (windForce / 300) * (0.2 + Math.random() * 0.3);
        
        // Apply subtle turbulence
        this.vx += (Math.random() - 0.5) * (turbulence / 30);
        this.vy += (Math.random() - 0.5) * (turbulence / 60);
        
        // Gentle buoyancy - realistic smoke rising
        this.vy -= 0.05; // Much more realistic than 0.8
        
        // Apply velocity
        this.x += this.vx;
        this.y += this.vy;
        
        // Realistic drag
        this.vx *= 0.995;
        this.vy *= 0.995;
        
        // Billowing effect - grow size over time
        if (this.size < this.maxSize) {
            this.size += 0.4;
        }
        
        // Update rotation
        this.rotation += this.rotationSpeed;
        
        // Update life
        this.life = Math.max(0, 1 - (this.age / this.maxLife));
        
        return this.life > 0;
    }
    
    draw(ctx) {
        ctx.save();
        
        // Calculate alpha based on life and position fade
        let alpha = this.life * 0.6;
        if (this.y < 50) alpha *= (this.y / 50); // Fade at top
        
        // Realistic color evolution as smoke ages
        let ageRatio = 1 - this.life;
        let red = Math.floor(this.baseColor.r * (1 - ageRatio * 0.2));
        let green = Math.floor(this.baseColor.g + ageRatio * 15);
        let blue = Math.floor(this.baseColor.b + ageRatio * 25);
        
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // Create realistic smoke gradient - key to professional look
        let gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
        gradient.addColorStop(0, `rgba(${red}, ${green}, ${blue}, ${alpha})`);
        gradient.addColorStop(0.3, `rgba(${red}, ${green}, ${blue}, ${alpha * 0.7})`);
        gradient.addColorStop(0.7, `rgba(${red}, ${green}, ${blue}, ${alpha * 0.3})`);
        gradient.addColorStop(1, `rgba(${red}, ${green}, ${blue}, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}
class SmokeSystem {
    constructor(container, intensity, color) {
        this.container = container;
        this.intensity = intensity;
        this.color = color;
        this.particles = [];
        this.sources = [];
        this.windForce = 1;
        this.turbulence = 0.8;
        this.isRunning = false;
        
        // Create canvas element
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();
        
        // Create container bounds
        this.bounds = container.getBoundingClientRect();
    }
    
    setupCanvas() {
        this.canvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 3;
        `;
        
        // Set canvas size
        const containerRect = this.container.getBoundingClientRect();
        this.canvas.width = containerRect.width;
        this.canvas.height = containerRect.height;
        
        this.container.appendChild(this.canvas);
    }
    
    addSource(x, y) {
        this.sources.push({
            x: x,
            y: y,
            timer: 0,
            active: true
        });
    }
    
    update() {
        if (!this.isRunning) return;
        
        // Clear canvas with subtle trail effect for smoother motion
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update sources and emit particles
        this.sources.forEach(source => {
            if (!source.active) return;
            
            source.timer++;
            
            // Emit particles based on intensity
            const emissionRate = Math.max(1, 8 - Math.floor(this.intensity / 3));
            if (source.timer % emissionRate === 0) {
                const particleCount = Math.floor(this.intensity / 4) + 1;
                
                for (let i = 0; i < particleCount; i++) {
                    const offsetX = (Math.random() - 0.5) * 30;
                    const offsetY = (Math.random() - 0.5) * 10;
                    
                    const particle = new SmokeParticle(
                        source.x + offsetX,
                        source.y + offsetY,
                        this.color
                    );
                    
                    this.particles.push(particle);
                }
            }
        });
        
        // Update and filter particles
        this.particles = this.particles.filter(particle => {
            return particle.update(this.windForce, this.turbulence);
        });
        
        // Sort particles by size for proper depth rendering
        this.particles.sort((a, b) => b.size - a.size);
        
        // Draw all particles
        this.particles.forEach(particle => {
            particle.draw(this.ctx);
        });
        
        // Limit particle count for performance
        if (this.particles.length > 200) {
            this.particles = this.particles.slice(0, 150);
        }
        
        if (this.isRunning) {
            requestAnimationFrame(() => this.update());
        }
    }
    
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.update();
        }
    }
    
    stop() {
        this.isRunning = false;
    }
    
    destroy() {
        this.stop();
        if (this.canvas && this.canvas.parentElement) {
            this.canvas.parentElement.removeChild(this.canvas);
        }
        this.particles = [];
        this.sources = [];
    }
}

// Enhanced smoke effect creation function - CANVAS VERSION
function createSmokeEffect(intensity, color) {
    if (intensity < 5) return; // Only show smoke for medium+ intensity
    
    // Find the card container
    const cardContainer = document.querySelector('.card-container') || 
                         document.querySelector('.preview-section') || 
                         document.querySelector('.main-content') ||
                         document.getElementById('cardPreview')?.parentElement;
    
    if (!cardContainer) return;
    
    // Remove existing smoke system
    removeSmokeEffect();
    
    // Create container that covers the ENTIRE platform area
    const container = document.createElement('div');
    container.id = 'smokeContainer';
    container.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 2;
        overflow: visible;
    `;
    
    // Ensure container has relative positioning
    if (cardContainer.style.position !== 'relative') {
        cardContainer.style.position = 'relative';
    }
    
    cardContainer.appendChild(container);
    
    // Create and start smoke system
    smokeSystem = new SmokeSystem(container, intensity, color);
    
    // Add smoke sources at the BOTTOM of the platform
    const containerRect = container.getBoundingClientRect();
    const sourceCount = Math.min(Math.floor(intensity / 3) + 2, 6);
    
    for (let i = 0; i < sourceCount; i++) {
        const padding = containerRect.width * 0.1;
        const availableWidth = containerRect.width - (padding * 2);
        const x = padding + (availableWidth / (sourceCount - 1)) * i;
        const y = containerRect.height + 100; // Start from bottom of platform
        smokeSystem.addSource(x, y);
    }
    
    smokeSystem.start();
}

// Remove smoke effect
function removeSmokeEffect() {
    if (smokeSystem) {
        smokeSystem.destroy();
        smokeSystem = null;
    }
    
    const smokeContainer = document.getElementById('smokeContainer');
    if (smokeContainer) {
        smokeContainer.remove();
    }
    
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
}

// Helper function to convert hex to RGB (keeping original for compatibility)
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 102, g: 126, b: 234 }; // Default blue
}

// Helper functions for environment darkening (UNCHANGED)
function applyEnvironmentDarkening(intensity) {
  const darknessLevel = Math.min(0.8, intensity / 30 * 0.8); // Max 80% darkness
  
  // Find the card development area/platform (the container holding the card preview)
  const cardContainer = document.querySelector('.card-container') || 
                       document.querySelector('.preview-section') || 
                       document.querySelector('.main-content') ||
                       document.getElementById('cardPreview')?.parentElement;
  
  if (cardContainer) {
    // Create overlay specifically for the card development platform
    if (!document.getElementById('cardPlatformOverlay')) {
      const platformOverlay = document.createElement('div');
      platformOverlay.id = 'cardPlatformOverlay';
      platformOverlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, ${darknessLevel});
        pointer-events: none;
        z-index: 1;
        transition: all 0.4s ease;
        border-radius: inherit;
      `;
      
      // Ensure container has relative positioning
      if (cardContainer.style.position !== 'relative') {
        cardContainer.style.position = 'relative';
      }
      
      cardContainer.appendChild(platformOverlay);
    } else {
      const platformOverlay = document.getElementById('cardPlatformOverlay');
      platformOverlay.style.background = `rgba(0, 0, 0, ${darknessLevel})`;
    }
    
    // Ensure the card preview stays above the overlay
    const cardPreview = document.getElementById('cardPreview');
    if (cardPreview) {
      cardPreview.style.position = 'relative';
      cardPreview.style.zIndex = '10'; // Higher than overlay
    }
    
    console.log(`🌑 Card platform darkened: ${Math.round(darknessLevel * 100)}%`);
  } else {
    console.warn('⚠️ Card container not found, applying fallback darkening');
    
    // Fallback: darken the immediate background of the card preview
    const cardPreview = document.getElementById('cardPreview');
    if (cardPreview && cardPreview.parentElement) {
      cardPreview.parentElement.style.background = `rgba(0, 0, 0, ${darknessLevel})`;
      cardPreview.parentElement.style.transition = 'background 0.4s ease';
    }
  }
}
function removeEnvironmentDarkening() {
  // Remove card platform overlay
  const platformOverlay = document.getElementById('cardPlatformOverlay');
  if (platformOverlay) {
    platformOverlay.remove();
  }
  
  // Reset card container background if we used fallback
  const cardPreview = document.getElementById('cardPreview');
  if (cardPreview && cardPreview.parentElement) {
    cardPreview.parentElement.style.background = '';
    cardPreview.parentElement.style.transition = '';
  }
  
  // Keep card preview z-index for minimum glow
  if (cardPreview) {
    cardPreview.style.zIndex = '10';
  }
  
  // DON'T automatically remove smoke - let user control it independently
  
  console.log('🌅 Card platform darkening removed');
}
}
  // Enhanced function to apply glow with dynamic background darkening
function applyCardGlow(intensity) {
  const cardPreview = document.getElementById('cardPreview');
  if (cardPreview) {
    if (intensity > 0) {
      // Apply intense glow to card (card stays bright and visible)
      cardPreview.style.boxShadow = `
        0 0 ${intensity}px rgba(102, 126, 234, 0.9),
        0 0 ${intensity * 2}px rgba(102, 126, 234, 0.6),
        0 0 ${intensity * 3}px rgba(102, 126, 234, 0.4),
        0 10px 30px rgba(0, 0, 0, 0.5)
      `;
      cardPreview.style.filter = `drop-shadow(0 0 ${intensity}px rgba(102, 126, 234, 0.8))`;
      cardPreview.style.position = 'relative';
      cardPreview.style.zIndex = '10'; // Keep card above darkened platform
      
      // Darken only the card development platform
      applyEnvironmentDarkening(intensity);
      
    } else {
      // Reset everything when glow is 0
      cardPreview.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
      cardPreview.style.filter = '';
      cardPreview.style.zIndex = '';
      
      // Remove platform darkening
      removeEnvironmentDarkening();
    }
  }
}
  // Animation Type
  animationType?.addEventListener('change', function() {
    const cardPreview = document.getElementById('cardPreview');
    cardPreview.classList.remove('floating', 'pulsing');
    
    switch(this.value) {
      case 'hearts':
        cardPreview.classList.add('pulsing');
        break;
      case 'sparkles':
        cardPreview.classList.add('floating');
        break;
    }
    saveToHistory();
  });


// FIXED: Background selection - properly apply backgrounds
function applyBackgroundToCard() {
  document.querySelectorAll('.background-item').forEach(item => {
    item.addEventListener('click', function() {
      const cardPreview = document.getElementById('cardPreview');
      
      // Handle built-in gradient backgrounds
      if (this.classList.contains('bg-obsidian-rose')) {
        cardPreview.style.backgroundImage = '';
        cardPreview.className = 'card-preview floating bg-obsidian-rose';
        selectedAssets.background = 'bg-obsidian-rose';
      } else if (this.classList.contains('bg-obsidian-ocean')) {
        cardPreview.style.backgroundImage = '';
        cardPreview.className = 'card-preview floating bg-obsidian-ocean';
        selectedAssets.background = 'bg-obsidian-ocean';
      } else if (this.classList.contains('bg-obsidian-galaxy')) {
        cardPreview.style.backgroundImage = '';
        cardPreview.className = 'card-preview floating bg-obsidian-galaxy';
        selectedAssets.background = 'bg-obsidian-galaxy';
      } else if (this.classList.contains('bg-obsidian-gold')) {
        cardPreview.style.backgroundImage = '';
        cardPreview.className = 'card-preview floating bg-obsidian-gold';
        selectedAssets.background = 'bg-obsidian-gold';
      } else if (this.classList.contains('bg-obsidian-sunset')) {
        cardPreview.style.backgroundImage = '';
        cardPreview.className = 'card-preview floating bg-obsidian-sunset';
        selectedAssets.background = 'bg-obsidian-sunset';
      } else if (this.classList.contains('bg-obsidian-emerald')) {
        cardPreview.style.backgroundImage = '';
        cardPreview.className = 'card-preview floating bg-obsidian-emerald';
        selectedAssets.background = 'bg-obsidian-emerald';
      } else {
        // Handle custom/uploaded backgrounds
        const bgUrl = this.dataset.background;
        if (bgUrl) {
          cardPreview.className = 'card-preview floating';
          cardPreview.style.backgroundImage = `url(${bgUrl})`;
          cardPreview.style.backgroundSize = 'cover';
          cardPreview.style.backgroundPosition = 'center';
          selectedAssets.background = bgUrl;
        }
      }
      
      // Update active state
      document.querySelectorAll('.background-item').forEach(bg => bg.classList.remove('active'));
      this.classList.add('active');
      
      saveToHistory();
      console.log('🎨 Background applied:', selectedAssets.background);
    });
  });
}

// FIXED: Symbol addition - properly replace card symbol
function addSymbolToCard() {
  document.querySelectorAll('.symbol-item').forEach(item => {
    item.addEventListener('click', function() {
      const cardPreview = document.getElementById('cardPreview');
      const symbolData = this.dataset.symbol;
      
      if (symbolData) {
        // Check if we're in blank template mode
        let cardSymbol = document.getElementById('cardSymbol');
        
        if (!cardSymbol) {
          // Create symbol element for blank template - NO BACKGROUND WRAPPER
          cardSymbol = document.createElement('div');
          cardSymbol.className = 'card-element card-symbol';
          cardSymbol.id = 'cardSymbol';
          cardSymbol.style.cssText = 'position: absolute; top: 50px; left: 50px; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; font-size: 24px;';
          
          // Add resize handles
          ['nw', 'ne', 'sw', 'se'].forEach(pos => {
            const handle = document.createElement('div');
            handle.className = `resize-handle ${pos}`;
            cardSymbol.appendChild(handle);
          });
          
          cardPreview.appendChild(cardSymbol);
          makeElementInteractive(cardSymbol);
        }
        
        // Clear existing content but preserve handles
        const handles = cardSymbol.querySelectorAll('.resize-handle');
        cardSymbol.innerHTML = '';
        
        // Add new symbol content WITHOUT background wrapper
        if (symbolData.includes('data:image') || symbolData.includes('.png') || symbolData.includes('.jpg') || symbolData.includes('.jpeg')) {
          cardSymbol.innerHTML = `<img src="${symbolData}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;" alt="Symbol">`;
        } else {
          // For emoji/text symbols, no background
          cardSymbol.textContent = symbolData;
          cardSymbol.style.background = 'transparent';
        }
        
        // Re-add resize handles
        handles.forEach(handle => cardSymbol.appendChild(handle));
        
        selectedAssets.symbol = symbolData;
        
        // Update active state
        document.querySelectorAll('.symbol-item').forEach(sym => sym.classList.remove('active'));
        this.classList.add('active');
        
        saveToHistory();
        console.log('🎭 Symbol applied:', selectedAssets.symbol);
      }
    });
  });
}
// FIXED: Scratch texture application
function applyScratchTexture() {
  document.querySelectorAll('.scratch-texture-item').forEach(item => {
    item.addEventListener('click', function() {
      const cardPreview = document.getElementById('cardPreview');
      const textureData = this.dataset.scratchTexture;
      
      if (textureData) {
        let scratchArea = document.getElementById('scratchArea');
        
        if (!scratchArea) {
          // Create scratch area for blank template
          scratchArea = document.createElement('div');
          scratchArea.className = 'card-element scratch-area';
          scratchArea.id = 'scratchArea';
          scratchArea.style.cssText = 'position: absolute; top: 150px; left: 76px; width: 350px; height: 150px; display: flex; align-items: center; justify-content: center; border-radius: 8px;';
          scratchArea.innerHTML = '<p>Scratch here to reveal your message!</p>';
          
          // Add resize handles
          ['nw', 'ne', 'sw', 'se'].forEach(pos => {
            const handle = document.createElement('div');
            handle.className = `resize-handle ${pos}`;
            scratchArea.appendChild(handle);
          });
          
          cardPreview.appendChild(scratchArea);
          makeElementInteractive(scratchArea);
        }
        
        scratchArea.style.backgroundImage = `url(${textureData})`;
        scratchArea.style.backgroundSize = 'cover';
        scratchArea.style.backgroundPosition = 'center';
        
        selectedAssets.scratchTexture = textureData;
        
        // Update active state
        document.querySelectorAll('.scratch-texture-item').forEach(tex => tex.classList.remove('active'));
        this.classList.add('active');
        
        saveToHistory();
        console.log('🎨 Scratch texture applied:', selectedAssets.scratchTexture);
      }
    });
  });
}
// FIXED: ensureSenderNameElement function - ABSOLUTELY NO BACKGROUND
function ensureSenderNameElement() {
  const cardPreview = document.getElementById('cardPreview');
  let senderName = document.getElementById('senderName');
  
  if (!senderName && cardPreview.dataset.template === 'blank') {
    senderName = document.createElement('div');
    senderName.className = 'card-element sender-name';
    senderName.id = 'senderName';
    
    // ✅ REMOVED ALL BACKGROUND BULLSHIT - COMPLETELY TRANSPARENT
    senderName.style.cssText = 'position: absolute; top: 10px; left: 10px; font-weight: bold; color: #4a5568; font-size: 16px; background: transparent; background-color: transparent;';
    senderName.textContent = 'From Sarah';
    
    // Add resize handles
    ['nw', 'ne', 'sw', 'se'].forEach(pos => {
      const handle = document.createElement('div');
      handle.className = `resize-handle ${pos}`;
      senderName.appendChild(handle);
    });
    
    cardPreview.appendChild(senderName);
    makeElementInteractive(senderName);
  }
  
  return senderName;
}

// FIXED: Upload button functionality
function initializeUploadButtons() {
  // Background upload
  backgroundUpload?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      const reader = new FileReader();
      
      reader.onload = () => {
        // Create new background item
        const item = document.createElement('div');
        item.className = 'background-item uploaded-item';
        item.dataset.background = url;
        item.style.backgroundImage = `url(${url})`;
        item.style.backgroundSize = 'cover';
        item.style.backgroundPosition = 'center';
        item.title = `Uploaded: ${file.name}`;
        
        // Add delete button
        const deleteBtn = document.createElement('div');
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.className = 'delete-btn';
        deleteBtn.style.cssText = `
          position: absolute;
          top: 5px;
          right: 5px;
          background: rgba(255, 107, 107, 0.9);
          color: white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.3s ease;
        `;
        
        item.style.position = 'relative';
        item.appendChild(deleteBtn);
        
        // Show delete button on hover
        item.addEventListener('mouseenter', () => deleteBtn.style.opacity = '1');
        item.addEventListener('mouseleave', () => deleteBtn.style.opacity = '0');
        
        // Delete functionality
        deleteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          item.remove();
          URL.revokeObjectURL(url);
        });
        
        // Click functionality
        item.addEventListener('click', function() {
          const cardPreview = document.getElementById('cardPreview');
          cardPreview.className = 'card-preview floating';
          cardPreview.style.backgroundImage = `url(${url})`;
          cardPreview.style.backgroundSize = 'cover';
          cardPreview.style.backgroundPosition = 'center';
          selectedAssets.background = url;
          
          document.querySelectorAll('.background-item').forEach(bg => bg.classList.remove('active'));
          this.classList.add('active');
          saveToHistory();
        });
        
        // Add to grid at the beginning
        backgroundGrid.insertBefore(item, backgroundGrid.firstChild);
        
        // Store base64 for saving
        uploadedFiles.backgroundImage = reader.result;
        
        // Auto-select the uploaded background
        item.click();
      };
      
      reader.readAsDataURL(file);
    }
  });

  // Symbol upload
  symbolUpload?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      const reader = new FileReader();
      
      reader.onload = () => {
        const item = document.createElement('div');
        item.className = 'symbol-item uploaded-item';
        item.dataset.symbol = url;
        item.style.backgroundImage = `url(${url})`;
        item.style.backgroundSize = 'cover';
        item.style.backgroundPosition = 'center';
        item.style.position = 'relative';
        item.title = `Uploaded: ${file.name}`;
        
        // Add delete button
        const deleteBtn = document.createElement('div');
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.className = 'delete-btn';
        deleteBtn.style.cssText = `
          position: absolute;
          top: 5px;
          right: 5px;
          background: rgba(255, 107, 107, 0.9);
          color: white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.3s ease;
        `;
        
        item.appendChild(deleteBtn);
        
        item.addEventListener('mouseenter', () => deleteBtn.style.opacity = '1');
        item.addEventListener('mouseleave', () => deleteBtn.style.opacity = '0');
        
        deleteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          item.remove();
          URL.revokeObjectURL(url);
        });
        
        item.addEventListener('click', function() {
          const cardSymbol = document.getElementById('cardSymbol');
          if (cardSymbol) {
            const handles = cardSymbol.querySelectorAll('.resize-handle');
            cardSymbol.innerHTML = `<img src="${url}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;" alt="Symbol">`;
            handles.forEach(handle => cardSymbol.appendChild(handle));
            
            selectedAssets.symbol = url;
            document.querySelectorAll('.symbol-item').forEach(sym => sym.classList.remove('active'));
            this.classList.add('active');
            saveToHistory();
          }
        });
        
        symbolGrid.insertBefore(item, symbolGrid.firstChild);
        uploadedFiles.symbol = reader.result;
        item.click();
      };
      
      reader.readAsDataURL(file);
    }
  });

  // Scratch texture upload
  scratchTextureUpload?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      const reader = new FileReader();
      
      reader.onload = () => {
        const item = document.createElement('div');
        item.className = 'scratch-texture-item uploaded-item';
        item.dataset.scratchTexture = url;
        item.style.backgroundImage = `url(${url})`;
        item.style.backgroundSize = 'cover';
        item.style.backgroundPosition = 'center';
        item.style.position = 'relative';
        item.title = `Uploaded: ${file.name}`;
        
        // Add delete button
        const deleteBtn = document.createElement('div');
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.className = 'delete-btn';
        deleteBtn.style.cssText = `
          position: absolute;
          top: 5px;
          right: 5px;
          background: rgba(255, 107, 107, 0.9);
          color: white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.3s ease;
        `;
        
        item.appendChild(deleteBtn);
        
        item.addEventListener('mouseenter', () => deleteBtn.style.opacity = '1');
        item.addEventListener('mouseleave', () => deleteBtn.style.opacity = '0');
        
        deleteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          item.remove();
          URL.revokeObjectURL(url);
        });
        
        item.addEventListener('click', function() {
          const scratchArea = document.getElementById('scratchArea');
          if (scratchArea) {
            scratchArea.style.backgroundImage = `url(${url})`;
            scratchArea.style.backgroundSize = 'cover';
            scratchArea.style.backgroundPosition = 'center';
            
            selectedAssets.scratchTexture = url;
            document.querySelectorAll('.scratch-texture-item').forEach(tex => tex.classList.remove('active'));
            this.classList.add('active');
            saveToHistory();
          }
        });
        
        scratchTextureGrid.insertBefore(item, scratchTextureGrid.firstChild);
        uploadedFiles.scratchTexture = reader.result;
        item.click();
      };
      
      reader.readAsDataURL(file);
    }
  });

  // Audio upload
  audioUpload?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('audio/')) {
      const url = URL.createObjectURL(file);
      const reader = new FileReader();
      
      reader.onload = () => {
        const item = document.createElement('div');
        item.className = 'audio-item uploaded-item';
        item.dataset.audio = url;
        item.style.position = 'relative';
        
        item.innerHTML = `
          <i class="fas fa-play play-btn"></i>
          <span>Uploaded: ${file.name.replace(/\.[^/.]+$/, "")}</span>
          <audio preload="metadata">
            <source src="${url}" type="${file.type}">
          </audio>
          <div class="delete-btn" style="
            position: absolute;
            top: 5px;
            right: 5px;
            background: rgba(255, 107, 107, 0.9);
            color: white;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            cursor: pointer;
            opacity: 0;
            transition: opacity 0.3s ease;
          ">🗑️</div>
        `;
        
        const deleteBtn = item.querySelector('.delete-btn');
        const audio = item.querySelector('audio');
        
        item.addEventListener('mouseenter', () => deleteBtn.style.opacity = '1');
        item.addEventListener('mouseleave', () => deleteBtn.style.opacity = '0');
        
        deleteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          item.remove();
          URL.revokeObjectURL(url);
        });
        
        item.addEventListener('click', () => handleAudioClick(audio, item));
        
        audioGrid.insertBefore(item, audioGrid.firstChild);
        uploadedFiles.soundEffect = reader.result;
        selectAsset('audio', item);
      };
      
      reader.readAsDataURL(file);
    }
  });
}

// Enhanced save/export functions - with project naming
function showMyProjectsButton() {
  showMyProjects();
}

function saveDraftButton() {
  if (currentProject) {
    // Save existing project
    saveCurrentProject();
    
    // Show save confirmation
    const saveBtn = event.target;
    const originalText = saveBtn.innerHTML;
    saveBtn.innerHTML = '<i class="fas fa-check"></i> Saved!';
    saveBtn.style.background = '#48bb78';
    setTimeout(() => {
      saveBtn.innerHTML = originalText;
      saveBtn.style.background = '';
    }, 2000);
  } else {
    // New project - show naming dialog
    showProjectNameDialog((projectName, autoId) => {
      if (projectName) {
        saveCurrentProject(projectName, autoId);
        
        // Show save confirmation
        const saveBtn = event.target;
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = '<i class="fas fa-check"></i> Saved!';
        saveBtn.style.background = '#48bb78';
        setTimeout(() => {
          saveBtn.innerHTML = originalText;
          saveBtn.style.background = '';
        }, 2000);
      }
    });
  }
}

// Function to check if an asset exists
async function checkAssetExists(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Stop currently playing audio
function stopCurrentAudio() {
  if (currentlyPlayingAudio && !currentlyPlayingAudio.paused) {
    currentlyPlayingAudio.pause();
    currentlyPlayingAudio.currentTime = 0;
  }
  
  if (currentlyPlayingElement) {
    const playButton = currentlyPlayingElement.querySelector('.play-btn, i');
    if (playButton) {
      if (playButton.classList.contains('fa-pause')) {
        playButton.classList.remove('fa-pause');
        playButton.classList.add('fa-play');
      } else if (playButton.textContent === '⏸️') {
        playButton.textContent = '▶️';
      }
    }
    currentlyPlayingElement.classList.remove('playing');
  }
  
  currentlyPlayingAudio = null;
  currentlyPlayingElement = null;
}

// Handle audio playback with proper controls
async function handleAudioClick(audioElement, item) {
  const audio = audioElement;
  const playButton = item.querySelector('.play-btn, i');
  
  // If this audio is currently playing, stop it
  if (currentlyPlayingAudio === audio && !audio.paused) {
    stopCurrentAudio();
    return;
  }
  
  // Stop any currently playing audio
  stopCurrentAudio();
  
  try {
    // Set up the new audio
    currentlyPlayingAudio = audio;
    currentlyPlayingElement = item;
    
    // Update play button to pause icon
    if (playButton) {
      if (playButton.classList.contains('fa-play')) {
        playButton.classList.remove('fa-play');
        playButton.classList.add('fa-pause');
      } else if (playButton.textContent === '▶️') {
        playButton.textContent = '⏸️';
      }
    }
    
    item.classList.add('playing');
    
    // Reset audio to beginning and play
    audio.currentTime = 0;
    await audio.play();
    
    // When audio ends, reset the UI
    audio.addEventListener('ended', () => {
      stopCurrentAudio();
    }, { once: true });
    
    // Select this audio asset
    selectAsset('audio', item);
    
  } catch (err) {
    console.log('Audio play failed, playing fallback beep:', err);
    stopCurrentAudio();
    playBeepSound();
    selectAsset('audio', item);
  }
}

// Load assets into grids with fallbacks - FIXED VERSION
async function loadAssets(type, gridElement, page = 0) {
  console.log(`🎯 Loading assets for type: ${type}, page: ${page}`);
  
  const isAudio = type === 'audio';
  const currentItemsPerPage = isAudio ? audioItemsPerPage : itemsPerPage;
  const start = page * currentItemsPerPage;
  let items;

  // Load actual assets from server
  items = allAssets[type].slice(start, start + currentItemsPerPage);
  console.log(`🌐 Attempting to load ${items.length} server assets for ${type}`);

  for (const file of items) {
    if (!loadedAssets[type].items.includes(file)) {
      const assetUrl = `${BASE_URL}/assets/${type}/${file}`;
      
      // Check if asset exists
      const exists = await checkAssetExists(assetUrl);
      
      if (exists) {
        const item = document.createElement('div');
        
        // FIXED: Consistent naming for all types
        if (type === 'scratchTextures') {
          item.className = 'scratch-texture-item';
          item.dataset.scratchTexture = assetUrl;
        } else if (isAudio) {
          item.className = 'audio-item';
          item.dataset.audio = assetUrl;
        } else {
          item.className = `${type.slice(0, -1)}-item`;
          item.dataset[type.slice(0, -1)] = assetUrl;
        }
        
        if (!isAudio) {
          item.style.backgroundImage = `url(${assetUrl})`;
          item.style.backgroundSize = 'cover';
          item.style.backgroundPosition = 'center';
          item.title = file;
          
          // Add click functionality based on type
          if (type === 'backgrounds') {
            item.addEventListener('click', function() {
              const cardPreview = document.getElementById('cardPreview');
              cardPreview.className = 'card-preview floating';
              cardPreview.style.backgroundImage = `url(${assetUrl})`;
              cardPreview.style.backgroundSize = 'cover';
              cardPreview.style.backgroundPosition = 'center';
              selectedAssets.background = assetUrl;
              
              document.querySelectorAll('.background-item').forEach(bg => bg.classList.remove('active'));
              this.classList.add('active');
              saveToHistory();
            });
          } else if (type === 'symbols') {
            item.addEventListener('click', function() {
              const cardSymbol = document.getElementById('cardSymbol');
              if (cardSymbol) {
                const handles = cardSymbol.querySelectorAll('.resize-handle');
                cardSymbol.innerHTML = `<img src="${assetUrl}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;" alt="Symbol">`;
                handles.forEach(handle => cardSymbol.appendChild(handle));
                
                selectedAssets.symbol = assetUrl;
                document.querySelectorAll('.symbol-item').forEach(sym => sym.classList.remove('active'));
                this.classList.add('active');
                saveToHistory();
              }
            });
          } else if (type === 'scratchTextures') {
            item.addEventListener('click', function() {
              const scratchArea = document.getElementById('scratchArea');
              if (scratchArea) {
                scratchArea.style.backgroundImage = `url(${assetUrl})`;
                scratchArea.style.backgroundSize = 'cover';
                scratchArea.style.backgroundPosition = 'center';
                
                selectedAssets.scratchTexture = assetUrl;
                document.querySelectorAll('.scratch-texture-item').forEach(tex => tex.classList.remove('active'));
                this.classList.add('active');
                saveToHistory();
              }
            });
          }
          
          console.log(`✅ Added server ${type} asset: ${file}`);
        } else {
          item.innerHTML = `
            <i class="fas fa-play play-btn"></i>
            <span>${file.replace('.mp3', '')}</span>
            <audio preload="metadata" crossorigin="anonymous">
              <source src="${assetUrl}" type="audio/mpeg">
            </audio>
          `;
          
          const audio = item.querySelector('audio');
          item.addEventListener('click', () => handleAudioClick(audio, item));
        }
        
        gridElement.appendChild(item);
        loadedAssets[type].items.push(file);
      } else {
        console.log(`❌ Asset not found: ${assetUrl}`);
      }
    }
  }

  // Show/hide Load More button
  const loadMoreButton = document.getElementById(`loadMore${type.charAt(0).toUpperCase() + type.slice(1)}`);
  if (loadMoreButton) {
    const totalAvailable = allAssets[type]?.length || 0;
    const totalLoaded = loadedAssets[type].items.length;
    
    const hasMoreItems = totalLoaded < totalAvailable;
    loadMoreButton.style.display = hasMoreItems ? 'flex' : 'none';
    
    console.log(`📊 ${type}: ${totalLoaded}/${totalAvailable} items loaded, hasMore: ${hasMoreItems}`);
  }
}

// Play a simple beep sound using Web Audio API
function playBeepSound() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800; // 800 Hz beep
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (error) {
    console.log('Web Audio API not supported:', error);
  }
}

// Select an asset - FIXED VERSION
function selectAsset(type, element) {
  const grid = document.getElementById(`${type}Grid`);
  
  // FIXED: Handle different item classes properly
  let itemClass;
  if (type === 'scratchTextures') {
    itemClass = 'scratch-texture-item';
  } else if (type === 'audio') {
    itemClass = 'audio-item';
  } else {
    itemClass = `${type.slice(0, -1)}-item`;
  }
  
  // Remove active class from all items
  grid.querySelectorAll(`.${itemClass}`).forEach(item => item.classList.remove('active'));
  element.classList.add('active');
  
  // FIXED: Map type to correct selectedAssets key and dataset attribute
  let assetKey, datasetKey;
  if (type === 'scratchTextures') {
    assetKey = 'scratchTexture';
    datasetKey = 'scratchTexture';
  } else if (type === 'audio') {
    assetKey = 'soundEffect';
    datasetKey = 'audio';
  } else {
    assetKey = type.slice(0, -1);
    datasetKey = type.slice(0, -1);
  }
  
  selectedAssets[assetKey] = element.dataset[datasetKey];
  console.log(`🎯 Selected ${type}:`, selectedAssets[assetKey]);
  updatePreview();
}

// Load more assets - FIXED VERSION
function setupLoadMore() {
  loadMoreBackgrounds?.addEventListener('click', () => {
    loadedAssets.backgrounds.page++;
    loadAssets('backgrounds', backgroundGrid, loadedAssets.backgrounds.page);
  });
  loadMoreSymbols?.addEventListener('click', () => {
    loadedAssets.symbols.page++;
    loadAssets('symbols', symbolGrid, loadedAssets.symbols.page);
  });
  loadMoreScratchTextures?.addEventListener('click', () => {
    loadedAssets.scratchTextures.page++;
    loadAssets('scratchTextures', scratchTextureGrid, loadedAssets.scratchTextures.page);
  });
  loadMoreAudio?.addEventListener('click', () => {
    loadedAssets.audio.page++;
    loadAssets('audio', audioGrid, loadedAssets.audio.page);
  });
}

// Live preview update - IMPROVED
function updatePreview() {
  const senderName = senderNameInput?.textContent?.replace('From ', '') || 'Your Name';
  
  // FIXED: Don't auto-fill with placeholder text
  const hiddenMessage = hiddenMessageInput?.value || '';

  if (senderNameInput) {
    senderNameInput.textContent = `From ${senderName}`;
  }
  
  // FIXED: Only set value if it's actually empty and we want to show placeholder
  // But don't force the placeholder back in
  
  // Apply selected background
  if (selectedAssets.background) {
    if (selectedAssets.background.startsWith('bg-obsidian-')) {
      cardPreview.className = `card-preview floating ${selectedAssets.background}`;
      cardPreview.style.backgroundImage = '';
    } else {
      cardPreview.className = 'card-preview floating';
      cardPreview.style.backgroundImage = `url(${selectedAssets.background})`;
      cardPreview.style.backgroundSize = 'cover';
      cardPreview.style.backgroundPosition = 'center';
    }
  }
  
  // Apply selected symbol
  const cardSymbol = document.getElementById('cardSymbol');
  if (cardSymbol && selectedAssets.symbol) {
    const handles = cardSymbol.querySelectorAll('.resize-handle');
    if (selectedAssets.symbol.includes('data:image/svg+xml') && selectedAssets.symbol.includes('<text')) {
      const emojiMatch = selectedAssets.symbol.match(/>([^<]+)<\/text>/);
      cardSymbol.innerHTML = emojiMatch ? emojiMatch[1] : '';
    } else if (selectedAssets.symbol.includes('data:image') || selectedAssets.symbol.includes('.png') || selectedAssets.symbol.includes('.jpg') || selectedAssets.symbol.includes('.jpeg')) {
      cardSymbol.innerHTML = `<img src="${selectedAssets.symbol}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;" alt="Symbol">`;
    } else {
      cardSymbol.textContent = selectedAssets.symbol;
    }
    handles.forEach(handle => cardSymbol.appendChild(handle));
  }
  
  // Apply selected scratch texture
  const scratchArea = document.getElementById('scratchArea');
  if (scratchArea && selectedAssets.scratchTexture) {
    scratchArea.style.backgroundImage = `url(${selectedAssets.scratchTexture})`;
    scratchArea.style.backgroundSize = 'cover';
    scratchArea.style.backgroundPosition = 'center';
  }
}
// File upload functions - UPDATED
function uploadCustomBackground() {
  backgroundUpload?.click();
}

function uploadCustomSymbol() {
  symbolUpload?.click();
}

function uploadCustomScratchTexture() {
  scratchTextureUpload?.click();
}

function uploadCustomAudio() {
  audioUpload?.click();
}

// Generate card - ENHANCED to capture ALL web app features
async function generateCard() {
  const fab = document.querySelector('.fab');
  if (fab) {
    fab.style.transform = 'scale(1.2)';
    setTimeout(() => fab.style.transform = 'scale(1)', 200);
  }

  if (!window.currentUser) {
    showAuthenticationGate();
    return;
  }

  try {
    if (createButton) {
      createButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
      createButton.disabled = true;
    }

    // CAPTURE ALL ADVANCED WEB APP FEATURES
    const cardData = {
      // Basic card info
      // ENHANCED: Basic card info with proper hidden message extraction
  senderName: senderNameInput?.textContent?.replace('From ', '').trim() || 'Anonymous',
  hiddenMessage: getHiddenMessageContent(), // Use the new function
  // ... rest
      backgroundImage: selectedAssets.background || placeholderAssets.backgrounds[0],
      symbol: selectedAssets.symbol || placeholderAssets.symbols[0],
      animation: document.getElementById('animationType')?.value || 'hearts',
      scratchTexture: selectedAssets.scratchTexture || placeholderAssets.scratchTextures[0],
      soundEffect: selectedAssets.soundEffect || '#beep',
      
      // User info
      userId: window.currentUser?.uid,
      userEmail: window.currentUser?.email,
      userName: window.currentUser?.displayName || window.currentUser?.email,
      
      // Base64 uploaded files
      backgroundImageBase64: uploadedFiles.backgroundImage,
      symbolBase64: uploadedFiles.symbol,
      scratchTextureBase64: uploadedFiles.scratchTexture,
      soundEffectBase64: uploadedFiles.soundEffect,
      
      // ADVANCED FEATURES - EXACTLY from web app
      template: currentTemplate || 'classic',
      
      // Glow effect settings
      glowEffect: parseInt(document.getElementById('glowEffect')?.value || '15') + 15, // Add minimum glow
      glowColor: document.getElementById('glowColor')?.value || '#667eea',
      
      // Smoke effect settings
      smokeEffect: document.getElementById('smokeEffect')?.checked || isSmokeEnabled || false,
      
      // Card orientation
      cardOrientation: document.getElementById('cardOrientation')?.value || 'landscape',
      
      // Animation settings
      animationType: document.getElementById('animationType')?.value || 'hearts',
      animationSpeed: parseFloat(document.getElementById('animSpeed')?.value || '1'),
      
      // Element positions and styles - CAPTURE EXACT POSITIONING
      elements: Array.from(document.querySelectorAll('.card-element')).map(el => ({
        id: el.id,
        type: el.classList.contains('sender-name') ? 'sender' :
              el.classList.contains('scratch-area') ? 'scratch' : 'symbol',
        content: el.textContent.trim(),
        innerHTML: el.innerHTML,
        position: {
          left: el.style.left || getComputedStyle(el).left,
          top: el.style.top || getComputedStyle(el).top,
          width: el.style.width || getComputedStyle(el).width,
          height: el.style.height || getComputedStyle(el).height
        },
        style: {
          fontSize: el.style.fontSize || getComputedStyle(el).fontSize,
          opacity: el.style.opacity || getComputedStyle(el).opacity,
          color: el.style.color || getComputedStyle(el).color,
          fontFamily: el.style.fontFamily || getComputedStyle(el).fontFamily,
          fontWeight: el.style.fontWeight || getComputedStyle(el).fontWeight,
          textShadow: el.style.textShadow || getComputedStyle(el).textShadow,
          backgroundImage: el.style.backgroundImage || getComputedStyle(el).backgroundImage,
          backgroundSize: el.style.backgroundSize || getComputedStyle(el).backgroundSize,
          backgroundPosition: el.style.backgroundPosition || getComputedStyle(el).backgroundPosition
        }
      })),
      
      // Card preview styling - CAPTURE EXACT CARD STATE
      cardStyle: {
        backgroundImage: cardPreview?.style.backgroundImage || '',
        backgroundSize: cardPreview?.style.backgroundSize || 'cover',
        backgroundPosition: cardPreview?.style.backgroundPosition || 'center',
        className: cardPreview?.className || 'card-preview floating',
        aspectRatio: cardPreview?.style.aspectRatio || '1.6',
        filter: cardPreview?.style.filter || '',
        boxShadow: cardPreview?.style.boxShadow || '',
        transform: cardPreview?.style.transform || ''
      },
      
      // Project metadata
      projectId: currentProject?.id || null,
      projectName: currentProject?.name || null,
      
      // Timestamp
      createdAt: new Date().toISOString(),
      
      // Version info
      version: '2.0-advanced',
      features: [
        'drag-drop-elements',
        'resizable-components',
        'advanced-glow-effects',
        'particle-systems',
        'smoke-effects',
        'custom-uploads',
        'interactive-scratch',
        'multi-templates',
        'undo-redo-system'
      ]
    };

    console.log('🎯 Generating advanced card with features:', cardData.features);
    console.log('📊 Card data size:', JSON.stringify(cardData).length, 'characters');

    const response = await fetch(`${BASE_URL}/api/cards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': window.currentUser ? `Bearer ${await window.currentUser.getIdToken()}` : ''
      },
      body: JSON.stringify(cardData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create card');
    }

    const result = await response.json();
    showSuccessModal(result.cardId, result.cardUrl);
    
    console.log('✅ Advanced card generated successfully:', result.cardId);
    
  } catch (error) {
    console.error('❌ Error creating advanced card:', error);
    alert(`❌ Error creating card: ${error.message}\n\nMake sure the backend server is running on port 3000!`);
  } finally {
    if (createButton) {
      createButton.innerHTML = '<i class="fas fa-magic"></i>';
      createButton.disabled = false;
    }
  }
}

// Show success modal
function showSuccessModal(cardId, cardUrl) {
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    backdrop-filter: blur(5px);
  `;

  modal.innerHTML = `
    <div style="background: white; padding: 3rem; border-radius: 20px; text-align: center; max-width: 500px; width: 90%; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);">
      <h2 style="color: #4a5568; margin-bottom: 1rem; font-size: 2rem;">🎉 Card Created!</h2>
      <p style="color: #718096; margin-bottom: 2rem; font-size: 1.1rem;">Your revolutionary scratch card is ready to share!</p>
      <div style="background: #f7fafc; padding: 1.5rem; border-radius: 10px; margin-bottom: 2rem;">
        <p style="margin-bottom: 1rem; font-weight: bold; color: #4a5568;">Share this link:</p>
        <input type="text" value="${cardUrl}" readonly 
               style="width: 100%; padding: 0.75rem; border: 2px solid #e2e8f0; border-radius: 8px; text-align: center; font-size: 0.9rem;"
               onclick="this.select()">
        <p style="margin-top: 0.5rem; font-size: 0.8rem; color: #718096;">Click to select and copy</p>
      </div>
      <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
        <button onclick="window.open('${cardUrl}', '_blank')" 
                style="background: linear-gradient(45deg, #667eea, #764ba2); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 10px; cursor: pointer; font-weight: bold;">
          🎯 View Card
        </button>
        <button onclick="copyToClipboard('${cardUrl}')" 
                style="background: #48bb78; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 10px; cursor: pointer; font-weight: bold;">
          📋 Copy Link
        </button>
        <button onclick="document.body.removeChild(document.querySelector('.success-modal'))" 
                style="background: #cbd5e0; color: #4a5568; border: none; padding: 0.75rem 1.5rem; border-radius: 10px; cursor: pointer; font-weight: bold;">
          ✨ Create Another
        </button>
      </div>
      <p style="margin-top: 2rem; font-size: 0.8rem; color: #a0aec0;">Card ID: ${cardId}</p>
      <p style="margin-top: 0.5rem; font-size: 0.75rem; color: #d0d0d0;">Created by: ${window.currentUser?.displayName || window.currentUser?.email}</p>
    </div>
  `;
  modal.className = 'success-modal';
  document.body.appendChild(modal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) document.body.removeChild(modal);
  });
}

// Copy to clipboard
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    const button = event.target;
    const originalText = button.textContent;
    button.textContent = '✅ Copied!';
    button.style.background = '#38a169';
    setTimeout(() => {
      button.textContent = originalText;
      button.style.background = '#48bb78';
    }, 2000);
  }).catch(() => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    alert('Link copied to clipboard!');
  });
}

// Authentication gate
function showAuthenticationGate() {
  const gateModal = document.createElement('div');
  gateModal.className = 'auth-gate-modal';
  gateModal.id = 'authGateModal';
  gateModal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    backdrop-filter: blur(5px);
  `;
  gateModal.innerHTML = `
    <div style="background: white; padding: 3rem; border-radius: 20px; text-align: center; max-width: 500px; width: 90%; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);">
      <h2 style="color: #333; margin-bottom: 15px; font-size: 2.2rem; background: linear-gradient(45deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
        🔐 Almost There!
      </h2>
      <p style="color: #666; margin-bottom: 35px; font-size: 1.1rem; line-height: 1.6;">
        Your card is ready to be created! To generate your shareable link and save your masterpiece, you'll need to sign in or create a free account.
      </p>
      <p style="font-size: 0.95rem; color: #888; margin-bottom: 30px;">
        ✨ <strong>Why sign in?</strong> We keep your cards safe, provide analytics, and ensure your links work forever.
      </p>
      <div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">
        <button style="padding: 18px 35px; border: none; border-radius: 15px; font-size: 16px; font-weight: 700; cursor: pointer; background: linear-gradient(45deg, #667eea, #764ba2); color: white;" onclick="proceedWithSignUp()">
          🚀 Create Free Account
        </button>
        <button style="padding: 18px 35px; border: 3px solid #667eea; border-radius: 15px; font-size: 16px; font-weight: 700; cursor: pointer; background: transparent; color: #667eea;" onclick="proceedWithSignIn()">
          👤 I Have An Account
        </button>
      </div>
      <p style="margin-top: 25px; font-size: 0.8rem; color: #aaa;">
        Free forever • No spam • Secure & private
      </p>
    </div>
  `;
  document.body.appendChild(gateModal);
  gateModal.addEventListener('click', (e) => {
    if (e.target === gateModal) document.body.removeChild(gateModal);
  });
}

function proceedWithSignUp() {
  document.getElementById('authGateModal')?.remove();
  document.querySelector('.signup-btn')?.click();
}

function proceedWithSignIn() {
  document.getElementById('authGateModal')?.remove();
  document.querySelector('.login-btn')?.click();
}

// Auth functions - FIXED IMPLEMENTATION
function showLogin() {
  window.open('auth.html', '_blank', 'width=500,height=700,scrollbars=yes,resizable=yes');
}

function showSignup() {
  window.open('auth.html', '_blank', 'width=500,height=700,scrollbars=yes,resizable=yes');
}

async function logout() {
  try {
    if (window.firebaseAuth && window.signOut && window.currentUser) {
      console.log('🔓 Signing out user:', window.currentUser.email);
      await window.signOut(window.firebaseAuth);
      
      // Update UI immediately
      const authButtons = document.getElementById('authButtons');
      const userProfile = document.getElementById('userProfile');
      
      if (authButtons && userProfile) {
        authButtons.style.display = 'flex';
        userProfile.style.display = 'none';
      }
      
      // Clear current user
      window.currentUser = null;
      
      // Show success message
      console.log('✅ User signed out successfully');
      
      // Optional: Show a temporary success indicator
      const logoutBtn = document.querySelector('.logout-btn');
      if (logoutBtn) {
        const originalText = logoutBtn.textContent;
        logoutBtn.textContent = '✅ Signed Out';
        logoutBtn.style.background = '#48bb78';
        setTimeout(() => {
          logoutBtn.textContent = originalText;
          logoutBtn.style.background = '';
        }, 2000);
      }
    } else {
      console.warn('⚠️ Firebase auth not properly initialized');
      // Fallback: just update the UI
      const authButtons = document.getElementById('authButtons');
      const userProfile = document.getElementById('userProfile');
      
      if (authButtons && userProfile) {
        authButtons.style.display = 'flex';
        userProfile.style.display = 'none';
      }
      window.currentUser = null;
    }
  } catch (error) {
    console.error('❌ Error during logout:', error);
    alert('Error signing out. Please refresh the page.');
  }
}

// Initialize everything
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🎯 Masterm Cards - Enhanced Frontend Loading...');
  console.log('🌐 Base URL:', BASE_URL);
  
  // Initialize first history state
  saveToHistory();
  
  // Setup auto-save (only on page exit)
  setupAutoSave();
  
  // Initialize first history state after a delay to ensure DOM is ready
  setTimeout(() => {
    console.log('Saving initial history state');
    saveToHistory();
    console.log('Initial history saved. Index:', historyIndex, 'Total:', projectHistory.length);
    
    // Initialize undo/redo functionality AFTER history is set up
    initializeUndoRedo();
  }, 100);
  
  // Load initial assets
  console.log('📦 Loading assets...');
  
  const backgroundGridEl = document.getElementById('backgroundGrid');
  const symbolGridEl = document.getElementById('symbolGrid');
  const scratchTextureGridEl = document.getElementById('scratchTextureGrid');
  const audioGridEl = document.getElementById('audioGrid');
  
  console.log('Grid elements found:', {
    backgroundGrid: !!backgroundGridEl,
    symbolGrid: !!symbolGridEl,
    scratchTextureGrid: !!scratchTextureGridEl,
    audioGrid: !!audioGridEl
  });
  
  await Promise.all([
    loadAssets('backgrounds', backgroundGridEl),
    loadAssets('symbols', symbolGridEl),
    loadAssets('scratchTextures', scratchTextureGridEl),
    loadAssets('audio', audioGridEl)
  ]);
  
  // Setup load more buttons
  setupLoadMore();
  
  // Initialize functionality
  initializeTemplates();
  initializeCardElements();
  initializePropertyControls();
  initializeHiddenMessageEditing(); 
  applyBackgroundToCard();
  addSymbolToCard();
  applyScratchTexture();
  initializeUploadButtons();
  
  // Apply initial minimum glow effect
  setTimeout(() => {
    const cardPreview = document.getElementById('cardPreview');
    if (cardPreview) {
      const minimumGlow = 15;
      const rgb = hexToRgb(currentGlowColor);
      const rgbaMain = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6)`;
      
      cardPreview.style.boxShadow = `
        0 0 ${minimumGlow}px ${rgbaMain},
        0 10px 30px rgba(0, 0, 0, 0.3)
      `;
      cardPreview.style.filter = `drop-shadow(0 0 ${minimumGlow}px ${rgbaMain})`;
      cardPreview.style.position = 'relative';
      cardPreview.style.zIndex = '10';
      
      console.log('✨ Initial permanent glow applied');
    }
  }, 200);
  
  // Update preview on changes (with history tracking)
  senderNameInput?.addEventListener('input', () => {
    updatePreview();
    hasUnsavedChanges = true;
    saveToHistory();
  });
  hiddenMessageInput?.addEventListener('input', () => {
    updatePreview();
    hasUnsavedChanges = true;
    saveToHistory();
  });
  
  // Generate card
  createButton?.addEventListener('click', generateCard);
  
  // Replace header button functions
  const saveDraftBtn = document.querySelector('.action-btn.secondary-btn:not(.undo-btn):not(.redo-btn)');
  const exportBtn = document.querySelector('.action-btn.primary-btn');
  
  if (saveDraftBtn) {
    saveDraftBtn.innerHTML = '<i class="fas fa-save"></i> Save Draft';
    saveDraftBtn.addEventListener('click', saveDraftButton);
  }
  
  if (exportBtn) {
    exportBtn.innerHTML = '<i class="fas fa-folder-open"></i> My Projects';
    exportBtn.addEventListener('click', showMyProjectsButton);
  }
  
  // Card click to deselect elements
  cardPreview?.addEventListener('click', function(e) {
    if (e.target === this) {
      document.querySelectorAll('.card-element').forEach(el => {
        el.classList.remove('selected');
      });
      selectedElement = null;
    }
  });

  // Initial preview update
  updatePreview();

  console.log('✅ Masterm Cards - Enhanced Frontend Loaded Successfully!');
  console.log('🔄 NEW: Undo/Redo system with keyboard shortcuts (Ctrl+Z, Ctrl+Y)');
  console.log('💾 MODIFIED: Auto-save only on page exit to preserve undo/redo');
  console.log('📝 NEW: Project naming system with auto-generated IDs (1a001, 1a002, etc.)');
  console.log('🎯 FIXED: All asset types properly apply with history tracking');
  console.log('📁 ENHANCED: My Projects system shows both custom names and auto-IDs');
  console.log('⚡ IMPROVED: Better state management and change tracking');
});



// 1. Debug what data is actually being captured
function debugActualCardData() {
    console.log("=== DEBUGGING ACTUAL CARD GENERATION DATA ===");
    
    const scratchArea = document.getElementById('scratchArea');
    
    if (scratchArea) {
        console.log("✅ Scratch area found in DOM");
        console.log("Scratch area element:", scratchArea);
        console.log("Scratch area computed style:", window.getComputedStyle(scratchArea).backgroundImage);
        console.log("Scratch area inline style:", scratchArea.style.backgroundImage);
        console.log("Scratch area dataset:", scratchArea.dataset);
        
        // Check the EXACT data that would be sent
        const mockCardData = {
            scratchTexture: selectedAssets.scratchTexture,
            scratchTextureBase64: uploadedFiles.scratchTexture,
            elements: Array.from(document.querySelectorAll('.card-element')).map(el => ({
                id: el.id,
                type: el.classList.contains('scratch-area') ? 'scratch' : 'other',
                style: {
                    backgroundImage: el.style.backgroundImage || window.getComputedStyle(el).backgroundImage,
                    backgroundSize: el.style.backgroundSize || window.getComputedStyle(el).backgroundSize,
                    backgroundPosition: el.style.backgroundPosition || window.getComputedStyle(el).backgroundPosition
                }
            }))
        };
        
        console.log("Mock card data that would be sent:", mockCardData);
        
        const scratchElement = mockCardData.elements.find(el => el.type === 'scratch');
        console.log("Scratch element data:", scratchElement);
        
    } else {
        console.log("❌ No scratch area found in DOM");
    }
    
    console.log("selectedAssets:", selectedAssets);
    console.log("uploadedFiles:", uploadedFiles);
    console.log("==========================================");
}

// 2. Intercept the actual network request
function interceptGenerateCard() {
    const originalFetch = window.fetch;
    
    window.fetch = function(...args) {
        const [url, options] = args;
        
        if (url.includes('/api/cards') && options && options.method === 'POST') {
            console.log("=== INTERCEPTED CARD GENERATION REQUEST ===");
            console.log("URL:", url);
            
            try {
                const cardData = JSON.parse(options.body);
                console.log("🎯 SCRATCH TEXTURE IN REQUEST:");
                console.log("- scratchTexture:", cardData.scratchTexture);
                console.log("- scratchTextureBase64:", cardData.scratchTextureBase64);
                console.log("- scratch elements:", cardData.elements?.filter(el => el.type === 'scratch'));
            } catch (e) {
                console.log("Could not parse request body as JSON");
            }
            
            console.log("==============================================");
        }
        
        return originalFetch.apply(this, args);
    };
    
    console.log("✅ Network request interceptor activated");
}

// 3. Run full investigation
function runFullInvestigation() {
    console.log("🔍 STARTING WEB APP INVESTIGATION");
    debugActualCardData();
    interceptGenerateCard();
    console.log("✅ Ready! Now select a scratch texture and generate a card.");
}

// Make functions available globally
window.debugActualCardData = debugActualCardData;
window.interceptGenerateCard = interceptGenerateCard;
window.runFullInvestigation = runFullInvestigation;

// Auto-run when script loads
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for everything to initialize
    setTimeout(runFullInvestigation, 2000);
});
