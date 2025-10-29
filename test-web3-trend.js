// Test with the exact failing trend
import fetch from 'node-fetch';

const SUPABASE_URL = 'https://azrbnenohawcdawnxzat.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6cmJuZW5vaGF3Y2Rhd254emF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NTE4NzksImV4cCI6MjA3NzMyNzg3OX0.yycaVKnsig4fwbmyDlpXky656WkeLrBKuSINquQXWXI';

async function testWeb3Trend() {
  console.log('Testing with Web3 Community Building trend...\n');
  
  const voiceCard = {
    "tone": "confident, direct, knowledgeable",
    "personality": "expert, transparent, trustworthy",
    "values": ["quality", "sustainability", "transparency", "convenience"],
    "style": "informative yet warm, professional but approachable",
    "languagePatterns": ["We believe in...", "Our commitment to...", "Experience the difference..."],
    "audience": "coffee enthusiasts who value quality and ethical sourcing"
  };

  const body = {
    voiceCard: JSON.stringify(voiceCard),
    trendTitle: "Short-Form Video Marketing",
    platforms: ["Instagram", "LinkedIn", "Twitter"],
    niche: "D2C Coffee Roaster"
  };

  console.log('Request body:', JSON.stringify(body, null, 2));
  console.log('\nCalling Edge Function...\n');

  try {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/generate-content-kit`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY
        },
        body: JSON.stringify(body)
      }
    );

    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    console.log('\nResponse Headers:');
    response.headers.forEach((value, key) => {
      console.log(`  ${key}: ${value}`);
    });

    const responseText = await response.text();
    console.log('\nRaw Response:');
    console.log(responseText);

    if (response.ok) {
      const data = JSON.parse(responseText);
      console.log('\n✅ Success!');
      console.log(`Generated ${data.contentKits.length} content kits`);
      data.contentKits.forEach((kit, i) => {
        console.log(`\n${i + 1}. ${kit.platform}:`);
        console.log(`   Hook: ${kit.hook}`);
        console.log(`   CTA: ${kit.cta}`);
      });
    } else {
      console.log('\n❌ Error response');
      try {
        const errorData = JSON.parse(responseText);
        console.log('Error:', errorData);
      } catch (e) {
        console.log('Could not parse error as JSON');
      }
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

testWeb3Trend();
