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

$nodePath = "$binDir\node-v20\node-v20.11.1-win-x64\node.exe"
$mongoZip = "$binDir\mongodb.zip"
$mongoDest = "$binDir\mongodb-server"
$dbPath = "$binDir\mongodb-data"
$mongodExe = "$mongoDest\mongodb-win32-x86_64-windows-7.0.6\bin\mongod.exe"

# Extract MongoDB if not done already
if (!(Test-Path $mongodExe)) {
    Write-Output "Extracting MongoDB..."
    Expand-Archive -Path $mongoZip -DestinationPath $mongoDest -Force
    Write-Output "MongoDB extracted successfully."
}

# Start MongoDB in the background if it's not already running
$connection = Get-NetTCPConnection -LocalPort 27017 -ErrorAction SilentlyContinue
if ($connection) {
    Write-Output "✅ MongoDB is already running on port 27017."
} else {
    Write-Output "Starting MongoDB..."
    $mongoProcess = Start-Process -FilePath $mongodExe -ArgumentList "--dbpath `"$dbPath`" --port 27017" -NoNewWindow -PassThru
    # Wait a few seconds for MongoDB to initialize
    Start-Sleep -Seconds 5
    $connection = Get-NetTCPConnection -LocalPort 27017 -ErrorAction SilentlyContinue
    if ($connection) {
        Write-Output "✅ MongoDB started successfully."
    } else {
        Write-Output "❌ Failed to start MongoDB."
        exit 1
    }
}

# Seed the database
Write-Output "Seeding database..."
& $nodePath utils/seeder.js

# Start Node Server
Write-Output "Starting Node Server..."
& $nodePath server.js
