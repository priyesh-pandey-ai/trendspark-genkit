// Quick test script to check Edge Function
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://azrbnenohawcdawnxzat.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6cmJuZW5vaGF3Y2Rhd254emF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NTE4NzksImV4cCI6MjA3NzMyNzg3OX0.yycaVKnsig4fwbmyDlpXky656WkeLrBKuSINquQXWXI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testVoiceCardGeneration() {
  console.log('Testing generate-voice-card Edge Function...');
  
  try {
    const response = await fetch('https://azrbnenohawcdawnxzat.supabase.co/functions/v1/generate-voice-card', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        samplePosts: ['Great Food', '24x7 available'],
        niche: 'D2C Coffee Roaster'
      })
    });

    const responseText = await response.text();
    console.log('Status:', response.status);
    console.log('Response:', responseText);

    if (response.ok) {
      console.log('Success!');
      const data = JSON.parse(responseText);
      console.log('Voice Card:', data.voiceCard);
    } else {
      console.error('Error response:', responseText);
    }
  } catch (error) {
    console.error('Request failed:', error);
  }
}

testVoiceCardGeneration();
