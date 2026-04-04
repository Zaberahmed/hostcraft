# ──────────────────────────────────────────────────────────────────────────────
# hostcraft installer — Windows (PowerShell)
# Usage: irm https://raw.githubusercontent.com/Zaberahmed/hostcraft/main/install.ps1 | iex
# ──────────────────────────────────────────────────────────────────────────────
$ErrorActionPreference = "Stop"

$Repo       = "Zaberahmed/hostcraft"
$InstallDir = Join-Path $env:LOCALAPPDATA "Programs\hostcraft"

# ── 1. Find the latest CLI release ───────────────────────────────────────────
Write-Host "Fetching latest release..."

$Headers  = @{ "Accept" = "application/vnd.github+json"; "User-Agent" = "hostcraft-installer" }
$Releases = Invoke-RestMethod `
              -Uri "https://api.github.com/repos/$Repo/releases?per_page=50" `
              -Headers $Headers

# Filter for non-draft, non-prerelease tags that start with "cli-v"
$Latest = $Releases |
          Where-Object { $_.tag_name -like "cli-v*" -and -not $_.draft -and -not $_.prerelease } |
          Select-Object -First 1

if (-not $Latest) {
    Write-Error "Could not find a CLI release on GitHub."
    exit 1
}

$Tag     = $Latest.tag_name                    # "cli-v2.0.1"
$Version = $Tag -replace "^cli-v", ""          # "2.0.1"
Write-Host "Installing hostcraft v$Version"

# ── 2. Download the zip and extract ──────────────────────────────────────────
$Archive     = "hostcraft-x86_64-pc-windows-msvc.zip"
$DownloadUrl = "https://github.com/$Repo/releases/download/$Tag/$Archive"

Write-Host "Downloading $Archive..."

$TmpDir  = Join-Path ([System.IO.Path]::GetTempPath()) ([System.Guid]::NewGuid())
New-Item -ItemType Directory -Path $TmpDir | Out-Null

try {
    $ZipPath = Join-Path $TmpDir "hostcraft.zip"
    Invoke-WebRequest -Uri $DownloadUrl -OutFile $ZipPath
    Expand-Archive -Path $ZipPath -DestinationPath $TmpDir -Force

    # ── 3. Install ────────────────────────────────────────────────────────────
    if (-not (Test-Path $InstallDir)) {
        New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
    }
    Copy-Item (Join-Path $TmpDir "hostcraft.exe") `
              (Join-Path $InstallDir "hostcraft.exe") -Force

    # ── 4. Add install dir to the user's PATH if it isn't already ────────────
    $CurrentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
    if ($CurrentPath -notlike "*$InstallDir*") {
        [Environment]::SetEnvironmentVariable("PATH", "$CurrentPath;$InstallDir", "User")
        Write-Host ""
        Write-Host "Added $InstallDir to your PATH."
        Write-Host "Restart your terminal for the PATH change to take effect."
        Write-Host "Or run this now: `$env:PATH += ';$InstallDir'"
    }

    Write-Host ""
    Write-Host "✓ hostcraft v$Version installed at $InstallDir\hostcraft.exe"
    Write-Host "  Run: hostcraft --version"
    Write-Host ""
}
finally {
    # Always clean up the temp directory, even on failure
    Remove-Item -Recurse -Force $TmpDir -ErrorAction SilentlyContinue
}
