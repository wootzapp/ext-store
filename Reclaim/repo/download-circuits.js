const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const CIRCUITS_DIR = path.join(__dirname, 'circuits');
const COMMIT_HASH = 'main';

// Create circuits directory if it doesn't exist
if (!fs.existsSync(CIRCUITS_DIR)) {
  fs.mkdirSync(CIRCUITS_DIR, { recursive: true });
}

// Download file with retry logic
async function downloadFile(url, filePath, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filePath);
        
        https.get(url, (response) => {
          if (response.statusCode === 200) {
          response.pipe(file);
          file.on('finish', () => {
              file.close();
              resolve();
          });
          } else {
            reject(new Error(`HTTP ${response.statusCode}`));
          }
        }).on('error', (error) => {
          fs.unlink(filePath, () => {});
          reject(error);
        });
      });
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}

// Get latest commit hash
async function getLatestCommitHash() {
  try {
    const response = await fetch('https://api.github.com/repos/reclaimprotocol/reclaim-sdk/commits/main');
    const data = await response.json();
    return data.sha.substring(0, 7);
  } catch (error) {
    return COMMIT_HASH;
  }
}

// Main download function
async function downloadCircuits() {
  try {
    const commitHash = await getLatestCommitHash();
    
    const files = [
      'circuit.wasm',
      'circuit_final.zkey',
      'verification_key.json'
    ];

    const baseUrl = `https://raw.githubusercontent.com/reclaimprotocol/reclaim-sdk/${commitHash}/circuits`;

    // Check if files already exist
    const existingFiles = files.filter(file => 
      fs.existsSync(path.join(CIRCUITS_DIR, file))
    );

    if (existingFiles.length === files.length) {
      return;
    }

    // Download files
    for (const file of files) {
      const filePath = path.join(CIRCUITS_DIR, file);
      const url = `${baseUrl}/${file}`;
      
      await downloadFile(url, filePath);
    }
    
  } catch (error) {
    throw new Error(`Failed to download circuits: ${error.message}`);
  }
}

// Run download
if (require.main === module) {
  downloadCircuits()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error:', error.message);
  process.exit(1);
});
}
  
module.exports = { downloadCircuits };