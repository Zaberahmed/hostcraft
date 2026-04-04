# ──────────────────────────────────────────────────────────────────────────────
# hostcraft uninstaller — Windows (PowerShell)
# Usage: irm https://raw.githubusercontent.com/Zaberahmed/hostcraft/main/uninstall.ps1 | iex
# ──────────────────────────────────────────────────────────────────────────────
$ErrorActionPreference = "Stop"

$InstallDir = Join-Path $env:LOCALAPPDATA "Programs\hostcraft"
$Binary     = Join-Path $InstallDir "hostcraft.exe"

# ── 1. Check if installed ─────────────────────────────────────────────────────
if (-not (Test-Path $Binary)) {
    Write-Host "hostcraft is not installed at $Binary"
    exit 0
}

# ── 2. Remove the binary and any update leftovers ────────────────────────────
Write-Host "Removing $Binary..."
Remove-Item -Force $Binary

# Clean up artifacts that the self-update command can leave behind
# .new  — written during a replace attempt, then renamed; survives if interrupted
# .bak  — the old binary is moved here before the new one is placed
foreach ($ext in @("new", "bak")) {
    $leftover = Join-Path $InstallDir "hostcraft.$ext"
    if (Test-Path $leftover) {
        Remove-Item -Force $leftover
        Write-Host "Removed leftover: $leftover"
    }
}

# Remove the install directory only if it is now empty
if (Test-Path $InstallDir) {
    if ((Get-ChildItem $InstallDir | Measure-Object).Count -eq 0) {
        Remove-Item -Force -Recurse $InstallDir
    }
}

# ── 3. Remove the cache directory ────────────────────────────────────────────
# The CLI stores update-check state here — separate from the install directory.
# Path: %LOCALAPPDATA%\hostcraft\  (created by the `directories` crate)
$CacheDir = Join-Path $env:LOCALAPPDATA "hostcraft"
if (Test-Path $CacheDir) {
    Remove-Item -Recurse -Force $CacheDir
    Write-Host "Removed cache directory: $CacheDir"
}

# ── 4. Remove from user PATH ─────────────────────────────────────────────────
$CurrentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
if ($CurrentPath -like "*$InstallDir*") {
    # TrimEnd('\') on both sides guards against trailing-backslash mismatches
    # that arise if someone manually edited their PATH
    $NewPath = ($CurrentPath -split ";" |
                Where-Object { $_.TrimEnd('\') -ne $InstallDir.TrimEnd('\') } |
                Where-Object { $_ -ne "" }) -join ";"
    [Environment]::SetEnvironmentVariable("PATH", $NewPath, "User")
    Write-Host "Removed $InstallDir from your PATH."
    Write-Host "Restart your terminal for the PATH change to take effect."
}

Write-Host ""
Write-Host "✓ hostcraft uninstalled"
Write-Host ""
