// Test Script for Sensitive Field Detector Extension
// Run this in the browser console to test various scenarios

console.log('🧪 Sensitive Field Detector Test Script Loaded');

// Test 1: Check if extension is loaded
function testExtensionPresence() {
    console.log('🔍 Test 1: Checking extension presence...');
    
    if (typeof chrome !== 'undefined' && chrome.runtime) {
        console.log('✅ Chrome extension API detected');
        
        // Try to communicate with extension
        chrome.runtime.sendMessage({ action: 'getState' }, (response) => {
            if (chrome.runtime.lastError) {
                console.log('⚠️ Extension not responding:', chrome.runtime.lastError.message);
            } else {
                console.log('✅ Extension responding:', response);
            }
        });
    } else {
        console.log('❌ Chrome extension API not detected');
    }
}

// Test 2: Check for sensitive fields in DOM
function testSensitiveFieldDetection() {
    console.log('🔍 Test 2: Checking for sensitive fields in DOM...');
    
    const sensitiveSelectors = [
        'input[type="password"]',
        'input[type="email"]',
        'input[name*="password"]',
        'input[name*="email"]',
        'input[name*="ssn"]',
        'input[name*="credit"]',
        'input[name*="card"]',
        'input[name*="cvv"]',
        'input[name*="token"]',
        'input[name*="secret"]',
        'input[name*="auth"]',
        'input[name*="pin"]',
        'input[name*="otp"]',
        'input[name*="api"]',
        'input[name*="key"]'
    ];
    
    let foundFields = [];
    
    sensitiveSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
            foundFields.push({
                selector: selector,
                count: elements.length,
                elements: Array.from(elements).map(el => ({
                    id: el.id,
                    name: el.name,
                    type: el.type,
                    placeholder: el.placeholder
                }))
            });
        }
    });
    
    console.log('📊 Found sensitive fields:', foundFields);
    return foundFields;
}

// Test 3: Simulate user interactions
function testUserInteractions() {
    console.log('🔍 Test 3: Simulating user interactions...');
    
    const testFields = [
        { selector: '#username', value: 'testuser' },
        { selector: '#email', value: 'test@example.com' },
        { selector: '#password', value: 'testpassword123' },
        { selector: '#phone', value: '555-123-4567' },
        { selector: '#ssn', value: '123-45-6789' },
        { selector: '#credit-card', value: '4111-1111-1111-1111' },
        { selector: '#cvv', value: '123' }
    ];
    
    testFields.forEach(field => {
        const element = document.querySelector(field.selector);
        if (element) {
            console.log(`🖱️ Interacting with ${field.selector}...`);
            
            // Focus the field
            element.focus();
            
            // Simulate typing
            element.value = field.value;
            
            // Trigger input event
            element.dispatchEvent(new Event('input', { bubbles: true }));
            
            // Trigger change event
            element.dispatchEvent(new Event('change', { bubbles: true }));
            
            // Blur the field
            element.blur();
            
            console.log(`✅ Completed interaction with ${field.selector}`);
        } else {
            console.log(`⚠️ Field not found: ${field.selector}`);
        }
    });
}

// Test 4: Check for extension detection markers
function testDetectionMarkers() {
    console.log('🔍 Test 4: Checking for extension detection markers...');
    
    const markers = [
        '[data-sensitive-field="true"]',
        '[data-ai-detection="true"]',
        '[data-field-type]',
        '[data-confidence]',
        '[data-risk-level]'
    ];
    
    let foundMarkers = [];
    
    markers.forEach(marker => {
        const elements = document.querySelectorAll(marker);
        if (elements.length > 0) {
            foundMarkers.push({
                marker: marker,
                count: elements.length,
                elements: Array.from(elements).map(el => ({
                    id: el.id,
                    name: el.name,
                    type: el.type,
                    attributes: {
                        'data-sensitive-field': el.getAttribute('data-sensitive-field'),
                        'data-ai-detection': el.getAttribute('data-ai-detection'),
                        'data-field-type': el.getAttribute('data-field-type'),
                        'data-confidence': el.getAttribute('data-confidence'),
                        'data-risk-level': el.getAttribute('data-risk-level')
                    }
                }))
            });
        }
    });
    
    console.log('📊 Found detection markers:', foundMarkers);
    return foundMarkers;
}

