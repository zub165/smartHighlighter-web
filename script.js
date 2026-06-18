// jsPDF is loaded globally via CDN
const { jsPDF } = window.jspdf;

// DOM Elements
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const ocrText = document.getElementById('ocrText');
const aiHighlights = document.getElementById('aiHighlights');
const bookmarksList = document.getElementById('bookmarksList');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const cameraStatus = document.getElementById('cameraStatus');
const cameraPermissionWarning = document.getElementById('cameraPermissionWarning');

// Buttons
const snapBtn = document.getElementById('snapBtn');
const summarizeBtn = document.getElementById('summarizeBtn');
const exportBtn = document.getElementById('exportBtn');
const processAllBtn = document.getElementById('processAllBtn');
const multiInput = document.getElementById('multiInput');
const speakBtn = document.getElementById('speakBtn');
const copyBtn = document.getElementById('copyBtn');
const clearBtn = document.getElementById('clearBtn');
const bookmarkBtn = document.getElementById('bookmarkBtn');
const toggleCamera = document.getElementById('toggleCamera');
const toggleMode = document.getElementById('toggleMode');
const toggleTheme = document.getElementById('toggleTheme');
const exportNotesBtn = document.getElementById('exportNotesBtn');
const createQuizBtn = document.getElementById('createQuizBtn');
const flashcardsBtn = document.getElementById('flashcardsBtn');
const resetPermissions = document.getElementById('resetPermissions');

// Modals
const quizModal = document.getElementById('quizModal');
const flashcardsModal = document.getElementById('flashcardsModal');
const closeQuiz = document.getElementById('closeQuiz');
const closeFlashcards = document.getElementById('closeFlashcards');

// Enhanced Camera State
let currentStream = null;
let isReadingMode = false;
let isAutoFocusEnabled = true;
let isFlashEnabled = false;
let isGridEnabled = false;
let isZoomEnabled = false;
let currentZoomLevel = 1;
let bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
let processedPages = 0;
let speechSynthesis = window.speechSynthesis;
let cameraSettings = {
  quality: 'medium',
  facing: 'environment',
  ocrLanguage: 'eng',
  autoOCR: true,
  enhancedOCR: true,
  readingGuide: false
};

// Enhanced DOM Elements
const readingModeToggle = document.getElementById('readingModeToggle');
const flashToggle = document.getElementById('flashToggle');
const zoomToggle = document.getElementById('zoomToggle');
const autoFocusToggle = document.getElementById('autoFocusToggle');
const gridToggle = document.getElementById('gridToggle');
const cameraQuality = document.getElementById('cameraQuality');
const cameraFacing = document.getElementById('cameraFacing');
const ocrLanguage = document.getElementById('ocrLanguage');
const autoOCR = document.getElementById('autoOCR');
const enhancedOCR = document.getElementById('enhancedOCR');
const readingGuide = document.getElementById('readingGuide');
const focusGuide = document.getElementById('focusGuide');
const readingModeOverlay = document.getElementById('readingModeOverlay');
const cameraResolution = document.getElementById('cameraResolution');
const focusStatus = document.getElementById('focusStatus');
const flashStatus = document.getElementById('flashStatus');

// Enhanced Camera Functions
async function initializeCamera() {
  try {
    // Check if getUserMedia is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Camera API not supported in this browser');
    }
    
    // Get camera constraints based on settings
    const videoConstraints = getCameraConstraints();
    
    // Modern API with enhanced constraints
    currentStream = await navigator.mediaDevices.getUserMedia({ 
      video: videoConstraints
    });
    
    video.srcObject = currentStream;
    
    // Update camera info
    updateCameraInfo();
    
    // Setup camera event listeners
    setupCameraEventListeners();
    
    showNotification('Camera initialized successfully', 'success');
    updateCameraControls();
    
  } catch (err) {
    console.error("Camera error:", err);
    handleCameraError(err);
  }
}

function getCameraConstraints() {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  
  let constraints = {
    facingMode: cameraSettings.facing
  };
  
  // Quality settings
  switch (cameraSettings.quality) {
    case 'high':
      constraints.width = { ideal: 1920, min: 1280 };
      constraints.height = { ideal: 1080, min: 720 };
      break;
    case 'medium':
      constraints.width = { ideal: 1280, min: 640 };
      constraints.height = { ideal: 720, min: 480 };
      break;
    case 'low':
      constraints.width = { ideal: 640, min: 320 };
      constraints.height = { ideal: 480, min: 240 };
      break;
  }
  
  // Mobile optimizations
  if (isMobile) {
    constraints.aspectRatio = { ideal: 4/3 };
    
    if (isIOS) {
      constraints.width = { ideal: 640 };
      constraints.height = { ideal: 480 };
    }
  }
  
  // Enhanced features
  if (isAutoFocusEnabled) {
    constraints.focusMode = 'continuous';
  }
  
  return constraints;
}

function updateCameraInfo() {
  if (video.videoWidth && video.videoHeight) {
    cameraResolution.textContent = `${video.videoWidth}x${video.videoHeight}`;
  }
  
  focusStatus.textContent = isAutoFocusEnabled ? 'Auto' : 'Manual';
  flashStatus.textContent = isFlashEnabled ? 'On' : 'Off';
}

function setupCameraEventListeners() {
  // Video loaded metadata
  video.addEventListener('loadedmetadata', () => {
    updateCameraInfo();
    updateCameraControls();
  });
  
  // Video play
  video.addEventListener('play', () => {
    updateCameraInfo();
  });
}

function updateCameraControls() {
  // Update button states
  autoFocusToggle.classList.toggle('active', isAutoFocusEnabled);
  flashToggle.classList.toggle('active', isFlashEnabled);
  gridToggle.classList.toggle('active', isGridEnabled);
  zoomToggle.classList.toggle('active', isZoomEnabled);
  
  // Update reading mode
  readingModeToggle.classList.toggle('active', isReadingMode);
  readingModeToggle.textContent = `📖 Reading Mode: ${isReadingMode ? 'ON' : 'OFF'}`;
  
  // Update overlays
  focusGuide.style.display = isGridEnabled ? 'block' : 'none';
  readingModeOverlay.style.display = isReadingMode ? 'block' : 'none';
  
  // Update camera viewport class
  const cameraViewport = document.querySelector('.camera-viewport');
  if (cameraViewport) {
    cameraViewport.classList.toggle('reading-mode-active', isReadingMode);
  }
}

