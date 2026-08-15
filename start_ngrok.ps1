# Ensure ngrok is on path
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Load .env if present
if (Test-Path ".env") {
    Get-Content .env | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#")) {
            $parts = $line.Split("=", 2)
            if ($parts.Length -eq 2) {
                [System.Environment]::SetEnvironmentVariable($parts[0].Trim(), $parts[1].Trim(), "Process")
            }
        }
    }
}

$token = $env:NGROK_AUTHTOKEN
$port = if ($env:NGROK_PORT) { $env:NGROK_PORT } else { "5173" }

if ($token) {
    Write-Host "Configuring ngrok authtoken from .env..." -ForegroundColor Cyan
    ngrok config add-authtoken $token
}

Write-Host "Starting ngrok tunnel for Heart Kids Wear on port $port..." -ForegroundColor Green
ngrok http $port
