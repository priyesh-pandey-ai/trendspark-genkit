// Test generate-content-kit Edge Function
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://azrbnenohawcdawnxzat.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6cmJuZW5vaGF3Y2Rhd254emF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NTE4NzksImV4cCI6MjA3NzMyNzg3OX0.yycaVKnsig4fwbmyDlpXky656WkeLrBKuSINquQXWXI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testContentKitGeneration() {
  console.log('Testing generate-content-kit Edge Function...\n');
  
  const sampleVoiceCard = `# Brand Voice Card

**One-line brand ethos:** Elevating the daily coffee ritual with quality and convenience.

**Tone descriptors:**
1. Direct
2. Reliable
3. Approachable
4. Confident
5. Efficient`;

  try {
    const response = await fetch('https://azrbnenohawcdawnxzat.supabase.co/functions/v1/generate-content-kit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        voiceCard: sampleVoiceCard,
        trendTitle: 'Sustainable Coffee Trends 2025',
        platforms: ['Instagram', 'LinkedIn'],
        niche: 'D2C Coffee Roaster'
      })
    });

    const responseText = await response.text();
    console.log('Status:', response.status);
    console.log('Response:', responseText);

    if (response.ok) {
      console.log('\n✅ Success!');
      const data = JSON.parse(responseText);
      console.log(`Generated ${data.contentKits.length} content kits`);
      data.contentKits.forEach((kit, i) => {
        console.log(`\n${i + 1}. ${kit.platform}:`);
        console.log(`   Hook: ${kit.hook}`);
        console.log(`   CTA: ${kit.cta}`);
        console.log(`   Hashtags: ${kit.hashtags?.join(', ')}`);
      });
    } else {
      console.error('\n❌ Error response:', responseText);
    }
  } catch (error) {
    console.error('Request failed:', error);
  }
}

testContentKitGeneration();
