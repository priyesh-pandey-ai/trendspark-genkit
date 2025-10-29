// Test consistency - run the same trend multiple times
import fetch from 'node-fetch';

const SUPABASE_URL = 'https://azrbnenohawcdawnxzat.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6cmJuZW5vaGF3Y2Rhd254emF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NTE4NzksImV4cCI6MjA3NzMyNzg3OX0.yycaVKnsig4fwbmyDlpXky656WkeLrBKuSINquQXWXI';

async function testTrend(trendTitle, attemptNum) {
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
    trendTitle: trendTitle,
    platforms: ["Instagram", "LinkedIn"],
    niche: "D2C Coffee Roaster"
  };

  console.log(`\n🔄 Attempt ${attemptNum}: Testing "${trendTitle}"`);

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

    if (response.ok) {
      const data = await response.json();
      console.log(`✅ SUCCESS - Generated ${data.contentKits.length} content kits`);
      return true;
    } else {
      const errorText = await response.text();
      console.log(`❌ FAILED - Status: ${response.status}`);
      try {
        const errorData = JSON.parse(errorText);
        console.log(`   Error: ${errorData.error}`);
      } catch (e) {
        console.log(`   Raw error: ${errorText.substring(0, 200)}`);
      }
      return false;
    }
  } catch (error) {
    console.log(`❌ REQUEST FAILED: ${error.message}`);
    return false;
  }
}

async function runConsistencyTest() {
  const trends = [
    "test",
    "Short-Form Video Marketing",
    "Web3 Community Building in Trend Topic"
  ];

  for (const trend of trends) {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`Testing: "${trend}"`);
    console.log("=".repeat(60));
    
    let successes = 0;
    const attempts = 3;
    
    for (let i = 1; i <= attempts; i++) {
      const success = await testTrend(trend, i);
      if (success) successes++;
      
      // Wait 2 seconds between attempts
      if (i < attempts) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    const successRate = (successes / attempts * 100).toFixed(0);
    console.log(`\n📊 Results: ${successes}/${attempts} succeeded (${successRate}% success rate)`);
  }
}

runConsistencyTest();