// Enhanced Camera Control Functions
function toggleReadingMode() {
  isReadingMode = !isReadingMode;
  updateCameraControls();
  
  if (isReadingMode) {
    showNotification('Reading mode activated - Focus on text lines', 'info');
  } else {
    showNotification('Reading mode deactivated', 'info');
  }
}

function toggleFlash() {
  isFlashEnabled = !isFlashEnabled;
  updateCameraControls();
  
  // Note: Flash control requires specific camera capabilities
  if (isFlashEnabled) {
    showNotification('Flash enabled (if supported by camera)', 'info');
  } else {
    showNotification('Flash disabled', 'info');
  }
}

function toggleZoom() {
  isZoomEnabled = !isZoomEnabled;
  currentZoomLevel = isZoomEnabled ? 2 : 1;
  updateCameraControls();
  
  if (isZoomEnabled) {
    video.style.transform = 'scale(2)';
    showNotification('Zoom enabled - 2x magnification', 'info');
  } else {
    video.style.transform = 'scale(1)';
    showNotification('Zoom disabled', 'info');
  }
}

function toggleAutoFocus() {
  isAutoFocusEnabled = !isAutoFocusEnabled;
  updateCameraControls();
  
  if (isAutoFocusEnabled) {
    showNotification('Auto focus enabled', 'info');
  } else {
    showNotification('Auto focus disabled', 'info');
  }
}

function toggleGrid() {
  isGridEnabled = !isGridEnabled;
  updateCameraControls();
  
  if (isGridEnabled) {
    showNotification('Focus grid enabled', 'info');
  } else {
    showNotification('Focus grid disabled', 'info');
  }
}

// Enhanced Settings Management
function updateCameraSettings() {
  cameraSettings.quality = cameraQuality.value;
  cameraSettings.facing = cameraFacing.value;
  cameraSettings.ocrLanguage = ocrLanguage.value;
  cameraSettings.autoOCR = autoOCR.checked;
  cameraSettings.enhancedOCR = enhancedOCR.checked;
  cameraSettings.readingGuide = readingGuide.checked;
  
  // Save settings to localStorage
  localStorage.setItem('cameraSettings', JSON.stringify(cameraSettings));
  
  showNotification('Camera settings updated', 'success');
}

function loadCameraSettings() {
  const saved = localStorage.getItem('cameraSettings');
  if (saved) {
    cameraSettings = { ...cameraSettings, ...JSON.parse(saved) };
    
    // Update UI
    cameraQuality.value = cameraSettings.quality;
    cameraFacing.value = cameraSettings.facing;
    ocrLanguage.value = cameraSettings.ocrLanguage;
    autoOCR.checked = cameraSettings.autoOCR;
    enhancedOCR.checked = cameraSettings.enhancedOCR;
    readingGuide.checked = cameraSettings.readingGuide;
  }
}

// Enhanced OCR Function
async function performEnhancedOCR() {
  if (!video.srcObject) {
    showNotification('Camera not initialized', 'error');
    return;
  }
  
  // Add loading state
  snapBtn.classList.add('loading');
  snapBtn.querySelector('.capture-icon').textContent = '⏳';
  
  // Capture frame
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0);
  
  setOcrText("🔄 Running Enhanced OCR...");
  
  try {
    // Enhanced OCR with multiple language support
    const ocrOptions = {
      lang: cameraSettings.ocrLanguage,
      logger: m => console.log(m)
    };
    
    // Add enhanced processing if enabled
    if (cameraSettings.enhancedOCR) {
      // Pre-process image for better OCR
      preprocessImageForOCR();
    }
    
    const result = await Tesseract.recognize(canvas, ocrOptions);
    
    // Post-process text
    let processedText = result.data.text.trim();
    
    if (cameraSettings.enhancedOCR) {
      processedText = postprocessOCRText(processedText);
    }
    
    setOcrText(processedText);
    
    // Draw bounding boxes for debugging
    if (cameraSettings.readingGuide) {
      drawOCRBoundingBoxes(result.data.words);
    }
    
    processedPages++;
    updateProgress();
    showNotification('Enhanced OCR completed successfully', 'success');
    
    // Auto-process with AI if enabled
    if (cameraSettings.autoOCR && processedText.length > 10) {
      setTimeout(() => {
        generateHighlights();
      }, 1000);
    }
    
  } catch (e) {
    console.error('OCR Error:', e);
    setOcrText("❌ OCR failed: " + e.message);
    showNotification('OCR error: ' + e.message, 'error');
  } finally {
    // Remove loading state
    snapBtn.classList.remove('loading');
    snapBtn.querySelector('.capture-icon').textContent = '📸';
  }
}

function preprocessImageForOCR() {
  // Get image data
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  // Apply contrast enhancement
  for (let i = 0; i < data.length; i += 4) {
    // Convert to grayscale and enhance contrast
    const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    const enhanced = Math.max(0, Math.min(255, (gray - 128) * 1.5 + 128));
    
    data[i] = enhanced;     // Red
    data[i + 1] = enhanced; // Green
    data[i + 2] = enhanced; // Blue
    // Alpha remains unchanged
  }
  
  // Put processed image back
  ctx.putImageData(imageData, 0, 0);
}

function postprocessOCRText(text) {
  // Remove extra whitespace
  text = text.replace(/\s+/g, ' ').trim();
  
  // Fix common OCR errors
  const corrections = {
    '0': 'O', '1': 'l', '5': 'S', '8': 'B', '|': 'I',
    'rn': 'm', 'cl': 'd', 'vv': 'w', 'nn': 'm'
  };
  
  Object.entries(corrections).forEach(([wrong, correct]) => {
    text = text.replace(new RegExp(wrong, 'g'), correct);
  });
  
  // Fix line breaks
  text = text.replace(/([.!?])\s*([A-Z])/g, '$1\n\n$2');
  
  return text;
}

function drawOCRBoundingBoxes(words) {
  words.forEach(word => {
    ctx.strokeStyle = "rgba(99, 102, 241, 0.8)";
    ctx.lineWidth = 2;
    ctx.strokeRect(
      word.bbox.x0, 
      word.bbox.y0, 
      word.bbox.x1 - word.bbox.x0, 
      word.bbox.y1 - word.bbox.y0
    );
  });
}

