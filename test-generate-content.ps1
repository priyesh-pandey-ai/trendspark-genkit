# Test script for generate-content-kit edge function
# This tests the deployed Supabase Edge Function directly

# Your Supabase credentials from .env
$SUPABASE_URL = "https://azrbnenohawcdawnxzat.supabase.co"
$SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6cmJuZW5vaGF3Y2Rhd254emF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NTE4NzksImV4cCI6MjA3NzMyNzg3OX0.yycaVKnsig4fwbmyDlpXky656WkeLrBKuSINquQXWXI"

# Test payload (matches what the UI sends)
$body = @{
    voiceCard = "Brand voice: friendly, witty, professional. Tone: conversational yet informative. Style: uses analogies and real-world examples."
    trendTitle = "AI in Marketing Automation"
    platforms = @("Twitter", "LinkedIn")
    niche = "Technology"
} | ConvertTo-Json

Write-Host "Testing generate-content-kit Edge Function..." -ForegroundColor Cyan
Write-Host "URL: $SUPABASE_URL/functions/v1/generate-content-kit" -ForegroundColor Gray
Write-Host ""

# Make the request
try {
    $response = Invoke-RestMethod `
        -Uri "$SUPABASE_URL/functions/v1/generate-content-kit" `
        -Method Post `
        -Headers @{
            "Authorization" = "Bearer $SUPABASE_KEY"
            "apikey" = $SUPABASE_KEY
            "Content-Type" = "application/json"
        } `
        -Body $body `
        -ErrorAction Stop

    Write-Host "✅ Success! Generated content:" -ForegroundColor Green
    Write-Host ""
    $response | ConvertTo-Json -Depth 10
    
} catch {
    Write-Host "❌ Error occurred:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.ErrorDetails.Message) {
        Write-Host ""
        Write-Host "Error details:" -ForegroundColor Yellow
        $_.ErrorDetails.Message
    }
    
    # Show status code if available
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host ""
        Write-Host "HTTP Status Code: $statusCode" -ForegroundColor Yellow
        
        if ($statusCode -eq 429) {
            Write-Host ""
            Write-Host "⚠️  Rate limit (429) - This means:" -ForegroundColor Yellow
            Write-Host "   1. Gemini API quota exceeded (check Google Cloud Console)" -ForegroundColor Gray
            Write-Host "   2. Too many requests in short time (wait 1-2 minutes)" -ForegroundColor Gray
            Write-Host "   3. GEMINI_API_KEY not set in Supabase Edge Function secrets" -ForegroundColor Gray
        }
    }
}
