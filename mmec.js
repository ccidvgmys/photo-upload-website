// MMEC Photo Upload Configuration
const UPLOAD_URL = '/upload';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB original limit
const COMPRESSED_MAX_SIZE = 5 * 1024 * 1024; // 5MB compressed limit
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// Global variables
let currentStep = 1;
let selectedFiles = [];
let compressedFiles = []; // Store compressed files
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
async function addFiles(files) {
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
    
    // Show compression progress
    showStatus(`Compressing ${imageFiles.length} photo(s)...`, 'info');
    
    try {
        // Compress images
        const compressionResults = await compressImages(imageFiles);
        
        // Store original and compressed files
        selectedFiles = selectedFiles.concat(imageFiles);
        compressedFiles = compressedFiles.concat(compressionResults.map(result => result.compressed));
        
        // Show compression summary
        let totalOriginalSize = 0;
        let totalCompressedSize = 0;
        let compressionSummary = [];
        
        compressionResults.forEach(result => {
            totalOriginalSize += result.originalSize;
            totalCompressedSize += result.compressedSize;
            compressionSummary.push(`${result.original.name}: ${formatFileSize(result.originalSize)} → ${formatFileSize(result.compressedSize)} (${result.compressionRatio}% smaller)`);
        });
        
        const totalSavings = ((totalOriginalSize - totalCompressedSize) / totalOriginalSize * 100).toFixed(1);
        showStatus(`Compression complete! Saved ${totalSavings}% space (${formatFileSize(totalOriginalSize)} → ${formatFileSize(totalCompressedSize)})`, 'success');
        
        // Log compression details
        console.log('Compression Summary:', compressionSummary);
        
        updateFilePreview();
        updateNextButton();
        
    } catch (error) {
        console.error('Compression error:', error);
        showStatus('Error compressing images. Using original files.', 'error');
        
        // Fallback to original files
        selectedFiles = selectedFiles.concat(imageFiles);
        compressedFiles = compressedFiles.concat(imageFiles);
        updateFilePreview();
        updateNextButton();
    }
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
    compressedFiles.splice(index, 1); // Remove compressed file too
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
    document.getElementById('reviewDescription').textContent = formData.description || 'No description';
    document.getElementById('reviewPhotoCount').textContent = `${selectedFiles.length} photo(s)`;
    document.getElementById('reviewFolder').textContent = 'MMEC';
    
    // Add compression information
    if (compressedFiles.length > 0) {
        let totalOriginalSize = 0;
        let totalCompressedSize = 0;
        
        selectedFiles.forEach((file, index) => {
            totalOriginalSize += file.size;
            totalCompressedSize += compressedFiles[index].size;
        });
        
        const savings = ((totalOriginalSize - totalCompressedSize) / totalOriginalSize * 100).toFixed(1);
        const sizeInfo = document.getElementById('reviewPhotoCount');
        sizeInfo.innerHTML = `${selectedFiles.length} photo(s)<br><small>Size: ${formatFileSize(totalOriginalSize)} → ${formatFileSize(totalCompressedSize)} (${savings}% smaller)</small>`;
    }
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

// Format file size for display
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
        const totalFiles = compressedFiles.length; // Use compressed files
        
        for (let i = 0; i < compressedFiles.length; i++) {
            const file = compressedFiles[i]; // Use compressed file
            const originalFile = selectedFiles[i]; // For display name
            
            // Update progress
            const progress = ((i + 1) / totalFiles) * 100;
            progressFill.style.width = `${progress}%`;
            progressText.textContent = `Uploading ${i + 1} of ${totalFiles}: ${originalFile.name}`;
            
            // Upload compressed file with metadata and create folder
            await uploadFile(file, originalFile.name);
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
async function uploadFile(file, originalFileName) {
    try {
        // Convert file to base64
        const reader = new FileReader();
        const fileData = await new Promise((resolve) => {
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(file);
        });

        const uploadData = {
            folder: 'MMEC',
            rakeName: formData.rakeName,
            photoDate: formData.photoDate,
            description: formData.description,
            createFolder: true,
            fileData: fileData,
            fileName: originalFileName || file.name, // Use original filename for display
            mimeType: file.type
        };

        const response = await fetch('/.netlify/functions/upload', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(uploadData)
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
    compressedFiles = []; // Clear compressed files
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

// Image compression function
async function compressImage(file) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = function() {
            // Calculate new dimensions while maintaining aspect ratio
            let { width, height } = img;
            const maxDimension = 1920; // Max width/height
            
            if (width > height && width > maxDimension) {
                height = (height * maxDimension) / width;
                width = maxDimension;
            } else if (height > maxDimension) {
                width = (width * maxDimension) / height;
                height = maxDimension;
            }
            
            // Set canvas dimensions
            canvas.width = width;
            canvas.height = height;
            
            // Draw and compress image
            ctx.drawImage(img, 0, 0, width, height);
            
            // Convert to blob with quality setting
            canvas.toBlob((blob) => {
                // Create new file with compressed data
                const compressedFile = new File([blob], file.name, {
                    type: file.type,
                    lastModified: Date.now()
                });
                
                resolve({
                    original: file,
                    compressed: compressedFile,
                    originalSize: file.size,
                    compressedSize: compressedFile.size,
                    compressionRatio: ((file.size - compressedFile.size) / file.size * 100).toFixed(1)
                });
            }, file.type, 0.8); // 80% quality for JPEG, PNG will be lossless
        };
        
        img.src = URL.createObjectURL(file);
    });
}

// Compress multiple images
async function compressImages(files) {
    const compressionPromises = files.map(file => compressImage(file));
    return await Promise.all(compressionPromises);
} 