// Enhanced Event Listeners
function setupEnhancedEventListeners() {
  // Camera controls
  if (readingModeToggle) readingModeToggle.addEventListener('click', toggleReadingMode);
  if (flashToggle) flashToggle.addEventListener('click', toggleFlash);
  if (zoomToggle) zoomToggle.addEventListener('click', toggleZoom);
  if (autoFocusToggle) autoFocusToggle.addEventListener('click', toggleAutoFocus);
  if (gridToggle) gridToggle.addEventListener('click', toggleGrid);
  
  // Settings
  if (cameraQuality) cameraQuality.addEventListener('change', updateCameraSettings);
  if (cameraFacing) cameraFacing.addEventListener('change', updateCameraSettings);
  if (ocrLanguage) ocrLanguage.addEventListener('change', updateCameraSettings);
  if (autoOCR) autoOCR.addEventListener('change', updateCameraSettings);
  if (enhancedOCR) enhancedOCR.addEventListener('change', updateCameraSettings);
  if (readingGuide) readingGuide.addEventListener('change', updateCameraSettings);
  
  // Enhanced snap button
  if (snapBtn) {
    snapBtn.addEventListener('click', performEnhancedOCR);
  }
}

// Initialize enhanced camera system
function initializeEnhancedCamera() {
  loadCameraSettings();
  setupEnhancedEventListeners();
  detectMobileDevice();
  
  // Initialize camera if permissions are available
  if (navigator.permissions) {
    navigator.permissions.query({ name: 'camera' }).then(result => {
      if (result.state === 'granted') {
        initializeCamera();
      }
    });
  }
}

// Detect mobile device and show appropriate help
function detectMobileDevice() {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  
  if (isMobile) {
    console.log('Mobile device detected:', isIOS ? 'iOS' : 'Android');
    
    // Show mobile-specific notification
    if (isIOS) {
      showNotification('📱 iPhone detected - For best camera experience, use Safari browser', 'info');
    } else {
      showNotification('📱 Android device detected - For best camera experience, use Chrome browser', 'info');
    }
    
    // Update troubleshooting section
    const troubleshootingSection = document.getElementById('troubleshootingSection');
    if (troubleshootingSection) {
      const mobileSteps = troubleshootingSection.querySelectorAll('.mobile-specific');
      mobileSteps.forEach(step => {
        step.style.display = 'block';
      });
    }
  }
}

// Tab Navigation System
function initializeTabNavigation() {
  const tabItems = document.querySelectorAll('.tab-item');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabItems.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.getAttribute('data-tab');
      
      // Update active tab
      tabItems.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Show target content
      tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === targetTab + 'Tab') {
          content.classList.add('active');
        }
      });
      
      // Special handling for camera tab
      if (targetTab === 'camera') {
        // Ensure camera section is visible
        const cameraSection = document.querySelector('.camera-section');
        if (cameraSection) {
          cameraSection.scrollIntoView({ behavior: 'smooth' });
        }
      }
      
      // Log tab change
      console.log('Switched to tab:', targetTab);
    });
  });
}

// Helper Functions
async function loadBookmarksFromAPI() {
  try {
    const response = await fetch('/api/bookmarks');
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.bookmarks.length > 0) {
        bookmarks = data.bookmarks;
        localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
      }
    }
  } catch (error) {
    console.error('Load bookmarks API error:', error);
    // Fallback to localStorage
  }
}

function saveBookmarks() {
  localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
}

function loadBookmarks() {
  bookmarksList.innerHTML = '';
  bookmarks.forEach(bookmark => {
    const bookmarkEl = document.createElement('div');
    bookmarkEl.className = 'bookmark-item';
    bookmarkEl.innerHTML = `
      <div class="bookmark-header">
        <span class="bookmark-time">${bookmark.createdAt ? new Date(bookmark.createdAt).toLocaleString() : 'Unknown'}</span>
        <button onclick="deleteBookmark('${bookmark.id}')" class="delete-btn">🗑️</button>
      </div>
      <div class="bookmark-content">
        <strong>${bookmark.title || 'Bookmark'}:</strong> ${bookmark.content.substring(0, 100)}${bookmark.content.length > 100 ? '...' : ''}
        ${bookmark.tags && bookmark.tags.length > 0 ? `<br><strong>Tags:</strong> ${bookmark.tags.join(', ')}` : ''}
      </div>
    `;
    bookmarksList.appendChild(bookmarkEl);
  });
}

function deleteBookmark(id) {
  bookmarks = bookmarks.filter(b => b.id !== id);
  saveBookmarks();
  loadBookmarks();
  showNotification('Bookmark deleted', 'info');
}

// Modal Functions
function showQuizModal(quiz) {
  document.getElementById('quizContent').innerHTML = `
    <div class="quiz-questions">
      <h4>Quiz: ${quiz.difficulty} difficulty</h4>
      ${quiz.questions.map((q, index) => `
        <div class="quiz-question">
          <p><strong>Question ${index + 1}:</strong> ${q.question}</p>
          <div class="quiz-options">
            ${q.options.map((option, optIndex) => `
              <label class="quiz-option">
                <input type="radio" name="q${index}" value="${optIndex}">
                ${option}
              </label>
            `).join('')}
          </div>
          <p class="quiz-explanation"><strong>Explanation:</strong> ${q.explanation}</p>
        </div>
      `).join('')}
    </div>
  `;
  setShowQuizModal(true);
}

function showFlashcardsModal(flashcards) {
  document.getElementById('flashcardsContent').innerHTML = `
    <div class="flashcards">
      <h4>Flashcards (${flashcards.totalCards} cards)</h4>
      ${flashcards.cards.map((card, index) => `
        <div class="flashcard" onclick="flipCard(this)">
          <div class="flashcard-front">
            <strong>Front:</strong> ${card.front}
          </div>
          <div class="flashcard-back">
            <strong>Back:</strong> ${card.back}
          </div>
        </div>
      `).join('')}
    </div>
  `;
  setShowFlashcardsModal(true);
}

function flipCard(cardElement) {
  cardElement.classList.toggle('flipped');
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  detectMobileDevice();
  checkCameraPermissions();
  loadBookmarksFromAPI(); // Load from API first
  loadBookmarks(); // Then load from localStorage
  loadStudyNotes(); // Load study notes for AI context
  updateProgress();
  loadTheme();
  setupEventListeners();
  initializeTabNavigation();
  initializeEnhancedCamera(); // Initialize enhanced camera system
});

