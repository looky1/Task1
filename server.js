const express = require('express');
const fileUpload = require('express-fileupload');
const speech = require('@google-cloud/speech');
const cors = require('cors');
const { generateResponse } = require('./llmService');
const { createPDF } = require('./pdfService');
const app = express();

// Middleware for handling file uploads and CORS
app.use(fileUpload());
app.use(cors());
app.use(express.json());

// Load Google Cloud credentials
const client = new speech.SpeechClient({
  keyFilename: 'speechtotext-448515-6dd29d751b8c.json', 
});

// API Endpoint to process audio files
app.post('/api/speech-to-text', async (req, res) => {
  try {
    console.log('Received request to /api/speech-to-text'); // Log request received

    // Check if audio file is uploaded
    if (!req.files || !req.files.audio) {
      console.log('No audio file uploaded.'); // Log missing file
      return res.status(400).send('No audio file uploaded.');
    }

    const mode = req.body.mode || 'practice';
    const testSection = req.body.testSection || 1;
    console.log('Mode:', mode); // Log mode
    console.log('Test Section:', testSection); // Log test section

    console.log('File uploaded:', req.files.audio.name); // Log file name

    const audio = req.files.audio.data;

    // Convert the audio data to base64
    const audioBytes = audio.toString('base64');
    console.log('Audio data converted to base64'); // Log conversion

    // Configure the Speech-to-Text request
    const request = {
      audio: { content: audioBytes },
      config: {
        encoding: 'WEBM_OPUS', // Adjust encoding for WEBM OPUS format
        sampleRateHertz: 48000, // Adjust sample rate to match the audio file
        languageCode: 'en-US',
      },
    };

    console.log('Sending request to Google Speech-to-Text API'); // Log API request initiation
    // Send the request to Google Speech-to-Text API
    const [response] = await client.recognize(request);

    // Extract transcription
    const transcription = response.results
      .map((result) => result.alternatives[0].transcript)
      .join('\n');

    console.log('Received transcription from API:', transcription); // Log transcription

    // Generate response using LLM based on mode and section
    let llmPrompt;
    if (mode === 'practice') {
      llmPrompt = `Provide corrections, pronunciation tips, and vocabulary suggestions for the following statement: "${transcription}"`;
    } else if (mode === 'test') {
      switch (testSection) {
        case 1:
          llmPrompt = `Act as an IELTS examiner. Respond to Part 1: Introduction for the following statement: "${transcription}"`;
          break;
        case 2:
          llmPrompt = `Act as an IELTS examiner. Respond to Part 2: Long Turn (Cue Card Activity) for the following statement: "${transcription}"`;
          break;
        case 3:
          llmPrompt = `Act as an IELTS examiner. Respond to Part 3: Two-Way Discussion for the following statement: "${transcription}"`;
          break;
        default:
          llmPrompt = `Act as an IELTS examiner. Respond to the following statement: "${transcription}"`;
      }
    }

    const llmResponse = await generateResponse(llmPrompt);

    res.json({ transcript: transcription, response: llmResponse });
  } catch (error) {
    console.error('Error processing audio:', error); // Log error details
    res.status(500).send('Error processing audio');
  }
});

// API Endpoint to download PDF report
app.post('/api/download-pdf', async (req, res) => {
  try {
    const { transcript } = req.body;
    const pdfBuffer = await createPDF(transcript); // Create PDF using pdfService
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=IELTS_Report.pdf');
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error creating PDF:', error); // Log error details
    res.status(500).send('Error creating PDF');
  }
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
