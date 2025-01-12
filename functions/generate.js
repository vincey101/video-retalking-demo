const FormData = require('form-data');
const fetch = require('node-fetch');

let activeJobs = new Map(); // Store job status

exports.handler = async function(event, context) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
        'Access-Control-Allow-Methods': 'POST, GET'
      }
    };
  }

  if (event.httpMethod === 'GET') {
    // Handle status check
    const jobId = event.queryStringParameters?.jobId;
    if (!jobId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Job ID required' })
      };
    }

    const jobStatus = activeJobs.get(jobId);
    if (!jobStatus) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Job not found' })
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(jobStatus)
    };
  }

  if (event.httpMethod === 'POST') {
    try {
      // Parse the multipart form data
      const body = JSON.parse(event.body);
      const formData = new FormData();
      
      // Append the files to FormData
      if (body.face) formData.append('face', Buffer.from(body.face), 'face.mp4');
      if (body.audio) formData.append('audio', Buffer.from(body.audio), 'audio.mp3');

      // Generate a unique job ID
      const jobId = Date.now().toString();
      
      // Store initial job status
      activeJobs.set(jobId, { status: 'processing', progress: 0 });

      // Start the actual processing in the background
      fetch('http://204.12.229.26:5000/api/generate', {
        method: 'POST',
        headers: {
          'X-API-Key': '2e3354569b0d5b108e7298434e491008122d983ce7c87cd4815f529e7027a09d'
        },
        body: formData
      }).then(async (response) => {
        const data = await response.json();
        console.log('API Response:', data); // Debug log
        activeJobs.set(jobId, {
          status: 'completed',
          data: data
        });
      }).catch(error => {
        console.error('API Error:', error); // Debug log
        activeJobs.set(jobId, {
          status: 'error',
          error: error.message
        });
      });

      // Immediately return the job ID
      return {
        statusCode: 202, // Accepted
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ jobId })
      };
    } catch (error) {
      console.error('Handler Error:', error); // Debug log
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message })
      };
    }
  }
}; 