// Mobile-specific camera permission request
async function requestMobileCameraPermission() {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  
  if (isIOS) {
    try {
      // iOS-specific approach - try to access camera immediately
      showNotification('📱 Requesting iPhone camera permission...', 'info');
      
      // Force camera permission request
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'environment'
        } 
      });
      
      // If we get here, permission was granted
      currentStream = stream;
      video.srcObject = stream;
      toggleCamera.textContent = '🔄 Disable Camera';
      updateCameraStatus('active');
      showCameraPermissionWarning(false);
      
      showNotification('📱 iPhone camera access granted!', 'success');
      
    } catch (err) {
      console.error('Mobile camera permission error:', err);
      
      if (err.name === 'NotAllowedError') {
        showNotification('📱 iPhone Camera Permission Required\n\n1. Tap "Allow" when prompted\n2. Or go to Settings > Safari > Camera > Allow\n3. Refresh the page and try again', 'warning');
        
        // Show troubleshooting with mobile-specific help
        showCameraPermissionWarning(true);
      } else {
        showNotification('📱 iPhone camera error: ' + err.message, 'error');
      }
    }
  }
}

// Enhanced camera permission check for mobile
async function checkCameraPermissions() {
  try {
    if (navigator.permissions && navigator.permissions.query) {
      const permission = await navigator.permissions.query({ name: 'camera' });
      
      if (permission.state === 'granted') {
        // Permission already granted, initialize camera
        updateCameraStatus('initializing');
        showCameraPermissionWarning(false);
        initializeCamera();
      } else if (permission.state === 'denied') {
        updateCameraStatus('denied');
        showCameraPermissionWarning(true);
        
        // For mobile, try to request permission anyway
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (isMobile) {
          showNotification('📱 Mobile camera permission denied. Try "Request Camera Access" button.', 'warning');
        } else {
          showNotification('Camera permission denied. Click "Reset Permissions" or check browser settings.', 'error');
        }
        toggleCamera.textContent = '📷 Enable Camera';
      } else {
        // Permission not determined yet
        updateCameraStatus('unknown');
        showCameraPermissionWarning(true);
        
        // For mobile, try to request permission immediately
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (isMobile) {
          showNotification('📱 Mobile device detected. Click "Request Camera Access" to enable camera.', 'info');
        } else {
          showNotification('Camera permission not determined. Click "Enable Camera" to grant access.', 'info');
        }
        toggleCamera.textContent = '📷 Enable Camera';
      }
      
      // Listen for permission changes
      permission.addEventListener('change', () => {
        console.log('Camera permission changed to:', permission.state);
        if (permission.state === 'granted') {
          updateCameraStatus('initializing');
          showCameraPermissionWarning(false);
          initializeCamera();
        } else if (permission.state === 'denied') {
          updateCameraStatus('denied');
          showCameraPermissionWarning(true);
          showNotification('Camera permission denied. Use "Reset Permissions" button.', 'error');
        }
      });
    } else {
      // Fallback for browsers without permissions API
      updateCameraStatus('unknown');
      showCameraPermissionWarning(true);
      
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        showNotification('📱 Mobile device detected. Click "Request Camera Access" to enable camera.', 'info');
      } else {
        showNotification('Click "Enable Camera" to start using the camera for book reading.', 'info');
      }
      toggleCamera.textContent = '📷 Enable Camera';
    }
  } catch (err) {
    console.error('Permission check failed:', err);
    updateCameraStatus('error');
    showCameraPermissionWarning(true);
    
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      showNotification('📱 Mobile device detected. Click "Request Camera Access" to enable camera.', 'info');
    } else {
      showNotification('Click "Enable Camera" to start using the camera for book reading.', 'info');
    }
    toggleCamera.textContent = '📷 Enable Camera';
  }
}

// Update camera status indicator
function updateCameraStatus(status) {
  if (!cameraStatus) return;
  
  cameraStatus.className = 'camera-status';
  
  switch (status) {
    case 'active':
      cameraStatus.classList.add('active');
      break;
    case 'initializing':
      cameraStatus.classList.add('initializing');
      break;
    case 'denied':
    case 'error':
      cameraStatus.classList.add('denied');
      break;
    default:
      cameraStatus.classList.add('unknown');
  }
}

// Show/hide camera permission warning
function showCameraPermissionWarning(show) {
  if (cameraPermissionWarning) {
    cameraPermissionWarning.style.display = show ? 'block' : 'none';
  }
  
  // Also show/hide troubleshooting section
  const troubleshootingSection = document.getElementById('troubleshootingSection');
  if (troubleshootingSection) {
    troubleshootingSection.style.display = show ? 'block' : 'none';
  }
}

// Setup Event Listeners
function setupEventListeners() {
  // Camera Functions
  if (toggleCamera) toggleCamera.addEventListener('click', toggleCameraStream);
  if (snapBtn) snapBtn.addEventListener('click', snapPage);

  // Text Functions
  if (speakBtn) speakBtn.addEventListener('click', speakText);
  if (copyBtn) copyBtn.addEventListener('click', copyText);
  if (clearBtn) clearBtn.addEventListener('click', clearText);

  // AI Functions
  if (summarizeBtn) summarizeBtn.addEventListener('click', generateHighlights);
  if (bookmarkBtn) bookmarkBtn.addEventListener('click', addBookmark);

  // Export Functions
  if (exportBtn) exportBtn.addEventListener('click', exportToPDF);
  if (exportNotesBtn) exportNotesBtn.addEventListener('click', exportNotes);

  // Study Tools
  if (createQuizBtn) createQuizBtn.addEventListener('click', createQuiz);
  if (flashcardsBtn) flashcardsBtn.addEventListener('click', createFlashcards);

  // UI Controls
  if (toggleMode) toggleMode.addEventListener('click', toggleReadingMode);
  if (toggleTheme) toggleTheme.addEventListener('click', toggleThemeMode);

  // Batch Processing
  if (processAllBtn) processAllBtn.addEventListener('click', () => multiInput.click());
  if (multiInput) multiInput.addEventListener('change', processMultipleImages);

  // Modal Controls
  if (closeQuiz) closeQuiz.addEventListener('click', () => setShowQuizModal(false));
  if (closeFlashcards) closeFlashcards.addEventListener('click', () => setShowFlashcardsModal(false));

  // Close modals when clicking outside
  if (quizModal) quizModal.addEventListener('click', (e) => {
    if (e.target === quizModal) setShowQuizModal(false);
  });
  if (flashcardsModal) flashcardsModal.addEventListener('click', (e) => {
    if (e.target === flashcardsModal) setShowFlashcardsModal(false);
  });

  // Reset Permissions
  if (resetPermissions) {
    resetPermissions.addEventListener('click', resetCameraPermissions);
  }
  
  // Request Camera Access (Mobile)
  if (requestCameraAccess) {
    requestCameraAccess.addEventListener('click', requestMobileCameraPermission);
  }

  // Sidebar Button Connections
  setupSidebarButtons();
}

