#!/bin/bash

echo "Setting up Reclaim Protocol dependencies..."

# Download ZK files
node node_modules/@reclaimprotocol/zk-symmetric-crypto/lib/scripts/download-files

# Create browser-rpc directory
mkdir -p build/browser-rpc

# Copy resources
echo "Copying ZK resources..."
cp -r ./node_modules/@reclaimprotocol/zk-symmetric-crypto/resources ./build/browser-rpc

echo "Setup complete. You can now build the extension." 