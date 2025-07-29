# URL Shortener Backend Test Script
# Run this script in PowerShell to test all endpoints

Write-Host "=== URL Shortener Backend API Tests ===" -ForegroundColor Green
Write-Host ""

# Test 1: Health Check
Write-Host "1. Testing Health Check..." -ForegroundColor Yellow
$health = Invoke-RestMethod -Uri "http://localhost:5000/health" -Method GET
Write-Host "Response: $($health.status) - $($health.message)" -ForegroundColor Cyan
Write-Host ""

# Test 2: Create Short URL
Write-Host "2. Creating Short URL..." -ForegroundColor Yellow
$shortUrl = Invoke-RestMethod -Uri "http://localhost:5000/shorturls" -Method POST -ContentType "application/json" -Body '{"url": "https://www.example.com", "validity": 120}'
Write-Host "Short URL: $($shortUrl.shortLink)" -ForegroundColor Cyan
Write-Host "Expires: $($shortUrl.expiry)" -ForegroundColor Cyan
$code = $shortUrl.shortLink.Split('/')[-1]
Write-Host ""

# Test 3: Get Statistics (before any clicks)
Write-Host "3. Getting Statistics (before clicks)..." -ForegroundColor Yellow
$stats = Invoke-RestMethod -Uri "http://localhost:5000/shorturls/$code" -Method GET
Write-Host "Original URL: $($stats.originalUrl)" -ForegroundColor Cyan
Write-Host "Total Clicks: $($stats.totalClicks)" -ForegroundColor Cyan
Write-Host ""

# Test 4: Test Redirect (this will create a click)
Write-Host "4. Testing Redirect..." -ForegroundColor Yellow
try {
    Invoke-WebRequest -Uri "http://localhost:5000/$code" -MaximumRedirection 0
} catch {
    if ($_.Exception.Response.StatusCode -eq 302) {
        Write-Host "Redirect working! Status: 302" -ForegroundColor Cyan
        Write-Host "Redirecting to: $($_.Exception.Response.Headers.Location)" -ForegroundColor Cyan
    }
}
Write-Host ""

# Test 5: Get Statistics (after click)
Write-Host "5. Getting Statistics (after click)..." -ForegroundColor Yellow
$stats2 = Invoke-RestMethod -Uri "http://localhost:5000/shorturls/$code" -Method GET
Write-Host "Total Clicks: $($stats2.totalClicks)" -ForegroundColor Cyan
Write-Host "Click Details: $($stats2.clickDetails | ConvertTo-Json -Compress)" -ForegroundColor Cyan
Write-Host ""

# Test 6: Test Invalid Route
Write-Host "6. Testing Invalid Route..." -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "http://localhost:5000/invalid-route" -Method GET
} catch {
    Write-Host "404 Error (Expected): $($_.Exception.Message)" -ForegroundColor Cyan
}
Write-Host ""

Write-Host "=== All Tests Completed ===" -ForegroundColor Green