// Setup Sidebar Button Connections
function setupSidebarButtons() {
  // Process Multiple Pages
  const processAllBtnSidebar = document.getElementById('processAllBtnSidebar');
  if (processAllBtnSidebar) {
    processAllBtnSidebar.addEventListener('click', () => {
      if (multiInput) {
        processAllBtnSidebar.classList.add('loading');
        processAllBtnSidebar.innerHTML = '<span class="sidebar-icon">🔄</span><span class="sidebar-label">Loading...</span>';
        multiInput.click();
        setTimeout(() => {
          processAllBtnSidebar.classList.remove('loading');
          processAllBtnSidebar.innerHTML = '<span class="sidebar-icon">📑</span><span class="sidebar-label">Process Multiple Pages</span>';
        }, 2000);
      } else {
        showNotification('File input not available', 'error');
      }
    });
  }

  // Export to PDF
  const exportBtnSidebar = document.getElementById('exportBtnSidebar');
  if (exportBtnSidebar) {
    exportBtnSidebar.addEventListener('click', async () => {
      exportBtnSidebar.classList.add('loading');
      exportBtnSidebar.innerHTML = '<span class="sidebar-icon">🔄</span><span class="sidebar-label">Exporting...</span>';
      
      try {
        await exportToPDF();
        exportBtnSidebar.classList.remove('loading');
        exportBtnSidebar.classList.add('success');
        exportBtnSidebar.innerHTML = '<span class="sidebar-icon">✅</span><span class="sidebar-label">Exported!</span>';
        setTimeout(() => {
          exportBtnSidebar.classList.remove('success');
          exportBtnSidebar.innerHTML = '<span class="sidebar-icon">📄</span><span class="sidebar-label">Export to PDF</span>';
        }, 2000);
      } catch (error) {
        exportBtnSidebar.classList.remove('loading');
        exportBtnSidebar.classList.add('error');
        exportBtnSidebar.innerHTML = '<span class="sidebar-icon">❌</span><span class="sidebar-label">Failed!</span>';
        setTimeout(() => {
          exportBtnSidebar.classList.remove('error');
          exportBtnSidebar.innerHTML = '<span class="sidebar-icon">📄</span><span class="sidebar-label">Export to PDF</span>';
        }, 2000);
      }
    });
  }

  // Export Notes
  const exportNotesBtnSidebar = document.getElementById('exportNotesBtnSidebar');
  if (exportNotesBtnSidebar) {
    exportNotesBtnSidebar.addEventListener('click', async () => {
      exportNotesBtnSidebar.classList.add('loading');
      exportNotesBtnSidebar.innerHTML = '<span class="sidebar-icon">🔄</span><span class="sidebar-label">Exporting...</span>';
      
      try {
        await exportNotes();
        exportNotesBtnSidebar.classList.remove('loading');
        exportNotesBtnSidebar.classList.add('success');
        exportNotesBtnSidebar.innerHTML = '<span class="sidebar-icon">✅</span><span class="sidebar-label">Exported!</span>';
        setTimeout(() => {
          exportNotesBtnSidebar.classList.remove('success');
          exportNotesBtnSidebar.innerHTML = '<span class="sidebar-icon">📝</span><span class="sidebar-label">Export Notes</span>';
        }, 2000);
      } catch (error) {
        exportNotesBtnSidebar.classList.remove('loading');
        exportNotesBtnSidebar.classList.add('error');
        exportNotesBtnSidebar.innerHTML = '<span class="sidebar-icon">❌</span><span class="sidebar-label">Failed!</span>';
        setTimeout(() => {
          exportNotesBtnSidebar.classList.remove('error');
          exportNotesBtnSidebar.innerHTML = '<span class="sidebar-icon">📝</span><span class="sidebar-label">Export Notes</span>';
        }, 2000);
      }
    });
  }

  // Create Quiz
  const createQuizBtnSidebar = document.getElementById('createQuizBtnSidebar');
  if (createQuizBtnSidebar) {
    createQuizBtnSidebar.addEventListener('click', async () => {
      createQuizBtnSidebar.classList.add('loading');
      createQuizBtnSidebar.innerHTML = '<span class="sidebar-icon">🔄</span><span class="sidebar-label">Creating Quiz...</span>';
      
      try {
        await createQuiz();
        createQuizBtnSidebar.classList.remove('loading');
        createQuizBtnSidebar.classList.add('success');
        createQuizBtnSidebar.innerHTML = '<span class="sidebar-icon">✅</span><span class="sidebar-label">Quiz Created!</span>';
        setTimeout(() => {
          createQuizBtnSidebar.classList.remove('success');
          createQuizBtnSidebar.innerHTML = '<span class="sidebar-icon">❓</span><span class="sidebar-label">Create Quiz</span>';
        }, 2000);
      } catch (error) {
        createQuizBtnSidebar.classList.remove('loading');
        createQuizBtnSidebar.classList.add('error');
        createQuizBtnSidebar.innerHTML = '<span class="sidebar-icon">❌</span><span class="sidebar-label">Failed!</span>';
        setTimeout(() => {
          createQuizBtnSidebar.classList.remove('error');
          createQuizBtnSidebar.innerHTML = '<span class="sidebar-icon">❓</span><span class="sidebar-label">Create Quiz</span>';
        }, 2000);
      }
    });
  }

  // Flashcards
  const flashcardsBtnSidebar = document.getElementById('flashcardsBtnSidebar');
  if (flashcardsBtnSidebar) {
    flashcardsBtnSidebar.addEventListener('click', async () => {
      flashcardsBtnSidebar.classList.add('loading');
      flashcardsBtnSidebar.innerHTML = '<span class="sidebar-icon">🔄</span><span class="sidebar-label">Creating Flashcards...</span>';
      
      try {
        await createFlashcards();
        flashcardsBtnSidebar.classList.remove('loading');
        flashcardsBtnSidebar.classList.add('success');
        flashcardsBtnSidebar.innerHTML = '<span class="sidebar-icon">✅</span><span class="sidebar-label">Flashcards Created!</span>';
        setTimeout(() => {
          flashcardsBtnSidebar.classList.remove('success');
          flashcardsBtnSidebar.innerHTML = '<span class="sidebar-icon">🃏</span><span class="sidebar-label">Flashcards</span>';
        }, 2000);
      } catch (error) {
        flashcardsBtnSidebar.classList.remove('loading');
        flashcardsBtnSidebar.classList.add('error');
        flashcardsBtnSidebar.innerHTML = '<span class="sidebar-icon">❌</span><span class="sidebar-label">Failed!</span>';
        setTimeout(() => {
          flashcardsBtnSidebar.classList.remove('error');
          flashcardsBtnSidebar.innerHTML = '<span class="sidebar-icon">🃏</span><span class="sidebar-label">Flashcards</span>';
        }, 2000);
      }
    });
  }

  // Add Images (File Upload)
  const multiInputSidebar = document.getElementById('multiInput');
  if (multiInputSidebar) {
    multiInputSidebar.addEventListener('change', processMultipleImages);
  }
}

