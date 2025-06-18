// SLU Photo Upload Configuration
const UPLOAD_URL = '/upload';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// Global variables
let currentStep = 1;
let selectedFiles = [];
let formData = {};

// DOM elements
const sluForm = document.getElementById('sluForm');
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const mobileFileBtn = document.getElementById('mobileFileBtn');
const uploadBtn = document.getElementById('uploadBtn');
const progressSection = document.getElementById('progressSection');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const previewSection = document.getElementById('previewSection');
const photoGrid = document.getElementById('photoGrid');
const statusMessage = document.getElementById('statusMessage');
const nextStep1Btn = document.getElementById('nextStep1Btn');

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
    
    // Show mobile fallback button if on mobile
    if (isMobile()) {
        mobileFileBtn.style.display = 'block';
        console.log('Mobile device detected - showing fallback button');
    }
    
    // Debug: Add a visible test button for mobile
    if (isMobile()) {
        const debugBtn = document.createElement('button');
        debugBtn.textContent = 'Test File Selection';
        debugBtn.style.cssText = 'position: fixed; top: 10px; right: 10px; z-index: 1000; background: red; color: white; padding: 10px; border: none; border-radius: 5px;';
        debugBtn.addEventListener('click', () => {
            console.log('Debug button clicked');
            fileInput.click();
        });
        document.body.appendChild(debugBtn);
    }
});

function setMaxDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('photoDate').max = today;
    document.getElementById('photoDate').value = today;
}

function setupEventListeners() {
    fileInput.addEventListener('change', handleFileSelect);
    
    // Better mobile support with multiple event types
    uploadArea.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        fileInput.click();
    });
    
    // Add touch events for mobile
    uploadArea.addEventListener('touchstart', (e) => {
        e.preventDefault();
        e.stopPropagation();
        fileInput.click();
    });
    
    // Add pointer events for better mobile support
    uploadArea.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        fileInput.click();
    });
    
    // Mobile fallback button
    if (mobileFileBtn) {
        mobileFileBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            fileInput.click();
        });
        
        mobileFileBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
            fileInput.click();
        });
    }
    
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    sluForm.addEventListener('submit', handleFormSubmit);
}

function handleFileSelect(event) {
    const files = Array.from(event.target.files);
    addFiles(files);
}

function handleDragOver(event) {
    event.preventDefault();
    uploadArea.classList.add('dragover');
}

function handleDragLeave(event) {
    event.preventDefault();
    uploadArea.classList.remove('dragover');
}

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

function updateNextButton() {
    nextStep1Btn.disabled = selectedFiles.length === 0;
}

function nextStep() {
    if (currentStep === 1) {
        if (selectedFiles.length === 0) {
            showStatus('Please select at least one photo', 'error');
            return;
        }
    } else if (currentStep === 2) {
        if (!validateStep2()) {
            return;
        }
        collectFormData();
        updateReview();
    }
    document.getElementById(`step${currentStep}`).style.display = 'none';
    currentStep++;
    document.getElementById(`step${currentStep}`).style.display = 'block';
}

function prevStep() {
    document.getElementById(`step${currentStep}`).style.display = 'none';
    currentStep--;
    document.getElementById(`step${currentStep}`).style.display = 'block';
}

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

function collectFormData() {
    formData = {
        rakeName: document.getElementById('rakeName').value.trim(),
        photoDate: document.getElementById('photoDate').value,
        description: document.getElementById('description').value.trim()
    };
}

function updateReview() {
    document.getElementById('reviewRakeName').textContent = formData.rakeName;
    document.getElementById('reviewDate').textContent = formatDate(formData.photoDate);
    document.getElementById('reviewDescription').textContent = formData.description || 'None';
    document.getElementById('reviewPhotoCount').textContent = `${selectedFiles.length} photo(s)`;
    document.getElementById('reviewFolder').textContent = `${formData.rakeName}_${formData.photoDate}`;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

async function handleFormSubmit(event) {
    event.preventDefault();
    if (selectedFiles.length === 0) {
        showStatus('Please select at least one photo', 'error');
        return;
    }
    try {
        progressSection.style.display = 'block';
        uploadBtn.disabled = true;
        let uploadedCount = 0;
        const totalFiles = selectedFiles.length;
        for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];
            const progress = ((i + 1) / totalFiles) * 100;
            progressFill.style.width = `${progress}%`;
            progressText.textContent = `Uploading ${i + 1} of ${totalFiles}: ${file.name}`;
            await uploadFile(file);
            uploadedCount++;
        }
        progressText.textContent = `Successfully uploaded ${uploadedCount} photo(s) to ${formData.rakeName}_${formData.photoDate} folder`;
        showStatus(`Successfully uploaded ${uploadedCount} photo(s) to new folder: ${formData.rakeName}_${formData.photoDate}`, 'success');
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

async function uploadFile(file) {
    try {
        // Convert file to base64
        const reader = new FileReader();
        const fileData = await new Promise((resolve) => {
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(file);
        });

        const formData = {
            folder: 'SLU',
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

function resetForm() {
    sluForm.reset();
    selectedFiles = [];
    formData = {};
    currentStep = 1;
    progressSection.style.display = 'none';
    previewSection.style.display = 'none';
    photoGrid.innerHTML = '';
    progressFill.style.width = '0%';
    document.getElementById('step2').style.display = 'none';
    document.getElementById('step3').style.display = 'none';
    document.getElementById('step1').style.display = 'block';
    setMaxDate();
    showStatus('Form reset. Ready for new upload.', 'info');
}

function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type}`;
    setTimeout(() => {
        statusMessage.style.display = 'none';
    }, 5000);
} 