// Test 5: Monitor for extension logs
function monitorExtensionLogs() {
    console.log('🔍 Test 5: Monitoring for extension logs...');
    
    // Override console.log to capture extension logs
    const originalLog = console.log;
    const extensionLogs = [];
    
    console.log = function(...args) {
        const message = args.join(' ');
        
        // Check if this looks like an extension log
        if (message.includes('🔍') || 
            message.includes('🎯') || 
            message.includes('🧠') || 
            message.includes('🎭') || 
            message.includes('✅') ||
            message.includes('Sensitive Field') ||
            message.includes('AI detected') ||
            message.includes('masking')) {
            
            extensionLogs.push({
                timestamp: new Date().toISOString(),
                message: message
            });
            
            console.log('📝 Extension Log Captured:', message);
        }
        
        originalLog.apply(console, args);
    };
    
    console.log('🎯 Extension log monitoring started');
    
    // Return function to stop monitoring
    return function() {
        console.log = originalLog;
        console.log('📝 Extension log monitoring stopped');
        console.log('📊 Total extension logs captured:', extensionLogs.length);
        return extensionLogs;
    };
}

// Test 6: Test dynamic field addition
function testDynamicFields() {
    console.log('🔍 Test 6: Testing dynamic field addition...');
    
    const dynamicContainer = document.getElementById('dynamic-fields-container');
    if (dynamicContainer) {
        console.log('✅ Dynamic container found, adding test fields...');
        
        // Add some dynamic fields
        const timestamp = Date.now();
        const dynamicFields = `
            <div class="form-group" style="margin-top: 15px;">
                <label for="test-dynamic-email-${timestamp}">Test Dynamic Email</label>
                <input type="email" id="test-dynamic-email-${timestamp}" name="test-dynamic-email" placeholder="Test dynamic email">
            </div>
            <div class="form-group">
                <label for="test-dynamic-password-${timestamp}">Test Dynamic Password</label>
                <input type="password" id="test-dynamic-password-${timestamp}" name="test-dynamic-password" placeholder="Test dynamic password">
            </div>
            <div class="form-group">
                <label for="test-dynamic-ssn-${timestamp}">Test Dynamic SSN</label>
                <input type="text" id="test-dynamic-ssn-${timestamp}" name="test-dynamic-ssn" placeholder="Test dynamic SSN">
            </div>
        `;
        
        dynamicContainer.innerHTML += dynamicFields;
        console.log('✅ Dynamic fields added successfully');
        
        // Wait a bit and check if they were detected
        setTimeout(() => {
            const newFields = document.querySelectorAll(`[id^="test-dynamic-"]`);
            console.log('📊 New dynamic fields found:', newFields.length);
            
            newFields.forEach(field => {
                if (field.hasAttribute('data-sensitive-field')) {
                    console.log(`✅ Dynamic field detected: ${field.id}`);
                } else {
                    console.log(`⚠️ Dynamic field not detected: ${field.id}`);
                }
            });
        }, 2000);
        
    } else {
        console.log('❌ Dynamic container not found');
    }
}

