#!/bin/bash
set -e

echo "=== Building PAI PDF AI React Flow Animation ==="
cd /home/harish/workprofile/PAI_pdf_AI/flow_demo_poc

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

echo "Building React app..."
npm run build

echo "=== Copying built assets to Portfolio ==="
DEST="/home/harish/workprofile/Harish-nika.github.io/portfolio-react/public/pai-animation"
mkdir -p "$DEST"
# Clean existing contents
rm -rf "$DEST"/*
# Copy new built files
cp -r dist/* "$DEST"/

echo "=== Done! React flow animation built and copied successfully ==="
