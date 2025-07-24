// Load environment variables
require('dotenv').config();

const express = require('express');
const { ReclaimProofRequest, verifyProof } = require('@reclaimprotocol/js-sdk');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const http = require('http');

const app = express();
const port = 3000;

// ⭐ ENHANCED CORS Middleware ⭐
app.use((req, res, next) => {
    const origin = req.get('Origin');
    
    // Allow browser extensions and all origins for development
    if (origin && (origin.startsWith('chrome-extension://') || origin.startsWith('moz-extension://'))) {
        res.header('Access-Control-Allow-Origin', origin);
    } else {
        res.header('Access-Control-Allow-Origin', '*');
    }
    
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, ngrok-skip-browser-warning, X-App-Id, X-App-Secret, X-Original-Host-Api, X-Original-Host-Ws, X-Forwarded-For, X-Forwarded-Host, X-Forwarded-Proto, User-Agent');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400');
    res.header('ngrok-skip-browser-warning', 'true');
    
    // Add security headers
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('X-Frame-Options', 'DENY');
    res.header('X-XSS-Protection', '1; mode=block');

    if (req.method === 'OPTIONS') {
        console.log('Backend: Handling preflight OPTIONS request for:', req.url);
        return res.sendStatus(204);
    }
    next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.text({ type: '*/*', limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configuration constants from environment variables
const APP_ID = process.env.APP_ID;
const APP_SECRET = process.env.APP_SECRET;
const PROVIDER_ID = process.env.PROVIDER_ID;

// ⭐ IMPORTANT: Update this with your CURRENT Ngrok URL ⭐
// You can also set this as an environment variable: BASE_URL
const BASE_URL = "https://45bd446d0181.ngrok-free.app";

// Validate required environment variables
if (!APP_ID || !APP_SECRET || !PROVIDER_ID) {
    console.error('❌ Missing required environment variables:');
    console.error('   APP_ID:', APP_ID ? '✓ Set' : '✗ Missing');
    console.error('   APP_SECRET:', APP_SECRET ? '✓ Set' : '✗ Missing');
    console.error('   PROVIDER_ID:', PROVIDER_ID ? '✓ Set' : '✗ Missing');
    process.exit(1);
}

// --- Endpoint 1: Generate Reclaim SDK Configuration ---
app.get('/generate-config', async (req, res) => {
    console.log('--- Backend: Received GET request to /generate-config ---');
    console.log('Request Origin:', req.get('Origin') || 'undefined');
    console.log('Request Headers:', JSON.stringify(req.headers, null, 2));

    try {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('ngrok-skip-browser-warning', 'true');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

        console.log('Backend: Attempting to initialize ReclaimProofRequest...');
        const reclaimProofRequest = await ReclaimProofRequest.init(APP_ID, APP_SECRET, PROVIDER_ID);

        // ⭐ CAPTURE AND LOG THE SESSION ID FROM THE SDK INIT ⭐
        const initiatedSessionId = reclaimProofRequest.sessionId; 
        console.log(`Backend: Initialized Reclaim Session ID: ${initiatedSessionId}`);

        console.log(`Backend: Setting app callback URL to: ${BASE_URL}/receive-proofs`);
        reclaimProofRequest.setAppCallbackUrl(BASE_URL + '/receive-proofs');

        const reclaimProofRequestConfig = reclaimProofRequest.toJsonString();
        console.log('Backend: Successfully generated reclaimProofRequestConfig.');
        console.log('Backend: Config length:', reclaimProofRequestConfig.length, 'characters');
        
        // ⭐ CRITICAL FIX: Include sessionId in the response object ⭐
        const responseData = {
            reclaimProofRequestConfig,
            sessionId: initiatedSessionId, // ⭐ Ensure sessionId is included here ⭐
            timestamp: new Date().toISOString(),
            baseUrl: BASE_URL
        };
        
        console.log('Backend: Sending successful JSON response with config and session ID.');
        return res.json(responseData); // Send the correct responseData object
    } catch (error) {
        console.error('Backend: !!! ERROR in /generate-config route !!!', error);
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('ngrok-skip-browser-warning', 'true');
        return res.status(500).json({
            error: 'Failed to generate request config',
            details: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
    }
});
app.all('/reclaim-proxy/api/business-logs/*', async (req, res) => {
    const targetPath = req.originalUrl.replace('/reclaim-proxy/api/business-logs', '/api/business-logs');
    const targetUrl = `https://logs.reclaimprotocol.org${targetPath}`;
    
    console.log(`--- Backend Logging Proxy: Received ${req.method} request ---`);
    console.log(`Backend Logging Proxy: Original URL: ${req.originalUrl}`);
    console.log(`Backend Logging Proxy: Target Path: ${targetPath}`);
    console.log(`Backend Logging Proxy: Forwarding to: ${targetUrl}`);
    console.log(`Backend Logging Proxy: Request Headers:`, JSON.stringify(req.headers, null, 2));

    try {
        const upstreamHeaders = {
            'Accept': 'application/json',
            'Content-Type': req.headers['content-type'] || 'application/json',
            'User-Agent': 'Reclaim-Extension-Proxy/1.0',
            'X-App-Id': APP_ID,
            'X-App-Secret': APP_SECRET,
        };

        if (req.headers['authorization']) {
            upstreamHeaders['Authorization'] = req.headers['authorization'];
        }

        const fetchOptions = {
            method: req.method,
            headers: upstreamHeaders,
        };

        if (req.method !== 'GET' && req.method !== 'HEAD' && req.body !== undefined) {
            if (typeof req.body === 'object' && req.body !== null) {
                fetchOptions.body = JSON.stringify(req.body);
                fetchOptions.headers['Content-Type'] = 'application/json';
            } else if (typeof req.body === 'string') {
                fetchOptions.body = req.body;
                fetchOptions.headers['Content-Type'] = req.headers['content-type'] || 'text/plain';
            }
        }

        console.log(`Backend Logging Proxy: Sending request with body length: ${fetchOptions.body ? fetchOptions.body.length : 0}`);

        const response = await fetch(targetUrl, fetchOptions);

        console.log(`Backend Logging Proxy: Upstream response status: ${response.status} ${response.statusText}`);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Backend Logging Proxy: Upstream error: HTTP ${response.status} - ${response.statusText}`);
            console.error(`Backend Logging Proxy: Error details: ${errorText}`);

            res.status(response.status);
            for (const [key, value] of response.headers.entries()) {
                if (!['transfer-encoding', 'connection', 'keep-alive'].includes(key.toLowerCase())) {
                    res.header(key, value);
                }
            }
            res.setHeader('ngrok-skip-browser-warning', 'true');
            return res.send(errorText);
        }

        const contentType = response.headers.get('content-type') || '';
        let data;

        if (contentType.includes('application/json')) {
            data = await response.json();
            console.log('Backend Logging Proxy: Successfully processed logging request');
        } else {
            data = await response.text();
            console.log('Backend Logging Proxy: Successfully processed text logging response');
        }

        res.status(response.status);
        for (const [key, value] of response.headers.entries()) {
            if (!['transfer-encoding', 'connection', 'keep-alive'].includes(key.toLowerCase())) {
                res.header(key, value);
            }
        }
        res.setHeader('ngrok-skip-browser-warning', 'true');

        if (contentType.includes('application/json')) {
            return res.json(data);
        } else {
            return res.send(data);
        }
    } catch (error) {
        console.error('Backend Logging Proxy: !!! ERROR during logging proxy request !!!', error);
        res.setHeader('ngrok-skip-browser-warning', 'true');
        res.status(500).json({
            error: 'Logging proxy failed',
            details: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
    }
});

// --- Generic API Proxy for Reclaim Protocol HTTP endpoints ---
app.all('/reclaim-proxy/api/*', async (req, res) => {
    const targetPath = req.originalUrl.replace('/reclaim-proxy', '');
    const targetUrl = `https://api.reclaimprotocol.org${targetPath}`;
    
    console.log(`--- Backend Proxy: Received ${req.method} request ---`);
    console.log(`Backend Proxy: Original URL: ${req.originalUrl}`);
    console.log(`Backend Proxy: Target Path: ${targetPath}`);
    console.log(`Backend Proxy: Forwarding to: ${targetUrl}`);
    console.log(`Backend Proxy: Request Headers:`, JSON.stringify(req.headers, null, 2));

    try {
        // Prepare headers for upstream request
        const upstreamHeaders = {
            'Accept': 'application/json',
            'Content-Type': req.headers['content-type'] || 'application/json',
            'User-Agent': 'Reclaim-Extension-Proxy/1.0',
            'X-App-Id': APP_ID,
            'X-App-Secret': APP_SECRET,
        };

        // Copy relevant headers from the original request
        if (req.headers['authorization']) {
            upstreamHeaders['Authorization'] = req.headers['authorization'];
        }

        const fetchOptions = {
            method: req.method,
            headers: upstreamHeaders,
        };

        // Handle request body for POST, PUT, PATCH methods
        if (req.method !== 'GET' && req.method !== 'HEAD' && req.body !== undefined) {
            if (typeof req.body === 'object' && req.body !== null) {
                fetchOptions.body = JSON.stringify(req.body);
                fetchOptions.headers['Content-Type'] = 'application/json';
            } else if (typeof req.body === 'string') {
                fetchOptions.body = req.body;
                fetchOptions.headers['Content-Type'] = req.headers['content-type'] || 'text/plain';
            }
        }

        console.log(`Backend Proxy: Final fetch options:`, JSON.stringify({
            method: fetchOptions.method,
            headers: fetchOptions.headers,
            bodyLength: fetchOptions.body ? fetchOptions.body.length : 0
        }, null, 2));

        const response = await fetch(targetUrl, fetchOptions);

        console.log(`Backend Proxy: Upstream response status: ${response.status} ${response.statusText}`);
        console.log(`Backend Proxy: Upstream response headers:`, JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2));

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Backend Proxy: Upstream error: HTTP ${response.status} - ${response.statusText}`);
            console.error(`Backend Proxy: Error details: ${errorText}`);

            res.status(response.status);

            // Copy response headers
            for (const [key, value] of response.headers.entries()) {
                if (!['transfer-encoding', 'connection', 'keep-alive'].includes(key.toLowerCase())) {
                    res.header(key, value);
                }
            }

            res.setHeader('ngrok-skip-browser-warning', 'true');
            return res.send(errorText);
        }

        const contentType = response.headers.get('content-type') || '';
        let data;

        if (contentType.includes('application/json')) {
            data = await response.json();
            console.log('Backend Proxy: Successfully parsed JSON response');
        } else if (contentType.includes('text/')) {
            data = await response.text();
            console.log('Backend Proxy: Successfully received text response');
        } else {
            data = await response.buffer();
            console.log('Backend Proxy: Successfully received binary response');
        }

        console.log('Backend Proxy: Relaying successful response to client');

        // Set response status
        res.status(response.status);

        // Copy response headers
        for (const [key, value] of response.headers.entries()) {
            if (!['transfer-encoding', 'connection', 'keep-alive'].includes(key.toLowerCase())) {
                res.header(key, value);
            }
        }

        res.setHeader('ngrok-skip-browser-warning', 'true');

        if (contentType.includes('application/json')) {
            return res.json(data);
        } else if (contentType.includes('text/')) {
            return res.send(data);
        } else {
            return res.send(data);
        }
    } catch (error) {
        console.error('Backend Proxy: !!! ERROR during generic proxy request !!!', error);
        res.setHeader('ngrok-skip-browser-warning', 'true');
        res.status(500).json({
            error: 'Proxy failed',
            details: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
    }
});

// --- WebSocket Proxy for Reclaim Attestor ---
const wsProxy = createProxyMiddleware({
    target: 'wss://attestor.reclaimprotocol.org',
    ws: true,
    changeOrigin: true,
    pathRewrite: (path, req) => {
        console.log('Backend Proxy: Rewriting path from', path, 'to /ws');
        return '/ws';
    },
    logLevel: 'debug',
    onProxyReq: (proxyReq, req, res) => {
        console.log(`Backend Proxy: WebSocket proxying request to: ${proxyReq.path}`);
        proxyReq.setHeader('X-App-Id', APP_ID);
        proxyReq.setHeader('X-App-Secret', APP_SECRET);
        if (req.headers['sec-websocket-protocol']) {
            proxyReq.setHeader('Sec-WebSocket-Protocol', req.headers['sec-websocket-protocol']);
        }
    },
    onProxyRes: (proxyRes, req, res) => {
        console.log('Backend Proxy: WebSocket proxy response status:', proxyRes.statusCode);
    },
    onError: (err, req, res) => {
        console.error('Backend Proxy: WebSocket proxy error:', err);
        if (res && res.writeHead) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('WebSocket proxy error');
        }
    },
    onProxyReqWs: (proxyReq, req, socket) => {
        console.log('Backend Proxy: WebSocket upgrade request');
        proxyReq.setHeader('X-App-Id', APP_ID);
        proxyReq.setHeader('X-App-Secret', APP_SECRET);
    },
    onProxyResWs: (proxyRes, proxySocket, proxyHead) => {
        console.log('Backend Proxy: WebSocket upgrade response');
    }
});
// Apply WebSocket proxy middleware
app.use('/reclaim-proxy/ws', wsProxy);

// ⭐ GLOBAL STORAGE FOR PROOFS (in-memory for demo) ⭐
const receivedProofs = new Map();

// --- Endpoint 2: Receive and Verify Proofs ---
app.post('/receive-proofs', async (req, res) => {
    console.log('🎉 --- Backend: Received POST request to /receive-proofs ---');
    console.log('📡 Request Origin:', req.get('Origin'));
    console.log('📡 Request Content-Type:', req.get('Content-Type'));
    console.log('📡 Request Body Type:', typeof req.body);

    try {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('ngrok-skip-browser-warning', 'true');

        let proof;

        // Handle different content types and body formats
        if (typeof req.body === 'string') {
            console.log('🔧 Backend: Processing string body...');
            try {
                // Try to decode if it's URL encoded
                const decodedBody = decodeURIComponent(req.body);
                proof = JSON.parse(decodedBody);
                console.log('✅ Backend: Successfully parsed URL-decoded JSON.');
            } catch (decodeError) {
                // If decoding fails, try parsing directly
                try {
                    proof = JSON.parse(req.body);
                    console.log('✅ Backend: Successfully parsed direct JSON string.');
                } catch (directParseError) {
                    console.error('❌ Backend: Failed to parse body as JSON:', directParseError);
                    return res.status(400).json({
                        error: 'Invalid JSON format in request body',
                        timestamp: new Date().toISOString()
                    });
                }
            }
        } else if (typeof req.body === 'object' && req.body !== null) {
            console.log('✅ Backend: Using object body directly.');
            proof = req.body;
        } else {
            console.error('❌ Backend: Unexpected body type:', typeof req.body);
            return res.status(400).json({
                error: 'Invalid request body format',
                timestamp: new Date().toISOString()
            });
        }

        // ⭐ ENHANCED LOGGING: Show detailed proof structure ⭐
        console.log('📊 ===== RECEIVED PROOF DATA =====');
        console.log('📊 Proof Keys:', Object.keys(proof));
        console.log('📊 Proof Type:', typeof proof);
        
        // Check if this is a WootzApp ZK proof or Reclaim SDK proof
        const isWootzAppProof = proof.proof && proof.verificationKey && proof.publicInputs;
        const isReclaimProof = proof.identifier && proof.proofs && Array.isArray(proof.proofs);
        
        console.log('📊 Is WootzApp ZK Proof:', isWootzAppProof);
        console.log('📊 Is Reclaim SDK Proof:', isReclaimProof);
        
        if (isWootzAppProof) {
            console.log('📊 WootzApp ZK Proof Details:');
            console.log('   - Has Proof:', !!proof.proof);
            console.log('   - Has Verification Key:', !!proof.verificationKey);
            console.log('   - Has Public Inputs:', !!proof.publicInputs);
            console.log('   - Has Metadata:', !!proof.metadata);
            if (proof.metadata) {
                console.log('   - Generated At:', proof.metadata.generated_at);
                console.log('   - URL:', proof.metadata.url);
                console.log('   - Provider:', proof.metadata.provider);
                console.log('   - Extracted Params:', proof.metadata.extracted_params);
            }
        } else if (isReclaimProof) {
            console.log('📊 Reclaim SDK Proof Details:');
            console.log('   - Identifier:', proof.identifier);
            console.log('   - Type:', proof.type);
            console.log('   - Version:', proof.version);
            console.log('   - Number of Proofs:', proof.proofs.length);
            
            if (proof.proofs && proof.proofs.length > 0) {
                console.log('   - First Proof Details:');
                console.log('     - Provider:', proof.proofs[0].provider || 'Unknown');
                console.log('     - Parameters:', proof.proofs[0].parameters || 'None');
                console.log('     - Proof Data Length:', proof.proofs[0].proof ? proof.proofs[0].proof.length : 0);
            }
        } else {
            console.log('📊 Unknown Proof Structure');
        }
        
        console.log('📊 Full Proof JSON (first 1000 chars):', JSON.stringify(proof, null, 2).substring(0, 1000));
        console.log('📊 ================================');

        // Handle different proof types
        let result;
        if (isWootzAppProof) {
            console.log('🔍 Backend: Processing WootzApp ZK proof...');
            // For WootzApp ZK proofs, we don't need to verify with Reclaim SDK
            // The ZK proof is self-verifying
            result = {
                success: true,
                message: 'WootzApp ZK proof received and validated',
                proofType: 'wootzapp_zk',
                metadata: proof.metadata || {}
            };
        } else if (isReclaimProof) {
            console.log('🔍 Backend: Attempting to verify Reclaim SDK proof...');
            result = await verifyProof(proof);
        } else {
            console.error('❌ Backend: Unknown proof structure - cannot verify');
            return res.status(400).json({
                error: 'Unknown proof structure - cannot verify',
                timestamp: new Date().toISOString()
            });
        }

        if (!result) {
            console.warn('❌ Backend: Proof verification failed for received data.');
            return res.status(400).json({
                error: 'Invalid proofs data - verification failed',
                timestamp: new Date().toISOString()
            });
        }

        // ⭐ STORE THE PROOF FOR LATER VIEWING ⭐
        const proofId = isWootzAppProof ? 
            `wootzapp_${Date.now()}` : 
            (proof.identifier || `proof_${Date.now()}`);
            
        const storedProof = {
            id: proofId,
            receivedAt: new Date().toISOString(),
            proof: proof,
            verificationResult: result,
            status: 'verified',
            proofType: isWootzAppProof ? 'wootzapp_zk' : 'reclaim_sdk'
        };
        
        receivedProofs.set(proofId, storedProof);
        console.log('💾 Backend: Proof stored with ID:', proofId);
        console.log('💾 Backend: Total stored proofs:', receivedProofs.size);

        console.log('✅ Backend: Proof verified successfully!');
        return res.json({
            success: true,
            message: isWootzAppProof ? 'WootzApp ZK proof received and validated' : 'Proof verified successfully',
            timestamp: new Date().toISOString(),
            proofId: proofId,
            proofType: isWootzAppProof ? 'wootzapp_zk' : 'reclaim_sdk',
            proofDetails: isWootzAppProof ? {
                provider: proof.metadata?.provider || 'Unknown',
                url: proof.metadata?.url || 'Unknown',
                extractedParams: proof.metadata?.extracted_params || {},
                generatedAt: proof.metadata?.generated_at || 'Unknown'
            } : {
                identifier: proof.identifier,
                type: proof.type,
                version: proof.version,
                proofCount: proof.proofs ? proof.proofs.length : 0,
                providers: proof.proofs ? proof.proofs.map(p => p.provider).filter(Boolean) : []
            },
            viewUrl: `${BASE_URL}/view-proof/${proofId}`
        });

    } catch (error) {
        console.error('❌ Backend: !!! ERROR in /receive-proofs route !!!', error);
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('ngrok-skip-browser-warning', 'true');
        return res.status(500).json({
            error: 'Failed to process proofs',
            details: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
    }
});

// --- Endpoint 3: View All Stored Proofs ---
app.get('/proofs', (req, res) => {
    console.log('📋 Backend: View all proofs requested');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('ngrok-skip-browser-warning', 'true');
    
    const proofsList = Array.from(receivedProofs.values()).map(storedProof => ({
        id: storedProof.id,
        receivedAt: storedProof.receivedAt,
        status: storedProof.status,
        proofDetails: {
            identifier: storedProof.proof.identifier,
            type: storedProof.proof.type,
            version: storedProof.proof.version,
            proofCount: storedProof.proof.proofs ? storedProof.proof.proofs.length : 0,
            providers: storedProof.proof.proofs ? storedProof.proof.proofs.map(p => p.provider).filter(Boolean) : []
        },
        viewUrl: `${BASE_URL}/view-proof/${storedProof.id}`
    }));
    
    res.json({
        totalProofs: receivedProofs.size,
        proofs: proofsList,
        timestamp: new Date().toISOString()
    });
});

// --- Endpoint 4: View Specific Proof Details ---
app.get('/view-proof/:proofId', (req, res) => {
    const { proofId } = req.params;
    console.log('🔍 Backend: View specific proof requested:', proofId);
    
    const storedProof = receivedProofs.get(proofId);
    
    if (!storedProof) {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('ngrok-skip-browser-warning', 'true');
        return res.status(404).json({
            error: 'Proof not found',
            proofId: proofId,
            timestamp: new Date().toISOString()
        });
    }
    
    // Check if user wants JSON or HTML view
    const wantsJson = req.query.format === 'json' || req.headers.accept?.includes('application/json');
    
    if (wantsJson) {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('ngrok-skip-browser-warning', 'true');
        return res.json(storedProof);
    }
    
    // Return HTML view for browser
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('ngrok-skip-browser-warning', 'true');
    
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Proof Details - ${proofId}</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
            .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { background: #4CAF50; color: white; padding: 15px; margin: -20px -20px 20px -20px; border-radius: 8px 8px 0 0; }
            .proof-info { background: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
            .proof-data { background: #f0f0f0; padding: 15px; border-radius: 5px; overflow-x: auto; }
            .proof-data pre { margin: 0; white-space: pre-wrap; }
            .back-link { margin-top: 20px; }
            .back-link a { color: #4CAF50; text-decoration: none; }
            .back-link a:hover { text-decoration: underline; }
            .status-verified { color: #4CAF50; font-weight: bold; }
            .status-failed { color: #f44336; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Proof Verification Details</h1>
                <p>Proof ID: ${proofId}</p>
            </div>
            
            <div class="proof-info">
                <h3>📊 Proof Information</h3>
                <p><strong>Status:</strong> <span class="status-${storedProof.status}">${storedProof.status.toUpperCase()}</span></p>
                <p><strong>Received:</strong> ${new Date(storedProof.receivedAt).toLocaleString()}</p>
                <p><strong>Identifier:</strong> ${storedProof.proof.identifier || 'N/A'}</p>
                <p><strong>Type:</strong> ${storedProof.proof.type || 'N/A'}</p>
                <p><strong>Version:</strong> ${storedProof.proof.version || 'N/A'}</p>
                <p><strong>Number of Proofs:</strong> ${storedProof.proof.proofs ? storedProof.proof.proofs.length : 0}</p>
                ${storedProof.proof.proofs && storedProof.proof.proofs.length > 0 ? 
                    `<p><strong>Providers:</strong> ${storedProof.proof.proofs.map(p => p.provider).filter(Boolean).join(', ')}</p>` : ''
                }
            </div>
            
            <div class="proof-data">
                <h3>🔍 Full Proof Data</h3>
                <pre>${JSON.stringify(storedProof.proof, null, 2)}</pre>
            </div>
            
            <div class="back-link">
                <a href="/proofs">← Back to All Proofs</a> | 
                <a href="/view-proof/${proofId}?format=json">View as JSON</a>
            </div>
        </div>
    </body>
    </html>
    `;
    
    res.send(html);
});

// --- Health check endpoint ---
app.get('/health', (req, res) => {
    console.log('Backend: Health check requested');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('ngrok-skip-browser-warning', 'true');
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        baseUrl: BASE_URL,
        config: {
            appId: APP_ID,
            providerId: PROVIDER_ID,
            port: port
        }
    });
});

// --- Debug endpoint to check current configuration ---
app.get('/debug/config', (req, res) => {
    console.log('Backend: Debug config requested');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('ngrok-skip-browser-warning', 'true');
    res.json({
        baseUrl: BASE_URL,
        appId: APP_ID,
        providerId: PROVIDER_ID,
        port: port,
        endpoints: [
            `${BASE_URL}/generate-config`,
            `${BASE_URL}/receive-proofs`,
            `${BASE_URL}/health`,
            `${BASE_URL}/reclaim-proxy/api/*`,
            `wss://${BASE_URL.replace('https://', '')}/reclaim-proxy/ws`
        ],
        timestamp: new Date().toISOString()
    });
});

// --- Catch-all error handler ---
app.use((err, req, res, next) => {
    console.error('Backend: Unhandled error:', err);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('ngrok-skip-browser-warning', 'true');
    res.status(500).json({
        error: 'Internal server error',
        message: err.message,
        timestamp: new Date().toISOString()
    });
});

// --- 404 handler ---
app.use((req, res) => {
    console.log(`Backend: 404 - Route not found: ${req.method} ${req.url}`);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('ngrok-skip-browser-warning', 'true');
    res.status(404).json({
        error: 'Route not found',
        method: req.method,
        url: req.url,
        timestamp: new Date().toISOString()
    });
});

// Start the server
const server = http.createServer(app);

server.listen(port, () => {
    console.log('='.repeat(60));
    console.log('🚀 Reclaim Protocol Proxy Server Started!');
    console.log('='.repeat(60));
    console.log(`🌐 Server running at: http://localhost:${port}`);
    console.log(`🔗 Ngrok URL configured: ${BASE_URL}`);
    console.log('');
    console.log('📋 Available Endpoints:');
    console.log(`   ✅ Health Check:     GET  ${BASE_URL}/health`);
    console.log(`   ⚙️  Generate Config:  GET  ${BASE_URL}/generate-config`);
    console.log(`   📥 Receive Proofs:   POST ${BASE_URL}/receive-proofs`);
    console.log(`   📋 View All Proofs:  GET  ${BASE_URL}/proofs`);
    console.log(`   🔍 View Proof:       GET  ${BASE_URL}/view-proof/:proofId`);
    console.log(`   🔄 API Proxy:        * ${BASE_URL}/reclaim-proxy/api/*`);
    console.log(`   📊 Logging Proxy:    * ${BASE_URL}/reclaim-proxy/api/business-logs/*`);
    console.log(`   🔌 WebSocket Proxy:  WS   wss://${BASE_URL.replace('https://', '')}/reclaim-proxy/ws`);
    console.log(`   🐛 Debug Config:     GET  ${BASE_URL}/debug/config`);
    console.log('');
    console.log('📊 Configuration:');
    console.log(`   App ID: ${APP_ID}`);
    console.log(`   Provider ID: ${PROVIDER_ID}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('   CORS: Enabled for browser extensions and all origins');
    console.log('');
    console.log('⚠️  Remember to:');
    console.log('   1. Update BASE_URL with your current Ngrok URL');
    console.log('   2. Update browser extension redirect rules');
    console.log('   3. Restart Ngrok if the URL changes');
    console.log('   4. Ensure .env file has correct APP_ID, APP_SECRET, and PROVIDER_ID');
    console.log('='.repeat(60));
});

// Handle WebSocket upgrades
server.on('upgrade', (request, socket, head) => {
    console.log('Backend: WebSocket upgrade request received for:', request.url);
    if (request.url.startsWith('/reclaim-proxy/ws')) {
        wsProxy.upgrade(request, socket, head);
    } else {
        console.log('Backend: WebSocket upgrade request rejected - invalid path');
        socket.destroy();
    }
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Received SIGINT. Shutting down gracefully...');
    server.close(() => {
        console.log('✅ Server closed successfully');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM. Shutting down gracefully...');
    server.close(() => {
        console.log('✅ Server closed successfully');
        process.exit(0);
    });
});