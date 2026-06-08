$certsDir = Join-Path $PSScriptRoot "config\certs"
if (-not (Test-Path $certsDir)) {
    New-Item -ItemType Directory -Path $certsDir -Force | Out-Null
}

$keyPath = Join-Path $certsDir "key.pem"
$certPath = Join-Path $certsDir "cert.pem"

if ((Test-Path $keyPath) -and (Test-Path $certPath)) {
    Write-Host "✅ SSL Certificates already exist at config/certs/" -ForegroundColor Green
    Exit 0
}

Write-Host "Generating self-signed SSL certificates..."

# Look for portable node or standard node
$nodePath = "node"
$portableNode = "C:\Users\LAPTOPY STORE\Downloads\Hawleek\.bin\node-v20\node-v20.11.1-win-x64\node.exe"
if (Test-Path $portableNode) {
    $nodePath = $portableNode
}

$setupScript = Join-Path $PSScriptRoot "utils\setup-certs.js"

if (Test-Path $setupScript) {
    Write-Host "Running Node certificate generator script with: $nodePath"
    & $nodePath $setupScript
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ SSL Certificates successfully generated!" -ForegroundColor Green
        Exit 0
    }
}

Write-Host "❌ Failed to generate certificates automatically." -ForegroundColor Red
Exit 1
