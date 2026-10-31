# ============================================================
#  Unreleased Books - local preview server
#  Starts a tiny web server for this folder and opens it in
#  your browser. No installs, no admin rights, no Python.
#  Keep this window open while you browse. Ctrl+C stops it.
# ============================================================
param([switch]$NoBrowser)

$ErrorActionPreference = 'Stop'
$rootFull = [System.IO.Path]::GetFullPath((Split-Path -Parent $MyInvocation.MyCommand.Path))
$rootPrefix = $rootFull.TrimEnd('\') + '\'

$mime = @{
  '.html'        = 'text/html; charset=utf-8'
  '.css'         = 'text/css; charset=utf-8'
  '.js'          = 'text/javascript; charset=utf-8'
  '.json'        = 'application/json; charset=utf-8'
  '.webmanifest' = 'application/manifest+json; charset=utf-8'
  '.png'         = 'image/png'
  '.jpg'         = 'image/jpeg'
  '.jpeg'        = 'image/jpeg'
  '.webp'        = 'image/webp'
  '.svg'         = 'image/svg+xml'
  '.ico'         = 'image/x-icon'
  '.woff2'       = 'font/woff2'
  '.mp4'         = 'video/mp4'
  '.txt'         = 'text/plain; charset=utf-8'
  '.xml'         = 'application/xml; charset=utf-8'
  '.pdf'         = 'application/pdf'
}

$ports = @(8000, 8080, 5500, 3000)
$listener = $null
$port = $null
foreach ($candidatePort in $ports) {
  try {
    $candidate = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Loopback, $candidatePort)
    $candidate.Start()
    $listener = $candidate
    $port = $candidatePort
    break
  } catch { }
}

if (-not $listener) {
  Write-Host ''
  Write-Host 'Could not start a local server on ports 8000, 8080, 5500 or 3000.' -ForegroundColor Red
  Write-Host 'Close any other local server and try again, or open index.html directly.'
  Write-Host ''
  Read-Host 'Press Enter to close'
  exit 1
}

$url = "http://localhost:$port/"
Write-Host ''
Write-Host '  UNRELEASED BOOKS - local preview' -ForegroundColor Yellow
Write-Host "  Running at $url" -ForegroundColor Green
Write-Host '  Keep this window open while you browse. Press Ctrl+C to stop.'
Write-Host ''

if (-not $NoBrowser) { Start-Process $url }

function Send-Response {
  param(
    [System.IO.Stream]$stream,
    [int]$status,
    [string]$contentType,
    [byte[]]$body,
    [bool]$sendBody = $true
  )
  $reason = switch ($status) { 200 { 'OK' } 403 { 'Forbidden' } 404 { 'Not Found' } default { 'OK' } }
  $header = "HTTP/1.1 $status $reason`r`nContent-Type: $contentType`r`nContent-Length: $($body.Length)`r`nCache-Control: no-store`r`nConnection: close`r`n`r`n"
  $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
  $stream.Write($headerBytes, 0, $headerBytes.Length)
  if ($sendBody -and $body.Length -gt 0) { $stream.Write($body, 0, $body.Length) }
  $stream.Flush()
}

while ($true) {
  $client = $null
  try {
    $client = $listener.AcceptTcpClient()
    $stream = $client.GetStream()
    $stream.ReadTimeout = 5000
    $reader = New-Object System.IO.StreamReader($stream, [System.Text.Encoding]::ASCII, $false, 1024, $true)

    $requestLine = $reader.ReadLine()
    if ([string]::IsNullOrWhiteSpace($requestLine)) { continue }

    while ($true) {
      $line = $reader.ReadLine()
      if ($null -eq $line -or $line -eq '') { break }
    }

    $parts = $requestLine.Split(' ')
    if ($parts.Length -lt 2) { continue }

    $method = $parts[0].ToUpperInvariant()
    $target = $parts[1]
    if ($target -match '^https?://') { $target = ([Uri]$target).AbsolutePath }

    $path = [Uri]::UnescapeDataString($target.Split('?')[0])
    if ([string]::IsNullOrEmpty($path)) { $path = '/' }
    if ($path -eq '/') { $path = '/index.html' }

    $relative = $path.TrimStart('/') -replace '/', [System.IO.Path]::DirectorySeparatorChar
    $full = [System.IO.Path]::GetFullPath((Join-Path $rootFull $relative))

    $status = 200
    if (-not $full.StartsWith($rootPrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
      $status = 403
    } elseif (Test-Path -LiteralPath $full -PathType Container) {
      $full = Join-Path $full 'index.html'
    }

    if ($status -eq 200 -and -not (Test-Path -LiteralPath $full -PathType Leaf)) {
      $status = 404
      $full = Join-Path $rootFull '404.html'
    }

    if ($status -eq 403) {
      $body = [System.Text.Encoding]::UTF8.GetBytes('Forbidden')
      Send-Response $stream 403 'text/plain; charset=utf-8' $body
    } elseif ($status -eq 404 -and -not (Test-Path -LiteralPath $full -PathType Leaf)) {
      $body = [System.Text.Encoding]::UTF8.GetBytes('Not found')
      Send-Response $stream 404 'text/plain; charset=utf-8' $body
    } else {
      $ext = [System.IO.Path]::GetExtension($full).ToLowerInvariant()
      $contentType = if ($mime.ContainsKey($ext)) { $mime[$ext] } else { 'application/octet-stream' }
      $body = [System.IO.File]::ReadAllBytes($full)
      Send-Response $stream $status $contentType $body ($method -ne 'HEAD')
    }
  } catch {
    # Ignore aborted connections and keep serving.
  } finally {
    if ($client) { try { $client.Close() } catch { } }
  }
}
