// Photo Upload Configuration
const UPLOAD_URL = '/upload'; // Use relative URL for deployment
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// Global variables
let selectedFiles = [];
let selectedFolder = 'SLU'; // Default to SLU since MMEC has its own page

// DOM elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const progressSection = document.getElementById('progressSection');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const previewSection = document.getElementById('previewSection');
const photoGrid = document.getElementById('photoGrid');
const statusMessage = document.getElementById('statusMessage');
const folderBtns = document.querySelectorAll('.folder-btn');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    showStatus('Ready to upload photos to SLU folder', 'info');
});

// Setup event listeners
function setupEventListeners() {
    // File input change
    fileInput.addEventListener('change', handleFileSelect);
    
    // Upload area click
    uploadArea.addEventListener('click', () => fileInput.click());
    
    // Drag and drop events
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    
    // Upload button click
    uploadBtn.addEventListener('click', uploadFiles);
    
    // Folder selection (only SLU button now)
    folderBtns.forEach(btn => {
        if (btn.dataset.folder) { // Only buttons with data-folder attribute (SLU)
            btn.addEventListener('click', () => {
                folderBtns.forEach(b => {
                    if (b.dataset.folder) { // Only style buttons with data-folder
                        b.classList.remove('active');
                    }
                });
                btn.classList.add('active');
                selectedFolder = btn.dataset.folder;
                showStatus(`Selected folder: ${selectedFolder}`, 'info');
            });
        }
    });
}

// Handle file selection
function handleFileSelect(event) {
    const files = Array.from(event.target.files);
    addFiles(files);
}

// Handle drag over
function handleDragOver(event) {
    event.preventDefault();
    uploadArea.classList.add('dragover');
}

// Handle drag leave
function handleDragLeave(event) {
    event.preventDefault();
    uploadArea.classList.remove('dragover');
}

// Handle drop
function handleDrop(event) {
    event.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const files = Array.from(event.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
        addFiles(imageFiles);
    } else {
        showStatus('Please select only image files', 'error');
    }
}

// Add files to selection
function addFiles(files) {
    const imageFiles = files.filter(file => {
        if (!file.type.startsWith('image/')) {
            showStatus(`${file.name} is not an image file`, 'error');
            return false;
        }
        
        if (file.size > MAX_FILE_SIZE) {
            showStatus(`${file.name} is too large (max 10MB)`, 'error');
            return false;
        }
        
        return true;
    });
    
    if (imageFiles.length === 0) {
        return;
    }
    
    selectedFiles = selectedFiles.concat(imageFiles);
    updateFilePreview();
    updateUploadButton();
    showStatus(`${imageFiles.length} photo(s) selected`, 'success');
}

