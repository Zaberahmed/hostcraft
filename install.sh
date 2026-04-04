#!/bin/sh
# ──────────────────────────────────────────────────────────────────────────────
# hostcraft installer — macOS and Linux
# Usage: curl -fsSL https://raw.githubusercontent.com/Zaberahmed/hostcraft/main/install.sh | sh
# ──────────────────────────────────────────────────────────────────────────────
set -e

REPO="Zaberahmed/hostcraft"
BINARY="hostcraft"
INSTALL_DIR="/usr/local/bin"

# ── 1. Find the latest CLI release tag from GitHub ───────────────────────────
printf "Fetching latest release...\n"

# The API returns a JSON array of releases. We grep for the first tag_name
# that starts with "cli-v", then strip the surrounding quotes.
TAG=$(curl -fsSL \
      -H "Accept: application/vnd.github+json" \
      "https://api.github.com/repos/${REPO}/releases?per_page=50" \
  | grep '"tag_name"' \
  | grep '"cli-v' \
  | head -1 \
  | sed 's/.*"tag_name": *"\(cli-v[^"]*\)".*/\1/')

if [ -z "$TAG" ]; then
    printf "Error: could not find a CLI release on GitHub.\n" >&2
    exit 1
fi

VERSION="${TAG#cli-v}"    # "cli-v2.0.1" → "2.0.1"
printf "Installing hostcraft v%s\n" "$VERSION"

# ── 2. Detect the current platform ───────────────────────────────────────────
OS=$(uname -s | tr '[:upper:]' '[:lower:]')    # "darwin" or "linux"
ARCH=$(uname -m)                               # "x86_64", "aarch64", "arm64"

case "$OS" in
  darwin)
    TARGET="universal-apple-darwin"   # the lipo fat binary works on all Macs
    ;;
  linux)
    case "$ARCH" in
      x86_64)             TARGET="x86_64-unknown-linux-gnu"  ;;
      aarch64 | arm64)    TARGET="aarch64-unknown-linux-gnu" ;;
      *)
        printf "Unsupported architecture: %s\n" "$ARCH" >&2
        printf "Tip: you can still install via: cargo install hostcraft-cli\n" >&2
        exit 1
        ;;
    esac
    ;;
  *)
    printf "Unsupported OS: %s\n" "$OS" >&2
    printf "Windows users: run install.ps1 in PowerShell.\n" >&2
    exit 1
    ;;
esac

# ── 3. Download the archive and extract the binary ───────────────────────────
ARCHIVE="hostcraft-${TARGET}.tar.gz"
URL="https://github.com/${REPO}/releases/download/${TAG}/${ARCHIVE}"

printf "Downloading %s...\n" "$ARCHIVE"

# mktemp -d creates a temporary directory; the trap removes it on exit
# (even if the script fails partway through).
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

curl -fsSL --progress-bar "$URL" | tar -xz -C "$TMP"
chmod +x "${TMP}/${BINARY}"

# ── 4. Move binary into place ────────────────────────────────────────────────
# If the install dir isn't writable by the current user, escalate with sudo.
if [ -w "$INSTALL_DIR" ]; then
    mv "${TMP}/${BINARY}" "${INSTALL_DIR}/${BINARY}"
else
    printf "Moving to %s (sudo required)...\n" "$INSTALL_DIR"
    sudo mv "${TMP}/${BINARY}" "${INSTALL_DIR}/${BINARY}"
fi

printf "\n✓ hostcraft v%s installed at %s/%s\n" "$VERSION" "$INSTALL_DIR" "$BINARY"
printf "  Run: hostcraft --version\n\n"