// Camera Functions
async function toggleCameraStream() {
  if (currentStream) {
    // Disable camera
    currentStream.getTracks().forEach(track => track.stop());
    video.srcObject = null;
    currentStream = null;
    toggleCamera.textContent = '📷 Enable Camera';
    showNotification('Camera disabled', 'info');
    updateCameraStatus('denied');
    showCameraPermissionWarning(true);
  } else {
    // Enable camera
    toggleCamera.textContent = '🔄 Initializing...';
    toggleCamera.disabled = true;
    updateCameraStatus('initializing');
    
    try {
      await initializeCamera();
      // Button state is updated in initializeCamera() on success
    } catch (err) {
      // Reset button state on failure
      toggleCamera.textContent = '📷 Enable Camera';
      toggleCamera.disabled = false;
      updateCameraStatus('error');
    }
  }
}

// OCR Functions
async function snapPage() {
  await performEnhancedOCR();
}

// Text-to-Speech
function speakText() {
  const text = ocrText.innerText.trim();
  if (!text) {
    showNotification('No text to read aloud', 'warning');
    return;
  }
  
  if (speechSynthesis.speaking) {
    speechSynthesis.cancel();
    speakBtn.textContent = "🔊 Read Aloud";
    showNotification('Speech stopped', 'info');
  } else {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    speechSynthesis.speak(utterance);
    speakBtn.textContent = "⏸️ Pause";
    showNotification('Reading text aloud', 'info');
  }
}

// Copy Text
async function copyText() {
  const text = ocrText.innerText.trim();
  if (!text) {
    showNotification('No text to copy', 'warning');
    return;
  }
  
  try {
    await navigator.clipboard.writeText(text);
    showNotification('Text copied to clipboard', 'success');
  } catch (err) {
    showNotification('Failed to copy text', 'error');
  }
}

// Clear Text
function clearText() {
  setOcrText('');
  setAiHighlights('');
  showNotification('Text cleared', 'info');
}

// AI Summarization
async function generateHighlights() {
  const text = ocrText.innerText.trim();
  if (!text) {
    showNotification('No text to summarize', 'warning');
    return;
  }
  
  // Add loading state
  summarizeBtn.classList.add('loading');
  summarizeBtn.textContent = '🔄 Generating...';
  setAiHighlights("🤖 Generating enhanced highlights with study context...");

  try {
    // First, get existing study notes for context
    const studyNotesResponse = await fetch('/api/study-notes');
    let studyNotes = [];
    
    if (studyNotesResponse.ok) {
      const studyData = await studyNotesResponse.json();
      if (studyData.success) {
        studyNotes = studyData.studyNotes;
      }
    }
    
    // Use enhanced AI summarization with study notes context
    const response = await fetch('/api/summarize-with-context', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        text: text,
        studyNotes: studyNotes,
        includeContext: true
      })
    });
    
    if (!response.ok) throw new Error("AI summarization failed.");
    
    const data = await response.json();
    setAiHighlights(data.summary);
    
    // Show context information
    if (data.contextUsed > 0) {
      showNotification(`Highlights generated with ${data.contextUsed} relevant study notes!`, 'success');
    } else {
      showNotification('Highlights generated successfully', 'success');
    }
    
    // Auto-save as enhanced study note
    await saveStudyNote('AI Enhanced Highlights', data.summary, ['ai', 'highlights', 'enhanced']);
    
  } catch (e) {
    setAiHighlights("❌ AI summarization failed.");
    showNotification(e.message, 'error');
  } finally {
    // Remove loading state
    summarizeBtn.classList.remove('loading');
    summarizeBtn.textContent = '🤖 Generate Enhanced';
  }
}

// Enhanced Study Notes Management
async function saveStudyNote(title, content, tags = []) {
  try {
    const response = await fetch('/api/study-notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        content,
        tags,
        category: 'study'
      })
    });
    
    if (!response.ok) throw new Error('Failed to save study note');
    
    const data = await response.json();
    showNotification('Study note saved successfully', 'success');
    
    // Refresh study notes display
    await loadStudyNotes();
    
    return data.note;
  } catch (error) {
    console.error('Save study note error:', error);
    showNotification('Failed to save study note', 'error');
  }
}

async function loadStudyNotes() {
  try {
    const response = await fetch('/api/study-notes');
    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        displayStudyNotes(data.studyNotes);
      }
    }
  } catch (error) {
    console.error('Load study notes error:', error);
  }
}

function displayStudyNotes(studyNotes) {
  // Display study notes in the AI tab or a dedicated section
  const studyNotesContainer = document.getElementById('studyNotesContainer');
  if (studyNotesContainer && studyNotes.length > 0) {
    studyNotesContainer.innerHTML = `
      <div class="study-notes-section">
        <h4>📚 Related Study Notes (${studyNotes.length})</h4>
        ${studyNotes.map(note => `
          <div class="study-note-item" onclick="loadStudyNoteToAI('${note.id}')">
            <div class="note-title">${note.title}</div>
            <div class="note-content">${note.content.substring(0, 100)}${note.content.length > 100 ? '...' : ''}</div>
            <div class="note-tags">${note.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>
          </div>
        `).join('')}
      </div>
    `;
  }
}

function loadStudyNoteToAI(noteId) {
  // Load a study note into the AI processing area
  // This allows users to enhance existing notes with AI
  showNotification('Study note loaded for AI enhancement', 'info');
}

// Bookmarking
function addBookmark() {
  const text = ocrText.innerText.trim();
  const highlights = aiHighlights.innerText.trim();
  
  if (!text && !highlights) {
    showNotification('No content to bookmark', 'warning');
    return;
  }
  
  const bookmark = {
    id: Date.now(),
    timestamp: new Date().toLocaleString(),
    text: text,
    highlights: highlights
  };
  
  bookmarks.push(bookmark);
  saveBookmarks();
  loadBookmarks();
  
  showNotification('Bookmark added successfully', 'success');
}

// Progress Tracking
function updateProgress() {
  progressText.textContent = `Pages processed: ${processedPages}`;
  const progressPercent = Math.min((processedPages / 10) * 100, 100);
  progressFill.style.width = `${progressPercent}%`;
}

// Export Functions
function exportToPDF() {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("📚 Smart Highlighter Reader - Book Highlights", 10, 20);
  doc.setFontSize(12);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 10, 30);
  doc.text(`Pages processed: ${processedPages}`, 10, 40);
  
  let yPos = 50;
  
  if (ocrText.innerText.trim()) {
    doc.setFontSize(14);
    doc.text("📖 Extracted Text:", 10, yPos);
    yPos += 10;
    doc.setFontSize(10);
    const textLines = doc.splitTextToSize(ocrText.innerText, 180);
    doc.text(textLines, 10, yPos);
    yPos += textLines.length * 5 + 10;
  }
  
  if (aiHighlights.innerText.trim()) {
    doc.setFontSize(14);
    doc.text("⭐ AI Highlights:", 10, yPos);
    yPos += 10;
    doc.setFontSize(10);
    const highlightLines = doc.splitTextToSize(aiHighlights.innerText, 180);
    doc.text(highlightLines, 10, yPos);
  }
  
  doc.save("book_highlights.pdf");
  showNotification('PDF exported successfully', 'success');
}

