/**
 * Test utility to diagnose Reddit API integration
 * Run this in the browser console to test the Reddit API
 */

export async function testRedditAuth() {
  const clientId = import.meta.env.VITE_REDDIT_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_REDDIT_CLIENT_SECRET;

  console.log('🧪 Testing Reddit API Authentication...');
  console.log('Client ID:', clientId ? `${clientId.substring(0, 5)}...` : 'NOT SET');
  console.log('Client Secret:', clientSecret ? `${clientSecret.substring(0, 5)}...` : 'NOT SET');

  if (!clientId || !clientSecret) {
    console.error('❌ Reddit credentials not set in environment variables');
    return { success: false, error: 'Credentials not configured' };
  }

  try {
    console.log('📡 Making auth request to Reddit...');
    
    const response = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      },
      body: 'grant_type=client_credentials',
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    const text = await response.text();
    console.log('Response body:', text);

    if (!response.ok) {
      console.error('❌ Authentication failed');
      return { success: false, error: `HTTP ${response.status}: ${text}` };
    }

    const data = JSON.parse(text);
    console.log('✅ Authentication successful!');
    console.log('Access token:', data.access_token ? `${data.access_token.substring(0, 10)}...` : 'none');
    
    return { success: true, token: data.access_token };
  } catch (error) {
    console.error('❌ Error during authentication:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function testRedditFetch(accessToken: string) {
  console.log('🧪 Testing Reddit API fetch...');
  
  try {
    const url = 'https://oauth.reddit.com/r/all/hot?limit=5';
    console.log('📡 Fetching from:', url);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'TrendCraftAI/1.0.0',
      },
    });

    console.log('Response status:', response.status);
    
    const text = await response.text();
    console.log('Response preview:', text.substring(0, 200));

    if (!response.ok) {
      console.error('❌ Fetch failed');
      return { success: false, error: `HTTP ${response.status}` };
    }

    const data = JSON.parse(text);
    console.log('✅ Fetch successful!');
    console.log('Posts received:', data.data?.children?.length || 0);
    
    if (data.data?.children?.length > 0) {
      console.log('First post:', data.data.children[0].data.title);
    }
    
    return { success: true, posts: data.data?.children || [] };
  } catch (error) {
    console.error('❌ Error during fetch:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function runFullTest() {
  console.log('🔬 Running full Reddit API test suite...\n');
  
  const authResult = await testRedditAuth();
  
  if (!authResult.success || !authResult.token) {
    console.error('\n❌ Test failed at authentication stage');
    return authResult;
  }
  
  console.log('\n');
  const fetchResult = await testRedditFetch(authResult.token);
  
  if (!fetchResult.success) {
    console.error('\n❌ Test failed at fetch stage');
    return fetchResult;
  }
  
  console.log('\n✅ All tests passed! Reddit API is working correctly.');
  return { success: true };
}

// Make it available globally for testing
if (typeof window !== 'undefined') {
  (window as any).testReddit = {
    auth: testRedditAuth,
    fetch: testRedditFetch,
    runFull: runFullTest,
  };
  console.log('💡 Reddit test utilities available. Run: window.testReddit.runFull()');
}
