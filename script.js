const API_KEY = '2e3354569b0d5b108e7298434e491008122d983ce7c87cd4815f529e7027a09d';
const API_URL = '/api/generate';

let videoFile = null;
let audioFile = null;

// Setup file inputs
document.getElementById('videoBtn').addEventListener('click', () => document.getElementById('videoInput').click());
document.getElementById('audioBtn').addEventListener('click', () => document.getElementById('audioInput').click());

// Handle video selection
document.getElementById('videoInput').addEventListener('change', (e) => {
    videoFile = e.target.files[0];
    const videoPreview = document.getElementById('videoPreview');
    videoPreview.src = URL.createObjectURL(videoFile);
    videoPreview.hidden = false;
    updateGenerateButton();
});

// Handle audio selection
document.getElementById('audioInput').addEventListener('change', (e) => {
    audioFile = e.target.files[0];
    const audioPreview = document.getElementById('audioPreview');
    audioPreview.src = URL.createObjectURL(audioFile);
    audioPreview.hidden = false;
    updateGenerateButton();
});

function updateGenerateButton() {
    const generateBtn = document.getElementById('generateBtn');
    generateBtn.disabled = !(videoFile && audioFile);
}

// Handle generate button click
document.getElementById('generateBtn').addEventListener('click', () => {
    const generateBtn = document.getElementById('generateBtn');
    const progressContainer = document.querySelector('.progress-container');
    const progress = document.querySelector('.progress');
    const statusText = document.getElementById('statusText');
    const downloadBtn = document.getElementById('downloadBtn');

    // Clear previous status and reset progress
    statusText.textContent = '';
    statusText.classList.remove('error');
    progress.style.width = '0%';
    progress.style.backgroundColor = '#4CAF50';

    generateBtn.disabled = true;
    progressContainer.hidden = false;
    downloadBtn.hidden = true;

    // Create form data
    const formData = new FormData();
    formData.append('face', videoFile);
    formData.append('audio', audioFile);

    // Simulate progress
    let progressValue = 0;
    const progressInterval = setInterval(() => {
        if (progressValue < 90) {
            progressValue += 5;
            progress.style.width = `${progressValue}%`;
        }
    }, 1000);

    // Create XMLHttpRequest
    const xhr = new XMLHttpRequest();
    xhr.open('POST', API_URL, true);
    
    // Add all necessary headers
    xhr.setRequestHeader('X-API-Key', API_KEY);
    xhr.setRequestHeader('Accept', '*/*');
    xhr.withCredentials = false;  // Important for CORS

    // Setup handlers
    xhr.onload = function() {
        clearInterval(progressInterval);
        
        if (xhr.status === 200) {
            try {
                const response = JSON.parse(xhr.responseText);
                if (response.status === 'success') {
                    progress.style.width = '100%';
                    statusText.textContent = 'Video generated successfully!';
                    statusText.classList.remove('error');
                    
                    // Setup download button
                    downloadBtn.hidden = false;
                    downloadBtn.onclick = () => {
                        const downloadUrl = response.data.download_url;
                        // Create a temporary anchor element
                        const a = document.createElement('a');
                        a.href = downloadUrl;
                        a.download = 'generated-video.mp4'; // Suggested filename
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                    };
                } else {
                    throw new Error(response.message || 'Generation failed');
                }
            } catch (error) {
                handleError('Failed to parse response: ' + error.message);
            }
        } else {
            handleError(`Server returned status ${xhr.status}: ${xhr.statusText}`);
        }
    };

    xhr.onerror = function() {
        clearInterval(progressInterval);
        handleError('Network error occurred. Please check if the server is accessible.');
        console.log('XHR Error Details:', {
            status: xhr.status,
            statusText: xhr.statusText,
            readyState: xhr.readyState,
            responseType: xhr.responseType,
            responseURL: xhr.responseURL,
            getAllResponseHeaders: xhr.getAllResponseHeaders()
        });
    };

    xhr.upload.onprogress = function(e) {
        if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            progress.style.width = percentComplete + '%';
        }
    };

    // Function to handle errors
    function handleError(message) {
        progress.style.width = '100%';
        progress.style.backgroundColor = '#ff0000';
        statusText.textContent = message;
        statusText.classList.add('error');
        console.error('Error:', message);
        
        // Reset after 3 seconds
        setTimeout(() => {
            progressContainer.hidden = true;
            progress.style.width = '0%';
            progress.style.backgroundColor = '#4CAF50';
            generateBtn.disabled = false;
        }, 3000);
    }

    // Send the request
    try {
        xhr.send(formData);
    } catch (error) {
        handleError('Failed to send request: ' + error.message);
    }
}); 