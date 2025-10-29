// Test Edge Function with direct fetch from browser
async function testDirectFetch() {
  console.log('Testing with direct fetch...');
  
  const response = await fetch('https://azrbnenohawcdawnxzat.supabase.co/functions/v1/generate-content-kit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6cmJuZW5vaGF3Y2Rhd254emF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NTE4NzksImV4cCI6MjA3NzMyNzg3OX0.yycaVKnsig4fwbmyDlpXky656WkeLrBKuSINquQXWXI',
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6cmJuZW5vaGF3Y2Rhd254emF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NTE4NzksImV4cCI6MjA3NzMyNzg3OX0.yycaVKnsig4fwbmyDlpXky656WkeLrBKuSINquQXWXI'
    },
    body: JSON.stringify({
      voiceCard: '# Test Voice Card\n\nSimple test',
      trendTitle: 'Test Trend',
      platforms: ['Instagram'],
      niche: 'Test Niche'
    })
  });

  const data = await response.text();
  console.log('Status:', response.status);
  console.log('Response:', data);
  
  return { status: response.status, data };
}

// Copy this function and paste it in your browser console
// Then run: testDirectFetch()