// Update file preview
function updateFilePreview() {
    if (selectedFiles.length === 0) {
        previewSection.style.display = 'none';
        return;
    }
    
    previewSection.style.display = 'block';
    photoGrid.innerHTML = '';
    
    selectedFiles.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const photoItem = document.createElement('div');
            photoItem.className = 'photo-item';
            
            photoItem.innerHTML = `
                <img src="${e.target.result}" alt="Preview">
                <button class="remove-btn" onclick="removeFile(${index})">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            photoGrid.appendChild(photoItem);
        };
        reader.readAsDataURL(file);
    });
}

// Remove file from selection
function removeFile(index) {
    selectedFiles.splice(index, 1);
    updateFilePreview();
    updateUploadButton();
    
    if (selectedFiles.length === 0) {
        showStatus('No photos selected', 'info');
    } else {
        showStatus(`${selectedFiles.length} photo(s) remaining`, 'info');
    }
}

// Update upload button state
function updateUploadButton() {
    uploadBtn.disabled = selectedFiles.length === 0;
}

// Upload files to server
async function uploadFiles() {
    if (selectedFiles.length === 0) {
        showStatus('Please select photos to upload', 'error');
        return;
    }
    
    try {
        // Show progress
        progressSection.style.display = 'block';
        uploadBtn.disabled = true;
        
        let uploadedCount = 0;
        const totalFiles = selectedFiles.length;
        
        for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];
            
            // Update progress
            const progress = ((i + 1) / totalFiles) * 100;
            progressFill.style.width = `${progress}%`;
            progressText.textContent = `Uploading ${i + 1} of ${totalFiles}: ${file.name}`;
            
            // Upload file
            await uploadFile(file);
            uploadedCount++;
        }
        
        // Complete
        progressText.textContent = `Successfully uploaded ${uploadedCount} photo(s) to ${selectedFolder} folder`;
        showStatus(`Successfully uploaded ${uploadedCount} photo(s) to ${selectedFolder} folder`, 'success');
        
        // Reset
        setTimeout(() => {
            progressSection.style.display = 'none';
            selectedFiles = [];
            updateFilePreview();
            updateUploadButton();
            progressFill.style.width = '0%';
        }, 3000);
        
    } catch (error) {
        console.error('Upload error:', error);
        showStatus('Error uploading files: ' + error.message, 'error');
        progressSection.style.display = 'none';
        uploadBtn.disabled = false;
    }
}

// Upload single file
async function uploadFile(file) {
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('folder', selectedFolder);
    
    const response = await fetch(UPLOAD_URL, {
        method: 'POST',
        body: formData
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('Upload result:', result);
    
    return result;
}

// Show status message
function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type}`;
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        statusMessage.style.display = 'none';
    }, 5000);
}

// Add folder information to the UI
function addFolderInfo() {
    const folderInfo = document.createElement('div');
    folderInfo.className = 'folder-info';
    folderInfo.innerHTML = `
        <div class="folder-links">
            <h4>Folder Links:</h4>
            <div class="folder-link-group">
                <a href="https://drive.google.com/drive/folders/1bmyjaK642HxJxlD8cZBMdYewM5sZg9oV?usp=drive_link" 
                   target="_blank" class="folder-link mmec-link">
                    <i class="fas fa-external-link-alt"></i>
                    View MMEC Folder
                </a>
                <a href="https://drive.google.com/drive/folders/1c3RppjMHTMGJdRmaQc4NzqZd3wr2z8_L?usp=sharing" 
                   target="_blank" class="folder-link slu-link">
                    <i class="fas fa-external-link-alt"></i>
                    View SLU Folder
                </a>
            </div>
        </div>
    `;
    
    // Insert after the main content
    const mainContent = document.querySelector('.main-content');
    mainContent.appendChild(folderInfo);
    
    // Add CSS for folder info
    const style = document.createElement('style');
    style.textContent = `
        .folder-info {
            margin-top: 30px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 12px;
            border: 1px solid #e9ecef;
        }
        
        .folder-info h4 {
            margin-bottom: 15px;
            color: #333;
            text-align: center;
        }
        
        .folder-link-group {
            display: flex;
            gap: 15px;
            justify-content: center;
            flex-wrap: wrap;
        }
        
        .folder-link {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 10px 15px;
            background: white;
            color: #667eea;
            text-decoration: none;
            border-radius: 8px;
            border: 2px solid #667eea;
            font-weight: 500;
            transition: all 0.3s ease;
        }
        
        .folder-link:hover {
            background: #667eea;
            color: white;
            transform: translateY(-2px);
        }
        
        .mmec-link {
            border-color: #28a745;
            color: #28a745;
        }
        
        .mmec-link:hover {
            background: #28a745;
            color: white;
        }
        
        .slu-link {
            border-color: #dc3545;
            color: #dc3545;
        }
        
        .slu-link:hover {
            background: #dc3545;
            color: white;
        }
        
        @media (max-width: 768px) {
            .folder-link-group {
                flex-direction: column;
                align-items: center;
            }
            
            .folder-link {
                width: 100%;
                max-width: 200px;
                justify-content: center;
            }
        }
    `;
    document.head.appendChild(style);
}

// Add folder info when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(addFolderInfo, 1000);
});
