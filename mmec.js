// MMEC Photo Upload Configuration
const UPLOAD_URL = '/upload';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// Global variables
let currentStep = 1;
let selectedFiles = [];
let formData = {};

// DOM elements
const mmecForm = document.getElementById('mmecForm');
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const fileInputLabel = document.getElementById('fileInputLabel');
const mobileFileBtn = document.getElementById('mobileFileBtn');
const uploadBtn = document.getElementById('uploadBtn');
const progressSection = document.getElementById('progressSection');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const previewSection = document.getElementById('previewSection');
const photoGrid = document.getElementById('photoGrid');
const statusMessage = document.getElementById('statusMessage');
const nextStep1Btn = document.getElementById('nextStep1Btn');
const permissionNotice = document.getElementById('permissionNotice');
const permissionStatus = document.getElementById('permissionStatus');

// Check if device is mobile
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
           (window.innerWidth <= 768);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    setMaxDate();
    showStatus('Select photos first, then enter details', 'info');
    updatePermissionStatus('ready');
    
    // Show mobile fallback button if on mobile
    if (isMobile()) {
        mobileFileBtn.style.display = 'block';
    }
});

// Set max date to today
function setMaxDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('photoDate').max = today;
    document.getElementById('photoDate').value = today;
}

// Setup event listeners
function setupEventListeners() {
    // File input change
    fileInput.addEventListener('change', handleFileSelect);
    
    // File input click - update permission status
    fileInput.addEventListener('click', () => {
        updatePermissionStatus('requesting');
        showStatus('Browser is requesting permission to access photos...', 'info');
    });
    
    // File input focus - for permission detection
    fileInput.addEventListener('focus', () => {
        updatePermissionStatus('requesting');
    });
    
    // Simple click handler for the upload area (for desktop)
    uploadArea.addEventListener('click', (e) => {
        // Only trigger if not clicking on the file input itself
        if (e.target !== fileInput && e.target !== fileInputLabel) {
            e.preventDefault();
            updatePermissionStatus('requesting');
            fileInput.click();
        }
    });
    
    // Mobile fallback button (if needed)
    if (mobileFileBtn) {
        mobileFileBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            fileInput.click();
        });
    }
    
    // Drag and drop events
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    
    // Form submission
    mmecForm.addEventListener('submit', handleFormSubmit);
}

// Handle file selection
function handleFileSelect(event) {
    const files = Array.from(event.target.files);
    
    if (files.length > 0) {
        // Permission was granted and files were selected
        updatePermissionStatus('granted');
        showStatus('Permission granted! Files selected successfully', 'success');
        addFiles(files);
    } else {
        // No files selected - might be permission denied
        setTimeout(() => {
            updatePermissionStatus('denied');
            showStatus('No files selected. Please check browser permissions and try again', 'error');
        }, 1000);
    }
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
    updateNextButton();
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
                <button type="button" class="remove-btn" onclick="removeFile(${index})">
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
    updateNextButton();
    
    if (selectedFiles.length === 0) {
        showStatus('No photos selected', 'info');
    } else {
        showStatus(`${selectedFiles.length} photo(s) remaining`, 'info');
    }
}

// Update next button state
function updateNextButton() {
    nextStep1Btn.disabled = selectedFiles.length === 0;
}

// Navigation functions
function nextStep() {
    if (currentStep === 1) {
        // Validate step 1 - photos selected
        if (selectedFiles.length === 0) {
            showStatus('Please select at least one photo', 'error');
            return;
        }
    } else if (currentStep === 2) {
        // Validate step 2 - form data
        if (!validateStep2()) {
            return;
        }
        // Collect form data
        collectFormData();
        // Update review
        updateReview();
    }
    
    // Hide current step
    document.getElementById(`step${currentStep}`).style.display = 'none';
    
    // Show next step
    currentStep++;
    document.getElementById(`step${currentStep}`).style.display = 'block';
}

function prevStep() {
    // Hide current step
    document.getElementById(`step${currentStep}`).style.display = 'none';
    
    // Show previous step
    currentStep--;
    document.getElementById(`step${currentStep}`).style.display = 'block';
}

