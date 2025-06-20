#!/usr/bin/env pwsh

Write-Host "Building Codatta Clip Extension..." -ForegroundColor Green

# Clean previous build
if (Test-Path "dist") {
    Write-Host "Cleaning previous build..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force "dist"
}

# Build with Vite
Write-Host "Running Vite build..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}

# Copy manifest.json to dist
Write-Host "Copying manifest.json..." -ForegroundColor Yellow
Copy-Item "manifest.json" "dist/"

# Copy popup.html to dist
Write-Host "Copying popup.html..." -ForegroundColor Yellow
Copy-Item "popup.html" "dist/"

# Copy sidepanel.html to dist (for backward compatibility)
Write-Host "Copying sidepanel.html..." -ForegroundColor Yellow
Copy-Item "sidepanel.html" "dist/"

# Copy assets folder to dist if it doesn't exist in public
if (Test-Path "src/assets") {
    Write-Host "Copying src/assets to dist..." -ForegroundColor Yellow
    if (!(Test-Path "dist/src")) {
        New-Item -ItemType Directory -Path "dist/src" -Force | Out-Null
    }
    Copy-Item -Recurse "src/assets" "dist/src/"
}

# Ensure public assets are in the right place
if (Test-Path "public/assets") {
    Write-Host "Ensuring public assets are copied..." -ForegroundColor Yellow
    if (!(Test-Path "dist/assets")) {
        New-Item -ItemType Directory -Path "dist/assets" -Force | Out-Null
    }
    Copy-Item -Recurse "public/assets/*" "dist/assets/" -Force
}

# Copy main logo to root for easier access
if (Test-Path "dist/assets/images/logo.png") {
    Write-Host "Copying main logo to root..." -ForegroundColor Yellow
    Copy-Item "dist/assets/images/logo.png" "dist/"
}

Write-Host "Extension built successfully!" -ForegroundColor Green
Write-Host "Extension files are in the 'dist' folder." -ForegroundColor Cyan
Write-Host "You can now load the extension from the 'dist' folder in Chrome." -ForegroundColor Cyan