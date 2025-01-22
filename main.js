document.addEventListener('DOMContentLoaded', (event) => {
  // Select elements
  const practiceBtn = document.getElementById('practice-btn');
  const testBtn = document.getElementById('test-btn');
  const conversationBox = document.getElementById('conversation-box');
  const examinerText = document.getElementById('examiner-text');
  const responseBox = document.getElementById('response-box');
  const micBtn = document.getElementById('mic-btn');
  const submitBtn = document.getElementById('submit-btn');
  const results = document.getElementById('results');
  const resultsSummary = document.getElementById('results-summary');
  const restartBtn = document.getElementById('restart-btn');
  const downloadBtn = document.getElementById('download-btn');
  const generatePdfBtn = document.getElementById('generate-pdf-btn'); 

  let isRecording = false;
  let recorder;
  let audioChunks = [];
  let mode = ''; // Track the selected mode
  let testSection = 1; // Track the current section in Test Mode
  let testResponses = []; // Store responses for each test section
  let part2Topic = ''; // Store the topic for Part 2

  // Show conversation box and hide mode buttons
  function showConversationBox(selectedMode) {
    mode = selectedMode;
    document.getElementById('mode-selection').style.display = 'none';
    conversationBox.style.display = 'block';
  }

  // Event listeners for mode buttons
  practiceBtn.addEventListener('click', () => {
    showConversationBox('practice');
    examinerText.innerText = 'Welcome to Practice Mode. Please start speaking.';
  });

  testBtn.addEventListener('click', () => {
    showConversationBox('test');
    examinerText.innerText = 'Welcome to Test Mode. Let’s begin Part 1: Introduce yourself.';
  });

  // Start/Stop recording on microphone button click
  micBtn.addEventListener('click', () => {
    if (!isRecording) {
      startRecording();
      micBtn.innerText = '🎤 Stop Recording';
    } else {
      stopRecording();
      micBtn.innerText = '🎤 Start Speaking';
    }
    isRecording = !isRecording;
  });

  // Start recording audio
  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
        console.log('Audio chunk:', event.data); // Log audio chunk
      };

      recorder.start();
      console.log('Recording started'); // Log recording start
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access your microphone. Please check your permissions.');
    }
  }

  // Stop recording and send audio to the backend
  function stopRecording() {
    recorder.stop();
    console.log('Recording stopped'); // Log recording stop

    recorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' }); // Use correct audio format
      console.log('Audio Blob created:', audioBlob); // Log audio blob creation
      audioChunks = []; // Clear audio chunks after recording

      // Create form data for the audio file
      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('mode', mode); // Add mode to the form data
      formData.append('testSection', testSection); // Add test section to the form data

      try {
        // Send audio to backend API
        const response = await fetch('http://localhost:3000/api/speech-to-text', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          console.log('Transcription received:', result.transcript); // Log transcription
          console.log('Response from LLM:', result.response); // Log LLM response
          responseBox.value = `Transcription: ${result.transcript}\nResponse: ${result.response}`; // Display transcription and response

          if (mode === 'test') {
            // Store the response for feedback
            testResponses.push({ section: testSection, transcript: result.transcript, response: result.response });

            // Move to the next section or show feedback
            if (testSection < 3) {
              testSection++;
              if (testSection === 2) {
                const cueCardTopics = [
                  'Describe a memorable holiday you had.',
                  'Talk about a book that you recently read.',
                  'Describe a person who has influenced you the most.',
                  'Talk about a hobby you enjoy.',
                  'Describe a significant event in your life.'
                ];
                const randomTopic = cueCardTopics[Math.floor(Math.random() * cueCardTopics.length)];
                part2Topic = randomTopic;
                examinerText.innerText = `Part 2: Long Turn (Cue Card Activity)\n\nTopic: ${randomTopic}\n\nYou have one minute to prepare your response.`;
              } else if (testSection === 3) {
                const part3Questions = [
                  `Why do you think ${part2Topic} is important in people's lives?`,
                  `What are the positive and negative aspects of ${part2Topic}?`,
                  `How has ${part2Topic} changed over the years?`,
                  `Can you compare ${part2Topic} with another similar topic?`
                ];
                const randomQuestion = part3Questions[Math.floor(Math.random() * part3Questions.length)];
                examinerText.innerText = `Part 3: Two-Way Discussion\n\nLet's discuss more about: ${part2Topic}\n\nQuestion: ${randomQuestion}`;
              } else {
                examinerText.innerText = `Proceeding to Part ${testSection}...`;
              }
            } else {
              showTestFeedback();
              downloadBtn.style.display = 'block';
              generatePdfBtn.style.display = 'block'; // Show generate PDF button
            }
          }
        } else {
          console.error('Error processing audio:', response.statusText);
          alert('Error processing your speech. Please try again.');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Could not send audio to the server. Please try again.');
      }
    };
  }

  // Calculate band score (simplified example)
  function calculateBandScore() {
    // Simple logic to calculate band score based on the length and complexity of responses
    let totalScore = 0;
    testResponses.forEach(response => {
      totalScore += response.transcript.split(' ').length; // Example: score based on word count
    });
    const averageScore = totalScore / testResponses.length;
    return Math.min(9, Math.max(1, Math.round(averageScore / 10))); // Scale to IELTS band score (1-9)
  }

  // Show test feedback
  function showTestFeedback() {
    results.style.display = 'block';
    conversationBox.style.display = 'none';

    const bandScore = calculateBandScore();

    let feedbackSummary = "Test Completed. Here's your feedback:\n\n";
    testResponses.forEach((response, index) => {
      feedbackSummary += `Part ${response.section}:\n`;
      feedbackSummary += `Transcription: ${response.transcript}\n`;
      feedbackSummary += `Response: ${response.response}\n\n`;
    });

    feedbackSummary += `Overall Band Score: ${bandScore}`;

    resultsSummary.innerText = feedbackSummary;
  }

  // Submit response and show results
  submitBtn.addEventListener('click', () => {
    const userResponse = responseBox.value.trim();
    if (!userResponse) {
      alert('Please provide a response before submitting.');
      return;
    }

    // Display results (you can extend this logic to include feedback/scoring)
    results.style.display = 'block';
    conversationBox.style.display = 'none';
    resultsSummary.innerText = `Your response: "${userResponse}"\n\nThank you for your submission!`;
    
    if (mode === 'test') {
      // Show download button for test mode
      downloadBtn.style.display = 'block';
      generatePdfBtn.style.display = 'block'; // Show generate PDF button
    }
  });

  // Restart the session
  restartBtn.addEventListener('click', () => {
    results.style.display = 'none';
    document.getElementById('mode-selection').style.display = 'block';
    responseBox.value = '';
    examinerText.innerText = '';
    downloadBtn.style.display = 'none';
    generatePdfBtn.style.display = 'none';
    testSection = 1; // Reset test section
    testResponses = []; // Clear test responses
  });

   // Download PDF report
   downloadBtn.addEventListener('click', async () => {
    const response = await fetch('http://localhost:3000/api/download-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ transcript: resultsSummary.innerText })
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'IELTS_Report.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
    } else {
      alert('Failed to download the PDF report. Please try again.');
    }
  });

  // Generate PDF button event listener
  generatePdfBtn.addEventListener('click', async () => {
    const feedbackContent = resultsSummary.innerText;

    const response = await fetch('http://localhost:3000/api/download-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ transcript: feedbackContent })
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'IELTS_Report.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
    } else {
      alert('Failed to generate the PDF report. Please try again.');
    }
  });
});
