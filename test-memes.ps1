# Test script for the failing "memes" case
# This replicates what the UI sends when you generate content for "memes"

$SUPABASE_URL = "https://azrbnenohawcdawnxzat.supabase.co"
$SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6cmJuZW5vaGF3Y2Rhd254emF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NTE4NzksImV4cCI6MjA3NzMyNzg3OX0.yycaVKnsig4fwbmyDlpXky656WkeLrBKuSINquQXWXI"

Write-Host "=== Testing with 'memes' trend (the failing case) ===" -ForegroundColor Yellow
Write-Host ""

# Test payload - matching what UI would send for "memes"
$body = @{
    voiceCard = "Brand voice: friendly, witty, professional. Tone: conversational yet informative. Style: uses analogies and real-world examples."
    trendTitle = "memes"
    platforms = @("Twitter", "LinkedIn")
    niche = "Technology"
} | ConvertTo-Json

Write-Host "Request payload:" -ForegroundColor Cyan
$body
Write-Host ""
Write-Host "Sending request..." -ForegroundColor Gray
Write-Host ""

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

    Write-Host "✅ Success!" -ForegroundColor Green
    Write-Host ""
    $response | ConvertTo-Json -Depth 10
    
} catch {
    Write-Host "❌ Error occurred (as expected):" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.ErrorDetails.Message) {
        Write-Host ""
        Write-Host "Error response body:" -ForegroundColor Yellow
        $_.ErrorDetails.Message | ConvertFrom-Json | ConvertTo-Json -Depth 5
    }
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host ""
        Write-Host "HTTP Status Code: $statusCode" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "=== Now testing with better trend title ===" -ForegroundColor Cyan
Write-Host ""

$body2 = @{
    voiceCard = "Brand voice: friendly, witty, professional. Tone: conversational yet informative. Style: uses analogies and real-world examples."
    trendTitle = "Viral Memes in Digital Marketing"
    platforms = @("Twitter", "LinkedIn")
    niche = "Marketing"
} | ConvertTo-Json

Write-Host "Request payload:" -ForegroundColor Cyan
$body2
Write-Host ""
Write-Host "Sending request..." -ForegroundColor Gray
Write-Host ""

try {
    $response = Invoke-RestMethod `
        -Uri "$SUPABASE_URL/functions/v1/generate-content-kit" `
        -Method Post `
        -Headers @{
            "Authorization" = "Bearer $SUPABASE_KEY"
            "apikey" = $SUPABASE_KEY
            "Content-Type" = "application/json"
        } `
        -Body $body2 `
        -ErrorAction Stop

    Write-Host "✅ Success with better title!" -ForegroundColor Green
    Write-Host ""
    Write-Host "First platform content:" -ForegroundColor Cyan
    $response.contentKits[0] | ConvertTo-Json -Depth 5
    
} catch {
    Write-Host "❌ Still failed:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.ErrorDetails.Message) {
        Write-Host ""
        Write-Host "Error details:" -ForegroundColor Yellow
        $_.ErrorDetails.Message
    }
}
