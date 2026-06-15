#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$ROOT_DIR/portfolio-react"
DIST_DIR="$APP_DIR/dist"

if [[ ! -d "$APP_DIR" ]]; then
  echo "portfolio-react directory not found at: $APP_DIR"
  exit 1
fi

echo "Building React app..."
npm --prefix "$APP_DIR" run build

if [[ ! -d "$DIST_DIR" ]]; then
  echo "Build output missing at: $DIST_DIR"
  exit 1
fi

if [[ ! -f "$ROOT_DIR/index.legacy.backup.html" && -f "$ROOT_DIR/index.html" ]]; then
  cp "$ROOT_DIR/index.html" "$ROOT_DIR/index.legacy.backup.html"
  echo "Backed up existing root index.html -> index.legacy.backup.html"
fi

echo "Syncing dist output to repository root..."

# Keep root clean but do not touch unrelated folders such as source project directories.
rsync -a --delete "$DIST_DIR/assets/" "$ROOT_DIR/assets/"
rsync -a --delete "$DIST_DIR/images/" "$ROOT_DIR/images/"
rsync -a --delete "$DIST_DIR/content/" "$ROOT_DIR/content/"

cp "$DIST_DIR/index.html" "$ROOT_DIR/index.html"
cp "$DIST_DIR/dme-project.html" "$ROOT_DIR/dme-project.html"
cp "$DIST_DIR/content-moderator.html" "$ROOT_DIR/content-moderator.html"
cp "$DIST_DIR/fexpert.html" "$ROOT_DIR/fexpert.html"
cp "$DIST_DIR/lang-tool.html" "$ROOT_DIR/lang-tool.html"
cp "$DIST_DIR/medbot.html" "$ROOT_DIR/medbot.html"
cp "$DIST_DIR/dental-project.html" "$ROOT_DIR/dental-project.html"
cp "$DIST_DIR/profile.html" "$ROOT_DIR/profile.html"
cp "$DIST_DIR/favicon.svg" "$ROOT_DIR/favicon.svg"
cp "$DIST_DIR/icons.svg" "$ROOT_DIR/icons.svg"
cp "$DIST_DIR/robots.txt" "$ROOT_DIR/robots.txt"
cp "$DIST_DIR/sitemap.xml" "$ROOT_DIR/sitemap.xml"
cp "$DIST_DIR/humans.txt" "$ROOT_DIR/humans.txt"
if [[ -f "$DIST_DIR/google7f465a6ab3fc22ea.html" ]]; then
  cp "$DIST_DIR/google7f465a6ab3fc22ea.html" "$ROOT_DIR/google7f465a6ab3fc22ea.html"
fi

echo "Done. GitHub Pages root files are updated from portfolio-react/dist."
