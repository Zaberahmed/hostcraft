#!/bin/sh
# ──────────────────────────────────────────────────────────────────────────────
# hostcraft uninstaller — macOS and Linux
# Usage: curl -fsSL https://raw.githubusercontent.com/Zaberahmed/hostcraft/main/uninstall.sh | sh
# ──────────────────────────────────────────────────────────────────────────────
set -e

BINARY="hostcraft"
INSTALL_DIR="/usr/local/bin"
TARGET="${INSTALL_DIR}/${BINARY}"

# ── 1. Check the primary install location ────────────────────────────────────
if [ ! -f "$TARGET" ]; then
    # Not at the expected location — check if it's anywhere on PATH
    FOUND=$(command -v "$BINARY" 2>/dev/null || true)
    if [ -n "$FOUND" ]; then
        printf "hostcraft is not at %s — found it at %s instead.\n" "$TARGET" "$FOUND"
        printf "If you installed via Cargo, remove it with:\n"
        printf "  cargo uninstall hostcraft-cli\n"
    else
        printf "hostcraft is not installed.\n"
    fi
    exit 0
fi

# ── 2. Remove the binary ─────────────────────────────────────────────────────
printf "Removing %s...\n" "$TARGET"
if [ -w "$INSTALL_DIR" ]; then
    rm -f "$TARGET"
else
    sudo rm -f "$TARGET"
fi

# Clean up any leftover artifacts from a previous interrupted update
rm -f "${TARGET}.new"

# ── 3. Remove the cache directory ────────────────────────────────────────────
# The CLI writes an update-check timestamp here; clean it up on uninstall.
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
case "$OS" in
    darwin) CACHE_DIR="${HOME}/Library/Caches/hostcraft" ;;
    linux)  CACHE_DIR="${XDG_CACHE_HOME:-${HOME}/.cache}/hostcraft" ;;
    *)      CACHE_DIR="" ;;
esac

if [ -n "$CACHE_DIR" ] && [ -d "$CACHE_DIR" ]; then
    rm -rf "$CACHE_DIR"
    printf "Removed cache directory: %s\n" "$CACHE_DIR"
fi

printf "\n✓ hostcraft uninstalled\n\n"