// Validate step 2
function validateStep2() {
    const rakeName = document.getElementById('rakeName').value.trim();
    const photoDate = document.getElementById('photoDate').value;
    
    if (!rakeName) {
        showStatus('Please enter a rake name', 'error');
        document.getElementById('rakeName').focus();
        return false;
    }
    
    if (!photoDate) {
        showStatus('Please select a date', 'error');
        document.getElementById('photoDate').focus();
        return false;
    }
    
    return true;
}

// Collect form data
function collectFormData() {
    formData = {
        rakeName: document.getElementById('rakeName').value.trim(),
        photoDate: document.getElementById('photoDate').value,
        description: document.getElementById('description').value.trim()
    };
}

// Update review section
function updateReview() {
    document.getElementById('reviewRakeName').textContent = formData.rakeName;
    document.getElementById('reviewDate').textContent = formatDate(formData.photoDate);
    document.getElementById('reviewDescription').textContent = formData.description || 'None';
    document.getElementById('reviewPhotoCount').textContent = `${selectedFiles.length} photo(s)`;
    document.getElementById('reviewFolder').textContent = `${formData.rakeName}_${formData.photoDate}`;
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Handle form submission
async function handleFormSubmit(event) {
    event.preventDefault();
    
    if (selectedFiles.length === 0) {
        showStatus('Please select at least one photo', 'error');
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
            
            // Upload file with metadata and create folder
            await uploadFile(file);
            uploadedCount++;
        }
        
        // Complete
        progressText.textContent = `Successfully uploaded ${uploadedCount} photo(s) to ${formData.rakeName}_${formData.photoDate} folder`;
        showStatus(`Successfully uploaded ${uploadedCount} photo(s) to new folder: ${formData.rakeName}_${formData.photoDate}`, 'success');
        
        // Reset form after delay
        setTimeout(() => {
            resetForm();
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
    try {
        // Convert file to base64
        const reader = new FileReader();
        const fileData = await new Promise((resolve) => {
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(file);
        });

        const formData = {
            folder: 'MMEC',
            rakeName: formData.rakeName,
            photoDate: formData.photoDate,
            description: formData.description,
            createFolder: true,
            fileData: fileData,
            fileName: file.name,
            mimeType: file.type
        };

        const response = await fetch('/.netlify/functions/upload', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || 'Upload failed');
        }

        return result;
    } catch (error) {
        console.error('Upload error:', error);
        throw error;
    }
}

// Reset form
function resetForm() {
    // Reset form data
    mmecForm.reset();
    selectedFiles = [];
    formData = {};
    currentStep = 1;
    
    // Reset UI
    progressSection.style.display = 'none';
    previewSection.style.display = 'none';
    photoGrid.innerHTML = '';
    progressFill.style.width = '0%';
    
    // Show step 1
    document.getElementById('step2').style.display = 'none';
    document.getElementById('step3').style.display = 'none';
    document.getElementById('step1').style.display = 'block';
    
    // Reset date
    setMaxDate();
    
    showStatus('Form reset. Ready for new upload.', 'info');
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

// Update permission status display
function updatePermissionStatus(status) {
    const statusElement = permissionStatus;
    const icon = statusElement.querySelector('i');
    const text = statusElement.querySelector('span');
    
    // Remove existing classes
    statusElement.classList.remove('granted', 'denied');
    
    switch(status) {
        case 'ready':
            icon.className = 'fas fa-info-circle';
            text.textContent = 'Ready to request permission';
            break;
        case 'requesting':
            icon.className = 'fas fa-clock';
            text.textContent = 'Requesting permission...';
            break;
        case 'granted':
            icon.className = 'fas fa-check-circle';
            text.textContent = 'Permission granted! You can now select photos';
            statusElement.classList.add('granted');
            break;
        case 'denied':
            icon.className = 'fas fa-times-circle';
            text.textContent = 'Permission denied. Please allow access to photos';
            statusElement.classList.add('denied');
            break;
    }
} 
