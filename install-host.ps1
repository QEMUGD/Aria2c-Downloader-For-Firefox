$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$HostDir = Join-Path $Root "native-host"

if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    throw "Python 3 is required. Install Python and enable Add Python to PATH."
}
if (-not (Get-Command aria2c -ErrorAction SilentlyContinue)) {
    throw "aria2c was not found. Install aria2 and add aria2c.exe to PATH first."
}

python -m pip install --user pyinstaller
if ($LASTEXITCODE -ne 0) { throw "PyInstaller installation failed." }

python -m PyInstaller --onefile --clean --name aria2c_host --distpath $HostDir --workpath (Join-Path $env:TEMP "aria2c-host-build") --specpath (Join-Path $env:TEMP "aria2c-host-spec") (Join-Path $HostDir "aria2c_host.py")
if ($LASTEXITCODE -ne 0) { throw "Native host build failed." }

$Exe = Join-Path $HostDir "aria2c_host.exe"
if (-not (Test-Path $Exe)) { throw "Native host executable was not created." }

$ManifestPath = Join-Path $HostDir "com.openai.aria2c16.json"
$Manifest = @{
    name = "com.openai.aria2c16"
    description = "aria2c 16x16 Firefox native messaging host"
    path = $Exe
    type = "stdio"
    allowed_extensions = @("aria2c-16x16-downloader@example.local")
}
$Json = $Manifest | ConvertTo-Json -Depth 4
[System.IO.File]::WriteAllText($ManifestPath, $Json, [System.Text.UTF8Encoding]::new($false))

$RegistryPath = "HKCU:\Software\Mozilla\NativeMessagingHosts\com.openai.aria2c16"
New-Item -Path $RegistryPath -Force | Out-Null
Set-Item -Path $RegistryPath -Value $ManifestPath

Write-Host "aria2c native host installed. Restart Firefox and load manifest.json from about:debugging."
