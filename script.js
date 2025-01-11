const API_KEY = '2e3354569b0d5b108e7298434e491008122d983ce7c87cd4815f529e7027a09d';
const API_URL = '/.netlify/functions/generate';

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

    try {
        // Start the job
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

        const { jobId } = await response.json();
        statusText.textContent = 'Processing... This may take 10-20 minutes';

        // Start polling for status
        const pollInterval = setInterval(async () => {
            try {
                const statusResponse = await fetch(`${API_URL}?jobId=${jobId}`, {
                    headers: {
                        'X-API-Key': API_KEY
                    }
                });
                
                if (!statusResponse.ok) {
                    throw new Error('Failed to check status');
                }

                const statusData = await statusResponse.json();

                if (statusData.status === 'completed') {
                    clearInterval(pollInterval);
                    progress.style.width = '100%';
                    statusText.textContent = 'Video generated successfully!';
                    
                    // Setup download button
                    downloadBtn.hidden = false;
                    downloadBtn.onclick = () => {
                        const downloadUrl = statusData.data.data.download_url;
                        window.location.href = downloadUrl;
                    };
                    generateBtn.disabled = false;
                } else if (statusData.status === 'error') {
                    clearInterval(pollInterval);
                    handleError(statusData.error);
                } else {
                    // Update progress (simulate progress as actual progress isn't available)
                    const currentProgress = parseInt(progress.style.width) || 0;
                    if (currentProgress < 90) {
                        progress.style.width = `${currentProgress + 1}%`;
                    }
                }
            } catch (error) {
                console.error('Polling error:', error);
                // Don't clear interval on polling errors, keep trying
            }
        }, 10000); // Poll every 10 seconds

        // Add a timeout after 25 minutes
        setTimeout(() => {
            clearInterval(pollInterval);
            handleError('Process timed out after 25 minutes');
        }, 25 * 60 * 1000);

    } catch (error) {
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