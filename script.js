const API_KEY = '2e3354569b0d5b108e7298434e491008122d983ce7c87cd4815f529e7027a09d';
const API_URL = 'https://www.appclickprojects.xyz/api/generate';

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

    // Reset everything at the start of new process
    statusText.textContent = '';
    statusText.classList.remove('error');
    progress.style.width = '0%';
    progress.style.backgroundColor = '#4CAF50';
    downloadBtn.hidden = true;
    progressContainer.hidden = false;

    generateBtn.disabled = true;

    // Create form data
    const formData = new FormData();
    formData.append('face', videoFile);
    formData.append('audio', audioFile);

    try {
        // Simulate progress
        let progressValue = 0;
        const progressInterval = setInterval(() => {
            if (progressValue < 90) {
                progressValue += 5;
                progress.style.width = `${progressValue}%`;
            }
        }, 1000);

        // Make API request
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'X-API-Key': API_KEY,
                'Accept': '*/*'
            },
            body: formData
        });

        const data = await response.json();
        clearInterval(progressInterval);

        if (data.status === 'success') {
            progress.style.width = '100%';
            statusText.textContent = 'Video generated successfully!';
            statusText.classList.remove('error');
            
            // Setup download button
            downloadBtn.hidden = false;
            downloadBtn.onclick = () => {
                const downloadUrl = data.data.download_url.replace('http://204.12.229.26:5000', 'https://www.appclickprojects.xyz');
                window.location.href = downloadUrl;
            };
        } else {
            throw new Error(data.message || 'Generation failed');
        }
    } catch (error) {
        progress.style.width = '100%';
        progress.style.backgroundColor = '#ff0000';
        statusText.textContent = error.message;
        statusText.classList.add('error');
    }

    // Hide progress after 3 seconds
    setTimeout(() => {
        progressContainer.hidden = true;
        progress.style.width = '0%';
        progress.style.backgroundColor = '#4CAF50';
        generateBtn.disabled = false;
    }, 3000);
}); 