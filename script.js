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
document.getElementById('generateBtn').addEventListener('click', async () => {
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

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'X-API-Key': API_KEY,
                'Accept': '*/*'
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        clearInterval(progressInterval);

        if (data.status === 'success') {
            progress.style.width = '100%';
            statusText.textContent = 'Video generated successfully!';
            statusText.classList.remove('error');
            
            // Setup download button
            downloadBtn.hidden = false;
            downloadBtn.onclick = () => {
                const downloadUrl = data.data.download_url;
                window.location.href = downloadUrl;
            };
        } else {
            throw new Error(data.message || 'Generation failed');
        }
    } catch (error) {
        clearInterval(progressInterval);
        handleError(error.message);
        console.error('Full error:', error);
    }
});

// Add the handleError function that was missing
function handleError(message) {
    const progress = document.querySelector('.progress');
    const statusText = document.getElementById('statusText');
    const generateBtn = document.getElementById('generateBtn');
    const progressContainer = document.querySelector('.progress-container');

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