function exportNotes() {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("📝 Study Notes", 10, 20);
  doc.setFontSize(12);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 10, 30);
  
  let yPos = 40;
  bookmarks.forEach((bookmark, index) => {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(12);
    doc.text(`Bookmark ${index + 1} - ${bookmark.timestamp}`, 10, yPos);
    yPos += 8;
    doc.setFontSize(10);
    
    if (bookmark.text) {
      const textLines = doc.splitTextToSize(bookmark.text, 180);
      doc.text(textLines, 10, yPos);
      yPos += textLines.length * 5 + 5;
    }
    
    if (bookmark.highlights) {
      const highlightLines = doc.splitTextToSize(bookmark.highlights, 180);
      doc.text(highlightLines, 10, yPos);
      yPos += highlightLines.length * 5 + 10;
    }
  });
  
  doc.save("study_notes.pdf");
  showNotification('Study notes exported successfully', 'success');
}

// Study Tools
async function createQuiz() {
  const text = ocrText.innerText.trim();
  if (!text) {
    showNotification('No text to create quiz from', 'warning');
    return;
  }
  
  createQuizBtn.classList.add('loading');
  createQuizBtn.textContent = '🔄 Generating...';
  
  try {
    // Prefer the dedicated endpoint (stable even without OpenAI)
    let res = await fetch("/api/create-quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        difficulty: "medium",
        questionCount: 5
      })
    });

    // Fallback to summarize route for older deployments
    if (!res.ok) {
      res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          task: "Create 5 multiple choice questions based on this text"
        })
      });
    }

    if (!res.ok) throw new Error("Quiz generation failed.");
    const result = await res.json();

    if (result.quiz?.questions) {
      showQuizModal(result.quiz);
    } else if (result.questions) {
      showQuizModal({ questions: result.questions, difficulty: result.difficulty || 'medium' });
    } else if (result.summary) {
      document.getElementById('quizContent').innerHTML = `
        <div class="quiz-questions">
          ${String(result.summary).split('\n').map(q => `<p>${q}</p>`).join('')}
        </div>
      `;
      setShowQuizModal(true);
    } else {
      throw new Error("Unexpected quiz response");
    }

    showNotification('Quiz generated successfully', 'success');
  } catch (e) {
    showNotification('Failed to generate quiz: ' + e.message, 'error');
  } finally {
    createQuizBtn.classList.remove('loading');
    createQuizBtn.textContent = '❓ Create Quiz';
  }
}

async function createFlashcards() {
  const text = ocrText.innerText.trim();
  if (!text) {
    showNotification('No text to create flashcards from', 'warning');
    return;
  }
  
  flashcardsBtn.classList.add('loading');
  flashcardsBtn.textContent = '🔄 Generating...';
  
  try {
    // Prefer the dedicated endpoint (stable even without OpenAI)
    let res = await fetch("/api/create-flashcards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        cardCount: 5
      })
    });

    // Fallback to summarize route for older deployments
    if (!res.ok) {
      res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          task: "Create 5 flashcards with key terms and definitions"
        })
      });
    }

    if (!res.ok) throw new Error("Flashcard generation failed.");
    const result = await res.json();

    if (result.flashcards?.cards) {
      showFlashcardsModal(result.flashcards);
    } else if (result.cards) {
      showFlashcardsModal({ cards: result.cards, totalCards: result.cards.length || 5 });
    } else if (result.summary) {
      document.getElementById('flashcardsContent').innerHTML = `
        <div class="flashcards">
          ${String(result.summary).split('\n').map(card => `<div class="flashcard">${card}</div>`).join('')}
        </div>
      `;
      setShowFlashcardsModal(true);
    } else {
      throw new Error("Unexpected flashcards response");
    }

    showNotification('Flashcards generated successfully', 'success');
  } catch (e) {
    showNotification('Failed to generate flashcards: ' + e.message, 'error');
  } finally {
    flashcardsBtn.classList.remove('loading');
    flashcardsBtn.textContent = '🃏 Flashcards';
  }
}

// Modal Controls
function setShowQuizModal(show) {
  quizModal.style.display = show ? 'block' : 'none';
}

function setShowFlashcardsModal(show) {
  flashcardsModal.style.display = show ? 'block' : 'none';
}

// Theme Functions
function toggleThemeMode() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const newTheme = isDark ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  
  toggleTheme.textContent = newTheme === 'dark' ? '☀️' : '🌙';
  showNotification(`${newTheme} theme activated`, 'info');
}

function loadTheme() {
  const theme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', theme);
  toggleTheme.textContent = theme === 'dark' ? '☀️' : '🌙';
}

// Reading Mode Toggle
function toggleReadingMode() {
  isReadingMode = !isReadingMode;
  document.body.classList.toggle('reading-mode', isReadingMode);
  toggleMode.textContent = isReadingMode ? "📷 Camera Mode" : "📖 Reading Mode";
  showNotification(`${isReadingMode ? 'Reading' : 'Camera'} mode activated`, 'info');
}

// Process multiple images
async function processMultipleImages(event) {
  const files = event.target.files;
  if (!files.length) {
    showNotification('Select multiple images', 'warning');
    return;
  }

  processAllBtn.classList.add('loading');
  processAllBtn.textContent = '🔄 Processing...';
  
  let combinedText = "";

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const img = new Image();
    img.src = URL.createObjectURL(file);
    
    await new Promise(res => {
      img.onload = async () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        try {
          const result = await Tesseract.recognize(canvas, 'eng');
          combinedText += `--- Page ${i + 1} ---\n${result.data.text}\n\n`;
          processedPages++;
          updateProgress();
        } catch (e) {
          combinedText += `--- Page ${i + 1} ---\n[OCR failed for this page]\n\n`;
        }
        res();
      };
    });
  }

  setOcrText(combinedText);
  showNotification(`OCR completed for ${files.length} pages!`, 'success');
  
  processAllBtn.classList.remove('loading');
  processAllBtn.textContent = '📑 Process Multiple Pages';
}

