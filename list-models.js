// List available Gemini models
const API_KEY = 'AIzaSyCSv9y_P_4AoEHFcmOQYVD2Hr8GCTsJZmg';

async function listModels() {
  console.log('Listing available Gemini models...\n');
  
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('Available models:');
      data.models.forEach(model => {
        if (model.supportedGenerationMethods?.includes('generateContent')) {
          console.log(`  - ${model.name} (${model.displayName})`);
        }
      });
    } else {
      console.error('Error:', data);
    }
  } catch (error) {
    console.error('Request failed:', error);
  }
}

listModels();
