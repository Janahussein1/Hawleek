$possiblePaths = @(
    "c:\Users\LAPTOPY STORE\Downloads\Hawleek\.bin",
    "$PSScriptRoot\..\Hawleek\.bin",
    "c:\Users\Kareem\Downloads\Hawleek_final\.bin",
    "$PSScriptRoot\.bin"
)

$binDir = $null
foreach ($path in $possiblePaths) {
    if (Test-Path $path) {
        $binDir = $path
        break
    }
}

if ($null -eq $binDir) {
    $binDir = "$PSScriptRoot\..\Hawleek\.bin"
}

if (!(Test-Path $binDir)) {
    New-Item -ItemType Directory -Force -Path $binDir
}

$clnt = New-Object System.Net.WebClient

# --- Download & Extract Node.js ---
$nodeZip = Join-Path $binDir "node.zip"
$nodeDest = Join-Path $binDir "node-v20"

if (!(Test-Path (Join-Path $nodeDest "node-v20.11.1-win-x64\node.exe"))) {
    Write-Output "Downloading Node.js..."
    $clnt.DownloadFile('https://nodejs.org/dist/v20.11.1/node-v20.11.1-win-x64.zip', $nodeZip)
    Write-Output "Node.js download completed. Extracting..."
    Expand-Archive -Path $nodeZip -DestinationPath $nodeDest -Force
    Remove-Item $nodeZip -Force
    Write-Output "Node.js extracted successfully."
} else {
    Write-Output "Node.js is already installed."
}

# --- Download & Extract MongoDB ---
$mongoZip = Join-Path $binDir "mongodb.zip"
$mongoDest = Join-Path $binDir "mongodb-server"
$dbPath = Join-Path $binDir "mongodb-data"

if (!(Test-Path $dbPath)) {
    New-Item -ItemType Directory -Force -Path $dbPath
}

if (!(Test-Path (Join-Path $mongoDest "mongodb-win32-x86_64-windows-7.0.6\bin\mongod.exe"))) {
    Write-Output "Downloading MongoDB..."
    $clnt.DownloadFile('https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-7.0.6.zip', $mongoZip)
    Write-Output "MongoDB download completed. Extracting..."
    Expand-Archive -Path $mongoZip -DestinationPath $mongoDest -Force
    Remove-Item $mongoZip -Force
    Write-Output "MongoDB extracted successfully."
} else {
    Write-Output "MongoDB is already installed."
}

Write-Output "Setup completed successfully!"
