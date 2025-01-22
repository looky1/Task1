Overview
The Real-Time Conversational Practice tool simulates the IELTS Speaking Test environment to help users improve their speaking skills. It supports both Practice and Test modes, providing real-time feedback and generating detailed reports, including band scores and suggestions.

Features
Practice Mode: Provides corrections, pronunciation tips, and vocabulary suggestions.
Test Mode: Simulates the IELTS Speaking Test with three parts (Introduction, Long Turn, and Two-Way Discussion) and calculates a band score.
Audio Recording: Records user responses via microphone.
Transcription and Feedback: Uses Google Cloud Speech-to-Text API and an LLM(Llama) for transcription and feedback.
PDF Report Generation: Generates and downloads a PDF report of the test results.

Implementation Details
1. Frontend (main.js)
Mode Selection: Allows users to choose between Practice and Test modes.
Audio Recording: Handles audio recording and stops recording upon user command.
Feedback and Band Score Calculation: Displays feedback from the LLM and calculates a simplified band score.
PDF Generation: Sends a request to the backend to generate a PDF report of the results.

Backend (server.js)
Audio Processing: Receives and processes audio files, converting them into text using Google Cloud Speech-to-Text API.
Feedback Generation: Uses an LLM to provide feedback based on the transcription and mode.
PDF Report Generation: Generates a PDF report containing the test results and feedback.

PDF Generation (pdfService.js)
Custom Font Support: Uses fontkit to embed a custom font that supports Unicode characters.
Content Rendering: Adds structured content to the PDF, ensuring special characters are handled correctly.

Testing Instructions
Setup: Ensure all necessary dependencies are installed (express, express-fileupload, @google-cloud/speech, cors, pdf-lib, @pdf-lib/fontkit).
Start the Server: Run node server.js to start the backend server.
Access the Application: Open the HTML file in your browser.
Choose Mode: Select either Practice or Test mode.
Record Response: Use the microphone button to start and stop recording.
Submit and View Feedback: Click the submit button to receive transcription and feedback.
Generate PDF Report: Use the generate PDF button to download the test results.

Troubleshooting
Port Conflicts: If the server fails to start due to a port conflict, ensure no other process is using port 3000.
Font Path Issues: Verify that the font file LiberationSerif-Regular.ttf is correctly placed in the specified path.
PDF Loading Errors: Simplify the PDF generation to ensure basic functionality before adding complexity.

Note:i removed all api keys used from the code when i uploaded to github, i sent the video over whatsapp