// Utility Functions
function setOcrText(text) {
  ocrText.innerText = text;
}

function setAiHighlights(text) {
  aiHighlights.innerText = text;
}

// Notification System
function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <span class="notification-message">${message}</span>
      <button class="notification-close">×</button>
    </div>
  `;
  
  // Add styles
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#6366f1'};
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    max-width: 300px;
  `;
  
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 5000);
  
  // Close button
  notification.querySelector('.notification-close').addEventListener('click', () => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  });
}

// Global functions for bookmark deletion
window.deleteBookmark = deleteBookmark;

// Debug camera information
function debugCameraInfo() {
  const info = {
    userAgent: navigator.userAgent,
    protocol: location.protocol,
    hostname: location.hostname,
    mediaDevices: !!navigator.mediaDevices,
    getUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
    permissions: !!navigator.permissions,
    permissionsQuery: !!(navigator.permissions && navigator.permissions.query),
    cameraStream: !!currentStream,
    videoElement: !!video,
    videoReadyState: video ? video.readyState : 'N/A'
  };
  
  console.log('Camera Debug Info:', info);
  
  // Show debug info in notification
  const debugText = Object.entries(info)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');
  
  showNotification('Camera debug info logged to console', 'info');
  
  // Check camera permission status
  checkCameraPermissionStatus();
  
  return info;
}

// Check camera permission status
async function checkCameraPermissionStatus() {
  try {
    if (navigator.permissions && navigator.permissions.query) {
      const permission = await navigator.permissions.query({ name: 'camera' });
      console.log('Camera Permission Status:', permission.state);
      
      let statusMessage = `Camera Permission: ${permission.state}`;
      if (permission.state === 'denied') {
        statusMessage += '\n\nTo fix this:\n1. Click the camera icon in address bar\n2. Select "Allow"\n3. Refresh the page';
      } else if (permission.state === 'granted') {
        statusMessage += '\n\nPermission granted but camera not working. Try refreshing.';
      }
      
      showNotification(statusMessage, permission.state === 'denied' ? 'warning' : 'info');
    } else {
      showNotification('Camera permission API not available. Try refreshing the page.', 'info');
    }
  } catch (err) {
    console.error('Permission check failed:', err);
    showNotification('Camera permission check failed. Try refreshing the page.', 'error');
  }
}

// Reset camera permissions (force new prompt)
async function resetCameraPermissions() {
  try {
    // Stop any existing stream
    if (currentStream) {
      currentStream.getTracks().forEach(track => track.stop());
      currentStream = null;
      video.srcObject = null;
    }
    
    // Reset button state
    toggleCamera.textContent = '📷 Enable Camera';
    updateCameraStatus('unknown');
    
    // Clear any stored permissions (this will force a new prompt)
    if (navigator.permissions && navigator.permissions.query) {
      // Force a new permission check
      await navigator.permissions.query({ name: 'camera' });
    }
    
    showNotification('Camera permissions reset. Click "Enable Camera" to try again.', 'info');
    
    // Show troubleshooting section
    showCameraPermissionWarning(true);
    
  } catch (err) {
    console.error('Reset failed:', err);
    showNotification('Failed to reset camera permissions. Try refreshing the page.', 'error');
  }
}

// Add debug button to camera controls
document.addEventListener('DOMContentLoaded', () => {
  // Add debug button after camera controls are set up
  setTimeout(() => {
    const cameraControls = document.querySelector('.camera-controls');
    if (cameraControls) {
      const debugBtn = document.createElement('button');
      debugBtn.className = 'btn btn-ghost';
      debugBtn.textContent = '🐛 Debug';
      debugBtn.onclick = debugCameraInfo;
      cameraControls.appendChild(debugBtn);
    }
  }, 100);
});

async function handleCameraError(err) {
  // Handle specific error types with mobile-specific messages
  let errorMessage = 'Camera access denied. Please allow camera access to use OCR features.';
  
  if (err.name === 'NotAllowedError') {
    if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      errorMessage = '📱 iPhone Camera Permission Required\n\n1. Tap "Allow" when prompted\n2. Or go to Settings > Safari > Camera > Allow\n3. Refresh the page and try again';
    } else {
      errorMessage = 'Camera permission denied. Please allow camera access in your browser settings and refresh the page.';
    }
  } else if (err.name === 'NotFoundError') {
    errorMessage = 'No camera found. Please connect a camera and try again.';
  } else if (err.name === 'NotReadableError') {
    if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      errorMessage = '📱 iPhone Camera Issue\n\n1. Close other camera apps\n2. Make sure camera is not in use\n3. Try refreshing the page';
    } else {
      errorMessage = 'Camera is already in use by another application. Please close other camera apps and try again.';
    }
  } else if (err.name === 'OverconstrainedError') {
    errorMessage = 'Camera constraints not met. Trying with basic settings...';
    // Try with basic constraints
    try {
      currentStream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = currentStream;
      showNotification('Camera initialized with basic settings', 'success');
      updateCameraControls();
      return;
    } catch (fallbackErr) {
      errorMessage = 'Camera initialization failed even with basic settings.';
    }
  } else if (err.name === 'SecurityError') {
    if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      errorMessage = '📱 iPhone Security Issue\n\n1. Make sure you\'re using HTTPS\n2. Try refreshing the page\n3. Check Safari camera permissions';
    } else {
      errorMessage = 'Camera access blocked due to security restrictions. Please use HTTPS or localhost.';
    }
  } else if (err.name === 'AbortError') {
    errorMessage = 'Camera initialization was aborted. Please try again.';
  }
  
  showNotification(errorMessage, 'error');
  
  // Show additional help for mobile users
  if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
    showNotification('📱 Mobile Device Detected\n\nFor best camera experience:\n• Use Safari (iPhone) or Chrome (Android)\n• Allow camera permissions when prompted\n• Make sure no other apps are using camera', 'info');
  }
  
  // Show additional help for HTTPS issues
  if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
    showNotification('⚠️ Camera access requires HTTPS. Please use HTTPS or localhost for full functionality.', 'warning');
  }
}