// Test 7: Test sensitive text content detection
function testSensitiveTextContent() {
    console.log('🔍 Test 7: Testing sensitive text content detection...');
    
    const sensitiveTextElements = document.querySelectorAll('.sensitive-text');
    console.log(`📊 Found ${sensitiveTextElements.length} sensitive text elements`);
    
    if (sensitiveTextElements.length === 0) {
        console.log('❌ No sensitive text elements found');
        return;
    }
    
    const textTypes = {};
    sensitiveTextElements.forEach(element => {
        const type = element.getAttribute('data-type');
        if (!textTypes[type]) {
            textTypes[type] = [];
        }
        textTypes[type].push({
            text: element.textContent,
            element: element
        });
    });
    
    console.log('📋 Sensitive text types found:', Object.keys(textTypes));
    console.log('📊 Text content breakdown:', textTypes);
    
    // Check if any have been marked by extension
    const markedElements = document.querySelectorAll('.sensitive-text[data-sensitive-field="true"]');
    console.log(`🎯 Elements marked by extension: ${markedElements.length}`);
    
    // Test interaction with sensitive text
    console.log('🖱️ Testing interaction with sensitive text elements...');
    sensitiveTextElements.forEach((element, index) => {
        if (index < 3) { // Test first 3 elements
            element.click();
            console.log(`✅ Clicked sensitive text: ${element.textContent.substring(0, 20)}...`);
        }
    });
    
    return {
        totalElements: sensitiveTextElements.length,
        textTypes: Object.keys(textTypes),
        markedElements: markedElements.length,
        breakdown: textTypes
    };
}

// Test 8: Comprehensive test suite
function runComprehensiveTest() {
    console.log('🚀 Starting comprehensive extension test suite...');
    console.log('=' .repeat(60));
    
    // Test 1: Extension presence
    testExtensionPresence();
    
    // Wait a bit
    setTimeout(() => {
        // Test 2: Sensitive field detection
        testSensitiveFieldDetection();
        
        // Test 3: User interactions
        testUserInteractions();
        
        // Test 4: Detection markers
        testDetectionMarkers();
        
        // Test 5: Dynamic fields
        testDynamicFields();
        
        // Test 6: Sensitive text content
        testSensitiveTextContent();
        
        console.log('=' .repeat(60));
        console.log('✅ Comprehensive test suite completed');
        console.log('📝 Check the logs above for results');
        
    }, 1000);
}

// Test 9: Performance test
function testPerformance() {
    console.log('🔍 Test 9: Performance testing...');
    
    const startTime = performance.now();
    
    // Simulate rapid field interactions
    const fields = document.querySelectorAll('input, textarea, select');
    console.log(`📊 Testing performance with ${fields.length} fields`);
    
    fields.forEach((field, index) => {
        setTimeout(() => {
            field.focus();
            field.dispatchEvent(new Event('input', { bubbles: true }));
            field.blur();
        }, index * 50); // 50ms intervals
    });
    
    setTimeout(() => {
        const endTime = performance.now();
        console.log(`⏱️ Performance test completed in ${endTime - startTime}ms`);
    }, fields.length * 50 + 1000);
}

// Make all test functions globally available
window.testExtensionPresence = testExtensionPresence;
window.testSensitiveFieldDetection = testSensitiveFieldDetection;
window.testUserInteractions = testUserInteractions;
window.testDetectionMarkers = testDetectionMarkers;
window.monitorExtensionLogs = monitorExtensionLogs;
window.testDynamicFields = testDynamicFields;
window.testSensitiveTextContent = testSensitiveTextContent;
window.runComprehensiveTest = runComprehensiveTest;
window.testPerformance = testPerformance;

// Auto-run basic tests when script loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('🧪 Auto-running basic extension tests...');
    
    setTimeout(() => {
        testExtensionPresence();
        testSensitiveFieldDetection();
        testSensitiveTextContent();
    }, 2000);
});

console.log('🧪 Test functions available:');
console.log('- testExtensionPresence()');
console.log('- testSensitiveFieldDetection()');
console.log('- testUserInteractions()');
console.log('- testDetectionMarkers()');
console.log('- monitorExtensionLogs()');
console.log('- testDynamicFields()');
console.log('- testSensitiveTextContent()');
console.log('- runComprehensiveTest()');
console.log('- testPerformance()'); 