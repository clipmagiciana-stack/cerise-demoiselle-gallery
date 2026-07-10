# ==========================================================================
# AURA WebAR Gallery: Local Server
# Run in PowerShell to start serving the gallery on http://localhost:3000
# ==========================================================================

$port = 3000
$listener = New-Object System.Net.HttpListener

# Enable UTF-8 console output
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# Base prefixes
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Prefixes.Add("http://127.0.0.1:$port/")

# Helper to find network IPv4
function Get-LocalIP {
    $ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { 
        $_.IPAddress -notlike "127.*" -and 
        $_.IPAddress -notlike "169.254.*" 
    } | Select-Object -First 1).IPAddress
    return $ip
}

$localIp = Get-LocalIP
$networkIpAdded = $false

if ($localIp) {
    # Test if we can bind to the network IP (requires admin or registered URL ACL in Windows HTTP.SYS)
    $testListener = New-Object System.Net.HttpListener
    $testListener.Prefixes.Add("http://${localIp}:$port/")
    try {
        $testListener.Start()
        $testListener.Stop()
        $testListener.Close()
        
        # Binding succeeded, add to main listener
        $listener.Prefixes.Add("http://${localIp}:$port/")
        $networkIpAdded = $true
    } catch {
        # Silent fail on test binding, clean up listener
        try { $testListener.Close() } catch {}
    }
}

Write-Host "`n-----------------------------------------------------" -ForegroundColor Cyan
Write-Host "              AURA WEBAR GALLERY SERVER" -ForegroundColor Cyan
Write-Host "-----------------------------------------------------" -ForegroundColor Cyan
Write-Host "Access URL (Local):  http://localhost:$port/" -ForegroundColor Green
if ($networkIpAdded) {
    Write-Host "Access URL (Mobile): http://${localIp}:$port/" -ForegroundColor Green
    Write-Host "-> Scan the desktop QR code to load the models in AR!" -ForegroundColor Gray
} else {
    Write-Host "Access URL (Mobile): (Disabled - see note below)" -ForegroundColor Gray
    if ($localIp) {
        Write-Host "Note: Mobile network access is disabled because PowerShell is not running as Administrator." -ForegroundColor Yellow
        Write-Host "To test on mobile, restart PowerShell as Administrator and run the server." -ForegroundColor Yellow
    }
}
Write-Host "Press [Ctrl + C] to stop the server.`n" -ForegroundColor DarkGray

# Start listener
try {
    $listener.Start()
} catch {
    Write-Host "ERROR: Could not start HttpListener. Verify port $port is not in use." -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Exit
}

# Mapping file extensions to MIME types
function Get-MimeType ($filePath) {
    $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
    switch ($ext) {
        ".html" { return "text/html; charset=utf-8" }
        ".css"  { return "text/css; charset=utf-8" }
        ".js"   { return "application/javascript; charset=utf-8" }
        ".png"  { return "image/png" }
        ".jpg"  { return "image/jpeg" }
        ".jpeg" { return "image/jpeg" }
        ".glb"  { return "model/gltf-binary" }
        ".svg"  { return "image/svg+xml" }
        ".json" { return "application/json; charset=utf-8" }
        default { return "application/octet-stream" }
    }
}

# Request loop
while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        # Get relative path and decode URL entities
        $urlPath = [System.Uri]::UnescapeDataString($request.Url.AbsolutePath)
        
        # Default to index.html
        if ($urlPath -eq "/") {
            $urlPath = "/index.html"
        }

        # Construct local file path
        $filePath = Join-Path $PSScriptRoot $urlPath.Substring(1)

        Write-Host "[$($request.HttpMethod)] $($request.Url.AbsolutePath)" -NoNewline

        if (Test-Path -Path $filePath -PathType Leaf) {
            # Set response headers
            $mimeType = Get-MimeType $filePath
            $response.ContentType = $mimeType
            $response.AddHeader("Access-Control-Allow-Origin", "*")
            $response.AddHeader("Access-Control-Allow-Methods", "GET, OPTIONS")
            $response.AddHeader("Access-Control-Allow-Headers", "Content-Type")
            $response.AddHeader("Cache-Control", "no-cache")

            # Check if this is an OPTIONS preflight request
            if ($request.HttpMethod -eq "OPTIONS") {
                $response.StatusCode = 200
                $response.Close()
                Write-Host " [200 OPTIONS]" -ForegroundColor Gray
                continue
            }

            # Read file as bytes to prevent binary corruption (essential for GLB and PNG!)
            $fileBytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $fileBytes.Length
            
            # Write to output stream
            $response.OutputStream.Write($fileBytes, 0, $fileBytes.Length)
            $response.StatusCode = 200
            
            Write-Host " [200 OK - $($fileBytes.Length) bytes]" -ForegroundColor Green
        } else {
            # File not found
            $notFoundMsg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $response.StatusCode = 404
            $response.ContentType = "text/plain; charset=utf-8"
            $response.ContentLength64 = $notFoundMsg.Length
            $response.OutputStream.Write($notFoundMsg, 0, $notFoundMsg.Length)
            
            Write-Host " [404 Not Found]" -ForegroundColor Red
        }

        $response.Close()
    } catch {
        # Handle exceptions during connection closure or processing
        if ($listener.IsListening) {
            Write-Host " [Error: $_]" -ForegroundColor Red
        }
    }
}
