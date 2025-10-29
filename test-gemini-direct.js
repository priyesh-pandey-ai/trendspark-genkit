// Test Gemini API directly
const API_KEY = 'AIzaSyCSv9y_P_4AoEHFcmOQYVD2Hr8GCTsJZmg';

async function testGeminiAPI() {
  console.log('Testing Gemini API directly...');
  
  // Try different endpoint formats
  const endpoints = [
    `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
    `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`
  ];

  for (const endpoint of endpoints) {
    console.log(`\nTrying: ${endpoint.split('?')[0]}`);
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: 'Say hello in one word'
            }]
          }]
        })
      });

      const data = await response.text();
      console.log('Status:', response.status);
      console.log('Response:', data.substring(0, 200));
      
      if (response.ok) {
        console.log('✅ THIS ENDPOINT WORKS!');
        break;
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
  }
}

testGeminiAPI();
